# OPENCODE — OpenCode Specific Instructions

> **Prerequisites**: You must read AGENTS.md first. This file contains OpenCode-specific optimizations that build on universal instructions.

---

## Platform Identification

**You are using OpenCode if you have access to these tools**:
- `read` - Read files with optional line range
- `write` - Create new files
- `edit` - Modify existing files via string replacement or diff
- `patch` - Apply unified diff patches
- `bash` - Execute shell commands
- `grep` - Search file contents with regex
- `glob` - Find files by pattern
- `list` - List directory contents
- `skill` - Invoke agent skills
- `question` - Ask user questions
- `webfetch` - Fetch web content
- `lsp` - Language Server Protocol integration
- `todowrite`/`todoread` - Task management

**Context**: TypeScript-based client-server architecture, multi-provider support (75+ LLM providers), plugin system, hierarchical configuration

**Repository**: https://github.com/anomalyco/opencode

---

## Architecture Overview

### Client-Server Model

OpenCode uses a client-server architecture:

```
┌─────────────────────────────────────────┐
│          OpenCode Client                │
│  (CLI interface, VS Code extension)     │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│          OpenCode Server                │
│  - Request handling                     │
│  - Provider routing (75+ LLM providers) │
│  - Tool execution                       │
│  - State management                     │
└─────────────────────────────────────────┘
```

**Key Characteristics**:
- **Language**: TypeScript monorepo (83.7% TypeScript, 10.8% JavaScript)
- **Multi-Provider**: Supports Claude, OpenAI, Ollama, Gemini, and 70+ other LLM providers
- **Extensible**: Plugin architecture for custom tools, agents, commands, skills
- **Configurable**: 6-tier hierarchical configuration merging
- **LSP Integration**: Built-in Language Server Protocol support for code intelligence

---

## Tool Capabilities & Optimal Usage

### File Operations (Built-in Tools)

**Read Tool** - Reading files
```typescript
// Read entire file
read({ path: "directives/scrape_website.md" })

// Read specific line range
read({ path: "execution/script.py", lines: [10, 50] })

// Read checkpoint
read({ path: "CHECKPOINT.md" })
```

**Write Tool** - Creating new files
```typescript
// Create new directive
write({
  path: "directives/new_task.md",
  content: "# Task: New Task\n\n..."
})

// Create new script
write({
  path: "execution/new_script.py",
  content: "#!/usr/bin/env python3\n..."
})
```

**Edit Tool** - Modifying existing files
```typescript
// Edit by string replacement
edit({
  path: "directives/scrape_website.md",
  oldString: "## Learning Log\n\n(Empty)",
  newString: "## Learning Log\n\n- 2025-01-11: Rate limit is 10 req/min"
})

// Edit by diff (advanced)
edit({
  path: "execution/script.py",
  diff: "... unified diff format ..."
})
```

**Patch Tool** - Apply unified diffs
```typescript
// Apply patch from file
patch({
  path: "execution/script.py",
  patch: "--- a/execution/script.py\n+++ b/execution/script.py\n..."
})
```

### Search and Discovery Tools

**Grep Tool** - Search file contents
```typescript
// Find directives by keyword
grep({
  pattern: "scrape",
  path: "directives",
  outputMode: "files_with_matches"
})

// Search with context
grep({
  pattern: "API.*error",
  path: "execution",
  glob: "*.py",
  outputMode: "content",
  contextBefore: 2,
  contextAfter: 2
})
```

**Glob Tool** - Find files by pattern
```typescript
// List all directives
glob({ pattern: "directives/*.md" })

// Find Python scripts
glob({ pattern: "execution/**/*.py" })

// Find skills
glob({ pattern: ".opencode/skills/*/SKILL.md" })
```

**List Tool** - List directory contents
```typescript
// List directory
list({ path: "directives" })

// List with details
list({ path: "execution", detailed: true })
```

### Execution Tools

**Bash Tool** - Execute shell commands
```typescript
// Run Python script
bash({
  command: 'python execution/script.py --arg value',
  description: "Execute scraping script"
})

// Install dependencies
bash({
  command: 'pip install -r requirements.txt',
  description: "Install Python packages"
})

// Git operations
bash({
  command: 'git status',
  description: "Check git status"
})
```

### Advanced Tools

**Skill Tool** - Invoke agent skills
```typescript
// Invoke skill by name
skill({ name: "pdf-processing-pipeline" })

// Skills auto-discovered from:
// - .opencode/skills/ (project-specific)
// - ~/.opencode/skills/ (personal)
```

**Question Tool** - Ask user questions
```typescript
// Ask for clarification
question({
  question: "Which API endpoint should I use?",
  options: ["Production", "Staging", "Development"]
})
```

**WebFetch Tool** - Fetch web content
```typescript
// Fetch API documentation
webfetch({
  url: "https://api.example.com/docs",
  prompt: "Extract rate limit information"
})
```

**LSP Tool** - Language intelligence
```typescript
// Get symbol definitions
lsp({
  action: "definition",
  path: "src/main.py",
  position: { line: 10, character: 5 }
})

// Get hover information
lsp({
  action: "hover",
  path: "src/main.py",
  position: { line: 15, character: 10 }
})
```

**TodoWrite/TodoRead Tools** - Task management
```typescript
// Write todos
todowrite({
  todos: [
    { content: "Extract PDF text", status: "in_progress" },
    { content: "Parse structured data", status: "pending" }
  ]
})

// Read todos
todoread()
```

---

## Configuration System

### Hierarchical Configuration Merging (6 Tiers)

OpenCode merges configuration from multiple sources in this priority order:

```
Priority 1 (Highest): Runtime CLI arguments
    ↓
Priority 2: Project .opencode/config.json
    ↓
Priority 3: Workspace .opencode/config.json
    ↓
Priority 4: User ~/.opencode/config.json
    ↓
Priority 5: Environment variables (OPENCODE_*)
    ↓
Priority 6 (Lowest): Built-in defaults
```

**Example Configuration**:
```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-5-20250929",
  "maxTokens": 8192,
  "temperature": 0.7,
  "rulesFile": ".opencode/AGENTS.md",
  "customAgentsDir": ".opencode/agents",
  "customSkillsDir": ".opencode/skills",
  "customCommandsDir": ".opencode/commands",
  "customToolsDir": ".opencode/tools",
  "pluginsDir": ".opencode/plugins",
  "historyDir": ".opencode/history",
  "autoSave": true,
  "maxHistoryEntries": 1000
}
```

**Common Configuration Locations**:
- **Project**: `.opencode/config.json` (version controlled, team-shared)
- **User**: `~/.opencode/config.json` (personal preferences)
- **Environment**: `OPENCODE_API_KEY`, `OPENCODE_PROVIDER`, etc.

---

## Rules System (AGENTS.md)

### How Rules Work

OpenCode loads instructions from `AGENTS.md` (or custom path via `rulesFile` config):

```
┌─────────────────────────────────────────┐
│         Request from User               │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Load Rules: .opencode/AGENTS.md        │
│  - Universal instructions               │
│  - Tool-specific instructions           │
│  - Project context                      │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Route to Provider (Claude, GPT, etc.)  │
│  + Rules in system prompt               │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Execute with Tool Access               │
└─────────────────────────────────────────┘
```

**Rules File Structure**:
```markdown
# AGENTS.md

## Universal Instructions
[Instructions for all agents]

## Tool-Specific Instructions
[Load OPENCODE.md, CLAUDE.md, etc.]

## Project Context
[Project-specific guidelines]
```

**Dynamic Rule Loading**:
- Rules loaded fresh on each request
- Changes take effect immediately (no restart needed)
- Can reference other instruction files
- Supports conditional loading based on context

---

## Agents System

### Primary Agents

**Build Agent** (Default)
```typescript
// Invoked by default for general tasks
// Full access to all tools
// Use for: coding, debugging, file operations
```

**Plan Agent**
```typescript
// Invoked with @plan or when planning needed
// Focus on architecture and design
// Use for: feature planning, system design
```

### Subagents

**@general Subagent**
```typescript
// General-purpose subagent
// Launched via skill tool with context: fork
// Use for: isolated tasks, research
```

**@explore Subagent**
```typescript
// Specialized for codebase exploration
// Fast pattern matching and search
// Use for: finding files, understanding structure
```

### Custom Agents

Create custom agents in `.opencode/agents/`:

```typescript
// .opencode/agents/security-reviewer.json
{
  "name": "security-reviewer",
  "description": "Security-focused code reviewer",
  "model": "claude-opus-4-5",
  "temperature": 0.3,
  "systemPrompt": "You are a security expert. Review code for vulnerabilities...",
  "allowedTools": ["read", "grep", "glob", "list", "lsp"],
  "maxTokens": 16384
}
```

**Invoke custom agent**:
```bash
opencode --agent security-reviewer "Review this authentication code"
```

---

## Commands System

### Slash Commands

Commands live in `.opencode/commands/` as Markdown files:

```markdown
<!-- .opencode/commands/review.md -->
# Code Review Command

Review the following code for:
- Security vulnerabilities
- Performance issues
- Code quality
- Best practices

Focus on {{language}} specific patterns.
```

**Invoke**:
```bash
/review language=Python
```

**Parameterized Commands**:
```markdown
<!-- .opencode/commands/test.md -->
# Run Tests

Execute tests for {{component}} with {{coverage}} coverage.

Use pytest with these flags:
- -v for verbose
- --cov={{component}} for coverage
- --cov-report={{report_format}}
```

**Invoke**:
```bash
/test component=authentication coverage=95 report_format=html
```

### Command Discovery

Commands auto-discovered from:
1. `.opencode/commands/` (project commands)
2. `~/.opencode/commands/` (personal commands)

**List available commands**:
```bash
opencode --list-commands
```

---

## Skills System

### SKILL.md Format

Skills follow the same format as Claude Code, VS Code Copilot, Kilo.ai:

```markdown
<!-- .opencode/skills/pdf-processing/SKILL.md -->
---
name: pdf-processing-pipeline
description: |
  Extract structured data from PDF documents including invoices, forms, and reports.
  Use when processing PDFs, extracting tables, filling forms, or when user mentions
  PDF data extraction, invoice processing, form filling, or document parsing.
---

# PDF Processing Pipeline

## Overview
This skill orchestrates a multi-step workflow for extracting data from PDFs.

## Workflow
1. Extract text from PDF (directives/extract_pdf_text.md)
2. Parse structured data (directives/parse_structured_data.md)
3. Validate data format (directives/validate_data_format.md)
4. Store results (directives/store_data.md)

## Error Handling
[Skill-specific error recovery patterns]

## Examples
[Usage examples]
```

### Progressive Disclosure

OpenCode implements 3-tier loading:

1. **Discovery** (~50 tokens): name + description from frontmatter
2. **Activation** (~2-5K tokens): full SKILL.md when matched
3. **Execution** (on-demand): supporting files when referenced

**Storage Locations**:
- **Project**: `.opencode/skills/` (team-shared, version controlled)
- **Personal**: `~/.opencode/skills/` (user-specific)

**Invoke skill**:
```typescript
// Auto-activation by keyword match
"Extract data from this PDF invoice" // Triggers pdf-processing-pipeline

// Manual activation
skill({ name: "pdf-processing-pipeline" })
```

### Skill with Forked Context

For isolation, use custom agent in skill:

```markdown
---
name: read-only-analyzer
description: Analyze code without making changes
agent: security-reviewer
context: fork
---

# Read-Only Code Analyzer
[Skill content]
```

---

## Plugin Architecture

### Plugin Types

**1. Tool Plugins**
```typescript
// .opencode/plugins/custom-tool/index.ts
export default {
  name: "custom-tool",
  description: "Custom tool for specific task",

  async execute(params: { arg1: string, arg2: number }) {
    // Tool implementation
    return { result: "success" };
  },

  schema: {
    type: "object",
    properties: {
      arg1: { type: "string", description: "First argument" },
      arg2: { type: "number", description: "Second argument" }
    },
    required: ["arg1"]
  }
};
```

**2. Provider Plugins**
```typescript
// .opencode/plugins/custom-provider/index.ts
export default {
  name: "custom-llm",

  async generateCompletion(params) {
    // Call custom LLM API
    return { content: "response" };
  },

  async generateStream(params) {
    // Stream custom LLM API
    // Yield chunks
  }
};
```

**3. Extension Plugins**
```typescript
// .opencode/plugins/custom-extension/index.ts
export default {
  name: "custom-extension",

  onServerStart() {
    // Initialize when server starts
  },

  onRequest(request) {
    // Hook into request lifecycle
  },

  onResponse(response) {
    // Hook into response lifecycle
  }
};
```

### Plugin Installation

**Local Plugins**:
```bash
# Create plugin directory
mkdir -p .opencode/plugins/my-plugin

# Create plugin
cat > .opencode/plugins/my-plugin/index.ts << 'EOF'
export default {
  name: "my-plugin",
  async execute(params) { /* ... */ }
};
EOF
```

**NPM Plugins**:
```bash
# Install from NPM
npm install @opencode/plugin-name

# Configure in config.json
{
  "plugins": ["@opencode/plugin-name"]
}
```

---

## Directory Structure

### Recommended Layout

```
project/
├── .opencode/
│   ├── config.json              # Project configuration
│   ├── AGENTS.md                # Rules file (universal instructions)
│   ├── OPENCODE.md              # OpenCode-specific instructions
│   ├── CLAUDE.md                # Claude Code instructions (if cross-platform)
│   ├── CHECKPOINT.md            # Project state
│   ├── {project}_bugs.md        # Bug log
│   │
│   ├── agents/                  # Custom agents
│   │   ├── security-reviewer.json
│   │   └── performance-analyzer.json
│   │
│   ├── commands/                # Slash commands
│   │   ├── review.md
│   │   ├── test.md
│   │   └── deploy.md
│   │
│   ├── skills/                  # Agent skills
│   │   ├── pdf-processing/
│   │   │   ├── SKILL.md
│   │   │   └── supporting-docs.md
│   │   └── code-review/
│   │       └── SKILL.md
│   │
│   ├── tools/                   # Custom tools (plugins)
│   │   └── database-query/
│   │       └── index.ts
│   │
│   ├── plugins/                 # Extension plugins
│   │   └── custom-provider/
│   │       └── index.ts
│   │
│   └── history/                 # Conversation history
│       └── 2025-01-11-session.json
│
├── directives/                  # Layer 1: Directives (SOPs)
│   ├── extract_pdf_text.md
│   ├── parse_structured_data.md
│   └── validate_data_format.md
│
├── execution/                   # Layer 3: Execution scripts
│   ├── extract_text.py
│   ├── parse_data.py
│   └── validate.py
│
├── .tmp/                        # Temporary files
│   └── working_data.json
│
├── .env                         # Environment variables (NOT committed)
├── requirements.txt             # Python dependencies
└── package.json                 # Node.js dependencies (if applicable)
```

---

## OpenCode Workflow Optimization

### Standard Task Execution Pattern

**Step 1: Check Session State**
```typescript
// Read state files if they exist
read({ path: "CHECKPOINT.md" })        // Check project status
read({ path: "{project}_bugs.md" })    // Check known issues
```

**Step 2: Find Relevant Directive**
```typescript
// Search for directive by keyword
grep({
  pattern: "scrape|website",
  path: "directives",
  outputMode: "files_with_matches"
})

// Read the directive
read({ path: "directives/scrape_website.md" })
```

**Step 3: Check for Existing Execution Tools**
```typescript
// Find existing scripts
glob({ pattern: "execution/*scrape*.py" })

// If found, read the script
read({ path: "execution/scrape_single_site.py" })
```

**Step 4: Execute with Bash**
```typescript
// Run the script with proper arguments
bash({
  command: 'python execution/scrape_single_site.py --url "https://example.com" --output .tmp/data.json',
  description: "Execute website scraping script"
})
```

**Step 5: Handle Results**
```typescript
// If successful (exit code 0):
// - Update CHECKPOINT.md with results
// - Continue to next task

// If error (exit code != 0):
// - Apply Error Recovery Protocol from AGENTS.md
// - Classify error type
// - Fix and retest
// - Update directive and bugs.md
```

**Step 6: Update State**
```typescript
// Update checkpoint with progress
edit({
  path: "CHECKPOINT.md",
  oldString: "| Scraping | ❌ Not Started |",
  newString: "| Scraping | ✅ Completed |"
})
```

---

## Multi-Provider Support

### Provider Configuration

OpenCode supports 75+ LLM providers via configuration:

```json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-5-20250929",
  "apiKey": "${ANTHROPIC_API_KEY}",
  "apiEndpoint": "https://api.anthropic.com/v1"
}
```

**Common Providers**:
- **Anthropic**: Claude models (Opus, Sonnet, Haiku)
- **OpenAI**: GPT-4, GPT-3.5
- **Ollama**: Local models (Llama, Mistral, etc.)
- **Google**: Gemini models
- **Cohere**: Command models
- **Groq**: Fast inference
- **Azure OpenAI**: Enterprise OpenAI
- **AWS Bedrock**: Multi-model platform
- **Hugging Face**: Various models

### Switching Providers

**Runtime**:
```bash
opencode --provider openai --model gpt-4-turbo
opencode --provider ollama --model llama3:70b
opencode --provider anthropic --model claude-opus-4-5
```

**Configuration**:
```json
{
  "provider": "ollama",
  "model": "llama3:70b",
  "apiEndpoint": "http://localhost:11434/v1"
}
```

**Environment Variables**:
```bash
export OPENCODE_PROVIDER=anthropic
export OPENCODE_MODEL=claude-sonnet-4-5-20250929
export ANTHROPIC_API_KEY=sk-ant-...
```

---

## Error Recovery with OpenCode

### Error Classification Quick Reference

When a bash command exits with non-zero code:

**Exit Code 1: Invalid Arguments**
```typescript
// Fix approach: Validate inputs before calling script
// 1. Read directive to check required arguments
read({ path: "directives/task.md" })
// 2. Fix argument format
// 3. Retry bash command with corrected arguments
```

**Exit Code 2: Missing Environment Variable**
```typescript
// Fix approach: Check .env and add missing variables
// 1. Read the script to see what's required
read({ path: "execution/script.py" })  // Look in validate_environment()
// 2. Ask user for the value
question({
  question: "Please provide the API key for this service",
  options: ["Enter manually", "Skip for now"]
})
// 3. Update .env (if user provides value)
edit({
  path: ".env",
  oldString: "",
  newString: "API_KEY=value\n"
})
// 4. Retry
```

**Exit Code 3: API Error**
```typescript
// Fix approach: Check if paid API, handle rate limits
// 1. Read error message from bash output
// 2. If "rate limit" or "429":
//    - Free API: Wait 60s, retry once
//    - Paid API: Ask user before retry
// 3. If "401" or "403": Check credentials in .env
// 4. Update directive with API limit info
```

**Exit Code 4: Data Processing Error**
```typescript
// Fix approach: Add validation, update script
// 1. Read script to understand data flow
read({ path: "execution/script.py" })
// 2. Edit script to add validation
edit({
  path: "execution/script.py",
  oldString: old_logic,
  newString: new_logic
})
// 3. Test with bash
// 4. Log bug in bugs.md
```

**Exit Code 5: File I/O Error**
```typescript
// Fix approach: Check file paths, permissions
// 1. Use bash to check if directory exists
bash({
  command: "ls -la .tmp/",
  description: "Check temp directory"
})
// 2. Create missing directories
bash({
  command: "mkdir -p .tmp/",
  description: "Create temp directory"
})
// 3. Retry script
```

---

## Advanced Patterns

### Multi-Step Directive Execution
```typescript
// For complex tasks involving multiple directives:

// 1. List relevant directives
grep({
  pattern: "data.*process",
  path: "directives",
  outputMode: "files_with_matches"
})

// 2. Read each in sequence
const directive1 = read({ path: "directives/fetch_data.md" })
const directive2 = read({ path: "directives/process_data.md" })
const directive3 = read({ path: "directives/upload_results.md" })

// 3. Execute in order, checking for errors at each step
const result1 = bash({ command: "python execution/fetch_data.py --source api" })
// Check result1 exit code before proceeding

const result2 = bash({ command: "python execution/process_data.py --input .tmp/raw_data.json" })
// Check result2 exit code before proceeding

const result3 = bash({ command: "python execution/upload_results.py --file .tmp/processed_data.json" })

// 4. Update checkpoint with pipeline status
```

### Using Custom Agents for Complex Tasks
```typescript
// When you need specialized expertise:

// 1. Define custom agent
// .opencode/agents/security-expert.json
{
  "name": "security-expert",
  "description": "Security-focused code analysis",
  "model": "claude-opus-4-5",
  "systemPrompt": "You are a security expert...",
  "allowedTools": ["read", "grep", "glob", "lsp"]
}

// 2. Invoke via CLI
// opencode --agent security-expert "Review authentication flow"

// 3. Or reference in skill
// .opencode/skills/security-audit/SKILL.md
// ---
// name: security-audit
// agent: security-expert
// context: fork
// ---
```

### LSP Integration for Code Intelligence
```typescript
// When working with code:

// 1. Get symbol definition
lsp({
  action: "definition",
  path: "src/authentication.py",
  position: { line: 45, character: 12 }
})

// 2. Get type information
lsp({
  action: "hover",
  path: "src/authentication.py",
  position: { line: 45, character: 12 }
})

// 3. Get references
lsp({
  action: "references",
  path: "src/authentication.py",
  position: { line: 45, character: 12 }
})

// Use LSP for accurate refactoring, understanding call graphs, etc.
```

---

## Best Practices Summary

### DO ✅
- **Always read CHECKPOINT.md and bugs.md at session start**
- **Use read/edit/write tools for file operations** (not bash cat/sed)
- **Use grep/glob/list for searching** (not bash grep/find)
- **Use bash only for executing Python scripts and system commands**
- **Check for existing directives before creating new ones**
- **Update directives with learnings** (API limits, edge cases)
- **Log non-obvious bugs in bugs.md**
- **Test scripts with --test-mode before production use**
- **Validate environment variables before execution**
- **Update CHECKPOINT.md at end of significant work**
- **Use LSP integration for code intelligence**
- **Leverage multi-provider support** (switch to local models for rapid iteration)
- **Use custom agents for specialized tasks**
- **Create skills for reusable workflows**
- **Use plugins for project-specific tooling**

### DON'T ❌
- **Don't use bash cat/head/tail** (use read tool)
- **Don't use bash echo > file** (use write tool)
- **Don't use bash sed/awk** (use edit tool)
- **Don't use bash grep/find** (use grep/glob tools)
- **Don't retry paid API calls without asking user**
- **Don't create new scripts if existing ones work**
- **Don't skip error classification** (apply Error Recovery Protocol)
- **Don't forget to update state files**
- **Don't commit .env or credentials files**
- **Don't hardcode API keys in code** (use .env and config)
- **Don't skip LSP when available** (use for accurate refactoring)

---

## Quick Reference: Tool Selection

| Task | Tool to Use | Not This |
|------|-------------|----------|
| Read file | `read({ path: "file" })` | `bash("cat file")` |
| Create file | `write({ path, content })` | `bash("echo > file")` |
| Edit file | `edit({ path, oldString, newString })` | `bash("sed ...")` |
| Apply patch | `patch({ path, patch })` | Manual editing |
| Search content | `grep({ pattern, path })` | `bash("grep text")` |
| Find files | `glob({ pattern })` | `bash("find ...")` |
| List directory | `list({ path })` | `bash("ls")` |
| Run Python | `bash({ command: "python script.py" })` | ✅ Correct use |
| Install package | `bash({ command: "pip install pkg" })` | ✅ Correct use |
| Git operations | `bash({ command: "git status" })` | ✅ Correct use |
| Invoke skill | `skill({ name: "skill-name" })` | Manual workflow |
| Ask user | `question({ question, options })` | Guessing |
| Fetch web | `webfetch({ url, prompt })` | `bash("curl")` |
| Code intelligence | `lsp({ action, path, position })` | Manual parsing |
| Task management | `todowrite({ todos })` | Manual tracking |

---

## Integration with AGENTS.md

This file (OPENCODE.md) provides **how** to use OpenCode tools effectively.
AGENTS.md provides **what** to do (architecture, workflows, patterns).

**Combined workflow**:
1. AGENTS.md tells you: "Check for existing tools in execution/"
2. OPENCODE.md tells you: "Use glob({ pattern: 'execution/*.py' }) to find them"

**Priority**:
- If conflict exists, OPENCODE.md (tool-specific) overrides AGENTS.md (universal)
- Example: AGENTS.md says "search for files", OPENCODE.md says "use glob tool, not bash find"

**Your mental model**:
```
AGENTS.md = Strategy (what to do, when to do it, why)
OPENCODE.md = Tactics (which tool to use, how to use it)
```

---

## Comparison with Claude Code

| Feature | OpenCode | Claude Code |
|---------|----------|-------------|
| **Architecture** | Client-server, TypeScript | SDK-based, Python |
| **Providers** | 75+ (multi-provider) | Anthropic only |
| **Deployment** | Self-hosted or cloud | Cloud (Anthropic) |
| **Tools** | 13 built-in + plugins | 10 built-in |
| **Configuration** | 6-tier hierarchical | Settings file |
| **Rules** | AGENTS.md (dynamic load) | System prompts |
| **Agents** | Primary + subagents + custom | Primary + subagents |
| **Commands** | Markdown templates | Hardcoded |
| **Skills** | SKILL.md + agent override | SKILL.md |
| **Plugins** | TypeScript/JavaScript | Not applicable |
| **LSP** | Built-in | Not documented |
| **Task Management** | todowrite/todoread | TodoWrite |
| **Open Source** | ✅ Yes | ❌ No |

**When to use OpenCode**:
- ✅ Need multi-provider support (local models, multiple APIs)
- ✅ Want self-hosted deployment (data privacy, air-gapped environments)
- ✅ Require custom tools/plugins (project-specific integrations)
- ✅ Need LSP integration (code intelligence)
- ✅ Want open-source flexibility

**When to use Claude Code**:
- ✅ Want managed service (no server setup)
- ✅ Anthropic-only workflow
- ✅ Prefer SDK-based approach

---

## Session Checklist

### At Session Start
```
□ Read AGENTS.md (universal instructions)
□ Read OPENCODE.md (this file - tool-specific)
□ Read CHECKPOINT.md (project state)
□ Read {project}_bugs.md (known issues)
□ glob({ pattern: "directives/*.md" }) (available SOPs)
□ glob({ pattern: "execution/*.py" }) (available tools)
□ glob({ pattern: ".opencode/skills/*/SKILL.md" }) (available skills)
□ Check provider configuration (config.json or env vars)
```

### During Execution
```
□ Use read/edit/write/patch for file operations
□ Use grep/glob/list for searching
□ Use bash only for Python scripts and system commands
□ Use lsp for code intelligence
□ Use skill for reusable workflows
□ Use question for user input
□ Apply Error Recovery Protocol on failures
□ Update directives with learnings
□ Log bugs in bugs.md
```

### At Session End
```
□ Update CHECKPOINT.md with progress
□ todowrite({ todos }) for remaining tasks
□ Commit changes (directives, scripts, state files)
□ Ensure .env and credentials not committed
```

---

**You are now optimized for OpenCode**. Execute tasks efficiently using the right tools at the right time, leveraging multi-provider support, custom agents, skills, and plugins.
