/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NEXT_PUBLIC_ENABLE_STANDALONE_OUTPUT
    ? "standalone"
    : undefined,
  basePath: process.env.NEXT_BASE_PATH || undefined,
  // Allow this site to be embedded in iframes (for demo purposes)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
