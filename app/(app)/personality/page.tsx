import { PERSONALITIES, loc } from "@/lib/personality";
import { getT } from "@/lib/lang";
import { PageHeader, card } from "@/components/ui";
import { PersonalityQuiz } from "@/components/PersonalityQuiz";

export default async function PersonalityPage() {
  const { lang, t } = await getT();
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={t("pt.title")}
        subtitle={t("pt.subtitle")}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {PERSONALITIES.map((raw) => {
          const p = loc(raw, lang);
          return (
          <article key={p.key} className={`${card} overflow-hidden`}>
            <div className="px-5 py-4" style={{ backgroundColor: p.tint }}>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: p.color }} />
                <h2 className="text-lg font-semibold text-navy">{p.name}</h2>
                <span className="text-sm text-muted">{p.nickname}</span>
              </div>
              <p className="mt-2 text-sm text-[#4a4a4a]">{p.summary}</p>
            </div>
            <div className="space-y-4 p-5 text-sm">
              <div>
                <h3 className="font-semibold text-navy">{t("pt.spot")}</h3>
                <ul className="mt-1.5 list-disc space-y-1 ps-5 text-[#4a4a4a]">
                  {p.signs.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-navy">{t("pt.cares")}</h3>
                <p className="mt-1 text-[#4a4a4a]">{p.cares}</p>
              </div>
              <div>
                <h3 className="font-semibold text-navy">{t("tips.communicate")}</h3>
                <ul className="mt-1.5 list-disc space-y-1 ps-5 text-[#4a4a4a]">
                  {p.communicate.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-navy">{t("tips.avoid")}</h3>
                <ul className="mt-1.5 list-disc space-y-1 ps-5 text-[#4a4a4a]">
                  {p.avoid.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-navy">{t("pt.quoteTip")}</h3>
                <p className="mt-1 text-[#4a4a4a]">{p.quotation}</p>
              </div>
              <div>
                <h3 className="font-semibold text-navy">{t("pt.followTip")}</h3>
                <p className="mt-1 text-[#4a4a4a]">{p.followUp}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 text-[#4a4a4a]">
                <p className="font-medium text-navy">{t("pt.example")}</p>
                <p className="mt-1">{p.opener}</p>
              </div>
            </div>
          </article>
          );
        })}
      </div>

      <div className="mt-6">
        <PersonalityQuiz />
      </div>

      <p className="mt-4 text-xs text-muted">
        {t("pt.disclaimer")}
      </p>
    </div>
  );
}
