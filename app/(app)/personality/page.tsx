import { PERSONALITIES } from "@/lib/personality";
import { PageHeader, card } from "@/components/ui";
import { PersonalityQuiz } from "@/components/PersonalityQuiz";

export default function PersonalityPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Client types"
        subtitle="Four communication styles. Spot the style, then write the way that customer likes to be spoken to."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {PERSONALITIES.map((p) => (
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
                <h3 className="font-semibold text-navy">How to spot them</h3>
                <ul className="mt-1.5 list-disc space-y-1 ps-5 text-[#4a4a4a]">
                  {p.signs.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-navy">What they care about</h3>
                <p className="mt-1 text-[#4a4a4a]">{p.cares}</p>
              </div>
              <div>
                <h3 className="font-semibold text-navy">How to communicate</h3>
                <ul className="mt-1.5 list-disc space-y-1 ps-5 text-[#4a4a4a]">
                  {p.communicate.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-navy">Avoid</h3>
                <ul className="mt-1.5 list-disc space-y-1 ps-5 text-[#4a4a4a]">
                  {p.avoid.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-navy">Quotation tip</h3>
                <p className="mt-1 text-[#4a4a4a]">{p.quotation}</p>
              </div>
              <div>
                <h3 className="font-semibold text-navy">Follow-up tip</h3>
                <p className="mt-1 text-[#4a4a4a]">{p.followUp}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 text-[#4a4a4a]">
                <p className="font-medium text-navy">Example message</p>
                <p className="mt-1">{p.opener.en}</p>
                <p className="mt-2 text-end" dir="rtl">
                  {p.opener.ar}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6">
        <PersonalityQuiz />
      </div>

      <p className="mt-4 text-xs text-muted">
        These styles are a practical guide inspired by the well-known DISC model. People mix styles and change with the situation, so use them as a starting point and adjust to what you see.
      </p>
    </div>
  );
}
