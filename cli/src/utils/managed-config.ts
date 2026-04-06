export const REQUIRED_FRAMEWORK_FILES = ['AGENTS.md', 'opencode.json'] as const;
export const MANAGED_CONFIG_DIRECTORIES = ['agents', 'skills'] as const;

export const REQUIRED_FRAMEWORK_ENTRIES = [
  ...REQUIRED_FRAMEWORK_FILES,
  ...MANAGED_CONFIG_DIRECTORIES,
] as const;

export const MANAGED_CONFIG_FILES = [...REQUIRED_FRAMEWORK_FILES] as const;

export const MANAGED_CONFIG_ENTRIES = [
  ...MANAGED_CONFIG_FILES,
  ...MANAGED_CONFIG_DIRECTORIES,
] as const;
