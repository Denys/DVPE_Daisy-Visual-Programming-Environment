---
name: cv-port-validator
description: |
  Validate CV port consistency in DVPE TypeScript block definitions.
  Use when creating new blocks, checking CV ports, or after bulk block updates.
  Detects: missing cvModulatable flags, missing CV input ports, BOOL params with CV modulation.
  Trigger keywords: validate CV, check CV ports, CV consistency, block validation
---

# CV Port Validator Skill

## Overview

Validates that DVPE block definitions have consistent CV port configurations. Prevents the most common bugs in block development (Bugs #001, #002, #005, #007).

## Validation Rules

### Rule 1: cvModulatable → CV Port
Every parameter with `cvModulatable: true` must have a corresponding `*_cv` port in the `ports[]` array.

```typescript
// ✅ Correct
parameters: [{ id: 'freq', cvModulatable: true, ... }]
ports: [{ id: 'freq_cv', signalType: SignalType.CV, direction: PortDirection.INPUT }]

// ❌ Violation: Missing CV port
parameters: [{ id: 'freq', cvModulatable: true, ... }]
ports: []  // No freq_cv port!
```

### Rule 2: No BOOL with CV
Parameters of type `ParameterType.BOOL` cannot have `cvModulatable: true`.

```typescript
// ❌ Violation: BOOL cannot be CV modulated
{ id: 'enabled', type: ParameterType.BOOL, cvModulatable: true }

// ✅ Fix: Convert to FLOAT 0-1 range
{ id: 'enabled', type: ParameterType.FLOAT, range: { min: 0, max: 1 }, cvModulatable: true }
```

### Rule 3: CV Port Naming Convention
CV ports must follow the `{param_id}_cv` naming pattern.

```typescript
// ✅ Correct
parameter.id = 'delay'  →  port.id = 'delay_cv'

// ❌ Violation
parameter.id = 'delay'  →  port.id = 'dly_cv'  // Mismatch!
```

## Workflow

### Step 1: Scan Block Definitions
```bash
# Find all block definition files
find dvpe_CLD/src/core/blocks/definitions -name "*.ts" -not -name "index.ts"
```

### Step 2: Extract Parameters and Ports
For each block file:
1. Find all parameters with `cvModulatable: true`
2. Find all ports with `signalType: SignalType.CV` and `direction: PortDirection.INPUT`

### Step 3: Validate Rules
```
For each cvModulatable parameter:
  - Check if {param.id}_cv port exists
  - Check if parameter type is not BOOL
  - Report violations
```

### Step 4: Generate Report
```markdown
## CV Port Validation Report

### ❌ Violations (3)
| Block | Parameter | Issue |
|-------|-----------|-------|
| flanger | delay | Missing delay_cv port |
| synthKick | dirty | BOOL type with cvModulatable |
| oscillator | waveform_cv | Duplicate port |

### ✅ Valid Blocks (84)
All other blocks passed validation.
```

## Quick Validation Command

```bash
# Run from project root
npx ts-node execution/validate_cv_ports.ts
```

## Integration

This skill should be run:
- Before committing new block definitions
- After bulk updates to block library
- When debugging CV-related issues

## Error Recovery

| Issue | Fix |
|-------|-----|
| Missing CV port | Add port to `ports[]` array with `{param}_cv` id |
| BOOL with CV | Convert to FLOAT with 0-1 range |
| Duplicate port | Remove duplicate from `ports[]` array |
| Name mismatch | Rename port to match `{param}_cv` pattern |
