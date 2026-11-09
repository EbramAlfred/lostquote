// Dashboard maths. Pure functions (no database, no React) so they can be tested with fixed data.
import { addDays, todayIn } from "./format";

export type Kind = "draft" | "open" | "won" | "lost" | "cancelled";

export type QuoteRow = {
  id: string;
  amount: number;
  collected_amount: number | null;
  currency: string;
  created_at: string; // ISO timestamp
  closed_at: string | null; // ISO timestamp
  kind: Kind;
};

export type Pair = { cur: number; prev: number };

export type Dashboard = {
  days: number;
  range: { start: string; end: string; prevStart: string; prevEnd: string };
  dates: string[]; // current period, one per day
  quoted: Pair & { curSeries: number[]; prevSeries: number[] };
  won: Pair & { curSeries: number[]; prevSeries: number[]; estimatedCur: number };
  created: Pair & { curSeries: number[]; prevSeries: number[] };
  conversion: { cur: number | null; prev: number | null; wonN: number; lostN: number };
  lostValue: Pair;
  openValue: number;
  openCount: number;
  atRiskValue: number;
  atRiskCount: number;
};

const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);

/** Percent change from prev to cur. null when there is nothing to compare with. */
export function pctChange(cur: number, prev: number): number | null {
  if (prev === 0) return cur === 0 ? 0 : null;
  return ((cur - prev) / prev) * 100;
}

export function computeDashboard(opts: {
  quotes: QuoteRow[]; // quotations created OR closed since prevStart, in the chosen currency
  openQuotes: { id: string; amount: number }[]; // every currently open quotation, chosen currency
  overdueQuoteIds: Set<string>; // quotations with at least one overdue, still-pending follow-up
  timezone: string;
  days: number;
  now?: Date;
}): Dashboard {
  const { quotes, openQuotes, overdueQuoteIds, timezone, days } = opts;
  const end = todayIn(timezone, opts.now);
  const start = addDays(end, -(days - 1));
  const prevEnd = addDays(start, -1);
  const prevStart = addDays(prevEnd, -(days - 1));

  const dates = Array.from({ length: days }, (_, i) => addDays(start, i));
  const local = (iso: string) => todayIn(timezone, new Date(iso));
  const zero = () => new Array<number>(days).fill(0);

  const quotedCur = zero(), quotedPrev = zero();
  const wonCur = zero(), wonPrev = zero();
  const createdCur = zero(), createdPrev = zero();
  let wonN = 0, lostN = 0, wonNPrev = 0, lostNPrev = 0;
  let lostCur = 0, lostPrev = 0, estimatedWonCur = 0;

  // Which slot (day index) does a date fall in? -1 if outside both periods.
  const slot = (d: string): { period: "cur" | "prev"; i: number } | null => {
    if (d >= start && d <= end) return { period: "cur", i: dates.indexOf(d) };
    if (d >= prevStart && d <= prevEnd) {
      const i = Math.round((new Date(d + "T00:00:00Z").getTime() - new Date(prevStart + "T00:00:00Z").getTime()) / 86400000);
      return { period: "prev", i };
    }
    return null;
  };

  for (const q of quotes) {
    const created = slot(local(q.created_at));
    if (created) {
      if (created.period === "cur") {
        quotedCur[created.i] += q.amount;
        createdCur[created.i] += 1;
      } else {
        quotedPrev[created.i] += q.amount;
        createdPrev[created.i] += 1;
      }
    }
    if (q.closed_at && (q.kind === "won" || q.kind === "lost")) {
      const closed = slot(local(q.closed_at));
      if (!closed) continue;
      if (q.kind === "won") {
        const revenue = q.collected_amount ?? q.amount;
        if (closed.period === "cur") {
          wonCur[closed.i] += revenue;
          estimatedWonCur += q.amount;
          wonN += 1;
        } else {
          wonPrev[closed.i] += revenue;
          wonNPrev += 1;
        }
      } else if (closed.period === "cur") {
        lostCur += q.amount;
        lostN += 1;
      } else {
        lostPrev += q.amount;
        lostNPrev += 1;
      }
    }
  }

  const rate = (w: number, l: number) => (w + l === 0 ? null : (w / (w + l)) * 100);
  const atRisk = openQuotes.filter((q) => overdueQuoteIds.has(q.id));

  return {
    days,
    range: { start, end, prevStart, prevEnd },
    dates,
    quoted: { cur: sum(quotedCur), prev: sum(quotedPrev), curSeries: quotedCur, prevSeries: quotedPrev },
    won: { cur: sum(wonCur), prev: sum(wonPrev), curSeries: wonCur, prevSeries: wonPrev, estimatedCur: estimatedWonCur },
    created: { cur: sum(createdCur), prev: sum(createdPrev), curSeries: createdCur, prevSeries: createdPrev },
    conversion: { cur: rate(wonN, lostN), prev: rate(wonNPrev, lostNPrev), wonN, lostN },
    lostValue: { cur: lostCur, prev: lostPrev },
    openValue: sum(openQuotes.map((q) => q.amount)),
    openCount: openQuotes.length,
    atRiskValue: sum(atRisk.map((q) => q.amount)),
    atRiskCount: atRisk.length,
  };
}
