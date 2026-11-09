"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ErrorBox, inputClass, labelClass } from "@/components/AuthCard";

export type CustomerValues = {
  id?: string;
  type: "individual" | "company";
  name: string;
  company_name: string;
  email: string;
  phone: string;
  country: string;
  notes: string;
};

export const EMPTY_CUSTOMER: CustomerValues = {
  type: "individual",
  name: "",
  company_name: "",
  email: "",
  phone: "",
  country: "",
  notes: "",
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
  const isEdit = Boolean(initial.id);

  const set = <K extends keyof CustomerValues>(k: K, val: CustomerValues[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!v.name.trim()) {
      setError("Please enter the customer's name.");
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
    };
    const { error } = isEdit
      ? await supabase.from("customers").update(row).eq("id", initial.id!)
      : await supabase.from("customers").insert({ ...row, business_id: businessId, created_by: userId });
    setSaving(false);
    if (error) {
      setError(
        error.message.includes("customers_email_check")
          ? "That email address doesn't look right."
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
          ? "This customer has quotations, so it can't be deleted yet. Delete or move those quotations first."
          : error.message
      );
      return;
    }
    router.push("/customers");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
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
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                  v.type === t ? "border-primary bg-blue-50 text-primary" : "border-slate-300 text-muted"
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
            <input id="name" required maxLength={160} className={inputClass} value={v.name}
              onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <label htmlFor="company" className={labelClass}>Company name</label>
            <input id="company" className={inputClass} value={v.company_name}
              onChange={(e) => set("company_name", e.target.value)} />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>Email</label>
            <input id="email" type="email" className={inputClass} value={v.email}
              onChange={(e) => set("email", e.target.value)} />
          </div>
          <div>
            <label htmlFor="phone" className={labelClass}>Phone (with country code)</label>
            <input id="phone" type="tel" placeholder="+20 100 000 0000" className={inputClass} value={v.phone}
              onChange={(e) => set("phone", e.target.value)} />
          </div>
          <div>
            <label htmlFor="country" className={labelClass}>Country</label>
            <input id="country" className={inputClass} value={v.country}
              onChange={(e) => set("country", e.target.value)} />
          </div>
        </div>
        <div>
          <label htmlFor="notes" className={labelClass}>Notes</label>
          <textarea id="notes" rows={4} className={inputClass} value={v.notes}
            onChange={(e) => set("notes", e.target.value)} />
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        {canEdit && (
          <button type="submit" disabled={saving}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add customer"}
          </button>
        )}
        <button type="button" onClick={() => router.push("/customers")}
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-navy hover:bg-slate-50">
          {canEdit ? "Cancel" : "Back"}
        </button>
        {isEdit && canDelete && (
          <button type="button" onClick={() => setConfirming(true)}
            className="ms-auto rounded-lg px-4 py-2.5 text-sm font-medium text-danger hover:bg-red-50">
            Delete customer
          </button>
        )}
      </div>

      {confirming && (
        <div role="dialog" aria-modal="true"
          className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-navy">Delete this customer?</h2>
            <p className="mt-2 text-sm text-muted">
              {initial.name} will be permanently removed. This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setConfirming(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-navy">
                Keep
              </button>
              <button type="button" onClick={onDelete} disabled={deleting}
                className="rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
