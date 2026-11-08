import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/SignOutButton";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("business_members")
    .select("role, businesses(name)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) redirect("/onboarding");

  const business = membership.businesses as unknown as { name: string } | null;

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex items-center justify-between bg-navy px-4 py-3 text-white md:w-60 md:flex-col md:items-stretch md:justify-start md:gap-8 md:py-6">
        <div>
          <Link href="/dashboard" className="text-xl font-bold">
            Lost<span className="text-blue-400">Quote</span>
          </Link>
          <p className="mt-1 hidden text-xs text-slate-300 md:block">{business?.name}</p>
        </div>
        <nav className="hidden md:block">
          <Link href="/dashboard" className="block rounded-lg bg-white/10 px-3 py-2 text-sm font-medium">
            Dashboard
          </Link>
        </nav>
        <div className="md:mt-auto">
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 p-4 sm:p-8">{children}</main>
    </div>
  );
}
