# GEMINI — Gemini Specific Instructions

> **Prerequisites**: You must read AGENTS.md first. This file contains Gemini-specific optimizations that build on universal instructions.

---

## Platform Identification

**You are using Gemini if you have**:
- Native search integration (can search web directly)
- Multimodal input capabilities (images, screenshots, diagrams)
- Google ecosystem tools (Google Drive, Docs, Sheets integration)
- Real-time information access

**Context**: Google AI environment, multimodal processing, native search, Google Workspace integration

---

## Unique Capabilities & Optimal Usage

### Native Search Integration

**Research Before Execution** (Gemini's Superpower)
```
✅ Use native search for: Current API docs, latest library versions, best practices
❌ Avoid: Outdated assumptions, guessing API patterns

Example workflow:
1. User asks: "Scrape product data from Shopify"
2. Search: "Shopify API latest documentation 2025"
3. Search: "Python Shopify scraping best practices 2025"
4. Read current rate limits, authentication methods
5. THEN create/update directive with current information
```

**Search-Enhanced Directive Creation**
```python
# Before creating a directive:

# 1. Search for current best practices
search("Python BeautifulSoup best practices 2025")
search("Web scraping rate limiting patterns 2025")

# 2. Search for API-specific constraints
search("Target Website API rate limits documentation")

# 3. Read existing directive (if exists)
read_file("directives/scrape_website.md")

# 4. Create/update directive with researched information
directive_content = """
# Task: Scrape Website

## Purpose
[Informed by current best practices from search]

## Edge Cases
- **Rate Limiting**: [Current API limits from documentation]
- **Authentication**: [Latest auth method from 2025]

## Dependencies
- beautifulsoup4>=4.12.0  [Latest stable version from search]
"""
```

### Multimodal Input Processing

**Screenshots to Code**
```
✅ When user provides: Screenshot of desired UI
1. Analyze visual elements, layout, components
2. Search: "Framework shown in screenshot best practices 2025"
3. Generate code matching screenshot
4. Create directive for future similar tasks

Example:
User: [Uploads screenshot of data table]
You:
  1. Identify: Bootstrap table, pagination controls
  2. Search: "Bootstrap 5 table with pagination 2025"
  3. Generate HTML/CSS matching screenshot
  4. Save pattern to directive for reuse
```

**Diagrams to Architecture**
```
✅ When user provides: System architecture diagram
1. Parse components, connections, data flow
2. Search current implementations for each component
3. Generate directives for each component
4. Create integration plan

Example:
User: [Uploads architecture diagram: API → Database → Cache]
You:
  1. Identify: REST API, PostgreSQL, Redis
  2. Search: "FastAPI PostgreSQL Redis integration 2025"
  3. Create directives: api_setup.md, database_setup.md, cache_setup.md
  4. Execution scripts informed by latest patterns
```

### Google Workspace Integration

**Deliverables in Google Ecosystem**
```
✅ Store results in: Google Sheets, Docs, Slides, Drive
❌ Avoid: Local files for deliverables (use .tmp/ only for intermediates)

Example workflow:
1. Execute: python execution/scrape_products.py
2. Output: .tmp/products.json (intermediate)
3. Transform: Convert to Google Sheets
4. Deliverable: Share Sheet URL with user
5. Update CHECKPOINT.md with Sheet URL
```

---

## Gemini Workflow Optimization

### Standard Task Execution Pattern (Search-First)

**Step 1: Check Session State**
```python
# Read state files if they exist
read_file("CHECKPOINT.md")  # Check project status
read_file("{project}_bugs.md")  # Check known issues
```

**Step 2: Research Current Best Practices** (Gemini-Specific)
```python
# Before looking for directive, research current state
search("task_keyword best practices 2025")
search("Python library_name latest version documentation")

# Read search results to understand:
# - Current recommended approaches
# - Latest library versions
# - Known issues or deprecations
# - Rate limits or API changes
```

**Step 3: Find or Create Directive**
```python
# Search for existing directive
search_files(pattern="scrape", directory="directives")

# If exists: Read and verify against current research
read_file("directives/scrape_website.md")

# If outdated: Update with latest findings
# If missing: Create with researched information
```

**Step 4: Check for Existing Execution Tools**
```python
# Find existing scripts
list_files(pattern="execution/*scrape*.py")

# If found, verify uses current best practices
read_file("execution/scrape_single_site.py")

# If outdated libraries or patterns, flag for update
```

**Step 5: Execute with Current Knowledge**
```python
# Run the script
result = execute('python execution/scrape_single_site.py --url "https://example.com" --output .tmp/data.json')

# If error, search for current solutions
if error:
    search(f"Python {error_type} fix 2025")
    # Apply current best practice fix
```

**Step 6: Update Directive with Learnings**
```python
# Add research findings to directive
edit_file(
  path="directives/scrape_website.md",
  old_content="## Learning Log",
  new_content=f"## Learning Log\n\n- {date}: Verified rate limit is still 10 req/min (per API docs)"
)
```

**Step 7: Create Google Workspace Deliverable** (Gemini-Specific)
```python
# Transform .tmp/data.json to Google Sheets
# Update CHECKPOINT.md with deliverable URL
edit_file(
  path="CHECKPOINT.md",
  old_content="## Deliverables\n\n(None yet)",
  new_content="## Deliverables\n\n- Product Data: https://docs.google.com/spreadsheets/d/[ID]"
)
```

---

## Error Recovery with Gemini (Search-Enhanced)

### Error Classification with Web Search

**Exit Code 1: Invalid Arguments**
```python
# Standard fix approach (no search needed)
# 1. Read directive to check required arguments
read_file("directives/task.md")
# 2. Fix argument format
# 3. Retry
```

**Exit Code 2: Missing Environment Variable**
```python
# Fix with search for current setup patterns
# 1. Search for latest .env best practices
search("Python dotenv best practices 2025")

# 2. Read script to see what's required
read_file("execution/script.py")

# 3. Ask user for value, update .env
# 4. Retry
```

**Exit Code 3: API Error** (SEARCH FIRST)
```python
# Fix approach: Search for current API status and solutions
# 1. Read error message
# 2. Search for current API documentation
search("API_Name rate limits 2025")
search("API_Name authentication error fixes 2025")

# 3. If "rate limit" or "429":
#    - Search: "API_Name rate limit workarounds 2025"
#    - Apply current best practice (batch endpoint, delay, etc.)

# 4. If "401" or "403":
#    - Search: "API_Name authentication setup 2025"
#    - Update .env with correct auth pattern

# 5. Update directive with current API constraints
```

**Exit Code 4: Data Processing Error**
```python
# Fix with search for current solutions
# 1. Read script to understand data flow
read_file("execution/script.py")

# 2. Search for current solution patterns
search(f"Python {library_name} {error_type} fix 2025")

# 3. Apply current best practice fix
edit_file(path="execution/script.py", ...)

# 4. Test and log bug
```

**Exit Code 5: File I/O Error**
```python
# Standard fix (no search needed)
# 1. Check if directory exists
# 2. Create missing directories
execute("mkdir -p .tmp/")
# 3. Retry
```

---

## Directive Management with Gemini

### Research-Driven Directive Creation

**Pattern: Search → Synthesize → Create**
```python
# 1. RESEARCH (Gemini advantage)
search("task_name best practices 2025")
search("Python library_name documentation 2025")
search("task_name common pitfalls 2025")

# 2. SYNTHESIZE findings
# - Latest library version: X.Y.Z
# - Current rate limits: N requests/minute
# - Recommended approach: [pattern from search]
# - Known edge cases: [from recent discussions]

# 3. CREATE directive with researched information
directive_content = f"""
# Task: {task_name}

## Purpose
{purpose_informed_by_research}

## Dependencies
### Python Packages
- {library_name}>={latest_version}  # Verified latest stable, {date}

## Edge Cases
- **Rate Limiting**: {current_rate_limits_from_docs}
- **Authentication**: {current_auth_method}

## Learning Log
- {date}: Created directive based on latest {year} documentation
"""

write_file(f"directives/{task_name}.md", directive_content)
```

### Keeping Directives Current

**Periodic Verification Pattern**
```python
# When executing old directive (>6 months):

# 1. Read directive
directive = read_file("directives/old_task.md")

# 2. Extract key dependencies and patterns
# Example: Uses requests==2.28.0, BeautifulSoup4==4.11.0

# 3. Search for updates
search("Python requests library latest version 2025")
search("BeautifulSoup4 latest version 2025")

# 4. If major updates exist:
#    - Update directive with new versions
#    - Note breaking changes in Learning Log
#    - Flag execution script for review

edit_file(
  path="directives/old_task.md",
  old_content="- requests==2.28.0",
  new_content=f"- requests>=2.31.0  # Updated {date}, verified compatible"
)
```

---

## Script Management with Gemini

### Creating Execution Scripts (Search-Enhanced)

**Pattern: Research → Template → Customize**
```python
# 1. RESEARCH current best practices
search("Python script_purpose best practices 2025")
search("Python error handling patterns 2025")
search("Python logging setup 2025")

# 2. Get template from AGENTS.md
template = read_file("AGENTS.md")  # Extract script template

# 3. CUSTOMIZE with researched patterns
new_script = """
#!/usr/bin/env python3
\"\"\"
Task-specific script created {date}
Based on {library_name} {version} best practices

Usage:
    python execution/my_script.py --arg value
\"\"\"

import argparse
import logging
import sys

# [Use current logging pattern from search results]
# [Use current error handling pattern from search results]
# [Use current validation pattern from search results]
"""

write_file("execution/my_script.py", new_script)
```

### Debugging with Search

**Pattern: Error → Search → Fix → Learn**
```python
# When script fails:

# 1. Capture error
error_message = "ValueError: invalid literal for int() with base 10: 'abc'"

# 2. Search for current solutions
search(f"Python {error_message} fix 2025")
search("Python input validation best practices 2025")

# 3. Read top solutions, synthesize fix
# 4. Apply fix to script
edit_file(
  path="execution/my_script.py",
  old_content="value = int(user_input)",
  new_content="value = int(user_input) if user_input.isdigit() else 0"
)

# 5. Log bug with reference to solution source
bug_entry = f"""
### Bug 1: Input Validation Missing
- **Date**: {date}
- **Symptom**: {error_message}
- **Root Cause**: No validation before type conversion
- **Fix**: Added isdigit() check per Python best practices 2025
- **Reference**: execution/my_script.py:45
"""
```

---

## Multimodal Workflow Patterns

### Screenshot → Directive

**When user provides UI screenshot**:
```python
# 1. ANALYZE screenshot
# - Identify UI framework (React, Vue, Bootstrap, etc.)
# - Note components (tables, forms, buttons, etc.)
# - Observe layout patterns (grid, flexbox, etc.)

# 2. SEARCH for current implementation patterns
search("framework_identified best practices 2025")
search("component_type implementation 2025")

# 3. CREATE directive for future similar tasks
directive_content = """
# Task: Build {component_type} UI

## Purpose
Replicate UI shown in screenshot (reference: {screenshot_filename})

## Framework
{framework_identified} {latest_version}

## Components Required
- {component_1}
- {component_2}

## Implementation Pattern
{pattern_from_search_results}
"""
```

### Diagram → Architecture Directives

**When user provides architecture diagram**:
```python
# 1. PARSE diagram
# - Components: API Server, Database, Cache, Queue, etc.
# - Connections: REST, GraphQL, WebSocket, etc.
# - Data flow: Request → Auth → Process → Store → Response

# 2. SEARCH for each component's current best practices
search("component_1 setup Python 2025")
search("component_2 integration best practices 2025")

# 3. CREATE directive for each component
for component in components:
    search(f"{component} Python implementation 2025")
    create_directive(component, researched_patterns)

# 4. CREATE integration directive
create_directive("system_integration", overall_architecture)
```

---

## Google Workspace Deliverables

### Intermediate → Deliverable Pattern

**Always use this workflow**:
```python
# 1. EXECUTE script (output to .tmp/)
execute("python execution/process_data.py --output .tmp/results.json")

# 2. TRANSFORM to Google Workspace format
# Example: JSON → Google Sheets
transform_to_sheets(".tmp/results.json")

# 3. GET shareable URL
sheet_url = "https://docs.google.com/spreadsheets/d/[ID]"

# 4. UPDATE CHECKPOINT.md
edit_file(
  path="CHECKPOINT.md",
  old_content="## Deliverables\n\n(None yet)",
  new_content=f"## Deliverables\n\n- Results: {sheet_url} (created {date})"
)

# 5. CLEAN UP intermediate
# .tmp/results.json can be deleted (not committed)
```

### Format-Specific Patterns

**Data → Google Sheets**
```
Use when: Tabular data, reports, dashboards
Example: Product catalog, sales data, metrics
```

**Reports → Google Docs**
```
Use when: Text-heavy output, formatted reports, analysis
Example: Bug analysis report, feature documentation
```

**Presentations → Google Slides**
```
Use when: Visual presentations, stakeholder updates
Example: Project status, architecture overview
```

---

## Best Practices Summary

### DO ✅
- **Always search before creating/updating directives** (verify current best practices)
- **Use multimodal input** (screenshots, diagrams → code/architecture)
- **Store deliverables in Google Workspace** (Sheets, Docs, Slides)
- **Keep .tmp/ for intermediates only** (never commit)
- **Update directives with search verification dates**
- **Search for current solutions when errors occur**
- **Leverage native search for API documentation**
- **Use latest library versions** (verify via search)
- **Update CHECKPOINT.md with deliverable URLs**

### DON'T ❌
- **Don't assume API patterns without searching**
- **Don't use outdated library versions** (search for latest)
- **Don't create local file deliverables** (use Google Workspace)
- **Don't skip research step when creating directives**
- **Don't ignore multimodal capabilities** (use screenshots/diagrams)
- **Don't commit .tmp/ files** (intermediates only)
- **Don't retry API calls without searching for current limits**

---

## Quick Reference: Gemini Advantages

| Task | Gemini Advantage | Pattern |
|------|-----------------|---------|
| Create directive | Search current docs | Search → Synthesize → Create |
| Debug error | Search latest solutions | Error → Search → Fix → Log |
| Update library | Verify latest version | Search version → Update → Test |
| UI from screenshot | Multimodal analysis | Analyze → Search framework → Generate |
| Architecture from diagram | Visual parsing | Parse → Search components → Create directives |
| Store results | Google Workspace | .tmp/ → Transform → Share URL |
| API integration | Search current limits | Search docs → Note limits → Implement |
| Best practices | Real-time verification | Search "{task} 2025" → Apply current patterns |

---

## Integration with AGENTS.md

This file (GEMINI.md) provides **how** to leverage Gemini's unique capabilities.
AGENTS.md provides **what** to do (architecture, workflows, patterns).

**Combined workflow**:
1. AGENTS.md tells you: "Create directive for new task"
2. GEMINI.md tells you: "Search current best practices first, verify latest library versions, then create"

**Priority**:
- If conflict exists, GEMINI.md (tool-specific) overrides AGENTS.md (universal)
- Example: AGENTS.md says "create directive", GEMINI.md says "search first, then create with current info"

**Your mental model**:
```
AGENTS.md = Strategy (what to do, when to do it, why)
GEMINI.md = Tactics (search first, use multimodal, Google Workspace deliverables)
```

---

## Session Checklist

### At Session Start
```
□ Read AGENTS.md (universal instructions)
□ Read GEMINI.md (this file - tool-specific)
□ Read CHECKPOINT.md (project state)
□ Read {project}_bugs.md (known issues)
□ List directives/*.md (available SOPs)
□ List execution/*.py (available tools)
```

### During Execution
```
□ Search before creating/updating directives
□ Use multimodal input when available (screenshots, diagrams)
□ Verify current library versions via search
□ Store deliverables in Google Workspace (not local files)
□ Update CHECKPOINT.md with deliverable URLs
□ Search for current solutions when errors occur
□ Keep .tmp/ for intermediates only
```

### At Session End
```
□ Update CHECKPOINT.md with progress
□ Ensure all deliverables are in Google Workspace with URLs documented
□ Commit directives, scripts, CHECKPOINT.md (not .tmp/ files)
□ Verify .env and credentials not committed
```

---

## Search Query Patterns

### Best Practice Queries
```
"{library_name} best practices {current_year}"
"{task_name} Python implementation {current_year}"
"{framework_name} latest version documentation"
```

### Error Resolution Queries
```
"Python {error_message} fix {current_year}"
"{library_name} {error_type} solution {current_year}"
"{API_name} {error_code} troubleshooting"
```

### API/Library Verification Queries
```
"{API_name} rate limits documentation {current_year}"
"{library_name} latest stable version"
"{library_name} breaking changes {previous_version} to {current_version}"
```

### Current Trends Queries
```
"{technology} current best practices {current_year}"
"{framework} vs {alternative} comparison {current_year}"
"{tool_name} alternatives {current_year}"
```

---

**You are now optimized for Gemini**. Leverage search, multimodal input, and Google Workspace integration for maximum effectiveness.
