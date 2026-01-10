import { users, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByStripeId(customerId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  saveStripeCustomerId(userId: number, customerId: string): Promise<void>;
  updateSubscriptionStatus(userId: number, status: boolean, details?: Partial<User>): Promise<void>;
  deactivateUserPlan(userId: number): Promise<void>;
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByStripeId(customerId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async saveStripeCustomerId(userId: number, customerId: string): Promise<void> {
    await db.update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, userId));
  }

  async updateSubscriptionStatus(userId: number, status: boolean, details: Partial<User> = {}): Promise<void> {
    await db.update(users)
      .set({ 
        active: status,
        plan: status ? "agency" : "free",
        ...details 
      })
      .where(eq(users.id, userId));
  }

  async deactivateUserPlan(userId: number): Promise<void> {
    await db.update(users)
      .set({ 
        active: false, 
        plan: "free",
        planCanceledAt: new Date() 
      })
      .where(eq(users.id, userId));
  }
}

export const storage = new DatabaseStorage();
