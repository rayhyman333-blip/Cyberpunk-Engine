import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("user").notNull(), // 'admin' | 'user'
  balance: integer("balance").default(0).notNull(), // in cents
});

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  budget: integer("budget").notNull(), // in cents
  geoTarget: text("geo_target").notNull(),
  status: text("status").default("active").notNull(), // 'active' | 'paused' | 'completed'
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(), // positive for deposit, negative for spend
  type: text("type").notNull(), // 'deposit' | 'payout' | 'spend'
  status: text("status").default("pending").notNull(), // 'pending' | 'completed' | 'failed'
  createdAt: timestamp("created_at").defaultNow(),
});

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  impressions: integer("impressions").default(0).notNull(),
  clicks: integer("clicks").default(0).notNull(),
  spend: integer("spend").default(0).notNull(), // in cents
  date: timestamp("date").defaultNow(),
});

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, balance: true });
export const insertCampaignSchema = createInsertSchema(campaigns).omit({ id: true, userId: true, createdAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, userId: true, createdAt: true, status: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Analytics = typeof analytics.$inferSelect;
