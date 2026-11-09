// Client communication styles (DISC-inspired). Plain-language, practical guidance for sales follow-up.
// These are working hypotheses about how someone prefers to communicate, not a psychological diagnosis.

export type PersonalityKey = "driver" | "expressive" | "amiable" | "analytical";

export type Personality = {
  key: PersonalityKey;
  name: string;
  nickname: string;
  color: string; // Tailwind-free hex, used for dots and badges
  tint: string;
  summary: string;
  signs: string[];
  cares: string;
  communicate: string[];
  avoid: string[];
  quotation: string;
  followUp: string;
  opener: { en: string; ar: string };
};

export const PERSONALITIES: Personality[] = [
  {
    key: "driver",
    name: "Driver",
    nickname: "The decision maker",
    color: "#dc2626",
    tint: "#fef2f2",
    summary: "Wants results fast. Decides quickly, dislikes small talk, and respects people who get to the point.",
    signs: [
      "Short, direct messages; often replies with one line",
      "Asks about price, timeline and bottom line first",
      "Gets impatient when you over-explain",
      "Makes the call on their own, or says 'just send me the offer'",
    ],
    cares: "Results, speed, being in control.",
    communicate: [
      "Lead with the outcome and the price in the first two lines.",
      "Give two clear options and say which one you recommend.",
      "Be brief and confident. Use numbers and dates.",
      "Ask for a decision: 'Can we confirm by Thursday?'",
    ],
    avoid: [
      "Long introductions, small talk and unrelated detail.",
      "Vague answers like 'maybe' or 'we will see'.",
      "Pushing emotion. They respond to logic and efficiency.",
    ],
    quotation: "One-page summary: outcome, total price, start date. Put detailed scope on a second page.",
    followUp: "Short and direct. Stay respectful of their time. Day 2: 'Any questions before you decide?' Final: a clear deadline.",
    opener: {
      en: "Hi {name}, quick follow-up on the {quote}: total is {amount}, and we can start {date}. Shall we confirm?",
      ar: "أهلاً {name}، متابعة سريعة بخصوص {quote}: الإجمالي {amount} ويمكننا البدء في {date}. هل نؤكد؟",
    },
  },
  {
    key: "expressive",
    name: "Expressive",
    nickname: "The enthusiast",
    color: "#f97316",
    tint: "#fff7ed",
    summary: "Energetic and people-focused. Loves ideas, vision and recognition, and decides on gut feeling.",
    signs: [
      "Warm, chatty, uses emojis, voice notes and exclamation marks",
      "Talks about the big picture and what it could become",
      "Replies fast when excited, goes quiet when distracted",
      "Often says 'I love it' before checking the details",
    ],
    cares: "Vision, recognition, relationships and feeling excited.",
    communicate: [
      "Start friendly and show real interest in their idea.",
      "Paint the result: what it will look like when finished.",
      "Use stories and examples from similar happy customers.",
      "Match their energy, then guide them to the next step.",
    ],
    avoid: [
      "Walls of numbers and fine print with no story.",
      "Cold, formal wording.",
      "Letting the conversation drift without a clear next step.",
    ],
    quotation: "Open with the vision and a visual or example. Keep the price clear but not the first thing they see.",
    followUp: "Friendly and quick to answer, because they lose focus. Remind them what excited them, then propose a call.",
    opener: {
      en: "Hi {name}! I keep thinking about your project. Here is the {quote} for {amount}. Can we jump on a quick call this week?",
      ar: "أهلاً {name}! ما زلت أفكر في مشروعك. هذا هو {quote} بقيمة {amount}. هل نتكلم مكالمة سريعة هذا الأسبوع؟",
    },
  },
  {
    key: "amiable",
    name: "Amiable",
    nickname: "The relationship keeper",
    color: "#16a34a",
    tint: "#f0fdf4",
    summary: "Calm, loyal and cooperative. Avoids conflict and risk, and needs to feel safe before deciding.",
    signs: [
      "Polite, patient, slow to reply, rarely says a flat 'no'",
      "Asks whether others (family, team, partner) agree",
      "Says 'I will think about it' when unsure",
      "Values trust and long-term relationship over the lowest price",
    ],
    cares: "Trust, stability, harmony and not being rushed.",
    communicate: [
      "Be warm and patient. Ask how they are before business.",
      "Offer reassurance: guarantees, references, a clear process.",
      "Ask what worries them, then answer it gently.",
      "Make it easy to say yes: small first step, support included.",
    ],
    avoid: [
      "Pressure, hard deadlines and aggressive closing.",
      "Ignoring their need to consult other people.",
      "Treating silence as a 'no'. It usually means 'not yet'.",
    ],
    quotation: "Include what happens after they say yes: support, warranty, timeline. Offer to walk them through it.",
    followUp: "Gentle and personal. Ask if they need anything to feel comfortable. Offer to talk with the other decision makers.",
    opener: {
      en: "Hi {name}, hope you are well. I wanted to check if you have any questions about the {quote}. No rush at all. I am happy to go through it with you or your team.",
      ar: "أهلاً {name}، أتمنى أن تكون بخير. أردت أن أطمئن إن كان لديك أي سؤال عن {quote}. لا استعجال أبداً، ويسعدني شرحه لك أو لفريقك.",
    },
  },
  {
    key: "analytical",
    name: "Analytical",
    nickname: "The careful checker",
    color: "#2563eb",
    tint: "#eff6ff",
    summary: "Precise and cautious. Wants facts, comparisons and proof, and decides slowly after checking everything.",
    signs: [
      "Asks detailed questions about specs, scope and terms",
      "Compares you against other quotations line by line",
      "Writes longer, formal messages with exact wording",
      "Needs time and documents before committing",
    ],
    cares: "Accuracy, proof, fairness and avoiding mistakes.",
    communicate: [
      "Answer exactly what they asked, with facts and numbers.",
      "Send documents: itemized breakdown, scope, terms, case studies.",
      "Give them time, but agree a date when you will check in.",
      "Be consistent. Do what you said you would do.",
    ],
    avoid: [
      "Exaggeration, hype and unsupported promises.",
      "Rushing them or hiding details.",
      "Changing prices or terms without explaining why.",
    ],
    quotation: "Itemized lines, clear scope, assumptions and payment terms. Add references or proof of results.",
    followUp: "Offer something useful: a comparison sheet, an FAQ, or an answer to a likely question. Keep a respectful pace.",
    opener: {
      en: "Hi {name}, following up on the {quote} ({amount}). I can send the itemized scope and terms, or answer any detail you are comparing. What would help most?",
      ar: "أهلاً {name}، متابعة بخصوص {quote} (بقيمة {amount}). يمكنني إرسال تفاصيل النطاق والشروط أو الإجابة عن أي نقطة تقارنها. ما الأنفع لك؟",
    },
  },
];

export const PERSONALITY_BY_KEY: Record<PersonalityKey, Personality> = Object.fromEntries(
  PERSONALITIES.map((p) => [p.key, p])
) as Record<PersonalityKey, Personality>;

// Five quick questions. Each answer points to one style. The most-picked style wins.
export const QUIZ: { q: string; options: { text: string; key: PersonalityKey }[] }[] = [
  {
    q: "How does this customer usually write to you?",
    options: [
      { text: "Very short and to the point", key: "driver" },
      { text: "Friendly, lots of energy, emojis or voice notes", key: "expressive" },
      { text: "Polite and calm, takes time to answer", key: "amiable" },
      { text: "Detailed, formal, exact wording", key: "analytical" },
    ],
  },
  {
    q: "What did they ask about first?",
    options: [
      { text: "Price and how fast you can deliver", key: "driver" },
      { text: "The idea and what the result will look like", key: "expressive" },
      { text: "Whether they can trust you, and what support they get", key: "amiable" },
      { text: "Specs, scope, terms and exact details", key: "analytical" },
    ],
  },
  {
    q: "How do they make decisions?",
    options: [
      { text: "Quickly, on their own", key: "driver" },
      { text: "On gut feeling and excitement", key: "expressive" },
      { text: "After checking with other people", key: "amiable" },
      { text: "After comparing options and checking facts", key: "analytical" },
    ],
  },
  {
    q: "What happens when you give a lot of detail?",
    options: [
      { text: "They get impatient: 'just give me the bottom line'", key: "driver" },
      { text: "They drift off the topic and talk about other ideas", key: "expressive" },
      { text: "They say 'I will think about it' and go quiet", key: "amiable" },
      { text: "They love it and ask for even more detail", key: "analytical" },
    ],
  },
  {
    q: "When they are not ready to buy, what do they say?",
    options: [
      { text: "A direct 'no' or 'too expensive'", key: "driver" },
      { text: "'Let me get back to you' and then become hard to reach", key: "expressive" },
      { text: "'Maybe later' or 'let me ask my partner'", key: "amiable" },
      { text: "'I need to compare a few more options'", key: "analytical" },
    ],
  },
];

export function scoreQuiz(answers: PersonalityKey[]): { winner: PersonalityKey; tie: PersonalityKey[] } {
  const counts: Record<PersonalityKey, number> = { driver: 0, expressive: 0, amiable: 0, analytical: 0 };
  answers.forEach((a) => (counts[a] += 1));
  const max = Math.max(...Object.values(counts));
  const top = (Object.keys(counts) as PersonalityKey[]).filter((k) => counts[k] === max);
  return { winner: top[0], tie: top };
}
