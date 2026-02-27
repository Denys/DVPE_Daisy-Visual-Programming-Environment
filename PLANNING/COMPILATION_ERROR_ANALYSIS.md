# Compilation Error Analysis Report
**Date**: 2026-01-21
**File**: `pod_multi_effect.cpp`
**Platform**: Daisy Pod

---

## Error Summary

| # | Error | Line | Type |
|---|-------|------|------|
| 1 | `'ReverbSc' does not name a type` | 123 | Type Resolution |
| 2 | `'block_reverb_1' was not declared in this scope` | 226 | Cascading from #1 |
| 3 | `no matching function for call to DelayLine<...>::Init(float&)` | 229 | API Signature Mismatch |

---

## Error #1: ReverbSc Type Not Found

### Symptom
```
pod_multi_effect.cpp:123:1: error: 'ReverbSc' does not name a type
  123 | ReverbSc block_reverb_1;
```

### Root Cause Analysis

**Hypothesis 1**: LGPL include path missing
- ReverbSc is in `DaisySP-LGPL/Source/Effects/reverbsc.h`
- Makefile sets `USE_DAISYSP_LGPL = 1` but may not add include path
- Standard DaisySP include: `-I../../DaisyExamples/DaisySP/Source`
- LGPL include needed: `-I../../DaisyExamples/DaisySP/DaisySP-LGPL/Source`

**Hypothesis 2**: LGPL header not included in daisysp.h
- Main header `daisysp.h` may not include LGPL modules
- Code includes `#include "daisysp.h"` but ReverbSc might require explicit include

**Origin**: CodeGenerator.ts generates Makefile with `USE_DAISYSP_LGPL = 1` flag (line 1928) but:
- Does NOT add LGPL include path to `C_INCLUDES`
- Only adds source file to `CPP_SOURCES` (line 1933)
- Include path addition is missing

### Hypothesis Test Results

**✅ HYPOTHESIS CONFIRMED** - Read CodeGenerator.ts lines 1925-1936:

```typescript
// Line 1925: lgplBlocks includes 'reverb' but block uses 'reverb_sc'
const lgplBlocks = ['moog_ladder', 'reverb', 'phaser', ...];
const usesLgpl = this.patch.blocks.some(b => lgplBlocks.includes(b.definitionId));
// Result: usesLgpl = false (because 'reverb_sc' not in array)

// Line 1931: Include path IS added - code is correct
lgplConfig += 'C_INCLUDES += -I$(DAISYSP_DIR)/DaisySP-LGPL/Source\n';

// Line 1934: Checks for 'reverb' but block uses 'reverb_sc' - MISMATCH
if (this.patch.blocks.some(b => b.definitionId === 'reverb')) {
    lgplConfig += 'CPP_SOURCES += $(DAISYSP_DIR)/DaisySP-LGPL/Source/Effects/reverbsc.cpp\n';
}
// Result: Condition false, reverbsc.cpp never added
```

**Root Cause**: Same as Bug #012 - block ID mismatch. Array uses `'reverb'` but actual definition is `'reverb_sc'`, so LGPL detection fails and entire config is skipped.

**Makefile Verification**: Read actual Makefile - confirmed NO LGPL config present (only 14 lines, no USE_DAISYSP_LGPL).

### Solution

**Fix CodeGenerator.ts** lines 1925 and 1934:
```typescript
// Add 'reverb_sc' and 'delay_line' aliases to detection array
const lgplBlocks = ['moog_ladder', 'reverb', 'reverb_sc', 'phaser', ...];

// Check for both IDs
if (this.patch.blocks.some(b => b.definitionId === 'reverb' || b.definitionId === 'reverb_sc')) {
    lgplConfig += 'CPP_SOURCES += $(DAISYSP_DIR)/DaisySP-LGPL/Source/Effects/reverbsc.cpp\n';
}
```

---

## Error #3: DelayLine Init Signature Mismatch

### Symptom
```
pod_multi_effect.cpp:229: error: no matching function for call to
'daisysp::DelayLine<float, 96000>::Init(float&)'

note: candidate: 'void daisysp::DelayLine<T, max_size>::Init() [with T = float; unsigned int max_size = 96000]'
note: candidate expects 0 arguments, 1 provided
```

### Root Cause Analysis

**Actual DaisySP API** (from `delayline.h:35`):
```cpp
void Init() { Reset(); }  // Takes 0 arguments
```

**Generated Code** (line 229):
```cpp
block_delay_1.Init(sr);  // Passes sample rate - WRONG
```

**Origin**: CodeGenerator.ts `generateDelayCode()` method generates incorrect initialization in `generateMain()`.

Looking at the code generation flow:
1. `generateMain()` calls init for all blocks
2. For DelayLine, it incorrectly adds `.Init(sr)`
3. DelayLine template class doesn't take sample rate in Init()

**Previous Fix Attempt** (from action_report.md):
> "Updated CodeGenerator.ts to call `Init()` without arguments for delay blocks"

This fix was claimed but apparently NOT applied, or applied incorrectly.

### Hypothesis Test Results

**✅ HYPOTHESIS CONFIRMED** - Read CodeGenerator.ts lines 1863-1876:

```typescript
// Line 1863: Special case for 'delay' ID
} else if (def.id === 'delay') {
    lines.push(`    ${instanceName}.Init();`);  // Correct - no args
```

**But actual block definition ID is `'delay_line'`**, so this case doesn't match!

The block falls through to the default else case:
```typescript
// Line 1876: Default case for all other blocks
} else {
    lines.push(`    ${instanceName}.Init(sr);`);  // WRONG for DelayLine
```

**Root Cause**: Same as Error #1 - block ID mismatch. Special case checks for `'delay'` but block uses `'delay_line'`, so it falls to default which incorrectly passes `sr`.

### Solution

**Fix CodeGenerator.ts** line 1863:
```typescript
} else if (def.id === 'delay' || def.id === 'delay_line') {
    lines.push(`    ${instanceName}.Init();`);
```

---

## Error #2: block_reverb_1 Undeclared (Cascading)

### Symptom
```
pod_multi_effect.cpp:226:5: error: 'block_reverb_1' was not declared in this scope
  226 |     block_reverb_1.Init(sr);
```

### Root Cause
This is a **cascading error** from Error #1. Once ReverbSc type is found, the declaration `ReverbSc block_reverb_1;` will succeed and this error disappears.

**No separate fix needed** - resolves when Error #1 is fixed.

---

## Testing Plan

### Pre-Test Verification
Before applying fixes, verify current Makefile content:
1. Check if `C_INCLUDES` has LGPL path
2. Check if `CPP_SOURCES` has reverbsc.cpp
3. Check DelayLine initialization code

### Test Sequence
1. **Fix #1**: Add LGPL include path to Makefile
2. **Verify**: Check if ReverbSc type resolves
3. **Fix #3**: Remove `sr` parameter from DelayLine Init
4. **Verify**: Run `make clean && make`
5. **Success Criteria**: Clean compilation to `.bin` file

### Expected Results
- ✅ ReverbSc type found
- ✅ block_reverb_1 declared successfully
- ✅ DelayLine Init() called correctly
- ✅ Binary file generated: `build/pod_multi_effect.bin`

---

## Prevention Strategy

### Systematic Issues Identified
1. **Incomplete LGPL Support**: Flag set but include path missing
2. **API Signature Assumptions**: Init() methods not verified against actual DaisySP headers
3. **Lack of Signature Validation**: CodeGenerator doesn't validate API calls against actual library signatures

### Recommended Improvements
1. **Add include path validation** in CodeGenerator tests
2. **Create API signature reference** for all DaisySP modules
3. **Add compilation test** to CI/CD for generated code
4. **Document LGPL setup** in CodeGenerator.ts comments

---

## Next Steps
1. Read current Makefile to verify LGPL configuration
2. Read CodeGenerator.ts to locate init generation logic
3. Apply fixes
4. Test compilation
5. Update dvpe_bugs.md with findings
