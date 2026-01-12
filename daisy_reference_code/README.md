# Daisy Field - FM Granular Synthesizer

**Hardware Target:** Daisy Field (STM32H750 ARM Cortex-M7)  
**Synthesis Type:** Dual-Voice FM + Granular Hybrid  
**Date Created:** 2025-12-13

---

## Project Contents

### Firmware
- [`fm_granular_main.cpp`](fm_granular_main.cpp) - Main C++ firmware source (207 lines)
- [`Makefile`](Makefile) - Build configuration for Daisy toolchain

### Documentation
- [`FM-GRANULAR-SYNTHESIZER-DESIGN.md`](FM-GRANULAR-SYNTHESIZER-DESIGN.md) - Technical design document
- [`FM-GRANULAR-SYNTHESIZER-SUMMARY.md`](FM-GRANULAR-SYNTHESIZER-SUMMARY.md) - Quick reference summary
- [`FM - GRANULAR SYNTHESIZER - DESIGN IMPLEMENTATION DOCUMENT.docx`](FM%20-%20GRANULAR%20SYNTHESIZER%20-%20DESIGN%20IMPLEMENTATION%20DOCUMENT.docx) - Detailed implementation document

---

## Synthesizer Architecture

### Signal Flow
```
Voice 1:                          Voice 2:
┌────────┐                        ┌────────┐
│  FM2   │                        │  FM2   │
└───┬────┘                        └───┬────┘
    │                                 │
    ├─────► Mix 50% ◄─────┬          ├─────► Mix 50% ◄─────┬
    │                     │          │                     │
┌───▼────────┐       ┌───┴────────┐ ┌───▼────────┐       ┌───┴────────┐
│ Grainlet   │       │ Grainlet   │ │ Grainlet   │       │ Grainlet   │
│ Oscillator │       │ Oscillator │ │ Oscillator │       │ Oscillator │
└────────────┘       └────────────┘ └────────────┘       └────────────┘
       │                                    │
       ▼                                    ▼
┌─────────────┐                      ┌─────────────┐
│ MoogLadder  │                      │ MoogLadder  │
│   Filter    │                      │   Filter    │
└──────┬──────┘                      └──────┬──────┘
       │                                    │
       ▼                                    ▼
┌─────────────┐                      ┌─────────────┐
│  ADSR Env   │                      │  ADSR Env   │
│  (VCA)      │                      │  (VCA)      │
└──────┬──────┘                      └──────┬──────┘
       │                                    │
       └──────────┬──────────────────────────┘
                  │
                  ▼
           ┌──────────────┐
           │  Voice Mixer │
           └──────┬───────┘
                  │
                  ▼
           ┌──────────────┐
           │  Overdrive   │
           └──────┬───────┘
                  │
                  ▼
           ┌──────────────┐
           │  ReverbSc    │
           │  (Stereo)    │
           └──────┬───────┘
                  │
                  ▼
            [Audio Out L/R]
```

---

## Hardware Controls (Daisy Field)

### Knobs (8x)
| Knob | Parameter | Range | Function |
|------|-----------|-------|----------|
| K0 | FM Ratio | 0.5 - 8.0 | Frequency ratio for FM carrier/modulator |
| K1 | FM Index | 0 - 10 | FM modulation depth |
| K2 | Formant | 200 - 5000 Hz | Granular formant frequency |
| K3 | Grain Shape | 0.0 - 1.0 | Granular oscillator shape morphing |
| K4 | Filter Cutoff | 100 - 10000 Hz | Moog ladder filter frequency |
| K5 | Resonance | 0.0 - 0.95 | Filter resonance/Q factor |
| K6 | Drive | 0.0 - 1.0 | Overdrive amount |
| K7 | Reverb | 0.0 - 0.8 | Reverb feedback amount |

### Keys (16x Capacitive Touch)
- **Key 0**: Trigger Voice 1 (C3 = 130.81 Hz)
- **Key 1**: Trigger Voice 2 (D3 = 146.83 Hz)
- **Keys 2-15**: Reserved for future chromatic scale

### LEDs (8x)
- **LED 0**: Voice 1 active indicator
- **LED 1**: Voice 2 active indicator
- **LEDs 2-7**: Available for expansion

---

## DSP Modules Used

### DaisySP Classes
- `Fm2` (x2) - 2-operator FM synthesis
- `GrainletOscillator` (x2) - Granular synthesis
- `MoogLadder` (x2) - 24dB/oct resonant lowpass filter
- `Adsr` (x2) - Attack-Decay-Sustain-Release envelope
- `Overdrive` (x1) - Soft clipping distortion
- `ReverbSc` (x1) - Stereo reverb (SDRAM allocated)

### Envelope Settings (Both Voices)
- Attack: 5ms
- Decay: 200ms
- Sustain: 70%
- Release: 500ms

---

## Build Instructions

### Prerequisites
1. **arm-none-eabi-gcc** toolchain installed
2. **libDaisy** library (../../libDaisy)
3. **DaisySP** library (../../DaisySP)
4. **dfu-util** for flashing

### Compilation
```bash
cd Daisy-Field-code
make
```

### Flashing to Hardware
```bash
# Put Daisy Field into bootloader mode (BOOT + RESET)
make program-dfu
```

### Clean Build
```bash
make clean
```

---

## Performance Characteristics

### CPU Usage
- Estimated: ~40-50% at 48 kHz sample rate
- Block size: 48 samples (~1ms latency)
- Clock: 480 MHz ARM Cortex-M7

### Memory Allocation
- **DTCM**: Audio buffers, DSP state
- **SDRAM**: ReverbSc internal buffers (large delay lines)
- **Flash**: Firmware code (~20-30 KB)

---

## Modifications & Future Enhancements

### Potential Improvements
1. **Full Keyboard Mapping**: Map all 16 keys to chromatic scale
2. **MIDI Input**: Add MIDI note input via CV/Gate
3. **Preset System**: Save/recall parameter configurations
4. **Velocity Sensitivity**: Map key velocity to envelope or filter
5. **LFO Modulation**: Add LFO control for filter cutoff, FM index
6. **Polyphony**: Extend to 4-8 voices with voice allocation
7. **Alternate Waveforms**: Add ability to switch between FM and pure granular

### Code Optimization
- Implement logarithmic scaling for filter cutoff (currently linear)
- Add parameter smoothing to prevent zipper noise
- Optimize SDRAM usage for longer reverb times

---

## Generated By
**Tool**: Daisy Visual Programming Environment (DVPE) prototype  
**Date**: 2025-12-13  
**Platform**: Daisy Field

---

## License
This is example code for the Electro-Smith Daisy platform.  
Refer to libDaisy and DaisySP licenses for framework usage.
