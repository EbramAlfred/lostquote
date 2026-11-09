import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business";
import { getLookups } from "@/lib/lookups";
import { money, quoteCode } from "@/lib/format";
import { Empty, PageHeader, StatusBadge, card, field } from "@/components/ui";

export default async function QuotationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q = "", status = "" } = await searchParams;
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const { statuses } = await getLookups();
  const canEdit = business.role !== "viewer";

  let query = supabase
    .from("quotations")
    .select("id, quote_number, title, amount, currency, created_at, status_id, customers(name, company_name)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status) query = query.eq("status_id", status);
  const term = q.replace(/[,()%*\\]/g, " ").trim();
  if (term) {
    const n = Number(term.replace(/^q-?/i, ""));
    query = Number.isInteger(n) && n > 0
      ? query.or(`title.ilike.%${term}%,quote_number.eq.${n}`)
      : query.ilike("title", `%${term}%`);
  }
  const { data: rows, error } = await query;
  const statusById = new Map(statuses.map((s) => [s.id, s]));

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Quotations"
        subtitle="Every offer you have sent, and where it stands."
        action={canEdit ? { href: "/quotations/new", label: "+ New quotation" } : null}
      />

      <form action="/quotations" className="mb-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={q} aria-label="Search quotations" placeholder="Search title or number (Q-0001)" className={`${field} sm:max-w-xs`} />
        <select name="status" defaultValue={status} aria-label="Filter by status" className={`${field} sm:max-w-[13rem]`}>
          <option value="">All statuses</option>
          {statuses.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button className="rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-navy transition hover:bg-slate-50">
          Apply
        </button>
        {(q || status) && (
          <Link href="/quotations" className="flex items-center px-2 text-sm text-link hover:underline">Clear</Link>
        )}
      </form>

      {error && (
        <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">
          Could not load quotations: {error.message}
        </div>
      )}

      {!error && rows && rows.length === 0 && (
        <Empty
          title={q || status ? "No quotations match these filters." : "No quotations yet."}
          text={q || status ? undefined : "Create your first quotation. LostQuote schedules your follow-ups so you never forget one."}
          action={!q && !status && canEdit ? { href: "/quotations/new", label: "+ New quotation" } : null}
        />
      )}

      {rows && rows.length > 0 && (
        <ul className={`${card} divide-y divide-slate-100 overflow-hidden`}>
          {rows.map((r) => {
            const st = statusById.get(r.status_id);
            const cust = r.customers as unknown as { name: string; company_name: string | null } | null;
            return (
              <li key={r.id}>
                <Link href={`/quotations/${r.id}`} className="flex flex-wrap items-center gap-x-6 gap-y-1 px-4 py-3 transition-colors hover:bg-slate-50">
                  <span className="w-16 text-xs font-medium text-muted">{quoteCode(r.quote_number)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-navy">{r.title}</p>
                    <p className="truncate text-sm text-muted">{cust?.name}{cust?.company_name ? ` · ${cust.company_name}` : ""}</p>
                  </div>
                  <span className="font-medium text-navy sm:w-32 sm:text-end">{money(Number(r.amount), r.currency)}</span>
                  {st && <StatusBadge name={st.name} color={st.color} />}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
