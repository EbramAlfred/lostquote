import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business";
import { getLookups } from "@/lib/lookups";
import { computeDashboard, pctChange, type QuoteRow } from "@/lib/analytics";
import { addDays, money, prettyDate, todayIn } from "@/lib/format";
import { card } from "@/components/ui";
import { TrendChart } from "@/components/TrendChart";

const RANGES = [
  { days: 7, label: "Last 7 days" },
  { days: 30, label: "Last 30 days" },
  { days: 90, label: "Last 90 days" },
];

function Change({ cur, prev, invert = false }: { cur: number; prev: number; invert?: boolean }) {
  const p = pctChange(cur, prev);
  if (p === null) return <span className="text-sm font-medium text-muted">New</span>;
  if (p === 0) return <span className="text-sm font-medium text-muted">0%</span>;
  const good = invert ? p < 0 : p > 0;
  return (
    <span className={`text-sm font-semibold ${good ? "text-success" : "text-danger"}`}>
      {p > 0 ? "↑" : "↓"} {Math.abs(p) >= 1000 ? Math.round(Math.abs(p)).toLocaleString("en-US") : Math.abs(p).toFixed(Math.abs(p) < 10 ? 1 : 0)}%
    </span>
  );
}

function Row({ label, value, change }: { label: string; value: string; change?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-t border-slate-100 py-2 text-sm first:border-t-0">
      <span className="text-[#4a4a4a]">{label}</span>
      <span className="flex items-center gap-4">
        <span className="font-medium text-navy">{value}</span>
        {change && <span className="w-14 text-end">{change}</span>}
      </span>
    </div>
  );
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string; currency?: string }>;
}) {
  const sp = await searchParams;
  const days = RANGES.some((r) => String(r.days) === sp.days) ? Number(sp.days) : 30;

  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const { statuses } = await getLookups();
  const kindById = new Map(statuses.map((s) => [s.id, s.kind]));
  const openIds = statuses.filter((s) => s.kind === "open").map((s) => s.id);

  const today = todayIn(business.timezone);
  const prevStart = addDays(today, -(2 * days - 1));
  // A little slack either side so time-zone edges are never cut off; exact bucketing happens in computeDashboard.
  const sinceISO = new Date(prevStart + "T00:00:00Z").getTime() - 86400000;
  const since = new Date(sinceISO).toISOString();

  const [periodRes, openRes, overdueRes, fuRes] = await Promise.all([
    supabase
      .from("quotations")
      .select("id, amount, collected_amount, currency, created_at, closed_at, status_id")
      .or(`created_at.gte.${since},closed_at.gte.${since}`)
      .limit(10000),
    openIds.length
      ? supabase.from("quotations").select("id, amount, currency").in("status_id", openIds).limit(10000)
      : Promise.resolve({ data: [] as { id: string; amount: number; currency: string }[], error: null }),
    supabase.from("follow_up_tasks").select("quotation_id").eq("state", "pending").lt("due_date", today).limit(10000),
    supabase
      .from("follow_up_tasks")
      .select("state, due_date")
      .gte("due_date", addDays(today, -(days - 1)))
      .lte("due_date", today)
      .limit(10000),
  ]);

  const loadError = periodRes.error || openRes.error || overdueRes.error || fuRes.error;
  const allQuotes = periodRes.data ?? [];
  const allOpen = openRes.data ?? [];

  const currencies = Array.from(new Set([...allQuotes.map((q) => q.currency), ...allOpen.map((q) => q.currency), business.currency])).sort();
  const currency = currencies.includes(sp.currency ?? "") ? (sp.currency as string) : business.currency;
  const otherCurrencyCount = allQuotes.filter((q) => q.currency !== currency).length;

  const quotes: QuoteRow[] = allQuotes
    .filter((q) => q.currency === currency)
    .map((q) => ({
      id: q.id,
      amount: Number(q.amount),
      collected_amount: q.collected_amount == null ? null : Number(q.collected_amount),
      currency: q.currency,
      created_at: q.created_at,
      closed_at: q.closed_at,
      kind: kindById.get(q.status_id) ?? "draft",
    }));

  const d = computeDashboard({
    quotes,
    openQuotes: allOpen.filter((q) => q.currency === currency).map((q) => ({ id: q.id, amount: Number(q.amount) })),
    overdueQuoteIds: new Set((overdueRes.data ?? []).map((t) => t.quotation_id)),
    timezone: business.timezone,
    days,
  });

  const fu = fuRes.data ?? [];
  const fuDone = fu.filter((t) => t.state === "completed").length;
  const fuOverdue = fu.filter((t) => t.state === "pending" && t.due_date < today).length;
  const fuRate = fu.length ? Math.round((fuDone / fu.length) * 100) : null;

  const curLabel = `${prettyDate(d.range.start)} – ${prettyDate(d.range.end)}`;
  const prevLabel = `${prettyDate(d.range.prevStart)} – ${prettyDate(d.range.prevEnd)}`;
  const prevDates = Array.from({ length: days }, (_, i) => addDays(d.range.prevStart, i));
  const href = (nd: number, c: string) => `/analytics?days=${nd}&currency=${c}`;
  const noData = d.created.cur + d.created.prev + d.won.cur + d.openCount === 0;

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-xl font-semibold tracking-tight text-navy sm:text-2xl">Overview dashboard</h1>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-slate-300 bg-white p-0.5 text-sm" role="group" aria-label="Date range">
          {RANGES.map((r) => (
            <Link key={r.days} href={href(r.days, currency)} aria-current={r.days === days}
              className={`rounded-md px-3 py-1.5 font-medium transition ${r.days === days ? "bg-navy text-white" : "text-[#4a4a4a] hover:bg-slate-100"}`}>
              {r.label}
            </Link>
          ))}
        </div>
        {currencies.length > 1 && (
          <div className="flex rounded-lg border border-slate-300 bg-white p-0.5 text-sm" role="group" aria-label="Currency">
            {currencies.map((c) => (
              <Link key={c} href={href(days, c)} aria-current={c === currency}
                className={`rounded-md px-3 py-1.5 font-medium transition ${c === currency ? "bg-navy text-white" : "text-[#4a4a4a] hover:bg-slate-100"}`}>
                {c}
              </Link>
            ))}
          </div>
        )}
        <span className="text-sm text-muted">compared to {prevLabel}</span>
      </div>

      {loadError && (
        <div role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">
          Could not load all the numbers: {loadError.message}
        </div>
      )}
      {otherCurrencyCount > 0 && (
        <p className="mt-3 text-xs text-muted">
          {otherCurrencyCount} quotation{otherCurrencyCount === 1 ? " is" : "s are"} in other currencies and not included. Switch currency above to see them. Currencies are never mixed.
        </p>
      )}
      {noData && !loadError && (
        <div className={`${card} mt-4 border-dashed p-5 text-sm text-[#4a4a4a]`}>
          Nothing to chart yet. <Link href="/quotations/new" className="font-medium text-link hover:underline">Create your first quotation</Link> and this page fills in.
        </div>
      )}

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <section className={`${card} p-5`}>
          <div className="flex items-start justify-between">
            <h2 className="text-sm font-semibold text-navy">Total quoted</h2>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <p className="text-3xl font-semibold tracking-tight text-navy">{money(d.quoted.cur, currency)}</p>
            <Change cur={d.quoted.cur} prev={d.quoted.prev} />
          </div>
          <div className="mt-3">
            <Row label="Quotations created" value={String(d.created.cur)} change={<Change cur={d.created.cur} prev={d.created.prev} />} />
          </div>
          <p className="mb-1 mt-3 text-[11px] font-semibold uppercase tracking-wide text-muted">Quoted per day</p>
          <TrendChart dates={d.dates} prevDates={prevDates} cur={d.quoted.curSeries} prev={d.quoted.prevSeries} kind="money" currency={currency} curLabel={curLabel} prevLabel={prevLabel} />
        </section>

        <section className={`${card} p-5`}>
          <h2 className="text-sm font-semibold text-navy">Revenue won</h2>
          <div className="mt-1 flex items-baseline justify-between">
            <p className="text-3xl font-semibold tracking-tight text-navy">{money(d.won.cur, currency)}</p>
            <Change cur={d.won.cur} prev={d.won.prev} />
          </div>
          <div className="mt-3">
            <Row label="Deals won" value={String(d.conversion.wonN)} />
            <Row label="Estimated value of those deals" value={money(d.won.estimatedCur, currency)} />
          </div>
          <p className="mb-1 mt-3 text-[11px] font-semibold uppercase tracking-wide text-muted">Revenue won per day</p>
          <TrendChart dates={d.dates} prevDates={prevDates} cur={d.won.curSeries} prev={d.won.prevSeries} kind="money" currency={currency} curLabel={curLabel} prevLabel={prevLabel} />
        </section>

        <section className={`${card} p-5`}>
          <h2 className="text-sm font-semibold text-navy">Quotations created</h2>
          <div className="mt-1 flex items-baseline justify-between">
            <p className="text-3xl font-semibold tracking-tight text-navy">{d.created.cur}</p>
            <Change cur={d.created.cur} prev={d.created.prev} />
          </div>
          <p className="mb-1 mt-6 text-[11px] font-semibold uppercase tracking-wide text-muted">Created per day</p>
          <TrendChart dates={d.dates} prevDates={prevDates} cur={d.created.curSeries} prev={d.created.prevSeries} kind="count" currency={currency} curLabel={curLabel} prevLabel={prevLabel} />
        </section>

        <section className={`${card} p-5`}>
          <h2 className="text-sm font-semibold text-navy">Conversion rate</h2>
          <div className="mt-1 flex items-baseline justify-between">
            <p className="text-3xl font-semibold tracking-tight text-navy">
              {d.conversion.cur === null ? "—" : `${d.conversion.cur.toFixed(d.conversion.cur % 1 ? 1 : 0)}%`}
            </p>
            {d.conversion.cur !== null && d.conversion.prev !== null && <Change cur={d.conversion.cur} prev={d.conversion.prev} />}
          </div>
          <p className="mt-1 text-sm text-muted">Won as a share of deals that were won or lost in this period.</p>
          <div className="mt-3">
            <Row label="Won" value={String(d.conversion.wonN)} />
            <Row label="Lost" value={String(d.conversion.lostN)} />
            <Row label="Value lost" value={money(d.lostValue.cur, currency)} change={<Change cur={d.lostValue.cur} prev={d.lostValue.prev} invert />} />
          </div>
        </section>

        <section className={`${card} p-5`}>
          <h2 className="text-sm font-semibold text-navy">Revenue at risk</h2>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-danger">{money(d.atRiskValue, currency)}</p>
          <p className="mt-1 text-sm text-muted">
            Open quotations with an overdue follow-up ({d.atRiskCount}). Follow up now to protect this money.
          </p>
          <div className="mt-3">
            <Row label="All open quotations" value={`${money(d.openValue, currency)} (${d.openCount})`} />
          </div>
          <Link href="/follow-ups?tab=overdue" className="mt-3 inline-block text-sm font-medium text-link hover:underline">
            See overdue follow-ups
          </Link>
        </section>

        <section className={`${card} p-5`}>
          <h2 className="text-sm font-semibold text-navy">Follow-up completion</h2>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-navy">{fuRate === null ? "—" : `${fuRate}%`}</p>
          <p className="mt-1 text-sm text-muted">Follow-ups that came due in this period and were completed.</p>
          <div className="mt-3">
            <Row label="Due in period" value={String(fu.length)} />
            <Row label="Completed" value={String(fuDone)} />
            <Row label="Still overdue" value={String(fuOverdue)} />
          </div>
        </section>
      </div>
    </div>
  );
}
