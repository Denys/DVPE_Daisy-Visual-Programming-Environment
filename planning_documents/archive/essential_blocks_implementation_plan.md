# Essential Blocks Implementation Plan

Based on analysis of:
- `Ultimate-Block-Diagram-Examples-DaisySP-DaisyField_Optimized.pdf` ← **Usage examples**
- `Daisy_Field_Code_to_Canvas.pdf`
- `Blocks and Recurrences in Ultimate-Block-Diagram-Examples.xlsx`
- `essential_blocks.md`

> **Reference**: For block usage patterns and connection examples, consult `Ultimate-Block-Diagram-Examples-DaisySP-DaisyField_Optimized.pdf`

---

## Block Inventory

### Already Implemented (20 blocks)
| Block | Category | DaisySP Class |
|-------|----------|---------------|
| Oscillator | Sources | `daisysp::Oscillator` |
| FM2 | Sources | `daisysp::Fm2` |
| Particle | Sources | `daisysp::Particle` |
| GrainletOscillator | Sources | `daisysp::GrainletOscillator` |
| MoogLadder | Filters | `daisysp::MoogLadder` |
| SVF | Filters | `daisysp::Svf` |
| ADSR | Modulators | `daisysp::Adsr` |
| AdEnv | Modulators | `daisysp::AdEnv` |
| VCA | Dynamics | Custom (multiply) |
| Compressor | Dynamics | `daisysp::Compressor` |
| Mixer | Utility | Custom |
| DelayLine | Effects | `daisysp::DelayLine` |
| ReverbSc | Effects | `daisysp::ReverbSc` |
| Overdrive | Effects | `daisysp::Overdrive` |
| Knob | I/O | Hardware |
| Key | I/O | Hardware |
| Encoder | I/O | Hardware |
| GateTriggerIn | I/O | Hardware |
| AudioInput | I/O | Hardware |
| AudioOutput | I/O | Hardware |

---

## Phase 1: Core DSP (High Priority) — 19h
Must-have blocks for basic synthesizers.

| Block | DaisySP Class | Effort |
|-------|---------------|--------|
| **LFO** | `daisysp::Oscillator` (low freq mode) | 2h |
| **WhiteNoise** | `daisysp::WhiteNoise` | 1h |
| **Chorus** | `daisysp::Chorus` | 3h |
| **Flanger** | `daisysp::Flanger` | 3h |
| **LPF** (OnePole) | `daisysp::OnePole` | 2h |
| **HPF** (ATone) | `daisysp::ATone` | 2h |
| **BPF** | `daisysp::Svf` (mode) | 1h |
| **DCBlock** | `daisysp::DcBlock` | 1h |
| **Limiter** | `daisysp::Limiter` | 2h |
| **Fold** | `daisysp::Fold` | 2h |

---

## Phase 2: Math & Utility (High Priority) — 15.5h
Essential for signal routing and control.

| Block | Implementation | Effort |
|-------|----------------|--------|
| **Add** (ADD2-4) | `out = in1 + in2 + ...` | 2h |
| **Multiply** | `out = in1 * in2` | 1h |
| **Subtract** | `out = in1 - in2` | 1h |
| **Divide** | `out = in1 / in2` (protected) | 1h |
| **Gain** | `out = in * gain` | 1h |
| **Bypass** | `out = in` | 0.5h |
| **z^{-1}** (Sample Delay) | Single sample delay | 2h |
| **CV to Freq** | `freq = mtof(cv * 12)` | 1h |
| **LinearVCA** | `daisysp::LinearVCA` | 2h |
| **Mux** | Signal selector | 2h |
| **Demux** | Signal router | 2h |

---

## Phase 3: Drums & Physical (Medium Priority) — 31h

| Block | DaisySP Class | Effort |
|-------|---------------|--------|
| **AnalogBassDrum** | `daisysp::AnalogBassDrum` | 3h |
| **AnalogSnareDrum** | `daisysp::AnalogSnareDrum` | 3h |
| **HiHat** | `daisysp::HiHat` | 3h |
| **SynthBassDrum** | `daisysp::SynthBassDrum` | 3h |
| **SynthSnareDrum** | `daisysp::SynthSnareDrum` | 3h |
| **KarplusString** | `daisysp::KarplusString` | 4h |
| **Resonator** | `daisysp::Resonator` | 4h |
| **ModalVoice** | `daisysp::ModalVoice` | 4h |
| **StringVoice** | `daisysp::StringVoice` | 4h |

---

## Phase 4: Advanced Effects & Synthesis — 58h

| Block | DaisySP Class | Effort |
|-------|---------------|--------|
| Phaser, Tremolo, Autowah | Effects | 8h |
| Bitcrush, Decimator | Effects | 4h |
| Comb, Allpass | Filters | 6h |
| WavetableOsc, VariableSaw/Shape, ZOsc | Synthesis | 14h |
| FormantOsc, BlOsc | Synthesis | 7h |
| ClockedNoise, Granular | Noise/Sampling | 8h |
| CrossFade, Balance | Dynamics | 4h |
| Metro, Phasor | Control | 4h |
| NLFilt | Filters | 3h |

---

## Phase 5: Hardware I/O Extensions — 20h

| Block | Implementation | Effort |
|-------|----------------|--------|
| LEDs | `field.led_driver` | 3h |
| Switches | `field.switches` | 2h |
| CV Input/Output | ADC/DAC | 5h |
| MIDI In/Out | `MidiUsbHandler` | 10h |

---

## Summary

| Phase | Blocks | Hours | Priority |
|-------|--------|-------|----------|
| Phase 1: Core DSP | 10 | 19h | 🔴 High |
| Phase 2: Math & Utility | 11 | 15.5h | 🔴 High |
| Phase 3: Drums & Physical | 9 | 31h | 🟡 Medium |
| Phase 4: Advanced | 20 | 58h | 🟢 Lower |
| Phase 5: Hardware I/O | 6 | 20h | 🟡 Medium |
| **Total** | **56 new** | **143.5h** | |

**MVP after Phase 1+2**: 41 blocks total (~34.5h)

---

## Implementation Pattern

Each block requires:
1. **Definition** → `src/core/blocks/definitions/<name>.ts`
2. **Registration** → Add to `BlockRegistry.ts`
3. **Code Generator** → Handler in `CodeGenerator.ts`

---

## Recommended Schedule

| Week | Phase | Deliverable |
|------|-------|-------------|
| 1-2 | Phase 1 + 2 | Core + Math blocks (MVP) |
| 3 | Phase 3 | Drums & Physical |
| 4-5 | Phase 4 | Advanced effects |
| 6 | Phase 5 | Hardware I/O |
| 7-8 | Phase 6 | UI/UX Enhancements |

---

## Phase 6: UI/UX Enhancements — 24h

Based on `implementation_ideas.md`, enhancing the Algorithm window with professional workflow features.

| Task | Feature | Implementation | Effort |
|------|---------|----------------|--------|
| **6.1** | Rectangle Selection | Ctrl+drag box select | 2h |
| **6.2** | Connection Labels | EdgeLabelRenderer + store | 4h |
| **6.3** | Block Comments | New CommentNode type | 5h |
| **6.4** | Alignment Tools | Floating toolbar | 5h |
| **6.5** | Hierarchical Diagrams | Sub-diagrams / grouping | 8h |

---

## Updated Summary

| Phase | Blocks/Features | Hours | Priority |
|-------|-----------------|-------|----------|
| Phase 1: Core DSP | 10 | 19h | 🔴 High |
| Phase 2: Math & Utility | 11 | 15.5h | 🔴 High |
| Phase 3: Drums & Physical | 9 | 31h | 🟡 Medium |
| Phase 4: Advanced | 20 | 58h | 🟢 Lower |
| Phase 5: Hardware I/O | 6 | 20h | 🟡 Medium |
| **Phase 6: UI/UX** | **5 features** | **24h** | 🟡 Medium |
| **Total** | **56 blocks + 5 features** | **167.5h** | |

