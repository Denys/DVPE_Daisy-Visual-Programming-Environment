# Daisy Pod Architecture Ideas

*16 project concepts for Daisy Pod hardware, organized by input type and complexity.*

## Table of Contents

### Part 1: Line In Projects (1-6)
1. [Simple Tremolo](#1-simple-tremolo) ★★☆☆☆☆☆☆
2. [Bitcrusher](#2-bitcrusher) ★★★☆☆☆☆☆
3. [Delay Pedal](#3-delay-pedal) ★★★★☆☆☆☆
4. [Chorus + Flanger](#4-chorus--flanger) ★★★★★☆☆☆
5. [Multi-FX Chain](#5-multi-fx-chain) ★★★★★★☆☆
6. [Reverb + Shimmer](#6-reverb--shimmer) ★★★★★★★★

### Part 2: MIDI IN Projects (7-12)
7. [Mono Synth](#7-mono-synth) ★★☆☆☆☆☆☆
8. [FM Synth](#8-fm-synth) ★★★☆☆☆☆☆
9. [Pluck Synth](#9-pluck-synth) ★★★★☆☆☆☆
10. [Poly Synth 4-Voice](#10-poly-synth-4-voice) ★★★★★☆☆☆
11. [Drum Synth](#11-drum-synth) ★★★★★★☆☆
12. [Physical Model Synth](#12-physical-model-synth) ★★★★★★★★

### Part 3: Line In + MIDI Projects (13-16)
13. [Vocoder Lite](#13-vocoder-lite) ★★★☆☆☆☆☆
14. [MIDI-Controlled Filter](#14-midi-controlled-filter) ★★★★★☆☆☆
15. [Harmonizer](#15-harmonizer) ★★★★★★☆☆
16. [Synth + FX Workstation](#16-synth--fx-workstation) ★★★★★★★★

---

## Pod Hardware Reference

```
┌─────────────────────────────────────────┐
│              DAISY POD                  │
│    ┌───┐                    ┌───┐       │
│    │ K1│                    │ K2│       │  K1, K2 = Knobs
│    └───┘                    └───┘       │
│         ┌───┐        ┌───┐              │
│         │ B1│        │ B2│              │  B1, B2 = Buttons
│         └───┘        └───┘              │
│              ◉ RGB LED                  │
│  AUDIO IN ──►         ──► AUDIO OUT     │
│  MIDI IN ──►                            │
└─────────────────────────────────────────┘
```

---

# Part 1: Line In Projects

---

## 1. Simple Tremolo
**Complexity: ★★☆☆☆☆☆☆**

Classic amplitude modulation effect.

```
AUDIO IN ──► TREMOLO ──► AUDIO OUT
             │
             ├── Rate ◄── K1
             └── Depth ◄── K2

B1: Waveform (Sine/Tri)  B2: Bypass
LED: Pulses with LFO rate
```

**Modules:** `Tremolo`

---

## 2. Bitcrusher
**Complexity: ★★★☆☆☆☆☆**

Lo-fi destruction: reduce bit depth and sample rate.

```
AUDIO IN ──► BITCRUSH ──► DECIMATOR ──► AUDIO OUT
             │             │
             Bits ◄── K1   Downsample ◄── K2

B1: Mix toggle  B2: Bypass
LED: Color = bit depth (Green=16, Red=2)
```

**Modules:** `Bitcrush`, `Decimator`

---

## 3. Delay Pedal
**Complexity: ★★★★☆☆☆☆**

Digital delay with tap tempo.

```
AUDIO IN ──► DELAY LINE ──┬──► AUDIO OUT
             ▲            │
             └────────────┘ (feedback)

Time ◄── K1 (10ms-1s)    Feedback ◄── K2 (0-95%)
B1: Tap Tempo             B2: Bypass
LED: Flashes at delay tempo
```

**Modules:** `DelayLine<float, MAX_DELAY>`

---

## 4. Chorus + Flanger
**Complexity: ★★★★★☆☆☆**

Dual modulation with mode switch.

```
AUDIO IN ──► [CHORUS / FLANGER] ──► STEREO OUT

Chorus: Depth ◄── K1, Rate ◄── K2
Flanger: Depth ◄── K1, Feedback ◄── K2

B1: Mode toggle    B2: Bypass
LED: Blue=Chorus, Green=Flanger
```

**Modules:** `Chorus`, `Flanger`

---

## 5. Multi-FX Chain
**Complexity: ★★★★★★☆☆**

3-stage serial: Overdrive → Delay → Reverb.

```
AUDIO IN ──► OVERDRIVE ──► DELAY ──► REVERB ──► AUDIO OUT

B1: Cycle active FX (OD/Delay/Reverb)
K1/K2: Edit selected FX params
B2: Bypass current FX
LED: R=OD, G=Delay, B=Reverb
```

**Modules:** `Overdrive`, `DelayLine<>`, `ReverbSc`

---

## 6. Reverb + Shimmer
**Complexity: ★★★★★★★★**

Lush reverb with pitch-shifted feedback.

```
AUDIO IN ──► REVERB ──► PITCH SHIFT (+12) ──┐
                 ▲                          │
                 └──────────────────────────┘

Decay ◄── K1    Shimmer Amount ◄── K2
B1: Shimmer interval (+12/+7/+5)  B2: Bypass
LED: Fades with reverb tail
```

**Modules:** `ReverbSc`, `PitchShifter`

---

# Part 2: MIDI IN Projects

---

## 7. Mono Synth
**Complexity: ★★☆☆☆☆☆☆**

Simple monophonic synthesizer.

```
MIDI IN ──► OSCILLATOR ──► SVF FILTER ──► ENV ──► AUDIO OUT

Cutoff ◄── K1    Resonance ◄── K2
B1: Waveform cycle    B2: Octave shift
LED: Lights on note
```

**Modules:** `Oscillator`, `Svf`, `AdEnv`

---

## 8. FM Synth
**Complexity: ★★★☆☆☆☆☆**

Two-operator FM synthesis.

```
MIDI IN ──► FM2 ──► ADSR ──► AUDIO OUT
            │
            ├── Index ◄── K1
            └── Ratio ◄── K2

B1: Preset (Bass/Bell/Brass)    B2: Octave
LED: Color changes with ratio
```

**Modules:** `Fm2`, `Adsr`

---

## 9. Pluck Synth
**Complexity: ★★★★☆☆☆☆**

Karplus-Strong plucked string synthesis.

```
MIDI IN ──► PLUCK ──► AUDIO OUT

Decay ◄── K1 (0.8-0.99)    Damping ◄── K2
B1: Mode    B2: Sustain toggle
LED: Fades with note decay
```

**Modules:** `Pluck`

---

## 10. Poly Synth 4-Voice
**Complexity: ★★★★★☆☆☆**

4-voice polyphonic with voice stealing.

```
MIDI IN ──► VOICE MANAGER ──► MIX ──► AUDIO OUT
            │
            ├── Voice 1 (OSC+FLT+ENV)
            ├── Voice 2
            ├── Voice 3
            └── Voice 4

Cutoff ◄── K1 (all)    Res ◄── K2 (all)
B1: Waveform    B2: Unison detune
LED: Brightness = active voices
```

**Modules:** `Oscillator`×4, `Svf`×4, `Adsr`×4

---

## 11. Drum Synth
**Complexity: ★★★★★★☆☆**

MIDI-triggered drums (C1-B1 = different drums).

```
MIDI IN ──► DRUM MAPPER ──► MIX ──► STEREO OUT
            │
            ├── C1: Kick (AnalogBassDrum)
            ├── D1: Snare (SynthSnareDrum)
            ├── E1: Closed HiHat
            ├── F1: Open HiHat
            └── G1: Clap

Tune ◄── K1    Decay ◄── K2
B1: Kit select    B2: Accent
LED: Color per drum type
```

**Modules:** `AnalogBassDrum`, `SynthSnareDrum`, `HiHat<>`

---

## 12. Physical Model Synth
**Complexity: ★★★★★★★★**

StringVoice + ModalVoice physical modeling.

```
MIDI IN ──► [STRING / MODAL] ──► REVERB ──► STEREO OUT

Brightness ◄── K1    Structure ◄── K2
B1: Model (String/Modal)    B2: Sustain
LED: Green=String, Blue=Modal
```

**Modules (LGPL):** `StringVoice`, `ModalVoice`, `ReverbSc`

---

# Part 3: Line In + MIDI Projects

---

## 13. Vocoder Lite
**Complexity: ★★★☆☆☆☆☆**

Audio = modulator, MIDI = carrier.

```
AUDIO IN ──► Envelope Follower ──┐
                                 ▼
MIDI IN ──► Carrier OSC ──► VCA ──► Filter ──► OUT

Bands ◄── K1 (4/8/16)    Carrier Mix ◄── K2
B1: Freeze    B2: Bypass
LED: Brightness = input level
```

**Modules:** `Oscillator`, `Svf`

---

## 14. MIDI-Controlled Filter
**Complexity: ★★★★★☆☆☆**

Filter audio with MIDI note = cutoff.

```
AUDIO IN ──► MOOG LADDER ──► AUDIO OUT
             │
             └── Cutoff ◄── MIDI Note (mtof)
                 Res ◄── MIDI Velocity

Offset ◄── K1    Env Follow ◄── K2
B1: Filter type (LP/BP/HP)    B2: Key tracking
LED: Color = frequency
```

**Modules:** `MoogLadder`, `Svf`

---

## 15. Harmonizer
**Complexity: ★★★★★★☆☆**

Pitch shift audio based on held MIDI notes.

```
AUDIO IN ──┬──────────────────── DRY ──┐
           │                           │
           ├──► PitchShift (int 1) ───┤
           │                           ├──► MIX ──► OUT
           └──► PitchShift (int 2) ───┘

Dry/Wet ◄── K1    Detune ◄── K2
B1: Mode (MIDI/Fixed)    B2: Bypass
LED: Brightness = harmony voices
```

**Modules:** `PitchShifter`

---

## 16. Synth + FX Workstation
**Complexity: ★★★★★★★★**

4-voice poly synth + audio input through shared FX.

```
AUDIO IN ──► Gate ──┐
                    ▼
MIDI IN ──► POLY ──► MIXER ──► FX BUS ──► STEREO OUT
                     │         │
          Balance ◄──K1       ├── Chorus
                              ├── Delay
                              └── Reverb

FX Amount ◄── K2
B1: Audio gate    B2: FX select
LED: Dual color blend (Audio+Synth)
```

**Modules:** `Oscillator`×4, `Svf`×4, `Adsr`×4, `Chorus`, `DelayLine<>`, `ReverbSc`

---

## Summary Table

| # | Project | Complexity | Input | Key Modules |
|---|---------|------------|-------|-------------|
| 1 | Tremolo | ★★☆ | Line | Tremolo |
| 2 | Bitcrusher | ★★★☆ | Line | Bitcrush |
| 3 | Delay | ★★★★☆ | Line | DelayLine |
| 4 | Chorus/Flanger | ★★★★★☆ | Line | Chorus, Flanger |
| 5 | Multi-FX | ★★★★★★☆ | Line | OD, Delay, Reverb |
| 6 | Shimmer Reverb | ★★★★★★★★ | Line | ReverbSc, PitchShift |
| 7 | Mono Synth | ★★☆ | MIDI | Osc, Svf |
| 8 | FM Synth | ★★★☆ | MIDI | Fm2 |
| 9 | Pluck Synth | ★★★★☆ | MIDI | Pluck |
| 10 | Poly Synth | ★★★★★☆ | MIDI | Osc×4 |
| 11 | Drum Synth | ★★★★★★☆ | MIDI | DrumSynths |
| 12 | Physical Model | ★★★★★★★★ | MIDI | StringVoice |
| 13 | Vocoder | ★★★☆ | Both | Osc, EnvFollow |
| 14 | MIDI Filter | ★★★★★☆ | Both | MoogLadder |
| 15 | Harmonizer | ★★★★★★☆ | Both | PitchShifter |
| 16 | Synth+FX | ★★★★★★★★ | Both | All combined |

---

**Generated per DAISY_EXPERT_SYSTEM_PROMPT_v5.2 guidelines**
