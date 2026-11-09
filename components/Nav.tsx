"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useT } from "@/components/LangProvider";
import type { Key } from "@/lib/i18n";

type IconProps = { className?: string };
const base = "h-5 w-5 shrink-0";
const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const Icons = {
  home: ({ className = base }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} {...stroke}><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></svg>
  ),
  quote: ({ className = base }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} {...stroke}><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 13h7M9 17h7" /></svg>
  ),
  bell: ({ className = base }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} {...stroke}><path d="M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7z" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>
  ),
  users: ({ className = base }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} {...stroke}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" /></svg>
  ),
  chart: ({ className = base }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} {...stroke}><path d="M4 20V10M10 20V4M16 20v-8M22 20H2" /></svg>
  ),
  mind: ({ className = base }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} {...stroke}><circle cx="12" cy="12" r="9" /><path d="M8.5 14.5s1.3 2 3.5 2 3.5-2 3.5-2M9 9.5h.01M15 9.5h.01" /></svg>
  ),
  chevron: ({ className = "h-4 w-4" }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} {...stroke}><path d="M6 9l6 6 6-6" /></svg>
  ),
};

function active(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

const itemClass = (on: boolean) =>
  `group flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors ${
    on ? "bg-white text-navy shadow-[0_1px_0_rgba(0,0,0,.06)]" : "text-[#4a4a4a] hover:bg-black/[.05]"
  }`;

export function SidebarNav({ overdue }: { overdue: number }) {
  const t = useT();
  const pathname = usePathname();
  const analyticsOn = pathname.startsWith("/analytics");
  const [open, setOpen] = useState(true);

  return (
    <nav className="space-y-0.5 p-3" aria-label="Main">
      <Link href="/dashboard" className={itemClass(pathname === "/dashboard")}>
        <Icons.home /> {t("nav.home")}
      </Link>
      <Link href="/quotations" className={itemClass(active(pathname, "/quotations"))}>
        <Icons.quote /> {t("nav.quotations")}
      </Link>
      <Link href="/follow-ups" className={itemClass(active(pathname, "/follow-ups"))}>
        <Icons.bell /> {t("nav.followups")}
        {overdue > 0 && (
          <span className="ms-auto rounded-full bg-danger px-2 py-0.5 text-[11px] font-semibold text-white">
            {overdue}
          </span>
        )}
      </Link>
      <Link href="/customers" className={itemClass(active(pathname, "/customers"))}>
        <Icons.users /> {t("nav.customers")}
      </Link>

      <div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className={`${itemClass(analyticsOn && !open)} w-full`}
        >
          <Icons.chart /> {t("nav.analytics")}
          <Icons.chevron className={`ms-auto h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div className="mt-0.5 ms-[22px] space-y-0.5 border-s border-black/10 ps-2">
            <Link
              href="/analytics"
              className={`block rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
                pathname === "/analytics" ? "bg-white text-navy shadow-[0_1px_0_rgba(0,0,0,.06)]" : "text-[#4a4a4a] hover:bg-black/[.05]"
              }`}
            >
              {t("nav.dashboard")}
            </Link>
          </div>
        )}
      </div>

      <div className="pt-3">
        <p className="px-3 pb-1 text-xs font-medium text-muted">{t("nav.salesSkills")}</p>
        <Link href="/personality" className={itemClass(active(pathname, "/personality"))}>
          <Icons.mind /> {t("nav.clientTypes")}
        </Link>
      </div>
    </nav>
  );
}

const MOBILE: { href: string; label: Key; icon: typeof Icons.home }[] = [
  { href: "/dashboard", label: "nav.home", icon: Icons.home },
  { href: "/quotations", label: "nav.quotesShort", icon: Icons.quote },
  { href: "/follow-ups", label: "nav.followups", icon: Icons.bell },
  { href: "/customers", label: "nav.customers", icon: Icons.users },
  { href: "/analytics", label: "nav.analytics", icon: Icons.chart },
];

export function MobileNav({ overdue }: { overdue: number }) {
  const t = useT();
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-black/10 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden" aria-label="Main">
      {MOBILE.map((i) => {
        const on = i.href === "/dashboard" ? pathname === i.href : active(pathname, i.href);
        const Icon = i.icon;
        return (
          <Link key={i.href} href={i.href}
            className={`relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${on ? "text-navy" : "text-muted"}`}>
            <Icon className="h-5 w-5" />
            {t(i.label)}
            {i.href === "/follow-ups" && overdue > 0 && (
              <span className="absolute end-[22%] top-1 h-2 w-2 rounded-full bg-danger" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
