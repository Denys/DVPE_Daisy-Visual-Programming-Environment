---
description: Run TypeScript unit tests with coverage report
---

# Run DVPE Test Suite

This workflow executes all TypeScript/Jest unit tests for the DVPE project and generates a coverage report.

## Prerequisites
- Node.js and npm installed
- Dependencies installed (`npm install` in `dvpe_CLD/`)

## Steps

### 1. Navigate to Frontend Directory
// turbo
```bash
cd dvpe_CLD
```

### 2. Run All Tests
// turbo
```bash
npm test
```

**Expected Output**: 
- Current status: **379 tests passing (100%)**
- Test categories: Blocks, CodeGen, Graph Analysis, UI Validation

### 3. Run Specific Test Suite (Optional)
```bash
# Block definitions only
npm test -- --testPathPattern="definitions"

# Code generator only
npm test -- CodeGenerator

# Graph analysis only
npm test -- GraphAnalyzer
```

### 4. Run with Coverage Report
```bash
npm test -- --coverage
```

Coverage report will be generated in `dvpe_CLD/coverage/`

### 5. Watch Mode (For Development)
```bash
npm test -- --watch
```

Auto-reruns tests when files change.

## Test Categories

| Category | Test File Pattern | Coverage |
|----------|------------------|----------|
| **Block Definitions** | `*.test.ts` in `definitions/` | 82 blocks |
| **Code Generation** | `CodeGenerator.test.ts` | C++ output |
| **Graph Analysis** | `GraphAnalyzer.test.ts` | Cycle detection, topological sort |
| **Custom Blocks** | `CustomBlockManager.test.ts` | Phase 11/12 features |
| **Validation** | `Phase12BlockValidation.test.ts` | Schema validation |

## Interpreting Results

### ✅ All Tests Passing
Continue development confidently.

### ❌ Test Failures
1. Read the error message carefully
2. Check which block or feature failed
3. Review recent changes to related files
4. Fix the issue and re-run tests

## Quick Debugging
```bash
# Run single test file
npm test -- BlockName.test.ts

# Verbose output
npm test -- --verbose

# Update snapshots (use carefully)
npm test -- -u
```
