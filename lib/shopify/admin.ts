import { createAdminClient } from "@/lib/supabase/admin";
import { shopifyEnv } from "@/lib/shopify/verify";

export const API_VERSION = process.env.SHOPIFY_API_VERSION || "2026-04";

type TokenResponse = {
  access_token: string;
  scope?: string;
  expires_in?: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
};

async function tokenRequest(shop: string, params: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams(params),
  });
  if (!res.ok) throw new Error(`Shopify token request failed (${res.status})`);
  return res.json();
}

const plus = (seconds?: number) => (seconds ? new Date(Date.now() + seconds * 1000).toISOString() : null);

function saveRow(t: TokenResponse) {
  return {
    access_token: t.access_token,
    access_token_expires_at: plus(t.expires_in),
    refresh_token: t.refresh_token ?? null,
    refresh_token_expires_at: plus(t.refresh_token_expires_in),
    scope: t.scope ?? null,
    uninstalled_at: null,
  };
}

// Trades the ID token from the embedded page for an expiring offline access token and stores it.
export async function exchangeAndStore(shop: string, idToken: string) {
  const { clientId, clientSecret } = shopifyEnv();
  const t = await tokenRequest(shop, {
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
    subject_token: idToken,
    subject_token_type: "urn:ietf:params:oauth:token-type:id_token",
    requested_token_type: "urn:shopify:params:oauth:token-type:offline-access-token",
    expiring: "1",
  });
  const admin = createAdminClient();
  const { error } = await admin.from("shopify_shops").upsert({ shop, ...saveRow(t) }, { onConflict: "shop" });
  if (error) throw new Error(error.message);
}

// Returns a usable access token, refreshing it first if it expires within 60 seconds.
export async function getAccessToken(shop: string): Promise<string> {
  const admin = createAdminClient();
  const { data: row } = await admin
    .from("shopify_shops")
    .select("access_token, access_token_expires_at, refresh_token, refresh_token_expires_at, uninstalled_at")
    .eq("shop", shop)
    .maybeSingle();
  if (!row || row.uninstalled_at || !row.access_token) throw new Error("Store is not connected. Open LostQuote from Shopify admin to reconnect.");

  const exp = row.access_token_expires_at ? Date.parse(row.access_token_expires_at) : Infinity;
  if (exp - Date.now() > 60_000) return row.access_token;

  const refreshExp = row.refresh_token_expires_at ? Date.parse(row.refresh_token_expires_at) : 0;
  if (!row.refresh_token || refreshExp <= Date.now()) {
    throw new Error("Shopify access expired. Open LostQuote from Shopify admin to reconnect.");
  }
  const { clientId, clientSecret } = shopifyEnv();
  const t = await tokenRequest(shop, {
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: row.refresh_token,
  });
  await admin.from("shopify_shops").update(saveRow(t)).eq("shop", shop);
  return t.access_token;
}

export async function shopifyGraphql<T>(shop: string, token: string, query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(`https://${shop}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Shopify API error (${res.status})`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(`Shopify: ${json.errors[0].message}`);
  return json.data as T;
}
