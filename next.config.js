/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tree-shake `@stellar/design-system` — without this, the barrel ships
  // every component (Modal, Tooltip, the full icon set, etc.) even though
  // we only render Card, Badge, Logo, ThemeSwitch, and a few icons.
  experimental: {
    optimizePackageImports: ["@stellar/design-system"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://stellar.org https://*.stellar.org https://stellar-playground-two.vercel.app",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
