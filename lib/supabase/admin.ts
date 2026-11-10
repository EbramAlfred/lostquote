import { createClient } from "@supabase/supabase-js";

// Server-only client with the service-role key. It bypasses Row Level Security,
// so it is used ONLY for the Shopify tables that no signed-in user may touch.
// Never import this file from a component that runs in the browser.
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
