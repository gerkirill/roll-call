import { readFileSync } from 'node:fs';
import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

import { validateChangelog } from './src/lib/changelog';

function changelogAsset(): Plugin {
  const changelogPath = path.resolve(import.meta.dirname, '..', '..', 'CHANGELOG.md');

  return {
    name: 'changelog-asset',
    apply: 'build',
    generateBundle() {
      const source = readFileSync(changelogPath, 'utf8');
      validateChangelog(source);
      this.emitFile({ type: 'asset', fileName: 'changelog.md', source });
    },
  };
}

const rawPort = process.env.PORT ?? '5173';

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? '/';

function pagesFallback(): Plugin {
  return {
    name: 'pages-fallback',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const index = bundle['index.html'];
      if (!index || index.type !== 'asset') {
        throw new Error('Missing app shell for the GitHub Pages fallback.');
      }
      this.emitFile({ type: 'asset', fileName: '404.html', source: index.source });
    },
  };
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    changelogAsset(),
    pagesFallback(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      manifest: {
        name: 'Перекличка',
        short_name: 'Перекличка',
        description: 'Перекличка особового складу',
        lang: 'uk-UA',
        dir: 'ltr',
        theme_color: '#2d4a1e',
        background_color: '#1a1c18',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        globIgnores: ['**/changelog.md'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.endsWith('/changelog.md'),
            handler: 'NetworkOnly',
          },
        ],
      },
    }),

  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'attached_assets',
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
