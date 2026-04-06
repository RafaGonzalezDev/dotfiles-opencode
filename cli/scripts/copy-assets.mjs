import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliDir = path.resolve(__dirname, '..');
const sourceDir = path.resolve(cliDir, '..', 'frameworks');
const targetDir = path.resolve(cliDir, 'dist', 'assets', 'frameworks');

if (!fs.existsSync(sourceDir)) {
  throw new Error(`Missing frameworks assets directory: ${sourceDir}`);
}

fs.rmSync(targetDir, { recursive: true, force: true });
fs.mkdirSync(path.dirname(targetDir), { recursive: true });
fs.cpSync(sourceDir, targetDir, { recursive: true });
