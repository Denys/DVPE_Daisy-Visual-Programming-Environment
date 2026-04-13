# Agent Skills Research: Comprehensive Analysis

**Research Date**: 2026-01-11
**Sources Analyzed**: agentskills.io, Claude Code, VS Code Copilot, Kilo.ai

---

## Executive Summary

Agent Skills represent an open standard for extending AI agent capabilities through structured packages of instructions, scripts, and resources. Originally developed by Anthropic and released as an open specification, Agent Skills have been adopted across multiple platforms including Claude Code, GitHub Copilot, VS Code, and Kilo.ai. The format uses YAML frontmatter in SKILL.md files combined with Markdown instructions, enabling portable, reusable agent capabilities that work across compatible platforms.

---

## 1. Source-Specific Analysis

### 1.1 AgentSkills.io (Open Standard)

#### What Are Agent Skills?

"Folders of instructions, scripts, and resources that agents can discover and use to do things more accurately and efficiently."

Agent Skills address a fundamental limitation: agents often lack contextual knowledge needed for reliable real-world work. Skills bridge this gap by providing procedural knowledge and organization-specific information on demand.

#### Value Proposition by Stakeholder

- **Skill Authors**: Build capabilities once, deploy across multiple compatible agent platforms
- **Agents**: Load skills dynamically based on task requirements, extending functionality contextually
- **Organizations**: Capture institutional knowledge in version-controlled, portable packages

#### Capability Categories

1. **Domain Expertise** - Specialized instructions (legal review processes, data analysis workflows)
2. **New Capabilities** - Features like presentation creation, MCP server building, dataset analysis
3. **Repeatable Workflows** - Multi-step tasks rendered consistent and auditable
4. **Interoperability** - Skill reuse across different compatible agent products

#### Format and Structure

- **Primary Format**: SKILL.md files containing complete skill definition
- **Content**: Metadata requirements, implementation details, resource references
- **Validation**: Reference library exists for validating skills and generating prompt XML

#### Origin and Governance

- Originally developed by Anthropic
- Released as an open standard
- Ecosystem includes adoption by multiple AI development tools
- Specification remains open to broader community contributions

#### Integration Approach

Skills support emphasizes **discoverability** - agents detect and load appropriate skills contextually during task execution, enabling dynamic capability extension without requiring pre-configuration or restart sequences.

---

### 1.2 Claude Code (Anthropic)

#### What Are Agent Skills?

Markdown files that teach Claude how to perform specific tasks. They are **model-invoked** - Claude automatically decides which Skills to use based on your request, without requiring explicit command invocation.

#### Skill Definition Format

**Required File**: `SKILL.md` with YAML frontmatter + Markdown instructions

**Minimal Example**:
```yaml
---
name: your-skill-name
description: Brief description of what this Skill does and when to use it
---

# Your Skill Name

## Instructions
Provide clear, step-by-step guidance for Claude.

## Examples
Show concrete examples of using this Skill.
```

#### YAML Metadata Fields

| Field | Required | Description | Constraints |
|-------|----------|-------------|-------------|
| `name` | Yes | Skill identifier | Lowercase, hyphens/numbers only, max 64 chars, must match directory name |
| `description` | Yes | What the skill does and when to use it | Max 1024 chars, used for discovery |
| `allowed-tools` | No | Tools Claude can use without permission | Comma-separated or YAML list |
| `model` | No | Specific Claude model to use | e.g., `claude-sonnet-4-20250514` |
| `context` | No | Run in isolated sub-agent context | Set to `fork` for isolation |
| `agent` | No | Agent type when context is forked | e.g., `Explore`, `Plan`, `general-purpose` |
| `hooks` | No | Lifecycle hooks | `PreToolUse`, `PostToolUse`, `Stop` |
| `user-invocable` | No | Slash command menu visibility | Defaults to `true` |

#### Activation & Triggering Mechanisms

**Three-Step Discovery Process**:

1. **Discovery**: Claude loads only name and description at startup (minimal overhead)
2. **Activation**: When request matches description, Claude asks for permission to use Skill
3. **Execution**: Full SKILL.md content loads into context; Claude executes instructions

**Critical: Description Quality**

The `description` field is essential for triggering. It should answer:
1. **What does this do?** - List specific capabilities
2. **When should it be used?** - Include trigger keywords users would mention

**Good Example**:
```yaml
description: Extract text and tables from PDF files, fill forms, merge documents.
Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
```

#### Skill Composition Patterns

**Pattern 1: Single-File Skill**
```
commit-helper/
└── SKILL.md
```

**Pattern 2: Multi-File Skill with Progressive Disclosure**

Keep SKILL.md under 500 lines; link to supporting files:
```
pdf-processing/
├── SKILL.md              # Overview and navigation
├── FORMS.md              # Detailed documentation
├── REFERENCE.md          # API reference
└── scripts/
    ├── fill_form.py      # Utility script (executed, not read)
    └── validate.py       # Helper scripts
```

**SKILL.md references supporting files**:
```markdown
For complete API details, see [reference.md](reference.md)
For usage examples, see [examples.md](examples.md)

Run the validation script:
python scripts/validate_form.py input.pdf
```

**Pattern 3: Tool Restriction Pattern**

Limit Claude to specific tools using `allowed-tools`:

```yaml
---
name: reading-files-safely
description: Read files without making changes. Use when you need read-only file access.
allowed-tools: Read, Grep, Glob
---
```

Or YAML list format:
```yaml
allowed-tools:
  - Read
  - Grep
  - Glob
```

**Pattern 4: Forked Context Pattern**

Run Skills in isolated sub-agent context:

```yaml
---
name: code-analysis
description: Analyze code quality and generate detailed reports
context: fork
agent: general-purpose
---
```

#### Skills Visibility Control

| Setting | Slash Menu | `Skill` Tool | Auto-Discovery | Use Case |
|---------|-----------|-------------|----------------|----------|
| `user-invocable: true` (default) | Visible | Allowed | Yes | Skills for direct user invocation |
| `user-invocable: false` | Hidden | Allowed | Yes | Claude-only Skills |
| `disable-model-invocation: true` | Visible | Blocked | Yes | Manual invocation only |

#### Storage Locations & Hierarchy

| Location | Path | Applies To | Priority |
|----------|------|-----------|----------|
| Enterprise | Managed settings | All users in organization | 1 (highest) |
| Personal | `~/.claude/skills/` | You, across all projects | 2 |
| Project | `.claude/skills/` | Repository team members | 3 |
| Plugin | Bundled with plugin | Plugin users | 4 (lowest) |

*Higher priority overrides lower priority when Skills share same name*

#### Integration with Subagents

Custom subagents can access Skills via `skills` field in `.claude/agents/`:

```yaml
# .claude/agents/code-reviewer.md
---
name: code-reviewer
description: Review code for quality and best practices
skills: pr-review, security-check
---
```

**Note**: Built-in agents (Explore, Plan, general-purpose) don't inherit Skills. Only custom subagents with explicit `skills` field get access.

#### Hook Pattern

Define lifecycle hooks for Skills:

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

#### Distribution Options

- **Project Skills**: Commit `.claude/skills/` to version control
- **Plugins**: Bundle Skills in `skills/` directory within plugin; distribute via marketplace
- **Managed**: Administrators deploy organization-wide through managed settings

#### Best Practices

1. **Write specific descriptions** - Include keywords users would naturally say
2. **Keep SKILL.md concise** - Under 500 lines; use progressive disclosure for details
3. **Use progressive disclosure** - Link to supporting files Claude reads only when needed
4. **Bundle utility scripts** - Scripts execute without loading content into context
5. **Restrict tools appropriately** - Use `allowed-tools` for security-sensitive Skills
6. **Keep references shallow** - Link directly from SKILL.md; avoid deep nesting

#### Key Distinctions

- **Skills vs. Subagents**: Skills add knowledge to current conversation; subagents run in separate context with own tools. Use Skills for guidance/standards; use subagents for isolation.
- **Skills vs. MCP**: Skills tell Claude *how* to use tools; MCP *provides* the tools.
- **Skills vs. Slash Commands**: Skills are auto-invoked by Claude; slash commands require explicit `/command` typing.

---

### 1.3 VS Code Copilot (GitHub/Microsoft)

#### What Are Agent Skills?

"Folders of instructions, scripts, and resources that GitHub Copilot can load when relevant to perform specialized tasks." They function as an open standard working across multiple AI agents beyond just VS Code.

#### Skill Definition Format

**Directory Structure**:
- Project skills: `.github/skills/` (or `.claude/skills/` for legacy support)
- Personal skills: `~/.github/skills/`
- Each skill occupies its own subdirectory

**SKILL.md File Requirements**:

YAML frontmatter with required fields:
- `name`: Lowercase identifier with hyphens (max 64 characters)
- `description`: Explains what the skill does "and when to use it" (max 1024 characters)
- Body: Markdown instructions with procedures, examples, and resource references

Skills can include supplementary files: templates, example scripts, and documentation alongside the primary instruction file.

#### Activation and Triggering Mechanisms

**Three-Level Progressive Disclosure System**:

1. **Discovery Level (~50 tokens)**: Copilot reads skill metadata (`name` and `description`) to determine relevance
2. **Instruction Loading (~2-5K tokens)**: When a request matches a skill's description, the full `SKILL.md` body loads into context
3. **Resource Access**: Additional files load only when Copilot explicitly references them

Critically, "skills are automatically activated based on your prompt—you don't need to manually select them."

#### Skill Composition Patterns

**Example 1: Web Application Testing Skill**

Includes:
- Playwright testing guidance
- Usage conditions
- Step-by-step procedures
- Test template references
- Debugging commands
- Best practices (locator strategies, test independence, Page Object Model patterns)

**Example 2: GitHub Actions Debugging Skill**

Demonstrates:
- Multi-step diagnostic processes
- Tool integration references
- Common issue troubleshooting
- Environment variable handling

Both exemplify combining procedural instructions with actionable workflows.

#### Best Practices Highlighted

- Write "clear, specific instructions" describing capabilities, use cases, procedures, and expected outputs
- Include relative path references to supporting resources
- Review shared skills before adoption for security compliance
- Structure skills for on-demand loading efficiency
- Use glob patterns and standardized naming conventions

#### Integration Patterns

Skills integrate across:
- **GitHub Copilot in VS Code** (chat and agent mode)
- **GitHub Copilot CLI** (terminal workflows)
- **GitHub Copilot Coding Agent** (automated tasks)

The standard enables portability through the open specification at agentskills.io, facilitating community sharing via repositories like github/awesome-copilot and anthropics/skills.

#### Progressive Disclosure Benefits

Progressive disclosure keeps context efficient. This three-level loading system ensures you can install many skills without consuming context. This architecture means skills are automatically activated based on your prompt—you don't need to manually select them.

---

### 1.4 Kilo.ai

#### What Are Agent Skills?

Agent Skills implement an open format for extending AI agent capabilities. They package domain expertise, workflows, and specialized knowledge that agents can access on demand. As stated: "a folder containing a `SKILL.md` file with metadata and instructions that tell an agent how to perform a specific task."

#### Skill Definition Format

**Standardized structure** with YAML frontmatter and Markdown content:

**Required frontmatter fields**:
- `name`: Max 64 characters (lowercase, numbers, hyphens only)
- `description`: Max 1024 characters explaining purpose and use cases

**Optional fields**:
- `license`: License reference
- `compatibility`: Environment requirements
- `metadata`: Custom key-value pairs

**Critical Requirement**: The "name field **must match** the parent directory name" for proper functioning.

#### Skill Activation Mechanisms

Skills are discovered at two critical points:
1. When VS Code starts
2. When reloading the window (`Cmd+Shift+P` → "Developer: Reload Window")

**Priority Hierarchy**:
- Project-level skills override global skills
- **Mode-specific skills override generic ones**

#### Skill Locations and Organization

**Global skills**: `~/.kilocode/skills/`
**Project skills**: `.kilocode/skills/` (within projects)
**Mode-specific patterns**: `skills-{mode-slug}/` (e.g., `skills-code/`, `skills-architect/`)

**Key Feature: Mode-Specific Override**

A skill in `skills-code/` overrides the same skill in `skills/` when in Code mode. This allows different versions of the same skill for different modes (Code mode, Architect mode, etc.), with mode-specific skills taking precedence over generic ones.

#### Optional Bundled Resources

Skills can include supplementary directories:
- `scripts/`: Executable code
- `references/`: Documentation
- `assets/`: Templates and resources

#### Integration Patterns

The workflow involves:
1. Discovery
2. Activation in relevant modes
3. Execution by AI agents following skill instructions

Skills work across any platform implementing the Agent Skills specification, supporting interoperability across different AI agents.

---

## 2. Cross-Platform Synthesis

### 2.1 Common Patterns Across All Platforms

#### Universal Core Structure

**All platforms use**:
- `SKILL.md` as the primary definition file
- YAML frontmatter for metadata
- Markdown body for instructions
- Required fields: `name` (max 64 chars, lowercase, hyphens) and `description` (max 1024 chars)

#### Progressive Disclosure Architecture

**All platforms implement** a three-tier loading strategy:

1. **Discovery Tier**: Load only metadata (name + description) at startup
2. **Activation Tier**: Load full SKILL.md when task matches description
3. **Execution Tier**: Access additional resources only when referenced

This keeps context efficient and allows many skills to be installed without overhead.

#### Automatic Activation

**All platforms agree**: Skills are automatically invoked by the agent based on description matching the user's request. No manual selection required.

#### Hierarchical Precedence

**All platforms support** some form of priority hierarchy:
- Project/local skills override global/personal skills
- More specific contexts override generic ones
- Platform-specific variations exist but the principle is universal

#### Skill Composition Patterns

**All platforms support**:
- Single-file minimal skills (just SKILL.md)
- Multi-file skills with supporting resources
- Script bundling for executable code
- Documentation references for detailed guidance

### 2.2 Platform-Specific Differences

#### Storage Locations

| Platform | Personal/Global | Project/Local |
|----------|----------------|---------------|
| Claude Code | `~/.claude/skills/` | `.claude/skills/` |
| VS Code Copilot | `~/.github/skills/` | `.github/skills/` (or `.claude/skills/` legacy) |
| Kilo.ai | `~/.kilocode/skills/` | `.kilocode/skills/` |

#### Unique Features by Platform

**Claude Code Only**:
- `allowed-tools` field - Restricts which tools can be used
- `context: fork` - Runs skill in isolated sub-agent context
- `agent` field - Specifies agent type for forked contexts
- `hooks` field - Lifecycle hooks (PreToolUse, PostToolUse, Stop)
- `user-invocable` field - Controls slash command menu visibility
- `model` field - Specifies which Claude model to use
- Enterprise/managed settings for organization-wide deployment
- Subagent integration via `skills` field in `.claude/agents/`

**VS Code Copilot Only**:
- `.github/skills/` as primary location
- Integration across Copilot in VS Code, Copilot CLI, and Copilot Coding Agent
- Emphasis on Playwright testing and GitHub Actions debugging examples

**Kilo.ai Only**:
- **Mode-specific skill overrides** (`skills-{mode-slug}/` directories)
- Skills reload on VS Code window reload
- `license`, `compatibility`, and `metadata` optional frontmatter fields
- Explicit focus on mode-based skill variations

**AgentSkills.io (Standard)**:
- Platform-agnostic specification
- Reference library for skill validation
- XML prompt generation support
- License field (`license: Apache-2.0` example)

### 2.3 Key Concepts for Universal agent_skills.md

Based on the cross-platform analysis, a universal agent_skills.md should incorporate:

#### 1. Core Definition

```yaml
---
name: skill-identifier
description: What it does and when to use it. Include trigger keywords.
---

# Skill Name

## Purpose
Clear statement of what this skill accomplishes.

## When to Use
Specific triggers and use cases.

## Instructions
Step-by-step guidance.

## Examples
Concrete usage examples.
```

#### 2. Progressive Disclosure Pattern

- Keep SKILL.md under 500 lines
- Link to supporting files for detailed documentation
- Include scripts in subdirectories
- Reference external resources as needed

#### 3. Description Best Practices

Descriptions should answer:
- **What**: List specific capabilities
- **When**: Include keywords users would naturally say
- **Context**: Mention file types, technologies, or workflows relevant to the skill

**Formula**: `[What it does] + [When to use it] + [Trigger keywords]`

Example:
```yaml
description: Extract text and tables from PDF files, fill forms, merge documents.
Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
```

#### 4. Directory Structure Options

**Minimal**:
```
skill-name/
└── SKILL.md
```

**Standard**:
```
skill-name/
├── SKILL.md
├── examples.md
└── scripts/
    └── helper.py
```

**Comprehensive**:
```
skill-name/
├── SKILL.md          # Entry point, navigation
├── GUIDE.md          # Detailed how-to
├── REFERENCE.md      # API/technical reference
├── EXAMPLES.md       # Usage examples
├── scripts/          # Executable code
├── templates/        # File templates
└── assets/           # Other resources
```

#### 5. Platform Compatibility Considerations

**For maximum portability**:
- Use only `name` and `description` in frontmatter (universally supported)
- Place skills in both `.claude/skills/` and `.github/skills/` if targeting multiple platforms
- Avoid platform-specific fields unless targeting single platform
- Document platform-specific features in skill body

**Platform-specific extensions** (use when targeting specific platform):

```yaml
# Claude Code specific
allowed-tools: Read, Grep, Glob
context: fork
agent: general-purpose
hooks: [...]

# Kilo.ai specific
license: Apache-2.0
compatibility: "VS Code 1.85+"
metadata:
  author: your-org
  version: "1.0"
```

#### 6. Skill Activation Checklist

For reliable activation, ensure:
- [ ] Name matches directory name exactly
- [ ] Name is lowercase, hyphens/numbers only, max 64 chars
- [ ] Description is under 1024 chars
- [ ] Description includes what, when, and trigger keywords
- [ ] Description mentions technologies/file types/workflows
- [ ] SKILL.md includes clear instructions
- [ ] Examples demonstrate concrete usage
- [ ] Supporting files are referenced, not embedded (for large content)

#### 7. Universal Template

```yaml
---
name: skill-identifier
description: |
  [What it does]: Core capabilities in one sentence.
  [When to use]: Use when [trigger condition]. Mentions [keywords].
---

# Skill Name

## Overview
Brief description of the skill's purpose and value.

## When to Use This Skill
- Specific trigger condition 1
- Specific trigger condition 2
- Keywords: [list relevant terms]

## Prerequisites
- Required tools/libraries
- Environment setup
- Permissions needed

## Instructions

### Step 1: [Action]
Clear, actionable guidance.

### Step 2: [Action]
More guidance.

## Examples

### Example 1: [Use Case]
```
Code or command example
```

### Example 2: [Use Case]
```
Another example
```

## Troubleshooting
Common issues and solutions.

## Additional Resources
- [Documentation](./docs/guide.md)
- [Reference](./docs/reference.md)
- [Examples](./examples/)
```

#### 8. Skill Composition Strategies

**Strategy 1: Single Responsibility**
Each skill does one thing well. Compose multiple skills rather than creating mega-skills.

**Strategy 2: Layered Documentation**
- SKILL.md = overview + navigation
- Supporting files = detailed implementation
- Scripts = executable automation

**Strategy 3: Reference Linking**
Link to external resources without duplicating:
```markdown
For complete API documentation, see [API Reference](./REFERENCE.md)
For testing patterns, see [Testing Guide](./TESTING.md)
```

**Strategy 4: Script Integration**
Bundle executable scripts that agents call:
```markdown
Run the validation:
```bash
python scripts/validate.py input.json
```
```

#### 9. Version Control Best Practices

**Commit to repository**:
- All SKILL.md files
- Supporting documentation
- Scripts and templates
- README explaining available skills

**Add to .gitignore**:
- Temporary files generated by skills
- API tokens or credentials
- Platform-specific cache files

**Documentation**:
- List available skills in repository README
- Include skill descriptions for discoverability
- Document any prerequisites or setup required

#### 10. Testing and Validation

**Before deploying a skill**:
1. Test description matching with realistic user queries
2. Verify all referenced files exist
3. Test scripts execute successfully
4. Validate YAML frontmatter syntax
5. Check name matches directory name
6. Ensure description is clear and keyword-rich

**After deployment**:
1. Monitor activation (are agents finding it?)
2. Track usage patterns
3. Iterate on description based on actual queries
4. Update instructions based on user feedback

---

## 3. Practical Implementation Guide

### 3.1 Creating Your First Skill

**Step 1: Identify the Need**

Ask:
- What task do agents repeatedly struggle with?
- What domain knowledge is missing?
- What workflow needs standardization?

**Step 2: Choose Location**

```bash
# For project-specific skill
mkdir -p .claude/skills/your-skill-name
mkdir -p .github/skills/your-skill-name  # For Copilot compatibility

# For personal skill (Claude Code)
mkdir -p ~/.claude/skills/your-skill-name

# For personal skill (VS Code Copilot)
mkdir -p ~/.github/skills/your-skill-name

# For personal skill (Kilo.ai)
mkdir -p ~/.kilocode/skills/your-skill-name
```

**Step 3: Create SKILL.md**

```yaml
---
name: your-skill-name
description: What it does and when to use it. Include trigger keywords.
---

# Your Skill Name

## Purpose
Clear, one-sentence purpose.

## Instructions
Step-by-step guidance.

## Examples
Concrete examples.
```

**Step 4: Test Activation**

Create test queries that should trigger the skill:
- Use keywords from description
- Mention technologies/file types
- Describe use cases

Verify the agent loads and executes the skill.

**Step 5: Iterate**

Based on testing:
- Refine description for better matching
- Add examples for common edge cases
- Expand instructions for clarity
- Link to supporting documentation

### 3.2 Advanced Skill Patterns

#### Pattern: Multi-Step Workflow

```yaml
---
name: code-review-workflow
description: Comprehensive code review process including security, performance,
and best practices checks. Use when reviewing pull requests or conducting code audits.
---

# Code Review Workflow

## Steps

### 1. Security Analysis
- Check for common vulnerabilities
- Validate input sanitization
- Review authentication/authorization

### 2. Performance Review
- Identify inefficient algorithms
- Check database query optimization
- Review caching strategies

### 3. Best Practices
- Code style consistency
- Documentation completeness
- Test coverage

## Checklist
- [ ] Security vulnerabilities addressed
- [ ] Performance bottlenecks identified
- [ ] Tests added/updated
- [ ] Documentation updated
```

#### Pattern: Technology-Specific Expertise

```yaml
---
name: react-component-best-practices
description: React component development using hooks, TypeScript, and modern
patterns. Use when creating or refactoring React components, or when user
mentions React, hooks, components, or TypeScript.
---

# React Component Best Practices

## Component Structure

1. Use functional components with hooks
2. Type props with TypeScript interfaces
3. Extract custom hooks for reusable logic
4. Implement proper error boundaries

## Example Component

```typescript
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  variant = 'primary'
}) => {
  return (
    <button onClick={onClick} className={`btn btn-${variant}`}>
      {children}
    </button>
  );
};
```

## Hooks Best Practices

- Use `useMemo` for expensive computations
- Use `useCallback` for function references
- Extract custom hooks for complex state logic
- Follow hooks rules (don't call conditionally)

## Resources
- [React TypeScript Cheatsheet](./react-typescript.md)
- [Hooks Reference](./hooks-reference.md)
```

#### Pattern: Tool-Restricted Security Skill (Claude Code)

```yaml
---
name: safe-file-inspection
description: Inspect files safely without making modifications. Use when
user wants to analyze or review files without risk of changes.
allowed-tools: Read, Grep, Glob
---

# Safe File Inspection

## Available Operations

You can safely:
- Read file contents
- Search for patterns
- Find files by name
- Analyze file structure

You cannot:
- Modify files
- Execute commands
- Write new files
- Delete files

## Instructions

1. Use Read for viewing file contents
2. Use Grep for searching patterns
3. Use Glob for finding files
4. Report findings without modifications
```

#### Pattern: Mode-Specific Skill (Kilo.ai)

```yaml
# In skills-code/python-coding/SKILL.md
---
name: python-coding
description: Python development with focus on code implementation and testing
---

# Python Coding (Code Mode)

Focus on:
- Writing clean, tested code
- Following PEP 8 style guide
- Implementing unit tests
- Debugging issues
```

```yaml
# In skills-architect/python-coding/SKILL.md
---
name: python-coding
description: Python architecture and design patterns
---

# Python Coding (Architect Mode)

Focus on:
- System design and architecture
- Design pattern selection
- Module organization
- Scalability considerations
```

### 3.3 Skill Discovery Optimization

#### Description Formula

```
[Primary Capability] + [Secondary Capabilities] + [Use When] + [Trigger Keywords]
```

**Example**:
```yaml
description: |
  Generate comprehensive API documentation from code. Supports REST, GraphQL,
  and gRPC endpoints. Use when creating API docs, documenting endpoints, or
  when user mentions API, documentation, swagger, OpenAPI, or REST.
```

#### Keyword Identification

Include terms users would naturally say:
- **Technology names**: React, Python, Docker, Kubernetes
- **File types**: PDF, JSON, CSV, Excel
- **Actions**: create, generate, analyze, review, debug
- **Concepts**: documentation, testing, deployment, authentication

#### Testing Activation

Create a test suite of user queries:

```markdown
# Skill Activation Tests for: api-documentation

Expected to match:
✓ "Help me document this REST API"
✓ "Generate OpenAPI spec for these endpoints"
✓ "Create API documentation"
✓ "I need swagger docs"

Should not match:
✗ "Write unit tests"
✗ "Create a React component"
✗ "Debug this function"
```

### 3.4 Skill Maintenance

#### Update Triggers

Update skills when:
- Technology/library versions change
- Best practices evolve
- Common errors emerge
- User queries fail to activate skill
- New use cases identified

#### Versioning Strategy

Include version in metadata (if platform supports):

```yaml
---
name: skill-name
description: Skill description
metadata:
  version: "2.1.0"
  updated: "2026-01-11"
  changelog: "Added support for new API endpoints"
---
```

Document changes in skill body:

```markdown
## Version History

### v2.1.0 (2026-01-11)
- Added GraphQL endpoint support
- Updated authentication examples
- Fixed CORS configuration guidance

### v2.0.0 (2025-12-15)
- Complete rewrite for OpenAPI 3.1
- Breaking: Removed Swagger 2.0 support
```

#### Deprecation Process

When retiring a skill:

1. Update description to indicate deprecation:
```yaml
description: "[DEPRECATED] Use new-skill-name instead. This skill will be removed in v3.0."
```

2. Add deprecation notice in body:
```markdown
# Old Skill Name

> **⚠️ DEPRECATED**: This skill is deprecated. Use [new-skill-name](../new-skill-name/SKILL.md) instead.
>
> This skill will be removed in version 3.0 (estimated: 2026-06-01)
```

3. After deprecation period, remove skill directory

---

## 4. Platform Compatibility Matrix

| Feature | AgentSkills.io | Claude Code | VS Code Copilot | Kilo.ai |
|---------|---------------|-------------|-----------------|---------|
| **Core Fields** |
| `name` | ✅ Required | ✅ Required | ✅ Required | ✅ Required |
| `description` | ✅ Required | ✅ Required | ✅ Required | ✅ Required |
| **Optional Fields** |
| `allowed-tools` | ❌ | ✅ | ❌ | ❌ |
| `context` | ❌ | ✅ | ❌ | ❌ |
| `agent` | ❌ | ✅ | ❌ | ❌ |
| `hooks` | ❌ | ✅ | ❌ | ❌ |
| `model` | ❌ | ✅ | ❌ | ❌ |
| `user-invocable` | ❌ | ✅ | ❌ | ❌ |
| `license` | ✅ Example | ❌ | ❌ | ✅ |
| `compatibility` | ❌ | ❌ | ❌ | ✅ |
| `metadata` | ❌ | ❌ | ❌ | ✅ |
| **Storage Locations** |
| Personal/Global | N/A | `~/.claude/skills/` | `~/.github/skills/` | `~/.kilocode/skills/` |
| Project/Local | N/A | `.claude/skills/` | `.github/skills/` or `.claude/skills/` | `.kilocode/skills/` |
| Mode-Specific | ❌ | ❌ | ❌ | ✅ `skills-{mode}/` |
| **Activation** |
| Auto-activation | ✅ | ✅ | ✅ | ✅ |
| Progressive disclosure | ✅ | ✅ | ✅ | ✅ |
| Manual invocation | ⚠️ Platform-dependent | ✅ Slash commands | ⚠️ Platform-dependent | ⚠️ Platform-dependent |
| **Distribution** |
| Version control | ✅ | ✅ | ✅ | ✅ |
| Plugin/Extension | ⚠️ Platform-dependent | ✅ | ❌ | ❌ |
| Enterprise/Managed | ⚠️ Platform-dependent | ✅ | ⚠️ Org-level | ❌ |

---

## 5. Real-World Examples

### Example 1: PDF Processing Skill (Cross-Platform Compatible)

```yaml
---
name: pdf-processing
description: Extract text and tables from PDF files, fill forms, merge documents.
Use when working with PDF files or when user mentions PDFs, forms, document extraction,
or PDF manipulation.
---

# PDF Processing

## Capabilities

- Extract text from PDFs
- Extract tables to CSV/JSON
- Fill PDF forms
- Merge multiple PDFs
- Split PDFs into pages

## Prerequisites

```bash
pip install pypdf pdfplumber
```

## Common Tasks

### Extract Text

```python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    for page in pdf.pages:
        text = page.extract_text()
        print(text)
```

### Extract Tables

```python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    for page in pdf.pages:
        tables = page.extract_tables()
        for table in tables:
            # Process table data
            print(table)
```

### Fill Form

```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("form.pdf")
writer = PdfWriter()

writer.add_page(reader.pages[0])
writer.update_page_form_field_values(
    writer.pages[0],
    {"field_name": "field_value"}
)

with open("filled.pdf", "wb") as output:
    writer.write(output)
```

## Troubleshooting

**Issue**: Text extraction returns garbled text
**Solution**: PDF may use image-based text. Use OCR:
```bash
pip install pytesseract
```

**Issue**: Form fields not filling
**Solution**: Check field names:
```python
from pypdf import PdfReader
reader = PdfReader("form.pdf")
fields = reader.get_fields()
print(fields.keys())
```

## Resources

For detailed API documentation: [PDF Libraries Reference](./pdf-reference.md)
```

### Example 2: React Component Development (Claude Code with Tool Restrictions)

```yaml
---
name: react-component-dev
description: Create React components using TypeScript, hooks, and modern patterns.
Use when building React components, using hooks, or when user mentions React,
TypeScript, components, or JSX.
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
---

# React Component Development

## Component Checklist

- [ ] Use TypeScript for type safety
- [ ] Define proper interface for props
- [ ] Implement as functional component
- [ ] Use appropriate hooks
- [ ] Add error boundaries if needed
- [ ] Include accessibility attributes
- [ ] Write component tests

## Component Template

```typescript
import React, { useState, useEffect, useMemo, useCallback } from 'react';

interface ComponentNameProps {
  // Define props with TypeScript
  requiredProp: string;
  optionalProp?: number;
  onAction?: (data: DataType) => void;
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  requiredProp,
  optionalProp = 10,
  onAction
}) => {
  // State
  const [state, setState] = useState<StateType>(initialState);

  // Effects
  useEffect(() => {
    // Side effects
    return () => {
      // Cleanup
    };
  }, [dependencies]);

  // Memoized values
  const memoizedValue = useMemo(() => {
    return expensiveComputation(state);
  }, [state]);

  // Callbacks
  const handleAction = useCallback(() => {
    setState(newState);
    onAction?.(data);
  }, [onAction]);

  return (
    <div className="component-name">
      {/* Component JSX */}
    </div>
  );
};
```

## Hooks Best Practices

### useState
- Initialize with appropriate type
- Use functional updates for state based on previous state
```typescript
setState(prev => ({ ...prev, newField: value }))
```

### useEffect
- Always specify dependency array
- Return cleanup function when needed
- Avoid putting too much logic in one effect

### useMemo
- Use for expensive computations
- Don't overuse - has its own cost

### useCallback
- Use for functions passed as props
- Include all dependencies

## Custom Hook Pattern

```typescript
function useCustomHook(initialValue: Type) {
  const [state, setState] = useState(initialValue);

  const handler = useCallback((newValue: Type) => {
    setState(newValue);
  }, []);

  return [state, handler] as const;
}
```

## Testing Pattern

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName requiredProp="test" />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', () => {
    const mockAction = jest.fn();
    render(<ComponentName requiredProp="test" onAction={mockAction} />);

    fireEvent.click(screen.getByRole('button'));
    expect(mockAction).toHaveBeenCalled();
  });
});
```

## Common Patterns

### Conditional Rendering
```typescript
{condition && <Component />}
{condition ? <ComponentA /> : <ComponentB />}
```

### List Rendering
```typescript
{items.map(item => (
  <Item key={item.id} {...item} />
))}
```

### Error Boundary
```typescript
class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

## Resources

- [TypeScript Cheatsheet](./typescript-react.md)
- [Hooks Reference](./hooks-detailed.md)
- [Testing Guide](./testing-guide.md)
```

### Example 3: Code Review Workflow (Multi-File with Progressive Disclosure)

**SKILL.md**:
```yaml
---
name: code-review
description: Comprehensive code review covering security, performance, best practices,
and testing. Use when reviewing pull requests, conducting code audits, or when user
mentions code review, PR review, security audit, or code quality.
---

# Code Review Workflow

## Quick Start

1. Review the changes: `git diff main...feature-branch`
2. Follow the checklist below
3. Document findings in PR comments

## Review Checklist

### Security
- [ ] No hardcoded credentials or API keys
- [ ] Input validation implemented
- [ ] Authentication/authorization checked
- [ ] No SQL injection vulnerabilities
- [ ] XSS prevention in place
- [ ] CSRF protection implemented

For detailed security review, see [Security Review Guide](./SECURITY.md)

### Performance
- [ ] No N+1 queries
- [ ] Appropriate caching strategy
- [ ] Efficient algorithms used
- [ ] Database indexes present
- [ ] No unnecessary re-renders (React)
- [ ] Proper lazy loading

For detailed performance review, see [Performance Review Guide](./PERFORMANCE.md)

### Code Quality
- [ ] Follows project style guide
- [ ] DRY principle applied
- [ ] SOLID principles followed
- [ ] Appropriate abstractions
- [ ] Clear naming conventions
- [ ] No code duplication

For detailed quality review, see [Quality Review Guide](./QUALITY.md)

### Testing
- [ ] Unit tests added/updated
- [ ] Integration tests if needed
- [ ] Edge cases covered
- [ ] Mocks used appropriately
- [ ] Test coverage meets threshold

For detailed testing review, see [Testing Review Guide](./TESTING.md)

### Documentation
- [ ] README updated if needed
- [ ] API docs updated
- [ ] Inline comments for complex logic
- [ ] Changelog updated
- [ ] Migration guide if breaking changes

## Review Commands

```bash
# View changes
git diff main...feature-branch

# Check commit messages
git log main..feature-branch --oneline

# Run tests
npm test
# or
pytest

# Check coverage
npm run coverage
# or
pytest --cov

# Run linter
npm run lint
# or
pylint src/
```

## Providing Feedback

### Good Feedback Pattern
```
**Issue**: [Describe the problem]
**Impact**: [Explain why it matters]
**Suggestion**: [Propose solution]
**Example**: [Show code example if helpful]
```

### Example
```
**Issue**: Database query in loop (lines 45-52)
**Impact**: N+1 query problem - will slow down with scale
**Suggestion**: Use bulk query with JOIN or prefetch
**Example**:
```python
# Instead of:
for user in users:
    posts = db.query(Post).filter(Post.user_id == user.id).all()

# Do:
from sqlalchemy.orm import joinedload
users_with_posts = db.query(User).options(joinedload(User.posts)).all()
```
```

## Priority Levels

- **Critical**: Security vulnerabilities, data loss risks
- **High**: Performance issues, broken functionality
- **Medium**: Code quality, maintainability
- **Low**: Style preferences, minor optimizations

## Approval Criteria

Approve when:
- No critical or high priority issues remain
- All tests pass
- Code coverage meets threshold
- Documentation is updated
- Changes align with project standards
```

**SECURITY.md** (referenced file):
```markdown
# Security Review Guide

## Authentication & Authorization

### Check for:
- Proper session management
- Token expiration and refresh
- Role-based access control (RBAC)
- Principle of least privilege

### Example Issues:
```python
# Bad - No authorization check
@app.route('/admin/users')
def get_users():
    return User.query.all()

# Good - Authorization enforced
@app.route('/admin/users')
@require_role('admin')
def get_users():
    return User.query.all()
```

## Input Validation

### Check for:
- All user inputs validated
- Type checking
- Length limits
- Allowed characters/patterns

### Example Issues:
```python
# Bad - No validation
def create_user(username):
    User.create(username=username)

# Good - Validated
def create_user(username):
    if not username or len(username) > 50:
        raise ValueError("Invalid username")
    if not re.match(r'^[a-zA-Z0-9_]+$', username):
        raise ValueError("Username contains invalid characters")
    User.create(username=username)
```

[Additional security patterns...]
```

### Example 4: Mode-Specific Skill (Kilo.ai Architecture)

**skills-code/database-design/SKILL.md**:
```yaml
---
name: database-design
description: Database schema design and query optimization for code implementation
---

# Database Design (Code Mode)

## Focus Areas

- Writing efficient queries
- Implementing indexes
- Setting up migrations
- Writing ORM models

## Query Optimization

```python
# Use select_related for foreign keys
users = User.objects.select_related('profile').all()

# Use prefetch_related for many-to-many
users = User.objects.prefetch_related('groups').all()

# Add indexes
class Meta:
    indexes = [
        models.Index(fields=['email']),
        models.Index(fields=['created_at']),
    ]
```

## Migration Best Practices

- Always review generated migrations
- Test migrations on copy of production data
- Make migrations reversible
- Add data migrations separately from schema
```

**skills-architect/database-design/SKILL.md**:
```yaml
---
name: database-design
description: Database architecture and system design patterns
---

# Database Design (Architect Mode)

## Focus Areas

- Schema design and normalization
- Scalability patterns
- Sharding strategies
- Replication topology
- Data modeling

## Normalization Levels

### 1NF: Atomic Values
- Each column contains atomic values
- No repeating groups

### 2NF: No Partial Dependencies
- 1NF + all non-key attributes depend on entire primary key

### 3NF: No Transitive Dependencies
- 2NF + no transitive dependencies

## Denormalization for Performance

When to denormalize:
- Read-heavy workloads
- Complex JOIN operations
- Reporting/analytics needs
- Cache-like tables

Trade-offs:
- Faster reads
- Slower writes
- Data redundancy
- Consistency challenges

## Sharding Strategies

### Horizontal Sharding (Range-based)
```
Shard 1: user_id 1-1000
Shard 2: user_id 1001-2000
```

### Hash-based Sharding
```
Shard = hash(user_id) % num_shards
```

### Geography-based Sharding
```
US-East: US users
EU: European users
APAC: Asian users
```

## Scaling Patterns

- Read replicas for read scaling
- Write partitioning for write scaling
- CQRS (Command Query Responsibility Segregation)
- Event sourcing for audit trails
```

---

## 6. Sources and References

### Primary Sources

1. **AgentSkills.io**:
   - [Agent Skills Home](https://agentskills.io/home)
   - [Agent Skills Specification](https://agentskills.io/specification)
   - [GitHub Repository](https://github.com/agentskills/agentskills)
   - [Anthropic Skills Spec](https://github.com/anthropics/skills/blob/main/spec/agent-skills-spec.md)

2. **Claude Code (Anthropic)**:
   - [Agent Skills Documentation](https://code.claude.com/docs/en/skills)
   - [Equipping Agents Blog Post](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
   - [Agent SDK Skills](https://platform.claude.com/docs/en/agent-sdk/skills)
   - [Skill Authoring Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)

3. **VS Code Copilot (GitHub/Microsoft)**:
   - [Use Agent Skills in VS Code](https://code.visualstudio.com/docs/copilot/customization/agent-skills)
   - [GitHub Copilot Changelog](https://github.blog/changelog/2025-12-18-github-copilot-now-supports-agent-skills/)
   - [About Agent Skills - GitHub Docs](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)

4. **Kilo.ai**:
   - [Skills Documentation](https://kilo.ai/docs/agent-behavior/skills)
   - [Kilo Code Weekly Roundup](https://blog.kilo.ai/p/kilo-code-weekly-product-roundup-40c)
   - [GitHub Repository](https://github.com/Kilo-Org/kilocode)

### Community Resources

- [Simon Willison: Agent Skills](https://simonwillison.net/2025/Dec/19/agent-skills/)
- [awesome-agent-skills Repository](https://github.com/skillmatic-ai/awesome-agent-skills)
- [Building Agent Skills from Scratch](https://dev.to/onlyoneaman/building-agent-skills-from-scratch-lbl)
- [Claude Code Skills Deep Dive](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/)
- [Inside Claude Code Skills](https://mikhail.io/2025/10/claude-code-skills/)

---

## 7. Conclusion

Agent Skills represent a convergence toward a universal standard for extending AI agent capabilities. While platform-specific variations exist, the core principles remain consistent:

1. **SKILL.md with YAML frontmatter** is the universal format
2. **Progressive disclosure** optimizes context efficiency
3. **Automatic activation** based on description matching
4. **Hierarchical precedence** allows overriding at appropriate levels
5. **Supporting resources** enable rich, detailed implementations

### For Skill Authors

- Start with the core standard (name + description)
- Use platform-specific features when targeting single platform
- Maximize portability by avoiding platform-specific fields
- Invest in quality descriptions for reliable activation
- Use progressive disclosure to keep skills maintainable

### For Platform Implementers

- Support the core standard (name, description, SKILL.md)
- Implement progressive disclosure for efficiency
- Provide platform-specific extensions thoughtfully
- Maintain backwards compatibility
- Contribute to the open standard

### Future Direction

The Agent Skills standard is evolving toward greater interoperability, with more platforms adopting the specification. The balance between platform innovation and standard compliance will shape the ecosystem's growth.

**Key takeaway**: Write portable skills using the core standard, extend with platform-specific features when needed, and always prioritize clear descriptions and progressive disclosure for optimal agent performance.
