# Daisy Field Architecture Ideas

## Table of Contents


### Part 2: MIDI + Keys as Control Surface (11-20)
11. [MIDI Poly Synth + XY Pad](#11-midi-poly-synth-with-xy-pad) ★★★☆☆
12. [Step Sequencer](#12-step-sequencer-with-midi-sync) ★★★☆☆
13. [Drum Machine Pro](#13-drum-machine-pro) ★★★☆☆
14. [Multi-FX Box A: Parallel](#14-multi-fx-box-a-parallel-mixer) ★★★☆☆
15. [Multi-FX Box B: Serial](#15-multi-fx-box-b-serial-chain) ★★★★☆
16. [Wavetable Synth](#16-wavetable-synth-with-morph) ★★★★☆
17. [Arpeggiator Synth](#17-arpeggiator-synth) ★★★★☆
18. [Looper + Sampler](#18-looper-sampler) ★★★★☆
19. [Modular-Style Patcher](#19-modular-style-semi-patcher) ★★★★★
20. [Live Performance Hub](#20-live-performance-hub) ★★★★★



---



# Part 2: MIDI Keyboard + Keys as Control Surface

*All concepts assume external MIDI keyboard for notes. Field keys A1-A8 and B1-B8 repurposed for controls.*

---

## 11. MIDI Poly Synth with XY Pad
**Complexity: ★★★☆☆**

Keys A1-A8 = X-axis zones, B1-B8 = Y-axis zones for real-time parameter morphing.

```
┌─────────────────────────────────────────────────────┐
│  MIDI IN (Notes)                                    │
└───────────────────────┬─────────────────────────────┘
                        ▼
              ┌───────────────────┐
              │   VoiceManager    │
              │   8× Oscillator   │
              │   + SVF + ADSR    │
              └─────────┬─────────┘
                        │
┌───────────────────────┼─────────────────────────────┐
│  FIELD KEYS AS XY PAD                               │
│  A1-A8: X-axis (Filter Cutoff interpolation)        │
│  B1-B8: Y-axis (Resonance / FX Mix)                 │
└───────────────────────┼─────────────────────────────┘
                        ▼
              ┌───────────────────┐
              │   Chorus/Reverb   │
              └─────────┬─────────┘
                        ▼
                    OUTPUT

KNOBS: 1-4=ADSR, 5=XY Smoothing, 6-8=FX
```

---

## 12. Step Sequencer with MIDI Sync
**Complexity: ★★★☆☆**

16-step CV/Gate sequencer. Keys program steps, MIDI clock sync.

```
┌─────────────────────────────────────────────────────┐
│              MIDI CLOCK IN (Sync)                   │
└───────────────────────┬─────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────┐
│              16-STEP SEQUENCER                      │
│  ┌─────────────────────────────────────────────┐    │
│  │ Step: 1  2  3  4  5  6  7  8  ...  16       │    │
│  │ Note: C  -  E  -  G  -  C  -  ...  -        │    │
│  │ Gate: ●  ○  ●  ○  ●  ●  ●  ○  ...  ○        │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  KEYS A1-A8: Select step 1-8                        │
│  KEYS B1-B8: Select step 9-16                       │
│  KNOB 1: Note pitch for selected step               │
│  KNOB 2: Gate length                                │
│  KNOB 3: Velocity                                   │
└───────────────────────┬─────────────────────────────┘
                        │ Note/Gate
                        ▼
              ┌───────────────────┐
              │   INTERNAL SYNTH  │
              │   or MIDI OUT     │
              └─────────┬─────────┘
                        ▼
                    OUTPUT

SW1: Play/Stop, SW2: Record mode
OLED: Step grid, current position, note values
```

---

## 13. Drum Machine Pro
**Complexity: ★★★☆☆**

6-voice drums, 16-step pattern, 8 patterns stored.

```
┌─────────────────────────────────────────────────────┐
│              PATTERN MEMORY (8 patterns)            │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────┐
│            16-STEP DRUM SEQUENCER                   │
│                                                     │
│  KEYS A1-A8: Steps 1-8 toggle (current drum)        │
│  KEYS B1-B8: Steps 9-16 toggle                      │
│  SW1: Drum select (cycle Kick/Snare/Hat/Tom/Clap/Rim)│
│  SW2: Pattern select (cycle 1-8)                    │
└───────────────────────┬─────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────┐
│              DRUM VOICES                            │
│  ┌────────┐ ┌────────┐ ┌────────┐                   │
│  │ Analog │ │ Synth  │ │ HiHat  │ ...               │
│  │BassDrum│ │SnareDrm│ │        │                   │
│  └───┬────┘ └───┬────┘ └───┬────┘                   │
│      └──────────┴──────────┘                        │
└───────────────────────┬─────────────────────────────┘
                        ▼
              ┌───────────────────┐
              │   MIXER + COMP    │
              └─────────┬─────────┘
                        ▼
                    OUTPUT

KNOBS: 1-6=Drum tuning/decay, 7=Tempo, 8=Swing
MIDI: Sync + trigger individual drums
```

---

## 14. Multi-FX Box A: Parallel Mixer
**Complexity: ★★★☆☆**

Two mono inputs mixed with parallel FX sends.

```
┌─────────────┐                     ┌─────────────┐
│  AUDIO IN L │                     │  AUDIO IN R │
└──────┬──────┘                     └──────┬──────┘
       │                                   │
       ▼                                   ▼
┌─────────────────────────────────────────────────────┐
│                    INPUT MIXER                      │
│  ┌─────────────────┐     ┌─────────────────┐        │
│  │ Input L Gain    │     │ Input R Gain    │        │
│  │ (Knob 1)        │     │ (Knob 2)        │        │
│  └────────┬────────┘     └────────┬────────┘        │
│           └──────────┬───────────┘                  │
│                      │ Stereo Bus                   │
└──────────────────────┼──────────────────────────────┘
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
┌────────────┐  ┌────────────┐  ┌────────────┐
│   CHORUS   │  │   DELAY    │  │   REVERB   │
│  (Send 1)  │  │  (Send 2)  │  │  (Send 3)  │
└─────┬──────┘  └─────┬──────┘  └─────┬──────┘
      │               │               │
      └───────────────┼───────────────┘
                      │ Return Mix
                      ▼
              ┌───────────────┐
              │  OUTPUT MIX   │
              │  Dry + Wet    │
              └───────┬───────┘
                      ▼
              ┌───────────────┐
              │   OUTPUT L/R  │
              └───────────────┘

KEYS A1-A4: FX1 (Chorus) params quick select
KEYS A5-A8: FX2 (Delay) params quick select
KEYS B1-B4: FX3 (Reverb) params quick select
KEYS B5-B8: Preset recall (4 presets)

KNOBS: 1-2=Input gains, 3-5=Send levels, 6-8=FX params
OLED: Signal levels, active FX, param zoom
```

---

## 15. Multi-FX Box B: Serial Chain
**Complexity: ★★★★☆**

Two mono inputs, 6 FX in configurable serial order.

```
┌─────────────┐                     ┌─────────────┐
│  AUDIO IN L │                     │  AUDIO IN R │
└──────┬──────┘                     └──────┬──────┘
       │                                   │
       ▼                                   ▼
┌─────────────────────────────────────────────────────┐
│              INPUT SECTION                          │
│  Gain L (K1) ──┬── Pan ──┬── Gain R (K2)            │
│                │  MIX    │                          │
└────────────────┼─────────┼──────────────────────────┘
                 └────┬────┘
                      ▼
┌─────────────────────────────────────────────────────┐
│            SERIAL FX CHAIN (Configurable)           │
│                                                     │
│  ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐          │
│  │SLOT 1│──►│SLOT 2│──►│SLOT 3│──►│SLOT 4│──► ...   │
│  └──────┘   └──────┘   └──────┘   └──────┘          │
│                                                     │
│  Available FX per slot:                             │
│  - Overdrive    - Chorus    - Flanger              │
│  - Phaser       - Delay     - Reverb               │
│  - Bitcrush     - Tremolo   - Autowah              │
│                                                     │
│  KEYS A1-A8: Select FX for current slot             │
│  KEYS B1-B4: Select slot 1-4 to edit                │
│  KEYS B5-B8: Bypass slot 1-4                        │
└───────────────────────┬─────────────────────────────┘
                        ▼
              ┌───────────────────┐
              │   OUTPUT L/R     │
              └───────────────────┘

KNOBS: 1-2=Input, 3-6=Current FX params, 7-8=Output
SW1: Slot select, SW2: FX select within slot
OLED: Chain diagram, current FX params
```

---

## 16. Wavetable Synth with Morph
**Complexity: ★★★★☆**

Custom wavetables with position morphing.

```
┌─────────────────────────────────────────────────────┐
│                  MIDI IN                            │
└───────────────────────┬─────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────┐
│              WAVETABLE ENGINE                       │
│  ┌─────────────────────────────────────────────┐    │
│  │  Table: [Sine|Saw|Square|Custom1|Custom2]   │    │
│  │  Position ◄── Knob 1 + LFO                  │    │
│  │  Morph Speed ◄── Knob 2                     │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  KEYS A1-A8: Wavetable bank select                  │
│  KEYS B1-B8: Morph curve select                     │
└───────────────────────┬─────────────────────────────┘
                        ▼
              ┌───────────────────┐
              │   SVF + ADSR      │
              └─────────┬─────────┘
                        ▼
              ┌───────────────────┐
              │   Stereo FX       │
              └─────────┬─────────┘
                        ▼
                    OUTPUT

KNOBS: 1=Position, 2=Morph, 3=Filter, 4-7=ADSR, 8=FX
```

---

## 17. Arpeggiator Synth
**Complexity: ★★★★☆**

Hold chords on MIDI, keys control arp pattern/direction.

```
┌─────────────────────────────────────────────────────┐
│              MIDI IN (Held Notes)                   │
└───────────────────────┬─────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────┐
│              ARPEGGIATOR ENGINE                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ Direction: Up | Down | UpDown | Random      │    │
│  │ Octaves: 1-4                                 │    │
│  │ Pattern: Straight | Dotted | Swing          │    │
│  │ Gate: 25% | 50% | 75% | 100%                │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  KEYS A1-A4: Direction select                       │
│  KEYS A5-A8: Octave range                           │
│  KEYS B1-B4: Rhythm pattern                         │
│  KEYS B5-B8: Gate length                            │
└───────────────────────┬─────────────────────────────┘
                        ▼
              ┌───────────────────┐
              │   SYNTH VOICE     │
              │   (Poly/Mono)     │
              └─────────┬─────────┘
                        ▼
                    OUTPUT

KNOBS: 1=Rate, 2=Swing, 3-6=Synth params, 7-8=FX
MIDI OUT: Send arpeggiated notes to external gear
```

---

## 18. Looper + Sampler
**Complexity: ★★★★☆**

Record loops from audio input, trigger via keys.

```
┌─────────────┐                     ┌─────────────┐
│  AUDIO IN L │                     │  AUDIO IN R │
└──────┬──────┘                     └──────┬──────┘
       │                                   │
       └───────────────┬───────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│              LOOP RECORDER                          │
│  ┌─────────────────────────────────────────────┐    │
│  │ Buffer: 8 slots × 4 seconds each            │    │
│  │ Overdub: Layer on existing loops            │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  KEYS A1-A8: Trigger/Record slot 1-8               │
│  KEYS B1-B4: Playback mode (OneShot/Loop/Rev/Half) │
│  KEYS B5-B8: Mute slots 1-4                        │
│                                                     │
│  SW1 (hold): Record arm                             │
│  SW1 (tap): Start/Stop recording                    │
│  SW2: Clear selected slot                           │
└───────────────────────┬─────────────────────────────┘
                        ▼
              ┌───────────────────┐
              │   MIXER + FX      │
              └─────────┬─────────┘
                        ▼
                    OUTPUT

KNOBS: 1-4=Slot volumes, 5=Input, 6=FX Send, 7-8=FX
OLED: Waveform display, slot status, recording time
```

---

## 19. Modular-Style Semi-Patcher
**Complexity: ★★★★★**

Keys select source→destination routing. Virtual patch cables.

```
┌─────────────────────────────────────────────────────┐
│                 MODULES                             │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐       │
│  │ OSC │  │ LFO │  │ ENV │  │ FLT │  │ VCA │       │
│  │  1  │  │  1  │  │  1  │  │  1  │  │  1  │       │
│  └──┬──┘  └──┬──┘  └──┬──┘  └──┬──┘  └──┬──┘       │
│     │        │        │        │        │          │
└─────┼────────┼────────┼────────┼────────┼──────────┘
      │        │        │        │        │
      └────────┴────────┴────────┴────────┘
                       │
┌──────────────────────┼──────────────────────────────┐
│          PATCH MATRIX (Keys)                        │
│                                                     │
│  KEYS A1-A8: Select SOURCE module                   │
│    A1=OSC1 Out, A2=OSC2 Out, A3=LFO1, A4=LFO2      │
│    A5=ENV1, A6=ENV2, A7=Noise, A8=AudioIn          │
│                                                     │
│  KEYS B1-B8: Select DESTINATION                     │
│    B1=OSC1 Freq, B2=OSC2 Freq, B3=Filter Cutoff    │
│    B4=Filter Res, B5=VCA Amp, B6=LFO Rate          │
│    B7=Pan, B8=FX Send                               │
│                                                     │
│  Press A+B simultaneously = Create patch            │
│  Hold SW1 + Press A+B = Remove patch                │
└───────────────────────┬─────────────────────────────┘
                        ▼
              ┌───────────────────┐
              │   Audio Output    │
              └───────────────────┘

KNOBS: Adjust parameter of last-touched module
OLED: Patch connection diagram, signal flow
```

---

## 20. Live Performance Hub
**Complexity: ★★★★★**

Unified synth + drums + FX + sequencer + looper.

```
┌─────────────────────────────────────────────────────────────┐
│                    MODE SYSTEM                              │
│  SW1+SW2 combo selects mode:                                │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                │
│  │ SYNTH  │ │ DRUMS  │ │  FX    │ │ LOOPER │                │
│  └────────┘ └────────┘ └────────┘ └────────┘                │
└─────────────────────────────────────────────────────────────┘

┌─ SYNTH MODE ────────────────────────────────────────────────┐
│  MIDI ──► 8-voice Poly ──► FX Bus                           │
│  KEYS A: Waveform select, KEYS B: Preset recall             │
└─────────────────────────────────────────────────────────────┘

┌─ DRUMS MODE ────────────────────────────────────────────────┐
│  Metro ──► 16-Step Seq ──► 6 Drums ──► FX Bus               │
│  KEYS A: Step edit, KEYS B: Pattern select                  │
└─────────────────────────────────────────────────────────────┘

┌─ FX MODE ───────────────────────────────────────────────────┐
│  Audio In L+R ──► Serial FX Chain ──► Output                │
│  KEYS A: FX slot select, KEYS B: FX type select             │
└─────────────────────────────────────────────────────────────┘

┌─ LOOPER MODE ───────────────────────────────────────────────┐
│  Audio In ──► 8-slot Looper ──► Mixer ──► Output            │
│  KEYS A: Record/Play slots, KEYS B: Playback modes          │
└─────────────────────────────────────────────────────────────┘

                              │
                              ▼
                    ┌───────────────────┐
                    │   MASTER OUTPUT   │
                    │   with Limiter    │
                    └───────────────────┘

MIDI: Full I/O, Clock sync
CV: 4 inputs + 2 outputs for modular integration
OLED: Mode-specific UI with parameter zoom
```

---

## Summary Table

| # | Project | Complexity | Key Modules | Keys Function |
|---|---------|------------|-------------|---------------|
| 1 | Drone Station | ★☆☆☆☆ | Oscillator | Note triggers |
| 2 | Subtractive Monosynth | ★★☆☆☆ | Osc+Svf+Adsr | Note triggers |
| 3 | Mini Drum Machine | ★★☆☆☆ | DrumSynths | Pattern steps |
| 4 | Delay + Reverb FX | ★★★☆☆ | DelayLine+Reverb | Bypass toggles |
| 5 | FM Synthesizer | ★★★☆☆ | Fm2 | Note triggers |
| 6 | StringVoice Synth | ★★★☆☆ | StringVoice | Note triggers |
| 7 | Granular Texture | ★★★★☆ | GrainletOsc | Param select |
| 8 | Poly Modal Synth | ★★★★☆ | ModalVoice | Param select |
| 9 | Formant Vowel Synth | ★★★★☆ | FormantOsc | Vowel select |
| 10 | Performance Workstation | ★★★★★ | All | Mode-dependent |
| 11 | MIDI Poly + XY Pad | ★★★☆☆ | Osc+Svf | XY pad zones |
| 12 | Step Sequencer | ★★★☆☆ | Metro+MIDI | Step select |
| 13 | Drum Machine Pro | ★★★☆☆ | DrumSynths | Step toggle |
| 14 | Multi-FX Parallel | ★★★☆☆ | Chorus+Delay+Reverb | FX select |
| 15 | Multi-FX Serial | ★★★★☆ | 9 FX types | Chain config |
| 16 | Wavetable Synth | ★★★★☆ | Custom tables | Bank select |
| 17 | Arpeggiator Synth | ★★★★☆ | Arp+Synth | Pattern select |
| 18 | Looper Sampler | ★★★★☆ | DelayLine buffers | Slot trigger |
| 19 | Modular Patcher | ★★★★★ | All modules | Patch matrix |
| 20 | Live Performance Hub | ★★★★★ | Everything | Mode-specific |

---

**Generated per DAISY_EXPERT_SYSTEM_PROMPT_v5.2 guidelines**
**All designs use OLED Zoom Visualization and fonepole smoothing**

---