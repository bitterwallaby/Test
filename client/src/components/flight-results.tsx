import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  ArrowLeft,
  Plane,
  Calendar,
  Clock,
  Euro,
  Bell,
  Save,
  ExternalLink,
  TrendingDown,
} from "lucide-react";
import type { FlightOffer } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FlightResultsProps {
  searchCriteria: any;
  destinations: string[];
  onBack: () => void;
}

export function FlightResults({ searchCriteria, destinations, onBack }: FlightResultsProps) {
  const [searchName, setSearchName] = useState("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [savedSearchId, setSavedSearchId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: flights, isLoading } = useQuery<FlightOffer[]>({
    queryKey: ["/api/flights", { ...searchCriteria, destinations }],
    queryFn: async () => {
      const params = new URLSearchParams({
        origin: searchCriteria.origin,
        destinations: JSON.stringify(destinations),
        pattern: JSON.stringify(searchCriteria.pattern || { type: searchCriteria.patternType, duration: searchCriteria.duration }),
      });
      
      if (searchCriteria.budget) {
        params.append("budget", searchCriteria.budget.toString());
      }
      
      const response = await fetch(`/api/flights?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Erreur lors de la recherche de vols");
      }
      return response.json();
    },
  });

  const saveSearchMutation = useMutation({
    mutationFn: async () => {
      const pattern = searchCriteria.pattern || {
        type: searchCriteria.patternType,
        duration: searchCriteria.duration,
        preferredDays: searchCriteria.preferredDays,
      };

      return apiRequest("POST", "/api/searches", {
        name: searchName,
        originAirport: searchCriteria.origin,
        budget: searchCriteria.budget,
        pattern,
        selectedDestinations: destinations,
        maxDistance: searchCriteria.maxDistance,
        isActive: true,
        email: searchCriteria.email,
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/searches"] });
      setSavedSearchId(data.id);
      toast({
        title: "Recherche sauvegardée",
        description: "Vous recevrez des alertes pour les nouveaux deals",
      });
      setSaveDialogOpen(false);
      setSearchName("");
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la recherche",
        variant: "destructive",
      });
    },
  });

  const createAlertMutation = useMutation({
    mutationFn: async (flight: FlightOffer) => {
      // Si la recherche n'est pas encore sauvegardée, demander à l'utilisateur de le faire
      if (!savedSearchId) {
        throw new Error("Veuillez d'abord sauvegarder votre recherche avant de créer une alerte");
      }

      return apiRequest("POST", "/api/alerts", {
        searchId: savedSearchId,
        destination: flight.destination,
        currentPrice: flight.price,
        targetPrice: Math.floor(flight.price * 0.9),
        flightDetails: flight,
      });
    },
    onSuccess: () => {
      toast({
        title: "Alerte créée",
        description: "Vous serez notifié si le prix baisse",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  const sortedFlights = flights?.sort((a, b) => a.price - b.price) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Plane className="h-6 w-6 text-primary" />
            Vols disponibles
          </h2>
          <p className="text-sm text-muted-foreground">
            {sortedFlights.length} vol{sortedFlights.length > 1 ? "s" : ""} trouvé
            {sortedFlights.length > 1 ? "s" : ""} pour votre recherche
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onBack} data-testid="button-back-to-destinations">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-save-search">
                <Save className="mr-2 h-4 w-4" />
                Sauvegarder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Sauvegarder cette recherche</DialogTitle>
                <DialogDescription>
                  Donnez un nom à votre recherche pour recevoir des alertes automatiques
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Ex: Week-end à Lisbonne"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  data-testid="input-search-name"
                />
                <Button
                  className="w-full"
                  onClick={() => saveSearchMutation.mutate()}
                  disabled={!searchName || saveSearchMutation.isPending}
                  data-testid="button-confirm-save"
                >
                  {saveSearchMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {sortedFlights.map((flight, index) => (
          <Card
            key={flight.id}
            className="p-6 hover-elevate transition-all"
            data-testid={`card-flight-${index}`}
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* Flight Info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold">
                        {flight.origin} → {flight.destination}
                      </h3>
                      {index === 0 && (
                        <Badge variant="default" className="gap-1">
                          <TrendingDown className="h-3 w-3" />
                          Meilleur prix
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {flight.airlines.join(", ")}
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Départ : {flight.outboundDate}</div>
                        {flight.returnDate && (
                          <div className="text-muted-foreground">Retour : {flight.returnDate}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Durée : {flight.duration}</div>
                        <div className="text-muted-foreground">
                          {flight.stops === 0
                            ? "Vol direct"
                            : `${flight.stops} escale${flight.stops > 1 ? "s" : ""}`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price & Actions */}
              <div className="flex flex-col items-end justify-between gap-4 md:min-w-[200px]">
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary flex items-start gap-1">
                    {flight.price}
                    <Euro className="h-5 w-5 mt-1" />
                  </div>
                  <div className="text-xs text-muted-foreground">{flight.currency}</div>
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <Button
                    variant="default"
                    className="w-full"
                    asChild
                    data-testid={`button-book-${index}`}
                  >
                    <a
                      href={flight.bookingLink || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Réserver
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => createAlertMutation.mutate(flight)}
                    disabled={createAlertMutation.isPending}
                    data-testid={`button-alert-${index}`}
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Créer alerte
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {sortedFlights.length === 0 && (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <Plane className="h-16 w-16 text-muted-foreground mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Aucun vol trouvé</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Aucun vol disponible pour ces destinations et critères. Essayez de modifier vos
                dates ou d'augmenter votre budget.
              </p>
            </div>
            <Button variant="outline" onClick={onBack}>
              Modifier les destinations
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
