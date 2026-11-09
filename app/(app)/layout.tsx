import Link from "next/link";
import { getCurrentBusiness } from "@/lib/business";
import { SignOutButton } from "@/components/SignOutButton";
import { SidebarNav, MobileNav } from "@/components/Nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const business = await getCurrentBusiness();
  const initial = business.name.trim().charAt(0).toUpperCase() || "L";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 flex h-14 items-center gap-4 bg-topbar px-4 text-white">
        <Link href="/dashboard" className="text-lg font-bold md:w-48">
          Lost<span className="text-emerald-400">Quote</span>
        </Link>
        <form action="/customers" className="mx-auto hidden w-full max-w-xl sm:block">
          <input
            name="q"
            placeholder="Search customers"
            className="w-full rounded-lg bg-white/15 px-3 py-1.5 text-sm text-white placeholder:text-slate-300 outline-none focus:bg-white focus:text-navy focus:placeholder:text-muted"
          />
        </form>
        <div className="ms-auto flex items-center gap-2">
          <span className="hidden max-w-40 truncate text-sm text-slate-200 sm:block">{business.name}</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold">
            {initial}
          </span>
          <SignOutButton />
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-56 shrink-0 border-e border-slate-200 bg-[#ebebeb] md:block">
          <SidebarNav />
        </aside>
        <main className="min-w-0 flex-1 p-4 pb-24 sm:p-8 md:pb-8">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
