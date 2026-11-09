"use client";

import { useState } from "react";
import { QUIZ, PERSONALITY_BY_KEY, scoreQuiz, type PersonalityKey } from "@/lib/personality";
import { card, btnGhost } from "@/components/ui";

// Optional: onPick lets a form use the result (e.g. set the customer's type).
export function PersonalityQuiz({ onPick }: { onPick?: (k: PersonalityKey) => void }) {
  const [answers, setAnswers] = useState<(PersonalityKey | null)[]>(QUIZ.map(() => null));
  const done = answers.every(Boolean);
  const result = done ? scoreQuiz(answers as PersonalityKey[]) : null;

  return (
    <div className={`${card} p-5 sm:p-6`}>
      <h2 className="text-lg font-semibold text-navy">Not sure which type? Answer 5 quick questions</h2>
      <p className="mt-1 text-sm text-muted">Think of one specific customer and how they have behaved so far.</p>

      <div className="mt-5 space-y-6">
        {QUIZ.map((item, qi) => (
          <fieldset key={item.q}>
            <legend className="text-sm font-medium text-navy">
              {qi + 1}. {item.q}
            </legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {item.options.map((o) => {
                const on = answers[qi] === o.key;
                return (
                  <button
                    key={o.text}
                    type="button"
                    onClick={() => setAnswers((a) => a.map((x, i) => (i === qi ? o.key : x)))}
                    aria-pressed={on}
                    className={`rounded-lg border px-3 py-2.5 text-start text-sm transition ${
                      on ? "border-navy bg-slate-50 font-medium text-navy" : "border-slate-200 text-[#4a4a4a] hover:border-slate-400"
                    }`}
                  >
                    {o.text}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      {result && (
        <div className="mt-6 rounded-xl p-4" style={{ backgroundColor: PERSONALITY_BY_KEY[result.winner].tint }}>
          <p className="font-semibold text-navy">
            Most likely: {PERSONALITY_BY_KEY[result.winner].name} ({PERSONALITY_BY_KEY[result.winner].nickname})
          </p>
          {result.tie.length > 1 && (
            <p className="mt-1 text-sm text-muted">
              It is close between {result.tie.map((k) => PERSONALITY_BY_KEY[k].name).join(" and ")}. Watch a bit longer, then pick the one that fits best.
            </p>
          )}
          <p className="mt-1 text-sm text-[#4a4a4a]">{PERSONALITY_BY_KEY[result.winner].summary}</p>
          <div className="mt-3 flex gap-2">
            {onPick && (
              <button type="button" className={btnGhost} onClick={() => onPick(result.winner)}>
                Use {PERSONALITY_BY_KEY[result.winner].name} for this customer
              </button>
            )}
            <button type="button" className={btnGhost} onClick={() => setAnswers(QUIZ.map(() => null))}>
              Start over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
