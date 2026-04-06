import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

function getModuleDir(): string {
  return path.dirname(fileURLToPath(import.meta.url));
}

export function getHomeDir(): string {
  return (
    process.env.HOME ||
    process.env.USERPROFILE ||
    (process.env.HOMEDRIVE && process.env.HOMEPATH
      ? path.join(process.env.HOMEDRIVE, process.env.HOMEPATH)
      : '')
  );
}

export function getConfigDir(): string {
  return path.join(getHomeDir(), '.config', 'opencode');
}

export function getOpencodeSourceDir(): string {
  const moduleDir = getModuleDir();
  const candidates = [
    path.resolve(moduleDir, '..', 'assets', 'opencode'),
    path.resolve(moduleDir, '..', '..', '..', 'opencode'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    `OpenCode assets directory not found. Expected one of: ${candidates.join(', ')}`
  );
}
