import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("user"), // 'user' or 'admin'
  balance: integer("balance").default(0), // Balance in cents
  
  // Subscription Lifecycle
  plan: text("plan").default("free"), // 'free' or 'agency'
  active: boolean("active").default(false),
  stripeCustomerId: text("stripe_customer_id"),
  planStartedAt: timestamp("plan_started_at"),
  planRenewsAt: timestamp("plan_renews_at"),
  planCanceledAt: timestamp("plan_canceled_at"),
});

export const insertUserSchema = createInsertSchema(users);
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
