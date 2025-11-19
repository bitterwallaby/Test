// Dataset of 40+ unique and lesser-known destinations worldwide
// Distances and prices are estimated from Paris (CDG)

export interface Destination {
  code: string; // IATA airport code
  name: string;
  country: string;
  continent: string;
  distance: number; // km from Paris
  estimatedPrice: number; // EUR
  originalityScore: number; // 0-40 points
  popularity: number; // 1-10 (1=very unknown, 10=very popular)
  description: string;
}

export const destinationsData: Destination[] = [
  // Europe - Hidden Gems
  {
    code: "TIA",
    name: "Tirana",
    country: "Albania",
    continent: "Europe",
    distance: 1800,
    estimatedPrice: 150,
    originalityScore: 35,
    popularity: 3,
    description: "Colorful Balkan capital with Ottoman heritage"
  },
  {
    code: "SKP",
    name: "Skopje",
    country: "North Macedonia",
    continent: "Europe",
    distance: 1900,
    estimatedPrice: 180,
    originalityScore: 38,
    popularity: 2,
    description: "Ancient city with dramatic statues and bazaars"
  },
  {
    code: "SOF",
    name: "Sofia",
    country: "Bulgaria",
    continent: "Europe",
    distance: 1950,
    estimatedPrice: 120,
    originalityScore: 32,
    popularity: 4,
    description: "Historic capital at the foot of Vitosha Mountain"
  },
  {
    code: "KTW",
    name: "Katowice",
    country: "Poland",
    continent: "Europe",
    distance: 1500,
    estimatedPrice: 100,
    originalityScore: 30,
    popularity: 3,
    description: "Industrial heritage turned cultural hub"
  },
  {
    code: "TLL",
    name: "Tallinn",
    country: "Estonia",
    continent: "Europe",
    distance: 2100,
    estimatedPrice: 150,
    originalityScore: 28,
    popularity: 5,
    description: "Medieval old town meets digital innovation"
  },
  {
    code: "RIX",
    name: "Riga",
    country: "Latvia",
    continent: "Europe",
    distance: 2000,
    estimatedPrice: 140,
    originalityScore: 29,
    popularity: 4,
    description: "Art Nouveau architecture and vibrant culture"
  },
  {
    code: "CLJ",
    name: "Cluj-Napoca",
    country: "Romania",
    continent: "Europe",
    distance: 1950,
    estimatedPrice: 130,
    originalityScore: 36,
    popularity: 3,
    description: "Transylvanian tech hub with Gothic churches"
  },
  {
    code: "PDV",
    name: "Plovdiv",
    country: "Bulgaria",
    continent: "Europe",
    distance: 2050,
    estimatedPrice: 160,
    originalityScore: 37,
    popularity: 2,
    description: "Ancient Roman theater and artistic bohemian quarter"
  },

  // Middle East & Caucasus
  {
    code: "GYD",
    name: "Baku",
    country: "Azerbaijan",
    continent: "Asia",
    distance: 3800,
    estimatedPrice: 280,
    originalityScore: 39,
    popularity: 3,
    description: "Futuristic skyline meets ancient Silk Road"
  },
  {
    code: "TBS",
    name: "Tbilisi",
    country: "Georgia",
    continent: "Asia",
    distance: 3600,
    estimatedPrice: 250,
    originalityScore: 38,
    popularity: 4,
    description: "Wine culture and stunning mountainous architecture"
  },
  {
    code: "EVN",
    name: "Yerevan",
    country: "Armenia",
    continent: "Asia",
    distance: 3700,
    estimatedPrice: 270,
    originalityScore: 40,
    popularity: 2,
    description: "Pink tuff stone city with ancient monasteries"
  },
  {
    code: "AMM",
    name: "Amman",
    country: "Jordan",
    continent: "Asia",
    distance: 3500,
    estimatedPrice: 320,
    originalityScore: 32,
    popularity: 5,
    description: "Gateway to Petra and Roman ruins"
  },

  // Central Asia
  {
    code: "TAS",
    name: "Tashkent",
    country: "Uzbekistan",
    continent: "Asia",
    distance: 5200,
    estimatedPrice: 400,
    originalityScore: 40,
    popularity: 2,
    description: "Silk Road jewel with turquoise domes"
  },
  {
    code: "ALA",
    name: "Almaty",
    country: "Kazakhstan",
    continent: "Asia",
    distance: 5000,
    estimatedPrice: 420,
    originalityScore: 39,
    popularity: 3,
    description: "Mountain city with Soviet-era architecture"
  },
  {
    code: "FRU",
    name: "Bishkek",
    country: "Kyrgyzstan",
    continent: "Asia",
    distance: 5300,
    estimatedPrice: 450,
    originalityScore: 40,
    popularity: 1,
    description: "Gateway to pristine mountain lakes"
  },

  // Africa - Emerging Destinations
  {
    code: "ADD",
    name: "Addis Ababa",
    country: "Ethiopia",
    continent: "Africa",
    distance: 5800,
    estimatedPrice: 480,
    originalityScore: 38,
    popularity: 3,
    description: "Birthplace of coffee with ancient highlands"
  },
  {
    code: "DAR",
    name: "Dar es Salaam",
    country: "Tanzania",
    continent: "Africa",
    distance: 7100,
    estimatedPrice: 550,
    originalityScore: 35,
    popularity: 4,
    description: "Tropical coast and Zanzibar gateway"
  },
  {
    code: "KGL",
    name: "Kigali",
    country: "Rwanda",
    continent: "Africa",
    distance: 6400,
    estimatedPrice: 520,
    originalityScore: 37,
    popularity: 3,
    description: "Clean, green city and gorilla trekking base"
  },
  {
    code: "TUN",
    name: "Tunis",
    country: "Tunisia",
    continent: "Africa",
    distance: 1500,
    estimatedPrice: 180,
    originalityScore: 33,
    popularity: 4,
    description: "Ancient Carthage and Mediterranean medinas"
  },
  {
    code: "DLA",
    name: "Douala",
    country: "Cameroon",
    continent: "Africa",
    distance: 5200,
    estimatedPrice: 500,
    originalityScore: 39,
    popularity: 2,
    description: "Gateway to rainforests and volcanic peaks"
  },

  // South America - Off the Beaten Path
  {
    code: "BOG",
    name: "Bogotá",
    country: "Colombia",
    continent: "South America",
    distance: 9000,
    estimatedPrice: 600,
    originalityScore: 32,
    popularity: 5,
    description: "High-altitude capital with vibrant street art"
  },
  {
    code: "UIO",
    name: "Quito",
    country: "Ecuador",
    continent: "South America",
    distance: 9500,
    estimatedPrice: 650,
    originalityScore: 34,
    popularity: 4,
    description: "Colonial center at the equator's doorstep"
  },
  {
    code: "ASU",
    name: "Asunción",
    country: "Paraguay",
    continent: "South America",
    distance: 10800,
    estimatedPrice: 850,
    originalityScore: 40,
    popularity: 1,
    description: "Riverside capital with Guaraní heritage"
  },
  {
    code: "LPB",
    name: "La Paz",
    country: "Bolivia",
    continent: "South America",
    distance: 10500,
    estimatedPrice: 750,
    originalityScore: 38,
    popularity: 3,
    description: "World's highest capital with cable car network"
  },
  {
    code: "COR",
    name: "Córdoba",
    country: "Argentina",
    continent: "South America",
    distance: 11000,
    estimatedPrice: 800,
    originalityScore: 35,
    popularity: 3,
    description: "Jesuit architecture and mountain landscapes"
  },

  // Asia - Hidden Treasures
  {
    code: "KTM",
    name: "Kathmandu",
    country: "Nepal",
    continent: "Asia",
    distance: 6800,
    estimatedPrice: 520,
    originalityScore: 33,
    popularity: 5,
    description: "Himalayan gateway with ancient temples"
  },
  {
    code: "VTE",
    name: "Vientiane",
    country: "Laos",
    continent: "Asia",
    distance: 9500,
    estimatedPrice: 650,
    originalityScore: 37,
    popularity: 2,
    description: "Tranquil Buddhist capital on the Mekong"
  },
  {
    code: "PNH",
    name: "Phnom Penh",
    country: "Cambodia",
    continent: "Asia",
    distance: 10200,
    estimatedPrice: 680,
    originalityScore: 34,
    popularity: 4,
    description: "Royal Palace and riverside boulevards"
  },
  {
    code: "RGN",
    name: "Yangon",
    country: "Myanmar",
    continent: "Asia",
    distance: 9000,
    estimatedPrice: 600,
    originalityScore: 36,
    popularity: 3,
    description: "Golden pagodas and colonial architecture"
  },
  {
    code: "DAC",
    name: "Dhaka",
    country: "Bangladesh",
    continent: "Asia",
    distance: 7800,
    estimatedPrice: 550,
    originalityScore: 38,
    popularity: 2,
    description: "River city with vibrant markets and rickshaws"
  },
  {
    code: "CMB",
    name: "Colombo",
    country: "Sri Lanka",
    continent: "Asia",
    distance: 8500,
    estimatedPrice: 580,
    originalityScore: 32,
    popularity: 5,
    description: "Tropical gateway to tea plantations and beaches"
  },

  // Southeast Asia - Emerging Cities
  {
    code: "MDL",
    name: "Mandalay",
    country: "Myanmar",
    continent: "Asia",
    distance: 9200,
    estimatedPrice: 620,
    originalityScore: 37,
    popularity: 3,
    description: "Ancient royal capital with teak monasteries"
  },
  {
    code: "JOG",
    name: "Yogyakarta",
    country: "Indonesia",
    continent: "Asia",
    distance: 11500,
    estimatedPrice: 750,
    originalityScore: 35,
    popularity: 4,
    description: "Cultural heart with Borobudur temple nearby"
  },
  {
    code: "SUB",
    name: "Surabaya",
    country: "Indonesia",
    continent: "Asia",
    distance: 11800,
    estimatedPrice: 780,
    originalityScore: 36,
    popularity: 2,
    description: "Indonesia's second city with Dutch colonial heritage"
  },

  // Pacific
  {
    code: "NOU",
    name: "Nouméa",
    country: "New Caledonia",
    continent: "Oceania",
    distance: 16800,
    estimatedPrice: 1400,
    originalityScore: 40,
    popularity: 1,
    description: "French Pacific paradise with pristine lagoons"
  },
  {
    code: "PPT",
    name: "Papeete",
    country: "French Polynesia",
    continent: "Oceania",
    distance: 15700,
    estimatedPrice: 1200,
    originalityScore: 35,
    popularity: 5,
    description: "Gateway to Tahiti's turquoise waters"
  },
  {
    code: "NAN",
    name: "Nadi",
    country: "Fiji",
    continent: "Oceania",
    distance: 16500,
    estimatedPrice: 1300,
    originalityScore: 38,
    popularity: 3,
    description: "Tropical island hub with coral reefs"
  },

  // Eastern Europe - Underrated
  {
    code: "LWO",
    name: "Lviv",
    country: "Ukraine",
    continent: "Europe",
    distance: 2100,
    estimatedPrice: 140,
    originalityScore: 36,
    popularity: 3,
    description: "UNESCO heritage with coffee culture"
  },
  {
    code: "KIV",
    name: "Chișinău",
    country: "Moldova",
    continent: "Europe",
    distance: 2300,
    estimatedPrice: 180,
    originalityScore: 40,
    popularity: 1,
    description: "Wine cellars and Soviet architecture blend"
  },
  {
    code: "TSE",
    name: "Nur-Sultan",
    country: "Kazakhstan",
    continent: "Asia",
    distance: 4800,
    estimatedPrice: 400,
    originalityScore: 39,
    popularity: 2,
    description: "Futuristic capital rising from the steppe"
  },

  // Middle East - Emerging
  {
    code: "MCT",
    name: "Muscat",
    country: "Oman",
    continent: "Asia",
    distance: 5500,
    estimatedPrice: 420,
    originalityScore: 35,
    popularity: 4,
    description: "Stunning mosques and dramatic coastline"
  },
  {
    code: "DOH",
    name: "Doha",
    country: "Qatar",
    continent: "Asia",
    distance: 5000,
    estimatedPrice: 380,
    originalityScore: 30,
    popularity: 6,
    description: "Modern skyline with traditional souqs"
  }
];