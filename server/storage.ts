import {
  type Search,
  type InsertSearch,
  type Alert,
  type InsertAlert,
  type PriceHistory,
  type InsertPriceHistory,
  searches,
  alerts,
  priceHistory,
} from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Searches
  createSearch(search: InsertSearch): Promise<Search>;
  getSearches(): Promise<Search[]>;
  getSearch(id: string): Promise<Search | undefined>;
  deleteSearch(id: string): Promise<void>;
  getActiveSearches(): Promise<Search[]>;

  // Alerts
  createAlert(alert: InsertAlert): Promise<Alert>;
  getAlerts(searchId?: string): Promise<Alert[]>;
  markAlertSent(id: string): Promise<void>;

  // Price History
  addPriceHistory(history: InsertPriceHistory): Promise<PriceHistory>;
  getPriceHistory(searchId: string, destination: string): Promise<PriceHistory[]>;
}

// Implémentation avec Drizzle + Supabase
export class DatabaseStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor(databaseUrl: string) {
    const sql = neon(databaseUrl);
    this.db = drizzle(sql);
  }

  // Searches
  async createSearch(insertSearch: InsertSearch): Promise<Search> {
    const [search] = await this.db
      .insert(searches)
      .values(insertSearch as any)
      .returning();
    return search;
  }

  async getSearches(): Promise<Search[]> {
    return this.db
      .select()
      .from(searches)
      .orderBy(desc(searches.createdAt));
  }

  async getSearch(id: string): Promise<Search | undefined> {
    const [search] = await this.db
      .select()
      .from(searches)
      .where(eq(searches.id, id))
      .limit(1);
    return search;
  }

  async deleteSearch(id: string): Promise<void> {
    // Supprimer également les alertes associées
    await this.db.delete(alerts).where(eq(alerts.searchId, id));
    await this.db.delete(searches).where(eq(searches.id, id));
  }

  async getActiveSearches(): Promise<Search[]> {
    return this.db
      .select()
      .from(searches)
      .where(eq(searches.isActive, true));
  }

  // Alerts
  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const [alert] = await this.db
      .insert(alerts)
      .values(insertAlert as any)
      .returning();
    return alert;
  }

  async getAlerts(searchId?: string): Promise<Alert[]> {
    if (searchId) {
      return this.db
        .select()
        .from(alerts)
        .where(eq(alerts.searchId, searchId));
    }
    return this.db.select().from(alerts);
  }

  async markAlertSent(id: string): Promise<void> {
    await this.db
      .update(alerts)
      .set({ sent: true })
      .where(eq(alerts.id, id));
  }

  // Price History
  async addPriceHistory(insertHistory: InsertPriceHistory): Promise<PriceHistory> {
    const [history] = await this.db
      .insert(priceHistory)
      .values(insertHistory)
      .returning();
    return history;
  }

  async getPriceHistory(searchId: string, destination: string): Promise<PriceHistory[]> {
    return this.db
      .select()
      .from(priceHistory)
      .where(
        and(
          eq(priceHistory.searchId, searchId),
          eq(priceHistory.destination, destination)
        )
      )
      .orderBy(desc(priceHistory.recordedAt));
  }
}

// Export instance basée sur la variable d'environnement
export const storage = process.env.DATABASE_URL
  ? new DatabaseStorage(process.env.DATABASE_URL)
  : (() => {
      console.warn("DATABASE_URL not found, storage will not work!");
      throw new Error("DATABASE_URL is required");
    })();
