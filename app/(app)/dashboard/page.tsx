import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business";
import { getLookups } from "@/lib/lookups";
import { daysBetween, money, prettyDate, quoteCode, todayIn } from "@/lib/format";
import { card, btnPrimary } from "@/components/ui";

export default async function HomePage() {
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const today = todayIn(business.timezone);
  const { statuses } = await getLookups();
  const openIds = statuses.filter((s) => s.kind === "open").map((s) => s.id);

  const head = (table: string) => supabase.from(table).select("id", { count: "exact", head: true });
  const [customers, quotes, overdue, dueToday, tasks, open] = await Promise.all([
    head("customers"),
    head("quotations"),
    head("follow_up_tasks").eq("state", "pending").lt("due_date", today),
    head("follow_up_tasks").eq("state", "pending").eq("due_date", today),
    supabase
      .from("follow_up_tasks")
      .select("id, due_date, step_label, quotation_id, quotations(quote_number, title), customers(name)")
      .eq("state", "pending")
      .lte("due_date", today)
      .order("due_date")
      .limit(6),
    openIds.length
      ? supabase.from("quotations").select("amount, currency").in("status_id", openIds).limit(10000)
      : Promise.resolve({ data: [] as { amount: number; currency: string }[] }),
  ]);

  const openByCurrency = new Map<string, number>();
  (open.data ?? []).forEach((q) => openByCurrency.set(q.currency, (openByCurrency.get(q.currency) ?? 0) + Number(q.amount)));
  const pipeline = Array.from(openByCurrency.entries());
  const canEdit = business.role !== "viewer";

  const steps = [
    { done: (customers.count ?? 0) > 0, label: "Add your first customer", href: "/customers/new" },
    { done: (quotes.count ?? 0) > 0, label: "Create your first quotation", href: "/quotations/new" },
    { done: (overdue.count ?? 0) + (dueToday.count ?? 0) > 0 || (quotes.count ?? 0) > 0, label: "Get your follow-ups scheduled automatically", href: "/follow-ups" },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-navy sm:text-2xl">Home</h1>
          <p className="mt-0.5 text-sm text-muted">{business.name}</p>
        </div>
        {canEdit && <Link href="/quotations/new" className={btnPrimary}>+ New quotation</Link>}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/follow-ups?tab=overdue" className={`${card} p-4 transition hover:shadow-md`}>
          <p className="text-sm text-muted">Overdue follow-ups</p>
          <p className={`mt-2 text-2xl font-semibold ${(overdue.count ?? 0) > 0 ? "text-danger" : "text-navy"}`}>{overdue.count ?? 0}</p>
        </Link>
        <Link href="/follow-ups?tab=today" className={`${card} p-4 transition hover:shadow-md`}>
          <p className="text-sm text-muted">Due today</p>
          <p className={`mt-2 text-2xl font-semibold ${(dueToday.count ?? 0) > 0 ? "text-warning" : "text-navy"}`}>{dueToday.count ?? 0}</p>
        </Link>
        <Link href="/quotations" className={`${card} p-4 transition hover:shadow-md`}>
          <p className="text-sm text-muted">Open pipeline</p>
          {pipeline.length === 0 ? (
            <p className="mt-2 text-2xl font-semibold text-navy">0</p>
          ) : (
            pipeline.map(([c, v]) => <p key={c} className="mt-2 text-2xl font-semibold text-navy">{money(v, c, true)}</p>)
          )}
        </Link>
        <Link href="/customers" className={`${card} p-4 transition hover:shadow-md`}>
          <p className="text-sm text-muted">Customers</p>
          <p className="mt-2 text-2xl font-semibold text-navy">{customers.count ?? 0}</p>
        </Link>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <section className={`${card} p-5 lg:col-span-2`}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-navy">Follow up today</h2>
            <Link href="/follow-ups" className="text-sm text-link hover:underline">View all</Link>
          </div>
          {(tasks.data ?? []).length === 0 ? (
            <p className="mt-3 text-sm text-muted">Nothing is due. You are all caught up.</p>
          ) : (
            <ul className="mt-2 divide-y divide-slate-100">
              {(tasks.data ?? []).map((t) => {
                const quo = t.quotations as unknown as { quote_number: number; title: string } | null;
                const cu = t.customers as unknown as { name: string } | null;
                const late = daysBetween(today, t.due_date) < 0;
                return (
                  <li key={t.id}>
                    <Link href={`/quotations/${t.quotation_id}`} className="flex items-center justify-between gap-3 py-3 transition hover:opacity-80">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-navy">{cu?.name} · {quo ? `${quoteCode(quo.quote_number)} ${quo.title}` : ""}</span>
                        <span className="block text-xs text-muted">{t.step_label}</span>
                      </span>
                      <span className={`shrink-0 text-xs font-medium ${late ? "text-danger" : "text-warning"}`}>
                        {late ? `Overdue · ${prettyDate(t.due_date)}` : "Today"}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className={`${card} p-5`}>
          <h2 className="font-semibold text-navy">Get started</h2>
          <ul className="mt-3 space-y-2.5 text-sm">
            {steps.map((s) => (
              <li key={s.label} className="flex items-start gap-2.5">
                <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] text-white ${s.done ? "bg-success" : "bg-slate-300"}`}>
                  {s.done ? "✓" : ""}
                </span>
                <Link href={s.href} className={s.done ? "text-muted line-through" : "text-link hover:underline"}>{s.label}</Link>
              </li>
            ))}
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-slate-300" />
              <Link href="/personality" className="text-link hover:underline">Learn how to talk to each type of client</Link>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
