import Stripe from "stripe";
import { Request, Response } from "express";
import { storage } from "./storage";

// Using the latest Stripe API version (2025-12-15) for maximum longevity
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15",
});

export async function stripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  let event: Stripe.Event;

  try {
    // SECURITY: Verification fails if req.body is already parsed into JSON
    event = stripe.webhooks.constructEvent(req.body, sig!, webhookSecret);
  } catch (err: any) {
    console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment activation
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = Number(session.metadata?.userId);

    if (userId) {
      // Updates user plan to 'agency' to unlock autonomous features
      await storage.updateUserPlan(userId, "agency");
      console.log(`🚀 System Online: User ${userId} engine activated.`);
    }
  }

  // Handle cancellations to deactivate engine automatically
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    // Optional: Add storage call here to set active = false
    console.log(`🛑 Subscription ended for customer: ${subscription.customer}`);
  }

  res.json({ received: true });
}

