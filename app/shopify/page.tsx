import type { Metadata } from "next";
import Script from "next/script";
import { ShopifyEmbedded } from "@/components/ShopifyEmbedded";

export const metadata: Metadata = {
  title: "LostQuote for Shopify",
  other: { "shopify-api-key": process.env.NEXT_PUBLIC_SHOPIFY_API_KEY ?? "" },
};

// The page Shopify loads inside the admin iframe. It needs no LostQuote login:
// it proves who the merchant is with the App Bridge ID token instead.
export default function ShopifyEntry() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lostquote.vercel.app";
  return (
    <>
      <Script src="https://cdn.shopify.com/shopifycloud/app-bridge.js" strategy="beforeInteractive" />
      <ShopifyEmbedded appUrl={appUrl} />
    </>
  );
}
