import type { NextConfig } from "next";

// Vercel-friendly config (no standalone output)
const nextConfig: NextConfig = {
  // ❌ No usar output: "standalone" en Vercel — causa errores de build
  // ✅ Sin output = Vercel usa su propia infra serverless
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // ⚠️ z-ai-web-dev-sdk es server-only, evitar que se incluya en client bundle
  serverExternalPackages: [
    'z-ai-web-dev-sdk',
    'pptxgenjs',
    'docx',
    'xlsx',
    'jspdf',
    'jspdf-autotable',
    '@prisma/client',
    'prisma',
    'sharp',
  ],
  // Headers de seguridad (aplica a todas las rutas)
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
