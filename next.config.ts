import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only the Shopify entry page may be shown inside the Shopify admin iframe.
  async headers() {
    return [
      {
        source: "/shopify",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors https://admin.shopify.com https://*.myshopify.com;" },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
