---
name: bug-triage-workflow
description: |
  Triage, diagnose, and resolve DVPE bugs with proper documentation.
  Use when fixing bugs, documenting issues, investigating errors, or when
  user mentions bug, fix, broken, error, not working, or issue.
  Updates dvpe_bugs.md with structured entries.
---

# Bug Triage Workflow

## Overview
Systematic process for diagnosing, fixing, and documenting DVPE bugs.

## Workflow

### Step 1: Capture Bug Details
**Gather**:
- Error message or unexpected behavior
- Steps to reproduce
- Affected files/components
- Expected vs actual behavior

### Step 2: Assign Bug Number
**Check**: `dvpe_bugs.md` for latest bug number
**Assign**: Next sequential number (e.g., Bug #011)

### Step 3: Classify Bug Type

| Type | Description | Example |
|------|-------------|---------|
| Schema | .dvpe file structure | Missing `patch` wrapper |
| Block | Block definition issue | Missing CV port |
| CodeGen | C++ generation error | Wrong platform header |
| UI | Visual/interaction bug | Port not visible |
| Test | Test failure | False positive |

### Step 4: Diagnose Root Cause
**Questions**:
1. When did this start working/failing?
2. What changed recently?
3. Is it reproducible?
4. Does it affect all platforms or one?

**Tools**:
- `grep_search` for pattern matching
- `view_file` for code inspection
- `npm test` for test validation

### Step 5: Implement Fix
**Follow**:
1. Make minimal targeted change
2. Avoid unrelated refactoring
3. Add defensive code if needed

### Step 6: Verify Fix
```bash
npm test -- [relevant test file]
npm run build
```

### Step 7: Document in dvpe_bugs.md

**Entry Format**:
```markdown
### Bug #NNN: [Short Title]

**Status**: ✅ RESOLVED | 🔄 IN PROGRESS | ❌ OPEN
**Date**: YYYY-MM-DD
**Category**: Schema | Block | CodeGen | UI | Test

**Symptom**:
[What the user sees/experiences]

**Root Cause**:
[Why it happened]

**Fix**:
[What was changed]

**Files Modified**:
- `path/to/file.ts` — [brief change description]

**Prevention**:
[How to avoid in future]

**Verification**:
- [ ] Tests pass
- [ ] Manual verification complete
```

### Step 8: Update Related Files
- **CHECKPOINT.md**: Add to "Recent Changes" if significant
- **Test file**: Add regression test if applicable
- **Block definition**: Fix schema if block-related

## Bug Entry Template

Copy this template:

```markdown
### Bug #NNN: TITLE

**Status**: ✅ RESOLVED
**Date**: 2026-01-XX
**Category**: 

**Symptom**:


**Root Cause**:


**Fix**:


**Files Modified**:
- 

**Prevention**:


**Verification**:
- [x] Tests pass
```

## Common Bug Patterns

### Pattern 1: Missing CV Port
**Symptom**: Parameter not controllable via CV
**Fix**: Add port to block's `inputs` array, enable `cvModulatable: true`

### Pattern 2: Schema Mismatch
**Symptom**: File won't load
**Fix**: Use correct property names (`definitionId`, `parameterValues`, `sourceBlockId`)

### Pattern 3: Wrong Platform Code
**Symptom**: Compile error on specific platform
**Fix**: Check audio callback signature, header include

### Pattern 4: Parameter Range
**Symptom**: Value clipping or weird behavior
**Fix**: Verify `min <= defaultValue <= max`

## Resources
- [Bug Log](file:///dvpe_bugs.md)
- [AGENTS.md Error Recovery](file:///_agentic_promts/AGENTS.md)
