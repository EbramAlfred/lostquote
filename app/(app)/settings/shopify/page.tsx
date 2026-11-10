import { getT } from "@/lib/lang";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business";
import { PageHeader, card } from "@/components/ui";
import { ShopifySyncButton } from "@/components/ShopifySyncButton";

export default async function ShopifySettingsPage() {
  const { t, lang } = await getT();
  const business = await getCurrentBusiness();
  const supabase = await createClient();
  const { data } = await supabase.rpc("my_shopify_connection");
  const conn = (Array.isArray(data) ? data[0] : data) as { shop: string; last_synced_at: string | null; uninstalled_at: string | null } | null;
  const canSync = business.role !== "viewer";
  const fmt = (iso: string) => new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: business.timezone }).format(new Date(iso));

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={t("shop.title")} subtitle={t("shop.subtitle")} />
      <div className={`${card} p-5`}>
        {!conn && (
          <>
            <p className="font-medium text-navy">{t("shop.notConnected")}</p>
            <p className="mt-2 text-sm text-muted">{t("shop.howTo")}</p>
          </>
        )}
        {conn?.uninstalled_at && <p className="text-sm text-danger">{t("shop.uninstalled")}</p>}
        {conn && !conn.uninstalled_at && (
          <>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium text-muted">{t("shop.connected")}</dt>
                <dd className="mt-0.5 font-medium text-navy" dir="ltr">{conn.shop}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted">{t("shop.lastSync")}</dt>
                <dd className="mt-0.5 text-navy">{conn.last_synced_at ? fmt(conn.last_synced_at) : t("shop.never")}</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-muted">{t("shop.draftNote")}</p>
            {canSync && <div className="mt-4"><ShopifySyncButton /></div>}
          </>
        )}
      </div>
    </div>
  );
}
