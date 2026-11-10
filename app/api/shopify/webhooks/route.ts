import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidShop, verifyWebhookHmac } from "@/lib/shopify/verify";

// Shopify requires apps to answer these topics. The signature is checked on the RAW body before anything else.
export async function POST(request: NextRequest) {
  const secret = process.env.SHOPIFY_API_SECRET;
  if (!secret) return new NextResponse("not configured", { status: 500 });

  const raw = await request.text();
  if (!verifyWebhookHmac(raw, request.headers.get("x-shopify-hmac-sha256"), secret)) {
    return new NextResponse("invalid signature", { status: 401 });
  }

  const topic = request.headers.get("x-shopify-topic") ?? "";
  const shop = request.headers.get("x-shopify-shop-domain") ?? "";
  if (!isValidShop(shop)) return new NextResponse("bad shop", { status: 400 });
  let body: { customer?: { id?: number | string } } = {};
  try { body = JSON.parse(raw); } catch { /* empty body is fine */ }

  const admin = createAdminClient();
  const { data: row } = await admin.from("shopify_shops").select("business_id").eq("shop", shop).maybeSingle();
  const businessId = row?.business_id ?? null;
  const gid = (id: string | number) => `gid://shopify/Customer/${id}`;
  const blank = { name: "Redacted customer", company_name: null, email: null, phone: null, country: null, notes: null };

  try {
    switch (topic) {
      case "app/uninstalled":
        await admin.from("shopify_shops").update({
          uninstalled_at: new Date().toISOString(), access_token: null, refresh_token: null,
          access_token_expires_at: null, refresh_token_expires_at: null,
        }).eq("shop", shop);
        break;
      case "customers/redact":
        // Anonymize (quotations still reference the customer row, so it can't simply be deleted).
        if (businessId && body.customer?.id) {
          await admin.from("customers").update(blank).eq("business_id", businessId).eq("shopify_customer_id", gid(body.customer.id));
        }
        break;
      case "shop/redact":
        if (businessId) {
          await admin.from("quotations").delete().eq("business_id", businessId).not("shopify_draft_order_id", "is", null);
          await admin.from("customers").update(blank).eq("business_id", businessId).not("shopify_customer_id", "is", null);
        }
        await admin.from("shopify_shops").delete().eq("shop", shop);
        break;
      case "customers/data_request":
        // We only hold what the merchant imported from Shopify; the merchant can export it from their LostQuote account.
        break;
      default:
        return new NextResponse("ignored", { status: 200 });
    }
  } catch {
    return new NextResponse("error", { status: 500 }); // Shopify retries on non-2xx
  }
  return new NextResponse("ok", { status: 200 });
}
