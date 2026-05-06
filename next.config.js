/** @type {import('next').NextConfig} */
const nextConfig = {
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
