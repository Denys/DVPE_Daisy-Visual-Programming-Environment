---
name: dvpe-development
description: |
  Complete DVPE development workflow for Gemini: Natural Language/Images -> Block Diagram -> C++ -> Firmware.
  Leverages multimodal capabilities (screenshots/diagrams) and search for latest DaisySP patterns.
  Use when: creating audio patches, converting images to diagrams, writing C++, building firmware.
  keywords: DVPE, block diagram, screenshot, C++, firmware, daisy, code generation
---

# DVPE Development Skill (Gemini Enhanced)

## Overview
End-to-end workflow for Daisy Visual Programming Environment.
**Gemini Enhancements**: Multimodal inputs (diagram/UI screenshots), Search-first C++ generation, Error-recovery via search.

## Directives Used
- `directives/ai_patch_generation.md`
- `directives/dvpe_code_generation.md`
- `directives/build_firmware.md`

## Workflow Modes

### Mode A: Description/Image → Block Diagram
**Use when**: User describes a patch or uploads a SCREENSHOT/DIAGRAM.

**Gemini Multimodal Step**:
1. If image provided: Analyze image structure.
   - "Identify blocks and connections in screenshot."
2. **Search**: "DaisySP [Effect Name] best practices" for complex blocks.

**Directive**: `directives/ai_patch_generation.md`
**Steps**:
1. Map description/image analysis to `block_library.json`.
2. Generate `.dvpe` JSON.
3. Validate against schema.

### Mode B: Block Diagram → C++
**Use when**: Converting `.dvpe` to Code.

**Gemini Research Step**:
- Before generating code, `search("DaisySP [Class] usage C++ examples")` for any new/unfamiliar blocks to ensure `processMethod` and parameters are correct.

**Directive**: `directives/dvpe_code_generation.md`
**Output**: `{ProjectName}.cpp` + `Makefile`

### Mode C: C++ → Firmware
**Use when**: Compiling.

**Directive**: `directives/build_firmware.md`
**Error Recovery**:
- If build fails:
  1. Capture compiler error.
  2. **Search**: "Daisy seed [error message] fix".
  3. Apply fix and retry.

### Mode D: Reverse Engineering (Code → Diagram)
**Use when**: Converting legacy C++ to DVPE.
1. Parse C++.
2. Map to blocks.
3. **Search**: Verify C++ parameter mapping against latest DaisySP docs if parameters are ambiguous.

## Validation
- [ ] Diagram generation matches input (text or image).
- [ ] C++ compiles (verified via search for errors).
- [ ] Firmware binary created.

## Resources
- [Block Library](file:///c:/Users/denko/Gemini/Antigravity/DVPE_Daisy-Visual-Programming-Environment/.tmp/block_library.json)
- [Code Gen Agent](file:///c:/Users/denko/Gemini/Antigravity/DVPE_Daisy-Visual-Programming-Environment/ai_system_prompts/DVPE_Code_Generation_Agent.md)
