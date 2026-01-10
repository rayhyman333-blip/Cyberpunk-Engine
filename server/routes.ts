import express from 'express';
import Stripe from 'stripe';
import { storage } from "./storage";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16', // Use the 2026 current stable version
});

export async function registerRoutes(app: express.Express) {
  
  // 1. THE WEBHOOK ROUTE (Place this before express.json middleware)
  app.post('/api/stripe/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // 2. THE EVENT SWITCHBOARD
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = parseInt(session.metadata?.userId || "0");
        
        // Save the Customer ID for future renewals/cancellations
        await storage.saveStripeCustomerId(userId, session.customer as string);
        
        // Unlock the engine!
        await storage.updateSubscriptionStatus(userId, true, {
          planStartedAt: new Date(),
        });
        console.log(`User ${userId} engine activated.`);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const user = await storage.getUserByStripeId(invoice.customer as string);
        if (user) {
          // Update renewal date based on the new invoice period
          await storage.updateSubscriptionStatus(user.id, true, {
            planRenewsAt: new Date(invoice.lines.data[0].period.end * 1000)
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const user = await storage.getUserByStripeId(subscription.customer as string);
        if (user) {
          // Card failed too many times or user canceled
          await storage.deactivateUserPlan(user.id);
          console.log(`User ${user.id} engine deactivated.`);
        }
        break;
      }
    }

    res.json({ received: true });
  });

  // ... rest of your routes (Auth, Campaigns, etc.)
}


