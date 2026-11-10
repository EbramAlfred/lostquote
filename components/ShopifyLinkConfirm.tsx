"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ErrorBox, buttonClass } from "@/components/AuthCard";

const MESSAGES: Record<string, string> = {
  code_expired: "This link has expired or was already used. Go back to Shopify and press the button again.",
  already_linked: "This store is already linked to another LostQuote account.",
  not_allowed: "Only the owner or an admin of the business can connect a store.",
  not_signed_in: "Please sign in first.",
};

export function ShopifyLinkConfirm({ code, businessName }: { code: string; businessName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function link() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/shopify/link", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
    const j = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return setError(MESSAGES[j.error] ?? "Something went wrong. Please try again.");
    router.push("/settings/shopify");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <ErrorBox message={error} />
      <p className="text-sm text-muted">Your Shopify store will be linked to <b>{businessName}</b>.</p>
      <button onClick={link} disabled={loading} className={buttonClass}>{loading ? "Linking…" : "Link my store"}</button>
    </div>
  );
}
