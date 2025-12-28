import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { db } from "./db";
import { analytics, campaigns } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  // Campaigns
  app.get(api.campaigns.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const campaigns = await storage.getCampaigns();
    // Filter by user unless admin
    const userCampaigns = req.user.role === 'admin' 
      ? campaigns 
      : campaigns.filter(c => c.userId === req.user!.id);
    res.json(userCampaigns);
  });

  app.post(api.campaigns.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.campaigns.create.input.parse(req.body);
      const campaign = await storage.createCampaign({
        ...input,
        userId: req.user.id,
        status: 'active'
      });
      res.status(201).json(campaign);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.get(api.campaigns.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const campaign = await storage.getCampaign(Number(req.params.id));
    if (!campaign || (req.user.role !== 'admin' && campaign.userId !== req.user.id)) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    res.json(campaign);
  });

  // Transactions
  app.get(api.transactions.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const txs = await storage.getTransactions();
    const userTxs = req.user.role === 'admin' 
      ? txs 
      : txs.filter(t => t.userId === req.user!.id);
    res.json(userTxs);
  });

  app.post(api.transactions.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.transactions.create.input.parse(req.body);
      const tx = await storage.createTransaction({
        ...input,
        userId: req.user.id,
        status: 'completed' // Auto-complete for MVP
      });
      res.status(201).json(tx);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // Analytics
  app.get(api.analytics.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const data = await storage.getAnalytics();
    // For MVP, return all data. In production, filter by user's campaigns.
    res.json(data);
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingCampaigns = await storage.getCampaigns();
  if (existingCampaigns.length === 0) {
    // Create seed data logic here if needed
    // Typically requires a user first.
    // We can rely on user registration for the MVP.
  }
}
