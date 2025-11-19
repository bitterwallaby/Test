import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema";

// Types
export interface Search {
  id: string;
  name: string;
  originAirport: string;
  budget: number;
  pattern: any;
  selectedDestinations: string[];
  email?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Alert {
  id: string;
  searchId: string;
  destination: string;
  currentPrice: number;
  targetPrice?: number;
  priceChange?: number;
  flightDetails: any;
  sent: boolean;
  createdAt: Date;
}

export interface PriceHistory {
  id: string;
  searchId: string;
  destination: string;
  price: number;
  currency: string;
  date: string;
  recordedAt: Date;
}

// Storage interface
export interface IStorage {
  // Searches
  createSearch(search: Omit<Search, 'id' | 'createdAt' | 'updatedAt'>): Promise<Search>;
  getSearches(): Promise<Search[]>;
  getSearchById(id: string): Promise<Search | null>;
  updateSearch(id: string, updates: Partial<Search>): Promise<Search | null>;
  deleteSearch(id: string): Promise<boolean>;

  // Alerts
  createAlert(alert: Omit<Alert, 'id' | 'createdAt'>): Promise<Alert>;
  getAlerts(searchId?: string): Promise<Alert[]>;
  updateAlert(id: string, updates: Partial<Alert>): Promise<Alert | null>;

  // Price History
  addPriceHistory(history: Omit<PriceHistory, 'id' | 'recordedAt'>): Promise<PriceHistory>;
  getPriceHistory(searchId: string, destination?: string): Promise<PriceHistory[]>;
}

// In-memory storage (fallback)
class MemStorage implements IStorage {
  private searches: Map<string, Search> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private priceHistory: Map<string, PriceHistory> = new Map();

  async createSearch(search: Omit<Search, 'id' | 'createdAt' | 'updatedAt'>): Promise<Search> {
    const newSearch: Search = {
      ...search,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.searches.set(newSearch.id, newSearch);
    return newSearch;
  }

  async getSearches(): Promise<Search[]> {
    return Array.from(this.searches.values());
  }

  async getSearchById(id: string): Promise<Search | null> {
    return this.searches.get(id) || null;
  }

  async updateSearch(id: string, updates: Partial<Search>): Promise<Search | null> {
    const search = this.searches.get(id);
    if (!search) return null;
    
    const updated = { ...search, ...updates, updatedAt: new Date() };
    this.searches.set(id, updated);
    return updated;
  }

  async deleteSearch(id: string): Promise<boolean> {
    return this.searches.delete(id);
  }

  async createAlert(alert: Omit<Alert, 'id' | 'createdAt'>): Promise<Alert> {
    const newAlert: Alert = {
      ...alert,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    this.alerts.set(newAlert.id, newAlert);
    return newAlert;
  }

  async getAlerts(searchId?: string): Promise<Alert[]> {
    const allAlerts = Array.from(this.alerts.values());
    if (!searchId) return allAlerts;
    return allAlerts.filter(a => a.searchId === searchId);
  }

  async updateAlert(id: string, updates: Partial<Alert>): Promise<Alert | null> {
    const alert = this.alerts.get(id);
    if (!alert) return null;
    
    const updated = { ...alert, ...updates };
    this.alerts.set(id, updated);
    return updated;
  }

  async addPriceHistory(history: Omit<PriceHistory, 'id' | 'recordedAt'>): Promise<PriceHistory> {
    const newHistory: PriceHistory = {
      ...history,
      id: crypto.randomUUID(),
      recordedAt: new Date(),
    };
    this.priceHistory.set(newHistory.id, newHistory);
    return newHistory;
  }

  async getPriceHistory(searchId: string, destination?: string): Promise<PriceHistory[]> {
    const allHistory = Array.from(this.priceHistory.values());
    return allHistory.filter(h => {
      if (h.searchId !== searchId) return false;
      if (destination && h.destination !== destination) return false;
      return true;
    });
  }
}

// Database storage (when DATABASE_URL is available)
class DatabaseStorage implements IStorage {
  private db: any;

  constructor(connectionString: string) {
    const client = postgres(connectionString);
    this.db = drizzle(client, { schema });
  }

  async createSearch(search: Omit<Search, 'id' | 'createdAt' | 'updatedAt'>): Promise<Search> {
    const [result] = await this.db.insert(schema.searches).values(search).returning();
    return result as Search;
  }

  async getSearches(): Promise<Search[]> {
    return await this.db.select().from(schema.searches);
  }

  async getSearchById(id: string): Promise<Search | null> {
    const [result] = await this.db.select().from(schema.searches).where(schema.searches.id.eq(id));
    return result || null;
  }

  async updateSearch(id: string, updates: Partial<Search>): Promise<Search | null> {
    const [result] = await this.db
      .update(schema.searches)
      .set({ ...updates, updatedAt: new Date() })
      .where(schema.searches.id.eq(id))
      .returning();
    return result || null;
  }

  async deleteSearch(id: string): Promise<boolean> {
    const result = await this.db.delete(schema.searches).where(schema.searches.id.eq(id));
    return result.rowCount > 0;
  }

  async createAlert(alert: Omit<Alert, 'id' | 'createdAt'>): Promise<Alert> {
    const [result] = await this.db.insert(schema.alerts).values(alert).returning();
    return result as Alert;
  }

  async getAlerts(searchId?: string): Promise<Alert[]> {
    if (!searchId) {
      return await this.db.select().from(schema.alerts);
    }
    return await this.db.select().from(schema.alerts).where(schema.alerts.searchId.eq(searchId));
  }

  async updateAlert(id: string, updates: Partial<Alert>): Promise<Alert | null> {
    const [result] = await this.db
      .update(schema.alerts)
      .set(updates)
      .where(schema.alerts.id.eq(id))
      .returning();
    return result || null;
  }

  async addPriceHistory(history: Omit<PriceHistory, 'id' | 'recordedAt'>): Promise<PriceHistory> {
    const [result] = await this.db.insert(schema.priceHistory).values(history).returning();
    return result as PriceHistory;
  }

  async getPriceHistory(searchId: string, destination?: string): Promise<PriceHistory[]> {
    let query = this.db.select().from(schema.priceHistory).where(schema.priceHistory.searchId.eq(searchId));
    
    if (destination) {
      query = query.where(schema.priceHistory.destination.eq(destination));
    }
    
    return await query;
  }
}

// Initialize storage
function initStorage(): IStorage {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.log('⚠️  DATABASE_URL not found, using in-memory storage');
    return new MemStorage();
  }

  console.log('✅ Using database storage');
  return new DatabaseStorage(databaseUrl);
}

export const storage = initStorage();