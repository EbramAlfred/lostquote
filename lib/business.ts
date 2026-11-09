import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Role = "owner" | "admin" | "member" | "viewer";

export type CurrentBusiness = {
  id: string;
  name: string;
  currency: string;
  role: Role;
  userId: string;
};

// The signed-in user's business (first membership). Redirects if not signed in / not onboarded.
export const getCurrentBusiness = cache(async (): Promise<CurrentBusiness> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("business_members")
    .select("role, businesses(id, name, default_currency)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  const b = data?.businesses as unknown as { id: string; name: string; default_currency: string } | null;
  if (!data || !b) redirect("/onboarding");

  return { id: b.id, name: b.name, currency: b.default_currency, role: data.role as Role, userId: user.id };
});
