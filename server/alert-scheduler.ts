import cron from "node-cron";
import { storage } from "./storage";
import { kiwiClient } from "./kiwi-client";
import { generateSampleDates } from "./date-patterns";
import { sendFlightAlert } from "./email-service";
import type { DatePattern } from "@shared/schema";

// Vérifier les alertes toutes les 6 heures
// Pattern cron: "0 */6 * * *" = A la minute 0 de chaque 6e heure
export function startAlertScheduler() {
  console.log("Starting alert scheduler...");

  // Tâche principale: vérifier les recherches actives
  cron.schedule("0 */6 * * *", async () => {
    console.log("[Alert Scheduler] Checking active searches...");
    await checkActiveSearches();
  });

  // Pour le développement, vérifier toutes les 30 minutes
  if (process.env.NODE_ENV === "development") {
    cron.schedule("*/30 * * * *", async () => {
      console.log("[Alert Scheduler - DEV] Checking active searches...");
      await checkActiveSearches();
    });
  }

  console.log("Alert scheduler started successfully");
}

async function checkActiveSearches() {
  try {
    const activeSearches = await storage.getActiveSearches();
    console.log(`[Alert Scheduler] Found ${activeSearches.length} active searches`);

    for (const search of activeSearches) {
      try {
        await checkSearchForAlerts(search);
      } catch (error: any) {
        console.error(`[Alert Scheduler] Error checking search ${search.id}:`, error.message);
      }
    }
  } catch (error: any) {
    console.error("[Alert Scheduler] Error in checkActiveSearches:", error.message);
  }
}

async function checkSearchForAlerts(search: any) {
  console.log(`[Alert Scheduler] Checking search: ${search.name} (${search.id})`);

  if (!search.selectedDestinations || search.selectedDestinations.length === 0) {
    console.log(`[Alert Scheduler] No destinations for search ${search.id}`);
    return;
  }

  const pattern = search.pattern as DatePattern;
  const dateRanges = generateSampleDates(pattern, 2); // Seulement 2 dates pour limiter les appels

  for (const destination of search.selectedDestinations) {
    try {
      // Obtenir l'historique de prix pour cette destination
      const priceHistory = await storage.getPriceHistory(search.id, destination);
      const lastPrice = priceHistory.length > 0 ? priceHistory[0].price : null;

      // Rechercher les vols actuels
      for (const dateRange of dateRanges) {
        try {
          const kiwiResponse = await kiwiClient.searchFlightToDestination(
            search.originAirport,
            destination,
            dateRange.outbound,
            dateRange.return,
            search.budget
          );

          if (kiwiResponse.data && kiwiResponse.data.length > 0) {
            const bestFlight = kiwiResponse.data[0]; // Le moins cher
            const currentPrice = bestFlight.price;

            // Enregistrer le prix dans l'historique
            await storage.addPriceHistory({
              searchId: search.id,
              destination,
              price: currentPrice,
              currency: "EUR",
              date: dateRange.outbound,
            });

            // Vérifier si on doit envoyer une alerte
            let shouldAlert = false;
            let priceChange: number | undefined;

            if (lastPrice === null) {
              // Premier prix enregistré
              shouldAlert = true;
              console.log(`[Alert Scheduler] First price for ${destination}: ${currentPrice}€`);
            } else {
              // Calculer le changement de prix
              priceChange = Math.round(((currentPrice - lastPrice) / lastPrice) * 100);

              // Alerte si baisse de plus de 10%
              if (priceChange <= -10) {
                shouldAlert = true;
                console.log(
                  `[Alert Scheduler] Price drop for ${destination}: ${lastPrice}€ -> ${currentPrice}€ (${priceChange}%)`
                );
              }

              // Alerte si prix sous le budget et pas encore alerté récemment
              if (currentPrice <= search.budget * 0.8) {
                const recentAlerts = await storage.getAlerts(search.id);
                const hasRecentAlert = recentAlerts.some(
                  (alert) =>
                    alert.destination === destination &&
                    alert.sent &&
                    alert.createdAt &&
                    Date.now() - new Date(alert.createdAt).getTime() < 24 * 60 * 60 * 1000 // 24h
                );

                if (!hasRecentAlert) {
                  shouldAlert = true;
                  console.log(
                    `[Alert Scheduler] Good deal for ${destination}: ${currentPrice}€ (budget: ${search.budget}€)`
                  );
                }
              }
            }

            if (shouldAlert) {
              // Créer l'alerte dans la base
              const flightOffer = kiwiClient.transformToFlightOffer(bestFlight);

              const alert = await storage.createAlert({
                searchId: search.id,
                destination,
                currentPrice,
                targetPrice: Math.floor(search.budget * 0.9),
                priceChange,
                flightDetails: flightOffer,
              });

              // Envoyer l'email
              try {
                await sendFlightAlert(search.email, search.name, flightOffer, priceChange);
                await storage.markAlertSent(alert.id);
                console.log(`[Alert Scheduler] Alert sent for ${destination} to ${search.email}`);
              } catch (emailError: any) {
                console.error(
                  `[Alert Scheduler] Error sending alert email:`,
                  emailError.message
                );
              }
            }
          }
        } catch (error: any) {
          console.error(
            `[Alert Scheduler] Error checking flight ${destination} on ${dateRange.outbound}:`,
            error.message
          );
        }
      }
    } catch (error: any) {
      console.error(
        `[Alert Scheduler] Error processing destination ${destination}:`,
        error.message
      );
    }
  }
}

// Nettoyer les anciennes alertes (> 30 jours)
export function startCleanupScheduler() {
  // Tous les jours à 3h du matin
  cron.schedule("0 3 * * *", async () => {
    console.log("[Cleanup Scheduler] Cleaning old data...");
    // TODO: Implémenter le nettoyage si nécessaire
    // Pour l'instant, on garde tout pour l'historique
  });
}
