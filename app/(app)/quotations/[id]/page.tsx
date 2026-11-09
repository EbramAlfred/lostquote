import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business";
import { getLookups } from "@/lib/lookups";
import { todayIn, prettyDate, quoteCode, daysBetween } from "@/lib/format";
import { card, PageHeader } from "@/components/ui";
import { QuotationForm } from "@/components/QuotationForm";
import { FollowUpActions } from "@/components/FollowUpActions";
import { PersonalityTips } from "@/components/PersonalityTips";
import type { PersonalityKey } from "@/lib/personality";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function QuotationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const { data: q } = await supabase
    .from("quotations")
    .select("*, customers(id, name, personality)")
    .eq("id", id)
    .maybeSingle();
  if (!q) notFound();

  const [{ statuses, categories, customers }, itemsRes, tasksRes] = await Promise.all([
    getLookups(),
    supabase.from("quotation_items").select("*").eq("quotation_id", id).order("sort_order"),
    supabase.from("follow_up_tasks").select("*").eq("quotation_id", id).order("due_date"),
  ]);
  const today = todayIn(business.timezone);
  const cust = q.customers as { id: string; name: string; personality: PersonalityKey | null } | null;
  const tasks = tasksRes.data ?? [];
  const canEdit = business.role !== "viewer";

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader title={`${quoteCode(q.quote_number)} · ${q.title}`} subtitle={cust ? `For ${cust.name}` : undefined} />

      <section className={`${card} p-5 sm:p-6`}>
        <h2 className="font-semibold text-navy">Follow-ups</h2>
        {tasks.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            No follow-ups yet. They are scheduled automatically when the status is set to an open one (like Sent).
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {tasks.map((t) => {
              const late = t.state === "pending" && t.due_date < today;
              const diff = daysBetween(today, t.due_date);
              return (
                <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-medium text-navy">{t.step_label ?? "Follow-up"}</p>
                    <p className="text-sm text-muted">
                      {t.state === "completed" ? `Done${t.channel ? ` via ${t.channel}` : ""}` :
                       t.state === "skipped" ? "Skipped" :
                       late ? <span className="font-medium text-danger">Overdue by {-diff} day{-diff === 1 ? "" : "s"} · was due {prettyDate(t.due_date)}</span> :
                       diff === 0 ? <span className="font-medium text-warning">Due today</span> :
                       `Due ${prettyDate(t.due_date)} (in ${diff} day${diff === 1 ? "" : "s"})`}
                    </p>
                    {t.customer_response && <p className="mt-1 text-sm text-[#4a4a4a]">Customer said: {t.customer_response}</p>}
                    {t.outcome && <p className="text-sm text-[#4a4a4a]">Result: {t.outcome}</p>}
                  </div>
                  <FollowUpActions task={t} userId={business.userId} canEdit={canEdit} />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {cust?.personality ? (
        <PersonalityTips type={cust.personality} customerName={cust.name} />
      ) : (
        cust && (
          <div className={`${card} p-5 text-sm`}>
            <p className="font-medium text-navy">Get tips for talking to {cust.name}</p>
            <p className="mt-1 text-muted">
              Choose their communication style and see how to word this quotation and your follow-ups.{" "}
              <Link href={`/customers/${cust.id}`} className="text-link hover:underline">Set communication style</Link>
            </p>
          </div>
        )
      )}

      <QuotationForm
        businessId={business.id}
        userId={business.userId}
        customers={customers}
        statuses={statuses}
        categories={categories}
        today={today}
        followupDays={business.followupDays}
        canEdit={canEdit}
        canDelete={business.role === "owner" || business.role === "admin"}
        initial={{
          id: q.id,
          customer_id: q.customer_id,
          category_id: q.category_id ?? "",
          status_id: q.status_id,
          title: q.title,
          description: q.description ?? "",
          amount: String(q.amount ?? ""),
          currency: q.currency,
          collected_amount: q.collected_amount != null ? String(q.collected_amount) : "",
          expected_response_at: q.expected_response_at ?? "",
          internal_notes: q.internal_notes ?? "",
          items: (itemsRes.data ?? []).map((i, idx) => ({
            key: "e" + idx,
            description: i.description,
            quantity: String(i.quantity),
            unit_price: String(i.unit_price),
          })),
        }}
      />
    </div>
  );
}
