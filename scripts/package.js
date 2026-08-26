import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const releaseDir = path.join(rootDir, 'release');

console.info('Starting Chrome Extension packaging...');

// 1. Verify dist directory
if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory does not exist. Run "npm run build" first.');
  process.exit(1);
}

// 2. Read version from manifest
const manifestPath = path.join(distDir, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('Error: dist/manifest.json is missing.');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
const version = manifest.version || '1.0.0';

// 3. Create release directory
if (!fs.existsSync(releaseDir)) {
  fs.mkdirSync(releaseDir, { recursive: true });
}

const zipFileName = `audio-enhancer-v${version}.zip`;
const zipFilePath = path.join(releaseDir, zipFileName);

// Remove old zip if it exists
if (fs.existsSync(zipFilePath)) {
  fs.unlinkSync(zipFilePath);
}

// 4. Create ZIP archive
try {
  console.info(`Creating release archive: release/${zipFileName}`);
  execSync(`cd "${distDir}" && zip -r -9 "${zipFilePath}" ./*`, { stdio: 'inherit' });
  
  const stats = fs.statSync(zipFilePath);
  const sizeKb = (stats.size / 1024).toFixed(2);
  console.info(`✅ Successfully packaged: ${zipFilePath} (${sizeKb} KB)`);
  console.info('Extension is ready for Chrome Web Store submission or unpacked installation.');
} catch (err) {
  console.error('Failed to create ZIP package:', err);
  process.exit(1);
}
