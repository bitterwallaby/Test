import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, MapPin, Sparkles, Plane, Globe } from "lucide-react";
import type { Destination } from "@shared/schema";

interface DestinationDiscoveryProps {
  searchCriteria: any;
  onDestinationsSelected: (destinations: string[]) => void;
  onBack: () => void;
}

export function DestinationDiscovery({
  searchCriteria,
  onDestinationsSelected,
  onBack,
}: DestinationDiscoveryProps) {
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);

  const { data: destinations, isLoading } = useQuery<Destination[]>({
    queryKey: ["/api/destinations", searchCriteria],
    queryFn: async () => {
      const params = new URLSearchParams({
        origin: searchCriteria.origin,
        budget: searchCriteria.budget.toString(),
        pattern: JSON.stringify(searchCriteria.pattern || { type: searchCriteria.patternType, duration: searchCriteria.duration }),
      });
      
      if (searchCriteria.maxDistance) {
        params.append("maxDistance", searchCriteria.maxDistance.toString());
      }
      
      const response = await fetch(`/api/destinations?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des destinations");
      }
      return response.json();
    },
  });

  const toggleDestination = (iataCode: string) => {
    setSelectedDestinations((prev) =>
      prev.includes(iataCode)
        ? prev.filter((code) => code !== iataCode)
        : prev.length < 5
        ? [...prev, iataCode]
        : prev
    );
  };

  const handleContinue = () => {
    if (selectedDestinations.length > 0) {
      onDestinationsSelected(selectedDestinations);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Destinations inspirantes
          </h2>
          <p className="text-sm text-muted-foreground">
            Sélectionnez jusqu'à 5 destinations pour voir les vols disponibles
          </p>
        </div>
        <Button variant="ghost" onClick={onBack} data-testid="button-back">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </div>

      {/* Selection Counter */}
      <div className="flex items-center gap-2">
        <Badge variant={selectedDestinations.length > 0 ? "default" : "outline"} data-testid="text-selection-count">
          {selectedDestinations.length} / 5 sélectionnées
        </Badge>
      </div>

      {/* Destinations Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations?.map((destination) => {
          const isSelected = selectedDestinations.includes(destination.iataCode);
          const canSelect = selectedDestinations.length < 5 || isSelected;

          return (
            <Card
              key={destination.iataCode}
              className={`p-0 overflow-hidden transition-all ${
                isSelected
                  ? "ring-2 ring-primary shadow-lg"
                  : canSelect
                  ? "hover-elevate cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
              }`}
              onClick={() => canSelect && toggleDestination(destination.iataCode)}
              data-testid={`card-destination-${destination.iataCode}`}
            >
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-1">
                    <h3 className="text-xl font-semibold">{destination.cityName}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {destination.countryName}
                    </div>
                  </div>
                  <Checkbox
                    checked={isSelected}
                    disabled={!canSelect}
                    data-testid={`checkbox-destination-${destination.iataCode}`}
                  />
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Code IATA</span>
                    <Badge variant="outline">{destination.iataCode}</Badge>
                  </div>

                  {destination.distance && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Distance</span>
                      <span className="font-medium">
                        {Math.round(destination.distance)} km
                      </span>
                    </div>
                  )}

                  {destination.flightDuration && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Plane className="h-3 w-3" />
                        Durée estimée
                      </span>
                      <span className="font-medium">
                        {Math.round(destination.flightDuration / 60)}h
                        {destination.flightDuration % 60 > 0 && (
                          <>{destination.flightDuration % 60}min</>
                        )}
                      </span>
                    </div>
                  )}

                  {destination.uniquenessScore && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Originalité
                      </span>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-2 w-2 rounded-full ${
                              i < Math.round((destination.uniquenessScore || 0) * 5)
                                ? "bg-primary"
                                : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Continue Button */}
      {selectedDestinations.length > 0 && (
        <div className="flex justify-end pt-4">
          <Button size="lg" onClick={handleContinue} data-testid="button-continue">
            Voir les vols disponibles
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Empty State */}
      {destinations?.length === 0 && (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <Globe className="h-16 w-16 text-muted-foreground mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Aucune destination trouvée</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Essayez d'augmenter votre budget ou la distance maximale pour découvrir plus de
                destinations.
              </p>
            </div>
            <Button variant="outline" onClick={onBack}>
              Modifier les critères
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
