import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("STRIPE_SECRET_KEY is not set — Stripe calls will fail.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_missing", {
  apiVersion: "2026-08-26.dahlia",
});
