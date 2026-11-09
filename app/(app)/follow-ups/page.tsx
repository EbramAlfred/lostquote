import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business";
import { daysBetween, money, prettyDate, quoteCode, todayIn } from "@/lib/format";
import { Empty, PageHeader, card } from "@/components/ui";
import { FollowUpActions } from "@/components/FollowUpActions";
import { PERSONALITY_BY_KEY, loc, type PersonalityKey } from "@/lib/personality";
import { getLang } from "@/lib/lang";

const TABS = [
  { key: "overdue", label: "Overdue" },
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Done" },
] as const;

export default async function FollowUpsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab: rawTab } = await searchParams;
  const tab = TABS.some((t) => t.key === rawTab) ? (rawTab as (typeof TABS)[number]["key"]) : "overdue";
  const lang = await getLang();
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const today = todayIn(business.timezone);

  const base = () => supabase.from("follow_up_tasks").select("id", { count: "exact", head: true });
  const [o, t, u, c] = await Promise.all([
    base().eq("state", "pending").lt("due_date", today),
    base().eq("state", "pending").eq("due_date", today),
    base().eq("state", "pending").gt("due_date", today),
    base().eq("state", "completed"),
  ]);
  const counts = { overdue: o.count ?? 0, today: t.count ?? 0, upcoming: u.count ?? 0, completed: c.count ?? 0 };

  let q = supabase
    .from("follow_up_tasks")
    .select(
      "id, business_id, due_date, state, step_label, channel, customer_response, outcome, completed_at, quotation_id, quotations(quote_number, title, amount, currency), customers(id, name, personality)"
    )
    .limit(200);
  if (tab === "overdue") q = q.eq("state", "pending").lt("due_date", today).order("due_date");
  else if (tab === "today") q = q.eq("state", "pending").eq("due_date", today);
  else if (tab === "upcoming") q = q.eq("state", "pending").gt("due_date", today).order("due_date");
  else q = q.eq("state", "completed").order("completed_at", { ascending: false });
  const { data: tasks, error } = await q;
  const canEdit = business.role !== "viewer";

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Follow-ups" subtitle="The conversations that turn quotations into sales." />

      <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl bg-black/[.05] p-1" role="tablist">
        {TABS.map((x) => (
          <Link
            key={x.key}
            href={`/follow-ups?tab=${x.key}`}
            role="tab"
            aria-selected={tab === x.key}
            className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-center text-sm font-medium transition ${
              tab === x.key ? "bg-white text-navy shadow-sm" : "text-muted hover:text-navy"
            }`}
          >
            {x.label}
            <span className={`ms-1.5 rounded-full px-1.5 text-xs ${x.key === "overdue" && counts.overdue > 0 ? "bg-danger text-white" : "bg-black/10"}`}>
              {counts[x.key]}
            </span>
          </Link>
        ))}
      </div>

      {error && <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">Could not load follow-ups: {error.message}</div>}

      {!error && tasks && tasks.length === 0 && (
        <Empty
          title={
            tab === "overdue" ? "Nothing overdue. Nice work." :
            tab === "today" ? "No follow-ups due today." :
            tab === "upcoming" ? "No upcoming follow-ups." : "No completed follow-ups yet."
          }
          text={tab === "upcoming" ? "Create a quotation with an open status and its follow-ups appear here." : undefined}
          action={tab === "upcoming" && canEdit ? { href: "/quotations/new", label: "+ New quotation" } : null}
        />
      )}

      <ul className="space-y-3">
        {tasks?.map((tk) => {
          const quo = tk.quotations as unknown as { quote_number: number; title: string; amount: number; currency: string } | null;
          const cu = tk.customers as unknown as { id: string; name: string; personality: PersonalityKey | null } | null;
          const diff = daysBetween(today, tk.due_date);
          const p = cu?.personality ? loc(PERSONALITY_BY_KEY[cu.personality], lang) : null;
          return (
            <li key={tk.id} className={`${card} p-4`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/quotations/${tk.quotation_id}`} className="font-medium text-navy hover:underline">
                    {quo ? `${quoteCode(quo.quote_number)} · ${quo.title}` : "Quotation"}
                  </Link>
                  <p className="text-sm text-muted">
                    {cu?.name}
                    {quo ? ` · ${money(Number(quo.amount), quo.currency)}` : ""}
                    {tk.step_label ? ` · ${tk.step_label}` : ""}
                  </p>
                  <p className="mt-1 text-sm">
                    {tk.state === "completed" ? (
                      <span className="text-success">Done{tk.channel ? ` via ${tk.channel}` : ""}</span>
                    ) : diff < 0 ? (
                      <span className="font-medium text-danger">Overdue by {-diff} day{-diff === 1 ? "" : "s"} · due {prettyDate(tk.due_date)}</span>
                    ) : diff === 0 ? (
                      <span className="font-medium text-warning">Due today</span>
                    ) : (
                      <span className="text-muted">Due {prettyDate(tk.due_date)} (in {diff} day{diff === 1 ? "" : "s"})</span>
                    )}
                  </p>
                  {tk.customer_response && <p className="mt-1 text-sm text-[#4a4a4a]">Customer said: {tk.customer_response}</p>}
                  {tk.outcome && <p className="text-sm text-[#4a4a4a]">Result: {tk.outcome}</p>}
                </div>
                <FollowUpActions task={tk} userId={business.userId} canEdit={canEdit} />
              </div>
              {p && tk.state === "pending" && (
                <p className="mt-3 rounded-lg px-3 py-2 text-sm text-[#4a4a4a]" style={{ backgroundColor: p.tint }}>
                  <span className="font-medium text-navy">{lang === "ar" ? `${cu?.name}: نمط ${p.name}` : `${cu?.name} is ${p.name}`}: </span>
                  {p.followUp}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
