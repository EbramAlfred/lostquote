import { createHmac, timingSafeEqual, createHash, randomBytes } from "node:crypto";

export const SHOP_RE = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;
export const isValidShop = (s: unknown): s is string => typeof s === "string" && SHOP_RE.test(s);

function b64urlToBuf(s: string) {
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

function safeEqual(a: Buffer, b: Buffer) {
  return a.length === b.length && timingSafeEqual(a, b);
}

export type IdTokenClaims = { iss: string; dest: string; aud: string; sub?: string; exp: number; nbf: number; sid?: string };

// Validates the short-lived ID (session) token that Shopify App Bridge gives the embedded page.
// Returns the claims plus the shop domain, or null if ANY check fails.
export function verifyIdToken(
  token: string,
  opts: { clientId: string; clientSecret: string; now?: number }
): (IdTokenClaims & { shop: string }) | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [h, p, s] = parts;
    const header = JSON.parse(b64urlToBuf(h).toString("utf8"));
    if (header.alg !== "HS256") return null;
    const expected = createHmac("sha256", opts.clientSecret).update(`${h}.${p}`).digest();
    if (!safeEqual(expected, b64urlToBuf(s))) return null;

    const c = JSON.parse(b64urlToBuf(p).toString("utf8")) as IdTokenClaims;
    const now = opts.now ?? Math.floor(Date.now() / 1000);
    if (typeof c.exp !== "number" || c.exp <= now) return null;
    if (typeof c.nbf !== "number" || c.nbf > now) return null;
    if (c.aud !== opts.clientId) return null;
    const iss = new URL(c.iss);
    const dest = new URL(c.dest);
    if (iss.hostname !== dest.hostname) return null;
    if (!isValidShop(dest.hostname)) return null;
    return { ...c, shop: dest.hostname };
  } catch {
    return null;
  }
}

// Webhooks: Shopify signs the raw request body with the client secret (base64 HMAC-SHA256).
export function verifyWebhookHmac(rawBody: string, headerValue: string | null, clientSecret: string): boolean {
  if (!headerValue) return false;
  const expected = createHmac("sha256", clientSecret).update(rawBody, "utf8").digest();
  return safeEqual(expected, Buffer.from(headerValue, "base64"));
}

// One-time link codes: only the hash is stored in the database.
export function newLinkCode() {
  const code = randomBytes(24).toString("base64url");
  return { code, hash: hashCode(code) };
}
export const hashCode = (code: string) => createHash("sha256").update(code).digest("hex");

export function shopifyEnv() {
  const clientId = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY;
  const clientSecret = process.env.SHOPIFY_API_SECRET;
  if (!clientId || !clientSecret) throw new Error("Shopify keys are not configured");
  return { clientId, clientSecret };
}
