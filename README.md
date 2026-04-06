# OpenCode Team Setup

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/rafaelbm/dotfiles-opencode)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/rafaelbm/dotfiles-opencode)

> Interactive setup for sharing an OpenCode configuration across a team.

This repository packages a reusable OpenCode configuration and an interactive CLI that helps install, update, back up, and restore that configuration safely.

## What this repo gives you

- A guided CLI setup flow for installing or updating the configuration
- Automatic safety backups before any managed configuration is overwritten
- Backup restore from the 5 most recent backups
- A reusable `opencode/` directory with agents, skills, and shared config

## Quick start

Run everything from the repository root:

```bash
npm install
npm run setup
```

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
5. Create a safety backup before importing managed files
6. Import the managed configuration
7. Verify the result

### Managed files

The installer manages only these entries inside `~/.config/opencode/`:

- `opencode.json`
- `AGENTS.md`
- `agents/`
- `skills/`

Backups and restores are limited to that same set.

### Useful flags

- `--dry-run` previews the installation without writing files
- `--force` skips confirmation prompts
- `--skip-opencode-check` skips the OpenCode installation check
- `--verbose` enables detailed logs

## Repository layout

- [`opencode/`](/Users/rafa/workspace/personal/dotfiles-opencode/opencode) contains the shared OpenCode configuration
- [`cli/`](/Users/rafa/workspace/personal/dotfiles-opencode/cli) contains the interactive installer
- [`opencode/README.md`](/Users/rafa/workspace/personal/dotfiles-opencode/opencode/README.md) explains the framework itself

## Framework documentation

If you want to understand how the agentic workflow is organized, how the agents are split, and what the configuration inside `opencode/` is doing, see:

- [`opencode/README.md`](/Users/rafa/workspace/personal/dotfiles-opencode/opencode/README.md)

## Manual installation

If you prefer not to use the installer, you can still copy the managed files manually into:

```bash
~/.config/opencode/
```

## Troubleshooting

- If prerequisites such as Node.js, npm, or Git are missing, install them first and rerun `npm run setup`
- If OpenCode is missing, the CLI can guide you through installing it
- If something goes wrong, use the backup restore option from the setup menu
