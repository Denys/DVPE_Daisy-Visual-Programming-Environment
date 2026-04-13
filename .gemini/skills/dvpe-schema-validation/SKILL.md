---
name: dvpe-schema-validation
description: |
  Validate and fix .dvpe block diagram files against schema v1.0.0.
  Use when files fail to load, debugging JSON structure, schema errors,
  connection issues, or when user mentions validation, schema, file format,
  won't load, or invalid .dvpe file.
---

# DVPE Schema Validation

## Overview
Diagnose and fix `.dvpe` file loading failures by validating against the v1.0.0 schema.

## Workflow

### Step 1: Load and Parse File
**Action**: Read the `.dvpe` file
**Check**: Valid JSON syntax

```bash
# Quick JSON validation
cat file.dvpe | python -m json.tool
```

### Step 2: Schema Structure Check
**Required Structure**:
```json
{
  "version": "1.0.0",
  "patch": {
    "metadata": {
      "name": "Patch Name",
      "author": "Author",
      "targetHardware": "seed|pod|field",
      "sampleRate": 48000
    },
    "blocks": [...],
    "connections": [...]
  }
}
```

### Step 3: Validate Blocks
**Each block must have**:
```json
{
  "id": "unique-block-id",
  "definitionId": "oscillator",      // NOT "type"
  "position": { "x": 100, "y": 100 },
  "label": "OSC1",
  "parameterValues": {},             // NOT "parameters"
  "enabledCvPorts": []
}
```

**Common Errors**:
| Wrong | Correct |
|-------|---------|
| `"type": "oscillator"` | `"definitionId": "oscillator"` |
| `"parameters": {...}` | `"parameterValues": {...}` |
| Missing `position` | Add `{ "x": N, "y": N }` |

### Step 4: Validate Connections
**Each connection must have**:
```json
{
  "id": "conn-unique-id",
  "sourceBlockId": "block-id",       // NOT "sourceId"
  "sourcePortId": "output",
  "targetBlockId": "other-block-id", // NOT "targetId"
  "targetPortId": "input",
  "type": "audio|control"
}
```

**Common Errors**:
| Wrong | Correct |
|-------|---------|
| `"sourceId"` | `"sourceBlockId"` |
| `"targetId"` | `"targetBlockId"` |
| `"sourcePort"` | `"sourcePortId"` |
| Missing `"type"` | Add `"type": "audio"` |

### Step 5: Validate Port IDs
**Action**: Cross-reference port IDs with block definitions

```typescript
// Check if port exists on block definition
const blockDef = BlockRegistry.get(block.definitionId);
const validInputs = blockDef.inputs.map(i => i.id);
const validOutputs = blockDef.outputs.map(o => o.id);
```

**Common Issues**:
- `v_oct` vs `freq_cv` (oscillator frequency input)
- `cv_gain` vs `gain_cv` (VCA control input)
- CV ports not visible (need `enabledCvPorts` array)

### Step 6: Apply Fixes
**Action**: Edit the `.dvpe` file with corrections
**Verify**: Load in DVPE UI

## Error Handling

**JSON Syntax Error**:
- Check for trailing commas
- Verify quoted property names
- Check bracket matching

**Missing Wrapper** (most common):
```json
// WRONG - flat structure
{ "version": "1.0", "blocks": [...] }

// CORRECT - nested under "patch"
{ "version": "1.0.0", "patch": { "metadata": {...}, "blocks": [...] } }
```

**Invalid Connection**:
- Check block IDs exist
- Verify port IDs match definition
- For CV ports, ensure `enabledCvPorts` includes the port

## Validation Checklist

- [ ] Valid JSON syntax
- [ ] Has `version: "1.0.0"`
- [ ] Has `patch` wrapper object
- [ ] Has `metadata` with `targetHardware`
- [ ] All blocks have `definitionId`, `position`, `id`
- [ ] All connections have `sourceBlockId`, `targetBlockId`, `type`
- [ ] All referenced port IDs exist on block definitions
- [ ] CV ports are in `enabledCvPorts` arrays

## Reference Files
- [Schema Documentation](file:///_block_diagrams_code/SCHEMA.md)
- [Template File](file:///_block_diagrams_code/template.dvpe)
- [Working Examples](file:///_block_diagrams_code/tested/)
