# Daisy Development — Learned Patterns

**Purpose**: Capture recurring implementation patterns and gotchas for efficient development.
**Created**: 2026-02-10 (reconstructed from project history)

---

## Pattern #001: Field Project Init Sequence

**Always** follow this exact order:
```cpp
hw.Init();
hw.SetAudioBlockSize(4);
hw.SetAudioSampleRate(SaiHandle::Config::SampleRate::SAI_48KHZ);
float sr = hw.AudioSampleRate();

// Init all DSP modules HERE (before StartAudio)
osc.Init(sr);
filter.Init(sr);

// Init OLED
hw.display.Fill(false);
hw.display.WriteString("Ready", Font_7x10, true);
hw.display.Update();

// Init MIDI
hw.midi.StartReceive();

// CRITICAL: ADC before Audio!
hw.StartAdc();
hw.StartAudio(AudioCallback);
```

**Source**: DAISY_EXPERT_AGENT_v1.1.md §6, confirmed by multiple projects.

---

## Pattern #002: Debug Keys (A7/A8)

Reserve 2 keyboard keys for debugging on Field:
- **A7** (index 14): Play test tone (C4 = 261.63 Hz) — verifies audio output path
- **A8** (index 15): Display last MIDI note — verifies MIDI input path

```cpp
if(hw.KeyboardRisingEdge(14)) { /* test tone */ }
if(hw.KeyboardRisingEdge(15)) { /* show MIDI */ }
```

**Source**: CHECKPOINT.md 2026-01-24 (FieldArpeggiator testing).

---

## Pattern #003: OLED Zoom Visualization

When a knob changes by > 2%, show a "zoomed" parameter view for ~1.2 seconds:
1. Store `prevKnob[8]` and `currKnob[8]`
2. Detect change: `fabsf(curr - prev) > 0.02f`
3. Display: "Param Name: Value [Unit] (Percentage)" with progress bar
4. Hide after 1200ms timeout using `System::GetNow()`

**Source**: DAISY_EXPERT_AGENT_v1.1.md §7.

---

## Pattern #004: ADSR Usage (Modern API)

**Deprecated**: `adsr.SetGate(gate_bool)` → Use `adsr.Process(gate_bool)` instead.
- `Adsr::SetGate` was deprecated in newer DaisySP versions.
- Correct: `float env_val = adsr.Process(gate > 0.0f);`

**Source**: Bug #015 (Field String Machine).

---

## Pattern #005: Makefile Path Depth

Projects deep in bundle directories need correct `../` depth:
```makefile
# 2 levels: DaisyExamples/pod/MyProject/
LIBDAISY_DIR = ../../libDaisy
DAISYSP_DIR = ../../DaisySP

# 4 levels: DaisyExamples/MyProjects/_projects/field_xyz/
LIBDAISY_DIR = ../../../../libDaisy
DAISYSP_DIR = ../../../../DaisySP
```

**Rule**: Count directories from project Makefile to DaisySP root.

---

## Pattern #006: SDRAM for Large Buffers

When SRAM overflows (>128KB), move large arrays to SDRAM:
```cpp
float DSY_SDRAM_BSS wavetable_data[WAVETABLE_SIZE];
```

**Limits**: SRAM = 128KB (tight), SDRAM = 64MB (abundant but slower).
**Source**: Bug #014 (Wavetable Synth SRAM overflow).

---

## Pattern #007: Block Definition Checklist

Every new DVPE block needs:
1. `cvModulatable: true` on float parameters for CV control
2. Matching `*_cv` port in `ports[]` for each CV-modulatable parameter
3. `trig` port if triggerable (drums, physical modeling)
4. Registration in `BlockRegistry.ts`
5. Export in `definitions/index.ts`
6. Generator method in `CodeGenerator.ts`

**Source**: dvpe_bugs.md Checklist, Bugs #001-#003.

---

## Pattern #008: MIDI Message Handling (Main Loop)

```cpp
for(;;) {
    hw.midi.Listen();
    while(hw.midi.HasEvents()) {
        auto msg = hw.midi.PopEvent();
        if(msg.type == NoteOn) {
            float vel = msg.AsNoteOn().velocity / 127.0f;
            if(vel == 0.0f) { /* treat as NoteOff */ }
            else { /* handle note on */ }
        }
    }
    UpdateDisplay();  // OLED update in main loop, not callback
}
```

**Key gotcha**: Some MIDI controllers send NoteOn with velocity=0 instead of NoteOff.

---

## Pattern #009: Conditional Code Generation

Don't include code for unused features:
```typescript
// Feature detection helpers in CodeGenerator.ts
usesDelayBlock()    → include MAX_DELAY
usesMidiBlocks()    → include MIDI globals
usesArpeggiator()   → include SimpleArpeggiator class
```

Empty patches should generate <100 lines of C++.
**Source**: Bug #014 fix (2026-01-23).

---

## Pattern #010: Custom Block Flattening (Code Generation)

When generating C++ from hierarchical blocks:
```
Custom block "MySynth" instance 0:
  Inner block "Osc1" → variable prefix: MySynth_0_Osc1_
  Inner block "Filter1" → variable prefix: MySynth_0_Filter1_
```

Multiple instances get unique numeric suffixes to avoid collisions.
**Source**: Phase13_3_TODO.md Step 4.
