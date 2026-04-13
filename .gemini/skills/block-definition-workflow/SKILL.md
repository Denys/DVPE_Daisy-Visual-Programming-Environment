---
name: block-definition-workflow
description: |
  Create and validate new TypeScript block definitions for DVPE.
  Use when adding DSP modules, creating blocks, defining ports/parameters, or
  implementing new effects, sources, filters, or utility blocks.
  Trigger keywords: new block, add block, block definition, create effect,
  add oscillator, add filter, definitionId, TypeScript block.
---

# Block Definition Workflow

## Overview
End-to-end workflow for adding new DSP blocks to the DVPE block library.

## Directives Used
- Block schema validation (inline)
- Registry registration pattern
- Test file creation pattern

## Workflow

### Step 1: Analyze DaisySP Module
**Action**: Query Context7 for DaisySP documentation
**Tool**: `mcp_context7_query-docs`
**Query**: `"[ModuleName] Init Process SetFreq"`
**Output**: Module API (Init params, Process signature, setters)

### Step 2: Create Block Definition File
**Location**: `dvpe_CLD/src/core/blocks/definitions/{category}/{blockName}.ts`

**Template**:
```typescript
import { BlockDefinition, BlockCategory, PortType, BlockColorScheme } from '../types';

export const {blockName}Block: BlockDefinition = {
  id: '{blockId}',
  name: '{Block Display Name}',
  category: BlockCategory.{CATEGORY},
  description: '{Brief description}',
  colorScheme: BlockColorScheme.{SCHEME},
  
  inputs: [
    { id: 'input', name: 'Input', type: PortType.AUDIO, description: 'Audio input' }
  ],
  
  outputs: [
    { id: 'output', name: 'Output', type: PortType.AUDIO, description: 'Audio output' }
  ],
  
  parameters: [
    {
      id: 'param1',
      name: 'Parameter 1',
      min: 0, max: 1, defaultValue: 0.5,
      unit: '',
      description: 'Parameter description',
      cppSetter: 'SetParam1',
      cvModulatable: true
    }
  ],
  
  cppIncludes: ['daisysp.h'],
  cppType: 'daisysp::{ModuleName}',
  cppInit: '{instance}.Init(samplerate);',
  cppProcess: 'float {output} = {instance}.Process({input});'
};
```

### Step 3: Export from Index
**File**: `dvpe_CLD/src/core/blocks/definitions/index.ts`
**Add**:
```typescript
export { {blockName}Block } from './{category}/{blockName}';
```

### Step 4: Register in BlockRegistry
**File**: `dvpe_CLD/src/core/blocks/BlockRegistry.ts`
**Add to imports and `registerCoreBlocks()`**:
```typescript
import { {blockName}Block } from './definitions';
// ...
this.register({blockName}Block);
```

### Step 5: Create Test File
**File**: `dvpe_CLD/src/core/blocks/{BlockName}Validation.test.ts`

**Template**:
```typescript
import { describe, it, expect } from 'vitest';
import { {blockName}Block } from './definitions';

describe('{BlockName} Block Validation', () => {
  it('should have valid block definition', () => {
    expect({blockName}Block.id).toBe('{blockId}');
    expect({blockName}Block.cppType).toBeDefined();
  });
  
  it('should have required ports', () => {
    expect({blockName}Block.inputs.length).toBeGreaterThan(0);
    expect({blockName}Block.outputs.length).toBeGreaterThan(0);
  });
  
  it('should have valid parameters', () => {
    {blockName}Block.parameters?.forEach(p => {
      expect(p.min).toBeLessThanOrEqual(p.defaultValue);
      expect(p.defaultValue).toBeLessThanOrEqual(p.max);
    });
  });
});
```

### Step 6: Run Tests
**Command**: `npm test -- src/core/blocks/{BlockName}Validation.test.ts`
**Success**: All tests pass

## Error Handling

**TypeScript Error** (missing property):
- Check `BlockDefinition` interface in `types.ts`
- Ensure all required fields are present

**Registry Error** (duplicate ID):
- Check existing blocks for ID collision
- Use unique `id` field

**Test Failure** (parameter validation):
- Verify `min <= defaultValue <= max`
- Check `cppSetter` matches DaisySP method name

## Validation

**Success Criteria**:
- [ ] Block file created in correct category folder
- [ ] Exported from `definitions/index.ts`
- [ ] Registered in `BlockRegistry.ts`
- [ ] Tests pass (`npm test`)
- [ ] Block appears in DVPE sidebar

## Color Scheme Reference

| Category | Scheme |
|----------|--------|
| Sources | `SOURCE` |
| Filters | `FILTER` |
| Effects | `EFFECT` |
| Dynamics | `DYNAMICS` |
| Utility | `LOGIC` |
| Mixing | `MIXING` |
| I/O | `IO` |

## Resources
- [Block Definition Types](file:///dvpe_CLD/src/core/blocks/types.ts)
- [Existing Blocks](file:///dvpe_CLD/src/core/blocks/definitions/)
- [DaisySP Docs](https://electro-smith.github.io/DaisySP/)
