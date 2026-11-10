import type { SupabaseClient } from "@supabase/supabase-js";
import { getAccessToken, shopifyGraphql } from "@/lib/shopify/admin";
import { createAdminClient as createAdmin } from "@/lib/supabase/admin";

const PAGE = 50;
const MAX_PAGES = 5; // up to 250 of each per sync; keeps the request short

const CUSTOMERS_Q = `query($after: String) {
  customers(first: ${PAGE}, after: $after, sortKey: UPDATED_AT, reverse: true) {
    pageInfo { hasNextPage endCursor }
    nodes { id firstName lastName email phone defaultAddress { company country } }
  }
}`;

const DRAFTS_Q = `query($after: String) {
  draftOrders(first: ${PAGE}, after: $after, sortKey: UPDATED_AT, reverse: true) {
    pageInfo { hasNextPage endCursor }
    nodes {
      id name status email createdAt note2
      totalPriceSet { shopMoney { amount currencyCode } }
      customer { id }
      lineItems(first: 20) { nodes { title quantity originalUnitPriceSet { shopMoney { amount } } } }
    }
  }
}`;

type Page<T> = { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: T[] };
type SCustomer = {
  id: string; firstName: string | null; lastName: string | null; email: string | null; phone: string | null;
  defaultAddress: { company: string | null; country: string | null } | null;
};
type SDraft = {
  id: string; name: string; status: "OPEN" | "INVOICE_SENT" | "COMPLETED"; email: string | null; createdAt: string; note2: string | null;
  totalPriceSet: { shopMoney: { amount: string; currencyCode: string } };
  customer: { id: string } | null;
  lineItems: { nodes: { title: string; quantity: number; originalUnitPriceSet: { shopMoney: { amount: string } } }[] };
};

export type SyncResult = {
  customersCreated: number; customersUpdated: number;
  quotesCreated: number; quotesUpdated: number;
  skippedNoCustomer: number; failed: number; firstError: string | null; truncated: boolean;
};

async function fetchAll<T>(shop: string, token: string, query: string, key: "customers" | "draftOrders") {
  const out: T[] = [];
  let after: string | null = null;
  let truncated = false;
  for (let i = 0; i < MAX_PAGES; i++) {
    const data: Record<string, Page<T>> = await shopifyGraphql(shop, token, query, { after });
    const page = data[key];
    out.push(...page.nodes);
    if (!page.pageInfo.hasNextPage) return { nodes: out, truncated };
    after = page.pageInfo.endCursor;
    if (i === MAX_PAGES - 1) truncated = true;
  }
  return { nodes: out, truncated };
}

// Imports Shopify customers and draft orders into one LostQuote business.
// Uses the signed-in user's own database session, so Row Level Security and the plan limit still apply.
export async function syncShop(opts: { supabase: SupabaseClient; shop: string; businessId: string; userId: string }): Promise<SyncResult> {
  const { supabase, shop, businessId, userId } = opts;
  const token = await getAccessToken(shop);
  const r: SyncResult = { customersCreated: 0, customersUpdated: 0, quotesCreated: 0, quotesUpdated: 0, skippedNoCustomer: 0, failed: 0, firstError: null, truncated: false };
  const fail = (msg: string) => { r.failed++; r.firstError ??= msg; };

  const [{ nodes: customers, truncated: t1 }, { nodes: drafts, truncated: t2 }] = await Promise.all([
    fetchAll<SCustomer>(shop, token, CUSTOMERS_Q, "customers"),
    fetchAll<SDraft>(shop, token, DRAFTS_Q, "draftOrders"),
  ]);
  r.truncated = t1 || t2;

  // existing imports
  const { data: existingC } = await supabase.from("customers").select("id, shopify_customer_id").eq("business_id", businessId).not("shopify_customer_id", "is", null);
  const custMap = new Map((existingC ?? []).map((c) => [c.shopify_customer_id as string, c.id as string]));

  for (const c of customers) {
    const name = [c.firstName, c.lastName].filter(Boolean).join(" ").trim() || c.email || "Shopify customer";
    const row = {
      name: name.slice(0, 160),
      company_name: c.defaultAddress?.company || null,
      email: c.email || null,
      phone: c.phone || null,
      country: c.defaultAddress?.country || null,
      type: c.defaultAddress?.company ? "company" : "individual",
    };
    const have = custMap.get(c.id);
    if (have) {
      const { error } = await supabase.from("customers").update(row).eq("id", have);
      if (error) fail(error.message); else r.customersUpdated++;
    } else {
      const { data, error } = await supabase.from("customers")
        .insert({ ...row, business_id: businessId, created_by: userId, shopify_customer_id: c.id, notes: "Imported from Shopify" })
        .select("id").single();
      if (error || !data) fail(error?.message ?? "insert failed");
      else { custMap.set(c.id, data.id); r.customersCreated++; }
    }
  }

  // statuses by kind (names are user-editable, kind is not)
  const { data: statuses } = await supabase.from("quotation_statuses").select("id, kind, sort_order").eq("business_id", businessId).order("sort_order");
  const byKind = (k: string) => statuses?.find((s) => s.kind === k)?.id as string | undefined;
  const statusFor = (s: SDraft["status"]) => (s === "COMPLETED" ? byKind("won") : s === "INVOICE_SENT" ? byKind("open") : byKind("draft")) ?? byKind("draft");

  const { data: existingQ } = await supabase.from("quotations").select("id, shopify_draft_order_id").eq("business_id", businessId).not("shopify_draft_order_id", "is", null);
  const quoteMap = new Map((existingQ ?? []).map((q) => [q.shopify_draft_order_id as string, q.id as string]));

  for (const d of drafts) {
    const customerId = d.customer ? custMap.get(d.customer.id) : undefined;
    const statusId = statusFor(d.status);
    if (!statusId) { fail("No matching status found"); continue; }
    const have = quoteMap.get(d.id);
    const money = d.totalPriceSet.shopMoney;
    const items = d.lineItems.nodes.map((li) => `${li.quantity} × ${li.title}`).join("\n");
    const base = {
      title: `Shopify draft order ${d.name}`.slice(0, 200),
      description: [items, d.note2].filter(Boolean).join("\n\n") || null,
      amount: Number(money.amount) || 0,
      currency: money.currencyCode,
      status_id: statusId,
    };
    if (have) {
      const { error } = await supabase.from("quotations").update(base).eq("id", have);
      if (error) fail(error.message); else r.quotesUpdated++;
      continue;
    }
    if (!customerId) { r.skippedNoCustomer++; continue; }
    const { error } = await supabase.from("quotations").insert({
      ...base, business_id: businessId, customer_id: customerId, created_by: userId, assigned_to: userId,
      shopify_draft_order_id: d.id,
    });
    if (error) fail(error.message.startsWith("PLAN_LIMIT") ? "Your plan's monthly quotation limit was reached. Upgrade to import more." : error.message);
    else r.quotesCreated++;
  }

  await createAdmin().from("shopify_shops").update({ last_synced_at: new Date().toISOString() }).eq("shop", shop);
  return r;
}
