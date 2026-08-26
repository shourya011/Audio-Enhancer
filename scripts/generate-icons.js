import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const pythonScript = path.join(__dirname, 'generate-icons.py');
  execSync(`python3 "${pythonScript}"`, { stdio: 'inherit' });
  console.info('Icons generated successfully.');
} catch (error) {
  console.error('Failed to generate icons:', error);
  process.exit(1);
}
