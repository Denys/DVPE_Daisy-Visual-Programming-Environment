---
name: test-coverage-workflow
description: |
  Create and run DVPE TypeScript tests with coverage reports.
  Use when adding tests, checking coverage, validating block definitions,
  running test suites, or when user mentions test, coverage, vitest, or validation.
---

# Test Coverage Workflow

## Overview
Execute DVPE test suites and create new test files for block validation.

## Quick Commands

### Run All Tests
```bash
cd dvpe_CLD
npm test
```

### Run Specific Test File
```bash
npm test -- src/core/blocks/BlockRegistry.test.ts
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

## Test File Patterns

### Block Validation Tests
**Location**: `dvpe_CLD/src/core/blocks/`
**Naming**: `{BlockName}Validation.test.ts` or `{Phase}BlockValidation.test.ts`

**Template**:
```typescript
import { describe, it, expect } from 'vitest';
import { blockName } from './definitions';

describe('BlockName Block Validation', () => {
  it('should have valid definition structure', () => {
    expect(blockName.id).toBe('expected-id');
    expect(blockName.category).toBeDefined();
    expect(blockName.cppType).toBeDefined();
  });

  it('should have required ports', () => {
    expect(blockName.inputs.length).toBeGreaterThan(0);
    expect(blockName.outputs.length).toBeGreaterThan(0);
  });

  it('should have valid parameter ranges', () => {
    blockName.parameters?.forEach(param => {
      expect(param.min).toBeLessThanOrEqual(param.defaultValue);
      expect(param.defaultValue).toBeLessThanOrEqual(param.max);
      expect(param.cppSetter).toBeDefined();
    });
  });

  it('should have cvModulatable set correctly', () => {
    const cvParams = blockName.parameters?.filter(p => p.cvModulatable);
    // At least one CV-modulatable parameter for audio blocks
    expect(cvParams?.length).toBeGreaterThan(0);
  });
});
```

### Phase-Based Test Files
| File | Covers |
|------|--------|
| `Phase1BlockValidation.test.ts` | Core DSP blocks (LFO, Noise, Chorus, etc.) |
| `GlobalBlockValidation.test.ts` | All registered blocks |
| `DAFXPhase4BlockValidation.test.ts` | DAFX integration blocks |
| `BlockRegistry.test.ts` | Registry functions |

## Workflow

### Step 1: Identify Test Scope
- Single block → Create `{Block}Validation.test.ts`
- Multiple blocks → Add to phase file
- All blocks → Use `GlobalBlockValidation.test.ts`

### Step 2: Create/Update Test File
Use template above, customize assertions

### Step 3: Run Tests
```bash
npm test -- src/core/blocks/{TestFile}.test.ts
```

### Step 4: Check Coverage
```bash
npm test -- --coverage
```

**Target**: 80%+ coverage on block definitions

### Step 5: Document Results
Update CHECKPOINT.md with test count and pass rate

## Common Test Patterns

### CV Port Visibility Test
```typescript
it('should have CV ports for modulatable parameters', () => {
  const cvPorts = blockName.inputs.filter(p => p.id.endsWith('_cv'));
  const cvParams = blockName.parameters?.filter(p => p.cvModulatable) ?? [];
  expect(cvPorts.length).toBeGreaterThanOrEqual(cvParams.length);
});
```

### Code Generation Test
```typescript
it('should have valid cpp templates', () => {
  expect(blockName.cppIncludes).toContain('daisysp.h');
  expect(blockName.cppInit).toContain('.Init(');
  expect(blockName.cppProcess).toContain('.Process(');
});
```

### Dynamic Input Test (MUX/ADD)
```typescript
it('should support dynamic inputs', () => {
  expect(blockName.supportsDynamicInputs).toBe(true);
  expect(blockName.minInputs).toBeDefined();
  expect(blockName.maxInputs).toBeDefined();
});
```

## Test Results Interpretation

| Result | Meaning | Action |
|--------|---------|--------|
| ✅ Pass | All assertions true | Continue |
| ❌ Fail | Assertion failed | Fix block definition |
| ⏭️ Skip | Test skipped | Review skip condition |
| ⚠️ Warning | Non-fatal issue | Consider addressing |

## Resources
- [Vitest Documentation](https://vitest.dev/)
- [Existing Tests](file:///dvpe_CLD/src/core/blocks/)
- [/run-tests workflow](file:///.agent/workflows/run-tests.md)
