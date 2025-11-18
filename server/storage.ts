import {
  type Search,
  type InsertSearch,
  type Alert,
  type InsertAlert,
  type PriceHistory,
  type InsertPriceHistory,
} from "@shared/schema";
import { randomUUID } from "crypto";

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

export class MemStorage implements IStorage {
  private searches: Map<string, Search>;
  private alerts: Map<string, Alert>;
  private priceHistory: Map<string, PriceHistory>;

  constructor() {
    this.searches = new Map();
    this.alerts = new Map();
    this.priceHistory = new Map();
  }

  // Searches
  async createSearch(insertSearch: InsertSearch): Promise<Search> {
    const id = randomUUID();
    const now = new Date();
    const search: Search = {
      ...insertSearch,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.searches.set(id, search);
    return search;
  }

  async getSearches(): Promise<Search[]> {
    return Array.from(this.searches.values()).sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getSearch(id: string): Promise<Search | undefined> {
    return this.searches.get(id);
  }

  async deleteSearch(id: string): Promise<void> {
    this.searches.delete(id);
    // Supprimer également les alertes associées
    Array.from(this.alerts.entries()).forEach(([alertId, alert]) => {
      if (alert.searchId === id) {
        this.alerts.delete(alertId);
      }
    });
  }

  async getActiveSearches(): Promise<Search[]> {
    return Array.from(this.searches.values()).filter((search) => search.isActive);
  }

  // Alerts
  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = randomUUID();
    const alert: Alert = {
      ...insertAlert,
      id,
      sent: false,
      createdAt: new Date(),
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async getAlerts(searchId?: string): Promise<Alert[]> {
    const alerts = Array.from(this.alerts.values());
    if (searchId) {
      return alerts.filter((alert) => alert.searchId === searchId);
    }
    return alerts;
  }

  async markAlertSent(id: string): Promise<void> {
    const alert = this.alerts.get(id);
    if (alert) {
      alert.sent = true;
      this.alerts.set(id, alert);
    }
  }

  // Price History
  async addPriceHistory(insertHistory: InsertPriceHistory): Promise<PriceHistory> {
    const id = randomUUID();
    const history: PriceHistory = {
      ...insertHistory,
      id,
      recordedAt: new Date(),
    };
    this.priceHistory.set(id, history);
    return history;
  }

  async getPriceHistory(searchId: string, destination: string): Promise<PriceHistory[]> {
    return Array.from(this.priceHistory.values())
      .filter((h) => h.searchId === searchId && h.destination === destination)
      .sort((a, b) => (b.recordedAt?.getTime() || 0) - (a.recordedAt?.getTime() || 0));
  }
}

export const storage = new MemStorage();
