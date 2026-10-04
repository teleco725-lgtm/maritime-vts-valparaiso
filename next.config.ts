import type { NextConfig } from "next";

// Vercel-friendly config
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Solo paquetes que realmente necesitan ser externos
  // @prisma/client y prisma NO deben ir aquí en Vercel
  serverExternalPackages: [
    'z-ai-web-dev-sdk',
    'pptxgenjs',
    'docx',
    'xlsx',
    'jspdf',
    'jspdf-autotable',
    'sharp',
  ],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=()' },
        ],
      },
    ]
  },
};

export default nextConfig;
