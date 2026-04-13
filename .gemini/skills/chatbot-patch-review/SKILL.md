---
name: chatbot-patch-review
description: |
  Autonomously verify and fix AI-generated .dvpe patch files.
  Validates: block initialization, default values, CV ports, connection wiring.
  Use when reviewing chatbot output, fixing generated patches, or validating schema.
  Trigger keywords: review patch, fix generated patch, chatbot output, validate dvpe, verify patch
---

# Chatbot Patch Review Skill

## Overview

Validates AI-generated `.dvpe` patch files against the v1.0.0 schema and block library. Performs autonomous verification and auto-fixes common issues before promoting to `tested/` folder.

## Verification Stages

### Stage 1: Schema Structure Validation

Check top-level structure:

```json
✅ Required structure:
{
  "version": "1.0.0",
  "patch": {
    "metadata": { ... },
    "blocks": [ ... ],
    "connections": [ ... ]
  }
}
```

**Validation Rules**:

| Rule | Check | Auto-Fix |
|------|-------|----------|
| V1.1 | `version` = "1.0.0" | ✅ Set to "1.0.0" |
| V1.2 | `patch` object exists | ✅ Wrap content in `patch` |
| V1.3 | `metadata` object exists | ✅ Generate from filename |
| V1.4 | `blocks` array exists | ❌ Fail if missing |
| V1.5 | `connections` array exists | ✅ Set to empty array |

---

### Stage 2: Metadata Validation

Check required metadata fields:

```json
{
  "metadata": {
    "name": "Patch Name",           // ✅ Required
    "author": "Author",             // ✅ Required  
    "description": "...",           // ✅ Required
    "created": "ISO-8601",          // ✅ Required
    "modified": "ISO-8601",         // ✅ Required
    "version": "1.0.0",             // ✅ Required
    "targetHardware": "seed|pod|field", // ✅ Required
    "sampleRate": 48000,            // ✅ Required (default: 48000)
    "blockSize": 4                  // ✅ Required (default: 4)
  }
}
```

**Auto-Fix Values**:

| Field | Default |
|-------|---------|
| `name` | Filename without extension |
| `author` | "AI Patch Generator" |
| `description` | "Generated patch" |
| `created` | Current ISO-8601 timestamp |
| `modified` | Current ISO-8601 timestamp |
| `version` | "1.0.0" |
| `targetHardware` | "seed" |
| `sampleRate` | 48000 |
| `blockSize` | 4 |

---

### Stage 3: Block Validation

For each block in `blocks[]`:

#### 3.1 Block Structure

```json
{
  "id": "block-unique-id",        // ✅ Required, unique
  "definitionId": "oscillator",   // ✅ Required, must exist in BlockRegistry
  "position": { "x": 100, "y": 100 }, // ✅ Required
  "parameterValues": { ... },     // ✅ Required (can be empty {})
  "label": "OSC 1"                // ✅ Required
}
```

**Common Property Name Errors** (Auto-Fix):

| Wrong | Correct |
|-------|---------|
| `type` | `definitionId` |
| `parameters` | `parameterValues` |
| `name` | `label` |
| `pos` | `position` |

#### 3.2 Block Definition Exists

Compare `definitionId` against known blocks:

```
oscillator, fm2, lfo, white_noise, dust, particle, grainlet_oscillator,
metro, dc_source, analog_bass_drum, synth_bass_drum, analog_snare_drum,
synth_snare_drum, hihat, drip, pluck, svf, moog_ladder, one_pole, atone,
dc_block, resonator, overdrive, distortion, bitcrush, decimator, chorus,
flanger, phaser, tremolo, autowah, delay_line, reverb_sc, pitch_shifter,
fold, wavefolder, sample_rate_reducer, tube, wahwah, vibrato, ring_modulator,
fdn_reverb, universal_comb, lp_iir_comb, adsr, ad_env, slew, smooth,
compressor, limiter, noise_gate, compressor_expander, envelope_follower,
string_voice, modal_voice, add, subtract, multiply, divide, gain, abs,
exp, pow2, vca, linear_vca, crossfade, mux, demux, bypass, gate,
sample_delay, cv_to_freq, soft_clip, hard_clip, rectifier, audio_input,
audio_output, knob, slider, encoder, key, switch, gate_trigger_in,
cv_input, cv_output, gate_output, led_output, midi_note, midi_cc,
tone_stack, low_shelving, high_shelving, peak_filter, stereo_pan,
phase_vocoder_pitch, sola_time_stretch, crosstalk_canceller, robotization,
whisperization, yin_pitch, arpeggiator, step_sequencer, mixer
```

**Validation**: If `definitionId` not found → **FAIL** with suggestion of closest match.

#### 3.3 Parameter Value Validation

For each parameter in `parameterValues`:

1. **Check parameter exists** in block definition
2. **Check value is in range** (min/max)
3. **Check type matches** (FLOAT, INT, ENUM, BOOL)

**Default Value Auto-Fill**:

If a required parameter is missing, fill with default from block definition:

```json
// oscillator defaults
{
  "freq": 440.0,
  "amp": 1.0,
  "waveform": "WAVE_SIN",
  "pw": 0.5
}

// svf defaults
{
  "freq": 1000.0,
  "res": 0.5,
  "drive": 0.0
}

// adsr defaults
{
  "attack": 0.01,
  "decay": 0.1,
  "sustain": 0.7,
  "release": 0.5
}
```

---

### Stage 4: CV Port Initialization

For blocks using CV modulation:

#### 4.1 Check `enabledCvPorts` Array

If block has CV connections incoming, must have `enabledCvPorts`:

```json
{
  "id": "block-osc-1",
  "definitionId": "oscillator",
  "enabledCvPorts": ["freq_cv", "amp_cv"],  // ← Required if CV connected
  ...
}
```

#### 4.2 Auto-Enable CV Ports

Scan connections → For each CV connection to a block → Add port to `enabledCvPorts`:

```python
for connection in connections:
    if connection.type == "cv":
        target_block = find_block(connection.targetBlockId)
        if target_block.enabledCvPorts is None:
            target_block.enabledCvPorts = []
        if connection.targetPortId not in target_block.enabledCvPorts:
            target_block.enabledCvPorts.append(connection.targetPortId)
```

---

### Stage 5: Connection Wiring Validation

For each connection in `connections[]`:

#### 5.1 Connection Structure

```json
{
  "id": "conn-1",                    // ✅ Required, unique
  "sourceBlockId": "block-osc-1",    // ✅ Required, must exist
  "sourcePortId": "out",             // ✅ Required, must exist on source
  "targetBlockId": "block-filter-1", // ✅ Required, must exist
  "targetPortId": "in",              // ✅ Required, must exist on target
  "type": "audio"                    // ✅ Required: audio|cv|trigger
}
```

**Common Property Name Errors** (Auto-Fix):

| Wrong | Correct |
|-------|---------|
| `sourceId` | `sourceBlockId` |
| `sourcePort` | `sourcePortId` |
| `targetId` | `targetBlockId` |
| `targetPort` | `targetPortId` |
| `from` | `sourceBlockId` |
| `to` | `targetBlockId` |

#### 5.2 Port Existence Check

Validate that ports exist on their respective blocks:

| Block | Port ID | Direction |
|-------|---------|-----------|
| `oscillator` | `out` | OUTPUT |
| `oscillator` | `freq_cv`, `amp_cv`, `waveform_cv`, `pw_cv` | INPUT |
| `audio_output` | `left`, `right` | INPUT |
| `svf` | `in`, `freq_cv`, `res_cv`, `drive_cv` | INPUT |
| `svf` | `low`, `high`, `band`, `notch` | OUTPUT |

**Common Port ID Errors** (Auto-Fix):

| Wrong | Correct | Block |
|-------|---------|-------|
| `out_l` | `left` | audio_output |
| `out_r` | `right` | audio_output |
| `output` | `out` | oscillator, svf |
| `input` | `in` | svf, effects |

#### 5.3 Signal Type Matching

Connection `type` must match port signal types:

| Port Signal | Connection Type |
|-------------|-----------------|
| `SignalType.AUDIO` | `"audio"` |
| `SignalType.CV` | `"cv"` |
| `SignalType.TRIGGER` | `"trigger"` |
| `SignalType.GATE` | `"trigger"` |

---

## Verification Report Format

```markdown
## Patch Verification Report

**File**: generated_patch.dvpe
**Date**: 2026-01-19T10:00:00Z

### ✅ Structure (5/5)
- [x] Version: 1.0.0
- [x] Patch wrapper present
- [x] Metadata complete
- [x] Blocks array (5 blocks)
- [x] Connections array (4 connections)

### ✅ Blocks (5/5)
| Block ID | Definition | Status | Issues |
|----------|-----------|--------|--------|
| block-osc-1 | oscillator | ✅ | — |
| block-filter-1 | svf | ✅ | — |
| block-env-1 | adsr | ⚠️ | Filled default: sustain=0.7 |
| block-vca-1 | vca | ✅ | — |
| block-out-1 | audio_output | ✅ | — |

### ✅ CV Ports (3/3)
| Block | CV Ports Enabled | Auto-Enabled |
|-------|------------------|--------------|
| block-osc-1 | freq_cv | Yes |
| block-filter-1 | freq_cv | Yes |
| block-vca-1 | cv | Yes |

### ✅ Connections (4/4)
| ID | Source | Target | Type | Status |
|----|--------|--------|------|--------|
| conn-1 | osc→out | filter→in | audio | ✅ |
| conn-2 | filter→low | vca→in | audio | ✅ |
| conn-3 | env→out | vca→cv | cv | ✅ |
| conn-4 | vca→out | output→left | audio | ✅ |

### Result: ✅ PASSED
**Actions Taken**:
- Auto-filled 1 default parameter value
- Auto-enabled 3 CV ports

**Ready for**: `_block_diagrams_code/tested/`
```

---

## Workflow

### Step 1: Load Patch
```bash
# Read the generated .dvpe file
cat _block_diagrams_code/prompt_generated/new_patch.dvpe
```

### Step 2: Run Validation
Execute all 5 stages of validation.

### Step 3: Auto-Fix Issues
Apply auto-fixes for common problems.

### Step 4: Generate Report
Create verification report with all findings.

### Step 5: Promote or Reject
- **PASSED**: Move to `_block_diagrams_code/tested/`
- **FAILED**: Return with error details for manual fix

---

## Quick Validation Command

```bash
# Future: Automated script
npx ts-node execution/validate_dvpe_patch.ts path/to/patch.dvpe
```

## Integration

This skill should be triggered:
- After every AI patch generation
- Before loading patches in DVPE GUI
- Before promoting to `tested/` folder

## References

- Schema: `_block_diagrams_code/SCHEMA.md`
- Block Library: `docs/DVPE_Block_Library_Reference.md`
- Template: `_block_diagrams_code/template.dvpe`
- Tests: `src/core/schema/ChatbotPatchValidation.test.ts`
