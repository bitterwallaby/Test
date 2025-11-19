import type { Express } from "express";
import { storage } from "./storage";
import { amadeusClient } from "./amadeus-client";
import { format, addDays, addWeeks } from "date-fns";
import { destinationsData, calculateDistance, estimateFlightDuration } from "./destinations-data";

export function registerRoutes(app: Express) {
  // GET /api/destinations - Get scored destinations
app.get("/api/destinations", async (req, res) => {
  try {
    const { origin, budget, maxDistance } = req.query;

    if (!origin || !budget) {
      return res.status(400).json({ error: "origin and budget are required" });
    }

    const maxBudget = parseFloat(budget as string);
    const maxDist = maxDistance ? parseFloat(maxDistance as string) : undefined;

    // Coordonnées des aéroports
    const airportCoords: Record<string, { lat: number; lon: number }> = {
      CDG: { lat: 49.0097, lon: 2.5479 },
      ORY: { lat: 48.7233, lon: 2.3794 },
      NCE: { lat: 43.6584, lon: 7.2159 },
      LYS: { lat: 45.7256, lon: 5.0811 },
      MRS: { lat: 43.4393, lon: 5.2214 },
    };

    const originCoords = airportCoords[origin as string] || airportCoords.CDG;

    // Calculer distance et prix pour chaque destination
    let destinations = destinationsData.map(dest => {
      const distance = calculateDistance(
        originCoords.lat,
        originCoords.lon,
        dest.latitude,
        dest.longitude
      );
      
      const estimatedPrice = Math.round(50 + (distance / 1000) * 80);
      
      return { ...dest, distance, estimatedPrice };
    });

    // Filter by budget and distance
    destinations = destinations.filter(dest => {
      if (maxDist && dest.distance > maxDist) return false;
      return dest.estimatedPrice <= maxBudget;
    });

    // Score destinations
    destinations = destinations.map(dest => {
      let score = 0;

      // Originality score (0-40 points)
      score += (dest.uniquenessScore || 0.5) * 40;

      // Budget score (0-30 points)
      const budgetRatio = dest.estimatedPrice / maxBudget;
      score += (1 - budgetRatio) * 30;

      // Distance score (0-20 points) - moderate distance preferred
      const distanceScore = dest.distance < 3000 ? 20 : Math.max(0, 20 - ((dest.distance - 3000) / 1000) * 2);
      score += distanceScore;

      // Uniqueness bonus (0-10 points)
      score += dest.uniquenessScore * 10;

      return { ...dest, score: Math.round(score) };
    });

    // Sort by score descending
    destinations.sort((a, b) => b.score - a.score);

    // Return top 20
    res.json(destinations.slice(0, 20));
  } catch (error: any) {
    console.error("Error in /api/destinations:", error);
    res.status(500).json({ error: error.message });
  }
});

  // GET /api/flights - Search flights for selected destinations
  app.get("/api/flights", async (req, res) => {
    try {
      const { origin, destinations, pattern, budget } = req.query;

      if (!origin || !destinations || !pattern) {
        return res.status(400).json({ error: "origin, destinations, and pattern are required" });
      }

      const destArray = JSON.parse(destinations as string) as string[];
      const patternObj = JSON.parse(pattern as string);
      const maxPrice = budget ? parseFloat(budget as string) : undefined;

      // Generate sample dates based on pattern
      const dates = generateSampleDates(patternObj, 3);

      console.log(`🔍 Searching flights for ${destArray.length} destinations across ${dates.length} dates`);

      // Search flights for all destinations
      const results = await amadeusClient.searchMultipleDestinations(
        origin as string,
        destArray,
        dates,
        maxPrice
      );

      // Transform to response format
      const flightOffers = [];
      for (const [destination, flights] of results.entries()) {
        if (flights.length > 0) {
          flightOffers.push({
            destination,
            cheapestPrice: parseFloat(flights[0].price.total),
            currency: flights[0].price.currency,
            availableFlights: flights.length,
            flights: flights.slice(0, 5), // Return top 5 per destination
          });
        }
      }

      res.json(flightOffers);
    } catch (error: any) {
      console.error("Error in /api/flights:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/searches - Save a search
  app.post("/api/searches", async (req, res) => {
    try {
      const search = await storage.createSearch(req.body);
      res.json(search);
    } catch (error: any) {
      console.error("Error creating search:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/searches - Get all searches
  app.get("/api/searches", async (req, res) => {
    try {
      const searches = await storage.getSearches();
      res.json(searches);
    } catch (error: any) {
      console.error("Error getting searches:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/searches/:id - Get a specific search
  app.get("/api/searches/:id", async (req, res) => {
    try {
      const search = await storage.getSearchById(req.params.id);
      if (!search) {
        return res.status(404).json({ error: "Search not found" });
      }
      res.json(search);
    } catch (error: any) {
      console.error("Error getting search:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/searches/:id - Delete a search
  app.delete("/api/searches/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSearch(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Search not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting search:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/alerts - Create an alert
  app.post("/api/alerts", async (req, res) => {
    try {
      const alert = await storage.createAlert(req.body);
      res.json(alert);
    } catch (error: any) {
      console.error("Error creating alert:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/alerts - Get alerts
  app.get("/api/alerts", async (req, res) => {
    try {
      const { searchId } = req.query;
      const alerts = await storage.getAlerts(searchId as string | undefined);
      res.json(alerts);
    } catch (error: any) {
      console.error("Error getting alerts:", error);
      res.status(500).json({ error: error.message });
    }
  });
}

// Helper function to generate sample dates
function generateSampleDates(pattern: any, numSamples: number): string[] {
  const dates: string[] = [];
  const today = new Date();

  switch (pattern.type) {
    case "weekend":
      // Generate weekend dates for next 3 months
      for (let i = 0; i < 12 && dates.length < numSamples; i++) {
        const friday = addWeeks(today, i);
        // Find next Friday
        const daysUntilFriday = (5 - friday.getDay() + 7) % 7;
        const nextFriday = addDays(friday, daysUntilFriday);
        dates.push(format(nextFriday, "yyyy-MM-dd"));
      }
      break;

    case "week":
      // Generate dates 1 week apart
      for (let i = 0; i < numSamples; i++) {
        const date = addWeeks(today, i + 1);
        dates.push(format(date, "yyyy-MM-dd"));
      }
      break;

    case "custom":
      // Generate dates based on duration
      const duration = pattern.duration || 7;
      for (let i = 0; i < numSamples; i++) {
        const date = addDays(today, (i + 1) * duration);
        dates.push(format(date, "yyyy-MM-dd"));
      }
      break;

    default:
      dates.push(format(addWeeks(today, 1), "yyyy-MM-dd"));
  }

  return dates;
}