
import Stripe from "stripe";
import express from "express";
import { db } from "./db"; 
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const router = express.Router();

// URL for the subscription checkout
router.post("/create-session", async (req, res) => {
  const { priceId, userId } = req.body;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.DOMAIN}/success`,
    cancel_url: `${process.env.DOMAIN}/cancel`,
    metadata: { userId },
  });
  res.json({ url: session.url });
});

// Webhook to make the business "autonomous"
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"]!;
  const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    await db.update(users)
      .set({ subscriptionStatus: "active" })
      .where(eq(users.id, parseInt(session.metadata.userId)));
  }
  res.json({ received: true });
});

export default router;
