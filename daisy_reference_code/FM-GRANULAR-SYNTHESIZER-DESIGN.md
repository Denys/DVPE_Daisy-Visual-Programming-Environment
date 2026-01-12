# FM-GRANULAR SYNTHESIZER
## Design Implementation Document

**Platform:** Daisy Field  
**Architecture:** Hybrid FM + Granular Synthesis  
**Voice Count:** Dual (2-voice polyphony)  
**Date:** 2025-12-13  

---

## 1. System Architecture

### 1.1 Signal Flow

```
┌──────────────────────────────────────────────────────────────┐
│                        VOICE 1                                │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  KEY_1 ──gate──┐                                            │
│  KEY_1 ──note──┼──▶ FM2 ──┐                                 │
│  KNOB_1 (ratio)─┘          │                                 │
│  KNOB_2 (index)────────────┘                                 │
│                              │                                │
│                              ▼                                │
│                         GRAINLET ──┐                          │
│  KNOB_3 (formant)───────────┘     │                          │
│  KNOB_4 (grain shape)──────────────┘                          │
│                                    │                          │
│                                    ▼                          │
│                               MOOG FILTER                     │
│  KNOB_5 (cutoff)───────────────────┤                          │
│  KNOB_6 (resonance)─────────────────┘                          │
│                                    │                          │
│  KEY_1 ──gate──▶ ADSR ────────────┼─▶ VCA_1                  │
│                                    │     │                     │
│                                    └─────┘                     │
│                                          │                     │
└──────────────────────────────────────────┼─────────────────────┘
                                           │
┌──────────────────────────────────────────┼─────────────────────┐
│                        VOICE 2            │                     │
│                                          │                     │
│  [Similar structure with KEY_2]          │                     │
│                                          │                     │
└──────────────────────────────────────────┼─────────────────────┘
                                           │
                                           ▼
                                      ┌────────┐
                                      │ MIXER  │
                                      └────┬───┘
                                           │
                                           ▼
                                      OVERDRIVE
                                           │
                                      KNOB_7 (drive)
                                           │
                                           ▼
                                       REVERB_SC
                                           │
                                      KNOB_8 (mix)
                                           │
                                           ▼
                                      AUDIO_OUT
```

---

## 2. Module Specifications

### 2.1 Sources

#### FM2 Oscillator (x2)
- **Function**: 2-operator FM synthesis for harmonic complexity
- **Parameters**:
  - Frequency: FROM KEY (MIDI note)
  - Ratio: KNOB_1 (0.5 - 8.0)
  - Index: KNOB_2 (0 - 10)
- **Output**: Rich harmonic audio signal

#### GrainletOscillator (x2)
- **Function**: Granular texture layer
- **Parameters**:
  - Frequency: FROM FM2 output (follows pitch)
  - Formant: KNOB_3 (200 - 5000 Hz)
  - Shape: KNOB_4 (0.0 - 1.0)
  - Bleed: Fixed 0.3 (inter-grain crossfade)
- **Output**: Granular textured audio

### 2.2 Filters

#### MoogLadder Filter (x2)
- **Function**: 24dB/oct lowpass for voice shaping
- **Parameters**:
  - Cutoff: KNOB_5 (100 - 10000 Hz)
  - Resonance: KNOB_6 (0.0 - 0.95)
- **Modulation**: ADSR envelope → cutoff

### 2.3 Control

#### ADSR Envelope (x2)
- **Function**: Amplitude and filter modulation
- **Parameters**:
  - Attack: 5ms (fast)
  - Decay: 200ms
  - Sustain: 0.7
  - Release: 500ms
- **Trigger**: KEY gate input

### 2.4 Effects Chain

#### Overdrive
- **Function**: Harmonic saturation and warmth
- **Parameters**:
  - Drive: KNOB_7 (0.0 - 1.0)

#### ReverbSc
- **Function**: Spacialization and depth
- **Parameters**:
  - Feedback: KNOB_8 mapped to mix (0.0 - 0.8)
  - LP Freq: Fixed 8000 Hz (natural damping)

### 2.5 I/O Mapping

| Control | Hardware | Function |
|---------|----------|----------|
| KEY_1 | Field Key 0 | Voice 1 trigger + pitch |
| KEY_2 | Field Key 1 | Voice 2 trigger + pitch |
| KNOB_1 | Field Knob 0 | FM Ratio |
| KNOB_2 | Field Knob 1 | FM Index |
| KNOB_3 | Field Knob 2 | Granular Formant |
| KNOB_4 | Field Knob 3 | Grain Shape |
| KNOB_5 | Field Knob 4 | Filter Cutoff |
| KNOB_6 | Field Knob 5 | Filter Resonance |
| KNOB_7 | Field Knob 6 | Overdrive Drive |
| KNOB_8 | Field Knob 7 | Reverb Mix |
| AUDIO_OUT | Field Out L/R | Stereo Output |

---

## 3. Sound Design Characteristics

### 3.1 Timbral Range

**Clean FM Tones** (Index: 0-2, Drive: 0-0.3)
- Bell-like tones
- Harmonic clarity
- Suitable for melodic content

**Complex Textures** (Index: 4-8, Shape: 0.5-1.0)
- Granular noise beds
- Metallic resonances
- Evolving timbres

**Aggressive Sounds** (Index: 8+, Drive: 0.7+, Res: 0.8+)
- Distorted FM screams
- Self-oscillating filter chaos
- Industrial soundscapes

### 3.2 Polyphonic Behavior

- **2-voice polyphony**: Press both keys for chord/interval playing
- **Voice stealing**: Not implemented (keys map 1:1 to voices)
- **Detuning**: Slight frequency offsets between voices create beating

---

## 4. Performance Optimization

### 4.1 CPU Budget

**Estimated cycles per sample @ 48kHz:**
- FM2 x2: ~200 cycles
- GrainletOscillator x2: ~400 cycles
- MoogLadder x2: ~300 cycles
- ADSR x2: ~50 cycles
- Overdrive: ~30 cycles
- ReverbSc: ~2500 cycles
- **Total**: ~3480 cycles/sample

**Max budget**: ~10,000 cycles @ 480MHz  
**Utilization**: ~35% (plenty of headroom)

### 4.2 Memory Usage

- **SDRAM required**: ReverbSc delay lines (~50KB)
- **SRAM**: All other modules (~5KB)
- **Total**: Well within Daisy Field limits

---

## 5. Build Instructions

### 5.1 Generate C++ Code

```bash
# From DVPE GUI:
1. Load FM-Granular-Synthesizer.json
2. Click "Export C++"
3. Save to daisy_projects/fm_granular/
```

### 5.2 Compile Firmware

```bash
cd daisy_projects/fm_granular
make clean
make
```

### 5.3 Flash to Hardware

```bash
make program-dfu
# OR
make program-serial
```

---

## 6. Usage Guide

### 6.1 Quick Start

1. **Basic Tone**: 
   - KNOB_5 (Cutoff) → 2000 Hz
   - KNOB_2 (Index) → 1.0
   - Press KEY_1
   
2. **Granular Texture**:
   - KNOB_3 (Formant) → 1500 Hz
   - KNOB_4 (Shape) → 0.7
   - Press KEY_1

3. **Harmonic Sweep**:
   - KNOB_1 (Ratio) → Sweep 1.0 - 5.0
   - KNOB_2 (Index) → 5.0
   - Press KEY_1

### 6.2 Patch Variations

**Patch 1: Bell Tones**
- Ratio: 2.0, Index: 0.5, Cutoff: 8000 Hz, Reverb: 0.6

**Patch 2: Metallic Textures**
- Ratio: 3.5, Index: 8.0, Shape: 0.9, Drive: 0.5

**Patch 3: Evolving Pads**
- Formant: 400 Hz, Shape: 0.3, Reverb: 0.8, Drive: 0.2

---

## 7. Extensibility

### 7.1 Future Enhancements

- **LFO modulation**: Add LFO → FM Index for vibrato
- **Additional voices**: Expand to 4-voice with voice stealing
- **CV inputs**: External modulation via Field CV inputs
- **Preset system**: Store/recall 8 presets via encoder

### 7.2 Alternative Configurations

- Replace GrainletOscillator with Particle for noise-based textures
- Add SVF filter for multi-mode filtering (BP, HP, Notch)
- Insert Chorus before Reverb for stereo width

---

## APPENDIX A: Block Count

| Category | Blocks | Instances |
|----------|--------|-----------|
| Sources | Fm2, GrainletOscillator | 4 |
| Filters | MoogLadder | 2 |
| Control | ADSR | 2 |
| Effects | Overdrive, ReverbSc | 2 |
| Utility | VCA, Mixer | 3 |
| I/O | Key, Knob, AudioOutput | 11 |
| **TOTAL** | | **24 blocks** |

---

## APPENDIX B: Parameter Quick Reference

| Param | Range | Default | Curve | Description |
|-------|-------|---------|-------|-------------|
| FM Ratio | 0.5-8.0 | 2.0 | Linear | Modulator/carrier ratio |
| FM Index | 0-10 | 1.0 | Linear | Modulation depth |
| Formant | 200-5000 Hz | 800 | Log | Grain spectral peak |
| Grain Shape | 0-1 | 0.5 | Linear | Window morphing |
| Cutoff | 100-10000 Hz | 2000 | Log | Filter frequency |
| Resonance | 0-0.95 | 0.4 | Linear | Filter Q |
| Drive | 0-1 | 0.5 | Linear | Saturation amount |
| Reverb Mix | 0-0.8 | 0.4 | Linear | Wet/dry balance |

---

**END OF DOCUMENT**
