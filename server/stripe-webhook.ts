import Stripe from "stripe";
import { Request, Response } from "express";
import { storage } from "./storage";

// Using the latest Stripe API version for 2026 stability
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15",
});

export async function stripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  let event: Stripe.Event;

  try {
    // SECURITY: Ensures the message actually came from Stripe and hasn't been tampered with
    event = stripe.webhooks.constructEvent(req.body, sig!, webhookSecret);
  } catch (err: any) {
    console.error(`⚠️ Verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful engine activation
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = Number(session.metadata?.userId);

    if (userId) {
      // TRIGGER: Updates database to set user.plan to 'agency' and user.active to true
      await storage.updateUserPlan(userId, "agency");
      console.log(`🚀 System Online: User ${userId} engine activated.`);
    }
  }

  // Handle subscription cancellations to stop AI spending
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    // Optional: Add logic here to set active = false in your database
    console.log(`🛑 Subscription ended for customer: ${subscription.customer}`);
  }

  res.json({ received: true });
}
