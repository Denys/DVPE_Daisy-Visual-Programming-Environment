# OpenCode Platform: Comprehensive Research Document

> **Research Date**: 2026-01-11
> **Primary Repository**: https://github.com/anomalyco/opencode
> **Documentation**: https://opencode.ai/docs

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Architecture & Design Philosophy](#2-architecture--design-philosophy)
3. [Tool System](#3-tool-system)
4. [Configuration System](#4-configuration-system)
5. [Rules System](#5-rules-system)
6. [Agents System](#6-agents-system)
7. [Commands System](#7-commands-system)
8. [Skills System](#8-skills-system)
9. [Plugin Architecture](#9-plugin-architecture)
10. [Directory Structure](#10-directory-structure)
11. [Comparison with Claude Code & Other Platforms](#11-comparison-with-claude-code--other-platforms)
12. [Best Practices & Integration Patterns](#12-best-practices--integration-patterns)

---

## 1. Platform Overview

### What is OpenCode?

OpenCode is an **open-source AI coding agent** designed as a terminal-first alternative to proprietary solutions like Claude Code and Cursor. Built by the team behind SST (Serverless Stack) and terminal.shop, OpenCode emphasizes developer experience through a powerful TUI (Terminal User Interface) while maintaining provider agnosticism.

**Key Statistics**:
- 60.8k+ GitHub stars
- 5.2k+ forks
- 534+ contributors
- 658 releases
- MIT License (100% open source)
- Primary language: TypeScript (83.7%)

### Core Value Proposition

OpenCode distinguishes itself through:

1. **Provider Agnosticism**: Works with Claude, OpenAI, Google, or local models - not coupled to any provider
2. **Open Source Commitment**: 100% open source with active community development
3. **Terminal Excellence**: Built by neovim enthusiasts pushing terminal UI boundaries
4. **Client-Server Architecture**: Run on one machine, control remotely from multiple clients
5. **LSP Support**: Out-of-the-box language server protocol support

### Installation Methods

**Command Line**:
```bash
curl -fsSL https://opencode.ai/install | bash
# or
npm i -g opencode-ai@latest
```

**Desktop Applications**: Available for macOS (Apple Silicon/Intel), Windows, and Linux via releases or Homebrew.

**Environment Variables**: Respects `$OPENCODE_INSTALL_DIR`, `$XDG_BIN_DIR`, `$HOME/bin` for installation paths.

---

## 2. Architecture & Design Philosophy

### Monorepo Structure

OpenCode uses a **TypeScript monorepo** with Turbo for build orchestration and Bun as the runtime.

**Technology Stack**:
- TypeScript (83.7%) - Primary language
- CSS (7.8%) - UI styling
- MDX (6.6%) - Documentation
- Rust (0.5%) - Performance-critical components
- Shell (1.4%) - Build scripts

**Key Directories**:
```
anomalyco/opencode/
├── packages/          # Core modules and services
│   ├── console/       # Terminal UI application
│   ├── web/          # Web interface and landing pages
│   └── [others]/     # Service packages for agent functionality
├── sdks/
│   └── vscode/       # VS Code extension SDK
├── infra/            # Infrastructure and deployment (SST)
├── specs/            # Specifications and protocols
├── .github/          # CI/CD workflows
└── .husky/           # Git commit hooks
```

### Design Philosophy

**1. Provider Agnosticism**
> "Not coupled to any provider. Can be used with Claude, OpenAI, Google or even local models."

This design decision protects users from vendor lock-in as AI models commoditize and pricing changes.

**2. Client-Server Architecture**

OpenCode employs a distributed model:
- **Server**: Manages state, coordinates AI provider calls, executes tools, streams events
- **Clients**: Multiple frontends (TUI, Web, VS Code) can connect to same backend
- **Remote Access**: Run server on one machine, control from mobile/remote clients

```bash
# Server on one machine
opencode serve --port 4096

# Client connects from anywhere
opencode attach http://10.20.30.40:4096
```

**Benefits**:
- Avoid cold-boot delays for MCP servers
- Persistent backend for team collaboration
- Resource-heavy operations run on powerful machines
- Control from lightweight clients (mobile, tablets)

**3. Terminal-First Focus**

Built by creators of terminal.shop, OpenCode prioritizes:
- Powerful TUI with vim-inspired navigation
- Leader key pattern (`ctrl+x`) for shortcuts
- Fuzzy file search with `@` syntax
- Command execution with `!` prefix
- Native terminal editor integration

**4. Local-First Data Storage**

All data stored locally as JSON files:
```
~/.local/share/opencode/
├── auth.json          # Provider credentials
├── sessions/          # Conversation history
└── [other state]/     # Application state
```

---

## 3. Tool System

### Built-in Tools Overview

OpenCode provides **13 built-in tools** that enable LLMs to interact with codebases. By default, all tools are enabled and don't need permission to run.

### Core File Operation Tools

#### 1. `read`
**Purpose**: Retrieve file contents with support for specific line ranges

**Usage**:
```json
{
  "tool": "read",
  "args": {
    "file_path": "src/index.ts",
    "offset": 10,
    "limit": 50
  }
}
```

**Permissions**: Controlled by `read` permission setting

---

#### 2. `write`
**Purpose**: Create new files or overwrite existing ones

**Usage**:
```json
{
  "tool": "write",
  "args": {
    "file_path": "src/new-file.ts",
    "content": "export const foo = 'bar';"
  }
}
```

**Permissions**: Controlled by `edit` permission (grouped with other file modifications)

**Important**: `.env` files are denied by default for security

---

#### 3. `edit`
**Purpose**: Perform precise edits by replacing exact text matches

**Usage**:
```json
{
  "tool": "edit",
  "args": {
    "file_path": "src/index.ts",
    "old_string": "const foo = 'bar';",
    "new_string": "const foo = 'baz';",
    "replace_all": false
  }
}
```

**Permissions**: Controlled by `edit` permission

**Key Feature**: Primary mechanism for LLM-driven code changes

---

#### 4. `patch`
**Purpose**: Apply patch files to codebases

**Permissions**: Also governed by `edit` permission

---

### Search and Discovery Tools

#### 5. `grep`
**Purpose**: Fast content search with full regex syntax

**Usage**:
```json
{
  "tool": "grep",
  "args": {
    "pattern": "function.*async",
    "path": "src/",
    "glob": "*.ts",
    "output_mode": "content",
    "-C": 3
  }
}
```

**Features**:
- Full regex support
- File pattern filtering with glob
- Output modes: `content`, `files_with_matches`, `count`
- Context lines with `-A`, `-B`, `-C` flags

---

#### 6. `glob`
**Purpose**: Find files using glob patterns

**Usage**:
```json
{
  "tool": "glob",
  "args": {
    "pattern": "src/**/*.test.ts",
    "path": "."
  }
}
```

**Returns**: Matching file paths sorted by modification time

---

#### 7. `list`
**Purpose**: Display directory contents with optional filtering

**Usage**:
```json
{
  "tool": "list",
  "args": {
    "path": "src/",
    "glob": "*.ts"
  }
}
```

---

### Execution and Integration Tools

#### 8. `bash`
**Purpose**: Execute shell commands in project environment

**Usage**:
```json
{
  "tool": "bash",
  "args": {
    "command": "npm install lodash",
    "timeout": 60000
  }
}
```

**Permissions**: Highly configurable with pattern matching:
```json
{
  "permission": {
    "bash": {
      "*": "ask",
      "git *": "allow",
      "rm *": "deny"
    }
  }
}
```

---

#### 9. `skill`
**Purpose**: Load skill files (SKILL.md) into conversation context

**Usage**:
```json
{
  "tool": "skill",
  "args": {
    "name": "react-best-practices"
  }
}
```

**See Section 8** for comprehensive skills documentation

---

#### 10. `question`
**Purpose**: Solicit user input during execution

**Usage**:
```json
{
  "tool": "question",
  "args": {
    "question": "Which database should we use: PostgreSQL or MongoDB?",
    "options": ["PostgreSQL", "MongoDB"]
  }
}
```

**Use Cases**: Preferences, clarifications, implementation decisions

---

#### 11. `webfetch`
**Purpose**: Retrieve and read web page content

**Usage**:
```json
{
  "tool": "webfetch",
  "args": {
    "url": "https://react.dev/docs",
    "purpose": "Extract latest React 19 features"
  }
}
```

**Permissions**: Controlled by `webfetch` permission

---

#### 12. `lsp` (Experimental)
**Purpose**: Code intelligence features via Language Server Protocol

**Features**:
- Definitions
- References
- Hover information
- Call hierarchies
- Symbols

**Enabling**:
```json
{
  "tools": {
    "lsp": true
  }
}
```

---

#### 13. `todowrite` / `todoread`
**Purpose**: Manage task lists during coding sessions

**Usage**:
```json
{
  "tool": "todowrite",
  "args": {
    "todos": [
      {"task": "Implement auth", "status": "in_progress"},
      {"task": "Write tests", "status": "pending"}
    ]
  }
}
```

---

### Tool Configuration

**Disabling Tools**:
```json
{
  "tools": {
    "write": false,
    "bash": false
  }
}
```

**Permission Levels**:
- `"allow"` - Default, runs without approval
- `"ask"` - Requires user confirmation
- `"deny"` - Prevents execution

**Wildcard Permissions**:
```json
{
  "permission": {
    "*": "ask",              // All tools require approval
    "read": "allow",          // Except read
    "mcp_*": "deny"          // Block all MCP tools
  }
}
```

---

## 4. Configuration System

### Configuration Hierarchy

OpenCode merges configurations from multiple sources (precedence order, later overrides earlier):

1. **Remote Config** (`.well-known/opencode`) - Organizational defaults
2. **Global Config** (`~/.config/opencode/opencode.json`) - User preferences
3. **Custom Config** (`OPENCODE_CONFIG` env var) - Custom overrides
4. **Project Config** (`opencode.json` in project root) - Project settings
5. **`.opencode` Directories** - Agents, commands, plugins
6. **Inline Config** (`OPENCODE_CONFIG_CONTENT` env var) - Runtime overrides

**Key Principle**: "Configuration files are merged together, not replaced."

---

### File Formats

- **JSON** - Standard format
- **JSONC** - JSON with Comments (recommended)

**Schema Validation**: `https://opencode.ai/config.json`

---

### Core Configuration Options

#### Model Configuration

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-5",
  "small_model": "anthropic/claude-haiku-4-5",
  "default_agent": "build"
}
```

**Options**:
- `model` - Primary LLM for main tasks
- `small_model` - Lightweight tasks (titles, summaries)
- `default_agent` - Default agent when none specified

---

#### Provider Configuration

```json
{
  "provider": {
    "custom-provider": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "My Custom Provider",
      "options": {
        "baseURL": "https://api.example.com/v1",
        "apiKey": "{env:CUSTOM_API_KEY}"
      },
      "models": {
        "my-model": {
          "name": "My Model",
          "maxTokens": 128000,
          "maxOutputTokens": 8192
        }
      }
    }
  }
}
```

**Supported Providers** (75+):
- Anthropic (Claude)
- OpenAI (GPT)
- Google (Gemini, Vertex AI)
- Amazon Bedrock
- Azure OpenAI
- GitHub Copilot
- Groq, DeepSeek, Cerebras, xAI
- OpenRouter, Together AI, Fireworks AI
- Ollama, LM Studio, llama.cpp
- Helicone, Cloudflare AI Gateway

---

#### Tools Configuration

```json
{
  "tools": {
    "write": true,
    "bash": true,
    "lsp": false
  }
}
```

---

#### Permissions Configuration

```json
{
  "permission": {
    "*": "ask",
    "read": "allow",
    "edit": "ask",
    "bash": {
      "*": "ask",
      "git *": "allow",
      "npm install *": "allow",
      "rm *": "deny"
    },
    "skill": {
      "internal-*": "allow",
      "experimental-*": "ask"
    }
  }
}
```

**Permission Types**:
- `read`, `write`, `edit`, `patch` - File operations (matches file paths)
- `bash` - Shell commands (matches command patterns)
- `glob`, `grep` - Search operations
- `webfetch` - URL fetching
- `task` - Subagent launching
- `skill` - Skill loading
- `external_directory` - Operations outside project (default: `"ask"`)
- `doom_loop` - Repeated identical tool calls (default: `"ask"`, triggered after 3 iterations)

**Pattern Matching**:
- `*` matches any sequence
- `?` matches exactly one character
- Last matching rule wins

---

#### Agent Configuration

```json
{
  "agent": {
    "reviewer": {
      "description": "Reviews code for quality and security",
      "mode": "subagent",
      "model": "anthropic/claude-sonnet-4-5",
      "temperature": 0.7,
      "tools": {
        "write": false,
        "bash": false
      },
      "permission": {
        "edit": "ask"
      },
      "max_steps": 10
    }
  }
}
```

**Agent Options**:
- `description` - Purpose statement (required)
- `mode` - `"primary"`, `"subagent"`, or `"all"`
- `temperature` - Response creativity (0.0-1.0)
- `model` - Override default model
- `tools` - Enable/disable specific tools
- `permission` - Tool-specific permissions
- `max_steps` - Limit agentic iterations
- `prompt` - Custom system prompt file path

---

#### Command Configuration

```json
{
  "command": {
    "explain": {
      "template": "Explain the following code in detail:\n\n$ARGUMENTS",
      "description": "Explains code functionality",
      "agent": "plan",
      "model": "anthropic/claude-sonnet-4-5"
    }
  }
}
```

---

#### Keybindings Configuration

```json
{
  "keybinds": {
    "leader": "ctrl+x",
    "session_new": "n",
    "session_list": "l",
    "editor": "e",
    "undo": "u",
    "redo": "r",
    "export": "x",
    "session_compact": "none"
  }
}
```

**Setting to `"none"` disables a keybind**

---

#### Server Configuration

```json
{
  "server": {
    "port": 4096,
    "hostname": "0.0.0.0",
    "mdns": true,
    "cors": ["http://localhost:5173"]
  }
}
```

---

#### TUI Configuration

```json
{
  "tui": {
    "scroll_speed": 3,
    "scroll_acceleration": {
      "enabled": true
    },
    "diff_style": "auto"
  }
}
```

---

#### Instructions / Rules Configuration

```json
{
  "instructions": [
    "CONTRIBUTING.md",
    "docs/guidelines.md",
    ".cursor/rules/*.md"
  ]
}
```

**Supports**:
- Direct file paths
- Glob patterns
- Multiple instruction sources

---

### Variable Substitution

#### Environment Variables
```json
{
  "model": "{env:OPENCODE_MODEL}",
  "apiKey": "{env:ANTHROPIC_API_KEY}"
}
```

#### File Contents
```json
{
  "apiKey": "{file:~/.secrets/openai-key}",
  "instructions": ["{file:./custom-instructions.md}"]
}
```

---

### Configuration Best Practices

1. **Separate Concerns**: Use project config for team standards, global config for personal preferences
2. **Secure Credentials**: Use `{file:...}` or `{env:...}` for API keys, never hardcode
3. **Version Control**: Commit project `opencode.json`, never commit `.env` or credentials
4. **Permission Prompts**: Enable `"ask"` for destructive operations (`edit`, `bash`)
5. **Leverage Merging**: Keep configs DRY by splitting concerns across hierarchy
6. **Document Custom Agents**: Add descriptions to help team understand purpose
7. **Disable Unnecessary Providers**: Reduce startup overhead

---

## 5. Rules System

### What are Rules?

Rules are custom instructions that guide LLM behavior within your project. Similar to `CLAUDE.md` or Cursor's rules, OpenCode uses `AGENTS.md` files.

### File Locations

**Project Rules**:
```
project-root/
└── AGENTS.md
```

**Global Rules**:
```
~/.config/opencode/
└── AGENTS.md
```

**Combined**: If both exist, OpenCode merges them together.

---

### Rule Discovery

OpenCode searches hierarchically:
1. Traverses up from current directory to find project `AGENTS.md`
2. Checks `~/.config/opencode/AGENTS.md` for global rules
3. Combines both (if found)

---

### Rule Configuration via opencode.json

Reference external instruction files:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": [
    "CONTRIBUTING.md",
    "docs/guidelines.md",
    ".cursor/rules/*.md"
  ]
}
```

**Features**:
- Multiple file support
- Glob patterns for monorepos
- All files combined with `AGENTS.md`

---

### Creating Rules

#### Using `/init` Command

```bash
opencode
# In TUI:
/init
```

This auto-generates project-specific rules based on codebase analysis.

---

#### Manual Creation

**AGENTS.md Template**:
```markdown
# Project Context

## Overview
Brief description of the project, its purpose, and architecture.

## Tech Stack
- Language: TypeScript
- Framework: React
- Database: PostgreSQL
- Deployment: AWS

## Code Style
- Use functional components
- Prefer composition over inheritance
- Write tests for all business logic
- Document complex algorithms

## File Structure
```
src/
├── components/    # React components
├── services/      # Business logic
├── utils/         # Helper functions
└── types/         # TypeScript types
```

## Conventions
- Use kebab-case for file names
- Use PascalCase for component names
- Use camelCase for functions and variables
- Prefix interfaces with 'I'

## Testing
- Unit tests: Jest
- Integration tests: Playwright
- Test files: `*.test.ts`
- Coverage target: 80%

## Deployment
- CI/CD: GitHub Actions
- Staging: Auto-deploy on push to `develop`
- Production: Manual approval required
```

---

### Best Practices

1. **Initialization**: Use `/init` to auto-generate starting point
2. **Modular Approach**: Create separate files for different guidelines
3. **Lazy Loading**: Reference external files only when needed
4. **Monorepo Patterns**: Use glob patterns in `opencode.json`
5. **Version Control**: Commit `AGENTS.md` to share with team
6. **Keep Updated**: Revise as project evolves

---

### Example: Monorepo Rules

**Project Structure**:
```
monorepo/
├── opencode.json
├── AGENTS.md              # Root-level rules
├── packages/
│   ├── api/
│   │   └── CONTRIBUTING.md
│   └── web/
│       └── CONTRIBUTING.md
└── docs/
    └── coding-standards.md
```

**opencode.json**:
```json
{
  "instructions": [
    "AGENTS.md",
    "packages/*/CONTRIBUTING.md",
    "docs/coding-standards.md"
  ]
}
```

**Result**: All rules combined into single context for LLM

---

## 6. Agents System

### What are Agents?

Agents are specialized AI assistants configured for specific tasks and workflows. They enable creation of focused tools with customizable prompts, models, and tool access permissions.

### Agent Types

#### Primary Agents
Main assistants you interact with directly. Switch using Tab or configured keybinds. Access all tools by default.

**Built-in Primary Agents**:
- **build** - Default agent with full tool access for development
- **plan** - Restricted analysis agent; prevents file edits and bash by default

#### Subagents
Specialized assistants that primary agents invoke for specific tasks. Manually invoke via `@` mentions.

**Built-in Subagents**:
- **@general** - Multi-step research and code searching
- **@explore** - Fast codebase exploration and pattern matching

**Usage Example**:
```
User: @general help me find all API error handling patterns
```

---

### Creating Custom Agents

#### Interactive Creation

```bash
opencode agent create
```

**Prompts**:
1. Save location (global or project)
2. Agent purpose description
3. System prompt generation
4. Tool access configuration
5. Creates markdown configuration file

---

#### JSON Configuration Method

**opencode.json**:
```json
{
  "agent": {
    "security-auditor": {
      "description": "Analyzes code for security vulnerabilities",
      "mode": "subagent",
      "model": "anthropic/claude-sonnet-4-5",
      "temperature": 0.3,
      "tools": {
        "write": false,
        "edit": false,
        "bash": false
      },
      "permission": {
        "read": "allow",
        "webfetch": "ask"
      },
      "max_steps": 15
    },
    "documentation-writer": {
      "description": "Creates and updates technical documentation",
      "mode": "subagent",
      "model": "anthropic/claude-sonnet-4-5",
      "temperature": 0.7,
      "tools": {
        "bash": false
      },
      "permission": {
        "edit": "ask",
        "write": "allow"
      }
    }
  }
}
```

---

#### Markdown Configuration Method

**File Location**: `.opencode/agent/<name>.md` or `~/.config/opencode/agent/<name>.md`

**Example**: `.opencode/agent/reviewer.md`

```markdown
---
description: Reviews code for quality, performance, and maintainability
mode: subagent
model: anthropic/claude-sonnet-4-5
temperature: 0.5
tools:
  write: false
  bash: false
permission:
  edit: ask
max_steps: 10
---

# Code Reviewer Agent

You are an expert code reviewer focused on:

## Code Quality
- Readability and maintainability
- Proper naming conventions
- Code organization and structure
- DRY (Don't Repeat Yourself) principle

## Performance
- Algorithm efficiency
- Memory usage
- Database query optimization
- Caching opportunities

## Security
- Input validation
- SQL injection prevention
- XSS vulnerabilities
- Authentication and authorization

## Best Practices
- Error handling
- Logging
- Testing coverage
- Documentation

## Review Process
1. Read the code thoroughly
2. Identify issues by severity (critical, major, minor)
3. Suggest specific improvements with code examples
4. Explain the reasoning behind each suggestion
5. Prioritize the most impactful changes

Be constructive, specific, and educational in your feedback.
```

**File Naming**: Filename becomes agent identifier
- `reviewer.md` → agent: `reviewer`
- `specialized/security.md` → agent: `specialized/security`

---

### Agent Configuration Options

| Option | Type | Description | Required |
|--------|------|-------------|----------|
| `description` | string | Brief purpose statement | Yes |
| `mode` | enum | `"primary"`, `"subagent"`, or `"all"` | No (default: `"all"`) |
| `model` | string | Override default model | No |
| `temperature` | number | Response creativity (0.0-1.0) | No (default: 1.0) |
| `tools` | object | Enable/disable specific tools | No |
| `permission` | object | Tool-specific permissions | No |
| `max_steps` | number | Limit agentic iterations | No |
| `prompt` | string | Custom system prompt file path | No |

---

## 7. Commands System

### What are Commands?

Commands are reusable prompts invoked via slash notation in the TUI. They automate repetitive tasks with parameterized templates.

### Built-in Commands

- `/init` - Generate project `AGENTS.md`
- `/undo` - Revert file changes
- `/redo` - Reapply reverted changes
- `/share` - Export conversation
- `/help` - Show available commands
- `/models` - List available models
- `/compact` - Compact conversation context

---

### Creating Custom Commands

#### Markdown File Method (Recommended)

**File Location**: `.opencode/command/<name>.md` or `~/.config/opencode/command/<name>.md`

**Example**: `.opencode/command/explain.md`

```markdown
---
description: Explains code functionality in detail
agent: plan
model: anthropic/claude-sonnet-4-5
---

Explain the following code in detail:

$ARGUMENTS

Include:
- What the code does
- How it works
- Any potential issues
- Suggestions for improvement
```

**Usage**:
```
/explain src/auth/login.ts
```

---

#### Nested Commands

**Directory Structure**:
```
.opencode/
└── command/
    ├── explain.md           # /explain
    ├── review.md            # /review
    └── test/
        ├── unit.md          # /test/unit
        └── integration.md   # /test/integration
```

---

#### JSON Configuration Method

**opencode.json**:
```json
{
  "command": {
    "explain": {
      "template": "Explain the following code:\n\n$ARGUMENTS",
      "description": "Explains code functionality",
      "agent": "plan"
    },
    "refactor": {
      "template": "Refactor the following code for better:\n- Readability\n- Performance\n- Maintainability\n\n$ARGUMENTS",
      "description": "Refactors code",
      "agent": "build"
    }
  }
}
```

---

### Command Configuration Options

| Option | Type | Description | Required |
|--------|------|-------------|----------|
| `template` | string | LLM prompt sent on execution | Yes |
| `description` | string | TUI display text | No |
| `agent` | string | Which agent executes the command | No |
| `subtask` | boolean | Force subagent invocation behavior | No |
| `model` | string | Override default model | No |

---

### Prompt Template Features

#### Arguments

**Single Argument String**:
```markdown
Analyze this file: $ARGUMENTS
```

**Usage**: `/analyze src/index.ts`
**Result**: `$ARGUMENTS` → `src/index.ts`

---

**Positional Arguments**:
```markdown
Compare $1 with $2 and explain differences
```

**Usage**: `/compare old-version.ts new-version.ts`
**Result**:
- `$1` → `old-version.ts`
- `$2` → `new-version.ts`

---

#### Shell Integration

Execute bash commands and inject output:

```markdown
---
description: Shows recent git changes
---

Review the following git changes:

```
!`git diff HEAD~5`
```

Summarize what changed and why.
```

**Usage**: `/review-changes`
**Result**: Command output replaces `` !`git diff HEAD~5` ``

---

#### File References

Include file contents with `@` syntax:

```markdown
---
description: Compares file with similar implementations
---

Compare the implementation in @$1 with best practices.

Here's a reference implementation:

@examples/best-practice.ts

Suggest improvements.
```

**Usage**: `/compare-impl src/my-feature.ts`
**Result**: Both files' contents added to context

---

## 8. Skills System

### What are Skills?

Skills provide a mechanism for OpenCode to discover and load reusable instructions from repositories or home directories. Skills enable **progressive disclosure** - lightweight metadata loads at startup, full instructions activate when needed.

### SKILL.md Format Specification

#### Required Frontmatter

```markdown
---
name: skill-name
description: What this skill helps with (required for discovery)
---

# Skill Instructions

Detailed instructions for the agent...
```

#### Full Frontmatter Options

```markdown
---
name: my-awesome-skill
description: Helps implement React components following best practices
license: MIT
compatibility:
  opencode: ">=1.0.0"
  claude-code: "*"
metadata:
  short-description: React best practices
  author: Your Name
  version: 1.0.0
  category: frontend
---

# React Best Practices Skill

## Component Structure

Use functional components with TypeScript...

[Detailed instructions follow]
```

**Note**: Unknown frontmatter fields are ignored.

---

### Naming Requirements

Skill names must match this pattern: `^[a-z0-9]+(-[a-z0-9]+)*$`

**Rules**:
- 1-64 characters
- Lowercase alphanumeric
- Single hyphens as separators
- Cannot start/end with hyphens
- No consecutive `--`
- **Must match containing directory name**

**Valid Examples**:
- `react-hooks`
- `api-design`
- `test-patterns`

**Invalid Examples**:
- `React-Hooks` (uppercase)
- `api_design` (underscore)
- `test--patterns` (double hyphen)

---

### File Placement & Discovery

Skills are discovered from multiple locations:

```
# Project-local skills (highest priority)
.opencode/skill/
└── <skill-name>/
    └── SKILL.md

# Global skills
~/.config/opencode/skill/
└── <skill-name>/
    └── SKILL.md

# Claude Code compatibility
.claude/skills/
└── <skill-name>/
    └── SKILL.md

~/.claude/skills/
└── <skill-name>/
    └── SKILL.md
```

**Discovery Process**: OpenCode "walks up from your current working directory until it reaches the git worktree" to locate skills.

---

### Directory Structure

Each skill is a directory containing:

```
my-skill/
├── SKILL.md           # Required: Skill metadata and instructions
├── references/        # Optional: Documentation and guides
│   ├── api-guide.md
│   └── examples.md
├── assets/           # Optional: Templates, images, binary files
│   ├── template.tsx
│   └── diagram.png
└── scripts/          # Optional: Executable scripts
    ├── setup.sh
    └── validate.py
```

**Key Feature**: Scripts have paths referenced naturally in SKILL.md documentation. Agents have full visibility and can intelligently decide when to run them.

---

### Skill Loading Mechanism

#### Progressive Disclosure

1. **Startup** (~50 tokens per skill): Load name and description for discovery
2. **On-Demand** (~2-5K tokens): Load full SKILL.md when agent invokes skill
3. **Resources**: Load references/assets/scripts dynamically during execution

---

### Permission Control

Configure skill access via permissions:

```json
{
  "permission": {
    "skill": {
      "internal-*": "allow",
      "experimental-*": "ask",
      "deprecated-*": "deny"
    }
  }
}
```

**Permission Levels**:
- `"allow"` - Immediate loading
- `"ask"` - User approval required
- `"deny"` - Hidden from agents, access rejected

---

### OpenCode Skillful Plugin

The **opencode-skillful** plugin provides advanced skill management with three tools:

#### 1. `skill_find`
**Purpose**: Discover skills using natural query syntax

**Features**:
- Keyword search
- Path prefix filtering
- Negation
- Exact phrases

**Example Query**:
```
react hooks -deprecated path:frontend/
```

**Returns**: Matching skills with relevance scores

---

#### 2. `skill_use`
**Purpose**: Load selected skills into chat context

**Features**:
- Full resource metadata
- Script paths
- Reference documents
- Asset inventory

**Example**:
```json
{
  "tool": "skill_use",
  "args": {
    "name": "react-hooks"
  }
}
```

---

#### 3. `skill_resource`
**Purpose**: Read specific files from skills without loading entire skill

**Example**:
```json
{
  "tool": "skill_resource",
  "args": {
    "skill": "react-hooks",
    "resource": "references/advanced-patterns.md"
  }
}
```

---

### Skill Configuration (opencode-skillful)

**.opencode-skillful.json**:
```json
{
  "promptRenderer": "xml",
  "modelRenderers": {
    "claude-3-5-sonnet": "xml",
    "gpt-4": "json",
    "gpt-4o": "json"
  }
}
```

**Renderer Options**:
- **xml** - Claude optimized (default)
- **json** - GPT optimized
- **markdown** - Human-readable, universal

---

## 9. Plugin Architecture

### What are Plugins?

Plugins allow you to extend OpenCode by hooking into various events and customizing behavior. They can add custom tools, modify workflows, and integrate with external services.

### Plugin Sources

#### Local Plugins

Automatically loaded from:
- `.opencode/plugin/` (project-level)
- `~/.config/opencode/plugin/` (global)

**Supported Formats**: JavaScript (`.js`) or TypeScript (`.ts`)

---

#### NPM Packages

Specified in configuration and auto-installed via Bun to `~/.cache/opencode/node_modules/`

**opencode.json**:
```json
{
  "plugin": [
    "@opencode-ai/plugin-example",
    "opencode-skillful"
  ]
}
```

---

### Creating Plugins

#### Basic Structure

```javascript
export const MyPlugin = async ({ project, client, $, directory, worktree }) => {
  // Plugin initialization

  return {
    // Event hooks
  }
}
```

**Context Object**:
- `project` - Project information
- `client` - OpenCode client instance
- `$` - Bun shell API for executing commands
- `directory` - Current directory
- `worktree` - Git worktree information

---

#### TypeScript Plugin

```typescript
import type { Plugin } from '@opencode-ai/plugin';

export const MyPlugin: Plugin = async (context) => {
  const { project, client, $, directory, worktree } = context;

  console.log(`Plugin loaded for project: ${project.name}`);

  return {
    // Command hooks
    onCommandStart: async (command) => {
      console.log(`Command started: ${command.name}`);
    },

    // File hooks
    onFileEdit: async (file) => {
      console.log(`File edited: ${file.path}`);
    },

    // Message hooks
    onMessageCreate: async (message) => {
      console.log(`Message created: ${message.content.substring(0, 50)}...`);
    },

    // Tool hooks
    onToolCall: async (tool) => {
      console.log(`Tool called: ${tool.name}`);
    }
  };
};
```

---

### Custom Tools via Plugins

Plugins can register custom tools using the `tool()` helper:

```typescript
import { tool } from '@opencode-ai/plugin';

export const DatabasePlugin: Plugin = async (context) => {
  return {
    tools: [
      tool({
        name: 'database_query',
        description: 'Query the project database',
        args: {
          query: tool.schema.string().describe('SQL query to execute'),
          database: tool.schema.enum(['users', 'products', 'orders'])
            .optional()
            .describe('Database to query')
        },
        async execute(args, context) {
          // Execute database query
          const result = await executeQuery(args.query, args.database);
          return JSON.stringify(result, null, 2);
        }
      })
    ]
  };
};
```

**Tool Schema**: Uses Zod for argument validation

---

## 10. Directory Structure

### Complete .opencode Directory

```
project-root/
├── .opencode/
│   ├── agent/                    # Custom agents
│   │   ├── reviewer.md
│   │   ├── tester.md
│   │   └── specialized/
│   │       └── security.md
│   ├── command/                  # Custom commands
│   │   ├── explain.md
│   │   ├── refactor.md
│   │   └── test/
│   │       ├── unit.md
│   │       └── integration.md
│   ├── skill/                    # Project skills
│   │   ├── react-patterns/
│   │   │   ├── SKILL.md
│   │   │   ├── references/
│   │   │   ├── assets/
│   │   │   └── scripts/
│   │   └── api-design/
│   │       └── SKILL.md
│   ├── tool/                     # Custom tools
│   │   ├── database.ts
│   │   └── validator.ts
│   ├── plugin/                   # Local plugins
│   │   ├── analytics.ts
│   │   └── logging.ts
│   └── logs/                     # Plugin-generated logs
│       └── activity.log
├── opencode.json                 # Project configuration
├── AGENTS.md                     # Project rules
└── .env                          # Environment variables (gitignored)
```

---

### Global Configuration Structure

```
~/.config/opencode/
├── opencode.json                 # Global configuration
├── AGENTS.md                     # Global rules
├── agent/                        # Global agents
│   └── personal-assistant.md
├── command/                      # Global commands
│   └── daily-standup.md
├── skill/                        # Global skills
│   └── personal-workflows/
│       └── SKILL.md
├── tool/                         # Global custom tools
│   └── personal-tracker.ts
├── plugin/                       # Global plugins
│   └── time-tracker.ts
└── package.json                  # Plugin dependencies

~/.local/share/opencode/
├── auth.json                     # Provider credentials
└── sessions/                     # Conversation history
    ├── session-1.json
    └── session-2.json

~/.cache/opencode/
└── node_modules/                 # Installed plugins
```

---

## 11. Comparison with Claude Code & Other Platforms

### OpenCode vs Claude Code

#### Key Differences

| Aspect | OpenCode | Claude Code |
|--------|----------|-------------|
| **Open Source** | 100% open source (MIT) | Proprietary (Anthropic) |
| **Provider Support** | 75+ providers (Claude, OpenAI, Google, local) | Claude only |
| **Cost** | BYOK + free models available | $20-$200/month subscription |
| **Customization** | Agents, commands, skills, tools, plugins | Skills system |
| **LSP Support** | Built-in (experimental) | Not available |
| **Client-Server** | Distributed architecture | Single-instance |
| **Platform** | TUI, Web, VS Code, CLI | CLI only |
| **MCP Integration** | Native MCP support | Not available |
| **Configuration** | JSON/JSONC with merging | CLAUDE.md file |
| **Rules System** | AGENTS.md + instructions | CLAUDE.md |
| **Community** | Open community development | Anthropic-controlled |

---

#### Use Case Recommendations

**Choose OpenCode if**:
- You want provider flexibility (multi-model support)
- You prioritize open source and community development
- You need cost control (free models or BYOK)
- You want extensibility (plugins, custom tools)
- You need remote access (client-server architecture)
- You want LSP features (code intelligence)
- You're building team workflows with shared configs

**Choose Claude Code if**:
- You're a Claude subscriber seeking tight integration
- You prefer simplicity over flexibility
- You value official Anthropic support
- You're okay with subscription costs
- You only need Claude models

---

### OpenCode vs Cursor

| Aspect | OpenCode | Cursor |
|--------|----------|--------|
| **Interface** | Terminal (TUI/CLI) | Full IDE (VS Code fork) |
| **Learning Curve** | Medium (terminal proficiency) | Low (VS Code users) |
| **Open Source** | Yes (MIT) | No (proprietary) |
| **Provider Support** | 75+ providers | GPT-4, Claude, custom |
| **Cost** | Free + BYOK | $20-40/month |
| **IDE Features** | Via VS Code extension | Native (full IDE) |
| **AI Integration** | Chat + tools | Chat + autocomplete + inline edits |
| **Team Features** | Client-server, shared configs | Built-in team collaboration |
| **Resource Usage** | Lightweight | Resource-intensive |
| **Portability** | Highly portable (terminal) | Tied to IDE |

---

### Summary: Platform Comparison Matrix

| Feature | OpenCode | Claude Code | Cursor | Windsurf |
|---------|----------|-------------|--------|----------|
| **Open Source** | ✅ | ❌ | ❌ | ❌ |
| **Terminal-First** | ✅ | ✅ | ❌ | ❌ |
| **Multi-Provider** | ✅ | ❌ | ⚠️ | ❌ |
| **Free Tier** | ✅ | ⚠️ | ⚠️ | ❌ |
| **IDE Integration** | ⚠️ | ❌ | ✅ | ✅ |
| **Client-Server** | ✅ | ❌ | ❌ | ❌ |
| **LSP Support** | ✅ | ❌ | ✅ | ✅ |
| **Plugin System** | ✅ | ❌ | ⚠️ | ⚠️ |
| **MCP Integration** | ✅ | ❌ | ❌ | ❌ |
| **Learning Curve** | Medium | Medium | Low | Medium |
| **Best For** | Terminal users, flexibility | Claude subscribers | VS Code users | Teams, autonomy |

---

## 12. Best Practices & Integration Patterns

### Configuration Management

#### Project vs Global Config

**Project Config** (`opencode.json`):
```json
{
  "$schema": "https://opencode.ai/config.json",
  "agent": {
    "reviewer": {
      "description": "Code reviewer for this project",
      "mode": "subagent"
    }
  },
  "instructions": [
    "AGENTS.md",
    "CONTRIBUTING.md"
  ],
  "permission": {
    "bash": {
      "npm test": "allow",
      "npm run deploy": "ask"
    }
  }
}
```

**Global Config** (`~/.config/opencode/opencode.json`):
```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-5",
  "small_model": "anthropic/claude-haiku-4-5",
  "theme": "dracula",
  "keybinds": {
    "leader": "ctrl+a"
  },
  "permission": {
    "*": "ask",
    "read": "allow"
  }
}
```

**Principle**: Project config for team standards, global config for personal preferences.

---

### Security Best Practices

#### Credential Management

**Don't**:
```json
{
  "apiKey": "sk-1234567890abcdef"
}
```

**Do**:
```json
{
  "apiKey": "{env:ANTHROPIC_API_KEY}"
}
```

Or:
```json
{
  "apiKey": "{file:~/.secrets/anthropic-key}"
}
```

---

#### File Permissions

```json
{
  "permission": {
    "edit": {
      "*.env": "deny",
      "*.key": "deny",
      "credentials.json": "deny",
      "*": "ask"
    }
  }
}
```

---

#### Bash Command Safety

```json
{
  "permission": {
    "bash": {
      "rm -rf *": "deny",
      "sudo *": "deny",
      "git push --force": "ask",
      "npm publish": "ask",
      "*": "ask"
    }
  }
}
```

---

### Model Selection Strategy

**Task-Appropriate Models**:

```json
{
  "model": "anthropic/claude-sonnet-4-5",
  "small_model": "anthropic/claude-haiku-4-5",
  "agent": {
    "planner": {
      "description": "Strategic planning",
      "model": "anthropic/claude-opus-4-5",
      "temperature": 0.7
    },
    "coder": {
      "description": "Implementation",
      "model": "anthropic/claude-sonnet-4-5",
      "temperature": 0.5
    },
    "reviewer": {
      "description": "Code review",
      "model": "anthropic/claude-sonnet-4-5",
      "temperature": 0.3
    }
  }
}
```

**Strategy**:
- **Opus**: Strategic planning, architecture decisions
- **Sonnet**: Implementation, code review, refactoring
- **Haiku**: Quick tasks, titles, summaries, simple edits

---

## Conclusion

OpenCode represents a significant advancement in open-source AI coding agents, offering:

1. **Provider Flexibility**: 75+ LLM providers, no vendor lock-in
2. **Open Source**: 100% MIT-licensed, community-driven development
3. **Terminal Excellence**: Powerful TUI built by neovim enthusiasts
4. **Extensibility**: Agents, commands, skills, tools, plugins
5. **Architecture**: Client-server model for remote collaboration
6. **Cost Control**: Free models, BYOK, self-hosting options
7. **Integration**: LSP support, MCP integration, VS Code extension

**Key Differentiators from Claude Code**:
- Multi-provider support vs single-provider
- Open source vs proprietary
- Plugin system vs fixed feature set
- Client-server vs single-instance
- LSP + MCP vs basic tools

**Best For**:
- Terminal-first developers
- Teams needing provider flexibility
- Open source enthusiasts
- Cost-conscious users
- Extensibility and customization needs

---

## Sources

- [OpenCode GitHub Repository (anomalyco)](https://github.com/anomalyco/opencode)
- [OpenCode Documentation](https://opencode.ai/docs)
- [Configuration Guide](https://opencode.ai/docs/config/)
- [Tools Documentation](https://opencode.ai/docs/tools/)
- [Rules System](https://opencode.ai/docs/rules/)
- [Agents System](https://opencode.ai/docs/agents/)
- [Commands Documentation](https://opencode.ai/docs/commands/)
- [Skills Documentation](https://opencode.ai/docs/skills/)
- [Plugins Documentation](https://opencode.ai/docs/plugins/)
- [Keybindings Guide](https://opencode.ai/docs/keybinds/)
- [Permissions System](https://opencode.ai/docs/permissions/)
- [TUI Documentation](https://opencode.ai/docs/tui/)
- [CLI Documentation](https://opencode.ai/docs/cli/)
- [Providers Guide](https://opencode.ai/docs/providers/)
- [OpenCode Skillful Plugin](https://github.com/zenobi-us/opencode-skillful)
- [OpenCode vs Claude Code Comparison](https://danielmiessler.com/blog/opencode-vs-claude-code)
- [Developer Experience: Cursor to Claude Code & OpenCode](https://www.groff.dev/blog/claude-code-opencode-productivity-boost)
- [OpenCode vs Claude Code vs Cursor 2026](https://www.nxcode.io/resources/news/opencode-vs-claude-code-vs-cursor-2026)
- [Cursor vs Windsurf vs Claude Code Comparison](https://amirteymoori.com/cursor-vs-windsurf-vs-claude-code-which-ai-coding-tool-should-you-choose-in-2025/)
- [Superpowers for OpenCode](https://blog.fsck.com/2025/11/24/Superpowers-for-OpenCode/)
- [DeepWiki: OpenCode Architecture](https://deepwiki.com/anomalyco/opencode)
