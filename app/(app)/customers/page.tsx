import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business";
import { PERSONALITY_BY_KEY, type PersonalityKey } from "@/lib/personality";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const canEdit = business.role !== "viewer";

  // Strip characters that have special meaning inside a PostgREST filter.
  const term = q.replace(/[,()%*\\]/g, " ").trim();

  let query = supabase
    .from("customers")
    .select("id, type, name, company_name, email, phone, country, personality")
    .order("created_at", { ascending: false })
    .limit(200);
  if (term) {
    query = query.or(`name.ilike.%${term}%,company_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`);
  }
  const { data: customers, error } = await query;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-navy">Customers</h1>
        {canEdit && (
          <Link href="/customers/new"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">
            + Add customer
          </Link>
        )}
      </div>

      <form className="mt-4 flex gap-2" action="/customers">
        <input name="q" defaultValue={q} placeholder="Search name, company, email or phone"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        <button className="rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-navy hover:bg-slate-50">
          Search
        </button>
        {q && (
          <Link href="/customers" className="flex items-center px-2 text-sm text-primary hover:underline">Clear</Link>
        )}
      </form>

      {error && (
        <div role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">
          Could not load customers: {error.message}
        </div>
      )}

      {!error && customers && customers.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-medium text-navy">
            {term ? "No customers match your search." : "No customers yet."}
          </p>
          {!term && canEdit && (
            <>
              <p className="mt-1 text-sm text-muted">Add your first customer to start tracking quotations.</p>
              <Link href="/customers/new"
                className="mt-4 inline-block rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">
                + Add customer
              </Link>
            </>
          )}
        </div>
      )}

      {customers && customers.length > 0 && (
        <ul className="mt-6 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {customers.map((c) => (
            <li key={c.id}>
              <Link href={`/customers/${c.id}`} className="flex flex-wrap items-center gap-x-6 gap-y-1 px-4 py-3 hover:bg-slate-50">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-navy">{c.name}</p>
                  {c.company_name && <p className="truncate text-sm text-muted">{c.company_name}</p>}
                </div>
                <div className="min-w-0 text-sm text-muted sm:w-56">
                  <p className="truncate">{c.email ?? "—"}</p>
                  <p className="truncate">{c.phone ?? ""}</p>
                </div>
                {c.personality && PERSONALITY_BY_KEY[c.personality as PersonalityKey] && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PERSONALITY_BY_KEY[c.personality as PersonalityKey].color }} />
                    {PERSONALITY_BY_KEY[c.personality as PersonalityKey].name}
                  </span>
                )}
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  c.type === "company" ? "bg-blue-50 text-primary" : "bg-slate-100 text-muted"
                }`}>
                  {c.type === "company" ? "Company" : "Individual"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
