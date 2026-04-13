# Platform Configuration Reference

Tool mappings and configurations for all supported agentic environments.

---

## Environment Capability Matrix

| Capability | OpenCode | Claude Code | Kilo Code | Cursor | Windsurf | Gemini CLI | Aider | Continue | Cline |
|------------|----------|-------------|-----------|--------|----------|------------|-------|----------|-------|
| **File Read** | read | Read | Read | read | read | read_file | /read | read | read_file |
| **File Write** | write | Write | Write | write | write | write_file | /write | write | write_to_file |
| **File Edit** | edit | Edit | Edit | edit | edit | edit_file | /edit | edit | apply_diff |
| **Bash/Shell** | bash | Bash | Bash | terminal | terminal | run_shell | /run | terminal | execute_command |
| **Glob/Find** | glob | Glob | Glob | glob | glob | find_files | /ls | glob | list_files |
| **Grep/Search** | grep | Grep | Grep | search | search | search | /search | search | search_files |
| **Web Search** | - | WebSearch | - | - | - | google_search | - | - | - |
| **Web Fetch** | webfetch | WebFetch | - | - | - | fetch_url | - | - | - |
| **Sub-Agents** | task | Task | Task | - | - | - | - | - | - |
| **MCP Support** | Native | Native | Native | Yes | Yes | - | - | Yes | Yes |
| **Git Integration** | bash | Bash | Bash | git | git | git_* | /git | git | - |
| **LSP/Symbols** | - | - | Yes | Yes | Yes | - | - | Yes | - |
| **Diagnostics** | bash | Bash | Yes | Yes | Yes | - | - | Yes | - |

---

## Platform-Specific Configurations

### OpenCode

```yaml
# .opencode/skill/[agent]/config.yaml
platform: opencode
tools:
  file_read: read
  file_write: write
  file_edit: edit
  shell: bash
  find: glob
  search: grep
  web: webfetch
  spawn: task
state:
  checkpoint: CHECKPOINT.md
  memory_dir: .agent/memory/
features:
  mcp: true
  sub_agents: true
  web_fetch: true
  web_search: false
```

### Claude Code

```yaml
platform: claude-code
tools:
  file_read: Read
  file_write: Write
  file_edit: Edit
  shell: Bash
  find: Glob
  search: Grep
  web: WebFetch
  spawn: Task
state:
  checkpoint: CHECKPOINT.md
  memory_dir: .agent/memory/
features:
  mcp: true
  sub_agents: true
  web_fetch: true
  web_search: true
```

### Kilo Code

```yaml
platform: kilo-code
tools:
  file_read: Read
  file_write: Write
  file_edit: Edit
  shell: Bash
  find: Glob
  search: Grep
  web: null
  spawn: Task
state:
  checkpoint: .agent/checkpoint.json
  memory_dir: .agent/memory/
features:
  mcp: true
  sub_agents: true
  lsp: true
  diagnostics: true
  modes: [code, architect, ask]
```

### Cursor

```yaml
platform: cursor
tools:
  file_read: read
  file_write: write
  file_edit: edit
  shell: terminal
  find: glob
  search: search
  web: null
  spawn: null
state:
  checkpoint: .agent/checkpoint.json
  memory_dir: .agent/memory/
features:
  mcp: true
  lsp: true
  diagnostics: true
  composer: true
```

### Windsurf

```yaml
platform: windsurf
tools:
  file_read: read
  file_write: write
  file_edit: edit
  shell: terminal
  find: glob
  search: search
  web: null
  spawn: null
state:
  checkpoint: .agent/checkpoint.json
  memory_dir: .agent/memory/
features:
  mcp: true
  lsp: true
  diagnostics: true
  cascade: true
```

### Gemini CLI

```yaml
platform: gemini-cli
tools:
  file_read: read_file
  file_write: write_file
  file_edit: edit_file
  shell: run_shell
  find: find_files
  search: search
  web: fetch_url
  spawn: null
state:
  checkpoint: .agent/checkpoint.json
  memory_dir: .agent/memory/
features:
  web_fetch: true
  web_search: true  # google_search
  sub_agents: false
```

### Aider

```yaml
platform: aider
tools:
  file_read: /read
  file_write: /write
  file_edit: /edit
  shell: /run
  find: /ls
  search: /search
  web: null
  spawn: null
state:
  checkpoint: .agent/checkpoint.md
  memory_dir: .agent/memory/
features:
  git_integration: native
  voice: true
  images: true
```

### Continue

```yaml
platform: continue
tools:
  file_read: read
  file_write: write
  file_edit: edit
  shell: terminal
  find: glob
  search: search
  web: null
  spawn: null
state:
  checkpoint: .agent/checkpoint.json
  memory_dir: .agent/memory/
features:
  mcp: true
  lsp: true
  context_providers: true
```

### Cline

```yaml
platform: cline
tools:
  file_read: read_file
  file_write: write_to_file
  file_edit: apply_diff
  shell: execute_command
  find: list_files
  search: search_files
  web: null
  spawn: null
state:
  checkpoint: .agent/checkpoint.json
  memory_dir: .agent/memory/
features:
  mcp: true
  autonomous_mode: true
  browser_use: optional
```

---

## Universal Tool Abstraction

Use these variables in agent specifications for platform-agnostic references:

```yaml
# Core File Operations
${FILE_READ}:      # Read file contents
${FILE_WRITE}:     # Create new files
${FILE_EDIT}:      # Modify existing files
${FILE_FIND}:      # Find files by pattern
${FILE_SEARCH}:    # Search file contents

# Execution
${SHELL_EXEC}:     # Execute shell commands
${CODE_RUN}:       # Run code (language-specific)

# Navigation
${WORKSPACE_ROOT}: # Project root directory
${CURRENT_FILE}:   # Currently active file (IDE only)

# External
${WEB_SEARCH}:     # Web search (if available)
${WEB_FETCH}:      # URL fetch (if available)
${MCP_CALL}:       # MCP tool invocation

# State Management
${STATE_FILE}:     # Primary state persistence file
${CHECKPOINT}:     # Progress checkpoint file
${MEMORY_DIR}:     # Directory for persistent memory

# Sub-Agents
${SPAWN_AGENT}:    # Launch sub-agent (if available)
${AGENT_TYPE}:     # Sub-agent specialization
```

---

## Fallback Strategies

When a tool isn't available, use these fallbacks:

| Primary Tool | Fallback 1 | Fallback 2 |
|--------------|------------|------------|
| `${FILE_EDIT}` | `${FILE_WRITE}` (full replace) | Manual diff instructions |
| `${FILE_FIND}` | `${SHELL_EXEC}` find | Manual directory listing |
| `${FILE_SEARCH}` | `${SHELL_EXEC}` grep | Read + manual search |
| `${WEB_FETCH}` | `${SHELL_EXEC}` curl | Request user to fetch |
| `${WEB_SEARCH}` | `${WEB_FETCH}` known URL | Ask user for info |
| `${SPAWN_AGENT}` | Sequential inline | Break into phases |

---

## Environment Detection

Runtime detection pattern:

```markdown
ON INITIALIZATION:
  1. CHECK for tool availability:
     - TRY ${FILE_READ} on known file
     - TRY ${SHELL_EXEC} echo test
     - TRY ${FILE_FIND} for *.md
  
  2. IDENTIFY platform by tool signatures:
     - Read/Write/Edit/Bash/Glob/Grep → Claude Code or OpenCode
     - read/write/edit/terminal → Cursor or Windsurf or Kilo
     - read_file/write_file/run_shell → Gemini CLI
     - /read, /write, /edit → Aider
  
  3. SET tool mappings based on platform
  
  4. VERIFY state directory exists:
     - CREATE ${MEMORY_DIR} if missing
     - CHECK ${CHECKPOINT} access
```

---

## Compatibility Tiers

### Tier 1: Required Support (Production)
- OpenCode
- Claude Code
- Cursor
- Kilo Code

### Tier 2: Recommended Support
- Windsurf
- Continue
- Gemini CLI

### Tier 3: Nice to Have
- Aider
- Cline

Design for Tier 1 first, then extend to Tier 2/3 with graceful degradation.
