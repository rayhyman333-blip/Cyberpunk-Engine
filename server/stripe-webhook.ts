import Stripe from "stripe";
import { Request, Response } from "express";
import { storage } from "./storage"; // Using your local storage/db logic

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function stripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"];
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = Number(session.metadata?.userId);

    if (userId) {
      // Logic to activate the Engine in your database
      await storage.updateUserPlan(userId, "agency");
      console.log(`🚀 Engine Activated for User: ${userId}`);
    }
  }

  res.json({ received: true });
}
