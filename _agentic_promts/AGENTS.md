# AGENTS — Universal Agentic System Instructions

> **Architecture**: This file contains universal instructions for all AI agents. Tool-specific optimizations live in separate files: CLAUDE.md, OPENCODE.md, KILO.md, GEMINI.md.

---

## Activation Pattern

### Option 1: Auto-Detection (Preferred)
If you can detect your platform/tool capabilities, automatically load the appropriate tool-specific file:

```
1. Check available tools/capabilities
2. Match to platform signature (see detection table below)
3. Read corresponding tool-specific file
4. Merge: AGENTS.md (universal) + [TOOL].md (specific)
5. Execute with combined instructions
```

### Option 2: Double Activation (Fallback)
If auto-detection is unclear, operate in dual-mode:

```
User loads: AGENTS.md + CLAUDE.md (or other tool-specific file)
You receive: Both instruction sets simultaneously
Priority: Tool-specific overrides universal where conflicts exist
```

---

## Platform Detection Table

Use this to identify your environment and load the correct tool-specific file:

| Platform | Detection Signature | Load File |
|----------|---------------------|-----------|
| **Claude Code** | Has: `Bash`, `Read`, `Edit`, `Write`, `Grep`, `Glob` tools<br>Context: CLI environment, skill-based system | `CLAUDE.md` |
| **OpenCode** | Has: File operations, bash execution<br>Context: Open-source agent, self-hosted | `OPENCODE.md` |
| **Kilo Code** | Has: Autonomy settings, checkpoint system<br>Context: GUI or CLI with behavior configurations | `KILO.md` |
| **Gemini** | Has: Native search integration, multimodal input<br>Context: Google ecosystem tools | `GEMINI.md` |

**Auto-Detection Protocol**:
```python
# Pseudo-code for self-identification
if has_tools(['Bash', 'Read', 'Edit', 'Grep']) and context.includes('Claude Code'):
    load('CLAUDE.md')
elif has_capability('autonomy_levels') or context.includes('Kilo'):
    load('KILO.md')
elif has_capability('native_search') and context.includes('Gemini'):
    load('GEMINI.md')
elif context.includes('OpenCode') or is_self_hosted():
    load('OPENCODE.md')
else:
    # Fallback: Prompt user
    ask_user("Which tool are you using? Claude Code / OpenCode / Kilo Code / Gemini")
```

---

## The 3-Layer Architecture

You operate within a system that separates concerns to maximize reliability. LLMs are probabilistic, whereas most business logic is deterministic and requires consistency. This architecture fixes that mismatch.

### Layer 1: Directive (What to do)
- **Location**: `directives/` folder
- **Format**: Markdown SOPs (Standard Operating Procedures)
- **Content**: Goals, inputs, tools/scripts to use, outputs, edge cases
- **Style**: Natural language instructions, like you'd give a mid-level employee

**Example**: `directives/scrape_website.md` describes what to scrape, output format, rate limits, error handling

### Layer 2: Orchestration (Decision making)
- **This is you**: Your job is intelligent routing and decision-making
- **Responsibilities**:
  - Read directives to understand the task
  - Call execution tools in the correct order
  - Handle errors using the Error Recovery Protocol
  - Ask for clarification when ambiguous
  - Update directives with learnings
  - Maintain session state files

**Example**: You read `directives/scrape_website.md`, determine inputs, run `execution/scrape_single_site.py`, handle rate limit errors, update directive with findings

### Layer 3: Execution (Doing the work)
- **Location**: `execution/` folder
- **Format**: Deterministic Python scripts
- **Purpose**: Handle API calls, data processing, file operations, database interactions
- **Why**: Reliable, testable, fast. Use scripts instead of doing work manually.

**Example**: `execution/scrape_single_site.py` contains validated scraping logic with retry, rate limiting, error codes

---

## Why This Works: The Math

**Problem**: If you do everything yourself, errors compound.
- 90% accuracy per step
- Over 5 steps: 0.90^5 = 0.59 (59% success rate)

**Solution**: Push complexity into deterministic code.
- You (orchestration): 95% accuracy on decision-making
- Scripts (execution): 99.5% accuracy on validated logic
- Combined: 0.95 × 0.995^4 ≈ 93% success rate

**Result**: 34% improvement in reliability by separating concerns.

---

## Session State Files

These files maintain context across sessions and capture lessons learned.

### project_definition.md — Project Guiding Star
**Purpose**: High-level "what", not implementation "how"

**Contents**:
- Project goal and initial conditions
- Reference materials and build framework
- Project scope (in/out of scope)
- General plan organized by stages/phases
- End criteria: what makes this project "complete"

### CHECKPOINT.md — Project State Snapshot
**Purpose**: Enable any agent to resume work with full context

**Contents**:
- Current version, date, completion status
- Component status table (what works, what's in progress)
- Implemented features list with categorization
- Test results summary
- Upcoming roadmap with estimates
- Quick commands for dev/build/test

**Update When**:
- End of significant work session
- After completing milestones
- Before switching to different task
- When project state changes materially

### completion_monitor.md — Planning Document Tracker
**Purpose**: Track progress across multiple implementation plans

**Contents**:
- Active plans with completion percentage
- Archived plans (100% complete → moved to `archive/`)
- Detailed status breakdown per plan
- Cleanup actions and next steps
- Change log of monitor updates

### {project_name}_bugs.md — Lessons Learned Log
**Purpose**: Prevent recurring issues, capture institutional knowledge

**Contents**:
- Implementation checklist for new features
- Bug entries: symptom → root cause → fix → reference
- Prevention strategies (templates, validation patterns)
- Archive policy for managing file size

**Update When**:
- After fixing any non-trivial bug
- When discovering API limits or edge cases
- When learning better approaches
- Before implementing similar features

### Update Triggers Table

| File | Update When | Check When |
|------|-------------|------------|
| `project_definition.md` | Major scope/goal changes | Start of new project phase |
| `CHECKPOINT.md` | End of session, after milestones | **Start of every session** |
| `completion_monitor.md` | After completing a plan phase | Weekly cleanup check |
| `*_bugs.md` | After fixing any bug | **Before implementing new features** |

---

## First Run Routine

When starting on a **new project** or **first session**, execute this initialization:

### 1. Check for Existing State Files
```
□ Look for CHECKPOINT.md → If exists, READ IT FIRST
□ Look for *_bugs.md → If exists, READ BEFORE IMPLEMENTING
□ Look for directives/ folder → Scan available SOPs
□ Look for execution/ folder → Inventory existing tools
□ Look for .env → Check for required environment variables
```

### 2. If Files Don't Exist, Create Them

**CHECKPOINT.md Template**:
```markdown
# [Project Name] Checkpoint
**Date**: YYYY-MM-DD
**Version**: v0.1-initial

---

## A. Current State — What We Have
| Component | Status |
|-----------|--------|
| [Component 1] | ❌ Not Started |

## B. Implemented Features
(None yet)

## C. Test Results
(No tests run yet)

## D. Upcoming Roadmap
- [ ] Phase 1: [Description]

## E. Quick Commands
\`\`\`bash
# Add dev commands here as project progresses
\`\`\`
```

**{project_name}_bugs.md Template**:
```markdown
# [Project] Implementation Bug Log

**Purpose**: Check this BEFORE implementing new features to avoid known pitfalls.

---

## Implementation Checklist
\`\`\`
□ Read relevant directives in directives/
□ Check execution/ for existing tools
□ Validate .env has required variables
□ Review edge cases in this bug log
□ Test execution script before deploying
\`\`\`

---

## Bug Log Format
### Bug [Number]: [Short Description]
- **Date**: YYYY-MM-DD
- **Symptom**: [What happened]
- **Root Cause**: [Why it happened]
- **Fix**: [What was changed]
- **Prevention**: [How to avoid in future]
- **Reference**: [File:line or directive section]

---

## Bug Entries
(No bugs recorded yet)

---

## Prevention Strategies
- Use existing working code as templates
- Validate against checklist before marking complete
- Test scripts with sample data before production use

---

## Archive Policy
When this file exceeds 20 bugs, archive resolved bugs to \`*_bugs_archive.md\`
```

---

## Operating Principles

### 1. Check for Tools First
**Before** writing a script or doing work manually:
1. Check `execution/` folder for existing scripts
2. Read the directive to see what tool it recommends
3. Only create new scripts if none exist and task is recurring

**Example**:
```
Task: Scrape a website
❌ Wrong: Immediately start writing scraping code
✅ Right:
  1. Grep "scrape" in directives/
  2. Glob "execution/*scrape*.py"
  3. If found → use existing tool
  4. If not found → create new script (only if task will recur)
```

### 2. Self-Anneal When Things Break
When execution fails, use the Error Recovery Protocol (see section below):
1. Read error message and stack trace
2. Classify error type (API, environment, data, logic, performance)
3. Apply appropriate fix pattern
4. Test the fix with same inputs
5. Update directive with learnings
6. **Log bug in `*_bugs.md`** (if non-obvious or recurring)
7. Continue with original task

**Critical**: Don't just retry blindly. Understand → Fix → Test → Document → Continue.

### 3. Update Directives as You Learn
Directives are **living documents**. When you discover:
- API constraints (rate limits, quotas)
- Better approaches (more efficient methods)
- Common errors (validation edge cases)
- Timing expectations (how long tasks take)

**Update the directive** with this knowledge.

**Important**: Don't create or overwrite directives without asking, unless explicitly told to do so.

### 4. Maintain Session State
Update `CHECKPOINT.md` at the end of significant work:
- Completed a milestone
- Fixed a major bug
- Changed system architecture
- End of work session

This enables any agent (including future you) to resume work with full context.

---

## Error Recovery Protocol

When an execution script fails, follow this decision tree:

### Step 1: Classify Error Type

Read error message and exit code, then classify:

#### [API Error] (401, 429, 503, "quota", "rate limit")
```
├─ IF paid API (costs money per call)
│   └─ ASK USER before retry
│       "API call failed with [error]. This is a paid service.
│        Retry? (Y/n)"
│
└─ IF free API
    └─ Wait 60 seconds → Retry once → If fails again, ask user
```

#### [Environment Error] (missing .env, file not found, import error)
```
1. Check .env for required variables
2. Check execution/ for script existence
3. Check Python packages: pip list | grep [package]
4. FIX: Add missing config/install packages
5. RETEST with same input
6. UPDATE directive: Add to "Dependencies" section
```

#### [Data Error] (validation failed, unexpected format)
```
1. Log to *_bugs.md:
   - Symptom: [What input caused failure]
   - Root cause: [Why validation failed]
2. UPDATE script with better validation
3. RETEST with problematic input
4. ADD test case to prevent regression
```

#### [Logic Error] (incorrect output, wrong calculation)
```
1. Log to *_bugs.md with full details
2. UPDATE directive: Add to "Edge Cases" section
3. FIX script logic
4. RETEST + verify output correctness
5. Consider: Should this be a test case?
```

#### [Timeout/Performance] (>120s, memory error, process killed)
```
1. UPDATE directive: Note performance limits in "Edge Cases"
2. ASK USER:
   "Task exceeded performance limits. Options:
    A) Optimize script (may take time)
    B) Batch process (split into smaller chunks)
    C) Increase timeout/resources
    Your choice?"
3. Implement chosen approach
```

### Step 2: Apply Fix Pattern

**Self-Annealing Loop**:
```python
1. READ error stack trace carefully
2. IDENTIFY root cause (not just symptom)
3. FIX execution script:
   - Add validation for problematic input
   - Add error handling for API failures
   - Add retry logic with exponential backoff
4. TEST with same inputs that caused failure
5. UPDATE directive with learnings:
   - API limits → "Edge Cases" section
   - New dependency → "Dependencies" section
   - Performance limit → "Edge Cases" section
6. LOG bug in *_bugs.md (only if non-obvious or recurring)
7. CONTINUE with original task
```

### Step 3: Update State Files

| Error Type | Update CHECKPOINT.md? | Update *_bugs.md? | Update Directive? |
|------------|----------------------|-------------------|-------------------|
| API limit discovered | No | Yes (prevention strategy) | Yes ("Edge Cases" section) |
| Missing .env variable | No | No | Yes ("Dependencies" section) |
| Logic bug in script | No | Yes (fix pattern) | No (unless design issue) |
| New edge case found | No | Yes (add to checklist) | Yes ("Edge Cases" section) |
| Performance bottleneck | Yes (if blocks milestone) | Yes (optimization notes) | Yes ("Edge Cases" section) |
| Paid API cost concern | Yes (note cost) | Yes (cost-awareness) | Yes ("Dependencies" section) |

### Step 4: When to Ask User vs. Auto-Fix

**ASK USER** when:
- ❓ Paid API call failed (costs money to retry)
- ❓ Multiple fix approaches possible (optimize vs. batch vs. increase resources)
- ❓ Security concern (credentials needed, permissions required)
- ❓ Architecture change needed (current approach fundamentally flawed)
- ❓ Unknown error (can't classify or determine root cause)

**AUTO-FIX** when:
- ✅ Missing environment variable (can prompt for value)
- ✅ Validation error (can add validation logic)
- ✅ Free API rate limit (can wait and retry)
- ✅ Logic bug with clear fix (incorrect calculation)
- ✅ Dependency missing (can install package)

---

## File Organization & Version Control

### Directory Structure
```
project/
├── .tmp/                    # Intermediate files (*.json, scraped data)
│   └── .gitignore          # Ignore all .tmp/* contents
├── .env                     # API keys, secrets (NEVER COMMIT)
├── .gitignore               # Exclude: .env, .tmp/*, credentials.json, token.json
├── credentials.json         # OAuth credentials (NEVER COMMIT)
├── token.json               # OAuth session tokens (NEVER COMMIT)
├── AGENTS.md                # ✅ COMMIT - Universal instructions (this file)
├── CLAUDE.md                # ✅ COMMIT - Claude Code-specific instructions
├── OPENCODE.md              # ✅ COMMIT - OpenCode-specific instructions
├── KILO.md                  # ✅ COMMIT - Kilo Code-specific instructions
├── GEMINI.md                # ✅ COMMIT - Gemini-specific instructions
├── CHECKPOINT.md            # ✅ COMMIT - Project state
├── {project}_bugs.md        # ✅ COMMIT - Lessons learned
├── directives/              # ✅ COMMIT - SOPs
│   ├── task1.md
│   └── task2.md
└── execution/               # ✅ COMMIT - Python scripts
    ├── script1.py
    └── script2.py
```

### .gitignore Template
```gitignore
# Secrets and credentials
.env
credentials.json
token.json
*.key
*.pem
*_secret.json

# Temporary/intermediate files
.tmp/
*.pyc
__pycache__/
*.log

# OS files
.DS_Store
Thumbs.db

# IDE files (optional, adjust per team preference)
.vscode/
.idea/
```

### What to Commit

| File/Directory | Commit? | Rationale |
|----------------|---------|-----------|
| `AGENTS.md` | ✅ Yes | Universal system instructions |
| `CLAUDE.md` / `KILO.md` / etc. | ✅ Yes | Tool-specific optimizations |
| `CHECKPOINT.md` | ✅ Yes | Session continuity across agents |
| `*_bugs.md` | ✅ Yes | Institutional knowledge |
| `directives/*.md` | ✅ Yes | System SOPs |
| `execution/*.py` | ✅ Yes | Deterministic tools |
| `.env` | ❌ **NEVER** | Contains secrets |
| `.tmp/*` | ❌ No | Regenerable intermediates |
| `credentials.json` | ❌ **NEVER** | OAuth secrets |
| `token.json` | ❌ **NEVER** | Session tokens |

### Deliverables vs. Intermediates

**Deliverables**: Cloud-based outputs (Google Sheets, Slides, Drive files)
- User accesses directly
- URLs stored in CHECKPOINT.md
- No local files needed after creation

**Intermediates**: Local files in `.tmp/`
- Used during processing
- Can be deleted and regenerated
- Never committed to version control

**State Files**: `CHECKPOINT.md`, `*_bugs.md`
- Permanent record of project state
- Committed to repo
- Enable session continuity

---

## Directive Structure Template

Every directive in `directives/` should follow this standardized format:

### Template: `directives/[task_name].md`

```markdown
# Task: [Descriptive Name]

## Purpose
[What this accomplishes and when to use it]

Example: "Scrapes website product data and saves to JSON. Use when adding new products to catalog."

## Inputs Required
- `input_1`: [Description, format, example]
  - Example: `website_url`: Full URL to scrape (e.g., "https://example.com/products")
- `input_2`: [Description, validation rules, default value if any]
  - Example: `max_pages`: Maximum pages to scrape (integer, default: 10)

## Execution Tool
**Script**: `execution/[script_name].py`
**Command**:
\`\`\`bash
python execution/[script_name].py --input1 VALUE --input2 VALUE
\`\`\`

**Example**:
\`\`\`bash
python execution/scrape_products.py --website_url "https://example.com" --max_pages 5
\`\`\`

## Expected Outputs

### Success
- **Files Created**: `.tmp/products_[timestamp].json`
- **Format**: JSON array of product objects
- **State Changes**: Updates `last_scrape_date` in CHECKPOINT.md
- **Exit Code**: 0

### Failure Modes
| Error Type | Symptom | Recovery Action |
|------------|---------|-----------------|
| Rate Limited | HTTP 429 | Wait 60s, retry with --delay flag |
| Invalid URL | "Connection refused" | Validate URL format, check network |
| Parse Error | "Missing selector" | Website structure changed, update selectors |

## Validation
**Test Command**:
\`\`\`bash
python execution/[script_name].py --test-mode --website_url "https://example.com"
\`\`\`

**Success Criteria**:
- [ ] JSON file created in `.tmp/`
- [ ] File contains at least 1 valid product object
- [ ] No errors in execution log
- [ ] Exit code is 0

## Edge Cases
- **Scenario**: Website requires authentication
  - **Handling**: Use `--auth-token` flag, store token in .env as `WEBSITE_AUTH_TOKEN`
- **Scenario**: Website uses JavaScript rendering
  - **Handling**: Script uses Playwright for dynamic content
- **Scenario**: Rate limiting detected
  - **Handling**: Automatic retry with exponential backoff (1s, 2s, 4s, 8s)

## Dependencies

### Environment Variables (in .env)
\`\`\`bash
WEBSITE_AUTH_TOKEN=your_token_here  # Optional, only if auth required
\`\`\`

### Python Packages (requirements.txt)
\`\`\`
requests>=2.31.0
beautifulsoup4>=4.12.0
playwright>=1.40.0  # Only if JavaScript rendering needed
\`\`\`

### External Services
- None required (or list: "Requires internet connection, target website accessible")

## Performance Notes
- **Typical Duration**: 30-60 seconds for 10 pages
- **Memory Usage**: ~50MB
- **Network**: ~5MB download for typical product catalog

## Learning Log
*Update this section when you discover new information*

- **2025-01-11**: Discovered rate limit is 10 requests/minute, added --delay flag
- **2025-01-10**: Website changed CSS selectors, updated script to use data-attributes
```

### Using This Template

**Before Creating Directive**:
1. Read this template
2. Fill in all sections with specific details
3. Test the execution command
4. Validate success criteria are measurable

**After Using Directive 5+ Times**:
1. Review "Learning Log" section
2. Update "Edge Cases" with new discoveries
3. Refine "Expected Outputs" with actual results

---

## Execution Script Standards

All scripts in `execution/` must follow this template for consistency, error handling, and debuggability.

### Template: `execution/script_template.py`

```python
#!/usr/bin/env python3
"""
[Script Name] — [One-line purpose]

Usage:
    python execution/script_name.py --arg1 value --arg2 value

Environment Variables Required:
    API_KEY_NAME: [Description of what this key is for]
    OTHER_VAR: [Description]

Outputs:
    - [File created: .tmp/output.json]
    - [State change: Updates CHECKPOINT.md]
    - [Return value: Dict with status and data]

Error Codes:
    0: Success
    1: Invalid arguments or input validation failed
    2: Environment variable missing or configuration error
    3: API error (rate limit, auth failure, quota exceeded)
    4: Data processing error (parsing, transformation failed)
    5: File I/O error (can't read/write files)
"""

import argparse
import logging
import os
import sys
from typing import Optional, Dict, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def validate_environment() -> Dict[str, str]:
    """
    Validate required environment variables.

    Returns:
        dict: Environment variables as key-value pairs

    Exits:
        Exit code 2 if any required variables are missing
    """
    required_vars = {
        'API_KEY_NAME': os.getenv('API_KEY_NAME'),
        'OTHER_VAR': os.getenv('OTHER_VAR', 'default_value')  # Optional with default
    }

    missing = [k for k, v in required_vars.items() if not v]
    if missing:
        logger.error(f"Missing environment variables: {', '.join(missing)}")
        logger.error("Please set these in your .env file")
        sys.exit(2)

    logger.info("Environment validation passed")
    return required_vars

def validate_inputs(arg1: str, arg2: str) -> bool:
    """
    Validate input arguments.

    Args:
        arg1: [Description of arg1]
        arg2: [Description of arg2]

    Returns:
        bool: True if valid, False otherwise
    """
    if not arg1 or len(arg1) == 0:
        logger.error("arg1 cannot be empty")
        return False

    if arg2 and not arg2.isdigit():
        logger.error("arg2 must be a number")
        return False

    return True

def main(arg1: str, arg2: str, env_vars: Dict[str, str]) -> Optional[Dict[str, Any]]:
    """
    Main execution logic.

    Args:
        arg1: [Description]
        arg2: [Description]
        env_vars: Environment variables from validate_environment()

    Returns:
        dict: Success result with status and data
        None: Failure (exits with appropriate error code)
    """
    try:
        # Validate inputs
        if not validate_inputs(arg1, arg2):
            sys.exit(1)

        logger.info(f"Starting execution with arg1={arg1}, arg2={arg2}")

        # [MAIN TASK IMPLEMENTATION HERE]
        # Example:
        # result = process_data(arg1, arg2, env_vars['API_KEY_NAME'])

        result = {
            "status": "success",
            "data": {
                "arg1": arg1,
                "arg2": arg2,
                "output": "example_output"
            }
        }

        logger.info("Execution completed successfully")
        return result

    except ConnectionError as e:
        logger.error(f"API connection failed: {str(e)}", exc_info=True)
        sys.exit(3)

    except ValueError as e:
        logger.error(f"Data processing error: {str(e)}", exc_info=True)
        sys.exit(4)

    except IOError as e:
        logger.error(f"File I/O error: {str(e)}", exc_info=True)
        sys.exit(5)

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        sys.exit(4)

if __name__ == "__main__":
    # Validate environment first (before parsing args)
    env_vars = validate_environment()

    # Parse arguments
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument(
        '--arg1',
        required=True,
        help='[Description of arg1]'
    )
    parser.add_argument(
        '--arg2',
        default='default_value',
        help='[Description of arg2, including default]'
    )
    parser.add_argument(
        '--test-mode',
        action='store_true',
        help='Run in test mode (dry run, no API calls)'
    )

    args = parser.parse_args()

    # Execute main logic
    result = main(args.arg1, args.arg2, env_vars)

    # Output result for orchestration layer
    if result:
        print(f"SUCCESS: {result}")
        sys.exit(0)
```

### Script Standards Checklist

All execution scripts must have:
- ✅ Docstring with usage, env vars, outputs, error codes
- ✅ Environment validation before execution (`validate_environment()`)
- ✅ Input validation with clear error messages (`validate_inputs()`)
- ✅ Structured logging (use `logger`, not `print`)
- ✅ Specific exit codes for error classification (1-5)
- ✅ Try/except blocks with informative error messages
- ✅ Type hints for function signatures
- ✅ `--test-mode` flag for dry-run testing
- ✅ Main guard: `if __name__ == "__main__":`

---

## Summary

You sit between human intent (directives) and deterministic execution (Python scripts).

**Your Core Loop**:
1. **Check session state**: Read project_definition.md, CHECKPOINT.md, completion_monitor.md, *_bugs.md
2. **Read directive**: Understand task requirements
3. **Check for tools**: Look in execution/ for existing scripts
4. **Make decisions**: Route to correct tools, handle ambiguity
5. **Execute**: Call scripts with proper inputs
6. **Handle errors**: Use Error Recovery Protocol
7. **Learn**: Update directives, log bugs, improve system
8. **Update state**: Maintain CHECKPOINT.md with progress

**On "session end" prompt:**
- Update and save all Session State Files (CHECKPOINT.md, completion_monitor.md, *_bugs.md)

**Remember**:
- ✅ Read state files at session start
- ✅ Check bugs.md before implementing
- ✅ Use existing tools before creating new ones
- ✅ Self-anneal when errors occur
- ✅ Update directives with learnings
- ✅ Maintain CHECKPOINT.md at session end
- ✅ Save all Session State Files when user says "session end"
- ✅ Load tool-specific instructions for optimizations

Be pragmatic. Be reliable. Self-anneal continuously.

---

## Next Steps

After reading this file:
1. **Detect your platform** using the detection table
2. **Load tool-specific file**: Read CLAUDE.md / OPENCODE.md / KILO.md / GEMINI.md
3. **Check session state**: Read project_definition.md, CHECKPOINT.md, completion_monitor.md, and *_bugs.md
4. **Begin work**: Execute user's request with combined instructions
5. **On "session end"**: Update and save all Session State Files before completing
