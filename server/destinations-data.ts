// Dataset statique de destinations avec scoring pour la découverte
// Basé sur des données OpenFlights et des critères d'originalité

export interface StaticDestination {
  iataCode: string;
  cityName: string;
  countryName: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  uniquenessScore: number; // 0-1, plus c'est élevé plus c'est unique/inattendu
  tags: string[]; // culture, nature, plage, food, etc.
}

export const DESTINATIONS: StaticDestination[] = [
  // Europe - Destinations moins connues
  { iataCode: "OPO", cityName: "Porto", countryName: "Portugal", countryCode: "PT", latitude: 41.2481, longitude: -8.6814, uniquenessScore: 0.7, tags: ["culture", "food", "wine"] },
  { iataCode: "VLC", cityName: "Valencia", countryName: "Spain", countryCode: "ES", latitude: 39.4699, longitude: -0.3763, uniquenessScore: 0.65, tags: ["culture", "plage", "food"] },
  { iataCode: "KRK", cityName: "Krakow", countryName: "Poland", countryCode: "PL", latitude: 50.0777, longitude: 19.7846, uniquenessScore: 0.75, tags: ["culture", "histoire"] },
  { iataCode: "TLL", cityName: "Tallinn", countryName: "Estonia", countryCode: "EE", latitude: 59.4133, longitude: 24.8328, uniquenessScore: 0.8, tags: ["culture", "tech", "medieval"] },
  { iataCode: "RIX", cityName: "Riga", countryName: "Latvia", countryCode: "LV", latitude: 56.9496, longitude: 24.1052, uniquenessScore: 0.78, tags: ["culture", "architecture"] },
  { iataCode: "BUD", cityName: "Budapest", countryName: "Hungary", countryCode: "HU", latitude: 47.4984, longitude: 19.0408, uniquenessScore: 0.6, tags: ["culture", "thermal", "nightlife"] },
  { iataCode: "PRG", cityName: "Prague", countryName: "Czech Republic", countryCode: "CZ", latitude: 50.1008, longitude: 14.2632, uniquenessScore: 0.55, tags: ["culture", "beer", "architecture"] },
  { iataCode: "LJU", cityName: "Ljubljana", countryName: "Slovenia", countryCode: "SI", latitude: 46.2237, longitude: 14.4575, uniquenessScore: 0.85, tags: ["nature", "green", "culture"] },
  { iataCode: "SKP", cityName: "Skopje", countryName: "North Macedonia", countryCode: "MK", latitude: 41.9622, longitude: 21.4529, uniquenessScore: 0.9, tags: ["culture", "mountains"] },
  { iataCode: "SOF", cityName: "Sofia", countryName: "Bulgaria", countryCode: "BG", latitude: 42.6977, longitude: 23.3219, uniquenessScore: 0.82, tags: ["culture", "mountains", "history"] },

  // Méditerranée
  { iataCode: "SPU", cityName: "Split", countryName: "Croatia", countryCode: "HR", latitude: 43.5389, longitude: 16.2981, uniquenessScore: 0.7, tags: ["plage", "histoire", "nature"] },
  { iataCode: "DBV", cityName: "Dubrovnik", countryName: "Croatia", countryCode: "HR", latitude: 42.5606, longitude: 18.2676, uniquenessScore: 0.68, tags: ["plage", "medieval", "culture"] },
  { iataCode: "CAG", cityName: "Cagliari", countryName: "Italy", countryCode: "IT", latitude: 39.2515, longitude: 9.0543, uniquenessScore: 0.75, tags: ["plage", "nature", "sardaigne"] },
  { iataCode: "PMO", cityName: "Palermo", countryName: "Italy", countryCode: "IT", latitude: 38.1758, longitude: 13.0916, uniquenessScore: 0.72, tags: ["culture", "food", "histoire"] },
  { iataCode: "CHQ", cityName: "Chania", countryName: "Greece", countryCode: "GR", latitude: 35.5317, longitude: 24.0176, uniquenessScore: 0.77, tags: ["plage", "crete", "nature"] },

  // Afrique du Nord
  { iataCode: "RAK", cityName: "Marrakech", countryName: "Morocco", countryCode: "MA", latitude: 31.6067, longitude: -8.0363, uniquenessScore: 0.65, tags: ["culture", "desert", "food"] },
  { iataCode: "TUN", cityName: "Tunis", countryName: "Tunisia", countryCode: "TN", latitude: 36.8512, longitude: 10.2272, uniquenessScore: 0.8, tags: ["culture", "plage", "histoire"] },
  { iataCode: "ESU", cityName: "Essaouira", countryName: "Morocco", countryCode: "MA", latitude: 31.5080, longitude: -9.7707, uniquenessScore: 0.88, tags: ["plage", "wind", "culture"] },

  // Moyen-Orient
  { iataCode: "AMM", cityName: "Amman", countryName: "Jordan", countryCode: "JO", latitude: 31.7228, longitude: 35.9934, uniquenessScore: 0.82, tags: ["culture", "desert", "petra"] },
  { iataCode: "TBS", cityName: "Tbilisi", countryName: "Georgia", countryCode: "GE", latitude: 41.6933, longitude: 44.8015, uniquenessScore: 0.9, tags: ["wine", "culture", "mountains"] },
  { iataCode: "EVN", cityName: "Yerevan", countryName: "Armenia", countryCode: "AM", latitude: 40.1596, longitude: 44.5090, uniquenessScore: 0.92, tags: ["culture", "histoire", "wine"] },

  // Asie
  { iataCode: "CMB", cityName: "Colombo", countryName: "Sri Lanka", countryCode: "LK", latitude: 7.1807, longitude: 79.8842, uniquenessScore: 0.85, tags: ["plage", "tea", "nature"] },
  { iataCode: "HAN", cityName: "Hanoi", countryName: "Vietnam", countryCode: "VN", latitude: 21.0285, longitude: 105.8542, uniquenessScore: 0.75, tags: ["culture", "food", "histoire"] },
  { iataCode: "KTM", cityName: "Kathmandu", countryName: "Nepal", countryCode: "NP", latitude: 27.7172, longitude: 85.3240, uniquenessScore: 0.88, tags: ["mountains", "trek", "culture"] },
  { iataCode: "ULN", cityName: "Ulaanbaatar", countryName: "Mongolia", countryCode: "MN", latitude: 47.8864, longitude: 106.9057, uniquenessScore: 0.95, tags: ["nature", "nomad", "adventure"] },

  // Amérique du Sud
  { iataCode: "CUZ", cityName: "Cusco", countryName: "Peru", countryCode: "PE", latitude: -13.5319, longitude: -71.9675, uniquenessScore: 0.8, tags: ["culture", "mountains", "inca"] },
  { iataCode: "BOG", cityName: "Bogota", countryName: "Colombia", countryCode: "CO", latitude: 4.7110, longitude: -74.0721, uniquenessScore: 0.82, tags: ["culture", "coffee", "nightlife"] },
  { iataCode: "LPB", cityName: "La Paz", countryName: "Bolivia", countryCode: "BO", latitude: -16.5000, longitude: -68.1500, uniquenessScore: 0.92, tags: ["mountains", "culture", "adventure"] },

  // Afrique
  { iataCode: "CPT", cityName: "Cape Town", countryName: "South Africa", countryCode: "ZA", latitude: -33.9648, longitude: 18.6017, uniquenessScore: 0.75, tags: ["nature", "wine", "plage"] },
  { iataCode: "ADD", cityName: "Addis Ababa", countryName: "Ethiopia", countryCode: "ET", latitude: 9.0054, longitude: 38.7636, uniquenessScore: 0.9, tags: ["culture", "coffee", "mountains"] },
  { iataCode: "NBO", cityName: "Nairobi", countryName: "Kenya", countryCode: "KE", latitude: -1.2921, longitude: 36.8219, uniquenessScore: 0.85, tags: ["safari", "nature", "adventure"] },

  // Océanie
  { iataCode: "AKL", cityName: "Auckland", countryName: "New Zealand", countryCode: "NZ", latitude: -37.0082, longitude: 174.7850, uniquenessScore: 0.8, tags: ["nature", "adventure", "wine"] },
  { iataCode: "WLG", cityName: "Wellington", countryName: "New Zealand", countryCode: "NZ", latitude: -41.3276, longitude: 174.8050, uniquenessScore: 0.82, tags: ["culture", "nature", "film"] },

  // Europe Classique
  { iataCode: "LIS", cityName: "Lisbon", countryName: "Portugal", countryCode: "PT", latitude: 38.7813, longitude: -9.1355, uniquenessScore: 0.5, tags: ["culture", "plage", "food"] },
  { iataCode: "BCN", cityName: "Barcelona", countryName: "Spain", countryCode: "ES", latitude: 41.2974, longitude: 2.0833, uniquenessScore: 0.4, tags: ["culture", "plage", "gaudi"] },
  { iataCode: "ROM", cityName: "Rome", countryName: "Italy", countryCode: "IT", latitude: 41.8002, longitude: 12.2389, uniquenessScore: 0.35, tags: ["culture", "histoire", "food"] },
  { iataCode: "ATH", cityName: "Athens", countryName: "Greece", countryCode: "GR", latitude: 37.9364, longitude: 23.9445, uniquenessScore: 0.45, tags: ["culture", "histoire", "plage"] },
];

// Alias pour compatibilité avec le reste du code
export const destinationsData = DESTINATIONS;

// Fonction pour calculer la distance entre deux coordonnées (formule de Haversine)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Fonction pour estimer la durée de vol en minutes basée sur la distance
export function estimateFlightDuration(distanceKm: number): number {
  const flightTimeHours = distanceKm / 800; // vitesse moyenne 800 km/h
  return Math.round(flightTimeHours * 60 + 30); // +30 min décollage/atterrissage
}
