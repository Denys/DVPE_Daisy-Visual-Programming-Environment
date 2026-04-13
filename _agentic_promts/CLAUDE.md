# CLAUDE — Claude Code Specific Instructions

> **Prerequisites**: You must read AGENTS.md first. This file contains Claude Code-specific optimizations that build on universal instructions.

---

## Platform Identification

**You are using Claude Code if you have access to these tools**:
- `Read` - Read files with line numbers
- `Write` - Create new files
- `Edit` - Modify existing files via string replacement
- `Bash` - Execute shell commands
- `Grep` - Search file contents with regex
- `Glob` - Find files by pattern
- `Task` - Launch specialized sub-agents

**Context**: CLI environment, skill-based system, powerful file manipulation

---

## Tool Capabilities & Optimal Usage

### File Operations (Prefer These Over Bash)

**Read Tool** - Reading files
```
✅ Use for: Reading directives, scripts, state files
❌ Avoid: cat, head, tail commands in Bash

Example:
Read directive: Read("directives/scrape_website.md")
Read checkpoint: Read("CHECKPOINT.md")
```

**Edit Tool** - Modifying existing files
```
✅ Use for: Updating directives, fixing scripts, modifying CHECKPOINT.md
❌ Avoid: sed, awk, or Bash heredocs

Example:
Update directive learning log:
Edit(
  file_path="directives/scrape_website.md",
  old_string="## Learning Log\n\n(Empty)",
  new_string="## Learning Log\n\n- 2025-01-11: Rate limit is 10 req/min"
)
```

**Write Tool** - Creating new files
```
✅ Use for: Creating new directives, new scripts, initializing state files
❌ Avoid: echo > file or cat << EOF in Bash

Example:
Create new directive: Write("directives/new_task.md", content)
```

**Grep Tool** - Searching file contents
```
✅ Use for: Finding directives by keyword, searching for existing scripts
❌ Avoid: grep or rg commands in Bash

Example:
Find scraping directives:
Grep(pattern="scrape", path="directives", output_mode="files_with_matches")

Find API error handling:
Grep(pattern="API.*error", path="execution", glob="*.py", output_mode="content")
```

**Glob Tool** - Finding files by pattern
```
✅ Use for: Listing directives, finding execution scripts
❌ Avoid: find or ls commands in Bash

Example:
List all directives: Glob(pattern="directives/*.md")
Find scraping scripts: Glob(pattern="execution/*scrape*.py")
```

### Bash Tool - For Execution Only

**Use Bash ONLY for**:
```
✅ Running Python scripts: python execution/script.py --arg value
✅ Installing packages: pip install -r requirements.txt
✅ Git operations: git status, git add, git commit
✅ Running tests: pytest tests/
✅ Environment checks: python --version, which python
```

**DO NOT use Bash for**:
```
❌ Reading files (use Read tool)
❌ Searching content (use Grep tool)
❌ Finding files (use Glob tool)
❌ Editing files (use Edit tool)
❌ Creating files (use Write tool)
```

### Task Tool - Launching Sub-Agents

**Use for complex multi-step operations**:
```
✅ Exploring codebase: Task(subagent_type="Explore", prompt="Find all API integrations")
✅ Planning features: Task(subagent_type="Plan", prompt="Design OAuth implementation")
✅ Research: Task(subagent_type="general-purpose", prompt="Research best practices for rate limiting")
```

---

## Claude Code Workflow Optimization

### Standard Task Execution Pattern

**Step 1: Check Session State**
```python
# Read state files if they exist
Read("CHECKPOINT.md")  # Check project status
Read("{project}_bugs.md")  # Check known issues
```

**Step 2: Find Relevant Directive**
```python
# Search for directive by keyword
Grep(pattern="scrape|website", path="directives", output_mode="files_with_matches")

# Read the directive
Read("directives/scrape_website.md")
```

**Step 3: Check for Existing Execution Tools**
```python
# Find existing scripts
Glob(pattern="execution/*scrape*.py")

# If found, read the script
Read("execution/scrape_single_site.py")
```

**Step 4: Execute with Bash**
```python
# Run the script with proper arguments
Bash(
  command='python execution/scrape_single_site.py --url "https://example.com" --output .tmp/data.json',
  description="Execute website scraping script"
)
```

**Step 5: Handle Results**
```python
# If successful (exit code 0):
# - Update CHECKPOINT.md with results
# - Continue to next task

# If error (exit code != 0):
# - Apply Error Recovery Protocol from AGENTS.md
# - Classify error type
# - Fix and retest
# - Update directive and bugs.md
```

**Step 6: Update State**
```python
# Update checkpoint with progress
Edit(
  file_path="CHECKPOINT.md",
  old_string="| Scraping | ❌ Not Started |",
  new_string="| Scraping | ✅ Completed |"
)
```

---

## Error Recovery with Claude Code Tools

### Error Classification Quick Reference

When a Bash command exits with non-zero code:

**Exit Code 1: Invalid Arguments**
```python
# Fix approach: Validate inputs before calling script
# 1. Read directive to check required arguments
Read("directives/task.md")
# 2. Fix argument format
# 3. Retry Bash command with corrected arguments
```

**Exit Code 2: Missing Environment Variable**
```python
# Fix approach: Check .env and add missing variables
# 1. Read the script to see what's required
Read("execution/script.py")  # Look in validate_environment()
# 2. Ask user for the value
# 3. Update .env (if user provides value)
Edit(file_path=".env", old_string="", new_string="API_KEY=value\n")
# 4. Retry
```

**Exit Code 3: API Error**
```python
# Fix approach: Check if paid API, handle rate limits
# 1. Read error message from Bash output
# 2. If "rate limit" or "429":
#    - Free API: Wait 60s, retry once
#    - Paid API: Ask user before retry
# 3. If "401" or "403": Check credentials in .env
# 4. Update directive with API limit info
```

**Exit Code 4: Data Processing Error**
```python
# Fix approach: Add validation, update script
# 1. Read script to understand data flow
Read("execution/script.py")
# 2. Edit script to add validation
Edit(file_path="execution/script.py", old_string=old_logic, new_string=new_logic)
# 3. Test with Bash
# 4. Log bug in bugs.md
```

**Exit Code 5: File I/O Error**
```python
# Fix approach: Check file paths, permissions
# 1. Use Bash to check if directory exists
Bash(command="ls -la .tmp/", description="Check temp directory")
# 2. Create missing directories
Bash(command="mkdir -p .tmp/", description="Create temp directory")
# 3. Retry script
```

---

## Directive Management with Claude Code

### Reading Directives
```python
# List all available directives
directives = Glob(pattern="directives/*.md")

# Search for directive by keyword
Grep(pattern="scrape", path="directives", output_mode="files_with_matches")

# Read specific directive
Read("directives/scrape_website.md")
```

### Updating Directives (Learning Loop)
```python
# When you discover API rate limit:
Edit(
  file_path="directives/scrape_website.md",
  old_string="## Edge Cases\n\n(None documented)",
  new_string="## Edge Cases\n\n- **Rate Limiting**: API allows 10 requests/minute. Use --delay 6 flag."
)

# When you find better approach:
Edit(
  file_path="directives/scrape_website.md",
  old_string="## Learning Log",
  new_string="## Learning Log\n\n- 2025-01-11: Switched to BeautifulSoup from regex - 3x faster"
)
```

### Creating New Directives
```python
# Use the template from AGENTS.md
template = Read("AGENTS.md")  # Get directive template section

# Fill in template with task-specific details
new_directive_content = """
# Task: New Task Name

## Purpose
[What this does]

## Inputs Required
[List inputs]

## Execution Tool
**Script**: execution/new_script.py
**Command**: python execution/new_script.py --arg value

## Expected Outputs
[Success and failure modes]

## Validation
[Test command]

## Edge Cases
[Known edge cases]

## Dependencies
[Env vars, packages, services]

## Learning Log
(Empty - will update as we learn)
"""

Write("directives/new_task.md", new_directive_content)
```

---

## Script Management with Claude Code

### Creating Execution Scripts
```python
# Use template from AGENTS.md
template_content = Read("AGENTS.md")  # Extract script template

# Customize for specific task
new_script = """
#!/usr/bin/env python3
\"\"\"
Task-specific script

Usage:
    python execution/my_script.py --arg value
\"\"\"

import argparse
import logging
import sys

# [Insert standard template structure here]
# - validate_environment()
# - validate_inputs()
# - main()
# - if __name__ == "__main__"
"""

Write("execution/my_script.py", new_script)

# Make executable (Unix systems)
Bash(command="chmod +x execution/my_script.py", description="Make script executable")
```

### Testing Scripts
```python
# Use --test-mode flag for dry-run
Bash(
  command="python execution/my_script.py --test-mode --arg value",
  description="Test script in dry-run mode"
)

# Validate exit code is 0
# If not, read error output and apply Error Recovery Protocol
```

### Updating Scripts (Self-Annealing)
```python
# When fixing a bug:
# 1. Read the script
script_content = Read("execution/my_script.py")

# 2. Identify the issue (e.g., missing validation)
# 3. Edit with specific fix
Edit(
  file_path="execution/my_script.py",
  old_string="    if not arg1:\n        return False",
  new_string="    if not arg1 or len(arg1) == 0:\n        logger.error('arg1 cannot be empty')\n        return False"
)

# 4. Retest
Bash(command="python execution/my_script.py --arg value", description="Test fix")

# 5. Log bug if non-obvious
```

---

## State File Management with Claude Code

### Checkpoint Updates
```python
# Read current checkpoint
checkpoint = Read("CHECKPOINT.md")

# Update component status
Edit(
  file_path="CHECKPOINT.md",
  old_string="| Web Scraping | 🔄 In Progress |",
  new_string="| Web Scraping | ✅ Completed |"
)

# Add new feature to implemented list
Edit(
  file_path="CHECKPOINT.md",
  old_string="## B. Implemented Features\n\n(None yet)",
  new_string="## B. Implemented Features\n\n- Web scraping with rate limiting (2025-01-11)"
)
```

### Bug Log Updates
```python
# Read current bug log
bugs = Read("{project}_bugs.md")

# Add new bug entry
new_bug = """

### Bug 1: API Rate Limit Not Handled
- **Date**: 2025-01-11
- **Symptom**: Script crashed with HTTP 429 error
- **Root Cause**: No retry logic for rate limiting
- **Fix**: Added exponential backoff in execution/scrape.py:45
- **Prevention**: Always check API docs for rate limits before implementation
- **Reference**: execution/scrape.py:45-60
"""

Edit(
  file_path="{project}_bugs.md",
  old_string="## Bug Entries\n\n(No bugs recorded yet)",
  new_string=f"## Bug Entries\n{new_bug}"
)
```

---

## Advanced Patterns

### Multi-Step Directive Execution
```python
# For complex tasks involving multiple directives:

# 1. List relevant directives
Grep(pattern="data.*process", path="directives", output_mode="files_with_matches")

# 2. Read each in sequence
directive1 = Read("directives/fetch_data.md")
directive2 = Read("directives/process_data.md")
directive3 = Read("directives/upload_results.md")

# 3. Execute in order, checking for errors at each step
result1 = Bash(command="python execution/fetch_data.py --source api")
# Check result1 exit code before proceeding

result2 = Bash(command="python execution/process_data.py --input .tmp/raw_data.json")
# Check result2 exit code before proceeding

result3 = Bash(command="python execution/upload_results.py --file .tmp/processed_data.json")

# 4. Update checkpoint with pipeline status
```

### Parallel Operations (When Safe)
```python
# For independent operations that don't depend on each other:

# Launch multiple Bash commands in sequence (Claude Code doesn't do true parallel)
# But minimize wait time by batching operations

# Example: Installing multiple packages
Bash(command="pip install requests beautifulsoup4 playwright", description="Install dependencies")

# Example: Multiple independent data fetches (if no rate limits)
# Note: Do this sequentially but efficiently
```

### Using Task Tool for Complex Research
```python
# When you need to understand codebase before proceeding:
Task(
  subagent_type="Explore",
  prompt="Find all places where we make API calls to external services. I need to understand the current error handling pattern.",
  description="Research API patterns"
)

# When planning a new feature:
Task(
  subagent_type="Plan",
  prompt="Design an authentication system for the web scraping tool. Should support API keys and OAuth. Consider security, storage, and rotation.",
  description="Plan auth system"
)
```

---

## Best Practices Summary

### DO ✅
- **Always read CHECKPOINT.md and bugs.md at session start**
- **Use Read/Edit/Write tools for file operations** (not Bash)
- **Use Grep/Glob for searching** (not Bash grep/find)
- **Use Bash only for executing Python scripts and system commands**
- **Check for existing directives before creating new ones**
- **Update directives with learnings** (API limits, edge cases)
- **Log non-obvious bugs in bugs.md**
- **Test scripts with --test-mode before production use**
- **Validate environment variables before execution**
- **Update CHECKPOINT.md at end of significant work**

### DON'T ❌
- **Don't use cat/head/tail in Bash** (use Read tool)
- **Don't use echo > file in Bash** (use Write tool)
- **Don't use sed/awk in Bash** (use Edit tool)
- **Don't use grep/find in Bash** (use Grep/Glob tools)
- **Don't retry paid API calls without asking user**
- **Don't create new scripts if existing ones work**
- **Don't skip error classification** (apply Error Recovery Protocol)
- **Don't forget to update state files**
- **Don't commit .env or credentials files**

---

## Quick Reference: Tool Selection

| Task | Tool to Use | Not This |
|------|-------------|----------|
| Read file | `Read("path/file")` | `Bash("cat file")` |
| Create file | `Write("path/file", content)` | `Bash("echo 'text' > file")` |
| Edit file | `Edit("file", old, new)` | `Bash("sed ...")` |
| Search content | `Grep(pattern="text", path="dir")` | `Bash("grep text")` |
| Find files | `Glob(pattern="*.py")` | `Bash("find . -name '*.py'")` |
| Run Python | `Bash("python script.py")` | ✅ Correct use |
| Install package | `Bash("pip install pkg")` | ✅ Correct use |
| Git operations | `Bash("git status")` | ✅ Correct use |
| Explore codebase | `Task(subagent_type="Explore")` | Multiple Grep/Read |
| Plan feature | `Task(subagent_type="Plan")` | Manual planning |

---

## Integration with AGENTS.md

This file (CLAUDE.md) provides **how** to use Claude Code tools effectively.
AGENTS.md provides **what** to do (architecture, workflows, patterns).

**Combined workflow**:
1. AGENTS.md tells you: "Check for existing tools in execution/"
2. CLAUDE.md tells you: "Use Glob(pattern='execution/*.py') to find them"

**Priority**:
- If conflict exists, CLAUDE.md (tool-specific) overrides AGENTS.md (universal)
- Example: AGENTS.md says "search for files", CLAUDE.md says "use Glob tool, not Bash find"

**Your mental model**:
```
AGENTS.md = Strategy (what to do, when to do it, why)
CLAUDE.md = Tactics (which tool to use, how to use it)
```

---

## Session Checklist

### At Session Start
```
□ Read AGENTS.md (universal instructions)
□ Read CLAUDE.md (this file - tool-specific)
□ Read CHECKPOINT.md (project state)
□ Read {project}_bugs.md (known issues)
□ Glob directives/*.md (available SOPs)
□ Glob execution/*.py (available tools)
```

### During Execution
```
□ Use Read/Edit/Write for file operations
□ Use Grep/Glob for searching
□ Use Bash only for Python scripts and system commands
□ Apply Error Recovery Protocol on failures
□ Update directives with learnings
□ Log bugs in bugs.md
```

### At Session End
```
□ Update CHECKPOINT.md with progress
□ Commit changes (directives, scripts, state files)
□ Ensure .env and credentials not committed
```

---

**You are now optimized for Claude Code**. Execute tasks efficiently using the right tools at the right time.
