# KILO — Kilo Code Specific Instructions

> **Prerequisites**: You must read AGENTS.md first. This file contains Kilo Code-specific optimizations that build on universal instructions.

---

## Platform Identification

**You are using Kilo Code if**:
- Has autonomy level settings (1-5 scale)
- Has checkpoint/approval system built-in
- GUI (VS Code integration) or CLI interface
- Agent behavior configuration options

**Context**: Behavior-driven development, checkpoint-based workflows, collaborative coding

---

## Autonomy Levels & Checkpoint Strategy

### Understanding Autonomy Levels

**Level 1: Fully Supervised**
- Ask before every action
- Present plan, wait for approval
- **Use when**: New to codebase, high-risk changes, learning user preferences

**Level 2: Action with Confirmation**
- Propose action with rationale
- Execute after quick confirmation
- **Use when**: Established patterns exist, moderate risk, building trust

**Level 3: Checkpoint-Based** (Recommended for Directive System)
- Execute tasks autonomously
- Checkpoint after major steps
- **Use when**: Clear directives exist, well-understood tasks, proven patterns

**Level 4: Autonomous with Review**
- Complete full tasks autonomously
- Present results for review at end
- **Use when**: Routine operations, established trust, low-risk changes

**Level 5: Fully Autonomous**
- Complete tasks without interruption
- Report results when done
- **Use when**: Automated workflows, high confidence, proven stability

### Recommended Settings for Directive System

```yaml
# Kilo Code Agent Configuration
autonomy_level: 3  # Checkpoint-based

checkpoint_triggers:
  - after_directive_execution
  - before_paid_api_call
  - on_error_classification
  - after_major_file_change
  - before_creating_new_directive

auto_approve:
  - read_operations
  - search_operations
  - updating_learning_logs
  - logging_bugs
```

---

## Tool Capabilities & Optimal Usage

### File Operations

**Reading Files**
```
✅ Use for: Reading directives, scripts, state files
Checkpoint: None needed (low-risk)

Example:
Read directive: read_file("directives/scrape_website.md")
Read checkpoint: read_file("CHECKPOINT.md")
```

**Editing Files**
```
✅ Use for: Updating directives, fixing scripts, modifying CHECKPOINT.md
Checkpoint: After significant edits (if autonomy < 4)

Example:
Update directive learning log:
edit_file(
  path="directives/scrape_website.md",
  old_content="## Learning Log\n\n(Empty)",
  new_content="## Learning Log\n\n- 2025-01-11: Rate limit is 10 req/min"
)
# Checkpoint: "Updated directive with API rate limit learning"
```

**Creating Files**
```
✅ Use for: Creating new directives, new scripts
Checkpoint: Before creation (if autonomy < 4)

Example:
# Checkpoint: "About to create new directive: data_processing.md"
write_file("directives/data_processing.md", content)
```

**Searching**
```
✅ Use for: Finding directives, searching for existing scripts
Checkpoint: None needed (low-risk)

Example:
Search directives: search_files(pattern="scrape", directory="directives")
```

### Command Execution

**Running Scripts**
```
✅ Use for: Executing Python scripts, running tests
Checkpoint: Before execution (if untested) or if paid API involved

Example:
# Checkpoint: "About to run scraping script on production URL"
execute("python execution/scrape_site.py --url https://example.com")
```

**Environment Setup**
```
✅ Use for: Installing packages, git operations
Checkpoint: Before bulk operations

Example:
# Checkpoint: "Installing 5 new dependencies"
execute("pip install -r requirements.txt")
```

---

## Kilo Code Workflow Optimization

### Standard Task Execution Pattern (Autonomy Level 3)

**Step 1: Check Session State** (No checkpoint)
```python
# Read state files if they exist
read_file("CHECKPOINT.md")  # Check project status
read_file("{project}_bugs.md")  # Check known issues
```

**Step 2: Find Relevant Directive** (No checkpoint)
```python
# Search for directive by keyword
search_files(pattern="scrape", directory="directives")

# Read the directive
read_file("directives/scrape_website.md")
```

**Step 3: Check for Existing Execution Tools** (No checkpoint)
```python
# Find existing scripts
list_files(pattern="execution/*scrape*.py")

# If found, read the script
read_file("execution/scrape_single_site.py")
```

**Step 4: Execute Script** (CHECKPOINT HERE)
```python
# Checkpoint: Present plan
checkpoint(
  action="execute_directive",
  details={
    "directive": "scrape_website.md",
    "script": "execution/scrape_single_site.py",
    "args": "--url https://example.com",
    "risk": "low (free API, test mode)",
    "expected_output": ".tmp/scraped_data.json"
  }
)

# After approval, execute
result = execute('python execution/scrape_single_site.py --url "https://example.com" --output .tmp/data.json')
```

**Step 5: Handle Results** (Checkpoint on error)
```python
# If successful (exit code 0):
# - Update CHECKPOINT.md (no checkpoint needed)
# - Continue to next task

# If error (exit code != 0):
# - CHECKPOINT: Present error classification and proposed fix
checkpoint(
  action="error_recovery",
  details={
    "error_type": "API Rate Limit (429)",
    "proposed_fix": "Wait 60s and retry with --delay flag",
    "will_update": ["directive edge cases", "bugs.md"]
  }
)
```

**Step 6: Update State** (No checkpoint for learning updates)
```python
# Update checkpoint with progress
edit_file(
  path="CHECKPOINT.md",
  old_content="| Scraping | ❌ Not Started |",
  new_content="| Scraping | ✅ Completed |"
)
```

---

## Checkpoint Best Practices

### When to Checkpoint

**ALWAYS checkpoint before**:
- ✅ Executing untested scripts
- ✅ Making paid API calls
- ✅ Creating new directives or scripts
- ✅ Modifying core architecture files
- ✅ Deleting files or data

**NO checkpoint needed for**:
- ❌ Reading files
- ❌ Searching/listing files
- ❌ Updating learning logs in directives
- ❌ Logging bugs in bugs.md
- ❌ Updating CHECKPOINT.md with progress

**CHECKPOINT on error when**:
- ⚠️ Error requires architectural decision
- ⚠️ Multiple fix approaches possible
- ⚠️ Paid API involved in retry
- ⚠️ Security concern detected

### Checkpoint Message Format

```python
checkpoint(
  action="[action_type]",  # execute_directive, create_file, error_recovery, etc.
  details={
    "what": "[What you're about to do]",
    "why": "[Rationale]",
    "risk": "[high/medium/low + explanation]",
    "expected_outcome": "[What should happen]",
    "rollback_plan": "[How to undo if needed]"  # For risky operations
  }
)
```

**Example: Before executing untested script**
```python
checkpoint(
  action="execute_new_script",
  details={
    "what": "Run data_processor.py on production data",
    "why": "Per directive: process_customer_data.md",
    "risk": "medium - modifies production database",
    "expected_outcome": "50 customer records updated",
    "rollback_plan": "Database backup taken, can restore from .tmp/db_backup.sql"
  }
)
```

---

## Error Recovery with Kilo Code

### Error Classification with Checkpoints

**Exit Code 1: Invalid Arguments** (Auto-fix, no checkpoint)
```python
# Fix approach: Validate inputs before calling script
# 1. Read directive to check required arguments
read_file("directives/task.md")
# 2. Fix argument format
# 3. Retry command with corrected arguments
# No checkpoint: Low risk, clear fix
```

**Exit Code 2: Missing Environment Variable** (Checkpoint before asking user)
```python
# Fix approach: Check .env and ask user
# 1. Read the script to see what's required
read_file("execution/script.py")  # Look in validate_environment()

# 2. Checkpoint before asking user
checkpoint(
  action="request_environment_variable",
  details={
    "what": "Need API_KEY for Stripe integration",
    "why": "Required by execution/payment_processor.py",
    "security": "Will store in .env (gitignored)"
  }
)

# 3. After user provides, update .env
edit_file(path=".env", old_content="", new_content="API_KEY=value\n")
# 4. Retry
```

**Exit Code 3: API Error** (Checkpoint for paid APIs)
```python
# Fix approach: Determine if paid API, checkpoint before retry
# 1. Read error message
# 2. Classify: rate limit, auth failure, or quota

# 3. If paid API:
checkpoint(
  action="retry_paid_api",
  details={
    "error": "HTTP 429 - Rate Limit Exceeded",
    "api": "OpenAI GPT-4 (paid)",
    "cost": "~$0.03 per retry",
    "proposed_fix": "Wait 60s and retry once",
    "alternative": "Switch to GPT-3.5 (cheaper)"
  }
)

# 4. If free API: auto-retry with backoff (no checkpoint)
```

**Exit Code 4: Data Processing Error** (Checkpoint if data loss risk)
```python
# Fix approach: Evaluate data loss risk
# 1. Read script to understand data flow
read_file("execution/script.py")

# 2. If risk of data loss or corruption:
checkpoint(
  action="fix_data_processing",
  details={
    "error": "ValueError: Invalid JSON format",
    "affected_data": ".tmp/customer_data.json (500 records)",
    "proposed_fix": "Add validation, skip malformed records",
    "data_safety": "Will create backup before re-running"
  }
)

# 3. Edit script, test, log bug
```

**Exit Code 5: File I/O Error** (Auto-fix, no checkpoint)
```python
# Fix approach: Create missing directories, fix permissions
# Low risk, clear fix - no checkpoint needed
execute("mkdir -p .tmp/")
# Retry script
```

---

## Directive Management with Kilo Code

### Reading Directives (No checkpoints)
```python
# List all available directives
list_files(directory="directives", pattern="*.md")

# Search for directive by keyword
search_files(pattern="scrape", directory="directives")

# Read specific directive
read_file("directives/scrape_website.md")
```

### Updating Directives (Checkpoint for new sections, not learning logs)
```python
# Adding to Learning Log (no checkpoint - low risk)
edit_file(
  path="directives/scrape_website.md",
  old_content="## Learning Log",
  new_content="## Learning Log\n\n- 2025-01-11: Switched to BeautifulSoup - 3x faster"
)

# Adding new Edge Case section (checkpoint - medium risk)
checkpoint(
  action="update_directive_edge_cases",
  details={
    "directive": "scrape_website.md",
    "addition": "Rate limiting section with --delay flag usage",
    "impact": "Changes how all future scraping tasks execute"
  }
)
edit_file(...)
```

### Creating New Directives (Always checkpoint)
```python
# Checkpoint before creating directive
checkpoint(
  action="create_directive",
  details={
    "name": "process_payments.md",
    "purpose": "Handle Stripe payment processing",
    "execution_tool": "execution/payment_processor.py (to be created)",
    "dependencies": "Requires STRIPE_SECRET_KEY in .env"
  }
)

# Create directive
write_file("directives/process_payments.md", content)
```

---

## Script Management with Kilo Code

### Creating Execution Scripts (Always checkpoint)
```python
# Checkpoint before creating script
checkpoint(
  action="create_execution_script",
  details={
    "script": "execution/payment_processor.py",
    "purpose": "Process Stripe payments per directive",
    "risk": "high - handles financial transactions",
    "testing_plan": "Will test with Stripe test mode first",
    "template_used": "AGENTS.md standard template"
  }
)

# Create script
write_file("execution/payment_processor.py", script_content)

# Make executable
execute("chmod +x execution/payment_processor.py")
```

### Testing Scripts (Checkpoint for production data)
```python
# Testing with test data (no checkpoint)
result = execute("python execution/my_script.py --test-mode --arg test_value")

# Testing with production data (checkpoint)
checkpoint(
  action="test_with_production_data",
  details={
    "script": "execution/my_script.py",
    "data": "Production customer database (5000 records)",
    "backup": "Created at .tmp/db_backup_2025-01-11.sql",
    "safety": "Read-only test, no writes"
  }
)
result = execute("python execution/my_script.py --readonly --limit 10")
```

### Updating Scripts (Checkpoint for logic changes, not style)
```python
# Style fix (no checkpoint)
edit_file(
  path="execution/my_script.py",
  old_content="    if not arg1:\n        return False",
  new_content="    if not arg1 or len(arg1) == 0:\n        logger.error('arg1 cannot be empty')\n        return False"
)

# Logic change (checkpoint)
checkpoint(
  action="modify_script_logic",
  details={
    "script": "execution/payment_processor.py",
    "change": "Add refund handling logic",
    "impact": "Changes payment flow for all transactions",
    "testing": "Will run with --test-mode first"
  }
)
edit_file(...)
```

---

## State File Management with Kilo Code

### Checkpoint Updates (No checkpoints - routine)
```python
# Read current checkpoint
checkpoint_content = read_file("CHECKPOINT.md")

# Update component status
edit_file(
  path="CHECKPOINT.md",
  old_content="| Web Scraping | 🔄 In Progress |",
  new_content="| Web Scraping | ✅ Completed |"
)

# Add new feature to implemented list
edit_file(
  path="CHECKPOINT.md",
  old_content="## B. Implemented Features\n\n(None yet)",
  new_content="## B. Implemented Features\n\n- Web scraping with rate limiting (2025-01-11)"
)
```

### Bug Log Updates (No checkpoints - routine)
```python
# Read current bug log
bugs = read_file("{project}_bugs.md")

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

edit_file(
  path="{project}_bugs.md",
  old_content="## Bug Entries\n\n(No bugs recorded yet)",
  new_content=f"## Bug Entries\n{new_bug}"
)
```

---

## Collaborative Workflow Patterns

### GUI Integration (VS Code + Kilo Code)

**Advantages**:
- Visual file tree for navigation
- Inline error highlighting
- Git integration with visual diff
- Terminal integration for command execution

**Best Practices**:
```
✅ Use visual diff for reviewing directive changes
✅ Leverage terminal for running Python scripts
✅ Use sidebar for quick file navigation
✅ Utilize git panel for commit staging
```

### Multi-File Changes with Checkpoints

**Pattern**: Batch related changes, checkpoint once
```python
# Checkpoint: Present complete plan
checkpoint(
  action="multi_file_refactor",
  details={
    "goal": "Add authentication to scraping system",
    "files_to_change": [
      "directives/scrape_website.md (add auth section)",
      "execution/scrape_single_site.py (add --auth-token flag)",
      ".env.example (add AUTH_TOKEN variable)"
    ],
    "testing": "Will test with --test-mode after changes"
  }
)

# Execute all changes
edit_file("directives/scrape_website.md", ...)
edit_file("execution/scrape_single_site.py", ...)
edit_file(".env.example", ...)

# Test and report results
```

---

## Best Practices Summary

### DO ✅
- **Set autonomy level 3 for directive system** (checkpoint-based)
- **Checkpoint before untested scripts, paid APIs, new files**
- **NO checkpoint for reading, searching, learning log updates**
- **Batch related changes into single checkpoint**
- **Provide clear rollback plan for risky operations**
- **Use --test-mode before production execution**
- **Leverage GUI features** (visual diff, git integration)
- **Update CHECKPOINT.md at end of significant work**

### DON'T ❌
- **Don't checkpoint routine operations** (reading, logging bugs)
- **Don't execute paid API calls without checkpoint**
- **Don't create scripts without presenting plan**
- **Don't skip testing with production data checkpoint**
- **Don't modify core logic without approval**
- **Don't forget rollback plan for database operations**

---

## Quick Reference: Checkpoint Decision Matrix

| Operation | Autonomy Level 1-2 | Autonomy Level 3 | Autonomy Level 4-5 |
|-----------|-------------------|------------------|-------------------|
| Read files | Checkpoint | No checkpoint | No checkpoint |
| Update learning logs | Checkpoint | No checkpoint | No checkpoint |
| Run tested script | Checkpoint | No checkpoint | No checkpoint |
| Run untested script | Checkpoint | **Checkpoint** | No checkpoint |
| Create new file | Checkpoint | **Checkpoint** | Checkpoint (review at end) |
| Paid API call | Checkpoint | **Checkpoint** | **Checkpoint** |
| Modify production data | Checkpoint | **Checkpoint** | **Checkpoint** |
| Log bugs | Checkpoint | No checkpoint | No checkpoint |

---

## Integration with AGENTS.md

This file (KILO.md) provides **how** to use Kilo Code with checkpoints effectively.
AGENTS.md provides **what** to do (architecture, workflows, patterns).

**Combined workflow**:
1. AGENTS.md tells you: "Execute directive with error recovery"
2. KILO.md tells you: "Checkpoint before execution, no checkpoint for error logging"

**Priority**:
- If conflict exists, KILO.md (tool-specific) overrides AGENTS.md (universal)
- Example: AGENTS.md says "update directive", KILO.md says "checkpoint if new section, not if learning log"

**Your mental model**:
```
AGENTS.md = Strategy (what to do, when to do it, why)
KILO.md = Tactics (when to checkpoint, autonomy level, collaboration)
```

---

## Session Checklist

### At Session Start
```
□ Read AGENTS.md (universal instructions)
□ Read KILO.md (this file - tool-specific)
□ Set autonomy level (recommend: 3 for directive system)
□ Read CHECKPOINT.md (project state)
□ Read {project}_bugs.md (known issues)
□ List directives/*.md (available SOPs)
□ List execution/*.py (available tools)
```

### During Execution
```
□ Checkpoint before untested scripts
□ Checkpoint before paid API calls
□ Checkpoint before creating new files
□ NO checkpoint for reading, searching, logging
□ Provide clear rollback plans for risky ops
□ Batch related changes into single checkpoint
```

### At Session End
```
□ Update CHECKPOINT.md with progress
□ Commit changes via Git panel (GUI) or command
□ Ensure .env and credentials not committed
□ Review checkpoint history for lessons learned
```

---

**You are now optimized for Kilo Code**. Execute tasks with intelligent checkpointing that balances autonomy with safety.
