import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "@fontsource-variable/noto-sans-arabic";
import "./globals.css";
import { getLang } from "@/lib/lang";
import { dirOf } from "@/lib/i18n";
import { LangProvider } from "@/components/LangProvider";

export const metadata: Metadata = {
  title: "LostQuote – The Follow-up Assistant",
  description: "Never lose another customer because you forgot to follow up.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang} dir={dirOf(lang)} className={`${GeistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <LangProvider lang={lang}>{children}</LangProvider>
      </body>
    </html>
  );
}
