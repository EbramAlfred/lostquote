"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/LangProvider";
import { btnPrimary } from "@/components/ui";

type Result = {
  customersCreated: number; customersUpdated: number; quotesCreated: number; quotesUpdated: number;
  skippedNoCustomer: number; failed: number; firstError: string | null; truncated: boolean;
};

export function ShopifySyncButton() {
  const t = useT();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<Result | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setBusy(true); setErr(null); setRes(null);
    try {
      const r = await fetch("/api/shopify/sync", { method: "POST" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) setErr(j.message || j.error || t("shop.error"));
      else { setRes(j.result); router.refresh(); }
    } catch { setErr(t("shop.error")); }
    setBusy(false);
  }

  return (
    <div>
      <button onClick={run} disabled={busy} className={`${btnPrimary} disabled:opacity-60`}>
        {busy ? t("shop.syncing") : t("shop.sync")}
      </button>
      {err && <p role="alert" className="mt-3 text-sm text-danger">{t("shop.error")}: {err}</p>}
      {res && (
        <div role="status" className="mt-3 space-y-1 text-sm">
          <p className="text-success">{t("shop.result", { cc: String(res.customersCreated), cu: String(res.customersUpdated), qc: String(res.quotesCreated), qu: String(res.quotesUpdated) })}</p>
          {res.skippedNoCustomer > 0 && <p className="text-muted">{t("shop.skipped", { n: String(res.skippedNoCustomer) })}</p>}
          {res.truncated && <p className="text-muted">{t("shop.truncated")}</p>}
          {res.failed > 0 && <p className="text-danger">{t("shop.failed", { n: String(res.failed), e: res.firstError ?? "" })}</p>}
        </div>
      )}
    </div>
  );
}
