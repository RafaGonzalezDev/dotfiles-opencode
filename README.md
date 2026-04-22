# OpenCode Team Setup

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/rafaelbm/dotfiles-opencode)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/rafaelbm/dotfiles-opencode)

> Interactive setup for sharing an OpenCode configuration across a team.

This repository packages one or more reusable OpenCode frameworks and an interactive CLI that helps install, switch, back up, and restore them safely.

## What this repo gives you

- A guided CLI setup flow for installing or updating the configuration
- Automatic safety backups before any managed configuration is overwritten
- Transactional framework installs with automatic rollback on blocking failures
- Backup restore from the 5 most recent backups, including compatibility with legacy v1 snapshots
- A versioned `frameworks/` catalog with agents, skills, and shared config

## Quick start

Run everything from the repository root:

```bash
npm install
npm run setup
```

`npm run start` also builds the CLI automatically before launching it, so it is safe to rerun directly from the repository root.

The setup flow lets you:

- install or update the OpenCode configuration
- restore a previous backup
- review the local environment before continuing

## CLI behavior

The installer will:

1. Check the current environment
2. Detect whether OpenCode is already installed
3. Offer Homebrew or npm installation when needed
4. Detect an existing OpenCode configuration
5. Create a safety backup before replacing managed files
6. Stage the selected framework and apply it transactionally
7. Roll back automatically if apply or verification fails
8. Verify the final managed configuration against the selected framework

### Managed files

The installer manages only these entries inside `~/.config/opencode/`:

- `AGENTS.md`
- `agents/`
- `skills/`
- `opencode.json`

Backups and restores are limited to that same set. New backups use a v2 manifest with per-file hashes and permissions; existing v1 backups remain restorable.

### Safety rules

- Symbolic links are not supported anywhere inside managed entries or installable frameworks.
- If the CLI cannot inspect the current managed tree safely, it aborts before installation.
- Framework installs and backup restores use staging plus rollback instead of in-place destructive replacement.

### Runtime installation notes

- Homebrew is only automated when `brew` is already present.
- If Homebrew is missing, the CLI shows the official Homebrew install command instead of running it automatically.
- The Homebrew OpenCode command now uses the official tap:

```bash
brew install anomalyco/tap/opencode
```

- If the selected method installs OpenCode successfully but the active shell `PATH` still points elsewhere, the CLI reports a warning instead of treating the install as corrupt.

### Useful flags

- `--dry-run` previews the installation without writing files
- `--force` skips confirmation prompts
- `--skip-opencode-check` skips the OpenCode installation check
- `--verbose` enables detailed logs

## Repository layout

- [`frameworks/`](/home/rafa/workspace/dotfiles-opencode/frameworks) contains the installable OpenCode frameworks
- [`cli/`](/home/rafa/workspace/dotfiles-opencode/cli) contains the interactive installer
- [`frameworks/vanilla/README.md`](/home/rafa/workspace/dotfiles-opencode/frameworks/vanilla/README.md) explains the minimal vanilla framework
- [`frameworks/orchestrated/README.md`](/home/rafa/workspace/dotfiles-opencode/frameworks/orchestrated/README.md) explains the orchestrated framework
- [`frameworks/streamlined/README.md`](/home/rafa/workspace/dotfiles-opencode/frameworks/streamlined/README.md) explains the streamlined framework
- [`frameworks/blueprint/README.md`](/home/rafa/workspace/dotfiles-opencode/frameworks/blueprint/README.md) explains the blueprint framework

## Framework documentation

If you want to understand how the agentic workflow is organized, how the agents are split, and what each framework profile is doing, see:

- [`frameworks/vanilla/README.md`](/home/rafa/workspace/dotfiles-opencode/frameworks/vanilla/README.md)
- [`frameworks/orchestrated/README.md`](/home/rafa/workspace/dotfiles-opencode/frameworks/orchestrated/README.md)
- [`frameworks/streamlined/README.md`](/home/rafa/workspace/dotfiles-opencode/frameworks/streamlined/README.md)
- [`frameworks/blueprint/README.md`](/home/rafa/workspace/dotfiles-opencode/frameworks/blueprint/README.md)

## Manual installation

If you prefer not to use the installer, you can still copy the managed files manually into:

```bash
~/.config/opencode/
```

## Troubleshooting

- If prerequisites such as Node.js, npm, or Git are missing, install them first and rerun `npm run setup`
- If OpenCode is missing, the CLI can guide you through installing it
- If the CLI reports a PATH warning after installing OpenCode, open a new shell or refresh your environment and rerun `opencode --version`
- If something goes wrong, use the backup restore option from the setup menu
