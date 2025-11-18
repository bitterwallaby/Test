import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { History, Trash2, Bell } from "lucide-react";
import type { Search } from "@shared/schema";

interface SavedSearchesProps {
  onLoadSearch?: (search: any) => void;
}

export function SavedSearches({ onLoadSearch }: SavedSearchesProps) {
  const { toast } = useToast();

  const { data: searches, isLoading } = useQuery<Search[]>({
    queryKey: ["/api/searches"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/searches/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/searches"] });
      toast({
        title: "Recherche supprimée",
        description: "La recherche a été supprimée avec succès",
      });
    },
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </Card>
    );
  }

  if (!searches || searches.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-3">
          <History className="h-12 w-12 text-muted-foreground mx-auto" />
          <div className="space-y-1">
            <h3 className="font-semibold">Aucune recherche sauvegardée</h3>
            <p className="text-sm text-muted-foreground">
              Sauvegardez vos recherches pour recevoir des alertes automatiques
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Recherches sauvegardées
        </h3>

        <div className="space-y-3">
          {searches.map((search) => (
            <Card
              key={search.id}
              className="p-4 hover-elevate cursor-pointer transition-all"
              onClick={() => onLoadSearch?.(search)}
              data-testid={`card-search-${search.id}`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-1">
                    <h4 className="font-medium">{search.name}</h4>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{search.originAirport}</span>
                      <span>•</span>
                      <span>{search.budget}€</span>
                      <span>•</span>
                      <span>
                        {typeof search.pattern === "object" &&
                        search.pattern &&
                        "type" in search.pattern
                          ? search.pattern.type === "weekend"
                            ? "Week-end"
                            : search.pattern.type === "twoWeeks"
                            ? "2 semaines"
                            : search.pattern.type === "oneWeek"
                            ? "1 semaine"
                            : "Personnalisé"
                          : "Pattern personnalisé"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {search.isActive && (
                      <Badge variant="default" className="gap-1">
                        <Bell className="h-3 w-3" />
                        Active
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(search.id);
                      }}
                      data-testid={`button-delete-${search.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {search.selectedDestinations &&
                  Array.isArray(search.selectedDestinations) &&
                  search.selectedDestinations.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {search.selectedDestinations.map((dest) => (
                        <Badge key={dest} variant="outline" className="text-xs">
                          {dest}
                        </Badge>
                      ))}
                    </div>
                  )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Card>
  );
}
