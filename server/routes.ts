import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express"; // Needed for express.raw
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { stripeWebhook } from "./stripe-webhook"; // We will create this file next

export async function registerRoutes(
  app: Express
): Promise<Server> {
  setupAuth(app);

  // --- NEW: STRIPE WEBHOOK ROUTE ---
  // This must use express.raw so Stripe can verify the payment signature
  app.post(
    "/api/webhooks/stripe", 
    express.raw({ type: "application/json" }), 
    stripeWebhook
  );

  // Campaigns
  app.get(api.campaigns.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const campaigns = await storage.getCampaigns();
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

  // Transactions
  app.get(api.transactions.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const txs = await storage.getTransactions();
    const userTxs = req.user.role === 'admin' 
      ? txs 
      : txs.filter(t => t.userId === req.user!.id);
    res.json(userTxs);
  });

  // Analytics
  app.get(api.analytics.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const data = await storage.getAnalytics();
    res.json(data);
  });

  const httpServer = createServer(app);
  return httpServer;
}

