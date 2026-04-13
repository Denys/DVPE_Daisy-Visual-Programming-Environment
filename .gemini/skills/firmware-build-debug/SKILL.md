---
name: firmware-build-debug
description: |
  Debug and fix Daisy firmware compilation errors.
  Use when make fails, Makefile path issues, LGPL flag problems, missing headers,
  or platform-specific build errors for Seed, Pod, or Field.
  Trigger keywords: make error, compile fail, build error, Makefile, LGPL,
  undefined reference, daisy_pod.h, daisy_seed.h, daisy_field.h.
---

# Firmware Build Debug

## Overview
Diagnose and resolve Daisy platform firmware compilation failures.

## Common Error Categories

### 1. Makefile Path Errors
**Symptom**: `No rule to make target`, `cannot find -ldaisy`

**Fix**: Check directory depth in Makefile
```makefile
# Count directories from project to DaisySP root
# Example: MyProjects/bundle/category/project/ = 4 levels up
LIBDAISY_DIR = ../../../../libDaisy
DAISYSP_DIR = ../../../../DaisySP
```

### 2. LGPL Module Errors
**Symptom**: `undefined reference to` MoogLadder, ReverbSc, StringVoice, ModalVoice, Compressor

**Fix**: Add LGPL flag to Makefile
```makefile
# BEFORE the include statement
USE_DAISYSP_LGPL = 1

SYSTEM_FILES_DIR = $(LIBDAISY_DIR)/core
include $(SYSTEM_FILES_DIR)/Makefile
```

**LGPL Modules**:
- `MoogLadder` (filter)
- `ReverbSc` (reverb)
- `StringVoice` (physical modeling)
- `ModalVoice` (physical modeling)
- `Compressor` (dynamics)
- `ATone` (filter)

### 3. Platform Header Errors
**Symptom**: `daisy_pod.h: No such file`, hardware struct undefined

**Fix**: Use correct include for platform
```cpp
// Seed
#include "daisy_seed.h"
DaisySeed hw;

// Pod
#include "daisy_pod.h"
DaisyPod hw;

// Field
#include "daisy_field.h"
DaisyField hw;
```

### 4. Audio Callback Mismatch
**Symptom**: Compiler error in callback signature, no audio output

**Fix**: Match callback to platform

**Pod/Seed (Interleaved)**:
```cpp
void AudioCallback(AudioHandle::InterleavingInputBuffer in,
                   AudioHandle::InterleavingOutputBuffer out,
                   size_t size) {
    for(size_t i = 0; i < size; i += 2) {
        out[i] = out[i+1] = /* mono signal */;
    }
}
```

**Field (Non-Interleaved)**:
```cpp
void AudioCallback(AudioHandle::InputBuffer in,
                   AudioHandle::OutputBuffer out,
                   size_t size) {
    for(size_t i = 0; i < size; i++) {
        out[0][i] = out[1][i] = /* mono signal */;
    }
}
```

### 5. Missing Init Calls
**Symptom**: Crash, no audio, garbage output

**Fix**: Initialize DSP before StartAudio
```cpp
int main(void) {
    hw.Init();
    float sr = hw.AudioSampleRate();
    
    // DSP init BEFORE StartAudio
    osc.Init(sr);
    filt.Init(sr);
    env.Init(sr);
    
    hw.StartAdc();  // Pod/Field only
    hw.StartAudio(AudioCallback);
    
    while(1) {}
}
```

## Workflow

### Step 1: Capture Build Error
```bash
make clean && make 2>&1 | head -50
```

### Step 2: Classify Error Type
- Path error → Fix Makefile paths
- LGPL error → Add USE_DAISYSP_LGPL
- Header error → Fix include statement
- Callback error → Match platform signature
- Init error → Add missing .Init() calls

### Step 3: Apply Fix
Edit the appropriate file (Makefile or .cpp)

### Step 4: Rebuild
```bash
make clean && make
```

### Step 5: Flash (if successful)
```bash
make program-dfu
```

## Self-Verification Checklist

| ✓ | Check |
|---|-------|
| □ | Correct include: `daisy_{platform}.h` |
| □ | `using namespace daisy; using namespace daisysp;` |
| □ | All DSP `.Init(sr)` before `StartAudio()` |
| □ | `hw.StartAdc()` before `hw.StartAudio()` (Pod/Field) |
| □ | Callback matches platform (interleaved vs non-interleaved) |
| □ | LGPL flag set if using LGPL modules |
| □ | Makefile paths match directory depth |
| □ | NO malloc/printf in AudioCallback |

## Resources
- [DAISY_EXPERT_SP_v5.2](file:///_agentic_promts/DAISY_EXPERT_SP_v5.2.md)
- [libDaisy Examples](https://github.com/electro-smith/libDaisy/tree/master/examples)
- [DaisySP Examples](https://github.com/electro-smith/DaisySP/tree/master/examples)
