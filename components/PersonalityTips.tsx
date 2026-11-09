"use client";

import { PERSONALITY_BY_KEY, loc, type PersonalityKey } from "@/lib/personality";
import { useLang, useT } from "@/components/LangProvider";

// Compact "how to talk to this customer" panel. Used on customer and quotation pages.
export function PersonalityTips({ type, customerName }: { type: PersonalityKey; customerName?: string }) {
  const lang = useLang();
  const t = useT();
  const p = loc(PERSONALITY_BY_KEY[type], lang);

  const opener = p.opener
    .replaceAll("{name}", customerName ? customerName.split(" ")[0] : t("tips.name"))
    .replaceAll("{quote}", t("tips.quote"))
    .replaceAll("{amount}", t("tips.amount"))
    .replaceAll("{date}", t("tips.date"));

  const heading =
    lang === "ar"
      ? `${customerName ? `${customerName}: ` : ""}نمط ${p.name}`
      : `${customerName ? `${customerName} is ` : ""}${/^[AEIOU]/.test(p.name) ? "an" : "a"} ${p.name}`;

  return (
    <section className="overflow-hidden rounded-xl border border-black/[.08] bg-white shadow-[0_1px_2px_rgba(0,0,0,.04)]">
      <div className="flex items-center gap-3 px-5 py-4" style={{ backgroundColor: p.tint }}>
        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: p.color }} />
        <div>
          <p className="font-semibold text-navy">{heading}</p>
          <p className="text-sm text-muted">{p.nickname}</p>
        </div>
      </div>
      <div className="grid gap-5 p-5 text-sm sm:grid-cols-2">
        <div>
          <h3 className="font-semibold text-navy">{t("tips.communicate")}</h3>
          <ul className="mt-2 list-disc space-y-1.5 ps-5 text-[#4a4a4a]">
            {p.communicate.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-navy">{t("tips.avoid")}</h3>
          <ul className="mt-2 list-disc space-y-1.5 ps-5 text-[#4a4a4a]">
            {p.avoid.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
        <div className="sm:col-span-2">
          <h3 className="font-semibold text-navy">{t("tips.quotation")}</h3>
          <p className="mt-1 text-[#4a4a4a]">{p.quotation}</p>
        </div>
        <div className="sm:col-span-2">
          <h3 className="font-semibold text-navy">{t("tips.followup")}</h3>
          <p className="mt-1 text-[#4a4a4a]">{p.followUp}</p>
          <p className="mt-3 rounded-lg bg-slate-50 p-3 text-[#4a4a4a]">
            <span className="font-medium text-navy">{t("tips.opener")}</span>
            {opener}
          </p>
        </div>
      </div>
    </section>
  );
}
