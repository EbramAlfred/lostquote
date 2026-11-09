"use client";

import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { LANG_COOKIE, tr, type Key, type Lang } from "@/lib/i18n";

const Ctx = createContext<Lang>("en");

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <Ctx.Provider value={lang}>{children}</Ctx.Provider>;
}

export function useLang(): Lang {
  return useContext(Ctx);
}

export function useT() {
  const lang = useContext(Ctx);
  return (key: Key, vars?: Record<string, string>) => tr(lang, key, vars);
}

export function LangSwitch() {
  const lang = useLang();
  const router = useRouter();
  const t = useT();
  return (
    <button
      type="button"
      onClick={() => {
        const next: Lang = lang === "ar" ? "en" : "ar";
        document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
        router.refresh();
      }}
      className="rounded-lg border border-white/25 px-2.5 py-1 text-sm font-medium text-white transition hover:bg-white/10"
      aria-label="Switch language"
    >
      {t("top.switch")}
    </button>
  );
}
