// Client pour l'API Kiwi.com Tequila
// Documentation: https://tequila.kiwi.com/portal/docs/tequila_api/search_api

export interface KiwiFlightSearchParams {
  fly_from: string; // Code IATA origine
  fly_to?: string; // Code IATA destination (ou 'anywhere')
  date_from: string; // Format: DD/MM/YYYY
  date_to: string; // Format: DD/MM/YYYY
  return_from?: string; // Date retour début
  return_to?: string; // Date retour fin
  nights_in_dst_from?: number; // Nuits min à destination
  nights_in_dst_to?: number; // Nuits max à destination
  max_fly_duration?: number; // Durée max vol en heures
  flight_type?: 'round' | 'oneway'; // Type de vol
  adults?: number; // Nombre d'adultes
  price_from?: number; // Prix min
  price_to?: number; // Prix max
  max_stopovers?: number; // Nombre max d'escales
  curr?: string; // Devise (EUR, USD, etc.)
  locale?: string; // Langue (fr, en, etc.)
  limit?: number; // Nombre max de résultats
  sort?: 'price' | 'duration' | 'quality'; // Tri
  partner_market?: string; // Marché pour affiliation
  partner?: string; // ID partenaire pour affiliation
}

export interface KiwiFlightOffer {
  id: string;
  flyFrom: string;
  flyTo: string;
  cityFrom: string;
  cityTo: string;
  countryFrom: {
    code: string;
    name: string;
  };
  countryTo: {
    code: string;
    name: string;
  };
  price: number;
  airlines: string[];
  route: Array<{
    flyFrom: string;
    flyTo: string;
    local_departure: string;
    local_arrival: string;
    airline: string;
    flight_no: string;
  }>;
  distance: number;
  duration: {
    departure: number;
    return: number;
    total: number;
  };
  quality: number;
  deep_link: string; // Lien d'affiliation
  booking_token: string;
}

export interface KiwiSearchResponse {
  data: KiwiFlightOffer[];
  _results: number;
  currency: string;
  fx_rate: number;
}

// Cache simple pour limiter les appels API
const flightCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 3600000; // 1 heure

export class KiwiClient {
  private apiKey: string;
  private baseUrl = 'https://api.tequila.kiwi.com';
  private partnerId?: string;

  constructor(apiKey: string, partnerId?: string) {
    this.apiKey = apiKey;
    this.partnerId = partnerId;
  }

  async searchFlights(params: KiwiFlightSearchParams): Promise<KiwiSearchResponse> {
    const cacheKey = JSON.stringify(params);
    const cached = flightCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Cache hit for Kiwi flight search');
      return cached.data;
    }

    try {
      // Construire les query params
      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });

      // Ajouter le partner ID si configuré
      if (this.partnerId) {
        queryParams.append('partner', this.partnerId);
      }

      const url = `${this.baseUrl}/v2/search?${queryParams.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': this.apiKey,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Kiwi API error (${response.status}): ${errorText}`);
      }

      const data: KiwiSearchResponse = await response.json();

      // Mettre en cache
      flightCache.set(cacheKey, { data, timestamp: Date.now() });

      return data;
    } catch (error: any) {
      console.error('Kiwi API error:', error.message);
      throw new Error(`Erreur API Kiwi: ${error.message}`);
    }
  }

  // Rechercher les destinations les moins chères depuis une origine
  async searchCheapestDestinations(
    origin: string,
    dateFrom: string,
    dateTo: string,
    maxPrice?: number
  ): Promise<KiwiSearchResponse> {
    return this.searchFlights({
      fly_from: origin,
      fly_to: 'anywhere',
      date_from: dateFrom,
      date_to: dateTo,
      price_to: maxPrice,
      flight_type: 'round',
      nights_in_dst_from: 2,
      nights_in_dst_to: 14,
      curr: 'EUR',
      locale: 'fr',
      limit: 50,
      sort: 'price',
    });
  }

  // Rechercher des vols spécifiques pour une destination
  async searchFlightToDestination(
    origin: string,
    destination: string,
    departureDate: string,
    returnDate: string,
    maxPrice?: number
  ): Promise<KiwiSearchResponse> {
    // Convertir les dates de YYYY-MM-DD à DD/MM/YYYY
    const formatDate = (dateStr: string) => {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    };

    return this.searchFlights({
      fly_from: origin,
      fly_to: destination,
      date_from: formatDate(departureDate),
      date_to: formatDate(departureDate),
      return_from: formatDate(returnDate),
      return_to: formatDate(returnDate),
      price_to: maxPrice,
      flight_type: 'round',
      adults: 1,
      curr: 'EUR',
      locale: 'fr',
      limit: 10,
      sort: 'price',
    });
  }

  // Obtenir le lien de réservation avec affiliation
  getBookingLink(bookingToken: string): string {
    const params = new URLSearchParams({
      token: bookingToken,
      currency: 'EUR',
      lang: 'fr',
    });

    if (this.partnerId) {
      params.append('partner', this.partnerId);
    }

    return `https://www.kiwi.com/deep?${params.toString()}`;
  }

  // Transformer la réponse Kiwi en notre format FlightOffer
  transformToFlightOffer(kiwiOffer: KiwiFlightOffer) {
    const outboundRoute = kiwiOffer.route[0];
    const lastOutbound = kiwiOffer.route[Math.floor(kiwiOffer.route.length / 2) - 1] || outboundRoute;
    const returnRoute = kiwiOffer.route[Math.floor(kiwiOffer.route.length / 2)];
    const lastReturn = kiwiOffer.route[kiwiOffer.route.length - 1];

    // Calculer le nombre d'escales
    const outboundStops = Math.floor(kiwiOffer.route.length / 2) - 1;

    return {
      id: kiwiOffer.id,
      price: kiwiOffer.price,
      currency: 'EUR',
      origin: kiwiOffer.flyFrom,
      destination: kiwiOffer.flyTo,
      outboundDate: outboundRoute.local_departure.split('T')[0],
      returnDate: returnRoute ? returnRoute.local_departure.split('T')[0] : undefined,
      duration: `${Math.floor(kiwiOffer.duration.total / 60)}h ${kiwiOffer.duration.total % 60}min`,
      stops: outboundStops,
      airlines: [...new Set(kiwiOffer.airlines)],
      bookingLink: this.getBookingLink(kiwiOffer.booking_token),
      deepLink: kiwiOffer.deep_link,
    };
  }
}

// Export d'une instance par défaut
export const kiwiClient = new KiwiClient(
  process.env.KIWI_API_KEY || '',
  process.env.KIWI_PARTNER_ID
);
