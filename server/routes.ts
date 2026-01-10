import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import express from "express"; 
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { stripeWebhook } from "./stripe-webhook";

// 1. THE GATEKEEPER: This blocks non-paying users from using AI features
const requireSubscription = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  
  // Only allow Admins or users who have paid for the 'agency' plan
  if (req.user.role !== 'admin' && req.user.plan !== 'agency') {
    return res.status(403).json({ 
      message: "Engine Offline: Please 'Activate Engine' to start autonomous campaigns." 
    });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // 2. CONNECT WEBHOOK: Must use express.raw for signature verification
  app.post(
    "/api/webhooks/stripe", 
    express.raw({ type: "application/json" }), 
    stripeWebhook
  );

  // 3. APPLY GATING: Add 'requireSubscription' to protected routes
  app.post(api.campaigns.create.path, requireSubscription, async (req, res) => {
    const campaign = await storage.createCampaign({
      ...req.body,
      userId: req.user.id,
      status: 'active'
    });
    res.status(201).json(campaign);
  });

  app.get(api.analytics.get.path, requireSubscription, async (req, res) => {
    const data = await storage.getAnalytics();
    res.json(data);
  });

  const httpServer = createServer(app);
  return httpServer;
}

