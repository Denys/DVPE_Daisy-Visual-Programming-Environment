---
description: Validate a .dvpe block diagram file against schema
---

# Validate .dvpe File Schema

This workflow validates `.dvpe` block diagram files to catch schema errors before loading them in the DVPE UI. Especially useful for AI chatbot-generated files.

## Prerequisites
- Node.js and npm installed
- DVPE frontend dependencies installed (`npm install` in `dvpe_CLD/`)

## Steps

### 1. Navigate to Frontend Directory
// turbo
```bash
cd dvpe_CLD
```

### 2. Run Validation Test
```bash
npm test -- --testNamePattern="should validate .dvpe file schema"
```

**Alternative**: Run all validation tests:
```bash
npm test -- Phase12BlockValidation
```

### 3. Check Specific File (Manual)
To validate a specific `.dvpe` file programmatically:

```bash
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('../_block_diagrams_code/prompt_generated/YOUR_FILE.dvpe', 'utf8'));
console.log('Version:', data.version);
console.log('Blocks:', data.patch.blocks.length);
console.log('Connections:', data.patch.connections.length);
console.log('Valid JSON: ✓');
"
```

## Common Validation Errors

### Missing Required Fields
- `patch.metadata` must include: `name`, `author`, `version`, `targetHardware`
- Each block must have: `id`, `definitionId`, `position`, `parameterValues`

### Invalid Block References
- `definitionId` must match an existing block type
- Connection `sourceBlockId` and `targetBlockId` must reference existing blocks

### Invalid Port References
- Port IDs in connections must match actual ports in block definitions

## Quick Fix Tips
1. Compare generated file to `template.dvpe` structure
2. Check `dvpe_CLD/src/core/blocks/definitions/` for valid `definitionId` values
3. Use `mini_drum_machine_working.dvpe` as a working reference
