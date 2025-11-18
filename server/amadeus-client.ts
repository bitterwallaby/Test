import Amadeus from "amadeus";

// Créer le client Amadeus avec les credentials
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY!,
  clientSecret: process.env.AMADEUS_API_SECRET!,
});

export interface AmadeusFlightOffer {
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
    }>;
  }>;
  numberOfBookableSeats?: number;
}

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
  maxPrice?: number;
}

// Cache simple pour limiter les appels API
const flightCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 3600000; // 1 heure

export async function searchFlights(params: FlightSearchParams) {
  const cacheKey = JSON.stringify(params);
  const cached = flightCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log("Cache hit for flight search");
    return cached.data;
  }

  try {
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: params.origin,
      destinationLocationCode: params.destination,
      departureDate: params.departureDate,
      returnDate: params.returnDate,
      adults: params.adults?.toString() || "1",
      maxPrice: params.maxPrice?.toString(),
      currencyCode: "EUR",
      max: "10",
    });

    flightCache.set(cacheKey, { data: response.data, timestamp: Date.now() });
    return response.data;
  } catch (error: any) {
    console.error("Amadeus API error:", error.response?.data || error.message);
    throw new Error(
      `Erreur API Amadeus: ${error.response?.data?.errors?.[0]?.detail || error.message}`
    );
  }
}

// Recherche des destinations les moins chères depuis une origine
export async function searchCheapestDestinations(origin: string, maxPrice?: number) {
  try {
    const response = await amadeus.shopping.flightDestinations.get({
      origin,
      maxPrice: maxPrice?.toString(),
    });

    return response.data;
  } catch (error: any) {
    console.error("Amadeus destinations error:", error.response?.data || error.message);
    // Retourner un tableau vide plutôt que de throw pour ne pas bloquer l'application
    return [];
  }
}

// Obtenir les dates les moins chères pour une destination
export async function searchCheapestDates(
  origin: string,
  destination: string,
  departureDate?: string
) {
  try {
    const response = await amadeus.shopping.flightDates.get({
      origin,
      destination,
      departureDate,
    });

    return response.data;
  } catch (error: any) {
    console.error("Amadeus dates error:", error.response?.data || error.message);
    return [];
  }
}

export { amadeus };
