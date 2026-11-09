import Link from "next/link";

export const card = "rounded-xl border border-black/[.08] bg-white shadow-[0_1px_2px_rgba(0,0,0,.04)]";
export const btnPrimary =
  "inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark active:scale-[.98] disabled:opacity-60";
export const btnGhost =
  "inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-navy transition hover:bg-slate-50 active:scale-[.98] disabled:opacity-60";
export const field =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-navy outline-none transition focus:border-navy focus:ring-2 focus:ring-black/10";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: { href: string; label: string } | null;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-navy sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {action && (
        <Link href={action.href} className={btnPrimary}>
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function Empty({
  title,
  text,
  action,
}: {
  title: string;
  text?: string;
  action?: { href: string; label: string } | null;
}) {
  return (
    <div className={`${card} border-dashed p-10 text-center`}>
      <p className="font-medium text-navy">{title}</p>
      {text && <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{text}</p>}
      {action && (
        <Link href={action.href} className={`${btnPrimary} mt-4`}>
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function StatusBadge({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: color + "1a", color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {name}
    </span>
  );
}
