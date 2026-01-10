import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  users, campaigns, transactions, analytics,
  type User, type InsertUser,
  type Campaign, type InsertCampaign,
  type Transaction, type InsertTransaction,
  type Analytics
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  // --- UPDATED: New method for Stripe Activation ---
  updateUserPlan(userId: number, plan: string): Promise<User>;

  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;

  getTransactions(): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;

  getAnalytics(): Promise<Analytics[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // --- NEW: LATEST 2026 ACTIVATION LOGIC ---
  async updateUserPlan(userId: number, plan: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ 
        plan: plan,
        // We also ensure the user is marked as 'active' for the autonomous engine
        active: true 
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw new Error(`User with ID ${userId} not found for plan update.`);
    }

    return updatedUser;
  }

  async getCampaigns(): Promise<Campaign[]> {
    return await db.select().from(campaigns);
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign;
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const [newCampaign] = await db.insert(campaigns).values(campaign).returning();
    return newCampaign;
  }

  async getTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions);
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    
    // Update user balance
    const user = await this.getUser(transaction.userId);
    if (user) {
      await db.update(users)
        .set({ balance: user.balance + transaction.amount })
        .where(eq(users.id, user.id));
    }
    
    return newTransaction;
  }

  async getAnalytics(): Promise<Analytics[]> {
    return await db.select().from(analytics);
  }
}

export const storage = new DatabaseStorage();

