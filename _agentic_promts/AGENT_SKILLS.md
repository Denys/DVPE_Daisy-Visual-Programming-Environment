# AGENT SKILLS — Layer 0: Capability Packages

> **Prerequisites**: Read AGENTS.md first. This file explains how agent skills integrate with the 3-layer directive system.

---

## What Are Agent Skills?

Agent Skills are **reusable capability packages** that compose multiple directives into discoverable workflows. They provide a fourth layer (Layer 0) that sits **above** the directive system, enabling auto-discovery and high-level orchestration.

### Architecture

```
Layer 0: Agent Skills        ← NEW - Compose workflows (this file)
    ↓ Uses/Composes
Layer 1: Directives          ← Define procedures (SOPs in directives/)
    ↓ Calls
Layer 2: Orchestration       ← Make decisions (the agent - you)
    ↓ Executes
Layer 3: Execution Scripts   ← Run deterministic code (execution/*.py)
```

### Agent Skills vs. Directives

| Aspect | Agent Skills | Directives |
|--------|-------------|------------|
| **Level** | High-level capabilities | Low-level procedures |
| **Scope** | Multi-step workflows | Single-task SOPs |
| **Composition** | Uses multiple directives | Calls one script |
| **Activation** | Auto-discovered by agent | Called by orchestration |
| **Content** | "How to achieve goal X" | "How to run script Y" |
| **Example** | "PDF Processing Pipeline" | `directives/extract_pdf_text.md` |

**Key Distinction**:
- **Agent Skills** = "I can process PDFs" (composes multiple directives)
- **Directives** = "Here's how to extract text from a PDF" (calls one script)

---

## Skill Definition Format

Every skill is a folder containing a `SKILL.md` file with YAML frontmatter + Markdown body.

### Directory Structure

```
.claude/skills/              # Claude Code (or .github/skills/, .kilocode/skills/)
├── pdf-processing/
│   ├── SKILL.md             # Required: Skill definition
│   ├── GUIDE.md             # Optional: Detailed workflow documentation
│   └── EXAMPLES.md          # Optional: Usage examples
│
├── data-extraction/
│   └── SKILL.md
│
└── code-review/
    ├── SKILL.md
    ├── SECURITY.md          # Optional: Supporting documentation
    └── PERFORMANCE.md
```

### SKILL.md Template

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
**Input**: [What it needs]
**Output**: [What it produces]

### Step 2: [Action]
**Directive**: `directives/directive2.md`
**Script**: `execution/script2.py`
**Input**: [Previous output]
**Output**: [What it produces]

### Step 3: [Action]
**Directive**: `directives/directive3.md`
**Script**: `execution/script3.py`
**Input**: [Previous output]
**Output**: [Final result]

## Error Handling
Refer to Error Recovery Protocol in AGENTS.md.

Specific error patterns:
- **Exit Code 3** (API error) → Use fallback directive: `directives/fallback.md`
- **Exit Code 4** (Data error) → Validate input format

## Validation
**Success Criteria**:
- [ ] All steps completed successfully
- [ ] CHECKPOINT.md updated with results
- [ ] No errors in execution logs
- [ ] Output files created in expected locations

## Resources
- [Detailed Guide](./GUIDE.md) - For complex workflows
- [Examples](./EXAMPLES.md) - Usage patterns
```

### Required Fields

| Field | Constraints | Purpose |
|-------|-------------|---------|
| `name` | Lowercase, hyphens/numbers only, max 64 chars, must match directory name | Skill identifier |
| `description` | Max 1024 chars | Triggers auto-discovery (CRITICAL for activation) |

### Optional Fields (Platform-Specific)

| Field | Platform | Purpose |
|-------|----------|---------|
| `allowed-tools` | Claude Code | Restrict tools for security (e.g., `Read, Grep, Glob`) |
| `context: fork` | Claude Code | Run in isolated sub-agent |
| `agent` | Claude Code | Agent type when forked (e.g., `general-purpose`) |
| `hooks` | Claude Code | Lifecycle hooks (PreToolUse, PostToolUse, Stop) |
| `model` | Claude Code | Specific Claude model to use |
| `user-invocable` | Claude Code | Show in slash command menu (default: true) |
| `license` | Kilo.ai | License identifier (e.g., `Apache-2.0`) |
| `compatibility` | Kilo.ai | Environment requirements |
| `metadata` | Kilo.ai | Custom key-value pairs (author, version, etc.) |

---

## Progressive Disclosure

Agent skills use **3-tier loading** to keep context efficient:

### Tier 1: Discovery (~50 tokens)
- Agent loads only `name` and `description`
- Determines relevance to user request
- **Low overhead** - can have many skills installed

### Tier 2: Activation (~2-5K tokens)
- When request matches description
- Loads full `SKILL.md` body
- Reveals directives and workflow

### Tier 3: Execution (on-demand)
- Supporting files load only when referenced
- Directives load when agent needs details
- Execution scripts run without loading into context

**Best Practice**: Keep SKILL.md under 500 lines. Link to supporting files for detailed documentation.

---

## Skill Activation

### Description Quality is Critical

The `description` field determines activation. Use this formula:

**Formula**: `[What it does] + [When to use] + [Trigger keywords]`

### Good Example

```yaml
description: |
  Extract structured data from PDF documents including invoices, forms, and reports.
  Use when processing PDFs, extracting tables, filling forms, or when user mentions
  PDF data extraction, invoice processing, form filling, or document parsing.
```

**Why it works**:
- ✅ Explains what: "Extract structured data from PDF documents"
- ✅ Lists capabilities: "invoices, forms, reports"
- ✅ Specifies when: "Use when processing PDFs, extracting tables, filling forms"
- ✅ Includes trigger keywords: "PDF", "invoice", "form", "extraction", "parsing"

### Bad Example

```yaml
description: PDF handling
```

**Why it fails**:
- ❌ Too vague: "PDF handling" could mean anything
- ❌ No trigger keywords: Agent won't know when to activate
- ❌ No use cases: Unclear when this applies

### Testing Activation

Create test queries that should trigger your skill:

```
✓ "Help me extract data from PDF invoices"
✓ "I need to process customer PDF forms"
✓ "Extract tables from this PDF report"
✓ "Fill out this PDF form with customer data"
```

If skill doesn't activate:
1. Add more trigger keywords to description
2. Mention file types/technologies explicitly
3. Include common user phrasing
4. Test with different variations

---

## Skill Composition Patterns

### Pattern 1: Sequential Workflow

Directives executed in order:

```yaml
---
name: data-pipeline
description: ETL pipeline for processing CSV data and updating database. Use when
extracting, transforming, and loading data, or when user mentions ETL, data pipeline,
CSV processing, or database updates.
---

# Data Pipeline Skill

## Directives Used
- `directives/extract_csv_data.md`
- `directives/transform_data.md`
- `directives/validate_data.md`
- `directives/update_database.md`

## Workflow

### Step 1: Extract
**Directive**: `directives/extract_csv_data.md`
**Script**: `execution/extract_csv.py`
**Input**: CSV file path
**Output**: `.tmp/raw_data.json`

### Step 2: Transform
**Directive**: `directives/transform_data.md`
**Script**: `execution/transform.py`
**Input**: `.tmp/raw_data.json`
**Output**: `.tmp/clean_data.json`

### Step 3: Validate
**Directive**: `directives/validate_data.md`
**Script**: `execution/validate.py`
**Input**: `.tmp/clean_data.json`
**Output**: Validation report

### Step 4: Load
**Directive**: `directives/update_database.md`
**Script**: `execution/update_db.py`
**Input**: `.tmp/clean_data.json`
**Output**: Database updated, CHECKPOINT.md updated with record count
```

### Pattern 2: Conditional Workflow

Directives selected based on conditions:

```yaml
---
name: document-processing
description: Process documents in various formats including PDF, Word, and Excel.
Use when processing documents, extracting data from files, or when user mentions
document processing, file conversion, or multi-format handling.
---

# Document Processing Skill

## Directives Used
- `directives/process_pdf.md` (for PDF files)
- `directives/process_word.md` (for DOCX files)
- `directives/process_excel.md` (for XLSX files)

## Workflow

### Step 1: Detect Format
Check file extension to determine document type.

### Step 2: Route to Directive
- **If PDF** → Use `directives/process_pdf.md`
- **If DOCX** → Use `directives/process_word.md`
- **If XLSX** → Use `directives/process_excel.md`
- **If unknown** → Ask user or attempt auto-detection

### Step 3: Extract Data
Chosen directive calls appropriate execution script.

### Step 4: Standardize Output
Convert to common format (JSON) for further processing.
```

### Pattern 3: Error-Resilient Workflow

Built-in error recovery:

```yaml
---
name: web-scraping
description: Scrape website data with retry logic and error handling. Use when
scraping websites, extracting web data, or when user mentions web scraping,
data collection, or website extraction.
---

# Web Scraping Skill

## Directives Used
- `directives/scrape_website.md` (primary method)
- `directives/scrape_with_delay.md` (rate limit fallback)
- `directives/scrape_with_ocr.md` (image-based text fallback)
- `directives/validate_scraped_data.md` (validation)

## Workflow

### Step 1: Scrape
**Directive**: `directives/scrape_website.md`
**Script**: `execution/scrape.py`
**Input**: Website URL
**Output**: `.tmp/scraped_data.json`

**Error Handling**:
- **Exit Code 3** (API error/rate limit):
  - Wait 60 seconds
  - Retry once
  - If fails again → Use `directives/scrape_with_delay.md` (adds delay between requests)
- **Exit Code 4** (Parsing error):
  - Check if content is image-based
  - Use `directives/scrape_with_ocr.md` (for image-based text)

### Step 2: Validate
**Directive**: `directives/validate_scraped_data.md`
**Script**: `execution/validate.py`
**Input**: `.tmp/scraped_data.json`
**Output**: Validation report, errors logged to `{project}_bugs.md`

### Step 3: Clean and Store
**Directive**: `directives/clean_data.md`
**Script**: `execution/clean.py`
**Input**: `.tmp/scraped_data.json`
**Output**: `.tmp/clean_data.json`, CHECKPOINT.md updated
```

### Pattern 4: Tool-Restricted (Claude Code)

Safety-first workflows:

```yaml
---
name: code-audit
description: Audit code without making changes (read-only analysis). Use when
reviewing code, conducting security audits, or when user mentions code review,
audit, or analysis without modification.
allowed-tools: Read, Grep, Glob
---

# Code Audit Skill

**Tool Restriction**: Read-only operations (Read, Grep, Glob)

## Available Directives
- `directives/analyze_security.md` (read-only security audit)
- `directives/check_code_quality.md` (read-only quality checks)
- `directives/find_performance_issues.md` (read-only performance analysis)
- `directives/review_test_coverage.md` (read-only test review)

**Cannot Use**:
- `directives/auto_fix_issues.md` (requires Edit/Write)
- `directives/refactor_code.md` (requires Edit/Write)

## Workflow

### Step 1: Security Audit
**Directive**: `directives/analyze_security.md`
**Output**: Security findings report

### Step 2: Quality Check
**Directive**: `directives/check_code_quality.md`
**Output**: Code quality metrics

### Step 3: Performance Analysis
**Directive**: `directives/find_performance_issues.md`
**Output**: Performance bottlenecks identified

### Step 4: Test Coverage
**Directive**: `directives/review_test_coverage.md`
**Output**: Coverage report

## Output
All findings saved to: `.tmp/audit_report.md`
Critical issues logged to: `{project}_bugs.md`
```

### Pattern 5: Mode-Specific (Kilo.ai)

Different implementations per mode:

**In skills-code/database-design/SKILL.md**:
```yaml
---
name: database-design
description: Database implementation and query optimization for code mode
---

# Database Design (Code Mode)

**Focus**: Implementation and optimization

## Directives Used
- `directives/write_efficient_queries.md`
- `directives/implement_indexes.md`
- `directives/setup_migrations.md`
- `directives/write_orm_models.md`
```

**In skills-architect/database-design/SKILL.md**:
```yaml
---
name: database-design
description: Database architecture and system design patterns for architect mode
---

# Database Design (Architect Mode)

**Focus**: System design and scalability

## Directives Used
- `directives/design_database_schema.md`
- `directives/choose_scaling_strategy.md`
- `directives/plan_sharding_approach.md`
- `directives/design_replication_topology.md`
```

---

## Creating Your First Skill

### Step 1: Identify the Capability

Ask:
- What workflow do I repeat often?
- What involves multiple directives?
- What would benefit from auto-discovery?
- What task takes multiple steps?

### Step 2: Choose Location

**Project-specific** (team shares):
```bash
mkdir -p .claude/skills/your-skill-name
mkdir -p .github/skills/your-skill-name  # For Copilot compatibility
mkdir -p .kilocode/skills/your-skill-name  # For Kilo.ai
```

**Personal** (just for you):
```bash
mkdir -p ~/.claude/skills/your-skill-name    # Claude Code
mkdir -p ~/.github/skills/your-skill-name    # VS Code Copilot
mkdir -p ~/.kilocode/skills/your-skill-name  # Kilo.ai
```

### Step 3: List Relevant Directives

Identify which directives your skill will compose:

```bash
# Search for related directives
ls directives/ | grep -i keyword

# Or use Grep tool
Grep(pattern="keyword", path="directives", output_mode="files_with_matches")
```

### Step 4: Create SKILL.md

```yaml
---
name: your-skill-name
description: |
  [What it does in one sentence].
  Use when [trigger conditions]. Mentions [keywords user would say].
  Directives used: directive1.md, directive2.md, directive3.md
---

# Your Skill Name

## Overview
Brief description of what this skill accomplishes.

## Directives Used
- `directives/directive1.md` - Purpose and output
- `directives/directive2.md` - Purpose and output
- `directives/directive3.md` - Purpose and output

## Workflow

### Step 1: [Action Name]
**Directive**: `directives/directive1.md`
**Script**: `execution/script1.py`
**Input**: [What it needs]
**Output**: [What it produces]

### Step 2: [Action Name]
**Directive**: `directives/directive2.md`
**Script**: `execution/script2.py`
**Input**: [Previous step output]
**Output**: [What it produces]

### Step 3: [Action Name]
**Directive**: `directives/directive3.md`
**Script**: `execution/script3.py`
**Input**: [Previous step output]
**Output**: [Final result]

## Error Handling
Refer to Error Recovery Protocol in AGENTS.md for standard patterns.

**Specific to this skill**:
- **[Error Type]** → Use fallback directive: `directives/fallback.md`
- **[Error Type]** → Retry with different parameters

## Validation
**Success Criteria**:
- [ ] Step 1 completed successfully
- [ ] Step 2 completed successfully
- [ ] Step 3 completed successfully
- [ ] Output files created
- [ ] CHECKPOINT.md updated

## Resources
- [Detailed Guide](./GUIDE.md) - For complex scenarios
- [Examples](./EXAMPLES.md) - Usage patterns and tips
```

### Step 5: Test Activation

Create test queries that should trigger your skill:

```
Test Query 1: "Help me [skill purpose]"
Test Query 2: "I need to [skill action]"
Test Query 3: "Process [file type mentioned in description]"
```

Verify:
1. Agent loads the skill when query matches description
2. Agent follows the workflow steps in order
3. Directives are called correctly
4. Error handling works as expected

### Step 6: Document in CHECKPOINT.md

Add to project CHECKPOINT.md:

```markdown
## Available Skills

### your-skill-name
- **Description**: [Brief capability statement]
- **Location**: `.claude/skills/your-skill-name/`
- **Directives Used**: directive1.md, directive2.md, directive3.md
- **Trigger Keywords**: keyword1, keyword2, keyword3
- **Created**: YYYY-MM-DD
```

---

## Platform-Specific Features

### Claude Code

#### Tool Restrictions (`allowed-tools`)

Limit which tools the agent can use:

**Comma-separated**:
```yaml
allowed-tools: Read, Grep, Glob
```

**YAML list**:
```yaml
allowed-tools:
  - Read
  - Grep
  - Glob
```

**Use cases**:
- Read-only skills (auditing, analysis)
- Security-sensitive operations
- Preventing accidental modifications

#### Forked Context (`context: fork`)

Run skill in isolated sub-agent:

```yaml
---
name: complex-analysis
description: Run complex codebase analysis in isolated context
context: fork
agent: general-purpose
---
```

**Benefits**:
- Separate context from main conversation
- Can use different agent type
- Isolates tool usage

#### Hooks (Lifecycle)

Run commands at specific lifecycle points:

```yaml
---
name: secure-operations
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/security-check.sh $TOOL_INPUT"
          once: true
---
```

**Hook types**:
- `PreToolUse`: Before tool execution
- `PostToolUse`: After tool execution
- `Stop`: When skill exits

### Kilo.ai

#### Mode-Specific Skills

Create different implementations per mode:

```
.kilocode/skills/              # Generic skills
.kilocode/skills-code/         # Code mode overrides
.kilocode/skills-architect/    # Architect mode overrides
```

**Example**:
```
skills-code/database-design/       # Implementation focus
skills-architect/database-design/  # Design focus
```

Same skill name, different content per mode. Mode-specific skills override generic ones.

#### Metadata Fields

Additional frontmatter:

```yaml
---
name: skill-name
description: Skill description
license: Apache-2.0
compatibility: "VS Code 1.85+"
metadata:
  author: your-org
  version: "1.0.0"
  updated: "2026-01-11"
  changelog: "Added error recovery"
---
```

#### Reloading Skills

Skills reload when you reload VS Code window:
- `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)
- Type: "Developer: Reload Window"

### VS Code Copilot

#### Primary Location

`.github/skills/` (legacy: `.claude/skills/`)

#### Integration

Works across:
- **GitHub Copilot in VS Code** (chat and agent mode)
- **GitHub Copilot CLI** (terminal workflows)
- **GitHub Copilot Coding Agent** (automated tasks)

### Gemini

#### Search-Enhanced Skills

Leverage Gemini's search capability:

```yaml
---
name: current-best-practices
description: Implement features using latest best practices. When activated,
search for current documentation and library versions before executing directives.
---

# Current Best Practices Skill

## Workflow

### Step 1: Research (Gemini-specific)
**Search**: "[Technology] best practices 2026"
**Search**: "[Library] latest version documentation"

### Step 2: Create Directive (with current info)
Use searched information to inform directive selection.

### Step 3: Execute
Use directives with researched, current best practices.

### Step 4: Update CHECKPOINT.md
Note library versions and sources used.
```

---

## Integration with Directive System

### Flow Diagram

```
User Request: "Extract customer data from PDF invoices"
    ↓
Agent detects keywords: "PDF", "extract", "customer data", "invoice"
    ↓
Activates Skill: .claude/skills/pdf-invoice-extraction/SKILL.md
    ↓
Skill provides workflow:
    Step 1: Extract PDF text → directives/extract_pdf_text.md
    Step 2: Parse invoice data → directives/parse_invoice_data.md
    Step 3: Extract customer info → directives/extract_customer_info.md
    Step 4: Validate data → directives/validate_data.md
    Step 5: Store results → directives/store_customer_data.md
    ↓
For each directive:
    Agent reads directive → calls execution script → handles errors
    ↓
    CHECKPOINT.md updated after each step
    ↓
Skill completed, all results reported
```

### Skill vs. Directive Decision Matrix

| Use Agent Skill When | Use Directive When |
|---------------------|-------------------|
| Multi-step workflow | Single-task procedure |
| Composes multiple tasks | Calls one script |
| Needs auto-discovery | Called explicitly by agent |
| High-level capability | Low-level SOP |
| Reusable across projects | Project-specific task |
| 3+ directives involved | 1-2 directives max |

### Creating Skills from Existing Directives

If you have directives that naturally group together:

**Existing directives**:
```
directives/fetch_api_data.md
directives/transform_api_response.md
directives/validate_api_data.md
directives/save_to_database.md
```

**Create skill that composes them**:
```
.claude/skills/api-data-pipeline/SKILL.md
```

This makes the workflow:
- ✅ Discoverable (agent finds it automatically)
- ✅ Reusable (use across multiple projects)
- ✅ Documented (clear workflow steps)
- ✅ Maintainable (update directives, skill adapts)

---

## Best Practices

### DO ✅

1. **Write Specific Descriptions**
   - Include trigger keywords users would naturally say
   - Mention file types, technologies, workflows
   - Use the formula: [What] + [When] + [Keywords]

2. **Keep SKILL.md Concise**
   - Under 500 lines
   - Link to supporting files for extensive details
   - Use progressive disclosure pattern

3. **Reference Directives Explicitly**
   - List all directives used at the top
   - Show execution order clearly
   - Document expected outputs for each step

4. **Handle Errors Gracefully**
   - Reference Error Recovery Protocol from AGENTS.md
   - Provide fallback directives for common failures
   - Document specific error patterns for this skill

5. **Test Activation Thoroughly**
   - Create realistic test queries
   - Verify auto-discovery works
   - Iterate on description based on activation success

6. **Document in CHECKPOINT.md**
   - List all available skills
   - Note trigger keywords
   - Track skill usage and effectiveness

7. **Use Platform Features Appropriately**
   - `allowed-tools` for security-sensitive skills
   - `context: fork` for isolated operations
   - Mode-specific skills for different contexts

### DON'T ❌

1. **Don't Duplicate Directive Content**
   - Reference directives, don't copy them into skill
   - Keep skills DRY (Don't Repeat Yourself)
   - Update directives, not skills, for procedure changes

2. **Don't Create Mega-Skills**
   - Each skill should have single responsibility
   - Compose multiple focused skills instead of one large one
   - 5-7 directives max per skill

3. **Don't Skip Error Handling**
   - Every workflow needs error recovery
   - Reference AGENTS.md Error Recovery Protocol
   - Document skill-specific error patterns

4. **Don't Forget Tool Compatibility**
   - Test on all target platforms
   - Document platform-specific features clearly
   - Maintain portable core (name + description)

5. **Don't Overload Description**
   - Stay under 1024 chars
   - Focus on most important keywords
   - Be specific, not exhaustive

6. **Don't Forget Progressive Disclosure**
   - Keep main SKILL.md concise
   - Link to supporting files for details
   - Don't embed large content

---

## Maintenance and Versioning

### Update Triggers

Update skills when:
- Directives are added, removed, or renamed
- Execution scripts change significantly
- Workflow patterns evolve
- User queries fail to activate skill
- Error handling improves
- Platform features change

### Versioning Strategy

Include version in metadata:

```yaml
---
name: skill-name
description: Skill description
metadata:
  version: "2.1.0"
  updated: "2026-01-11"
  changelog: "Added error recovery for API rate limits"
---
```

Document changes in skill body:

```markdown
## Version History

### v2.1.0 (2026-01-11)
- Added fallback directive for API rate limit errors
- Updated description with new trigger keywords
- Fixed error handling for exit code 3
- Tested with 10 user queries, 100% activation rate

### v2.0.0 (2025-12-15)
- Complete rewrite to use new directive structure
- Breaking: Removed deprecated `old_directive.md` reference
- Added 2 new directives for data validation
- Updated CHECKPOINT.md format
```

### Deprecation Process

When retiring a skill:

**1. Update description**:
```yaml
description: "[DEPRECATED] Use new-skill-name instead. This skill will be removed in v3.0 (2026-06-01)."
```

**2. Add notice in body**:
```markdown
> **⚠️ DEPRECATED**
>
> This skill is deprecated and will be removed in version 3.0 (estimated: 2026-06-01).
>
> **Use instead**: [new-skill-name](../new-skill-name/SKILL.md)
>
> **Migration guide**: See [MIGRATION.md](./MIGRATION.md) for upgrade steps.
```

**3. Wait for deprecation period** (typically 3-6 months)

**4. Remove skill directory** after deprecation period expires

---

## Example Skills

### Example 1: PDF Processing Pipeline

**File**: `.claude/skills/pdf-processing-pipeline/SKILL.md`

```yaml
---
name: pdf-processing-pipeline
description: |
  Complete PDF processing workflow including text extraction, data parsing,
  validation, and storage. Use when processing PDF documents, extracting data
  from forms, parsing invoices, or when user mentions PDF processing, document
  extraction, form data, or invoice data.
---

# PDF Processing Pipeline

## Overview
End-to-end pipeline for extracting structured data from PDF documents and storing it.

## Directives Used
- `directives/extract_pdf_text.md` - Extract text and tables from PDF
- `directives/parse_structured_data.md` - Parse extracted text into JSON
- `directives/validate_data_format.md` - Validate data structure and content
- `directives/store_data.md` - Save to database or files

## Workflow

### Step 1: Extract Text
**Directive**: `directives/extract_pdf_text.md`
**Script**: `execution/extract_text.py`
**Input**: PDF file path (required argument)
**Output**: `.tmp/extracted_text.json` (text, tables, metadata)

**Command**:
```bash
python execution/extract_text.py --pdf path/to/file.pdf --output .tmp/extracted_text.json
```

### Step 2: Parse Data
**Directive**: `directives/parse_structured_data.md`
**Script**: `execution/parse_data.py`
**Input**: `.tmp/extracted_text.json`
**Output**: `.tmp/structured_data.json` (parsed fields, entities)

**Command**:
```bash
python execution/parse_data.py --input .tmp/extracted_text.json --output .tmp/structured_data.json
```

### Step 3: Validate
**Directive**: `directives/validate_data_format.md`
**Script**: `execution/validate.py`
**Input**: `.tmp/structured_data.json`
**Output**: Validation report, errors logged to `{project}_bugs.md` if validation fails

**Command**:
```bash
python execution/validate.py --input .tmp/structured_data.json --schema schemas/data_schema.json
```

### Step 4: Store
**Directive**: `directives/store_data.md`
**Script**: `execution/store.py`
**Input**: `.tmp/structured_data.json` (validated data)
**Output**: Database updated, CHECKPOINT.md updated with record count

**Command**:
```bash
python execution/store.py --input .tmp/structured_data.json --db-table customers
```

## Error Handling

Refer to AGENTS.md Error Recovery Protocol for standard patterns.

**Skill-Specific Errors**:

**Exit Code 1** (Invalid arguments):
- Check PDF file path exists
- Verify file is actually a PDF
- Ensure output directory `.tmp/` exists

**Exit Code 3** (API error or processing failure):
- PDF may be image-based (requires OCR)
- Use fallback: `directives/pdf_ocr.md`
- Check PDF isn't password-protected

**Exit Code 4** (Data processing error):
- Data format doesn't match expected structure
- Review validation errors in output
- May need manual data correction or schema update

**Exit Code 5** (File I/O error):
- Check disk space
- Verify write permissions for `.tmp/` directory
- Ensure PDF isn't locked by another process

## Validation

**Success Criteria**:
- [ ] PDF successfully extracted to `.tmp/extracted_text.json`
- [ ] Data parsed into structured format at `.tmp/structured_data.json`
- [ ] Validation passed (no errors in validation report)
- [ ] Data stored successfully in database
- [ ] CHECKPOINT.md updated with record count and timestamp

**Quick Check**:
```bash
# Verify all output files exist
ls -lh .tmp/extracted_text.json .tmp/structured_data.json

# Check CHECKPOINT.md was updated
grep "PDF Processing" CHECKPOINT.md
```

## Resources
- [PDF Extraction Guide](./PDF_EXTRACTION.md) - Detailed OCR setup
- [Schema Examples](./SCHEMAS.md) - Common data schemas
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues and fixes
```

### Example 2: Code Review Workflow

**File**: `.claude/skills/code-review-workflow/SKILL.md`

```yaml
---
name: code-review-workflow
description: |
  Comprehensive code review covering security vulnerabilities, performance issues,
  code quality, and test coverage. Use when reviewing pull requests, conducting
  code audits, security reviews, or when user mentions code review, PR review,
  security audit, or quality checks.
allowed-tools: Read, Grep, Glob, Bash  # Can read, analyze, run tests; cannot modify
---

# Code Review Workflow

## Overview
Multi-phase code review process covering security, performance, quality, and testing.

**Tool Restriction**: Read-only + test execution (Read, Grep, Glob, Bash for tests)

## Directives Used
- `directives/review_security.md` - Security vulnerability audit
- `directives/review_performance.md` - Performance analysis and bottlenecks
- `directives/review_quality.md` - Code quality and best practices
- `directives/review_testing.md` - Test coverage and quality review

## Workflow

### Step 1: Security Review
**Directive**: `directives/review_security.md`
**Script**: `execution/security_audit.py`
**Input**: Code directory or git diff
**Output**: `.tmp/security_report.md`

**Checks**:
- Hardcoded credentials or API keys
- SQL injection vulnerabilities
- XSS (Cross-Site Scripting) prevention
- Authentication/authorization issues
- Input validation gaps
- Dependency vulnerabilities

**Command**:
```bash
python execution/security_audit.py --path src/ --output .tmp/security_report.md
```

### Step 2: Performance Review
**Directive**: `directives/review_performance.md`
**Script**: `execution/performance_analysis.py`
**Input**: Code directory
**Output**: `.tmp/performance_report.md`

**Checks**:
- N+1 database query problems
- Inefficient algorithms (O(n²) where O(n) possible)
- Missing caching opportunities
- Database index requirements
- Memory leaks or excessive allocations

**Command**:
```bash
python execution/performance_analysis.py --path src/ --output .tmp/performance_report.md
```

### Step 3: Quality Review
**Directive**: `directives/review_quality.md`
**Script**: `execution/quality_check.py`
**Input**: Code directory
**Output**: `.tmp/quality_report.md`

**Checks**:
- Code style consistency
- DRY (Don't Repeat Yourself) principle violations
- SOLID principles adherence
- Documentation completeness
- Naming conventions
- Code duplication

**Command**:
```bash
python execution/quality_check.py --path src/ --output .tmp/quality_report.md
```

### Step 4: Testing Review
**Directive**: `directives/review_testing.md`
**Script**: `execution/test_coverage.py`
**Input**: Code directory + test directory
**Output**: `.tmp/test_report.md`

**Checks**:
- Unit test coverage percentage
- Integration test presence
- Edge case coverage
- Test quality (mocking, assertions)
- Test maintainability

**Command**:
```bash
python execution/test_coverage.py --path src/ --tests tests/ --output .tmp/test_report.md
```

## Output

**Consolidated Report**: `.tmp/code_review_report.md`
- Combines all 4 review phases
- Prioritizes findings (Critical, High, Medium, Low)
- Actionable recommendations

**Bug Logging**: Critical issues logged to `{project}_bugs.md`

## Error Handling

**Exit Code 3** (Analysis tool failure):
- Install missing analysis dependencies
- Check code compiles/runs successfully
- Try running security/quality tools manually

**Exit Code 4** (Report generation error):
- Check `.tmp/` directory exists and is writable
- Verify all input files are accessible
- Review error logs for specific failures

## Priority Levels

- **Critical**: Security vulnerabilities, data loss risks (block merge)
- **High**: Performance issues, broken functionality (address before merge)
- **Medium**: Code quality, maintainability (address in follow-up)
- **Low**: Style preferences, minor optimizations (optional)

## Approval Criteria

Approve when:
- [ ] No critical priority issues remain
- [ ] All high priority issues addressed or documented
- [ ] All tests pass
- [ ] Code coverage meets project threshold (typically 80%+)
- [ ] Documentation updated
- [ ] Changes align with project coding standards

## Validation

**Success Criteria**:
- [ ] Security review completed (`.tmp/security_report.md` exists)
- [ ] Performance review completed (`.tmp/performance_report.md` exists)
- [ ] Quality review completed (`.tmp/quality_report.md` exists)
- [ ] Testing review completed (`.tmp/test_report.md` exists)
- [ ] Consolidated report generated (`.tmp/code_review_report.md`)
- [ ] Critical issues (if any) logged to `{project}_bugs.md`

## Resources
- [Security Review Guide](./SECURITY.md) - Detailed security patterns
- [Performance Patterns](./PERFORMANCE.md) - Common optimizations
- [Quality Checklist](./QUALITY.md) - Code quality standards
- [Testing Guide](./TESTING.md) - Test best practices
```

---

## Summary

### Key Takeaways

1. **Agent Skills = Layer 0** above directives
   - Compose multiple directives into workflows
   - Auto-discovered by agents based on description
   - Provide high-level, reusable capabilities

2. **Integration with Directive System**
   - Skills reference directives (don't duplicate content)
   - Directives call execution scripts
   - Error recovery uses AGENTS.md protocol
   - All state updates go to CHECKPOINT.md

3. **Progressive Disclosure Keeps Context Efficient**
   - Discovery: Load metadata only (~50 tokens)
   - Activation: Load SKILL.md when matched (~2-5K tokens)
   - Execution: Load supporting files on demand

4. **Platform Compatibility**
   - Core standard: `name` + `description` + `SKILL.md`
   - Platform extensions: `allowed-tools`, `context`, `metadata`
   - Storage locations vary: `.claude/`, `.github/`, `.kilocode/`

5. **Description Quality = Activation Success**
   - Formula: [What] + [When] + [Keywords]
   - Test with realistic user queries
   - Iterate based on activation success rate

### Implementation Checklist

For your project:
- [ ] Create `.claude/skills/` directory (and `.github/skills/`, `.kilocode/skills/` if needed)
- [ ] Identify workflows that use multiple directives
- [ ] Create first skill using template above
- [ ] Test activation with realistic queries
- [ ] Document skill in CHECKPOINT.md
- [ ] Update AGENTS.md to reference Layer 0
- [ ] Add skills section to tool-specific files (CLAUDE.md, KILO.md, etc.)

### Expected Benefits

- ✅ **Discoverability**: Agent finds workflows automatically (no manual selection)
- ✅ **Reusability**: Skills work across projects with shared directives
- ✅ **Composability**: Directives become reusable building blocks
- ✅ **Maintainability**: Update directives independently, skills adapt
- ✅ **Portability**: Compatible across agent platforms (Claude, Copilot, Kilo, etc.)
- ✅ **Efficiency**: Progressive disclosure minimizes context usage

---

**Next**: Read your tool-specific file (CLAUDE.md, KILO.md, GEMINI.md, or OPENCODE.md) for platform-specific skill features and optimizations.
