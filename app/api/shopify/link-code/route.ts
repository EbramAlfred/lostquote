import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { exchangeAndStore } from "@/lib/shopify/admin";
import { newLinkCode, shopifyEnv, verifyIdToken } from "@/lib/shopify/verify";

// Called by the embedded page with the App Bridge ID token.
// Stores the store's access token and returns whether it is linked, plus a one-time link URL if not.
export async function POST(request: NextRequest) {
  const bearer = request.headers.get("authorization")?.replace(/^Bearer /i, "") ?? "";
  let env;
  try { env = shopifyEnv(); } catch { return NextResponse.json({ error: "not_configured" }, { status: 500 }); }

  const claims = verifyIdToken(bearer, env);
  if (!claims) {
    // App Bridge reads this header and retries once with a fresh token.
    return NextResponse.json({ error: "invalid_token" }, { status: 401, headers: { "X-Shopify-Retry-Invalid-Session-Request": "1" } });
  }

  try {
    const admin = createAdminClient();
    const { data: existing } = await admin.from("shopify_shops").select("business_id, uninstalled_at, access_token").eq("shop", claims.shop).maybeSingle();
    // Exchange on first visit or after (re)install; skip when we already hold a working token.
    if (!existing || existing.uninstalled_at || !existing.access_token) await exchangeAndStore(claims.shop, bearer);

    if (existing?.business_id && !existing.uninstalled_at) return NextResponse.json({ linked: true, shop: claims.shop });

    const { code, hash } = newLinkCode();
    const { error } = await admin.from("shopify_link_codes").insert({
      code_hash: hash, shop: claims.shop, expires_at: new Date(Date.now() + 15 * 60_000).toISOString(),
    });
    if (error) throw new Error(error.message);
    const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    return NextResponse.json({ linked: false, shop: claims.shop, linkUrl: `${origin}/shopify/link?code=${encodeURIComponent(code)}` });
  } catch (e) {
    return NextResponse.json({ error: "server_error", message: e instanceof Error ? e.message : "error" }, { status: 500 });
  }
}

