import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const platformName = env.VITE_PUBLIC_PLATFORM_NAME || 'Limpamais';
  const pwaShortName = env.VITE_PUBLIC_PWA_SHORT_NAME || 'Limpamais';
  const pwaDescription = env.VITE_PUBLIC_PWA_DESCRIPTION || `Painel administrativo ${platformName}`;

  return {
    server: {
    host: "::",
    port: 8080,
    headers: mode === 'production' ? {
      // 🔒 SECURITY: CSP mais restritivo (removido unsafe-inline/unsafe-eval)
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' https://cdn.jsdelivr.net https://*.facebook.net",
        "style-src 'self' https://fonts.googleapis.com",
        "font-src 'self' data: https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://yyrnshankehiqvkndrwk.supabase.co wss://yyrnshankehiqvkndrwk.supabase.co https://graph.facebook.com https://api.ultramsg.com",
        "frame-src 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "upgrade-insecure-requests",
      ].join('; '),
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    } : {},
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icon-512x512.png', 'icon-192x192.png'],
      manifest: {
        name: `${platformName} - Admin`,
        short_name: pwaShortName,
        description: pwaDescription,
        theme_color: '#0EA5E9',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/admin',
        start_url: '/admin',
        categories: ['business', 'productivity'],
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Agendamentos',
            short_name: 'Agendamentos',
            description: 'Ver agendamentos recentes',
            url: '/admin/agendamentos',
            icons: [{ src: '/icon-192x192.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024, // 15 MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/yyrnshankehiqvkndrwk\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24
              }
            }
          }
        ],
        // Injetar código customizado de push notifications
        additionalManifestEntries: [
          { url: '/sw-push.js', revision: null }
        ]
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        injectionPoint: undefined
      },
      devOptions: {
        enabled: true
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Keep symlink/junction paths stable in Windows worktrees to avoid build path normalization issues.
    preserveSymlinks: true,
    // Prevent duplicate React instances (fixes react-leaflet compatibility)
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
  };
});
