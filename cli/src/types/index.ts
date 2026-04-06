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
  installMethods: OpenCodeInstallMethod[];
}

export type OpenCodeInstallMethod = 'homebrew' | 'npm';

export interface FrameworkDefinition {
  id: string;
  name: string;
  path: string;
  readmePath?: string;
}

export interface ConfigFile {
  path: string;
  status: 'new' | 'different' | 'identical' | 'missing';
  repoHash?: string;
  currentHash?: string;
}

export interface ConfigDetectionResult {
  configDirExists: boolean;
  frameworkId: string;
  files: ConfigFile[];
}

export interface BackupManifest {
  version: 1;
  createdAt: string;
  frameworkId: string | null;
  entries: string[];
}

export interface BackupResult {
  success: boolean;
  backupPath: string | null;
  filesBackedUp: number;
  frameworkId?: string | null;
  error?: string;
}

export interface BackupEntry {
  name: string;
  path: string;
  createdAt: string;
  filesBackedUp: number;
  frameworkId?: string | null;
}

export interface InstallResult {
  status: 'success' | 'partial' | 'failed' | 'skipped';
  success: boolean;
  filesInstalled: number;
  frameworkId?: string;
  errors: string[];
}

export interface VerifyResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface OpenCodeUpdateResult {
  status: 'idle' | 'skipped' | 'success' | 'failed';
  method: OpenCodeInstallMethod | null;
  previousVersion?: string | null;
  currentVersion?: string | null;
  error?: string;
}
