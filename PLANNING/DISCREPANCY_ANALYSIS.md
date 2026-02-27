# Retro Step Sequencer: C++ vs DVPE Block Diagram Discrepancy Analysis

**Date**: 2026-01-19  
**Purpose**: Compare the hand-written C++ implementation with the DVPE block diagram to identify discrepancies and evaluate DVPE's coverage of the feature set.

---

## Summary

| Aspect | C++ Implementation | DVPE Block Diagram | Match? |
|--------|-------------------|-------------------|--------|
| Core Signal Path | ✓ Complete | ✓ Complete | ✅ |
| Oscillator | ✓ Multi-waveform | ✓ Multi-waveform | ✅ |
| Filter | ✓ Moog Ladder | ✓ Moog Ladder | ✅ |
| Envelopes | ✓ 2× AD (Amp, Filter) | ✓ 2× AD | ✅ |
| LFO | ✓ Present (unused) | ✓ Present | ✅ |
| Metro/Tempo | ✓ Via Metro + Knob CV | ✓ Metro + Knob CV | ✅ |
| Step Sequencer | ✓ Custom 8-step logic | ✓ step_sequencer block | ⚠️ |
| Keyboard Input | ✓ B-row toggle, A-row pitch | ⚠️ keyboard_input block | ⚠️ |
| Buttons (SW1/SW2) | ✓ Play/Stop, Waveform | ⚠️ button blocks exist | ⚠️ |
| OLED Display | ✓ Full implementation | ❌ Not in DVPE | ❌ |
| LED Feedback | ✓ Full A/B row + knobs | ❌ Not connected | ❌ |
| MIDI Output | ✓ USB MIDI notes | ❌ No midi_note_out block | ❌ |
| Waveform Switching | ✓ SW2 cycles waveforms | ❌ Cannot control via button | ❌ |

---

## Detailed Discrepancies

### 1. Step Sequencer Logic (⚠️ Partial Match)

**C++ Implementation**:
- Custom per-step data structure (`Step` struct with pitch, velocity, duration, active)
- 8 steps with programmable parameters via knobs
- Pentatonic scale quantization on pitch
- A-row keyboard selects step for editing
- B-row keyboard toggles step on/off

**DVPE Block Diagram**:
- Uses `step_sequencer` block (generic 4-track sequencer)
- No per-step pitch/velocity/duration at block level
- No keyboard input integration for step editing
- No pentatonic scale quantization

**Gap**: DVPE's `step_sequencer` block is a trigger sequencer, not a melodic sequencer with per-step note data. A dedicated **"melodic_sequencer"** or **"note_sequencer"** block would be needed.

---

### 2. Keyboard Input (⚠️ Partial Match)

**C++ Implementation**:
- `hw.KeyboardState(i)` reads 16 keys
- A-row (8-15): Select step for editing
- B-row (0-7): Toggle step active/mute
- Real-time feedback via LEDs

**DVPE Block Diagram**:
- `keyboard_input` block exists but outputs only:
  - `gate` (any key pressed)
  - `pitch` (last key's pitch)
- Cannot distinguish A-row vs B-row
- Cannot get per-key rising/falling edge

**Gap**: Need a **"field_keyboard"** block with individual key outputs or a multi-output configuration.

---

### 3. OLED Display (❌ Not Covered)

**C++ Implementation**:
- 128×64 OLED display with:
  - Mode/tempo display
  - Step info (pitch, velocity, active)
  - Step visualization (8 boxes)

**DVPE Block Diagram**:
- No display block exists
- No way to generate UI in DVPE

**Gap**: OLED display is hardware-specific and not representable in block diagram form. Would require custom code generation template.

---

### 4. LED Feedback (❌ Not Connected)

**C++ Implementation**:
- A-row LEDs: Step position/activity
- B-row LEDs: Step active status
- Knob LEDs: Knob values
- SW LEDs: Play/edit mode

**DVPE Block Diagram**:
- `led_output` blocks exist but not connected in diagram
- Would need 24+ LED blocks to fully represent

**Gap**: LED feedback requires many connections. Consider a **"led_bar"** or **"step_indicator"** macro block.

---

### 5. MIDI Output (❌ Missing)

**C++ Implementation**:
- USB MIDI Note On/Off for each step
- MIDI note from pentatonic pitch
- MIDI velocity from step velocity

**DVPE Block Diagram**:
- Originally had `midi_note_out` block
- Removed because unclear how to connect (needs pitch + gate)

**Gap**: Need a **"midi_note"** block that takes pitch and gate inputs and generates MIDI messages.

---

### 6. Waveform Control (❌ Missing)

**C++ Implementation**:
- SW2 press cycles through 6 waveforms
- `osc.SetWaveform(static_cast<uint8_t>(waveform))`

**DVPE Block Diagram**:
- Oscillator has `waveform_cv` input port but:
  - No way to connect button to it
  - Bug #011: ENUM CV not implemented in code generator

**Gap**: This is the **Bug #011** noted in `dvpe_bugs.md`. Waveform CV port exists but generates no runtime code.

---

## DVPE Coverage Assessment

### ✅ Well Covered (Audio Path)
- Oscillator → Filter → VCA → Output
- AD Envelopes (Amp and Filter)
- Metro for clock generation
- Knob → CV modulation for filter/envelope

### ⚠️ Partially Covered (Control)
- Step sequencer exists but is trigger-based, not melodic
- Button blocks exist but not for waveform control
- Knob blocks work well

### ❌ Not Covered
- Pentatonic scale quantization (no quantizer block)
- Per-step melodic data (no note sequencer)
- OLED display (hardware-specific)
- Complex LED feedback (too many blocks needed)
- MIDI note output with pitch+gate
- Waveform switching via button (Bug #011)

---

## Recommendations for DVPE

### New Blocks Needed

1. **`note_sequencer`** - Melodic step sequencer with per-step pitch, velocity, gate
2. **`quantizer`** - Scale quantization (major, minor, pentatonic, chromatic)
3. **`midi_note_out`** - MIDI note output with pitch and gate inputs
4. **`field_keyboard`** - Multi-output keyboard for Field's 16 keys
5. **`led_bar`** - Multi-LED output for step indicators

### Bug Fixes Needed

1. **Bug #011**: Implement ENUM CV modulation for waveform control
2. **Button → waveform**: Allow button press to cycle waveform parameter

### Observations

The DVPE block diagram captures the **audio signal path** accurately but cannot represent:
- Complex control logic (mode switching, editing workflow)
- Hardware-specific I/O (OLED, keyboard rows, LED arrays)
- Melodic sequencing with per-step parameters

This is expected—DVPE is designed for DSP signal flow, not full application logic. The C++ implementation necessarily includes more procedural code for UI and control flow.

---

## Files

| File | Description |
|------|-------------|
| `RetroStepSequencer.cpp` | Complete C++ implementation (✅ compiles) |
| `field_retro_step_sequencer.dvpe` | DVPE block diagram (audio path only) |
| `README.md` | User guide with controls and presets |
