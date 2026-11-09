import { cookies } from "next/headers";
import { LANG_COOKIE, isLang, tr, type Key, type Lang } from "@/lib/i18n";

// Server-side: read the visitor's language from a cookie (default English).
export async function getLang(): Promise<Lang> {
  const v = (await cookies()).get(LANG_COOKIE)?.value;
  return isLang(v) ? v : "en";
}

export async function getT() {
  const lang = await getLang();
  return { lang, t: (key: Key, vars?: Record<string, string>) => tr(lang, key, vars) };
}
