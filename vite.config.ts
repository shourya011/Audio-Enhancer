import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function chromeExtensionPlugin() {
  return {
    name: 'chrome-extension-post-build',
    closeBundle() {
      const distDir = resolve(__dirname, 'dist');
      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
      }

      // Copy manifest.json
      const manifestSrc = resolve(__dirname, 'manifest.json');
      const manifestDest = resolve(distDir, 'manifest.json');
      if (fs.existsSync(manifestSrc)) {
        fs.copyFileSync(manifestSrc, manifestDest);
      }

      // Copy icons
      const iconsSrc = resolve(__dirname, 'public/icons');
      const iconsDest = resolve(distDir, 'icons');
      if (fs.existsSync(iconsSrc)) {
        if (!fs.existsSync(iconsDest)) {
          fs.mkdirSync(iconsDest, { recursive: true });
        }
        const files = fs.readdirSync(iconsSrc);
        for (const file of files) {
          fs.copyFileSync(resolve(iconsSrc, file), resolve(iconsDest, file));
        }
      }

      // Ensure popup and offscreen directories exist at dist root matching manifest
      const srcDirInDist = resolve(distDir, 'src');
      if (fs.existsSync(srcDirInDist)) {
        // Move dist/src/popup to dist/popup
        const distPopup = resolve(distDir, 'popup');
        const srcPopup = resolve(srcDirInDist, 'popup');
        if (fs.existsSync(srcPopup)) {
          if (!fs.existsSync(distPopup)) fs.mkdirSync(distPopup, { recursive: true });
          for (const f of fs.readdirSync(srcPopup)) {
            fs.copyFileSync(resolve(srcPopup, f), resolve(distPopup, f));
          }
        }

        // Move dist/src/offscreen to dist/offscreen
        const distOffscreen = resolve(distDir, 'offscreen');
        const srcOffscreen = resolve(srcDirInDist, 'offscreen');
        if (fs.existsSync(srcOffscreen)) {
          if (!fs.existsSync(distOffscreen)) fs.mkdirSync(distOffscreen, { recursive: true });
          for (const f of fs.readdirSync(srcOffscreen)) {
            fs.copyFileSync(resolve(srcOffscreen, f), resolve(distOffscreen, f));
          }
        }

        // Clean up src directory in dist
        fs.rmSync(srcDirInDist, { recursive: true, force: true });
      }
    }
  };
}

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
    minify: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.html'),
        offscreen: resolve(__dirname, 'src/offscreen/offscreen.html'),
        'background/service-worker': resolve(__dirname, 'src/background/service-worker.ts'),
        'content/content-script': resolve(__dirname, 'src/content/content-script.ts')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background/service-worker') {
            return 'background/service-worker.js';
          }
          if (chunkInfo.name === 'content/content-script') {
            return 'content/content-script.js';
          }
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/[name]-[hash].css';
          }
          return 'assets/[name]-[hash].[ext]';
        }
      }
    }
  },
  plugins: [chromeExtensionPlugin()]
});
