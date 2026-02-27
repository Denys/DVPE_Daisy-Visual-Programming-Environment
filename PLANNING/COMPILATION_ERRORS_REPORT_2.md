# Pod_Multi_Effect_test Compilation Error Report

**Date**: 2026-01-21
**Project**: Pod_Multi_Effect_test
**Platform**: Daisy Pod (target), but code seems to target Daisy Seed improperly.

## Overview
The generated C++ code for `Pod_Multi_Effect_test` failed to compile with multiple errors. Many of these point to issues in the CodeGenerator not correctly handling platform specifics (Daisy Pod vs Seed), missing definitions, or incorrect API usage for certain DaisySP modules (Decimator, CrossFade, DelayLine).

## Detailed Error Analysis

### 1. Hardware Class Mismatch
**Error**:
```
Pod_Multi_Effect_test.cpp:171:8: error: 'class daisy::DaisySeed' has no member named 'ProcessAllControls'
Pod_Multi_Effect_test.cpp:238:8: error: 'class daisy::DaisySeed' has no member named 'StartAdc'; did you mean 'StartAudio'?
```
**Root Cause**:
The generated code declares `DaisySeed hw;` instead of `DaisyPod hw;` (or checks `patch.hardwareConfig.platform` incorrectly).
- `DaisySeed` does not have `ProcessAllControls()` (it uses specific control processing) or `StartAdc()` (usually called differently or part of `Init`).
- **Fix**: Ensure `CodeGenerator.ts` generates `DaisyPod hw;` when the target platform is 'pod', and uses the correct `hw.ProcessAllControls()` which exists on `DaisyPod`.

### 2. Missing Types / Definitions
**Error**:
```
Pod_Multi_Effect_test.cpp:120:1: error: 'ReverbSc' does not name a type
Pod_Multi_Effect_test.cpp:121:18: error: 'MAX_DELAY' was not declared in this scope; did you mean 'HAL_MAX_DELAY'?
```
**Root Cause**:
- `ReverbSc`: Likely missing `#include "daisysp.h"` or specifically `#include "daisysp.h"` is not exposing it (namespace issue? or `USE_DAISYSP_LGPL` macro needed?). `ReverbSc` is in `daisysp`.
- `MAX_DELAY`: The generated code uses `MAX_DELAY` for `DelayLine` template argument but never defines it.
- **Fix**:
    - Ensure `using namespace daisysp;` is present.
    - Check if `ReverbSc` requires specific header or if it's available in `daisysp.h`.
    - **Crucial**: `CodeGenerator.ts` must generate `#define MAX_DELAY static_cast<size_t>(sr * 0.75f)` or similar at the top of the file if `DelayLine` is used. Or simply `#define MAX_DELAY 48000` (1 second).

### 3. Incorrect API Usage (Process Arguments)
**Error**:
```
Pod_Multi_Effect_test.cpp:211:63: error: cannot bind non-const lvalue reference of type 'float&' to an rvalue of type 'float'
  211 |         sig_block_crossfade_1_out = block_crossfade_1.Process(0.0f, 0.0f);
```
**Root Cause**:
`CrossFade::Process(float &in1, float &in2)` takes **references**. Passing literal floats `0.0f` is invalid C++.
- **Fix**: Create temporary variables for inputs if they are literals, or ensure we pass valid float variables.

### 4. Incorrect API Usage (Init Arguments)
**Error**:
```
Pod_Multi_Effect_test.cpp:232:30: error: no matching function for call to 'daisysp::Decimator::Init(float&)'
../../DaisyExamples/DaisySP/Source/Effects/decimator.h:26:10: note:   candidate expects 0 arguments, 1 provided
```
**Root Cause**:
`Decimator::Init()` takes **no arguments** (void), but the generator passed `sr` (sample rate).
- **Fix**: Update `CodeGenerator.ts` `generateInitCode` (or block def) for `decimator` to not pass arguments.

### 5. Missing Variable Declarations (LEDs)
**Error**:
```
Pod_Multi_Effect_test.cpp:225:5: error: 'block_led_1' was not declared in this scope
```
**Root Cause**:
The generated code tries to init `block_led_1` but it was never declared as a global/member variable.
- CodeGenerator likely skips declaration for "I/O blocks" but tries to init them? Or `led` block is treated as an I/O block that doesn't need a DSP class, but then why `Init` it?
- **Fix**: `Led` blocks (if they wrap hardware LEDs) probably shouldn't be separate C++ classes if they just map to `hw.led1`. Or if they are custom classes, they must be declared. `DaisyPod` has `hw.led1` and `hw.led2`. We shouldn't generate separate `block_led_1` objects if we map to hardware LEDs.

### 6. Template Argument Logic
**Error**:
```
Pod_Multi_Effect_test.cpp:121:27: error: template argument 2 is invalid
  121 | DelayLine<float, MAX_DELAY> block_delay_1;
```
**Root Cause**:
Cascades from missing `MAX_DELAY`.

---

## Action Plan

1.  **Fix `CodeGenerator.ts`**:
    - **Platform Detection**: Verify `generateDeclarations` uses `DaisyPod` when appropriate.
    - **DelayLine**: Add `#define MAX_DELAY` generation.
    - **Decimator**: Fix `Init()` call to be empty.
    - **CrossFade**: Fix `Process()` to handle reference arguments (assign literals to temp vars).
    - **LEDs**: Check `Led` block handling. If mapping to hardware LEDs, do not generate `Init` calls for phantom objects.
    - **ReverbSc**: Verify namespace/include.

2.  **Regenerate & Test**:
    - Regenerate `Pod_Multi_Effect_test.cpp`.
    - Run `make`.
