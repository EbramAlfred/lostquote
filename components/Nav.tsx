"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/dashboard", label: "Home" },
  { href: "/customers", label: "Customers" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="hidden space-y-0.5 p-3 md:block">
      {ITEMS.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          className={`block rounded-lg px-3 py-2 text-sm font-medium ${
            isActive(pathname, i.href)
              ? "bg-white text-navy shadow-sm"
              : "text-muted hover:bg-black/5"
          }`}
        >
          {i.label}
        </Link>
      ))}
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-slate-200 bg-white md:hidden">
      {ITEMS.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          className={`flex-1 py-3 text-center text-sm font-medium ${
            isActive(pathname, i.href) ? "text-navy" : "text-muted"
          }`}
        >
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
