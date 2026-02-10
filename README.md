# OpenCode Configuration

Personal OpenCode configuration for consistent workflow across different machines.

## Structure

```
opencode/
├── opencode.json       # Main config (models, MCP servers, permissions, agent overrides)
├── AGENTS.md          # Global agent behavior instructions
├── agents/            # Custom agents (*.md files)
└── skills/            # Agent skills (directories with SKILL.md)
```

## Installation

### Global configuration (recommended)

Copy files to OpenCode's global config directory:

**Windows:**

```
~/.config/opencode/
or
C:\Users\<username>\.config\opencode\
```

**Linux/macOS:**

```
~/.config/opencode/
```

**Commands:**

```bash
# Copy everything
cp -r opencode/* ~/.config/opencode/

# Or copy individually
cp opencode/opencode.json ~/.config/opencode/
cp opencode/AGENTS.md ~/.config/opencode/
cp -r opencode/agents ~/.config/opencode/
cp -r opencode/skills ~/.config/opencode/
```

### Per-project configuration (optional)

To override settings for a specific project, copy files to:

```
<project-root>/.opencode/
```

**What to copy per-project:**

- `AGENTS.md` → Project-specific instructions
- `agents/*.md` → Project-specific agents (optional)
- `opencode.json` → Project-specific settings (optional)

**Example:**

```bash
# Inside your project
mkdir -p .opencode
cp ~/dotfiles/opencode/AGENTS.md .opencode/
```

## Configuration priority

OpenCode loads configuration in this order (last wins):

1. Built-in defaults
2. Global: `~/.config/opencode/`
3. Project: `<project>/.opencode/`

## File descriptions

### opencode.json

Main configuration file containing:

- Model overrides for built-in agents (`@explore`, `@general`)
- MCP server settings
- Global permissions and tool access
- Custom agent configurations

### AGENTS.md

Markdown file with instructions that define agent behavior. Can be placed:

- Globally: `~/.config/opencode/AGENTS.md`
- Per-project: `<project>/AGENTS.md`

### agents/\*.md

Custom agent definitions. File name becomes agent name (e.g., `my-agent.md` → `my-agent`).

Each agent file contains:

- Frontmatter with config (`mode`, `model`, `tools`, `permissions`)
- Markdown content with agent instructions

### skills/

Agent skills loaded automatically. Each skill is a directory containing `SKILL.md`.

## Usage examples

**Switch between primary agents:**

- Press `Tab` in the TUI to cycle through available primary agents

**Invoke subagents:**

```
@explore search the codebase
@general solve this complex task
@my-custom-agent do something specific
```

**Start with specific agent:**

```bash
opencode --agent my-custom-agent
```

## Notes

- API keys are not stored in config files (configure with `/connect` command)
- MCP servers require Node.js and `npx` to be installed
- Skills are automatically discovered from `skills/` directories
- Agent markdown files (`.md`) take precedence over JSON config for the same agent name
