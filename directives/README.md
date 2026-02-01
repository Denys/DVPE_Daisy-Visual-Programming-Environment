# Directives

This folder contains SOPs (Standard Operating Procedures) for the DVPE project.

## Purpose
Directives define **what to do** using natural language instructions. They specify:
- Goals and expected outcomes
- Required inputs
- Tools/scripts to use (from `execution/`)
- Expected outputs
- Edge cases and error handling

## Usage
1. AI reads directives to understand the task
2. AI calls execution tools in the correct order
3. AI updates directives with learnings when issues are discovered

## Naming Convention
`<action>_<subject>.md` — e.g., `build_firmware.md`, `test_codegen.md`

---

## Available Directives

### DVPE Development (composed by `.claude/skills/dvpe-development/`)

| Directive | Purpose |
|-----------|---------|
| `ai_patch_generation.md` | Generate .dvpe block diagrams from natural language |
| `dvpe_code_generation.md` | Convert .dvpe to C++ code (multiple modes) |
| `build_firmware.md` | Compile C++ to Daisy firmware binary |

### Documentation (composed by `.claude/skills/document-analysis/`)

| Directive | Purpose |
|-----------|---------|
| `analyze_document_structure.md` | Map document organization and patterns |
| `create_document_index.md` | Build searchable JSON indexes |
| `query_document_index.md` | Retrieve info from cached indexes |

### Block Documentation

| Directive | Purpose |
|-----------|---------|
| `document_dafx_blocks.md` | Step-by-step guide for documenting DAFX blocks |

### Project Management

| Directive | Purpose |
|-----------|---------|
| `PLANNING/PROJECT_PLANNING_DIRECTIVE.md` | Rules for creating, maintaining, and archiving planning documents |

> **Note**: All planning files are now consolidated in `PLANNING/` folder. See `PLANNING/completion_monitor.md` for current project status.

### Utilities

| Directive | Purpose |
|-----------|---------|
| `launch_dev_servers.md` | Start frontend/backend development servers |

---

## Related Agent Skills

Skills compose multiple directives into discoverable workflows:

| Skill | Location | Directives Used |
|-------|----------|-----------------|
| `dvpe-development` | `.claude/skills/dvpe-development/` | ai_patch_generation, dvpe_code_generation, build_firmware |
| `document-analysis` | `.claude/skills/document-analysis/` | analyze_document_structure, create_document_index, query_document_index |

---

## Adding New Directives

1. Create `<action>_<subject>.md` following the template in AGENTS.md
2. Include: Purpose, Inputs, Execution Tool, Expected Outputs, Edge Cases
3. Update this README with the new directive
4. Consider: Should this be part of an existing skill or a new skill?
