import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY ?? "";

// Returnera null gracefully om nyckeln saknas (innan admin lagt till den)
export const stripe = key && key !== "sk_test_your_key"
  ? new Stripe(key, { apiVersion: "2026-04-22.dahlia" })
  : null;

export function getStripePublishableKey(): string {
  return process.env.STRIPE_PUBLISHABLE_KEY ?? "";
}

export function getWebhookSecret(): string {
  return process.env.STRIPE_WEBHOOK_SECRET ?? "";
}
