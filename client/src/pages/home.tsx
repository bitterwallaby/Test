import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { SearchForm } from "@/components/search-form";
import { DestinationDiscovery } from "@/components/destination-discovery";
import { FlightResults } from "@/components/flight-results";
import { SavedSearches } from "@/components/saved-searches";
import { Plane } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import type { FlightOffer } from "@shared/schema";

export default function Home() {
  const [location, setLocation] = useLocation();

  const [step, setStep] = useState<"search" | "discover" | "results">("search");
  const [searchCriteria, setSearchCriteria] = useState<any>({});
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [flightOffers, setFlightOffers] = useState<FlightOffer[]>([]);

  // 🔄 Synchroniser step & critères depuis l'URL au chargement
  useEffect(() => {
    const url = new URL(window.location.href);
    const path = url.pathname;

    if (path.startsWith("/discover")) {
      setStep("discover");
      setSearchCriteria({
        from: url.searchParams.get("origin") || "",
        budget: url.searchParams.get("budget") || "",
        maxDistance: url.searchParams.get("maxDistance") || "",
      });
    } else if (path.startsWith("/results")) {
      setStep("results");
      setSearchCriteria({
        from: url.searchParams.get("origin") || "",
        budget: url.searchParams.get("budget") || "",
        maxDistance: url.searchParams.get("maxDistance") || "",
      });
      const dests = url.searchParams.get("destinations");
      setSelectedDestinations(dests ? dests.split(",") : []);
    } else {
      setStep("search");
    }
  }, []);

  // 🔄 Mettre à jour l'URL quand step ou critères changent
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchCriteria.from) params.set("from", searchCriteria.from);
    if (searchCriteria.budget) params.set("budget", searchCriteria.budget);
    if (searchCriteria.maxDistance) params.set("maxDistance", searchCriteria.maxDistance);
    if (selectedDestinations.length) params.set("destinations", selectedDestinations.join(","));

    if (step === "discover") setLocation(`/discover?${params.toString()}`, { replace: true });
    if (step === "results") setLocation(`/results?${params.toString()}`, { replace: true });
    if (step === "search") setLocation(`/`, { replace: true });
  }, [step, searchCriteria, selectedDestinations, setLocation]);

  const handleSearchSubmit = (criteria: any) => {
    setSearchCriteria(criteria);
    setStep("discover");
  };

  const handleDestinationsSelected = (selected: string[]) => {
    setSelectedDestinations(selected);
    setStep("results");
  };

  const handleBackToSearch = () => {
    setStep("search");
    setSearchCriteria({});
    setSelectedDestinations([]);
    setFlightOffers([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={handleBackToSearch}
            className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-2 py-1"
          >
            <Plane className="h-6 w-6 text-primary" />
            <div className="flex flex-col items-start">
              <h1 className="text-xl font-semibold text-foreground">Discovery Flights</h1>
              <p className="text-xs text-muted-foreground">Explorez le monde</p>
            </div>
          </button>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {step === "search" && (
          <div className="space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <h2 className="text-3xl font-semibold">Où allez-vous voyager ?</h2>
              <p className="text-lg text-muted-foreground">
                Découvrez des destinations inattendues selon votre budget et vos disponibilités flexibles
              </p>
            </div>
            <div className="grid lg:grid-cols-[1fr,400px] gap-8">
              <SearchForm onSubmit={handleSearchSubmit} />
              <SavedSearches onLoadSearch={setSearchCriteria} />
            </div>
          </div>
        )}

        {step === "discover" && searchCriteria && (
          <DestinationDiscovery
            searchCriteria={searchCriteria}
            onDestinationsSelected={handleDestinationsSelected}
            onBack={handleBackToSearch}
          />
        )}

        {step === "results" && searchCriteria && selectedDestinations.length > 0 && (
          <FlightResults
            searchCriteria={searchCriteria}
            destinations={selectedDestinations}
            onBack={() => setStep("discover")}
          />
        )}
      </main>
    </div>
  );
}
