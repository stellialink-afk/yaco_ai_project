import Stripe from "stripe";

let cached: Stripe | null = null;

/** Stripe クライアント（遅延初期化。ビルド時に鍵が無くても落ちない） */
export function getStripe() {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY が未設定です");
  cached = new Stripe(key);
  return cached;
}
