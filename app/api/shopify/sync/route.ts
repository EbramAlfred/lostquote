import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncShop } from "@/lib/shopify/sync";

export const maxDuration = 60;

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "not_signed_in" }, { status: 401 });

  const { data: m } = await supabase.from("business_members").select("business_id, role").eq("user_id", user.id).in("role", ["owner", "admin", "member"]).limit(1).maybeSingle();
  if (!m) return NextResponse.json({ error: "not_allowed" }, { status: 403 });

  const { data: conn } = await supabase.rpc("my_shopify_connection");
  const shop = Array.isArray(conn) ? conn[0] : conn;
  if (!shop?.shop || shop.uninstalled_at) return NextResponse.json({ error: "not_connected" }, { status: 400 });

  try {
    const result = await syncShop({ supabase, shop: shop.shop, businessId: m.business_id, userId: user.id });
    return NextResponse.json({ ok: true, result });
  } catch (e) {
    return NextResponse.json({ error: "sync_failed", message: e instanceof Error ? e.message : "error" }, { status: 502 });
  }
}
