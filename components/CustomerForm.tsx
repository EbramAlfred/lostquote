"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ErrorBox, labelClass } from "@/components/AuthCard";
import { btnGhost, btnPrimary, card, field } from "@/components/ui";
import { PERSONALITIES, PERSONALITY_BY_KEY, type PersonalityKey } from "@/lib/personality";
import { PersonalityTips } from "@/components/PersonalityTips";
import { PersonalityQuiz } from "@/components/PersonalityQuiz";

export type CustomerValues = {
  id?: string;
  type: "individual" | "company";
  name: string;
  company_name: string;
  email: string;
  phone: string;
  country: string;
  notes: string;
  personality: PersonalityKey | "";
};

export const EMPTY_CUSTOMER: CustomerValues = {
  type: "individual",
  name: "",
  company_name: "",
  email: "",
  phone: "",
  country: "",
  notes: "",
  personality: "",
};

export function CustomerForm({
  businessId,
  userId,
  initial,
  canEdit,
  canDelete,
}: {
  businessId: string;
  userId: string;
  initial: CustomerValues;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [v, setV] = useState<CustomerValues>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [quiz, setQuiz] = useState(false);
  const isEdit = Boolean(initial.id);

  const set = <K extends keyof CustomerValues>(k: K, val: CustomerValues[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!v.name.trim()) {
      setError("Enter the customer's name.");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const row = {
      type: v.type,
      name: v.name.trim(),
      company_name: v.company_name.trim() || null,
      email: v.email.trim() || null,
      phone: v.phone.trim() || null,
      country: v.country.trim() || null,
      notes: v.notes.trim() || null,
      personality: v.personality || null,
    };
    const { error } = isEdit
      ? await supabase.from("customers").update(row).eq("id", initial.id!)
      : await supabase.from("customers").insert({ ...row, business_id: businessId, created_by: userId });
    setSaving(false);
    if (error) {
      setError(
        error.message.includes("customers_email_check")
          ? "That email address is not valid. Check it and try again."
          : error.message
      );
      return;
    }
    router.push("/customers");
    router.refresh();
  }

  async function onDelete() {
    setError(null);
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("customers").delete().eq("id", initial.id!);
    setDeleting(false);
    if (error) {
      setConfirming(false);
      setError(
        error.code === "23503"
          ? "This customer still has quotations. Delete those quotations first, then delete the customer."
          : error.message
      );
      return;
    }
    router.push("/customers");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className={`${card} space-y-4 p-5 sm:p-6`}>
        <ErrorBox message={error} />
        {!canEdit && (
          <div className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-muted">
            You have view-only access, so you cannot change customers.
          </div>
        )}
        <fieldset disabled={!canEdit || saving} className="space-y-4">
          <div>
            <span className={labelClass}>Customer type</span>
            <div className="flex gap-2">
              {(["individual", "company"] as const).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => set("type", t)}
                  aria-pressed={v.type === t}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    v.type === t ? "border-navy bg-slate-50 text-navy" : "border-slate-300 text-muted hover:border-slate-400"
                  }`}
                >
                  {t === "individual" ? "Individual" : "Company"}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className={labelClass}>Name *</label>
              <input id="name" required maxLength={160} className={field} value={v.name}
                onChange={(e) => set("name", e.target.value)} />
            </div>
            <div>
              <label htmlFor="company" className={labelClass}>Company name</label>
              <input id="company" className={field} value={v.company_name}
                onChange={(e) => set("company_name", e.target.value)} />
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>Email</label>
              <input id="email" type="email" className={field} value={v.email}
                onChange={(e) => set("email", e.target.value)} />
            </div>
            <div>
              <label htmlFor="phone" className={labelClass}>Phone (with country code)</label>
              <input id="phone" type="tel" placeholder="+20 100 000 0000" className={field} value={v.phone}
                onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div>
              <label htmlFor="country" className={labelClass}>Country</label>
              <input id="country" className={field} value={v.country}
                onChange={(e) => set("country", e.target.value)} />
            </div>
          </div>
          <div>
            <label htmlFor="notes" className={labelClass}>Notes</label>
            <textarea id="notes" rows={3} className={field} value={v.notes}
              onChange={(e) => set("notes", e.target.value)} />
          </div>
        </fieldset>
      </div>

      <div className={`${card} p-5 sm:p-6`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold text-navy">Communication style</h2>
            <p className="text-sm text-muted">Pick the style that fits best and get tips on how to talk to this customer.</p>
          </div>
          {canEdit && (
            <button type="button" className={btnGhost} onClick={() => setQuiz((q) => !q)}>
              {quiz ? "Hide quiz" : "Help me decide"}
            </button>
          )}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {PERSONALITIES.map((p) => {
            const on = v.personality === p.key;
            return (
              <button
                key={p.key}
                type="button"
                disabled={!canEdit}
                onClick={() => set("personality", on ? "" : p.key)}
                aria-pressed={on}
                className={`rounded-lg border px-3 py-2.5 text-start transition ${
                  on ? "border-navy shadow-sm" : "border-slate-200 hover:border-slate-400"
                }`}
                style={on ? { backgroundColor: p.tint } : undefined}
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-navy">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  {p.name}
                </span>
                <span className="mt-0.5 block text-xs text-muted">{p.nickname}</span>
              </button>
            );
          })}
        </div>
        {quiz && (
          <div className="mt-4">
            <PersonalityQuiz
              onPick={(k) => {
                set("personality", k);
                setQuiz(false);
              }}
            />
          </div>
        )}
      </div>

      {v.personality && (
        <PersonalityTips type={v.personality} customerName={v.name.trim() || undefined} />
      )}

      <div className="flex flex-wrap items-center gap-3">
        {canEdit && (
          <button type="submit" disabled={saving} className={btnPrimary}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add customer"}
          </button>
        )}
        <button type="button" onClick={() => router.push("/customers")} className={btnGhost}>
          {canEdit ? "Cancel" : "Back"}
        </button>
        {isEdit && canDelete && (
          <button type="button" onClick={() => setConfirming(true)}
            className="ms-auto rounded-lg px-4 py-2 text-sm font-medium text-danger transition hover:bg-red-50">
            Delete customer
          </button>
        )}
      </div>

      {confirming && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-navy">Delete this customer?</h2>
            <p className="mt-2 text-sm text-muted">
              {initial.name} will be permanently removed. This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setConfirming(false)} className={btnGhost}>
                Keep customer
              </button>
              <button type="button" onClick={onDelete} disabled={deleting}
                className="rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {deleting ? "Deleting…" : "Delete customer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

export { PERSONALITY_BY_KEY };
