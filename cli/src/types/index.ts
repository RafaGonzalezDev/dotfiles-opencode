export type OSType = 'macos' | 'linux' | 'windows' | 'windows-wsl' | 'unknown';

export interface SystemInfo {
  os: OSType;
  nodeVersion: string | null;
  npmVersion: string | null;
  gitVersion: string | null;
  homebrewInstalled: boolean;
  shell: string;
  isElevated: boolean;
}

export interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  version?: string;
}

export interface OpenCodeStatus {
  installed: boolean;
  version: string | null;
  path: string | null;
}

export interface ConfigFile {
  path: string;
  status: 'new' | 'different' | 'identical' | 'missing';
  repoHash?: string;
  currentHash?: string;
}

export interface ConfigDetectionResult {
  configDirExists: boolean;
  files: ConfigFile[];
}

export interface BackupResult {
  success: boolean;
  backupPath: string | null;
  filesBackedUp: number;
  error?: string;
}

export interface BackupEntry {
  name: string;
  path: string;
  createdAt: string;
  filesBackedUp: number;
}

export interface InstallResult {
  status: 'success' | 'partial' | 'failed';
  success: boolean;
  filesInstalled: number;
  errors: string[];
}

export interface VerifyResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
