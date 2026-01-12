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
