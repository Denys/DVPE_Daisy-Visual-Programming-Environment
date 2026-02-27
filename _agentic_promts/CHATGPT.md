# CHATGPT - Codex Specific Instructions

> Prerequisites: Read AGENTS.md first. This file adds ChatGPT/Codex tool tactics on top of universal instructions.

---

## Platform Identification

You are in ChatGPT/Codex mode when the environment provides:
- Shell execution via `shell_command`
- File patching via `apply_patch`
- Parallel tool calls via `multi_tool_use.parallel`
- Optional web access via `web.*`
- Optional MCP servers/resources

Context: terminal-first workflow, repository-local edits, deterministic execution through scripts in `execution/`.

---

## Tool Capabilities and Optimal Usage

### 1) Shell Commands (`shell_command`)

Use for:
- Listing files, searching code, running scripts, tests, builds
- Fast repository exploration and validation

Prefer:
- `rg --files` for file discovery
- `rg "pattern"` for code/content search
- Structured, repeatable command invocations

Avoid:
- Ad-hoc manual logic that should live in `execution/*.py`
- Destructive commands unless explicitly requested

Example:
```powershell
rg --files directives
rg -n "rate limit|retry|timeout" execution
python execution/build_firmware.py --target pod --test-mode
```

### 2) File Editing (`apply_patch`)

Use for:
- Single-file or tightly scoped edits with clear diffs
- Markdown and Python updates in directives/state/scripts

Prefer:
- Minimal, surgical patches
- Preserving existing style and conventions

Avoid:
- Large generated content where direct file generation is better
- Using Python for basic text edits when patching is enough

### 3) Parallel Calls (`multi_tool_use.parallel`)

Use for:
- Independent reads/searches
- Bulk context gathering (state files, directives, scripts)

Rule:
- Parallelize only when operations are independent and safe
- Keep write operations sequential and deliberate

### 4) Web Access (`web.search_query`, `web.open`)

Use when:
- Information may be time-sensitive (APIs, versions, docs, pricing, policies)
- A directive depends on current external behavior

Avoid:
- Unnecessary browsing for stable local repository facts

Pattern:
1. Confirm what is unknown/time-sensitive
2. Query primary sources first
3. Apply findings to directive/script updates
4. Cite source links in deliverables when relevant

### 5) MCP Resources (if configured)

Use when:
- Repository-attached context exists (schemas, docs, design metadata)
- MCP data can replace broad filesystem or web discovery

---

## ChatGPT/Codex Workflow Optimization

### Standard Task Execution Pattern

```text
1. Read session state if present:
   - project_definition.md
   - CHECKPOINT.md
   - completion_monitor.md
   - *_bugs.md

2. Locate relevant directive in directives/
   - If missing, ask before creating a new directive

3. Check execution/ for existing deterministic script
   - Reuse first, create new script only for recurring work

4. Execute script/commands with explicit inputs

5. If success:
   - Capture outputs
   - Update CHECKPOINT.md when milestone/state changed

6. If error:
   - Apply AGENTS.md Error Recovery Protocol
   - Fix -> retest -> document learnings
```

### Escalation and Permissions

When sandbox blocks required work:
1. Re-run with escalated permissions through `shell_command`
2. Provide a short justification question
3. Continue after approval; do not bypass controls

---

## Error Recovery with Codex Tools

### Quick Classification

- API error: `401/403/429/5xx`, quota/rate-limit signals
- Environment error: missing file/env/dependency
- Data error: validation/schema/format mismatch
- Logic error: incorrect output from successful run
- Performance error: timeout, memory, long-running process

### Fix Pattern

1. Read exact error and failing command/script
2. Find root cause (not just symptom)
3. Patch script or inputs with minimal safe change
4. Re-run same case
5. Update directive learning log and `*_bugs.md` for non-trivial fixes

---

## Directive and Script Management

### Directive Handling

- Read directives before execution
- Update directives with durable learnings:
  - rate limits
  - authentication constraints
  - performance ceilings
  - edge-case handling
- Do not overwrite directive intent without user approval

### Script Handling

- Keep business logic deterministic in `execution/*.py`
- Add/keep:
  - input validation
  - env validation
  - meaningful exit codes
  - `--test-mode` where appropriate
- Prefer explicit args over hidden defaults

---

## State File Discipline

Update these when materially changed:
- `CHECKPOINT.md` for milestone and status updates
- `completion_monitor.md` for plan progress
- `*_bugs.md` for non-obvious bug/fix/prevention entries

At session end:
- Ensure state files reflect latest project reality

---

## Best Practices Summary

DO:
- Use existing directives and scripts before creating new ones
- Use `rg` for fast discovery
- Use `apply_patch` for concise, reviewable edits
- Use web search for time-sensitive external facts
- Keep changes testable and easy to verify

DON'T:
- Skip error classification and blindly retry
- Mix exploratory scratch logic into production scripts
- Commit secrets or temp artifacts
- Use destructive git/file operations without explicit user request

---

## Quick Reference: Tool Selection

- Read/search repository: `shell_command` with `rg`, `Get-ChildItem`, `Get-Content`
- Edit files: `apply_patch`
- Gather context faster: `multi_tool_use.parallel`
- Time-sensitive external verification: `web.search_query` + primary sources
- Structured external context: MCP resources

---

## Session Checklist

At session start:
- Read AGENTS.md + this file
- Read existing state files (if present)
- Read relevant `*_bugs.md` before implementing

During execution:
- Prefer existing directives/scripts
- Keep fixes minimal and test immediately
- Update docs/state when learning is durable

At session end:
- Sync `CHECKPOINT.md` and monitoring docs if project state changed
- Confirm no secrets/temp artifacts are introduced

