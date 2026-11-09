// Client communication styles (DISC-inspired), in English and Arabic.
// These are working hypotheses about how someone prefers to communicate, not a psychological diagnosis.
import type { Lang } from "./i18n";

export type PersonalityKey = "driver" | "expressive" | "amiable" | "analytical";

type Text = {
  name: string;
  nickname: string;
  summary: string;
  signs: string[];
  cares: string;
  communicate: string[];
  avoid: string[];
  quotation: string;
  followUp: string;
  opener: string; // placeholders: {name} {quote} {amount} {date}
};

export type PersonalityData = { key: PersonalityKey; color: string; tint: string; en: Text; ar: Text };
export type Personality = { key: PersonalityKey; color: string; tint: string } & Text;

export const PERSONALITIES: PersonalityData[] = [
  {
    key: "driver",
    color: "#dc2626",
    tint: "#fef2f2",
    en: {
      name: "Driver",
      nickname: "The decision maker",
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
      opener: "Hi {name}, quick follow-up on {quote}: total is {amount}, and we can start {date}. Shall we confirm?",
    },
    ar: {
      name: "الحاسم",
      nickname: "صاحب القرار",
      summary: "يريد النتائج بسرعة. يقرر سريعًا، ولا يحب الكلام الجانبي، ويحترم من يدخل في الموضوع مباشرة.",
      signs: [
        "رسائله قصيرة ومباشرة، وغالبًا يرد بسطر واحد",
        "يسأل أولًا عن السعر والمدة والنتيجة النهائية",
        "ينفد صبره إذا أطلت في الشرح",
        "يقرر بمفرده، أو يقول: «أرسل لي العرض فقط»",
      ],
      cares: "النتائج، السرعة، والتحكم في الأمور.",
      communicate: [
        "ابدأ بالنتيجة والسعر في أول سطرين.",
        "قدّم خيارين واضحين وحدّد أيهما توصي به.",
        "كن موجزًا وواثقًا، واستخدم الأرقام والتواريخ.",
        "اطلب قرارًا: «هل نؤكد يوم الخميس؟»",
      ],
      avoid: [
        "المقدمات الطويلة والكلام الجانبي والتفاصيل غير المرتبطة.",
        "الإجابات الغامضة مثل «ربما» أو «سنرى».",
        "مخاطبة العاطفة. هو يستجيب للمنطق والكفاءة.",
      ],
      quotation: "ملخص في صفحة واحدة: النتيجة، السعر الإجمالي، تاريخ البدء. ضع تفاصيل النطاق في صفحة ثانية.",
      followUp: "قصيرة ومباشرة واحترم وقته. اليوم الثاني: «هل لديك أي سؤال قبل أن تقرر؟» والأخيرة: موعد نهائي واضح.",
      opener: "أهلاً {name}، متابعة سريعة بخصوص {quote}: الإجمالي {amount} ويمكننا البدء في {date}. هل نؤكد؟",
    },
  },
  {
    key: "expressive",
    color: "#f97316",
    tint: "#fff7ed",
    en: {
      name: "Expressive",
      nickname: "The enthusiast",
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
      opener: "Hi {name}! I keep thinking about your project. Here is {quote} for {amount}. Can we jump on a quick call this week?",
    },
    ar: {
      name: "المتحمّس",
      nickname: "صاحب الفكرة",
      summary: "نشيط ويهتم بالناس. يحب الأفكار والرؤية والتقدير، ويقرر بحسب إحساسه.",
      signs: [
        "ودود وكثير الكلام، ويستخدم الإيموجي والرسائل الصوتية وعلامات التعجب",
        "يتحدث عن الصورة الكبيرة وما يمكن أن يصبح عليه المشروع",
        "يرد بسرعة عندما يتحمّس، ويختفي عندما ينشغل",
        "كثيرًا ما يقول «أعجبني!» قبل أن يراجع التفاصيل",
      ],
      cares: "الرؤية، التقدير، العلاقات، والشعور بالحماس.",
      communicate: [
        "ابدأ بودّ وأظهر اهتمامًا حقيقيًا بفكرته.",
        "ارسم له النتيجة: كيف سيبدو الأمر عند الانتهاء.",
        "استخدم قصصًا وأمثلة من عملاء مشابهين سعداء.",
        "جارِ حماسه، ثم وجّهه إلى الخطوة التالية.",
      ],
      avoid: [
        "جدران الأرقام والبنود الدقيقة بلا قصة.",
        "الصياغة الباردة الرسمية جدًا.",
        "ترك الحديث يتشتت دون خطوة تالية واضحة.",
      ],
      quotation: "ابدأ بالرؤية مع صورة أو مثال. اجعل السعر واضحًا لكن ليس أول ما يراه.",
      followUp: "ودودة وسريعة لأنه يفقد التركيز. ذكّره بما حمّسه ثم اقترح مكالمة.",
      opener: "أهلاً {name}! ما زلت أفكر في مشروعك. هذا هو {quote} بقيمة {amount}. هل نتحدث في مكالمة سريعة هذا الأسبوع؟",
    },
  },
  {
    key: "amiable",
    color: "#16a34a",
    tint: "#f0fdf4",
    en: {
      name: "Amiable",
      nickname: "The relationship keeper",
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
      opener: "Hi {name}, hope you are well. I wanted to check if you have any questions about {quote}. No rush at all. I am happy to go through it with you or your team.",
    },
    ar: {
      name: "الودود",
      nickname: "حافظ العلاقات",
      summary: "هادئ ووفي ومتعاون. يتجنب الخلاف والمخاطرة، ويحتاج أن يشعر بالأمان قبل أن يقرر.",
      signs: [
        "مهذب وصبور وبطيء في الرد، ونادرًا ما يقول «لا» صريحة",
        "يسأل إن كان الآخرون (العائلة، الفريق، الشريك) موافقين",
        "يقول «سأفكر في الأمر» عندما يكون غير متأكد",
        "يقدّر الثقة والعلاقة الطويلة أكثر من أقل سعر",
      ],
      cares: "الثقة، الاستقرار، الانسجام، وعدم الاستعجال.",
      communicate: [
        "كن دافئًا وصبورًا، واسأله عن حاله قبل الكلام في العمل.",
        "قدّم الطمأنينة: ضمانات، مراجع، وخطوات واضحة.",
        "اسأله عمّا يقلقه ثم أجب بهدوء.",
        "سهّل عليه قول «نعم»: خطوة أولى صغيرة ودعم مشمول.",
      ],
      avoid: [
        "الضغط والمواعيد النهائية الصارمة والإغلاق العدواني.",
        "تجاهل حاجته إلى استشارة الآخرين.",
        "اعتبار الصمت رفضًا. غالبًا يعني «ليس بعد».",
      ],
      quotation: "اذكر ما يحدث بعد موافقته: الدعم، الضمان، الجدول الزمني. اعرض أن تشرح له العرض خطوة بخطوة.",
      followUp: "لطيفة وشخصية. اسأله إن كان يحتاج شيئًا ليشعر بالراحة، واعرض الحديث مع بقية صنّاع القرار.",
      opener: "أهلاً {name}، أتمنى أن تكون بخير. أردت أن أطمئن إن كان لديك أي سؤال عن {quote}. لا استعجال أبدًا، ويسعدني شرحه لك أو لفريقك.",
    },
  },
  {
    key: "analytical",
    color: "#2563eb",
    tint: "#eff6ff",
    en: {
      name: "Analytical",
      nickname: "The careful checker",
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
      opener: "Hi {name}, following up on {quote} ({amount}). I can send the itemized scope and terms, or answer any detail you are comparing. What would help most?",
    },
    ar: {
      name: "المحلّل",
      nickname: "المدقّق الحذر",
      summary: "دقيق وحذر. يريد الحقائق والمقارنات والدليل، ويقرر ببطء بعد أن يتحقق من كل شيء.",
      signs: [
        "يسأل أسئلة تفصيلية عن المواصفات والنطاق والشروط",
        "يقارنك بعروض أخرى بندًا بندًا",
        "يكتب رسائل أطول وأكثر رسمية بصياغة دقيقة",
        "يحتاج وقتًا ومستندات قبل أن يلتزم",
      ],
      cares: "الدقة، الدليل، العدالة، وتجنب الأخطاء.",
      communicate: [
        "أجب بالضبط عما سأل عنه، بالحقائق والأرقام.",
        "أرسل مستندات: تفصيل البنود، النطاق، الشروط، ودراسات حالة.",
        "امنحه الوقت، لكن اتفق على موعد تتواصل فيه معه.",
        "كن ثابتًا. افعل ما قلت إنك ستفعله.",
      ],
      avoid: [
        "المبالغة والحماس الزائد والوعود غير المثبتة.",
        "استعجاله أو إخفاء التفاصيل.",
        "تغيير الأسعار أو الشروط دون تفسير.",
      ],
      quotation: "بنود مفصلة، نطاق واضح، افتراضات وشروط دفع. أضف مراجع أو دليلًا على النتائج.",
      followUp: "قدّم شيئًا مفيدًا: جدول مقارنة، أو أسئلة شائعة، أو إجابة عن سؤال متوقع. حافظ على إيقاع محترم.",
      opener: "أهلاً {name}، متابعة بخصوص {quote} (بقيمة {amount}). يمكنني إرسال تفاصيل النطاق والشروط أو الإجابة عن أي نقطة تقارنها. ما الأنفع لك؟",
    },
  },
];

/** A personality in the chosen language (name, tips, example message). */
export function loc(p: PersonalityData, lang: Lang): Personality {
  return { key: p.key, color: p.color, tint: p.tint, ...p[lang] };
}

export const PERSONALITY_BY_KEY: Record<PersonalityKey, PersonalityData> = Object.fromEntries(
  PERSONALITIES.map((p) => [p.key, p])
) as Record<PersonalityKey, PersonalityData>;

// Five quick questions. Each answer points to one style. The most-picked style wins.
type QuizItem = { q: { en: string; ar: string }; options: { text: { en: string; ar: string }; key: PersonalityKey }[] };
export const QUIZ: QuizItem[] = [
  {
    q: { en: "How does this customer usually write to you?", ar: "كيف يكتب لك هذا العميل عادةً؟" },
    options: [
      { text: { en: "Very short and to the point", ar: "قصير جدًا ومباشر" }, key: "driver" },
      { text: { en: "Friendly, lots of energy, emojis or voice notes", ar: "ودود ومليء بالحماس، مع إيموجي أو رسائل صوتية" }, key: "expressive" },
      { text: { en: "Polite and calm, takes time to answer", ar: "مهذب وهادئ ويتأخر في الرد" }, key: "amiable" },
      { text: { en: "Detailed, formal, exact wording", ar: "مفصّل ورسمي وبصياغة دقيقة" }, key: "analytical" },
    ],
  },
  {
    q: { en: "What did they ask about first?", ar: "ما أول شيء سأل عنه؟" },
    options: [
      { text: { en: "Price and how fast you can deliver", ar: "السعر وسرعة التسليم" }, key: "driver" },
      { text: { en: "The idea and what the result will look like", ar: "الفكرة وكيف ستبدو النتيجة" }, key: "expressive" },
      { text: { en: "Whether they can trust you, and what support they get", ar: "هل يمكنه الوثوق بك، وما الدعم الذي سيحصل عليه" }, key: "amiable" },
      { text: { en: "Specs, scope, terms and exact details", ar: "المواصفات والنطاق والشروط والتفاصيل الدقيقة" }, key: "analytical" },
    ],
  },
  {
    q: { en: "How do they make decisions?", ar: "كيف يتخذ قراراته؟" },
    options: [
      { text: { en: "Quickly, on their own", ar: "بسرعة وبمفرده" }, key: "driver" },
      { text: { en: "On gut feeling and excitement", ar: "بحسب إحساسه وحماسه" }, key: "expressive" },
      { text: { en: "After checking with other people", ar: "بعد استشارة آخرين" }, key: "amiable" },
      { text: { en: "After comparing options and checking facts", ar: "بعد مقارنة الخيارات والتحقق من الحقائق" }, key: "analytical" },
    ],
  },
  {
    q: { en: "What happens when you give a lot of detail?", ar: "ماذا يحدث عندما تعطيه تفاصيل كثيرة؟" },
    options: [
      { text: { en: "They get impatient: 'just give me the bottom line'", ar: "ينفد صبره: «أعطني الخلاصة فقط»" }, key: "driver" },
      { text: { en: "They drift off the topic and talk about other ideas", ar: "يخرج عن الموضوع ويتحدث عن أفكار أخرى" }, key: "expressive" },
      { text: { en: "They say 'I will think about it' and go quiet", ar: "يقول «سأفكر» ثم يصمت" }, key: "amiable" },
      { text: { en: "They love it and ask for even more detail", ar: "يعجبه ذلك ويطلب تفاصيل أكثر" }, key: "analytical" },
    ],
  },
  {
    q: { en: "When they are not ready to buy, what do they say?", ar: "عندما لا يكون مستعدًا للشراء، ماذا يقول؟" },
    options: [
      { text: { en: "A direct 'no' or 'too expensive'", ar: "«لا» مباشرة أو «غالي»" }, key: "driver" },
      { text: { en: "'Let me get back to you' and then become hard to reach", ar: "«سأرد عليك» ثم يصبح من الصعب الوصول إليه" }, key: "expressive" },
      { text: { en: "'Maybe later' or 'let me ask my partner'", ar: "«ربما لاحقًا» أو «دعني أسأل شريكي»" }, key: "amiable" },
      { text: { en: "'I need to compare a few more options'", ar: "«أحتاج أن أقارن بعض الخيارات الأخرى»" }, key: "analytical" },
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
