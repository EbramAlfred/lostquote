// Run: npx tsx tests/analytics.test.mts
import assert from "node:assert/strict";
import { computeDashboard, pctChange, type QuoteRow } from "../lib/analytics";

const now = new Date("2026-11-10T12:00:00Z"); // today = 2026-11-10 in UTC
const q = (id: string, amount: number, created: string, kind: QuoteRow["kind"], closed: string | null = null, collected: number | null = null): QuoteRow =>
  ({ id, amount, collected_amount: collected, currency: "USD", created_at: created + "T10:00:00Z", closed_at: closed ? closed + "T10:00:00Z" : null, kind });

// 7-day window: current = Nov 4..Nov 10, previous = Oct 28..Nov 3
const quotes: QuoteRow[] = [
  q("a", 1000, "2026-11-04", "won", "2026-11-06", 900),   // created cur, won cur (collected 900)
  q("b", 500, "2026-11-10", "open"),                      // created cur (today)
  q("c", 2000, "2026-11-01", "lost", "2026-11-05"),       // created prev, lost cur
  q("d", 300, "2026-10-28", "won", "2026-11-02"),         // created prev (first prev day), won prev (no collected -> amount)
  q("e", 800, "2026-10-20", "won", "2026-11-08"),         // created before both, won cur (amount 800)
  q("f", 100, "2026-11-03", "open"),                      // created prev (last prev day)
];
const d = computeDashboard({
  quotes,
  openQuotes: [{ id: "b", amount: 500 }, { id: "f", amount: 100 }],
  overdueQuoteIds: new Set(["f"]),
  timezone: "UTC", days: 7, now,
});

assert.deepEqual(d.range, { start: "2026-11-04", end: "2026-11-10", prevStart: "2026-10-28", prevEnd: "2026-11-03" });
assert.equal(d.quoted.cur, 1500);          // a + b
assert.equal(d.quoted.prev, 2400);         // c + d + f
assert.equal(d.created.cur, 2);
assert.equal(d.created.prev, 3);
assert.equal(d.won.cur, 900 + 800);        // collected for a, amount for e
assert.equal(d.won.estimatedCur, 1000 + 800);
assert.equal(d.won.prev, 300);
assert.equal(d.conversion.wonN, 2);
assert.equal(d.conversion.lostN, 1);
assert.ok(Math.abs(d.conversion.cur! - 66.6667) < 0.01);
assert.equal(d.conversion.prev, 100);      // d won, no losses in prev
assert.equal(d.lostValue.cur, 2000);
assert.equal(d.openValue, 600);
assert.equal(d.atRiskValue, 100);
assert.equal(d.atRiskCount, 1);
assert.equal(d.quoted.curSeries[0], 1000); // Nov 4
assert.equal(d.quoted.curSeries[6], 500);  // Nov 10
assert.equal(d.quoted.prevSeries[0], 300); // Oct 28
assert.equal(d.quoted.prevSeries[6], 100); // Nov 3
assert.equal(d.won.curSeries[2], 900);     // Nov 6
assert.equal(pctChange(150, 100), 50);
assert.equal(pctChange(5, 0), null);
assert.equal(pctChange(0, 0), 0);

// Time zone: 23:30 UTC on Nov 9 is already Nov 10 in Cairo (UTC+2).
const tz = computeDashboard({
  quotes: [{ id: "z", amount: 50, collected_amount: null, currency: "USD", created_at: "2026-11-09T23:30:00Z", closed_at: null, kind: "open" }],
  openQuotes: [], overdueQuoteIds: new Set(), timezone: "Africa/Cairo", days: 7, now,
});
assert.equal(tz.quoted.curSeries[6], 50);
console.log("analytics tests passed");
