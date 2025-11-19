import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Calendar, Euro, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const searchFormSchema = z.object({
  origin: z.string().min(3, "Code IATA requis (ex: CDG, ORY, NCE)"),
  budget: z.number().min(50).max(5000),
  patternType: z.enum(["weekend", "twoWeeks", "oneWeek", "custom"]),
  duration: z.number().min(1).max(30),
  email: z.string().email("Email valide requis pour les alertes"),
  maxDistance: z.number().optional(),
  preferredDays: z.array(z.number()).optional(),
});

type SearchFormValues = z.infer<typeof searchFormSchema> & {
  pattern?: any;
};

const PATTERN_TYPES = [
  { value: "weekend", label: "Week-end (Ven-Dim)", duration: 3 },
  { value: "oneWeek", label: "1 semaine", duration: 7 },
  { value: "twoWeeks", label: "2 semaines", duration: 14 },
  { value: "custom", label: "Personnalisé", duration: 7 },
];

const DAYS_OF_WEEK = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mer" },
  { value: 4, label: "Jeu" },
  { value: 5, label: "Ven" },
  { value: 6, label: "Sam" },
  { value: 0, label: "Dim" },
];

interface SearchFormProps {
  onSubmit: (values: SearchFormValues) => void;
}

export function SearchForm({ onSubmit }: SearchFormProps) {
  const [budget, setBudget] = useState(500);
  const [maxDistance, setMaxDistance] = useState(5000);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      origin: "",
      budget: 500,
      patternType: "weekend",
      duration: 3,
      email: "",
      maxDistance: 5000,
      preferredDays: [],
    },
  });

  const handleSubmit = (values: SearchFormValues) => {
    // Construire le pattern de dates
    const selectedPattern = PATTERN_TYPES.find((p) => p.value === values.patternType);
    const pattern = {
      type: values.patternType,
      duration: values.patternType === "custom" ? values.duration : selectedPattern?.duration || 3,
      preferredDays: selectedDays.length > 0 ? selectedDays : undefined,
    };

    onSubmit({
      ...values,
      pattern: pattern as any,
      preferredDays: selectedDays.length > 0 ? selectedDays : undefined,
    });
  };

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const patternType = form.watch("patternType");

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Critères de recherche
            </h3>
            <p className="text-sm text-muted-foreground">
              Définissez votre point de départ, budget et disponibilités
            </p>
          </div>

          {/* Origin Airport */}
          <FormField
            control={form.control}
            name="origin"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Aéroport de départ
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="CDG, ORY, NCE..."
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    data-testid="input-origin"
                    className="uppercase"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Budget */}
          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 justify-between">
                  <span className="flex items-center gap-2">
                    <Euro className="h-4 w-4" />
                    Budget maximum
                  </span>
                  <Badge variant="secondary" data-testid="text-budget">
                    {budget} €
                  </Badge>
                </FormLabel>
                <FormControl>
                  <Slider
                    min={50}
                    max={5000}
                    step={50}
                    value={[budget]}
                    onValueChange={(values) => {
                      setBudget(values[0]);
                      field.onChange(values[0]);
                    }}
                    data-testid="slider-budget"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Pattern Type */}
          <FormField
            control={form.control}
            name="patternType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Type de séjour
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-pattern-type">
                      <SelectValue placeholder="Sélectionnez un pattern" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PATTERN_TYPES.map((pattern) => (
                      <SelectItem key={pattern.value} value={pattern.value}>
                        {pattern.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Custom Duration */}
          {patternType === "custom" && (
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Durée (jours)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={30}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      data-testid="input-duration"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Preferred Days */}
          <div className="space-y-3">
            <FormLabel>Jours de départ préférés (optionnel)</FormLabel>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <Badge
                  key={day.value}
                  variant={selectedDays.includes(day.value) ? "default" : "outline"}
                  className="cursor-pointer hover-elevate active-elevate-2"
                  onClick={() => toggleDay(day.value)}
                  data-testid={`badge-day-${day.value}`}
                >
                  {day.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Max Distance */}
          <FormField
            control={form.control}
            name="maxDistance"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 justify-between">
                  <span>Distance maximale (optionnel)</span>
                  <Badge variant="secondary" data-testid="text-distance">
                    {maxDistance} km
                  </Badge>
                </FormLabel>
                <FormControl>
                  <Slider
                    min={500}
                    max={20000}
                    step={500}
                    value={[maxDistance]}
                    onValueChange={(values) => {
                      setMaxDistance(values[0]);
                      field.onChange(values[0]);
                    }}
                    data-testid="slider-distance"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email for Alerts */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email pour les alertes</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="votre@email.com"
                    {...field}
                    data-testid="input-email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" size="lg" data-testid="button-search">
            <Search className="mr-2 h-5 w-5" />
            Découvrir des destinations
          </Button>
        </form>
      </Form>
    </Card>
  );
}
