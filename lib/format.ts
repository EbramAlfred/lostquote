// Shared formatting + date helpers (pure functions, safe on server and client).

export function money(value: number, currency: string, compact = false): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: compact ? 1 : 2,
      notation: compact && Math.abs(value) >= 10000 ? "compact" : "standard",
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

/** Today's date (YYYY-MM-DD) in the given IANA time zone. */
export function todayIn(timezone: string, now = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(now);
  } catch {
    return now.toISOString().slice(0, 10);
  }
}

/** Add whole days to a YYYY-MM-DD string (calendar math, no time zone surprises). */
export function addDays(date: string, days: number): string {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  return Math.round(
    (new Date(to + "T00:00:00Z").getTime() - new Date(from + "T00:00:00Z").getTime()) / 86400000
  );
}

export function prettyDate(date: string): string {
  return new Date(date + "T00:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function quoteCode(n: number): string {
  return "Q-" + String(n).padStart(4, "0");
}

export const CURRENCIES = ["USD", "EUR", "GBP", "EGP", "SAR", "AED", "KWD", "QAR", "CAD", "AUD", "INR"];
