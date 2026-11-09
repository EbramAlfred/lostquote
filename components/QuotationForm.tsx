"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ErrorBox, labelClass } from "@/components/AuthCard";
import { btnGhost, btnPrimary, card, field } from "@/components/ui";
import { CURRENCIES, addDays, money } from "@/lib/format";

export type Option = { id: string; name: string };
export type StatusOption = Option & { kind: "draft" | "open" | "won" | "lost" | "cancelled"; color: string };
export type CustomerOption = Option & { company_name: string | null };

type Item = { key: string; description: string; quantity: string; unit_price: string };

export type QuotationValues = {
  id?: string;
  customer_id: string;
  category_id: string;
  status_id: string;
  title: string;
  description: string;
  amount: string;
  currency: string;
  collected_amount: string;
  expected_response_at: string;
  internal_notes: string;
  items: Item[];
};

let counter = 0;
export const newItem = (): Item => ({ key: "i" + counter++, description: "", quantity: "1", unit_price: "" });

export function QuotationForm({
  businessId,
  userId,
  customers,
  statuses,
  categories,
  initial,
  today,
  followupDays,
  canEdit,
  canDelete,
}: {
  businessId: string;
  userId: string;
  customers: CustomerOption[];
  statuses: StatusOption[];
  categories: Option[];
  initial: QuotationValues;
  today: string;
  followupDays: number[];
  canEdit: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [v, setV] = useState<QuotationValues>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const isEdit = Boolean(initial.id);

  const set = <K extends keyof QuotationValues>(k: K, val: QuotationValues[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  const kind = statuses.find((s) => s.id === v.status_id)?.kind ?? "draft";
  const usedItems = v.items.filter((i) => i.description.trim());
  const itemsTotal = useMemo(
    () => usedItems.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unit_price) || 0), 0),
    [usedItems]
  );
  const amount = usedItems.length > 0 ? itemsTotal : Number(v.amount) || 0;

  function setItem(key: string, patch: Partial<Item>) {
    set("items", v.items.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!v.customer_id) return setError("Choose a customer.");
    if (!v.title.trim()) return setError("Enter a title for the quotation.");
    if (amount < 0) return setError("The amount cannot be negative.");
    setSaving(true);

    const supabase = createClient();
    const row = {
      customer_id: v.customer_id,
      category_id: v.category_id || null,
      status_id: v.status_id,
      title: v.title.trim(),
      description: v.description.trim() || null,
      amount,
      currency: v.currency,
      collected_amount: kind === "won" && v.collected_amount !== "" ? Number(v.collected_amount) : null,
      expected_response_at: v.expected_response_at || null,
      internal_notes: v.internal_notes.trim() || null,
    };

    let quotationId = initial.id;
    const customerId = v.customer_id;

    if (isEdit) {
      const { error } = await supabase.from("quotations").update(row).eq("id", initial.id!);
      if (error) return fail(error.message);
    } else {
      const { data, error } = await supabase
        .from("quotations")
        .insert({ ...row, business_id: businessId, created_by: userId, assigned_to: userId })
        .select("id")
        .single();
      if (error) return fail(error.message);
      quotationId = data.id;
    }

    // Replace line items.
    if (isEdit) {
      const { error } = await supabase.from("quotation_items").delete().eq("quotation_id", quotationId!);
      if (error) return fail(error.message);
    }
    if (usedItems.length > 0) {
      const { error } = await supabase.from("quotation_items").insert(
        usedItems.map((i, idx) => ({
          business_id: businessId,
          quotation_id: quotationId!,
          description: i.description.trim(),
          quantity: Number(i.quantity) || 1,
          unit_price: Number(i.unit_price) || 0,
          sort_order: idx,
        }))
      );
      if (error) return fail(error.message);
    }

    // Follow-ups: close them when the deal ends, or create the default sequence once it is open.
    if (kind === "won" || kind === "lost" || kind === "cancelled") {
      await supabase
        .from("follow_up_tasks")
        .update({ state: "skipped" })
        .eq("quotation_id", quotationId!)
        .eq("state", "pending");
    } else if (kind === "open") {
      const { count } = await supabase
        .from("follow_up_tasks")
        .select("id", { count: "exact", head: true })
        .eq("quotation_id", quotationId!);
      if ((count ?? 0) === 0) {
        const labels = ["First follow-up", "Second follow-up", "Final follow-up"];
        const { error } = await supabase.from("follow_up_tasks").insert(
          followupDays.map((d, idx) => ({
            business_id: businessId,
            quotation_id: quotationId!,
            customer_id: customerId,
            step_label: labels[idx] ?? `Follow-up ${idx + 1}`,
            due_date: addDays(today, d),
            assigned_to: userId,
            created_by: userId,
          }))
        );
        if (error) return fail(error.message);
      }
    }

    router.push(`/quotations/${quotationId}`);
    router.refresh();

    function fail(message: string) {
      setSaving(false);
      setError(
        message.includes("PLAN_LIMIT_REACHED")
          ? "You have reached this month's quotation limit for your plan. Upgrade your plan to add more."
          : message
      );
    }
  }

  async function onDelete() {
    setSaving(true);
    const { error } = await createClient().from("quotations").delete().eq("id", initial.id!);
    setSaving(false);
    if (error) {
      setConfirming(false);
      return setError(error.message);
    }
    router.push("/quotations");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <ErrorBox message={error} />
      {!canEdit && (
        <div className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-muted">
          You have view-only access, so you cannot change quotations.
        </div>
      )}
      <fieldset disabled={!canEdit || saving} className="space-y-5">
        <div className={`${card} space-y-4 p-5 sm:p-6`}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="title" className={labelClass}>Title *</label>
              <input id="title" required maxLength={200} className={field} value={v.title}
                placeholder="e.g. Website redesign for Acme" onChange={(e) => set("title", e.target.value)} />
            </div>
            <div>
              <label htmlFor="customer" className={labelClass}>Customer *</label>
              <select id="customer" className={field} value={v.customer_id} onChange={(e) => set("customer_id", e.target.value)}>
                <option value="">Choose a customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.company_name ? ` (${c.company_name})` : ""}
                  </option>
                ))}
              </select>
              {customers.length === 0 && (
                <p className="mt-1 text-xs text-muted">Add a customer first, then come back.</p>
              )}
            </div>
            <div>
              <label htmlFor="category" className={labelClass}>Type</label>
              <select id="category" className={field} value={v.category_id} onChange={(e) => set("category_id", e.target.value)}>
                <option value="">No type</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="status" className={labelClass}>Status</label>
              <select id="status" className={field} value={v.status_id} onChange={(e) => set("status_id", e.target.value)}>
                {statuses.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {!isEdit && kind === "open" && (
                <p className="mt-1 text-xs text-muted">
                  Follow-ups will be scheduled for day {followupDays.join(", ")} automatically.
                </p>
              )}
            </div>
            <div>
              <label htmlFor="due" className={labelClass}>Expected response date</label>
              <input id="due" type="date" className={field} value={v.expected_response_at}
                onChange={(e) => set("expected_response_at", e.target.value)} />
            </div>
          </div>
          <div>
            <label htmlFor="desc" className={labelClass}>Description</label>
            <textarea id="desc" rows={3} className={field} value={v.description}
              onChange={(e) => set("description", e.target.value)} />
          </div>
        </div>

        <div className={`${card} space-y-4 p-5 sm:p-6`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-navy">Products or services</h2>
            <button type="button" className={btnGhost} onClick={() => set("items", [...v.items, newItem()])}>
              Add a line
            </button>
          </div>
          {v.items.length === 0 && (
            <p className="text-sm text-muted">
              Optional. Add lines to calculate the total automatically, or type the amount below.
            </p>
          )}
          {v.items.map((i) => (
            <div key={i.key} className="grid grid-cols-12 gap-2">
              <input aria-label="Description" placeholder="Description" className={`${field} col-span-12 sm:col-span-6`}
                value={i.description} onChange={(e) => setItem(i.key, { description: e.target.value })} />
              <input aria-label="Quantity" type="number" min="0" step="any" placeholder="Qty" className={`${field} col-span-4 sm:col-span-2`}
                value={i.quantity} onChange={(e) => setItem(i.key, { quantity: e.target.value })} />
              <input aria-label="Unit price" type="number" min="0" step="any" placeholder="Unit price" className={`${field} col-span-6 sm:col-span-3`}
                value={i.unit_price} onChange={(e) => setItem(i.key, { unit_price: e.target.value })} />
              <button type="button" aria-label="Remove line"
                className="col-span-2 rounded-lg text-lg text-muted transition hover:bg-slate-100 sm:col-span-1"
                onClick={() => set("items", v.items.filter((x) => x.key !== i.key))}>
                ×
              </button>
            </div>
          ))}

          <div className="grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3">
            <div>
              <label htmlFor="currency" className={labelClass}>Currency</label>
              <select id="currency" className={field} value={v.currency} onChange={(e) => set("currency", e.target.value)}>
                {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="amount" className={labelClass}>
                {usedItems.length > 0 ? "Total (from lines)" : "Quotation amount"}
              </label>
              <input id="amount" type="number" min="0" step="any" className={field}
                disabled={usedItems.length > 0}
                value={usedItems.length > 0 ? itemsTotal.toFixed(2) : v.amount}
                onChange={(e) => set("amount", e.target.value)} />
            </div>
            {kind === "won" && (
              <div>
                <label htmlFor="collected" className={labelClass}>Amount actually collected</label>
                <input id="collected" type="number" min="0" step="any" className={field}
                  placeholder={String(amount)} value={v.collected_amount}
                  onChange={(e) => set("collected_amount", e.target.value)} />
              </div>
            )}
          </div>
          <p className="text-sm text-muted">
            Estimated value: <span className="font-medium text-navy">{money(amount, v.currency)}</span>
          </p>
        </div>

        <div className={`${card} p-5 sm:p-6`}>
          <label htmlFor="notes" className={labelClass}>Internal notes (only your team sees these)</label>
          <textarea id="notes" rows={3} className={field} value={v.internal_notes}
            onChange={(e) => set("internal_notes", e.target.value)} />
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        {canEdit && (
          <button type="submit" disabled={saving} className={btnPrimary}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create quotation"}
          </button>
        )}
        <button type="button" onClick={() => router.push("/quotations")} className={btnGhost}>
          {canEdit ? "Cancel" : "Back"}
        </button>
        {isEdit && canDelete && (
          <button type="button" onClick={() => setConfirming(true)}
            className="ms-auto rounded-lg px-4 py-2 text-sm font-medium text-danger transition hover:bg-red-50">
            Delete quotation
          </button>
        )}
      </div>

      {confirming && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-navy">Delete this quotation?</h2>
            <p className="mt-2 text-sm text-muted">
              Its lines and follow-ups will be removed too. This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setConfirming(false)} className={btnGhost}>Keep quotation</button>
              <button type="button" onClick={onDelete} disabled={saving}
                className="rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {saving ? "Deleting…" : "Delete quotation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
