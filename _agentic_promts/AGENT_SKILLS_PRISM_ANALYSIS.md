# PRISM Analysis: Agent Skills for Directive System

**Date**: 2026-01-11
**Applying**: PRISM methodology to agent skills research
**Goal**: Design optimal `agent_skills.md` for the 3-layer directive system

---

## Executive Summary

**Recommendation**: Implement agent skills as a **fourth layer** that sits **above** the directive system, providing reusable capability packages that leverage directives and execution scripts.

**Key Insight**: Agent skills and the directive system solve different problems at different abstraction levels. Skills should **compose** directives, not replace them.

```
Layer 0: Agent Skills (Capability Packages) ← NEW
    ↓ Composes/orchestrates
Layer 1: Directives (What to do - SOPs)
    ↓ Calls
Layer 2: Orchestration (Decision making - the agent)
    ↓ Executes
Layer 3: Execution (Deterministic scripts)
```

---

## 1. PRISM Analysis of Agent Skills

### Platform-Specific Findings

| Platform | Key Differentiator | Relevance to Directive System |
|----------|-------------------|------------------------------|
| **Claude Code** | `allowed-tools`, `context: fork`, hooks | ✅ HIGH - Can restrict directives to safe tools |
| **Kilo Code** | Mode-specific skills (`skills-code/`, `skills-architect/`) | ✅ MEDIUM - Could have mode-specific directives |
| **Gemini** | Multimodal, search-first | ✅ LOW - Already in GEMINI.md tool-specific file |
| **VS Code Copilot** | `.github/skills/` integration | ✅ MEDIUM - For team sharing |

### Universal Patterns (Applicable to All Tools)

✅ **Progressive Disclosure** (3-tier loading):
1. Discovery: Load metadata only (name + description)
2. Activation: Load full SKILL.md when matched
3. Execution: Load supporting files on demand

✅ **Automatic Activation**: Agent detects relevance from description

✅ **Hierarchical Precedence**: Project > Personal > Enterprise

✅ **YAML Frontmatter + Markdown**: Universal format

---

## 2. Agent Skills vs. Directive System

### Comparison Matrix

| Aspect | Agent Skills | Directive System (AGENTS.md) |
|--------|-------------|------------------------------|
| **Abstraction Level** | High-level capabilities | Low-level SOPs |
| **Scope** | Multi-step workflows | Single task procedures |
| **Composition** | Compose multiple tools/directives | Call single execution script |
| **Portability** | Cross-platform (open standard) | System-specific |
| **Activation** | Auto-detected by agent | Called by agent orchestration |
| **Content** | "How to achieve goal X" | "How to run script Y" |
| **Example** | "PDF Processing" skill | `directives/extract_pdf_text.md` |

### Key Distinction

**Agent Skills** = "I can process PDFs"
- Discovers relevant directives (`extract_pdf_text.md`, `fill_pdf_form.md`)
- Composes execution scripts (`execution/extract_text.py`, `execution/fill_form.py`)
- Provides high-level workflow guidance

**Directives** = "Here's how to extract text from a PDF"
- Specific procedure for one task
- Calls one execution script
- Deterministic flow

---

## 3. Integration Strategy: Skills as Layer 0

### Recommended Architecture

```
┌─────────────────────────────────────────────────┐
│ Layer 0: Agent Skills (NEW)                    │
│ - Reusable capability packages                 │
│ - Compose multiple directives                  │
│ - High-level workflow orchestration            │
│ - Auto-discovered by agent                     │
└─────────────────────────────────────────────────┘
                    ↓ Uses/Composes
┌─────────────────────────────────────────────────┐
│ Layer 1: Directives                             │
│ - SOPs for specific tasks                      │
│ - Call execution scripts                       │
│ - Low-level procedures                         │
└─────────────────────────────────────────────────┘
                    ↓ Calls
┌─────────────────────────────────────────────────┐
│ Layer 2: Orchestration (Agent)                 │
│ - Intelligent routing                          │
│ - Error recovery                               │
│ - State management                             │
└─────────────────────────────────────────────────┘
                    ↓ Executes
┌─────────────────────────────────────────────────┐
│ Layer 3: Execution Scripts                     │
│ - Deterministic Python code                    │
│ - API calls, data processing                   │
│ - Exit codes for error classification          │
└─────────────────────────────────────────────────┘
```

### Example Flow

**User**: "Extract product data from PDF invoices and update the database"

**Agent Skill**: `pdf-data-extraction`
```yaml
---
name: pdf-data-extraction
description: Extract structured data from PDF documents and store in database.
Use when extracting data from PDFs, invoices, or when user mentions PDF data extraction.
---

# PDF Data Extraction Workflow

## Steps

1. **Extract text from PDF**
   - Use directive: `directives/extract_pdf_text.md`
   - Script: `execution/extract_text.py`

2. **Parse structured data**
   - Use directive: `directives/parse_invoice_data.md`
   - Script: `execution/parse_invoice.py`

3. **Validate data**
   - Use directive: `directives/validate_data.md`
   - Script: `execution/validate.py`

4. **Update database**
   - Use directive: `directives/update_products_db.md`
   - Script: `execution/update_db.py`

## Error Handling

If extraction fails:
- Check PDF format (may need OCR)
- See directive: `directives/pdf_ocr.md`
```

**Flow**:
1. Agent detects "PDF" + "extract" → activates `pdf-data-extraction` skill
2. Skill instructs agent to use 4 directives in sequence
3. Each directive calls its execution script
4. Agent applies error recovery protocol from AGENTS.md
5. Updates CHECKPOINT.md with results

---

## 4. PRISM Deliverable Formats

### Format 1: Tool-Ready Skill Template

**For**: Creating new agent skills in the directive system

```yaml
---
name: skill-identifier
description: |
  [What it does]: Brief capability statement.
  [When to use]: Use when [triggers]. Mentions [keywords].
  [Directives used]: Leverages directives: directive1.md, directive2.md
---

# Skill Name

## Overview
High-level capability description.

## Directives Used
- `directives/directive1.md` - Purpose 1
- `directives/directive2.md` - Purpose 2
- `directives/directive3.md` - Purpose 3

## Workflow

### Step 1: [Action]
**Directive**: `directives/directive1.md`
**Script**: `execution/script1.py`
**Expected Output**: [Description]

### Step 2: [Action]
**Directive**: `directives/directive2.md`
**Script**: `execution/script2.py`
**Expected Output**: [Description]

### Step 3: [Action]
**Directive**: `directives/directive3.md`
**Script**: `execution/script3.py`
**Expected Output**: [Description]

## Error Handling
Refer to Error Recovery Protocol in AGENTS.md.

Specific error patterns:
- [Error type] → Use directive: `directives/fix_directive.md`

## Validation
**Success Criteria**:
- [ ] All steps completed
- [ ] CHECKPOINT.md updated
- [ ] No errors in logs

## Resources
- [Detailed Guide](./GUIDE.md)
- [Examples](./EXAMPLES.md)
```

### Format 2: Platform-Specific Skills

**Claude Code Specific** (with tool restrictions):
```yaml
---
name: safe-pdf-inspection
description: Safely inspect PDF files without modification. Use for PDF analysis,
auditing, or when read-only PDF access needed.
allowed-tools: Read, Grep, Glob
---

# Safe PDF Inspection

**Tool Restriction**: Read-only operations (Read, Grep, Glob)

## Available Directives
- `directives/analyze_pdf_structure.md` (read-only)
- `directives/extract_pdf_metadata.md` (read-only)

**Cannot use**:
- `directives/fill_pdf_form.md` (requires Write)
- `directives/merge_pdfs.md` (requires Write)
```

**Kilo Code Specific** (mode-based):
```yaml
# In skills-code/data-processing/SKILL.md
---
name: data-processing
description: Data processing implementation patterns
---

# Data Processing (Code Mode)

Focus: Implementation and optimization

Directives:
- `directives/process_csv_data.md`
- `directives/validate_data_format.md`
- `directives/optimize_dataframe.md`
```

```yaml
# In skills-architect/data-processing/SKILL.md
---
name: data-processing
description: Data processing architecture and design
---

# Data Processing (Architect Mode)

Focus: System design and scalability

Directives:
- `directives/design_data_pipeline.md`
- `directives/choose_processing_framework.md`
- `directives/plan_data_storage.md`
```

---

## 5. Recommended Implementation for Directive System

### Directory Structure

```
project/
├── AGENTS.md                    # Layer 0: Universal instructions
├── CLAUDE.md / KILO.md / etc.   # Tool-specific optimizations
├── CHECKPOINT.md                # Project state
├── {project}_bugs.md            # Lessons learned
│
├── .claude/skills/              # Layer 0: Agent Skills (NEW)
│   ├── pdf-processing/
│   │   ├── SKILL.md             # Skill definition
│   │   ├── GUIDE.md             # Detailed workflow
│   │   └── EXAMPLES.md          # Usage examples
│   │
│   ├── data-extraction/
│   │   └── SKILL.md
│   │
│   └── code-review/
│       ├── SKILL.md
│       ├── SECURITY.md
│       └── PERFORMANCE.md
│
├── directives/                  # Layer 1: Directives (SOPs)
│   ├── extract_pdf_text.md
│   ├── fill_pdf_form.md
│   ├── process_csv_data.md
│   ├── validate_data.md
│   └── update_database.md
│
└── execution/                   # Layer 3: Execution scripts
    ├── extract_text.py
    ├── fill_form.py
    ├── process_csv.py
    ├── validate.py
    └── update_db.py
```

### Skill → Directive → Script Flow

```
User: "Help me process customer PDFs"
    ↓
Agent detects: "PDF" + "process"
    ↓
Activates Skill: .claude/skills/pdf-processing/SKILL.md
    ↓
Skill instructs: Use these directives in order:
    1. directives/extract_pdf_text.md
    2. directives/parse_customer_data.md
    3. directives/validate_data.md
    4. directives/update_customers_db.md
    ↓
For each directive:
    Agent reads directive → calls execution script → handles errors
    ↓
Updates CHECKPOINT.md with results
```

---

## 6. AGENT_SKILLS.md Content Design

Based on PRISM analysis, here's what should go in `agent_skills.md`:

### Section 1: What Are Agent Skills?

```markdown
# Agent Skills — Capability Packages for the Directive System

## Definition
Agent Skills are **reusable capability packages** that compose multiple directives
into high-level workflows. They sit above the directive layer, providing
discoverability and orchestration.

## Architecture
```
Layer 0: Agent Skills     ← Compose workflows
Layer 1: Directives       ← Define procedures
Layer 2: Orchestration    ← Make decisions
Layer 3: Execution        ← Run deterministic code
```

## Key Differences

| Aspect | Agent Skills | Directives |
|--------|-------------|------------|
| Level | High-level capabilities | Low-level procedures |
| Scope | Multi-step workflows | Single-task SOPs |
| Composition | Uses multiple directives | Calls one script |
| Activation | Auto-discovered by agent | Called by orchestration |
```

### Section 2: Skill Definition Format

```markdown
## Skill Format

Every skill is a folder in `.claude/skills/` (or `.github/skills/`, `.kilocode/skills/`)
containing a `SKILL.md` file:

```yaml
---
name: skill-identifier
description: What it does and when to use it. Include trigger keywords.
---

# Skill Name

## Directives Used
List all directives this skill composes.

## Workflow
Step-by-step execution using directives.

## Error Handling
How to handle failures (refer to AGENTS.md Error Recovery Protocol).
```

### Required Fields
- `name`: Lowercase, hyphens, max 64 chars, must match directory name
- `description`: Max 1024 chars, includes what/when/keywords

### Optional Fields (Platform-Specific)
- `allowed-tools`: Claude Code - restrict tools for security
- `context`: Claude Code - fork to sub-agent
- `license`: Open standard / Kilo.ai
- `metadata`: Kilo.ai - custom key-value pairs
```

### Section 3: Progressive Disclosure

```markdown
## Progressive Disclosure Pattern

Agent skills use 3-tier loading to keep context efficient:

### Tier 1: Discovery (~50 tokens)
- Agent loads only `name` and `description`
- Determines relevance to user request
- Low overhead - can have many skills installed

### Tier 2: Activation (~2-5K tokens)
- When request matches description
- Loads full `SKILL.md` body
- Reveals directives and workflow

### Tier 3: Execution (on-demand)
- Supporting files load only when referenced
- Directives load when agent needs details
- Execution scripts run without loading into context

**Best Practice**: Keep SKILL.md under 500 lines. Link to supporting files
for detailed documentation.
```

### Section 4: Skill Activation

```markdown
## How Skills Activate

### Description Quality is Critical

The `description` field determines activation. Use this formula:

**Formula**: `[What it does] + [When to use] + [Trigger keywords]`

**Good Example**:
```yaml
description: Extract structured data from PDF documents including invoices,
forms, and reports. Use when processing PDFs, extracting tables, or when user
mentions PDF data extraction, invoice processing, or form filling.
```

**Bad Example**:
```yaml
description: PDF handling
```

### Testing Activation

Create test queries that should trigger your skill:
- ✓ "Help me extract data from PDF invoices"
- ✓ "I need to process customer PDF forms"
- ✓ "Extract tables from this PDF report"

If skill doesn't activate:
1. Add more trigger keywords to description
2. Mention file types/technologies explicitly
3. Include common user phrasing
```

### Section 5: Skill Composition Patterns

```markdown
## Composition Patterns

### Pattern 1: Sequential Workflow

Directives executed in order:

```yaml
---
name: data-pipeline
description: ETL pipeline for processing CSV data and updating database
---

# Data Pipeline Skill

## Workflow

### Step 1: Extract
**Directive**: `directives/extract_csv_data.md`
**Script**: `execution/extract_csv.py`
**Output**: `.tmp/raw_data.json`

### Step 2: Transform
**Directive**: `directives/transform_data.md`
**Script**: `execution/transform.py`
**Output**: `.tmp/clean_data.json`

### Step 3: Load
**Directive**: `directives/update_database.md`
**Script**: `execution/update_db.py`
**Output**: Database updated, CHECKPOINT.md updated with count
```

### Pattern 2: Conditional Workflow

Directives selected based on conditions:

```yaml
---
name: document-processing
description: Process documents in various formats (PDF, Word, Excel)
---

# Document Processing Skill

## Workflow

### Step 1: Detect Format
Check file extension.

### Step 2: Route to Directive
- If PDF: Use `directives/process_pdf.md`
- If DOCX: Use `directives/process_word.md`
- If XLSX: Use `directives/process_excel.md`

### Step 3: Extract Data
Chosen directive calls appropriate script.
```

### Pattern 3: Error-Resilient Workflow

Built-in error recovery:

```yaml
---
name: web-scraping
description: Scrape website data with retry logic and error handling
---

# Web Scraping Skill

## Workflow

### Step 1: Scrape
**Directive**: `directives/scrape_website.md`
**Script**: `execution/scrape.py`

**Error Handling**:
- Exit code 3 (API error/rate limit):
  - Wait 60s, retry once
  - If fails again: Use `directives/scrape_with_delay.md`
- Exit code 4 (parsing error):
  - Use `directives/scrape_with_ocr.md` (for image-based text)

### Step 2: Validate
**Directive**: `directives/validate_scraped_data.md`
**Script**: `execution/validate.py`
```

### Pattern 4: Tool-Restricted (Claude Code)

Safety-first workflows:

```yaml
---
name: code-audit
description: Audit code without making changes (read-only analysis)
allowed-tools: Read, Grep, Glob
---

# Code Audit Skill

**Tool Restriction**: Read-only operations

## Available Directives
- `directives/analyze_security.md` (read-only)
- `directives/check_code_quality.md` (read-only)
- `directives/find_performance_issues.md` (read-only)

**Cannot Use**:
- `directives/auto_fix_issues.md` (requires Edit/Write)
```
```

### Section 6: Creating Skills

```markdown
## Creating Your First Skill

### Step 1: Identify the Capability

Ask:
- What workflow do I repeat often?
- What involves multiple directives?
- What would benefit from auto-discovery?

### Step 2: Choose Location

**Project-specific** (team shares):
```bash
mkdir -p .claude/skills/your-skill-name
mkdir -p .github/skills/your-skill-name  # For Copilot compatibility
```

**Personal** (just for you):
```bash
mkdir -p ~/.claude/skills/your-skill-name    # Claude Code
mkdir -p ~/.github/skills/your-skill-name    # VS Code Copilot
mkdir -p ~/.kilocode/skills/your-skill-name  # Kilo.ai
```

### Step 3: Create SKILL.md

```yaml
---
name: your-skill-name
description: [What] + [When] + [Keywords]. Mentions directives used.
---

# Your Skill Name

## Directives Used
- `directives/directive1.md` - Purpose
- `directives/directive2.md` - Purpose

## Workflow

### Step 1: [Action]
**Directive**: `directives/directive1.md`
**Script**: `execution/script1.py`
**Expected Output**: [Description]

### Step 2: [Action]
**Directive**: `directives/directive2.md`
**Script**: `execution/script2.py`
**Expected Output**: [Description]

## Error Handling
- [Error type] → Use directive: `directives/recovery.md`

## Validation
- [ ] Step 1 completed
- [ ] Step 2 completed
- [ ] CHECKPOINT.md updated
```

### Step 4: Test Activation

Create test queries:
```
"Help me [skill purpose]"
"I need to [skill action]"
"Process [file type mentioned in description]"
```

Verify agent loads and executes the skill.

### Step 5: Document in CHECKPOINT.md

Add to project CHECKPOINT:

```markdown
## Available Skills

- **your-skill-name**: [Brief description]
  - Location: `.claude/skills/your-skill-name/`
  - Directives used: directive1.md, directive2.md
  - Trigger keywords: [keywords]
```
```

### Section 7: Platform-Specific Features

```markdown
## Platform-Specific Extensions

### Claude Code

**Tool Restrictions** (`allowed-tools`):
```yaml
allowed-tools: Read, Grep, Glob  # Comma-separated
# OR
allowed-tools:
  - Read
  - Grep
  - Glob
```

**Forked Context** (`context: fork`):
```yaml
context: fork
agent: general-purpose  # Specify agent type
```

**Hooks** (lifecycle):
```yaml
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/security-check.sh"
          once: true
```

### Kilo.ai

**Mode-Specific Skills**:
```
skills-code/data-processing/     # Used in Code mode
skills-architect/data-processing/ # Used in Architect mode
```

Same skill name, different implementations per mode.

**Metadata Fields**:
```yaml
license: Apache-2.0
compatibility: "VS Code 1.85+"
metadata:
  author: your-org
  version: "1.0.0"
  updated: "2026-01-11"
```

### VS Code Copilot

**Primary Location**: `.github/skills/` (legacy: `.claude/skills/`)

**Integration**: Works across Copilot in VS Code, Copilot CLI, Copilot Coding Agent
```

### Section 8: Best Practices

```markdown
## Best Practices

### DO ✅

1. **Write Specific Descriptions**
   - Include trigger keywords users would say
   - Mention file types, technologies, workflows
   - Use the formula: [What] + [When] + [Keywords]

2. **Keep SKILL.md Concise**
   - Under 500 lines
   - Link to supporting files for details
   - Use progressive disclosure

3. **Reference Directives Explicitly**
   - List all directives used
   - Show execution order
   - Document expected outputs

4. **Handle Errors Gracefully**
   - Reference Error Recovery Protocol from AGENTS.md
   - Provide fallback directives
   - Document common failure modes

5. **Test Activation Thoroughly**
   - Create test queries
   - Verify auto-discovery works
   - Iterate on description based on results

6. **Document in CHECKPOINT.md**
   - List available skills
   - Note trigger keywords
   - Track skill usage

### DON'T ❌

1. **Don't Duplicate Directive Content**
   - Reference directives, don't copy them
   - Keep skills DRY (Don't Repeat Yourself)

2. **Don't Create Mega-Skills**
   - Each skill should have single responsibility
   - Compose multiple focused skills instead

3. **Don't Skip Error Handling**
   - Every workflow needs error recovery
   - Reference AGENTS.md protocol

4. **Don't Forget Tool Compatibility**
   - Test on target platforms
   - Document platform-specific features

5. **Don't Overload Description**
   - Stay under 1024 chars
   - Focus on most important keywords
```

### Section 9: Integration with Directive System

```markdown
## How Skills Integrate with Directives

### Mental Model

```
Agent Skills = "What workflows are available?"
    ↓ Composes
Directives = "How do I accomplish task X?"
    ↓ Calls
Execution Scripts = "Run deterministic code for X"
```

### Example Integration

**User Request**: "Extract customer data from PDF invoices and update database"

**Flow**:
1. Agent detects keywords: "PDF", "extract", "customer data", "database"
2. Activates skill: `.claude/skills/pdf-data-pipeline/SKILL.md`
3. Skill provides workflow:
   ```
   Step 1: Extract PDF text → directives/extract_pdf_text.md
   Step 2: Parse customer data → directives/parse_customer_data.md
   Step 3: Validate data → directives/validate_data.md
   Step 4: Update database → directives/update_customers_db.md
   ```
4. For each step:
   - Agent reads directive
   - Calls execution script
   - Applies Error Recovery Protocol if needed
   - Updates CHECKPOINT.md
5. Skill completed, results reported

### Skill vs. Directive Decision Matrix

| Use Skill When | Use Directive When |
|---------------|-------------------|
| Multi-step workflow | Single-task procedure |
| Composes multiple tasks | Calls one script |
| Needs auto-discovery | Agent calls explicitly |
| High-level capability | Low-level SOP |
| Reusable across projects | Project-specific task |

### Creating Skills from Existing Directives

If you have directives that naturally group together, create a skill:

```yaml
# Existing directives:
directives/fetch_api_data.md
directives/transform_data.md
directives/validate_data.md
directives/save_to_database.md

# Create skill that composes them:
.claude/skills/api-data-pipeline/SKILL.md
```

This makes the workflow discoverable and reusable.
```

### Section 10: Maintenance and Versioning

```markdown
## Skill Maintenance

### Update Triggers

Update skills when:
- Directives are added/removed
- Execution scripts change
- Workflow patterns evolve
- User queries fail to activate skill
- Error handling improves

### Versioning Strategy

Include version in metadata:

```yaml
---
name: skill-name
description: Skill description
metadata:
  version: "2.1.0"
  updated: "2026-01-11"
  changelog: "Added error recovery for API failures"
---
```

Document changes in skill body:

```markdown
## Version History

### v2.1.0 (2026-01-11)
- Added fallback directive for API rate limits
- Updated description with new keywords
- Fixed error handling for exit code 3

### v2.0.0 (2025-12-15)
- Complete rewrite to use new directive structure
- Breaking: Removed deprecated `old_directive.md` reference
```

### Deprecation Process

When retiring a skill:

1. Update description:
```yaml
description: "[DEPRECATED] Use new-skill-name instead. Removal: v3.0"
```

2. Add notice in body:
```markdown
> **⚠️ DEPRECATED**: Use [new-skill-name](../new-skill-name/SKILL.md) instead.
> This skill will be removed in v3.0 (2026-06-01)
```

3. After deprecation period, remove skill directory
```

---

## 7. Tool-Specific Guidance

### For CLAUDE.md (Claude Code)

Add section:
```markdown
## Using Agent Skills with Claude Code

Skills are automatically discovered in:
- Personal: `~/.claude/skills/`
- Project: `.claude/skills/`

### Skill Activation
Skills activate automatically based on description matching.
Use `/skills` command to see available skills.

### Tool-Restricted Skills
Use `allowed-tools` to restrict operations:
```yaml
allowed-tools: Read, Grep, Glob  # Read-only skill
```

### Forked Context
Run skills in isolated sub-agent:
```yaml
context: fork
agent: general-purpose
```
```

### For KILO.md (Kilo Code)

Add section:
```markdown
## Using Agent Skills with Kilo Code

Skills are automatically discovered in:
- Personal: `~/.kilocode/skills/`
- Project: `.kilocode/skills/`

### Mode-Specific Skills
Create different skill versions per mode:
```
skills-code/data-processing/      # Implementation focus
skills-architect/data-processing/  # Design focus
```

Mode-specific skills override generic ones.

### Reloading Skills
Skills reload when you reload VS Code window:
`Cmd+Shift+P` → "Developer: Reload Window"
```

### For GEMINI.md (Gemini)

Add section:
```markdown
## Using Agent Skills with Gemini

Skills location depends on platform integration.
Typically: `.claude/skills/` or `.github/skills/`

### Search-Enhanced Skills
Leverage Gemini's search capability in skill descriptions:

```yaml
description: Extract data from PDFs using latest Python libraries.
When activated, search for current best practices and library versions.
```

Workflow:
1. Skill activates
2. Search for current tools: "Python PDF extraction 2026"
3. Use directives with researched information
4. Update CHECKPOINT.md with library versions used
```

---

## 8. Example Skills for Directive System

### Example 1: PDF Processing Pipeline

```yaml
---
name: pdf-processing-pipeline
description: Complete PDF processing workflow including extraction, validation,
and storage. Use when processing PDF documents, extracting data from forms,
or when user mentions PDF processing, document extraction, or form data.
---

# PDF Processing Pipeline

## Directives Used
- `directives/extract_pdf_text.md` - Extract text and tables
- `directives/parse_structured_data.md` - Parse into JSON
- `directives/validate_data_format.md` - Validate structure
- `directives/store_data.md` - Save to database or files

## Workflow

### Step 1: Extract Text
**Directive**: `directives/extract_pdf_text.md`
**Script**: `execution/extract_text.py`
**Input**: PDF file path
**Output**: `.tmp/extracted_text.json`

### Step 2: Parse Data
**Directive**: `directives/parse_structured_data.md`
**Script**: `execution/parse_data.py`
**Input**: `.tmp/extracted_text.json`
**Output**: `.tmp/structured_data.json`

### Step 3: Validate
**Directive**: `directives/validate_data_format.md`
**Script**: `execution/validate.py`
**Input**: `.tmp/structured_data.json`
**Output**: Validation report, errors logged

### Step 4: Store
**Directive**: `directives/store_data.md`
**Script**: `execution/store.py`
**Input**: `.tmp/structured_data.json`
**Output**: Database updated, CHECKPOINT.md updated

## Error Handling

**Exit Code 1** (Invalid arguments):
- Check PDF file path exists
- Verify file is valid PDF

**Exit Code 3** (API error):
- May need OCR for image-based PDFs
- Use fallback: `directives/pdf_ocr.md`

**Exit Code 4** (Data processing error):
- Check data format matches expected structure
- Review validation errors
- May need manual correction

## Validation
- [ ] PDF successfully extracted
- [ ] Data parsed into structured format
- [ ] Validation passed
- [ ] Data stored successfully
- [ ] CHECKPOINT.md updated with record count
```

### Example 2: Code Review Workflow

```yaml
---
name: code-review-workflow
description: Comprehensive code review covering security, performance, quality,
and testing. Use when reviewing pull requests, conducting code audits, or when
user mentions code review, PR review, or quality checks.
allowed-tools: Read, Grep, Glob, Bash  # Can read and analyze, can run tests
---

# Code Review Workflow

## Directives Used
- `directives/review_security.md` - Security audit
- `directives/review_performance.md` - Performance analysis
- `directives/review_quality.md` - Code quality checks
- `directives/review_testing.md` - Test coverage review

## Workflow

### Step 1: Security Review
**Directive**: `directives/review_security.md`
**Script**: `execution/security_audit.py`
**Checks**:
- Hardcoded credentials
- SQL injection vulnerabilities
- XSS prevention
- Authentication/authorization

### Step 2: Performance Review
**Directive**: `directives/review_performance.md`
**Script**: `execution/performance_analysis.py`
**Checks**:
- N+1 queries
- Inefficient algorithms
- Caching opportunities
- Database indexes

### Step 3: Quality Review
**Directive**: `directives/review_quality.md`
**Script**: `execution/quality_check.py`
**Checks**:
- Code style consistency
- DRY principle
- SOLID principles
- Documentation completeness

### Step 4: Testing Review
**Directive**: `directives/review_testing.md`
**Script**: `execution/test_coverage.py`
**Checks**:
- Unit test coverage
- Integration tests
- Edge cases
- Mocking patterns

## Output

Review report saved to: `.tmp/code_review_report.md`
Findings logged in: `{project}_bugs.md` (if issues found)

## Validation
- [ ] Security review completed
- [ ] Performance review completed
- [ ] Quality review completed
- [ ] Testing review completed
- [ ] Report generated
- [ ] Critical issues documented
```

---

## 9. Summary

### Key Takeaways

1. **Agent Skills = Layer 0** above directives
   - Compose multiple directives into workflows
   - Auto-discovered by agents
   - Provide high-level capabilities

2. **Integration with Directive System**
   - Skills reference directives, don't duplicate them
   - Directives call execution scripts
   - Error recovery uses AGENTS.md protocol

3. **Progressive Disclosure**
   - Keep SKILL.md concise (<500 lines)
   - Link to supporting files
   - Load details on demand

4. **Platform Compatibility**
   - Core standard: name + description + SKILL.md
   - Platform extensions: allowed-tools, context, metadata
   - Storage locations vary: `.claude/`, `.github/`, `.kilocode/`

5. **Description Quality = Activation Success**
   - Formula: [What] + [When] + [Keywords]
   - Test with realistic user queries
   - Iterate based on activation success

### Implementation Recommendation

1. **Create AGENT_SKILLS.md** with content above
2. **Update AGENTS.md** to mention Layer 0 (Agent Skills)
3. **Add skills section to tool-specific files**:
   - CLAUDE.md: Tool restrictions, forked context
   - KILO.md: Mode-specific skills
   - GEMINI.md: Search-enhanced workflows
4. **Create example skills** in `.claude/skills/`:
   - `pdf-processing-pipeline/`
   - `code-review-workflow/`
   - `data-extraction/`

### Expected Benefits

- ✅ **Discoverability**: Agent finds workflows automatically
- ✅ **Reusability**: Skills work across projects
- ✅ **Composability**: Directives become building blocks
- ✅ **Maintainability**: Update directives, skills adapt
- ✅ **Portability**: Compatible across agent platforms
- ✅ **Efficiency**: Progressive disclosure saves context

---

## 10. Next Steps

### Immediate Actions

1. **Create** `AGENT_SKILLS.md` with sections above
2. **Update** AGENTS.md to reference Layer 0
3. **Create example skill**: `pdf-processing-pipeline/`
4. **Test activation** with realistic queries
5. **Document** in CHECKPOINT.md

### Future Enhancements

1. **Build skill library** for common workflows
2. **Create skill templates** for different patterns
3. **Develop skill testing framework**
4. **Track skill activation metrics**
5. **Share skills** across team/organization

---

**Conclusion**: Agent skills provide a powerful abstraction layer above the directive system, enabling auto-discovery, workflow composition, and cross-platform portability. Implement as Layer 0 to maximize effectiveness.
