import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashCode } from "@/lib/shopify/verify";

// A signed-in LostQuote user redeems the one-time code to link the Shopify store to their business.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "not_signed_in" }, { status: 401 });

  const { code } = (await request.json().catch(() => ({}))) as { code?: string };
  if (!code || code.length > 200) return NextResponse.json({ error: "bad_code" }, { status: 400 });

  // Only owners and admins may connect a store.
  const { data: m } = await supabase.from("business_members").select("business_id, role").eq("user_id", user.id).in("role", ["owner", "admin"]).limit(1).maybeSingle();
  if (!m) return NextResponse.json({ error: "not_allowed" }, { status: 403 });

  const admin = createAdminClient();
  // Claim the code atomically so it can only be used once.
  const { data: claimed } = await admin.from("shopify_link_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("code_hash", hashCode(code)).is("used_at", null).gt("expires_at", new Date().toISOString())
    .select("shop").maybeSingle();
  if (!claimed) return NextResponse.json({ error: "code_expired" }, { status: 410 });

  const { data: shop } = await admin.from("shopify_shops").select("business_id, uninstalled_at").eq("shop", claimed.shop).maybeSingle();
  if (shop?.business_id && shop.business_id !== m.business_id && !shop.uninstalled_at) {
    return NextResponse.json({ error: "already_linked" }, { status: 409 });
  }
  const { error } = await admin.from("shopify_shops").update({ business_id: m.business_id }).eq("shop", claimed.shop);
  if (error) return NextResponse.json({ error: "server_error" }, { status: 500 });
  return NextResponse.json({ ok: true, shop: claimed.shop });
}
