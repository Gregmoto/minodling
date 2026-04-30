/**
 * Premium-hjälpfunktioner
 *
 * All logik för att avgöra om en användare är premium-prenumerant.
 * Stripe är INTE aktivt ännu – alla funktioner returnerar false/inactive
 * tills en riktig prenumeration lagras i databasen.
 *
 * När Stripe kopplas in:
 *   1. Lägg till STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET i .env
 *   2. Skapa en webhook-handler på /api/webhooks/stripe
 *   3. Synka subscription-data till databasen härifrån
 */

import prisma from "@/lib/prisma";

// ── Typer ────────────────────────────────────────────────────────────

export type PremiumPlan   = "free" | "premium";
export type SubStatus     = "active" | "inactive" | "canceled" | "past_due" | "trialing";

export interface PremiumStatus {
  isPremium:          boolean;
  plan:               PremiumPlan;
  status:             SubStatus;
  currentPeriodEnd:   Date | null;
  cancelAtPeriodEnd:  boolean;
  trialEnd:           Date | null;
}

// ── Konstanter ────────────────────────────────────────────────────────

const ACTIVE_STATUSES: SubStatus[] = ["active", "trialing"];

// ── Hjälpfunktioner ────────────────────────────────────────────────

/**
 * Hämtar premiumstatus för en profil-id.
 * Returnerar "free/inactive" om ingen prenumeration finns.
 */
export async function getPremiumStatus(profileId: string): Promise<PremiumStatus> {
  const sub = await prisma.subscription.findUnique({
    where: { profileId },
    select: {
      plan:               true,
      status:             true,
      currentPeriodEnd:   true,
      cancelAtPeriodEnd:  true,
      trialEnd:           true,
    },
  });

  if (!sub) {
    return {
      isPremium:         false,
      plan:              "free",
      status:            "inactive",
      currentPeriodEnd:  null,
      cancelAtPeriodEnd: false,
      trialEnd:          null,
    };
  }

  const status    = sub.status as SubStatus;
  const isPremium = sub.plan === "premium" && ACTIVE_STATUSES.includes(status);

  return {
    isPremium,
    plan:              sub.plan as PremiumPlan,
    status,
    currentPeriodEnd:  sub.currentPeriodEnd,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    trialEnd:          sub.trialEnd,
  };
}

/**
 * Enkel boolean-check. Använd i server components och actions.
 * TILLFÄLLIGT: alltid true – alla funktioner är gratis tills vidare.
 */
export async function isPremium(_profileId: string): Promise<boolean> {
  return true;
}

/**
 * Kastar ett fel om användaren inte är premium.
 * TILLFÄLLIGT: gör ingenting – alla funktioner är gratis tills vidare.
 */
export async function requirePremium(_profileId: string): Promise<void> {
  // no-op – allt är öppet tills vidare
}

/**
 * Skapar eller hämtar en subscription-rad för profilen (free-plan).
 * Anropas t.ex. vid registrering för att säkerställa att raden finns.
 */
export async function ensureSubscription(profileId: string) {
  return prisma.subscription.upsert({
    where:  { profileId },
    create: { profileId, plan: "free", status: "inactive" },
    update: {},
  });
}

/**
 * Aktivera premium manuellt (för admin/test-syfte).
 * Används tills Stripe-webhooks är på plats.
 */
export async function activatePremiumManually(
  profileId:         string,
  currentPeriodEnd?: Date,
) {
  return prisma.subscription.upsert({
    where:  { profileId },
    create: {
      profileId,
      plan:              "premium",
      status:            "active",
      currentPeriodEnd:  currentPeriodEnd ?? null,
      cancelAtPeriodEnd: false,
    },
    update: {
      plan:              "premium",
      status:            "active",
      currentPeriodEnd:  currentPeriodEnd ?? null,
      cancelAtPeriodEnd: false,
    },
  });
}

/**
 * Avbryt premium (kallas av Stripe-webhook eller manuellt).
 */
export async function cancelPremium(profileId: string, atPeriodEnd = true) {
  return prisma.subscription.update({
    where: { profileId },
    data:  atPeriodEnd
      ? { cancelAtPeriodEnd: true }
      : { plan: "free", status: "canceled", cancelAtPeriodEnd: false },
  });
}

// ── Stripe-förberedelse ──────────────────────────────────────────────

/**
 * Synka en Stripe-prenumeration till databasen.
 * Anropas från webhook-handler när checkout.session.completed,
 * customer.subscription.updated eller customer.subscription.deleted tas emot.
 *
 * @example (i /api/webhooks/stripe/route.ts)
 * import { syncStripeSubscription } from "@/lib/premium";
 * await syncStripeSubscription({ profileId, stripeCustomerId, ... });
 */
export async function syncStripeSubscription(data: {
  profileId:            string;
  stripeCustomerId:     string;
  stripeSubscriptionId: string;
  stripePriceId:        string;
  plan:                 PremiumPlan;
  status:               SubStatus;
  currentPeriodStart:   Date;
  currentPeriodEnd:     Date;
  cancelAtPeriodEnd:    boolean;
  trialEnd?:            Date | null;
}) {
  return prisma.subscription.upsert({
    where:  { profileId: data.profileId },
    create: {
      profileId:            data.profileId,
      stripeCustomerId:     data.stripeCustomerId,
      stripeSubscriptionId: data.stripeSubscriptionId,
      stripePriceId:        data.stripePriceId,
      plan:                 data.plan,
      status:               data.status,
      currentPeriodStart:   data.currentPeriodStart,
      currentPeriodEnd:     data.currentPeriodEnd,
      cancelAtPeriodEnd:    data.cancelAtPeriodEnd,
      trialEnd:             data.trialEnd ?? null,
    },
    update: {
      stripeCustomerId:     data.stripeCustomerId,
      stripeSubscriptionId: data.stripeSubscriptionId,
      stripePriceId:        data.stripePriceId,
      plan:                 data.plan,
      status:               data.status,
      currentPeriodStart:   data.currentPeriodStart,
      currentPeriodEnd:     data.currentPeriodEnd,
      cancelAtPeriodEnd:    data.cancelAtPeriodEnd,
      trialEnd:             data.trialEnd ?? null,
    },
  });
}
