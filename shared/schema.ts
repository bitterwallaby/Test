import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Pattern types for flexible date searches
export const datePatternSchema = z.object({
  type: z.enum(['weekend', 'twoWeeks', 'oneWeek', 'custom']),
  preferredDays: z.array(z.number()).optional(), // 0-6 (Sunday-Saturday)
  duration: z.number(), // in days
  flexibility: z.number().optional(), // +/- days flexibility
});

export type DatePattern = z.infer<typeof datePatternSchema>;

// Destination with scoring
export const destinationSchema = z.object({
  iataCode: z.string(),
  cityName: z.string(),
  countryName: z.string(),
  countryCode: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  score: z.number().optional(), // Calculated score for inspiration
  distance: z.number().optional(), // Distance from origin in km
  flightDuration: z.number().optional(), // Estimated duration in minutes
  uniquenessScore: z.number().optional(), // How unexpected/unique this destination is
});

export type Destination = z.infer<typeof destinationSchema>;

// Flight offer from Amadeus API
export const flightOfferSchema = z.object({
  id: z.string(),
  price: z.number(),
  currency: z.string(),
  origin: z.string(),
  destination: z.string(),
  outboundDate: z.string(),
  returnDate: z.string().optional(),
  duration: z.string(), // Total duration
  stops: z.number(),
  airlines: z.array(z.string()),
  bookingLink: z.string().optional(),
  deepLink: z.string().optional(), // For affiliate links
});

export type FlightOffer = z.infer<typeof flightOfferSchema>;

// Saved search with pattern and preferences
export const searches = pgTable("searches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  originAirport: text("origin_airport").notNull(),
  budget: integer("budget").notNull(),
  pattern: jsonb("pattern").notNull().$type<DatePattern>(),
  selectedDestinations: jsonb("selected_destinations").$type<string[]>(), // IATA codes
  maxDistance: integer("max_distance"), // in km
  isActive: boolean("is_active").default(true),
  email: text("email").notNull(), // For alerts
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSearchSchema = createInsertSchema(searches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSearch = z.infer<typeof insertSearchSchema>;
export type Search = typeof searches.$inferSelect;

// Price alerts
export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  searchId: varchar("search_id").notNull(),
  destination: text("destination").notNull(),
  currentPrice: integer("current_price").notNull(),
  targetPrice: integer("target_price").notNull(),
  priceChange: integer("price_change"), // Percentage change
  flightDetails: jsonb("flight_details").$type<FlightOffer>(),
  sent: boolean("sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;

// Price history for tracking
export const priceHistory = pgTable("price_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  searchId: varchar("search_id").notNull(),
  destination: text("destination").notNull(),
  price: integer("price").notNull(),
  currency: text("currency").notNull(),
  date: text("date").notNull(),
  recordedAt: timestamp("recorded_at").defaultNow(),
});

export const insertPriceHistorySchema = createInsertSchema(priceHistory).omit({
  id: true,
  recordedAt: true,
});

export type InsertPriceHistory = z.infer<typeof insertPriceHistorySchema>;
export type PriceHistory = typeof priceHistory.$inferSelect;
