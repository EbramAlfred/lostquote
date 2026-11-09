import { createClient } from "@/lib/supabase/server";
import type { StatusOption, Option, CustomerOption } from "@/components/QuotationForm";

export async function getLookups() {
  const supabase = await createClient();
  const [s, c, cu] = await Promise.all([
    supabase.from("quotation_statuses").select("id, name, kind, color").order("sort_order"),
    supabase.from("quotation_categories").select("id, name").order("sort_order"),
    supabase.from("customers").select("id, name, company_name").order("name").limit(1000),
  ]);
  return {
    statuses: (s.data ?? []) as StatusOption[],
    categories: (c.data ?? []) as Option[],
    customers: (cu.data ?? []) as CustomerOption[],
  };
}
