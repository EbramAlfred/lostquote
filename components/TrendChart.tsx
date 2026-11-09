"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

const CUR = "#7c5cff";
const PREV = "#c4c4c8";

type Props = {
  dates: string[]; // current period dates (YYYY-MM-DD)
  prevDates: string[];
  cur: number[];
  prev: number[];
  kind: "money" | "count";
  currency: string;
  curLabel: string;
  prevLabel: string;
};

const short = (d: string) =>
  new Date(d + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

export function TrendChart({ dates, prevDates, cur, prev, kind, currency, curLabel, prevLabel }: Props) {
  const data = dates.map((d, i) => ({ i, date: d, prevDate: prevDates[i], cur: cur[i], prev: prev[i] }));

  const fmt = (n: number, compact = false) =>
    kind === "count"
      ? String(Math.round(n))
      : new Intl.NumberFormat("en-US", {
          style: "currency",
          currency,
          notation: compact ? "compact" : "standard",
          maximumFractionDigits: compact ? 1 : 2,
        }).format(n);

  const every = Math.max(1, Math.ceil(dates.length / 6));
  const hasData = cur.some((n) => n > 0) || prev.some((n) => n > 0);

  return (
    <div>
      <div className="relative h-44 w-full">
        {!hasData && (
          <p className="absolute inset-0 z-10 flex items-center justify-center text-sm text-muted">
            No data in this period yet
          </p>
        )}
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#ececec" vertical={false} />
            <XAxis
              dataKey="i"
              tickLine={false}
              axisLine={{ stroke: "#e3e3e3" }}
              tick={{ fontSize: 11, fill: "#616161" }}
              interval={0}
              tickFormatter={(i: number) => (i % every === 0 ? short(dates[i]) : "")}
            />
            <YAxis
              width={48}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#616161" }}
              tickFormatter={(n: number) =>
                kind === "count" ? String(n) : new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n)
              }
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ stroke: "#bdbdbd", strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as (typeof data)[number];
                return (
                  <div className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs shadow-lg">
                    <p className="flex items-center gap-2 font-medium text-navy">
                      <span className="h-2 w-2 rounded-full" style={{ background: CUR }} />
                      {short(p.date)}: {fmt(p.cur)}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-muted">
                      <span className="h-2 w-2 rounded-full" style={{ background: PREV }} />
                      {short(p.prevDate)}: {fmt(p.prev)}
                    </p>
                  </div>
                );
              }}
            />
            <Line type="monotone" dataKey="prev" stroke={PREV} strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="cur" stroke={CUR} strokeWidth={2.5} dot={false} activeDot={{ r: 4, stroke: "#fff", strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-muted">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: PREV }} />{prevLabel}</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: CUR }} />{curLabel}</span>
      </div>
    </div>
  );
}
