import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business";

export default async function DashboardPage() {
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const { count } = await supabase.from("customers").select("id", { count: "exact", head: true });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-xl font-semibold text-navy">Home</h1>
      <p className="mt-1 text-sm text-muted">Welcome back, {business.name}.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/customers" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow">
          <p className="text-sm text-muted">Customers</p>
          <p className="mt-2 text-2xl font-semibold text-navy">{count ?? 0}</p>
        </Link>
        {["Quotations", "Follow-ups due today", "Overdue follow-ups"].map((label) => (
          <div key={label} className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-4">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-2 text-sm font-medium text-muted">Coming soon</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-navy">Get started</h2>
        <ol className="mt-3 space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${(count ?? 0) > 0 ? "bg-success" : "bg-slate-300"}`} />
            <Link href="/customers/new" className="text-link hover:underline">Add your first customer</Link>
          </li>
          <li className="flex items-center gap-2 text-muted">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" /> Create a quotation (next phase)
          </li>
          <li className="flex items-center gap-2 text-muted">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" /> Schedule a follow-up (next phase)
          </li>
        </ol>
      </div>
    </div>
  );
}
