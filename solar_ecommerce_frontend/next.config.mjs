/** @type {import('next').NextConfig} */

// Allow remote images from the API host. Configure additional hosts via
// NEXT_PUBLIC_IMAGE_HOSTS="cdn.example.com,media.example.com" in production.
function parseRemotePatterns() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const extra = (process.env.NEXT_PUBLIC_IMAGE_HOSTS || '')
    .split(',')
    .map((h) => h.trim())
    .filter(Boolean);
  const patterns = [
    { protocol: 'http', hostname: 'localhost' },
    { protocol: 'http', hostname: '127.0.0.1' },
  ];
  if (apiUrl) {
    try {
      const url = new URL(apiUrl);
      patterns.push({ protocol: url.protocol.replace(':', ''), hostname: url.hostname });
    } catch {
      /* ignore malformed url */
    }
  }
  for (const host of extra) {
    patterns.push({ protocol: 'https', hostname: host });
  }
  return patterns;
}

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  output: 'standalone',
  images: {
    remotePatterns: parseRemotePatterns(),
    formats: ['image/webp'],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
