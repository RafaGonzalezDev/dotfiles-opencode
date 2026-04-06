export const MANAGED_CONFIG_FILES = ['opencode.json', 'AGENTS.md'] as const;
export const MANAGED_CONFIG_DIRECTORIES = ['agents', 'skills'] as const;
export const MANAGED_CONFIG_ENTRIES = [
  ...MANAGED_CONFIG_FILES,
  ...MANAGED_CONFIG_DIRECTORIES,
] as const;
