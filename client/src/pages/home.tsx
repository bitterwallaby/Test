import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { SearchForm } from "@/components/search-form";
import { DestinationDiscovery } from "@/components/destination-discovery";
import { FlightResults } from "@/components/flight-results";
import { SavedSearches } from "@/components/saved-searches";
import { Plane } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Destination, FlightOffer } from "@shared/schema";

export default function Home() {
  const [location, setLocation] = useLocation();
  const [step, setStep] = useState<"search" | "discover" | "results">("search");
  const [searchCriteria, setSearchCriteria] = useState<any>(null);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [flightOffers, setFlightOffers] = useState<FlightOffer[]>([]);

  // Sync URL with step
  useEffect(() => {
    if (step === "search") setLocation("/search");
    if (step === "discover") setLocation("/discover");
    if (step === "results") setLocation("/results");
  }, [step, setLocation]);

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
    setSearchCriteria(null);
    setSelectedDestinations([]);
    setFlightOffers([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={handleBackToSearch}
            className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-2 py-1 -ml-2"
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
