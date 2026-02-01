import Stripe from 'stripe';

/**
 * Cached Stripe instance to avoid repeated initialization.
 */
let stripeInstance: Stripe | null = null;

/**
 * Get or create a Stripe server-side client.
 * Returns null if STRIPE_SECRET_KEY is not configured.
 */
export function getStripe(): Stripe | null {
  if (stripeInstance) {
    return stripeInstance;
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return null;
  }

  stripeInstance = new Stripe(stripeSecretKey, {
    apiVersion: '2025-02-24.acacia',
  });

  return stripeInstance;
}

/**
 * Check if Stripe is configured on the server.
 */
export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}
