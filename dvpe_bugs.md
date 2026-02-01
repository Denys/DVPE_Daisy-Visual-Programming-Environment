# DVPE Implementation Bug Log

**Last Reviewed**: 2026-01-30 (session end, no changes)

A lessons-learned document for DVPE block development. Check this **before** implementing new blocks.

---

## Block Implementation Checklist

Use this checklist for every new block to avoid common bugs:

```
□ Block Definition File
  □ cvModulatable: true on parameters that should be CV controllable
  □ CV input ports in ports[] array for each cvModulatable parameter
  □ Trigger port if block is triggerable (drums, physical modeling)
  □ Correct category (DRUMS, PHYSICAL_MODELING, EFFECTS, etc.)

□ BlockRegistry.ts
  □ Import added
  □ Block added to allBlocks array

□ index.ts (definitions)
  □ Export added

□ CodeGenerator.ts
  □ Switch case added in generateBlockProcessing()
  □ Generator method implemented
  □ Added to skipBlocks list if inline implementation
```

---

## Bug #001: Missing CV Toggle in Inspector (RESOLVED)

**Date**: 2026-01-09  
**Status**: ✅ RESOLVED  
**Blocks Affected**: All Phase 3 drum blocks

**Symptom**: Inspector panel showed parameters but no "CV" toggle checkbox.

**Root Cause**: Parameters missing `cvModulatable: true` property.

**Fix**: Add to each parameter that should support CV modulation:
```typescript
{
    id: 'freq',
    displayName: 'Pitch',
    type: ParameterType.FLOAT,
    cvModulatable: true,  // ← ADD THIS
    // ...
}
```

---

## Bug #002: Missing CV Ports on Canvas (RESOLVED)

**Date**: 2026-01-09  
**Status**: ✅ RESOLVED  
**Blocks Affected**: All Phase 3 drum blocks

**Symptom**: Block on canvas only showed TRIG port, no CV input ports (yellow dots) like Oscillator.

**Root Cause**: `cvModulatable: true` only enables Inspector toggle. Canvas ports require explicit port definitions in the `ports[]` array.

**Fix**: Add CV input ports for each modulatable parameter:
```typescript
ports: [
    { id: 'trig', displayName: 'TRIG', signalType: SignalType.TRIGGER, direction: PortDirection.INPUT },
    { id: 'freq_cv', displayName: 'PITCH CV', signalType: SignalType.CV, direction: PortDirection.INPUT },  // ← ADD
    { id: 'tone_cv', displayName: 'TONE CV', signalType: SignalType.CV, direction: PortDirection.INPUT },   // ← ADD
    { id: 'out', displayName: 'OUT', signalType: SignalType.AUDIO, direction: PortDirection.OUTPUT },
]
```

**Reference**: See `oscillator.ts` for correct pattern with `freq_cv`, `amp_cv`, `pw_cv` ports.

---

## Bug #003: Missing Public Setter Parameters (RESOLVED)

**Date**: 2026-01-09  
**Status**: ✅ RESOLVED  
**Blocks Affected**: All Phase 3 drum blocks

**Symptom**: Some DaisySP public setters were not exposed as parameters in block definitions.

**Root Cause**: Block definitions created without verifying all public methods in DaisySP class.

**Missing Parameters Found**:
- HiHat: `SetNoisiness` (mix between tone and noise)
- All drums: `SetAccent` missing `cvModulatable` and CV port

**Fix**: Before creating a block, check DaisySP documentation for all public setters:
```
1. Search: "DaisySP [ClassName] public methods"
2. Compare with block definition parameters
3. Add missing SetXxx methods as parameters
4. Add cvModulatable: true for all float parameters
5. Add corresponding CV ports
```

---

## Bug #004: Chatbot Schema Generation Errors (RESOLVED)

**Date**: 2026-01-14  
**Status**: ✅ RESOLVED  
**Component**: AI Patch Generator (`prototypes/ai_patch_generator/app.py`)

**Symptom**: AI-generated `.dvpe` files failed to load in DVPE with schema validation errors.

**Affected Files**:
- `pod_drum_machine__chat-gen_NOT-WORKING.dvpe`
- `seed_drum_machine__chat-gen_NOT-WORKING.dvpe`
- `seed_physical_string__chat-gen_NOT-WORKING.dvpe`

**Root Causes** (4 critical schema issues):

1. **Missing Top-Level Wrapper**
   - ❌ Generated: `{ "metadata": {...}, "blocks": [...] }`
   - ✅ Required: `{ "version": "1.0.0", "patch": { ... } }`

2. **Incorrect Block Properties**
   - ❌ Generated: `"type": "analog_bass_drum", "parameters": {...}`
   - ✅ Required: `"definitionId": "analog_bass_drum", "parameterValues": {...}`

3. **Incorrect Connection Properties**
   - ❌ Generated: `"sourceId"`, `"sourcePort"`, `"targetId"`, `"targetPort"`
   - ✅ Required: `"sourceBlockId"`, `"sourcePortId"`, `"targetBlockId"`, `"targetPortId"`

4. **Missing Metadata Fields**
   - ❌ Generated: Incomplete or missing `hardwareConfig`, `sampleRate`, `blockSize`
   - ✅ Required: Complete `ProjectMetadata` with all required fields

**Additional Issues**:
- Audio Output port IDs: Used `out_l`/`out_r` instead of `left`/`right`
- Missing `enabledCvPorts` array for blocks using CV modulation

**Fix**: Updated `app.py` `generate_patch_json()` function to:
1. Wrap output in `{ "version": "1.0.0", "patch": {...} }`
2. Use correct property names (`definitionId`, `parameterValues`)
3. Use correct connection property names (`sourceBlockId`, etc.)
4. Include complete metadata with hardware configuration

**Documentation**: Created `_block_diagrams_code/SCHEMA.md` (400+ lines) with:
- Complete v1.0.0 schema specification
- Examples of correct structure
- Common mistakes to avoid
- Template file reference

**Verification** (2026-01-18):
- ✅ `src/core/schema/ChatbotPatchValidation.test.ts` — 18 tests, all passing
- ✅ Regenerated all 3 failing files with correct schema
- ✅ Moved verified patches to `_block_diagrams_code/tested/` folder
- ✅ All drum blocks have `SetAccent` with `cvModulatable: true` and CV ports
- ✅ HiHat has `SetNoisiness` with `cvModulatable: true` and CV port

**Prevention**: 
- Always validate generated `.dvpe` files against `template.dvpe`
- Run `npm test ChatbotPatchValidation.test.ts` before promoting to `tested/`
- Reference `SCHEMA.md` when updating generator logic

---

## Bug #005: Missing CV Port for Flanger Delay Parameter (RESOLVED)

**Date**: 2026-01-18  
**Status**: ✅ RESOLVED

**Symptom**: `flanger` block had `delay` parameter with `cvModulatable: true` but no corresponding `delay_cv` port.

**Root Cause**: Original flanger definition was missing the CV port for the delay parameter.

**Fix**: Added `delay_cv` port to `flanger.ts`:
```typescript
{
    id: 'delay_cv',
    displayName: 'DLY CV',
    signalType: SignalType.CV,
    direction: PortDirection.INPUT,
    description: 'Delay modulation input',
}
```

**Verification**: All 475 tests now pass.

---

## Bug #006: Waveform Control Issues (RESOLVED)

**Date**: 2026-01-18  
**Status**: ✅ RESOLVED  
**Blocks Affected**: Oscillator, Tremolo

**Symptom**: Waveform CV control inconsistencies.

**Issues Found**:
1. **Oscillator**: Duplicate `waveform_cv` port (appeared twice in ports array)
2. **Tremolo**: `waveform` parameter missing `cvModulatable: true` flag

**Fix**:
1. Removed duplicate port from `oscillator.ts` 
2. Added `cvModulatable: true` to `tremolo.ts` waveform parameter

**Verification**: All 475 tests pass. Both blocks now have proper dual control (ENUM + CV).

---

## Bug #007: BOOL Parameters with CV Ports (RESOLVED)

**Date**: 2026-01-18  
**Status**: ✅ RESOLVED  
**Blocks Affected**: Synth Bass Drum, Compressor

**Symptom**: BOOL parameters had CV ports but couldn't be CV modulated.

**Root Cause**: Parameters defined as `ParameterType.BOOL` but with CV input ports. BOOL type cannot be CV modulated.

**Fix**: Converted both to FLOAT with 0.0-1.0 range:
- Synth Bass Drum `dirty`: BOOL → FLOAT (0 = clean, 1 = dirty)
- Compressor `auto_makeup`: BOOL → FLOAT (0 = off, 1 = full auto)

**Verification**: All 475 tests pass.

---

## Bug #008: Missing CV Ports - False Alarm (NO ACTION NEEDED)

**Date**: 2026-01-18  
**Status**: ✅ Already Fixed  

**User Report**: Missing CV ports for Chorus, Flanger, Autowah, Distortion, Limiter, DC Source.

**Investigation**: All reported CV ports already exist. User's bug list was outdated.

---

## Bug #009: Incorrect Block Color Schemes (RESOLVED)

**Date**: 2026-01-18  
**Status**: ✅ RESOLVED  
**Blocks Affected**: 17 blocks (Effects, Mixing, Utilities)

**Symptom**: Blocks appeared white/grey (default) or had incorrect categorization colors.

**Fix**: Updated `colorScheme` property:
- **Changed to AUDIO** (Signal Processing/Mixing): `autowah`, `balance`, `bitcrush`, `crossfade`, `decimator`, `distortion`, `hardClip`, `pan`, `phaser`, `pitchShifter`, `rectifier`, `sampleRateReducer`, `softClip`, `stereoMixer`, `tremolo`, `wavefolder`
- **Changed to LOGIC** (Dynamics/Gate): `gate`

**Verification**: Code inspection verified all files updated correctly.

---

### [RESOLVED] Bug #011: Missing Waveform CV Implementation
- **Block**: `oscillator`, `lfo`
- **Symptom**: Waveform selection cannot be modulated via CV (external port missing or ignored).
- **Fix**:
    - Updated `lfo.ts` to add `waveform_cv` port and `cvModulatable: true` flag.
    - Updated `CodeGenerator.ts` to implement mapping: `SetWaveform((uint8_t)(fminf(7.0f, fmaxf(0.0f, fabsf(cvVar) * 7.9f))))`.
    - Fixed parameter ID mismatch (`frequency` vs `freq`) in `generateOscillatorCode`.
    - Fixed port ID mismatch (`rate_cv` vs `freq_cv`) in `generateLfoCode`.
- **Date**: 2026-01-20

---

### [RESOLVED] Bug #012: Block ID Mismatch in CodeGenerator Switch Statement
- **Date**: 2026-01-21
- **Status**: ✅ RESOLVED
- **Component**: CodeGenerator.ts, .dvpe files

**Symptom**: Reverb and Delay blocks were initialized but never processed. Crossfade inputs hardcoded to `0.0f`.

**Root Cause**:
1. CodeGenerator switch statement used `'reverb'` and `'delay'` but block definitions use `'reverb_sc'` and `'delay_line'`
2. .dvpe files used wrong port IDs (`in_a`/`in_b` vs `in1`/`in2`, `in_left` vs `in_l`, etc.)

**Fix**:
1. Added alias cases in CodeGenerator.ts:
   - `case 'delay_line':` after `case 'delay':`
   - `case 'reverb_sc':` after `case 'reverb':`
2. Fixed port IDs in pod_multi_effect.dvpe and Pod_Multi_Effect_test.dvpe:
   - `in_left` → `in_l`
   - `out_left` → `out_l`
   - `in_a` → `in1`
   - `in_b` → `in2`
   - `position_cv` → `pos_cv`
   - `one_pole` → `onepole`

**Verification**: 502 tests passing, crossfade inputs now correctly reference signal variables.

---

### [RESOLVED] Bug #013: Compilation Failures from Block ID Mismatches
- **Date**: 2026-01-21
- **Status**: ✅ RESOLVED (Compiler errors fixed, linker memory issue remains)
- **Component**: CodeGenerator.ts - Makefile generation and Init logic
- **Report**: [COMPILATION_ERROR_ANALYSIS.md](_block_diagrams_code/Pod_Multi_Effect_test/COMPILATION_ERROR_ANALYSIS.md)

**Compilation Errors** (4 distinct issues):
1. `'ReverbSc' does not name a type` - LGPL include path missing
2. `DelayLine::Init(float&)` signature mismatch - Wrong arg count
3. `sig_block_reverb_1_left` undeclared - Variable name mismatch
4. `OnePole::Init(float&)` signature mismatch - Wrong arg count

**Root Cause**: Same as Bug #012 - block ID mismatches in CodeGenerator

**Fixes Applied**:
1. Line 1926: Added `'reverb_sc'` to lgplBlocks array
2. Line 1935: Check for both `'reverb'` and `'reverb_sc'`
3. Line 1863: Check for both `'delay'` and `'delay_line'`
4. Line 1865: Added `'onepole'` special case for Init()
5. Lines 974-975: Changed `_left`/`_right` → `_out_l`/`_out_r`

**Result**: ✅ **Compilation successful** - 0 errors, 4 harmless warnings

**Remaining**: Linker SRAM overflow (306KB) due to unused SimpleArpeggiator class - separate memory optimization issue.

**Verification**: 502 tests passing, all compiler errors resolved.

---

## Bug #010: Hardware Platform Header Missing (RESOLVED)

**Date**: 2026-01-18  
**Status**: ✅ Already Fixed  
**Blocks Affected**: Code Generator (Platform Selection)

**Symptom**: Configured platform (Pod, Field) was reportedly not including the correct `.h` file in generated code.

**Investigation**: 
- Reviewed `CodeGenerator.ts` lines 111-121. 
- Logic explicitly checks `hardwareConfig.platform` and sets header to `daisy_pod.h` or `daisy_field.h` as appropriate.
- Store logic in `patchStore.ts` correctly updates `hardwareConfig`.

**Conclusion**: Code generation logic is correct. Issue likely resolved in previous updates or was a false alarm.

---

1. Oscillator and LFO blocks have a `waveform_cv` input port defined, but external connections to this port do not affect waveform selection in generated code.
2. Encoder block's `value` output cannot dynamically control oscillator waveform at runtime.
3. In DVPE canvas, encoder appears disconnected from oscillator and LED when meant to control waveform.

**User Report** (with screenshot):
> "oscillator (and lfo) still dont have external port for waveform selection, so encoder results disconnected from oscillator and from LED1"

**Root Cause**:
1. The `waveform` parameter is an ENUM type, not FLOAT
2. Code generator does not implement CV modulation for ENUM parameters
3. `waveform_cv` port exists but generates no runtime code to map CV (0.0-1.0) to waveform enum values

**Current State** (oscillator.ts):
```typescript
// Parameter exists with cvModulatable:
{
    id: 'waveform',
    type: ParameterType.ENUM,
    cvModulatable: true,  // ← Port shows in GUI
    enumValues: ['WAVE_SIN', 'WAVE_TRI', 'WAVE_SAW', ...],
}

// Port exists:
{
    id: 'waveform_cv',
    displayName: 'WAVE CV',
    signalType: SignalType.CV,
    direction: PortDirection.INPUT,
}
```

**Missing Implementation** (CodeGenerator.ts):
```typescript
// Need to add in oscillator processing:
if (hasConnection('waveform_cv')) {
    // Map CV 0.0-1.0 to waveform enum index
    int waveform_index = (int)(waveform_cv * NUM_WAVEFORMS);
    osc.SetWaveform(waveform_index);
}
```

**Required Changes**:
1. `CodeGenerator.ts`: Add ENUM CV modulation support
2. Map CV 0.0-1.0 → integer index → enum value
3. Apply to both `oscillator` and `lfo` blocks
4. Update documentation to show CV-to-waveform mapping

**Related Issues**:
- Encoder `value` port connection to oscillator `waveform_cv` is valid but generates no effect
- LED output cannot reflect current waveform without this fix

---

### [RESOLVED] Bug #014: Unconditional Code Inclusion Causes SRAM Overflow
- **Date**: 2026-01-21
- **Status**: ✅ RESOLVED
- **Component**: CodeGenerator.ts - generateIncludes() method
- **Report**: [CODEGEN_DISCREPANCY_ANALYSIS.md](_block_diagrams_code/Field_Empty_Patch/CODEGEN_DISCREPANCY_ANALYSIS.md)

**Symptom**: All generated C++ files included ~130 lines of unused code:
- `#define MAX_DELAY 96000` (always)
- MIDI global variables (always)
- `SimpleArpeggiator` class with `std::vector` (always - 95 lines)
- `HandleMidiMessage` function (always - 27 lines)

**Root Cause**: `generateIncludes()` returned a hardcoded template literal that unconditionally included all MIDI/Arpeggiator code regardless of whether the patch uses those features.

**Fix Applied** (2026-01-23):
1. Added feature detection helpers: `usesDelayBlock()`, `usesMidiBlocks()`, `usesArpeggiator()`
2. Refactored `generateIncludes()` to conditionally include:
   - MAX_DELAY only when delay/reverb/chorus/flanger blocks present
   - MIDI globals only when midi_note/midi_cc/arpeggiator blocks present
   - SimpleArpeggiator class only when arpeggiator block present
3. Extracted arpeggiator class to `generateArpeggiatorClass()` method
4. Made `generateMidiHandler()` return empty string when no MIDI blocks used
5. Updated `generate()` to conditionally join sections (no empty sections)

**Verification**:
- 13 new tests added to `CodeGenerator.test.ts` (Bug #014 test suite)
- Empty patch now generates <100 lines (was ~184)
- No std::vector included for non-arpeggiator patches
- Platform detection confirmed working (field/pod/seed headers correct)
- All 514 tests passing

---

## Prevention Strategy

### Template-Based Block Creation

Create new blocks by copying an existing, complete block (e.g., `oscillator.ts` for sources, `synthBassDrum.ts` for drums) rather than starting from scratch. This ensures:
- All required properties are present
- CV modulation is correctly configured
- Port definitions match parameter definitions

### Automated Validation (Future)

Consider adding a build-time validator that checks:
1. Every parameter with `cvModulatable: true` has a corresponding `*_cv` port
2. All blocks are registered in BlockRegistry
3. All blocks have generator methods in CodeGenerator

---

## Bug #015: Field String Machine Compilation Failures (RESOLVED)

**Date**: 2026-01-30
**Status**: ✅ RESOLVED
**Components**: CodeGenerator.ts, DaisySP integration
**Project**: Field String Machine

**Symptoms**:
Multiple compilation and generation errors prevented the `field_string_machine` patch from building:
1. `ReferenceError: _name is not defined` during code generation.
2. C++ Error: `no matching function for call to 'daisysp::Adsr::SetGate'` (Deprecated API).
3. C++ Error: `error: request for member 'Value' in 'hw.daisy::DaisyField::knob[i]', which is of pointer type 'daisy::AnalogControl*'` (Field platform specific).
4. C++ Error: `OscillatorBank::SetSingleAmp` too few arguments (Missing index).
5. C++ Error: `fatal error: dsp.h: No such file or directory` (Missing include path for LGPL headers).

**Root Causes**:
1. **Typo**: Parameter name mismatch in helper methods (`_name` instead of `name`).
2. **API Change**: `Adsr::SetGate` is deprecated in newer DaisySP; `Process(gate)` is the current pattern.
3. **Platform Difference**: On Daisy Field, `hw.knob[i]` is a reference/object, but my generator treated it as a pointer/value incorrectly. Fixed to use `.Value()`.
4. **Logic Error**: `OscillatorBank` requires indexed Setters (e.g., `SetSingleAmp(val, index)`), but generic `writeParameterSetters` loop didn't support passing the index.
5. **Missing Include**: `MoogLadder` (and likely other LGPL blocks) rely on `dsp.h` which resides in `DaisySP/Source/Utility`, which was not in the include path.

**Fixes**:
1. Corrected `_name` to `name` in `generateMidiNoteCode` and others.
2. Updated `generateAdsrCode` to use `cv_out = name.Process(gate_val)`.
3. Updated `generateKnobCode` for `field` platform to append `.Value()`.
4. Refactored `writeParameterSetters` to support `cppSetterIndex`.
5. Added `C_INCLUDES += -I$(DAISYSP_DIR)/Source/Utility` to `generateMakefile`.

**Verification**:
- `field_string_machine` compiles successfully (exit code 0).
- Generated C++ code inspection confirms correct API usage.

---
### USER question:
why you can't read PDFs directly and how to fix it?

___
## Archive Policy

When this file exceeds 20 bugs, archive resolved bugs to `dvpe_bugs_archive.md` and keep only:
- Latest 5 bugs
- All checklist items
- Prevention strategy section
