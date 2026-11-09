import { PERSONALITY_BY_KEY, type PersonalityKey } from "@/lib/personality";

function fill(t: string, name?: string) {
  return t
    .replaceAll("{name}", name ? name.split(" ")[0] : "[name]")
    .replaceAll("{quote}", "[quotation title]")
    .replaceAll("{amount}", "[amount]")
    .replaceAll("{date}", "[start date]");
}

// Compact "how to talk to this customer" panel. Used on customer and quotation pages.
export function PersonalityTips({ type, customerName }: { type: PersonalityKey; customerName?: string }) {
  const p = PERSONALITY_BY_KEY[type];
  return (
    <section className="overflow-hidden rounded-xl border border-black/[.08] bg-white shadow-[0_1px_2px_rgba(0,0,0,.04)]">
      <div className="flex items-center gap-3 px-5 py-4" style={{ backgroundColor: p.tint }}>
        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: p.color }} />
        <div>
          <p className="font-semibold text-navy">
            {customerName ? `${customerName} is ` : ""}
            {p.name === "Analytical" || p.name === "Amiable" || p.name === "Expressive" ? "an" : "a"} {p.name}
          </p>
          <p className="text-sm text-muted">{p.nickname}</p>
        </div>
      </div>
      <div className="grid gap-5 p-5 text-sm sm:grid-cols-2">
        <div>
          <h3 className="font-semibold text-navy">How to communicate</h3>
          <ul className="mt-2 list-disc space-y-1.5 ps-5 text-[#4a4a4a]">
            {p.communicate.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-navy">Avoid</h3>
          <ul className="mt-2 list-disc space-y-1.5 ps-5 text-[#4a4a4a]">
            {p.avoid.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <div className="sm:col-span-2">
          <h3 className="font-semibold text-navy">For the quotation</h3>
          <p className="mt-1 text-[#4a4a4a]">{p.quotation}</p>
        </div>
        <div className="sm:col-span-2">
          <h3 className="font-semibold text-navy">For follow-ups</h3>
          <p className="mt-1 text-[#4a4a4a]">{p.followUp}</p>
          <p className="mt-3 rounded-lg bg-slate-50 p-3 text-[#4a4a4a]">
            <span className="font-medium text-navy">Example opener: </span>
            {fill(p.opener.en, customerName)}
          </p>
        </div>
      </div>
    </section>
  );
}
