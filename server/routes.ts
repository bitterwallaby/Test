import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { DESTINATIONS, calculateDistance, estimateFlightDuration } from "./destinations-data";
import { kiwiClient } from "./kiwi-client";
import { generateSampleDates } from "./date-patterns";
import { sendFlightAlert, sendWelcomeEmail } from "./email-service";
import type { Destination, FlightOffer, DatePattern } from "@shared/schema";
import {
  insertSearchSchema,
  insertAlertSchema,
  datePatternSchema,
} from "@shared/schema";

// Coordonnées approximatives des principaux aéroports pour le calcul de distance
const AIRPORT_COORDS: Record<string, { lat: number; lon: number }> = {
  CDG: { lat: 49.0097, lon: 2.5479 },
  ORY: { lat: 48.7262, lon: 2.3656 },
  NCE: { lat: 43.6584, lon: 7.2159 },
  LYS: { lat: 45.7256, lon: 5.0811 },
  MRS: { lat: 43.4393, lon: 5.2214 },
  TLS: { lat: 43.6291, lon: 1.3638 },
  BOD: { lat: 44.8283, lon: -0.7156 },
  NTE: { lat: 47.1532, lon: -1.6108 },
};

export async function registerRoutes(app: Express): Promise<Server> {
  // GET /api/destinations - Découvrir des destinations basées sur les critères
  app.get("/api/destinations", async (req, res) => {
    try {
      const { origin, budget, maxDistance, pattern } = req.query;

      if (!origin || !budget) {
        return res.status(400).json({ error: "Origin et budget requis" });
      }

      const originCode = (origin as string).toUpperCase();
      const maxBudget = parseInt(budget as string);
      const maxDist = maxDistance ? parseInt(maxDistance as string) : undefined;

      // Obtenir les coordonnées de l'origine
      const originCoords = AIRPORT_COORDS[originCode];
      if (!originCoords) {
        return res.status(400).json({ error: "Aéroport d'origine non reconnu" });
      }

      // Filtrer et scorer les destinations
      let scoredDestinations: Destination[] = DESTINATIONS.map((dest) => {
        const distance = calculateDistance(
          originCoords.lat,
          originCoords.lon,
          dest.latitude,
          dest.longitude
        );

        const flightDuration = estimateFlightDuration(distance);

        // Score composite basé sur plusieurs facteurs
        let score = dest.uniquenessScore;

        // Bonus pour distance raisonnable (pas trop proche, pas trop loin)
        if (distance > 500 && distance < 3000) {
          score += 0.1;
        }

        // Pénalité si trop loin pour le budget
        const estimatedPrice = Math.min(distance * 0.15, maxBudget * 1.5);
        if (estimatedPrice > maxBudget) {
          score -= 0.3;
        }

        return {
          ...dest,
          distance,
          flightDuration,
          score,
        };
      });

      // Filtrer par distance maximale si spécifiée
      if (maxDist) {
        scoredDestinations = scoredDestinations.filter(
          (dest) => dest.distance! <= maxDist
        );
      }

      // Trier par score décroissant et prendre les 20 meilleures
      const topDestinations = scoredDestinations
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 20);

      res.json(topDestinations);
    } catch (error: any) {
      console.error("Error getting destinations:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/flights - Rechercher des vols pour les destinations sélectionnées
  app.get("/api/flights", async (req, res) => {
    try {
      const { origin, destinations, pattern, budget } = req.query;

      if (!origin || !destinations || !pattern) {
        return res.status(400).json({
          error: "Origin, destinations et pattern requis",
        });
      }

      const originCode = (origin as string).toUpperCase();
      const destCodes = JSON.parse(destinations as string) as string[];
      const datePattern = JSON.parse(pattern as string) as DatePattern;
      const maxBudget = budget ? parseInt(budget as string) : undefined;

      // Valider le pattern
      const validatedPattern = datePatternSchema.parse(datePattern);

      // Générer un échantillon de dates (3 dates pour limiter les appels API)
      const dateRanges = generateSampleDates(validatedPattern, 3);

      const allFlights: FlightOffer[] = [];

      // Pour chaque destination et chaque plage de dates
      for (const destCode of destCodes.slice(0, 5)) {
        // Max 5 destinations
        for (const dateRange of dateRanges) {
          try {
            const kiwiResponse = await kiwiClient.searchFlightToDestination(
              originCode,
              destCode,
              dateRange.outbound,
              dateRange.return,
              maxBudget
            );

            // Transformer les résultats Kiwi en notre format
            if (kiwiResponse && kiwiResponse.data && Array.isArray(kiwiResponse.data)) {
              for (const kiwiOffer of kiwiResponse.data.slice(0, 2)) {
                // Max 2 vols par destination/date
                const flightOffer = kiwiClient.transformToFlightOffer(kiwiOffer);
                allFlights.push(flightOffer);
              }
            }
          } catch (error: any) {
            console.error(
              `Error searching flights for ${destCode} on ${dateRange.outbound}:`,
              error.message
            );
            // Continue avec les autres recherches même si une échoue
          }
        }
      }

      // Trier par prix
      allFlights.sort((a, b) => a.price - b.price);

      res.json(allFlights);
    } catch (error: any) {
      console.error("Error searching flights:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/searches - Sauvegarder une recherche
  app.post("/api/searches", async (req, res) => {
    try {
      const validatedData = insertSearchSchema.parse(req.body);
      const search = await storage.createSearch(validatedData);

      // Envoyer un email de bienvenue
      try {
        await sendWelcomeEmail(search.email, search.name);
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError);
        // Ne pas bloquer la sauvegarde si l'email échoue
      }

      res.json(search);
    } catch (error: any) {
      console.error("Error creating search:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // GET /api/searches - Récupérer toutes les recherches
  app.get("/api/searches", async (req, res) => {
    try {
      const searches = await storage.getSearches();
      res.json(searches);
    } catch (error: any) {
      console.error("Error getting searches:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/searches/:id - Supprimer une recherche
  app.delete("/api/searches/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSearch(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting search:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/alerts - Créer une alerte de prix
  app.post("/api/alerts", async (req, res) => {
    try {
      const validatedData = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(validatedData);
      res.json(alert);
    } catch (error: any) {
      console.error("Error creating alert:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // GET /api/alerts - Récupérer les alertes
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

  const httpServer = createServer(app);

  return httpServer;
}
