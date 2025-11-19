import Amadeus from 'amadeus';

interface FlightSearchParams {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  adults: number;
  max?: number;
  currencyCode?: string;
  maxPrice?: number;
}

interface FlightOffer {
  id: string;
  price: {
    total: string;
    currency: string;
  };
  itineraries: Array<{
    duration: string;
    segments: Array<{
      departure: {
        iataCode: string;
        at: string;
      };
      arrival: {
        iataCode: string;
        at: string;
      };
      carrierCode: string;
      number: string;
      duration: string;
    }>;
  }>;
  validatingAirlineCodes: string[];
}

interface AmadeusSearchResponse {
  data: FlightOffer[];
  meta?: {
    count: number;
  };
}

class AmadeusClient {
  private client: any;
  private cache: Map<string, { data: FlightOffer[]; timestamp: number }>;
  private readonly CACHE_TTL = 60 * 60 * 1000; // 1 hour

  constructor() {
    const apiKey = process.env.AMADEUS_API_KEY;
    const apiSecret = process.env.AMADEUS_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.warn('⚠️  Amadeus API credentials not configured. Flight search will not work.');
      this.client = null;
    } else {
      this.client = new Amadeus({
        clientId: apiKey,
        clientSecret: apiSecret,
      });
      console.log('✅ Amadeus client initialized');
    }

    this.cache = new Map();
  }

  private getCacheKey(params: FlightSearchParams): string {
    return JSON.stringify(params);
  }

  private getFromCache(key: string): FlightOffer[] | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    console.log('📦 Cache hit for:', key.substring(0, 100));
    return cached.data;
  }

  private saveToCache(key: string, data: FlightOffer[]): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  async searchFlights(params: FlightSearchParams): Promise<FlightOffer[]> {
    if (!this.client) {
      console.error('❌ Amadeus client not initialized');
      return [];
    }

    const cacheKey = this.getCacheKey(params);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      console.log('🔍 Searching flights:', params);

      const response: AmadeusSearchResponse = await this.client.shopping.flightOffersSearch.get({
        originLocationCode: params.originLocationCode,
        destinationLocationCode: params.destinationLocationCode,
        departureDate: params.departureDate,
        adults: params.adults.toString(),
        max: (params.max || 10).toString(),
        currencyCode: params.currencyCode || 'EUR',
        ...(params.maxPrice && { maxPrice: params.maxPrice.toString() }),
      });

      const flights = response.data || [];
      this.saveToCache(cacheKey, flights);

      console.log(`✅ Found ${flights.length} flights`);
      return flights;
    } catch (error: any) {
      console.error('❌ Amadeus API error:', error.response?.body || error.message);
      return [];
    }
  }

  async searchMultipleDestinations(
    origin: string,
    destinations: string[],
    dates: string[],
    maxPrice?: number
  ): Promise<Map<string, FlightOffer[]>> {
    const results = new Map<string, FlightOffer[]>();

    for (const destination of destinations) {
      const destinationFlights: FlightOffer[] = [];

      for (const date of dates) {
        const flights = await this.searchFlights({
          originLocationCode: origin,
          destinationLocationCode: destination,
          departureDate: date,
          adults: 1,
          max: 5,
          maxPrice,
        });

        destinationFlights.push(...flights);
      }

      // Sort by price and keep best offers
      destinationFlights.sort((a, b) => 
        parseFloat(a.price.total) - parseFloat(b.price.total)
      );

      results.set(destination, destinationFlights.slice(0, 10));
    }

    return results;
  }

  clearCache(): void {
    this.cache.clear();
    console.log('🗑️  Cache cleared');
  }
}

// Singleton instance
export const amadeusClient = new AmadeusClient();