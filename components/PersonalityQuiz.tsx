"use client";

import { useState } from "react";
import { QUIZ, PERSONALITY_BY_KEY, loc, scoreQuiz, type PersonalityKey } from "@/lib/personality";
import { useLang, useT } from "@/components/LangProvider";
import { card, btnGhost } from "@/components/ui";

// Optional: onPick lets a form use the result (e.g. set the customer's type).
export function PersonalityQuiz({ onPick }: { onPick?: (k: PersonalityKey) => void }) {
  const lang = useLang();
  const t = useT();
  const [answers, setAnswers] = useState<(PersonalityKey | null)[]>(QUIZ.map(() => null));
  const done = answers.every(Boolean);
  const result = done ? scoreQuiz(answers as PersonalityKey[]) : null;
  const win = result ? loc(PERSONALITY_BY_KEY[result.winner], lang) : null;

  return (
    <div className={`${card} p-5 sm:p-6`}>
      <h2 className="text-lg font-semibold text-navy">{t("quiz.title")}</h2>
      <p className="mt-1 text-sm text-muted">{t("quiz.sub")}</p>

      <div className="mt-5 space-y-6">
        {QUIZ.map((item, qi) => (
          <fieldset key={item.q.en}>
            <legend className="text-sm font-medium text-navy">
              {qi + 1}. {item.q[lang]}
            </legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {item.options.map((o) => {
                const on = answers[qi] === o.key;
                return (
                  <button
                    key={o.text.en}
                    type="button"
                    onClick={() => setAnswers((a) => a.map((x, i) => (i === qi ? o.key : x)))}
                    aria-pressed={on}
                    className={`rounded-lg border px-3 py-2.5 text-start text-sm transition ${
                      on ? "border-navy bg-slate-50 font-medium text-navy" : "border-slate-200 text-[#4a4a4a] hover:border-slate-400"
                    }`}
                  >
                    {o.text[lang]}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      {result && win && (
        <div className="mt-6 rounded-xl p-4" style={{ backgroundColor: win.tint }}>
          <p className="font-semibold text-navy">
            {t("quiz.most")} {win.name} ({win.nickname})
          </p>
          {result.tie.length > 1 && (
            <p className="mt-1 text-sm text-muted">
              {t("quiz.close", { a: result.tie.map((k) => loc(PERSONALITY_BY_KEY[k], lang).name).join(lang === "ar" ? " و" : " and ") })}
            </p>
          )}
          <p className="mt-1 text-sm text-[#4a4a4a]">{win.summary}</p>
          <div className="mt-3 flex gap-2">
            {onPick && (
              <button type="button" className={btnGhost} onClick={() => onPick(result.winner)}>
                {t("quiz.use", { a: win.name })}
              </button>
            )}
            <button type="button" className={btnGhost} onClick={() => setAnswers(QUIZ.map(() => null))}>
              {t("quiz.again")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
