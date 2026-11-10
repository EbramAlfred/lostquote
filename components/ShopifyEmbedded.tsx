"use client";

import { useEffect, useState } from "react";

// Minimal typing for the App Bridge global that Shopify's script adds to the page.
declare global {
  interface Window { shopify?: { idToken: () => Promise<string> } }
}

type State =
  | { s: "loading" }
  | { s: "outside" }
  | { s: "linked"; shop: string }
  | { s: "needsLink"; shop: string; linkUrl: string }
  | { s: "error"; msg: string };

async function waitForBridge(ms = 8000) {
  const t0 = Date.now();
  while (!window.shopify?.idToken) {
    if (Date.now() - t0 > ms) return false;
    await new Promise((r) => setTimeout(r, 100));
  }
  return true;
}

export function ShopifyEmbedded({ appUrl }: { appUrl: string }) {
  const [st, setSt] = useState<State>({ s: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (window.top === window.self) return setSt({ s: "outside" });
      if (!(await waitForBridge())) return setSt({ s: "error", msg: "Could not load Shopify App Bridge." });
      for (let attempt = 0; attempt < 2; attempt++) {
        const token = await window.shopify!.idToken(); // short-lived; fetch a fresh one per request
        const res = await fetch("/api/shopify/link-code", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
        if (res.status === 401 && attempt === 0) continue; // retry once with a new token
        const j = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) return setSt({ s: "error", msg: j.message || j.error || "Something went wrong." });
        return setSt(j.linked ? { s: "linked", shop: j.shop } : { s: "needsLink", shop: j.shop, linkUrl: j.linkUrl });
      }
      setSt({ s: "error", msg: "Could not verify your Shopify session. Reload the page." });
    })();
    return () => { cancelled = true; };
  }, []);

  const box = "mx-auto mt-10 max-w-lg rounded-xl border border-black/10 bg-white p-6 shadow-sm";
  const btn = "mt-4 inline-block rounded-lg bg-[#303030] px-4 py-2.5 text-sm font-semibold text-white hover:bg-black";

  if (st.s === "loading") return <div className={box}><p className="text-sm text-neutral-600">Connecting to your store…</p></div>;
  if (st.s === "outside")
    return (
      <div className={box}>
        <h1 className="text-lg font-semibold">LostQuote for Shopify</h1>
        <p className="mt-2 text-sm text-neutral-600">Open this app from your Shopify admin (Apps → LostQuote).</p>
        <a className={btn} href={appUrl}>Go to LostQuote</a>
      </div>
    );
  if (st.s === "error")
    return (
      <div className={box}>
        <h1 className="text-lg font-semibold">Something went wrong</h1>
        <p role="alert" className="mt-2 text-sm text-red-700">{st.msg}</p>
        <button className={btn} onClick={() => location.reload()}>Try again</button>
      </div>
    );
  if (st.s === "linked")
    return (
      <div className={box}>
        <h1 className="text-lg font-semibold">Connected</h1>
        <p className="mt-2 text-sm text-neutral-600"><b>{st.shop}</b> is linked to your LostQuote account.</p>
        <p className="mt-2 text-sm text-neutral-600">Open LostQuote to import your customers and draft orders and start following up.</p>
        <a className={btn} href={`${appUrl}/settings/shopify`} target="_blank" rel="noopener noreferrer">Open LostQuote</a>
      </div>
    );
  return (
    <div className={box}>
      <h1 className="text-lg font-semibold">One last step</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Link <b>{st.shop}</b> to your LostQuote account. It opens in a new tab where you sign in (or create an account).
      </p>
      <a className={btn} href={st.linkUrl} target="_blank" rel="noopener noreferrer">Link to my LostQuote account</a>
      <p className="mt-3 text-xs text-neutral-500">The link works once and expires in 15 minutes. Reload this page for a new one.</p>
    </div>
  );
}
