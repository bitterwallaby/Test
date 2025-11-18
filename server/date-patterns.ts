import { addDays, addWeeks, format, isFriday, isSaturday, isSunday, isMonday } from "date-fns";
import type { DatePattern } from "@shared/schema";

export interface DateRange {
  outbound: string; // Format YYYY-MM-DD
  return: string; // Format YYYY-MM-DD
  label: string; // Description lisible
}

// Générer les dates pour les 12 prochains mois selon un pattern
export function generateDateRanges(pattern: DatePattern, monthsAhead: number = 12): DateRange[] {
  const ranges: DateRange[] = [];
  const today = new Date();
  const maxDate = addWeeks(today, monthsAhead * 4);

  let currentDate = new Date(today);

  while (currentDate < maxDate && ranges.length < 48) {
    // Max 48 occurrences
    const range = generateNextRange(currentDate, pattern);
    if (range) {
      ranges.push(range);
      currentDate = addDays(new Date(range.return), 1);
    } else {
      currentDate = addDays(currentDate, 1);
    }
  }

  return ranges;
}

function generateNextRange(startDate: Date, pattern: DatePattern): DateRange | null {
  const { type, duration, preferredDays } = pattern;

  // Si des jours préférés sont spécifiés, vérifier si on est sur un jour valide
  if (preferredDays && preferredDays.length > 0) {
    const dayOfWeek = startDate.getDay();
    if (!preferredDays.includes(dayOfWeek)) {
      return null;
    }
  }

  let outbound: Date;
  let returnDate: Date;
  let label: string;

  switch (type) {
    case "weekend":
      // Week-end: Vendredi soir au Dimanche soir
      if (!isFriday(startDate)) {
        return null;
      }
      outbound = startDate;
      returnDate = addDays(startDate, 2); // Dimanche
      label = `Week-end ${format(outbound, "dd/MM")}`;
      break;

    case "oneWeek":
      // 1 semaine (7 jours)
      outbound = startDate;
      returnDate = addDays(startDate, duration || 7);
      label = `Semaine ${format(outbound, "dd/MM")}`;
      break;

    case "twoWeeks":
      // 2 semaines (14 jours)
      outbound = startDate;
      returnDate = addDays(startDate, duration || 14);
      label = `2 semaines ${format(outbound, "dd/MM")}`;
      break;

    case "custom":
      // Durée personnalisée
      outbound = startDate;
      returnDate = addDays(startDate, duration);
      label = `${duration} jours ${format(outbound, "dd/MM")}`;
      break;

    default:
      return null;
  }

  return {
    outbound: format(outbound, "yyyy-MM-dd"),
    return: format(returnDate, "yyyy-MM-dd"),
    label,
  };
}

// Générer un échantillon de dates pour tester (réduit le nombre d'appels API)
export function generateSampleDates(pattern: DatePattern, sampleSize: number = 3): DateRange[] {
  const allRanges = generateDateRanges(pattern, 12);

  // Prendre des échantillons répartis sur la période
  const step = Math.floor(allRanges.length / sampleSize);
  const samples: DateRange[] = [];

  for (let i = 0; i < sampleSize && i * step < allRanges.length; i++) {
    samples.push(allRanges[i * step]);
  }

  return samples;
}

// Obtenir les prochaines vacances scolaires (approximatif)
export function getSchoolHolidays(year: number): DateRange[] {
  // Vacances françaises approximatives
  return [
    {
      outbound: `${year}-02-10`,
      return: `${year}-02-25`,
      label: "Vacances d'hiver",
    },
    {
      outbound: `${year}-04-08`,
      return: `${year}-04-23`,
      label: "Vacances de printemps",
    },
    {
      outbound: `${year}-07-08`,
      return: `${year}-08-31`,
      label: "Vacances d'été",
    },
    {
      outbound: `${year}-10-21`,
      return: `${year}-11-05`,
      label: "Vacances de la Toussaint",
    },
    {
      outbound: `${year}-12-22`,
      return: `${year + 1}-01-06`,
      label: "Vacances de Noël",
    },
  ];
}
