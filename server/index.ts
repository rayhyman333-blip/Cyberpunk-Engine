import express from "express";
import Stripe from "stripe";
import { db } from "./db"; 
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

// 1. INITIALIZE STRIPE
// Make sure to add STRIPE_SECRET_KEY to your GitHub Secrets/Environment
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27", 
});

const app = express();

/**
 * 2. STRIPE WEBHOOK (Autonomous Trigger)
 * This must come BEFORE express.json() middleware because it needs the RAW body.
 * This is the part that automatically updates your database when a user pays.
 */
app.post("/api/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"]!;
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const userId = session.metadata?.userId;

    if (userId) {
      // This "unlocks" your advertising engine for the user
      await db.update(users)
        .set({ subscriptionStatus: "active" })
        .where(eq(users.id, parseInt(userId)));
      
      console.log(`✅ Autonomous Business: User ${userId} activated.`);
    }
  }

  res.json({ received: true });
});

// Regular JSON middleware for other routes
app.use(express.json());

/**
 * 3. CREATE SUBSCRIPTION CHECKOUT
 * Call this from your frontend to send the user to the Stripe payment page.
 */
app.post("/api/create-subscription", async (req, res) => {
  const { priceId, userId } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.DOMAIN}/success`,
      cancel_url: `${process.env.DOMAIN}/cancel`,
      metadata: { userId: userId.toString() },
    });

    res.json({ url: session.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. START THE SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running and listening for Stripe events on port ${PORT}`);
});
