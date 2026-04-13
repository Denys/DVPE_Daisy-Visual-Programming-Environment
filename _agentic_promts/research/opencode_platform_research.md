# OpenCode Platform: Comprehensive Research Report

**Research Date:** January 11, 2026
**Status:** OpenCode project has been ARCHIVED and moved to [Crush](https://github.com/charmbracelet/crush)
**Primary Repository:** https://github.com/opencode-ai/opencode (now read-only)

---

## Executive Summary

OpenCode is a Go-based, terminal-native AI coding agent featuring a TUI (Terminal User Interface) built with Bubble Tea. It provides multi-provider AI support (75+ LLM providers), LSP integration, MCP server support, and a sophisticated agent system. The platform emphasizes developer choice, transparency, and open-source principles.

**Key Distinguishing Features:**
- Multi-provider support (Claude, GPT, Gemini, local models)
- Dual-agent system (Primary agents + Subagents)
- LSP integration for code intelligence
- MCP (Model Context Protocol) server support
- Plan-before-Build workflow
- Terminal-native with optional desktop app and IDE extensions
- Free and open-source (48,000+ GitHub stars)

---

## 1. Platform Architecture

### 1.1 Core Technology Stack

**Language:** Go 1.24.0+
**UI Framework:** [Bubble Tea](https://github.com/charmbracelet/bubbletea) (TUI)
**Database:** SQLite (session persistence)
**License:** MIT

**Project Structure:**
```
cmd/                    # Command-line interface
internal/
  app/                  # Application logic
  config/               # Configuration management
  db/                   # Database layer (SQLite)
  llm/                  # LLM provider integrations
  tui/                  # Terminal UI components
  logging/              # Logging infrastructure
  message/              # Message handling
  session/              # Session management
  lsp/                  # Language Server Protocol
```

### 1.2 Design Philosophy

OpenCode emphasizes:
- **Terminal-native interaction** for developers who live in the CLI
- **Provider agnosticism** - no vendor lock-in
- **Session persistence** - conversations saved across sessions
- **Intelligent tool integration** - file operations, code execution
- **Permission-based security** - user control over AI actions
- **Open-source transparency** - full source code access

### 1.3 Architecture Patterns

**Client/Server Model:**
- Can run locally or remotely
- Supports driving from mobile apps
- mDNS discovery for network access

**Event-Driven Design:**
- Complex orchestration without tight coupling
- Asynchronous tool execution
- Real-time file change tracking

**Structured Memory:**
- Conversation persistence via SQLite
- Context window management with auto-compaction
- Session-based memory isolation

---

## 2. AI Provider Support

### 2.1 Supported Providers

OpenCode supports 75+ AI model providers:

**Major Providers:**
- **OpenAI:** GPT-4.1, GPT-4.5, O1/O3 families
- **Anthropic:** Claude 3.7 Sonnet, Claude 3.5 Sonnet, multiple versions
- **Google:** Gemini 2.0/2.5 variants, VertexAI
- **GitHub:** Copilot integration
- **AWS:** Bedrock
- **Azure:** Azure OpenAI
- **Other:** Groq, OpenRouter, local models

**Environment Variables:**
```bash
ANTHROPIC_API_KEY          # Claude models
OPENAI_API_KEY             # OpenAI models
GEMINI_API_KEY             # Google Gemini
GITHUB_TOKEN               # GitHub Copilot
VERTEXAI_PROJECT           # Google Cloud
VERTEXAI_LOCATION          # Google Cloud
GROQ_API_KEY               # Groq
AWS_ACCESS_KEY_ID          # AWS Bedrock
AWS_SECRET_ACCESS_KEY      # AWS Bedrock
AWS_REGION                 # AWS Bedrock
AZURE_OPENAI_ENDPOINT      # Azure
AZURE_OPENAI_API_KEY       # Azure
AZURE_OPENAI_API_VERSION   # Azure
LOCAL_ENDPOINT             # Self-hosted models
```

### 2.2 Model Configuration

**Configuration Example:**
```json
{
  "providers": {
    "openai": {
      "apiKey": "your-api-key",
      "disabled": false
    },
    "anthropic": {
      "apiKey": "your-api-key",
      "disabled": false
    },
    "copilot": {
      "disabled": false
    }
  },
  "agents": {
    "coder": {
      "model": "claude-3.7-sonnet",
      "maxTokens": 5000
    },
    "task": {
      "model": "claude-3.7-sonnet",
      "maxTokens": 5000
    }
  }
}
```

**Self-Hosted Models:**
```json
{
  "agents": {
    "coder": {
      "model": "local.granite-3.3-2b-instruct@q8_0",
      "reasoningEffort": "high"
    }
  }
}
```

### 2.3 OpenCode Zen

OpenCode Zen is a curated model selection service for newcomers who prefer vetted LLM choices over managing provider configurations.

---

## 3. Tool System

### 3.1 Built-in Tools

OpenCode provides comprehensive built-in tools that LLMs can invoke:

#### File Operations
- **read** - Retrieves file contents with line range support
- **write** - Creates new files or overwrites existing ones
- **edit** - Modifies files using exact string replacement
- **patch** - Applies patch files to codebase
- **list** - Displays directory contents with glob filtering

#### Search & Discovery
- **grep** - Searches content using regex across files
- **glob** - Locates files via pattern matching (e.g., `**/*.js`)

#### Execution
- **bash** - Executes shell commands in project environment

#### Advanced Features
- **lsp** (experimental) - Code intelligence (definitions, references, hover, call hierarchy)
- **skill** - Loads and returns SKILL.md file content
- **webfetch** - Retrieves and reads web pages
- **question** - Enables LLMs to ask users for clarification
- **todowrite/todoread** - Manages task lists during sessions

### 3.2 Tool Configuration

**Default Behavior:** All tools enabled by default, no permission required.

**Permission Control via opencode.json:**
```json
{
  "permission": {
    "bash": "allow",
    "edit": "ask",
    "webfetch": "deny"
  }
}
```

**Permission Levels:**
- `allow` - Execute without prompting
- `ask` - Require user approval
- `deny` - Block completely

**Wildcard Support:**
```json
{
  "permission": {
    "mymcp_*": "ask"
  }
}
```

### 3.3 Custom Tools

**Location:**
- Global: `~/.config/opencode/tool/`
- Project: `.opencode/tool/`

**Language:** TypeScript or JavaScript (can invoke any language)

**Structure Example:**
```typescript
import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Query the project database",
  args: {
    query: tool.schema.string().describe("SQL query to execute"),
  },
  async execute(args) {
    return `Executed query: ${args.query}`
  },
})
```

**Key Features:**
- Filename becomes tool name (`database.ts` → `database` tool)
- Multiple tools per file supported (`<filename>_<exportname>`)
- Zod-based schema validation
- Context access (agent, sessionID, messageID)

**Cross-Language Example:**
```typescript
async execute(args) {
  const result = await Bun.$`python3 .opencode/tool/add.py ${args.a} ${args.b}`.text()
  return result.trim()
}
```

### 3.4 MCP (Model Context Protocol) Integration

**Configuration:**
```json
{
  "mcpServers": {
    "example": {
      "type": "stdio",
      "command": "path/to/mcp-server",
      "env": [],
      "args": []
    },
    "web-example": {
      "type": "sse",
      "url": "https://example.com/mcp",
      "headers": {
        "Authorization": "Bearer token"
      }
    }
  }
}
```

**Supported Types:**
- `stdio` - Standard input/output communication
- `sse` - Server-sent events (web-based)

---

## 4. Configuration System

### 4.1 File Locations & Precedence

**Configuration Files:** JSON or JSONC (JSON with Comments)

**Precedence (lowest to highest):**
1. Remote config (`.well-known/opencode` endpoint)
2. Global config (`~/.config/opencode/opencode.json`)
3. Custom config (`OPENCODE_CONFIG` env var)
4. Project config (`opencode.json` in project root)
5. `.opencode` directories
6. Inline config (`OPENCODE_CONFIG_CONTENT` env var)

**Directory Structure:**
```
.opencode/
├── agent/          # Custom agent definitions
├── command/        # Custom command templates
├── plugin/         # Custom plugins
├── tool/           # Custom tools
└── skills/         # Project-specific skills (if using opencode-skillful)
```

### 4.2 Complete Configuration Template

```json
{
  "data": {
    "directory": ".opencode"
  },
  "model": "anthropic/claude-sonnet-4-5",
  "small_model": "anthropic/claude-haiku-4",
  "providers": {
    "openai": {
      "apiKey": "your-api-key",
      "timeout": 30000,
      "disabled": false
    },
    "anthropic": {
      "apiKey": "your-api-key",
      "disabled": false
    }
  },
  "agents": {
    "coder": {
      "model": "claude-3.7-sonnet",
      "maxTokens": 5000,
      "temperature": 0.7
    },
    "task": {
      "model": "claude-3.7-sonnet",
      "maxTokens": 5000
    },
    "title": {
      "model": "claude-3.7-sonnet",
      "maxTokens": 80
    }
  },
  "default_agent": "build",
  "shell": {
    "path": "/bin/bash",
    "args": ["-l"]
  },
  "mcpServers": {
    "example": {
      "type": "stdio",
      "command": "path/to/mcp-server",
      "env": [],
      "args": []
    }
  },
  "lsp": {
    "go": {
      "disabled": false,
      "command": "gopls"
    },
    "typescript": {
      "disabled": false,
      "command": "typescript-language-server",
      "args": ["--stdio"]
    }
  },
  "tools": {
    "write": true,
    "bash": true,
    "edit": true
  },
  "permissions": {
    "bash": "ask",
    "edit": "allow"
  },
  "commands": {
    "test": {
      "template": "Run the test suite",
      "description": "Execute all tests"
    }
  },
  "theme": "default",
  "keybinds": {},
  "formatters": {},
  "instructions": ["CONTRIBUTING.md", "docs/guidelines.md"],
  "autoupdate": true,
  "sharing": "manual",
  "debug": false,
  "debugLSP": false,
  "autoCompact": true,
  "enabled_providers": [],
  "disabled_providers": []
}
```

### 4.3 Variable Substitution

**Environment Variables:**
```json
{
  "apiKey": "{env:OPENAI_API_KEY}"
}
```

**File Contents:**
```json
{
  "instructions": ["{file:path/to/file}"]
}
```

Supports relative and absolute paths with `~` expansion.

### 4.4 Configuration Schema

All configuration validates against: `opencode.ai/config.json`

---

## 5. Rules System

### 5.1 What Are Rules?

Rules are custom instructions that guide AI behavior within a project, stored in `AGENTS.md` files.

**Purpose:**
- Define project-specific guidelines
- Establish coding standards
- Document technology stack
- Specify monorepo patterns

### 5.2 Rule File Structure

**Primary Location:** `AGENTS.md` in project root

**Format:** Markdown file with sections:
```markdown
# Project Guidelines

## Structure
[Project organization]

## Code Standards
[Conventions and best practices]

## Technology Stack
[Languages, frameworks, tools]

## Monorepo Patterns
[Specific patterns for monorepos]
```

### 5.3 Rule Precedence

**Search Order:**
1. Local project files (traversing upward through directories)
2. Global configuration file (`~/.config/opencode/AGENTS.md`)

Both levels combine when both exist.

### 5.4 Custom Instructions

**Reference additional files via opencode.json:**
```json
{
  "instructions": ["CONTRIBUTING.md", "docs/guidelines.md"]
}
```

**Glob Pattern Support (Monorepos):**
```json
{
  "instructions": ["packages/*/AGENTS.md"]
}
```

### 5.5 Initialization

**Auto-generate AGENTS.md:**
```bash
opencode
/init
```

This analyzes the project and creates a customized AGENTS.md file.

### 5.6 Best Practices

- **Lazy loading:** Reference external files only when needed
- **Modularity:** Keep rules in separate files for reusability
- **Scalability:** Use glob patterns for monorepos
- **Avoid preloading:** Don't load all referenced files upfront

---

## 6. Agent System

### 6.1 Architecture

OpenCode employs a **two-tier agent system:**

#### Primary Agents
- Main assistants for direct user interaction
- Users switch between them via Tab key or keybinds
- Full control over conversation flow

#### Subagents
- Specialized assistants for specific tasks
- Invoked by primary agents or via @ mentions
- Focused, limited-scope operations

### 6.2 Built-in Agents

**Primary Agents:**

1. **Build (Default)**
   - Full tool access
   - Standard development work
   - Can modify files, run commands

2. **Plan**
   - Restricted permissions
   - Read-only focused
   - File edits and bash require approval
   - "Suggest how it'll implement the feature"

**Subagents:**

1. **General**
   - Multi-step research
   - Code searching
   - Complex question answering

2. **Explore**
   - Fast codebase exploration
   - Pattern matching
   - Keyword searches

### 6.3 Agent Configuration

**Configuration Methods:**
- **JSON** (opencode.json) - Centralized definitions with schema
- **Markdown** files - Individual agent files

**Agent File Locations:**
- Global: `~/.config/opencode/agent/`
- Project: `.opencode/agent/`

**Configuration Options:**

```json
{
  "agents": {
    "custom_agent": {
      "description": "Required - explains agent purpose",
      "temperature": 0.7,
      "max_steps": 10,
      "model": "anthropic/claude-sonnet-4-5",
      "tools": {
        "write": true,
        "bash": false
      },
      "permissions": {
        "bash": "ask",
        "edit": "allow"
      },
      "mode": "primary",
      "prompt": "{file:.opencode/agent/custom_prompt.md}",
      "task_permissions": ["pattern_*"]
    }
  }
}
```

**Key Options:**
- **description** (required) - Agent purpose
- **temperature** (0.0-1.0) - Response randomness
- **max_steps** - Agentic iteration limit
- **model** - Override global model
- **tools** - Enable/disable capabilities (wildcard support)
- **permissions** - "ask," "allow," or "deny"
- **mode** - "primary," "subagent," or "all"
- **prompt** - Custom system instructions
- **task_permissions** - Subagent invocation control (glob patterns)

### 6.4 Agent Usage Patterns

**Switching Primary Agents:**
- Tab key
- `switch_agent` keybind

**Invoking Subagents:**
- Automatic by primary agent
- Manual via @ mention: `@general help me search for this function`

**Session Navigation:**
- `<Leader>+Right` or `session_child_cycle` keybind
- Navigate between parent and child sessions

### 6.5 Creating Custom Agents

**Interactive Creation:**
```bash
opencode agent create
```

Guides through:
1. Location selection (global/project)
2. Description input
3. Prompt generation
4. Tool access configuration

**Use Case Examples:**

**Documentation Agent:**
```json
{
  "agents": {
    "docs": {
      "description": "Write documentation without code execution",
      "tools": {
        "bash": false
      },
      "permissions": {
        "write": "allow"
      }
    }
  }
}
```

**Security Auditor:**
```json
{
  "agents": {
    "security": {
      "description": "Vulnerability analysis - read-only",
      "permissions": {
        "write": "deny",
        "bash": "deny"
      }
    }
  }
}
```

**Debug Agent:**
```json
{
  "agents": {
    "debug": {
      "description": "Investigation with restricted access",
      "permissions": {
        "bash": "ask",
        "write": "deny"
      }
    }
  }
}
```

---

## 7. Commands System

### 7.1 Command Types

OpenCode supports **custom commands** for repetitive tasks, executed in TUI using `/` prefix.

**Built-in Commands:**
- `/init` - Initialize projects
- `/undo` - Undo operations
- `/redo` - Redo operations
- `/share` - Share functionality
- `/help` - Display help

Custom commands can override built-ins with same name.

### 7.2 Creating Custom Commands

**File-Based Approach:**

Create markdown files in `command/` directory:
- Global: `~/.config/opencode/command/`
- Project: `.opencode/command/`

**Example Structure:**
```
.opencode/command/test.md
.opencode/command/component.md
~/.config/opencode/command/git/commit.md
```

**Configuration Approach:**

```json
{
  "commands": {
    "test": {
      "template": "Run the test suite with coverage",
      "description": "Execute all tests",
      "agent": "build",
      "model": "claude-sonnet-4-5"
    }
  }
}
```

### 7.3 Command Structure

**Required:**
- **template** - The prompt sent to LLM

**Optional:**
- **description** - Brief explanation in TUI
- **agent** - Which agent executes
- **model** - Override default LLM
- **subtask** - Force subagent invocation

### 7.4 Advanced Features

**Placeholders:**
```markdown
# Test Command

Run tests for $ARGUMENTS
```

**Positional Arguments:**
```markdown
# Component Generator

Create component $1 in directory $2
```

**Dynamic Content:**
```markdown
# Context Command

Current git status:
!`git status`

README contents:
@README.md
```

**Usage:**
- `!`command`` - Inject bash command output
- `@filename` - Include file contents

**Example Invocation:**
```bash
/component Button
```

### 7.5 Command Examples

**Fetch Context for Issue:**
```markdown
# Fetch Context for Issue $ISSUE_NUMBER

RUN gh issue view $ISSUE_NUMBER --json title,body,comments
RUN git grep --author="$AUTHOR_NAME" -n .
RUN grep -R "$SEARCH_PATTERN" $DIRECTORY
```

**Simple Git Files:**
```markdown
# List Git Files

RUN git ls-files
READ README.md
```

---

## 8. OpenCode Skills System

### 8.1 Skills Architecture

OpenCode skills follow the **Anthropic Agent Skills Specification** with lazy-loaded discovery.

**Skill Directory Structure:**
```
my-skill/
  SKILL.md                 # Required metadata and instructions
  references/              # Documentation and guides
  assets/                  # Templates, images, binary files
  scripts/                 # Executable automation scripts
```

### 8.2 Discovery Locations

**Search Paths (project-local takes precedence):**
- Global: `~/.config/opencode/skills/`
- Project: `.opencode/skills/`

**Identifier Conversion:**

Directory path → identifier:
- Replace separators with underscores
- Replace hyphens with underscores

Example: `experts/ai/agentic-engineer/` → `experts_ai_agentic_engineer`

### 8.3 SKILL.md Format

**Structure:**
```yaml
---
name: my-skill
description: Clear, concise purpose statement (20+ characters)
---
# My Skill

Instructions for the AI agent...
```

**Requirements:**
- `name` must match directory name (lowercase, alphanumeric, hyphens)
- Description explains "when to use" (not mechanics)
- Description: minimum 20 characters, ideally under 500
- Content below frontmatter = skill instructions

### 8.4 Core Tools (opencode-skillful plugin)

**skill_find** - Discover skills using natural query syntax

**Query Syntax:**
- `*` or empty - List all skills
- Multiple keywords - AND logic (all must match)
- `-term` - Exclude results containing term
- `"exact phrase"` - Match precise text
- Path prefixes - Filter by category (e.g., `experts`, `superpowers/writing`)

**skill_use** - Load skills into chat context

Returns success/failure summary. Injects as persistent user messages with:
- Complete resource inventory
- References
- Assets
- Executable scripts

**skill_resource** - Read specific files from skills

Access templates/guides without full skill injection.

**Usage:**
```
skill_resource skill_name="writing-git-commits" relative_path="references/guide.md"
```

### 8.5 Configuration

**Global Config** (`~/.config/opencode-skillful/config.json`):
```json
{
  "promptRenderer": "xml",
  "modelRenderers": {
    "claude-3-5-sonnet": "xml",
    "gpt-4": "json"
  }
}
```

**Project Override** (`.opencode-skillful.json`):
```json
{
  "debug": true,
  "basePaths": ["~/.config/opencode/skills", ".opencode/skills"],
  "promptRenderer": "xml"
}
```

**Format Options:**
- `xml` - XML formatting (optimal for Claude)
- `json` - JSON formatting (optimal for GPT-4)
- `markdown` - Markdown formatting (open-source models)

### 8.6 Three-Step Workflow

**Step 1: Search**
```
skill_find "git commit"
```

**Step 2: Load**
```
skill_use "experts_writing_git_commits"
```

**Step 3: Access Resources (Optional)**
```
skill_resource skill_name="writing-git-commits" relative_path="references/guide.md"
```

### 8.7 Key Differentiator

**Lazy-Loading vs. Preloading:**

The `opencode-skillful` plugin uses **on-demand injection**, unlike built-in OpenCode implementations that preload all skills. This reduces:
- Token consumption
- Context overhead
- Memory usage

Ideal for large skill libraries.

---

## 9. LSP (Language Server Protocol) Integration

### 9.1 Purpose

LSP provides code intelligence features:
- Go to definition
- Find references
- Hover information
- Call hierarchy
- Symbol search

### 9.2 Configuration

**Enable LSP per language:**
```json
{
  "lsp": {
    "go": {
      "disabled": false,
      "command": "gopls"
    },
    "typescript": {
      "disabled": false,
      "command": "typescript-language-server",
      "args": ["--stdio"]
    },
    "python": {
      "disabled": false,
      "command": "pylsp"
    }
  }
}
```

### 9.3 Auto-Detection

OpenCode **automatically detects and configures** the best language servers for each language in the project.

### 9.4 Debug Mode

```json
{
  "debugLSP": true
}
```

---

## 10. Installation & Usage

### 10.1 Installation Methods

**Automated Script:**
```bash
curl -fsSL https://raw.githubusercontent.com/opencode-ai/opencode/refs/heads/main/install | bash

# Specific version:
curl -fsSL https://raw.githubusercontent.com/opencode-ai/opencode/refs/heads/main/install | VERSION=0.1.0 bash
```

**Homebrew:**
```bash
brew install opencode-ai/tap/opencode
```

**AUR (Arch Linux):**
```bash
yay -S opencode-ai-bin
paru -S opencode-ai-bin
```

**Go:**
```bash
go install github.com/opencode-ai/opencode@latest
```

**Requirements:** Go 1.24.0 or higher for building from source

### 10.2 Command-Line Usage

**Interactive Mode:**
```bash
opencode                    # Launch TUI
opencode -d                 # Enable debug logging
opencode -c /path/to/project # Set working directory
```

**Non-Interactive Mode:**
```bash
opencode -p "Explain the use of context in Go"
opencode -p "prompt text" -f json          # JSON output
opencode -p "prompt text" -q               # Suppress spinner
```

**Output Formats:**
- `text` - Plain output (default)
- `json` - JSON-wrapped response

### 10.3 Keyboard Navigation

**Global Shortcuts:**
- `Ctrl+C` - Quit
- `Ctrl+?` - Help
- `Ctrl+L` - Logs
- `Ctrl+A` - Switch session
- `Ctrl+K` - Commands
- `Ctrl+O` - Model selection

**Chat Page:**
- `Ctrl+N` - New session
- `Ctrl+X` - Cancel
- `i` - Focus editor
- `Esc` - Exit edit mode

**Editor:**
- `Ctrl+S` - Send message
- `Ctrl+E` - External editor

**Dialogs:**
- Arrow keys/hjkl - Navigation
- Enter - Select
- Esc - Close

### 10.4 VS Code/Cursor Integration

Launch directly into editors with keyboard shortcuts.

---

## 11. OpenCode vs. Claude Code vs. Kilo.ai

### 11.1 Comparison Table

| Aspect | OpenCode | Claude Code | Kilo.ai |
|--------|----------|-------------|---------|
| **Type** | Open-source CLI | Proprietary CLI | Web-based platform |
| **GitHub Stars** | 48,000+ | 47,000+ | N/A |
| **Cost** | Free (pay for API) | $17-100/month + API | Subscription-based |
| **Model Support** | 75+ providers | Claude only | Multiple providers |
| **Local Models** | Yes | No | No |
| **Source Code** | Fully open | Closed | Closed |
| **LSP Integration** | Yes (auto-detect) | Limited | Unknown |
| **MCP Support** | Yes | Yes | Unknown |
| **Plan Mode** | Yes (/plan command) | No | Unknown |
| **Multi-Session** | Yes (parallel) | Limited | Unknown |
| **Custom Tools** | Yes (TypeScript/JS) | Limited | Unknown |
| **Custom Agents** | Yes (JSON/Markdown) | No | Unknown |
| **Subagents** | Yes | Yes (parallel) | Unknown |
| **TUI** | Yes (Bubble Tea) | Yes | No |
| **Desktop App** | Yes | No | No |
| **IDE Extension** | Yes | No | Unknown |

### 11.2 Performance Benchmarks

**SWE-bench Verified:**
- Claude Code (Opus 4.5): **80.9%** (first model to exceed 80%)
- OpenCode performance varies by chosen model

**Practical Testing (Real-world task):**
- **Claude Code:** Best overall, minor issues fixed in one iteration
- **OpenCode + Sonnet-4:** Nearly identical, but removed tests without authorization
- **OpenCode + Gemini Pro 2.5:** Poor performance, hallucinations
- **OpenCode + GPT-4.1:** Good quality after feedback

### 11.3 Key Differences

**Architecture:**
- **OpenCode:** Go-based, terminal-native, open-source
- **Claude Code:** Closed-source, Claude-specific optimization
- **Kilo.ai:** Web-based platform, hundreds of thousands of developers

**Model Philosophy:**
- **OpenCode:** Multi-provider, user choice, no lock-in
- **Claude Code:** Single provider, deep integration, premium features
- **Kilo.ai:** Platform approach, unknown specifics

**Cost Model:**
- **OpenCode:** $0 tool cost + transparent API pricing
- **Claude Code:** $17-100/month subscription + API costs
- **Kilo.ai:** Subscription-based, pricing varies

**Workflow:**
- **OpenCode:** Plan-before-Build, flexible agents
- **Claude Code:** Checkpoints, Thinking mode (Opus 4.5), parallel subagents
- **Kilo.ai:** Unknown workflow specifics

**Advanced Features:**

**OpenCode Exclusives:**
- 75+ model provider support
- Local model support
- Custom tools (TypeScript/JS)
- Custom agents (JSON/Markdown)
- LSP auto-detection
- Fully customizable

**Claude Code Exclusives:**
- Checkpoints (instant state reversion)
- Thinking mode on Opus 4.5
- Parallel subagent workflows
- Tightest Claude integration

### 11.4 Use Case Recommendations

**Choose OpenCode if:**
- You want open-source transparency
- You need multi-provider flexibility
- You want local model support
- You prefer transparent API pricing
- You need custom tools/agents
- You want terminal-native workflow
- You're cost-conscious (50+ developers)

**Choose Claude Code if:**
- You want best-in-class Claude integration
- You need advanced features (Checkpoints, Thinking mode)
- You prefer curated experience
- You're willing to pay premium
- You want proven 80%+ SWE-bench performance
- You need parallel subagent workflows

**Choose Kilo.ai if:**
- You prefer web-based platforms
- You need team collaboration features
- You want integrated environment
- Specifics unknown due to limited research data

---

## 12. Best Practices for OpenCode

### 12.1 Project Setup

**1. Initialize Project:**
```bash
cd /path/to/project
opencode
/init
```

**2. Review Generated AGENTS.md:**
- Check project structure understanding
- Verify coding standards
- Add custom guidelines

**3. Configure .opencode.json:**
```json
{
  "model": "anthropic/claude-sonnet-4-5",
  "providers": {
    "anthropic": {
      "apiKey": "{env:ANTHROPIC_API_KEY}"
    }
  },
  "instructions": ["AGENTS.md", "CONTRIBUTING.md"],
  "permissions": {
    "bash": "ask",
    "write": "allow"
  }
}
```

### 12.2 Agent Configuration

**Define Specialized Agents:**

**Documentation Agent:**
```json
{
  "agents": {
    "docs": {
      "description": "Documentation writer - no code execution",
      "temperature": 0.7,
      "tools": {
        "bash": false
      },
      "permissions": {
        "write": "allow",
        "edit": "allow"
      }
    }
  }
}
```

**Review Agent:**
```json
{
  "agents": {
    "review": {
      "description": "Code reviewer - read-only analysis",
      "permissions": {
        "write": "deny",
        "bash": "deny"
      }
    }
  }
}
```

### 12.3 Custom Commands

**Test Command:**
```markdown
# Run Tests

Execute the test suite:
!`npm test`

Coverage report:
!`npm run coverage`
```

**Component Generator:**
```markdown
# Generate Component $1

Create React component named $1 with:
- TypeScript
- Styled components
- Unit tests
- Storybook story
```

### 12.4 Skills Organization

**Global Skills** (`~/.config/opencode/skills/`):
```
superpowers/
  writing/
    git-commits/
      SKILL.md
      references/
        conventional-commits.md
      assets/
        template.txt
  coding/
    refactoring/
      SKILL.md
      scripts/
        analyze.py
```

**Project Skills** (`.opencode/skills/`):
```
project-specific/
  deployment/
    SKILL.md
    scripts/
      deploy.sh
  testing/
    SKILL.md
    references/
      test-strategy.md
```

### 12.5 Permission Strategy

**Conservative Approach:**
```json
{
  "permissions": {
    "bash": "ask",
    "write": "ask",
    "edit": "allow",
    "webfetch": "deny"
  }
}
```

**Liberal Approach:**
```json
{
  "permissions": {
    "bash": "allow",
    "write": "allow",
    "edit": "allow"
  }
}
```

**Task-Specific:**
- Use restrictive permissions for exploration agents
- Use permissive for build agents

### 12.6 Model Selection

**Primary Agent (Expensive, Accurate):**
```json
{
  "agents": {
    "build": {
      "model": "anthropic/claude-opus-4-5"
    }
  }
}
```

**Subagents (Cheap, Fast):**
```json
{
  "agents": {
    "explore": {
      "model": "anthropic/claude-haiku-4"
    }
  }
}
```

**Title Generation (Ultra-Fast):**
```json
{
  "agents": {
    "title": {
      "model": "openai/gpt-4.1-mini",
      "maxTokens": 80
    }
  }
}
```

### 12.7 LSP Configuration

**Enable for Project Languages:**
```json
{
  "lsp": {
    "typescript": {
      "disabled": false,
      "command": "typescript-language-server",
      "args": ["--stdio"]
    },
    "python": {
      "disabled": false,
      "command": "pylsp"
    },
    "rust": {
      "disabled": false,
      "command": "rust-analyzer"
    }
  }
}
```

### 12.8 Context Management

**Auto-Compact:**
```json
{
  "autoCompact": true
}
```

Automatically summarizes conversations at 95% context window.

**Custom Instructions:**
```json
{
  "instructions": [
    "AGENTS.md",
    "CONTRIBUTING.md",
    "docs/architecture.md"
  ]
}
```

**Lazy Loading:**
Reference large files in AGENTS.md rather than preloading:
```markdown
# Architecture

For detailed architecture, see docs/architecture.md
```

### 12.9 Workflow Optimization

**Plan-Before-Build:**
1. Use `/plan` or switch to Plan agent (Tab)
2. Review proposed implementation
3. Switch to Build agent
4. Execute implementation

**Multi-Session:**
- Open multiple OpenCode instances for parallel work
- Use different agents per session
- Avoid conflicts with careful file management

**Checkpointing (Manual):**
- Commit frequently with git
- Use `/undo` for recent changes
- Test incrementally

---

## 13. Code Examples & Snippets

### 13.1 Custom Tool Example (Database Query)

**File:** `.opencode/tool/database.ts`

```typescript
import { tool } from "@opencode-ai/plugin"
import { Client } from "pg"

export default tool({
  description: "Query the PostgreSQL database with SELECT statements",
  args: {
    query: tool.schema.string().describe("SQL SELECT query to execute"),
    limit: tool.schema.number().optional().describe("Maximum rows to return")
  },
  async execute(args, context) {
    const client = new Client({
      connectionString: process.env.DATABASE_URL
    })

    try {
      await client.connect()

      let query = args.query
      if (args.limit) {
        query += ` LIMIT ${args.limit}`
      }

      const result = await client.query(query)

      return {
        rows: result.rows,
        count: result.rowCount,
        fields: result.fields.map(f => f.name)
      }
    } catch (error) {
      return { error: error.message }
    } finally {
      await client.end()
    }
  }
})
```

### 13.2 Custom Tool Example (Python Script Executor)

**File:** `.opencode/tool/pytest.ts`

```typescript
import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Run pytest tests with optional file filter",
  args: {
    file: tool.schema.string().optional().describe("Specific test file to run"),
    verbose: tool.schema.boolean().optional().describe("Enable verbose output")
  },
  async execute(args) {
    let command = "pytest"

    if (args.file) {
      command += ` ${args.file}`
    }

    if (args.verbose) {
      command += " -v"
    }

    const result = await Bun.$`${command}`.text()
    return result
  }
})
```

### 13.3 Custom Agent Example (Security Auditor)

**File:** `.opencode/agent/security.json`

```json
{
  "description": "Security-focused code auditor with read-only access",
  "mode": "primary",
  "temperature": 0.3,
  "model": "anthropic/claude-sonnet-4-5",
  "max_steps": 15,
  "tools": {
    "write": false,
    "edit": false,
    "patch": false,
    "bash": false,
    "read": true,
    "grep": true,
    "glob": true,
    "lsp": true
  },
  "permissions": {
    "write": "deny",
    "edit": "deny",
    "bash": "deny"
  },
  "prompt": "{file:.opencode/agent/security_prompt.md}"
}
```

**File:** `.opencode/agent/security_prompt.md`

```markdown
# Security Auditor Agent

You are a security-focused code auditor. Your role is to:

1. Identify security vulnerabilities
2. Analyze authentication and authorization
3. Check for injection vulnerabilities (SQL, XSS, etc.)
4. Review secrets management
5. Assess encryption and data protection
6. Examine dependency security

## Guidelines

- Focus on OWASP Top 10 vulnerabilities
- Provide severity ratings (Critical, High, Medium, Low)
- Suggest specific remediation steps
- Reference CVEs when applicable
- Check for hardcoded secrets

## Limitations

You have read-only access. You cannot:
- Modify files
- Execute commands
- Make code changes

Provide detailed reports with recommendations.
```

### 13.4 Custom Command Example (Git Workflow)

**File:** `.opencode/command/git/feature.md`

```markdown
# Create Feature Branch $1

Current git status:
!`git status`

Recent commits:
!`git log -5 --oneline`

Create feature branch named $1:
1. Checkout main
2. Pull latest
3. Create and checkout feature/$1
4. Push upstream

Execute: `git checkout main && git pull && git checkout -b feature/$1 && git push -u origin feature/$1`
```

### 13.5 SKILL.md Example (Git Commit Messages)

**File:** `~/.config/opencode/skills/writing/git-commits/SKILL.md`

```yaml
---
name: git-commits
description: Write high-quality conventional commit messages following industry standards
---

# Git Commit Message Skill

## Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only
- **style**: Formatting, missing semicolons, etc.
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvement
- **test**: Adding missing tests
- **chore**: Changes to build process or auxiliary tools

## Rules

1. Subject line: max 50 characters
2. Capitalize subject line
3. No period at end of subject
4. Use imperative mood ("Add" not "Added")
5. Body: wrap at 72 characters
6. Body explains what and why (not how)
7. Footer: reference issues and breaking changes

## Examples

### Feature
```
feat(auth): add OAuth2 authentication

Implement OAuth2 authentication flow with Google and GitHub providers.
Includes token refresh and revocation.

Closes #123
```

### Bug Fix
```
fix(api): handle null responses in user endpoint

Previous implementation crashed when user data was null.
Now returns 404 with appropriate error message.

Fixes #456
```

### Breaking Change
```
feat(api): change user endpoint response format

BREAKING CHANGE: User endpoint now returns { data: {...} } instead of
direct object. All clients must update their parsing logic.

Closes #789
```

## Anti-Patterns

- "Fixed stuff"
- "WIP"
- "asdfasdf"
- "Updated files"
- "Made changes"
```

**File:** `~/.config/opencode/skills/writing/git-commits/references/conventional-commits.md`

```markdown
# Conventional Commits Reference

Full specification: https://www.conventionalcommits.org/

## Structure

<type>[optional scope]: <description>

[optional body]

[optional footer(s)]

## Common Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Changes that don't affect code meaning (whitespace, formatting)
- **refactor**: Code change that neither fixes bug nor adds feature
- **perf**: Performance improvements
- **test**: Adding/correcting tests
- **build**: Changes affecting build system or dependencies
- **ci**: Changes to CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

## Scopes

Examples:
- **auth**: Authentication-related
- **api**: API layer
- **ui**: User interface
- **db**: Database
- **deps**: Dependencies

## Breaking Changes

Indicated with `BREAKING CHANGE:` in footer or `!` after type/scope:

```
feat!: send email to customer when product is shipped
```

or

```
feat(api): allow provided config object to extend other configs

BREAKING CHANGE: `extends` key in config file is now used for extending
other config files
```
```

### 13.6 MCP Server Configuration Example

**File:** `opencode.json`

```json
{
  "mcpServers": {
    "github": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "{env:GITHUB_TOKEN}"
      }
    },
    "filesystem": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/directory"]
    },
    "postgres": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "{env:DATABASE_URL}"
      }
    },
    "web-api": {
      "type": "sse",
      "url": "https://api.example.com/mcp",
      "headers": {
        "Authorization": "Bearer {env:API_TOKEN}",
        "X-Client-ID": "opencode"
      }
    }
  }
}
```

### 13.7 Complete opencode.json Example

**File:** `opencode.json` (Full Production Configuration)

```json
{
  "data": {
    "directory": ".opencode"
  },
  "model": "anthropic/claude-sonnet-4-5",
  "small_model": "anthropic/claude-haiku-4",
  "providers": {
    "anthropic": {
      "apiKey": "{env:ANTHROPIC_API_KEY}",
      "disabled": false
    },
    "openai": {
      "apiKey": "{env:OPENAI_API_KEY}",
      "disabled": false
    }
  },
  "agents": {
    "build": {
      "description": "Main development agent with full access",
      "model": "anthropic/claude-sonnet-4-5",
      "temperature": 0.7,
      "maxTokens": 8000,
      "max_steps": 20
    },
    "plan": {
      "description": "Planning agent with restricted permissions",
      "model": "anthropic/claude-sonnet-4-5",
      "temperature": 0.5,
      "permissions": {
        "write": "ask",
        "edit": "ask",
        "bash": "ask"
      }
    },
    "docs": {
      "description": "Documentation writer without code execution",
      "model": "anthropic/claude-sonnet-4-5",
      "temperature": 0.8,
      "tools": {
        "bash": false
      },
      "permissions": {
        "write": "allow",
        "edit": "allow"
      }
    },
    "security": {
      "description": "Security auditor with read-only access",
      "model": "anthropic/claude-sonnet-4-5",
      "temperature": 0.3,
      "permissions": {
        "write": "deny",
        "edit": "deny",
        "bash": "deny"
      }
    }
  },
  "default_agent": "build",
  "shell": {
    "path": "/bin/zsh",
    "args": ["-l"]
  },
  "mcpServers": {
    "github": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "{env:GITHUB_TOKEN}"
      }
    }
  },
  "lsp": {
    "typescript": {
      "disabled": false,
      "command": "typescript-language-server",
      "args": ["--stdio"]
    },
    "python": {
      "disabled": false,
      "command": "pylsp"
    },
    "go": {
      "disabled": false,
      "command": "gopls"
    }
  },
  "tools": {
    "write": true,
    "read": true,
    "edit": true,
    "bash": true,
    "grep": true,
    "glob": true,
    "list": true,
    "patch": true,
    "lsp": true,
    "webfetch": true,
    "question": true,
    "skill": true
  },
  "permissions": {
    "bash": "ask",
    "write": "allow",
    "edit": "allow",
    "webfetch": "deny"
  },
  "commands": {
    "test": {
      "template": "Run the test suite with coverage",
      "description": "Execute all tests"
    },
    "deploy": {
      "template": "Deploy to {env:ENVIRONMENT} environment",
      "description": "Deploy application",
      "agent": "build"
    }
  },
  "theme": "default",
  "instructions": [
    "AGENTS.md",
    "CONTRIBUTING.md",
    "docs/architecture.md"
  ],
  "autoupdate": "notify",
  "sharing": "manual",
  "debug": false,
  "debugLSP": false,
  "autoCompact": true,
  "formatters": {
    "typescript": "prettier",
    "python": "black"
  },
  "keybinds": {}
}
```

---

## 14. Platform Comparison: Deep Dive

### 14.1 Architecture Comparison

**OpenCode:**
- **Language:** Go
- **UI:** Bubble Tea TUI
- **Database:** SQLite
- **Distribution:** CLI binary, Desktop app, IDE extension
- **Source:** Fully open-source

**Claude Code:**
- **Language:** Unknown (proprietary)
- **UI:** Terminal-based
- **Database:** Unknown
- **Distribution:** CLI tool
- **Source:** Closed-source

**Kilo.ai:**
- **Language:** Unknown
- **UI:** Web-based
- **Database:** Unknown
- **Distribution:** Web platform
- **Source:** Proprietary

### 14.2 Tool System Comparison

| Feature | OpenCode | Claude Code | Kilo.ai |
|---------|----------|-------------|---------|
| **File Operations** | read, write, edit, patch | Similar | Unknown |
| **Search** | grep, glob, list | Similar | Unknown |
| **Execution** | bash with shell config | bash | Unknown |
| **LSP** | Yes (auto-detect) | Limited | Unknown |
| **MCP** | Yes (stdio, sse) | Yes | Unknown |
| **Custom Tools** | Yes (TS/JS) | No | Unknown |
| **Webfetch** | Yes | Unknown | Unknown |
| **Question** | Yes | Unknown | Unknown |
| **Skills** | Yes (plugin) | No | Unknown |

### 14.3 Agent System Comparison

| Feature | OpenCode | Claude Code | Kilo.ai |
|---------|----------|-------------|---------|
| **Primary Agents** | Build, Plan + Custom | Single agent | Unknown |
| **Subagents** | General, Explore + Custom | Parallel subagents | Unknown |
| **Custom Agents** | JSON/Markdown | No | Unknown |
| **Agent Switching** | Tab key | N/A | Unknown |
| **Permissions** | Per-agent, per-tool | Unknown | Unknown |
| **Temperature** | Configurable | Unknown | Unknown |
| **Max Steps** | Configurable | Unknown | Unknown |
| **Model Override** | Per-agent | N/A (Claude only) | Unknown |

### 14.4 Configuration Comparison

| Feature | OpenCode | Claude Code | Kilo.ai |
|---------|----------|-------------|---------|
| **Format** | JSON/JSONC | Unknown | Web UI? |
| **Locations** | 6-tier precedence | Unknown | N/A |
| **Project Config** | opencode.json | Unknown | N/A |
| **Global Config** | ~/.config/opencode/ | Unknown | N/A |
| **Env Variables** | Yes + substitution | Yes | Unknown |
| **File Substitution** | {file:path} | Unknown | Unknown |
| **Instructions** | Multiple files + glob | Unknown | Unknown |
| **Schema Validation** | opencode.ai/config.json | Unknown | Unknown |

### 14.5 Rules System Comparison

| Feature | OpenCode | Claude Code | Kilo.ai |
|---------|----------|-------------|---------|
| **Primary File** | AGENTS.md | .claude_rules? | Unknown |
| **Global Rules** | ~/.config/opencode/AGENTS.md | Unknown | Unknown |
| **Project Rules** | AGENTS.md in root | Unknown | Unknown |
| **Additional Files** | Via instructions | Unknown | Unknown |
| **Glob Support** | Yes (monorepos) | Unknown | Unknown |
| **Auto-generate** | /init command | Unknown | Unknown |
| **Lazy Loading** | Yes | Unknown | Unknown |

### 14.6 Skills System Comparison

| Feature | OpenCode | Claude Code | Kilo.ai |
|---------|----------|-------------|---------|
| **Support** | Yes (plugin) | No | Unknown |
| **Format** | SKILL.md + resources | N/A | Unknown |
| **Discovery** | skill_find tool | N/A | Unknown |
| **Loading** | skill_use tool | N/A | Unknown |
| **Resource Access** | skill_resource tool | N/A | Unknown |
| **Query Syntax** | Natural language | N/A | Unknown |
| **Lazy Loading** | Yes | N/A | Unknown |
| **Format Options** | XML, JSON, Markdown | N/A | Unknown |

### 14.7 Commands System Comparison

| Feature | OpenCode | Claude Code | Kilo.ai |
|---------|----------|-------------|---------|
| **Custom Commands** | Yes | Yes? | Unknown |
| **Format** | Markdown files | Unknown | Unknown |
| **Location** | command/ directory | .claude/ directory? | N/A |
| **Placeholders** | $ARGUMENTS, $1, $2... | Unknown | Unknown |
| **Dynamic Content** | !`command`, @file | Unknown | Unknown |
| **Built-in** | /init, /undo, /redo, /share | Unknown | Unknown |
| **Override Built-in** | Yes | Unknown | Unknown |

### 14.8 Unique Features

**OpenCode Unique:**
- 75+ LLM provider support
- Local model support
- Custom tools (TypeScript/JavaScript)
- Custom agents (JSON/Markdown configuration)
- LSP auto-detection
- Plan-before-Build workflow
- Multi-session parallel work
- Skills system (plugin)
- Desktop app + IDE extensions
- Fully open-source
- MCP stdio + sse support

**Claude Code Unique:**
- Checkpoints (instant state reversion)
- Thinking mode on Opus 4.5 (extended reasoning)
- Parallel subagent workflows
- 80.9% SWE-bench Verified (Opus 4.5)
- Tightest Claude integration
- Optimized for Claude's reasoning

**Kilo.ai Unique:**
- Web-based platform (no installation)
- Hundreds of thousands of developers
- Platform approach
- (Limited research data available)

### 14.9 Pricing Comparison

**OpenCode:**
- **Tool Cost:** $0 (free, open-source)
- **API Cost:** Pay-as-you-go to chosen provider
- **Total:** Transparent, user-controlled
- **Flexibility:** Switch providers anytime

**Claude Code:**
- **Subscription:** $17/month (Pro) or $100/month (Max)
- **API Cost:** Additional on top of subscription
- **Total:** $17-100+ per developer per month
- **Lock-in:** Claude only

**Kilo.ai:**
- **Subscription:** Unknown pricing
- **API Cost:** Likely included
- **Total:** Unknown
- **Flexibility:** Unknown

**Cost Analysis (50 developers):**
- **OpenCode:** $0 tool + API costs = ~$5-20k/month (API only)
- **Claude Code:** $850-5,000/month + API = ~$10-30k/month
- **Significant savings with OpenCode at scale**

---

## 15. Migration Guidance

### 15.1 From Claude Code to OpenCode

**Step 1: Install OpenCode**
```bash
curl -fsSL https://raw.githubusercontent.com/opencode-ai/opencode/refs/heads/main/install | bash
```

**Step 2: Transfer Configuration**

If you have `.claude_rules` or similar:
```bash
cp ~/.claude/rules ~/.config/opencode/AGENTS.md
```

**Step 3: Configure Provider**
```bash
export ANTHROPIC_API_KEY="your-key"
```

or in `opencode.json`:
```json
{
  "providers": {
    "anthropic": {
      "apiKey": "{env:ANTHROPIC_API_KEY}"
    }
  },
  "agents": {
    "build": {
      "model": "anthropic/claude-sonnet-4-5"
    }
  }
}
```

**Step 4: Initialize Project**
```bash
cd /path/to/project
opencode
/init
```

**Step 5: Test Workflow**
- Verify file operations work
- Test bash execution
- Check model responses

**Step 6: Optimize**
- Add custom agents if needed
- Configure permissions
- Set up custom commands

### 15.2 From Kilo.ai to OpenCode

**Step 1: Export Context**
- Export any project-specific instructions
- Save custom prompts or guidelines

**Step 2: Install OpenCode**
```bash
brew install opencode-ai/tap/opencode
```

**Step 3: Create AGENTS.md**

Transfer project guidelines to AGENTS.md:
```markdown
# Project Guidelines

[Your exported instructions]
```

**Step 4: Configure Providers**
```json
{
  "providers": {
    "anthropic": { "apiKey": "{env:ANTHROPIC_API_KEY}" },
    "openai": { "apiKey": "{env:OPENAI_API_KEY}" }
  }
}
```

**Step 5: Recreate Workflows**
- Convert web-based workflows to commands
- Set up custom tools if needed
- Configure agents for specialized tasks

---

## 16. Troubleshooting

### 16.1 Common Issues

**Issue: "Command not found: opencode"**

**Solution:**
```bash
# Check installation
which opencode

# Add to PATH (bash)
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Add to PATH (zsh)
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**Issue: "API Key not configured"**

**Solution:**
```bash
# Set environment variable
export ANTHROPIC_API_KEY="your-key"

# Or add to shell config
echo 'export ANTHROPIC_API_KEY="your-key"' >> ~/.zshrc
source ~/.zshrc

# Or use opencode.json
{
  "providers": {
    "anthropic": {
      "apiKey": "{env:ANTHROPIC_API_KEY}"
    }
  }
}
```

**Issue: "Permission denied when running bash commands"**

**Solution:**
```json
{
  "permissions": {
    "bash": "allow"
  }
}
```

**Issue: "LSP not working"**

**Solution:**
```bash
# Enable debug
opencode -d

# Check LSP config
{
  "lsp": {
    "typescript": {
      "disabled": false,
      "command": "typescript-language-server",
      "args": ["--stdio"]
    }
  },
  "debugLSP": true
}

# Install language server
npm install -g typescript-language-server
```

**Issue: "Skills not found"**

**Solution:**
```bash
# Check skill paths
ls ~/.config/opencode/skills/
ls .opencode/skills/

# Verify SKILL.md format
# Check name matches directory

# Enable debug
{
  "debug": true
}
```

**Issue: "MCP server connection failed"**

**Solution:**
```json
{
  "mcpServers": {
    "example": {
      "type": "stdio",
      "command": "full/path/to/server",
      "env": {
        "API_KEY": "{env:API_KEY}"
      },
      "args": ["--verbose"]
    }
  },
  "debug": true
}
```

### 16.2 Debug Mode

**Enable Debug Logging:**
```bash
opencode -d
```

or in `opencode.json`:
```json
{
  "debug": true,
  "debugLSP": true
}
```

**View Logs:**
```bash
# In TUI
Ctrl+L

# Or check log files
tail -f ~/.config/opencode/logs/opencode.log
```

---

## 17. Future Considerations

### 17.1 Project Status: ARCHIVED

**Important Note:** OpenCode has been archived and moved to [Crush](https://github.com/charmbracelet/crush) by the original author and the Charm team.

**Implications:**
- Original OpenCode repository is now read-only
- No new features or bug fixes for OpenCode
- Community may fork and continue development
- Consider evaluating Crush for future use

**Recommendation:**
- Continue using OpenCode for existing projects
- Monitor Crush development for migration path
- Watch for community forks
- Evaluate alternatives (Claude Code, Cursor, etc.)

### 17.2 Potential Migration Path

**To Crush:**
- Wait for stable release
- Evaluate feature parity
- Test migration process
- Transfer configuration

**To Claude Code:**
- If you primarily use Claude models
- If you need latest features (Checkpoints, Thinking mode)
- If you prefer curated experience

**To Other Platforms:**
- Cursor (IDE integration)
- Continue (VS Code extension)
- Cody (multi-IDE support)

---

## 18. Resources & References

### 18.1 Official Documentation

- **OpenCode Repository:** https://github.com/opencode-ai/opencode (ARCHIVED)
- **OpenCode Docs:** https://opencode.ai/docs
- **Crush (Successor):** https://github.com/charmbracelet/crush
- **opencode-skillful Plugin:** https://github.com/zenobi-us/opencode-skillful
- **Config Schema:** https://opencode.ai/config.json

### 18.2 Comparison Articles

- [OpenCode vs Claude Code vs Cursor: 2026 Comparison](https://www.nxcode.io/resources/news/opencode-vs-claude-code-vs-cursor-2026)
- [OpenCode vs Claude Code: Battle Guide](https://byteiota.com/opencode-vs-claude-code-2026-battle-guide-48k-vs-47k/)
- [Comparing Claude Code vs OpenCode (Testing Different Models)](https://www.andreagrandi.it/posts/comparing-claude-code-vs-opencode-testing-different-models/)
- [OpenCode vs Claude Code - Daniel Miessler](https://danielmiessler.com/blog/opencode-vs-claude-code)

### 18.3 Technical Resources

- [Agents | OpenCode](https://opencode.ai/docs/agents/)
- [Rules | OpenCode](https://opencode.ai/docs/rules/)
- [Inside OpenCode: How to Build an AI Coding Agent That Actually Works](https://medium.com/@gaharwar.milind/inside-opencode-how-to-build-an-ai-coding-agent-that-actually-works-28c614494f4f)
- [Bubble Tea Framework](https://github.com/charmbracelet/bubbletea)
- [Model Context Protocol](https://modelcontextprotocol.io/)

### 18.4 Community Resources

- **GitHub Stars:** 48,000+ (as of Jan 2026)
- **GitHub Forks:** 876+
- **DeepWiki Documentation:** https://deepwiki.com/anomalyco/opencode
- **Medium Articles:** Various community tutorials and guides

---

## 19. Summary & Key Takeaways

### 19.1 OpenCode Strengths

1. **Open-Source:** Full transparency, community-driven, free
2. **Multi-Provider:** 75+ LLM providers, no vendor lock-in
3. **Customizable:** Custom tools, agents, commands, skills
4. **Terminal-Native:** Fast, efficient, developer-friendly
5. **LSP Integration:** Code intelligence with auto-detection
6. **MCP Support:** Extensible through MCP servers
7. **Plan-Before-Build:** Deliberate workflow with review
8. **Local Models:** Support for self-hosted models
9. **Flexible Configuration:** 6-tier precedence, JSON/JSONC
10. **Multi-Interface:** TUI, Desktop, IDE extensions

### 19.2 OpenCode Limitations

1. **Archived Status:** Project moved to Crush, no new features
2. **Complex Configuration:** Many options to learn
3. **Community Support:** Dependent on community after archival
4. **Performance Variability:** Depends on chosen model
5. **Authorization Issues:** Reported unauthorized code changes
6. **No Checkpoints:** Unlike Claude Code's instant reversion

### 19.3 Best Use Cases

**OpenCode is ideal for:**
- Developers who want open-source transparency
- Teams needing multi-provider flexibility
- Cost-conscious organizations (50+ developers)
- Users wanting local model support
- Projects requiring custom tools/agents
- Terminal-native workflows
- Experimentation with different models

**Claude Code is better for:**
- Teams committed to Claude models
- Users needing advanced features (Checkpoints, Thinking mode)
- Organizations valuing curated experience
- Projects requiring 80%+ SWE-bench performance
- Users willing to pay premium for integration

### 19.4 Final Recommendations

1. **For New Projects:**
   - Evaluate Crush (OpenCode successor)
   - Consider Claude Code if using Claude models primarily
   - Monitor community forks of OpenCode

2. **For Existing OpenCode Users:**
   - Continue using for current projects
   - Plan migration path to Crush or alternatives
   - Stay informed on community developments

3. **For Teams:**
   - Assess total cost of ownership (tools + API)
   - Consider provider flexibility vs. integration depth
   - Evaluate need for custom tools/agents

4. **For Evaluation:**
   - Test both OpenCode and Claude Code with real tasks
   - Compare performance with your preferred models
   - Assess configuration complexity vs. needs
   - Consider long-term maintenance and support

---

**Report Compiled:** January 11, 2026
**Research Sources:** 9 primary sources + 6 comparison articles
**Total Content:** 19 comprehensive sections covering architecture, tools, configuration, agents, skills, comparisons, and best practices

---

## Sources

- [Agents | OpenCode](https://opencode.ai/docs/agents/)
- [Rules | OpenCode](https://opencode.ai/docs/rules/)
- [Agent Configuration | anomalyco/opencode | DeepWiki](https://deepwiki.com/anomalyco/opencode/5.1-agent-configuration)
- [GitHub - opencode-ai/opencode: A powerful AI coding agent. Built for the terminal.](https://github.com/opencode-ai/opencode)
- [Inside OpenCode: How to Build an AI Coding Agent That Actually Works | by Milind | Medium](https://medium.com/@gaharwar.milind/inside-opencode-how-to-build-an-ai-coding-agent-that-actually-works-28c614494f4f)
- [OpenCode vs Claude Code vs Cursor: Which AI Coding Tool Should You Use in 2026 | NxCode](https://www.nxcode.io/resources/news/opencode-vs-claude-code-vs-cursor-2026)
- [OpenCode vs Claude Code: 2026 Battle Guide (48K vs 47K) | byteiota](https://byteiota.com/opencode-vs-claude-code-2026-battle-guide-48k-vs-47k/)
- [Comparing Claude Code vs OpenCode (and testing different models)](https://www.andreagrandi.it/posts/comparing-claude-code-vs-opencode-testing-different-models/)
- [OpenCode vs Claude Code - Daniel Miessler](https://danielmiessler.com/blog/opencode-vs-claude-code)
