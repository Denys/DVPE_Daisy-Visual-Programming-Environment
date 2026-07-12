# Guitar Delay Algorithms — Chat Research Transcript

Created: 2026-07-12

This file preserves the full substantive chat contents from the research discussion on guitar delay algorithms, including the academic deep dive and the follow-up block diagrams.

## Conversation

### User

Academic Research Deep Dive On guitar delay algorithms

### Assistant

I’ll treat this as a research task (no repo edits needed), focusing on academic/technical sources and citing what I use.

# Academic Research Deep Dive: Guitar Delay Algorithms

## 1. Executive Summary

“Guitar delay” is not one algorithm but a family of delay-line structures used for echo, slapback, tape delay, bucket-brigade delay, dub delay, modulation delay, flanging, chorus, resonant comb filtering, looping, and even plucked-string physical modeling. At the DSP level, nearly all of them are built from a small set of primitives:

1. Circular delay buffers
2. Feedforward and feedback delay lines
3. Fractional-delay interpolation
4. Time-varying delay modulation
5. Filtering inside or around the feedback path
6. Nonlinear saturation, noise, wow/flutter, and bandwidth limits for analog emulation
7. Multi-tap, stereo, and diffusion networks
8. Comb/allpass/reverberant delay topologies
9. Very short feedback delays for Karplus–Strong and waveguide-like guitar/string synthesis

A basic pedal-style guitar delay is often:

```math
y[n] = x[n] + g \cdot y[n-D]
```

or, more generally:

```math
y[n] = x[n] + f \cdot H(z)\{y[n-D]\}
```

where `x[n]` is the input sample, `y[n]` is the output, `D` is delay in samples, `f` is feedback gain, and `H(z)` is a filter or nonlinear processing block in the feedback loop.

Academic work relevant to guitar delay spans digital audio effects, fractional delay filters, physical modeling, artificial reverberation, and analog delay emulation. Important foundations include Karplus and Strong’s 1983 plucked-string algorithm, Laakso/Välimäki/Karjalainen/Laine’s fractional-delay filter review, Dattorro’s delay-line modulation work, Schroeder’s comb/allpass reverberators, and more recent DAFx work on tape delay and BBD modeling.

Sources referenced in the chat included:

- Karplus & Strong, “Digital Synthesis of Plucked-String and Drum Timbres”: <https://users.soe.ucsc.edu/~karplus/papers/digitar.pdf>
- Laakso et al., “Splitting the Unit Delay”: <https://research.aalto.fi/en/publications/splitting-the-unit-delay-tools-for-fractional-delay-filter-design/>
- DAFx 2005 analog modulation effects paper: <https://www.dafx.de/paper-archive/2005/P_155.pdf>
- DAFx 2018 tape-like delay modulation paper: <https://dafx.de/paper-archive/2018/papers/DAFx2018_paper_9.pdf>
- DSPRelated delay-line interpolation: <https://www.dsprelated.com/freebooks/pasp/Delay_Line_Interpolation.html>
- DSPRelated Schroeder allpass sections: <https://www.dsprelated.com/freebooks/pasp/Schroeder_Allpass_Sections.html>

## 2. Core Digital Delay Line

The fundamental implementation is a circular/ring buffer. For a fixed integer delay `D`:

```text
write_index = n mod buffer_size
read_index  = (write_index - D) mod buffer_size

buffer[write_index] = input
delayed_sample = buffer[read_index]
```

A simple wet/dry delay is:

```math
y[n] = d \cdot x[n] + w \cdot x[n-D]
```

where `d` is dry level and `w` is wet level.

A feedback delay is:

```math
y[n] = x[n] + f \cdot y[n-D]
```

Implementation form:

```text
delayed = delay_buffer.read(D)
output = dry * input + wet * delayed
delay_buffer.write(input + feedback * delayed)
```

This is the basic topology behind digital echo, slapback delay, ping-pong delay, rhythmic delay, dub delay, delay-based looping, and comb filtering when `D` is short.

## 3. Feedforward vs Feedback Delay

A feedforward delay has no recirculation:

```math
y[n] = x[n] + a x[n-D]
```

Transfer function:

```math
H(z) = 1 + a z^{-D}
```

This creates a finite impulse response comb filter.

A feedback delay is recursive:

```math
y[n] = x[n] + b y[n-D]
```

Transfer function:

```math
H(z) = \frac{1}{1 - b z^{-D}}
```

This is an IIR comb filter. Stability requires `|b| < 1`, unless nonlinear limiting/saturation or explicit gain compensation is used.

## 4. Delay Time and Musical Synchronization

A delay time in milliseconds maps to samples as:

```math
D = \frac{T_{ms}}{1000} F_s
```

For tempo-synced delays:

```math
T_{quarter} = \frac{60}{BPM}
```

At 120 BPM:

| Note Value | Delay Time |
|---|---:|
| Quarter | 500 ms |
| Eighth | 250 ms |
| Dotted eighth | 375 ms |
| Sixteenth | 125 ms |
| Triplet eighth | ≈166.7 ms |

## 5. Fractional Delay

Integer delay is easy. Guitar effects become more interesting when delay time is tempo-synced at arbitrary BPM, modulated by an LFO, swept by an expression pedal, smoothed to avoid zipper noise, used for chorus/flanger, used for tape-style pitch bends, or used in physical modeling.

A desired delay is:

```math
D = M + \eta
```

where `M = floor(D)` and `0 <= η < 1`.

Linear interpolation:

```math
\hat{x}[n-\eta] = (1-\eta)x[n] + \eta x[n-1]
```

In delay-buffer form:

```text
i0 = floor(read_position)
i1 = i0 - 1
frac = read_position - floor(read_position)

sample = (1 - frac) * buffer[i0] + frac * buffer[i1]
```

Higher-quality options include 3rd-order Lagrange, 4-point Hermite, windowed sinc, Farrow structures, and allpass fractional delay filters.

## 6. Delay Modulation

Delay modulation means `D` becomes time-varying:

```math
D[n] = D_0 + m[n]
```

where `m[n]` may be a sinusoidal LFO, triangle LFO, random walk, filtered noise, envelope follower, tape wow/flutter model, or expression pedal position.

- Vibrato uses only the modulated delay output.
- Chorus mixes dry signal with one or more slowly modulated short delays.
- Flanger uses very short modulated delay and often feedback.
- Tape delay modulation combines variable speed, wow/flutter, saturation, filtering, and noise.

## 7. Analog Delay Emulation

### Bucket-Brigade Device Delay

BBD delay traits include limited bandwidth, clock noise, companding, anti-alias filtering, reconstruction filtering, nonlinear distortion, sample/hold character, noise accumulation, and darker repeats at long delay times.

Digital BBD emulations often model input anti-alias low-pass, compander encode stage, nonlinear BBD cell behavior or approximation, clock-dependent bandwidth, clock leakage/noise, reconstruction low-pass, compander decode stage, and feedback-path filtering.

### Tape Delay

Tape delay characteristics include continuous medium behavior, multiple heads, tape speed variation, tape saturation, mechanical wow/flutter, erase/record/playback EQ curves, tape wear, noise, and nonlinear hysteresis-like behavior.

A simplified tape delay model:

```math
y[n] = TapePlayback(Delay_{D[n]}(TapeRecord(x[n] + f y[n])))
```

## 8. Filtering and Nonlinearity in the Feedback Loop

General feedback delay:

```math
y[n] = x[n] + f \cdot H(z)y[n-D]
```

`H(z)` may be low-pass, high-pass, band-pass, tilt EQ, shelving EQ, tape/Echoplex-style EQ, BBD reconstruction filter, diffusion allpass, or nonlinear saturation.

A useful saturation form:

```math
sat(x) = tanh(kx)
```

Most musically useful placement is usually inside the feedback path:

```text
feedback_signal = filter(delayed)
feedback_signal = saturate(feedback_signal)
write = input + feedback * feedback_signal
```

## 9. Multi-Tap, Stereo, and Ping-Pong Delay

A multi-tap delay reads several positions from the delay buffer:

```math
y[n] = x[n] + \sum_{k=1}^{K} a_k x[n-D_k]
```

Stereo cross-feedback ping-pong:

```math
y_L[n] = x_L[n] + f_R y_R[n-D_R]
```

```math
y_R[n] = x_R[n] + f_L y_L[n-D_L]
```

## 10. Reverse Delay and Diffused Delay

Reverse delay records blocks and plays them backward while recording subsequent blocks. Better implementations use overlapping windows and crossfades.

Diffused or ambient delay uses allpass structures in the wet path or feedback path. A Schroeder allpass section can be written:

```math
H(z) = \frac{-g + z^{-D}}{1 - gz^{-D}}
```

## 11. Karplus–Strong and Waveguide-Like Delay

Karplus–Strong uses a short feedback delay line to synthesize plucked-string sounds. Basic recurrence:

```math
y[n] = \frac{1}{2}(y[n-N] + y[n-N-1])
```

Approximate pitch:

```math
f_0 \approx \frac{F_s}{N + 1/2}
```

This is essentially a very short filtered feedback delay line and connects directly to digital waveguide string modeling.

## 12. Practical Reference Algorithms

### Basic Feedback Delay

```cpp
float delayed = delay.read(delaySamples);
float y = dry * x + wet * delayed;
delay.write(x + feedback * delayed);
```

### Filtered Feedback Delay

```cpp
float delayed = delay.read(delaySamples);
float fb = lowpass.process(delayed);
fb = highpass.process(fb);
delay.write(x + feedback * fb);
float y = dry * x + wet * delayed;
```

### Saturated Tape-Like Delay

```cpp
float delayed = delay.readInterpolated(modulatedDelaySamples);

float fb = feedbackEQ.process(delayed);
fb = tanh(drive * fb);

float record = recordEQ.process(x + feedback * fb);
record = tanh(recordDrive * record);

delay.write(record);

float wetSignal = playbackEQ.process(delayed + noise());
float y = dry * x + wet * wetSignal;
```

### Chorus

```cpp
float lfo = sin(phase);
float d = baseDelaySamples + depthSamples * lfo;

float delayed = delay.readInterpolated(d);
delay.write(x);

float y = dry * x + wet * delayed;
```

### Flanger with Feedback

```cpp
float lfo = triangleLFO();
float d = baseDelaySamples + depthSamples * lfo;

float delayed = delay.readInterpolated(d);
float y = x + wet * delayed;

delay.write(x + feedback * delayed);
```

### Karplus–Strong

```cpp
// initialize buffer with noise
for i in 0..N:
    delay[i] = random(-1, 1)

while playing:
    a = delay.read(N)
    b = delay.read(N + 1)
    y = 0.5 * (a + b)
    delay.write(decay * y)
    output = y
```

---

### User

Aggiungi i diagrammi a blocchi per gli algoritmi

### Assistant

Certo — sotto trovi una sezione aggiuntiva con diagrammi a blocchi testuali per i principali algoritmi di delay per chitarra. Uso una notazione tipo signal-flow, leggibile anche se poi vuoi trasformarla in Mermaid, SVG, Pure Data, Max/MSP, Faust, JUCE o DaisySP.

Legenda rapida:

```text
[BLK]      = blocco di elaborazione
(+)        = sommatore
---->      = flusso audio
^          = ritorno di feedback
z^-D       = delay di D campioni
H(z)       = filtro
sat()      = saturazione / non-linearità
LFO        = oscillatore a bassa frequenza
```

## 13. Delay digitale base, solo feedforward

```text
          ┌──────────────┐
x[n] ────┬┤ Dry Gain d    ├──────────────┐
         │└──────────────┘              │
         │                              ▼
         │                         ┌────────┐
         │                         │   (+)  ├─── y[n]
         │                         └────────┘
         │                              ▲
         │┌──────────────┐ ┌───────┐   │
         └┤ Delay z^-D    ├─┤ Wet w ├───┘
          └──────────────┘ └───────┘
```

```math
y[n] = d x[n] + w x[n-D]
```

## 14. Feedback delay classico

```text
                         ┌──────────────┐
                         │ Feedback f   │
                         └──────┬───────┘
                                │
                                ▼
                              ┌────┐
x[n] ────────────────────────►│ (+)│────────► [Delay z^-D] ─────┬────► delayed
                              └────┘                            │
                                ▲                               │
                                │                               │
                                └───────────────────────────────┘


x[n] ──► [Dry d] ───────────────────────────────┐
                                                 ▼
delayed ──► [Wet w] ─────────────────────────►  (+) ───► y[n]
```

## 15. Feedback delay con filtro nel loop

```text
                         ┌──────────────┐
                         │ Feedback f   │
                         └──────┬───────┘
                                │
                                ▼
                           ┌─────────┐
                           │ H(z)    │  filtro feedback
                           └────┬────┘
                                │
                                ▼
                              ┌────┐
x[n] ────────────────────────►│ (+)│────► [Delay z^-D] ─────┬────► delayed
                              └────┘                        │
                                ▲                           │
                                │                           │
                                └───────────────────────────┘


x[n] ──► [Dry] ───────────────────────────────┐
                                               ▼
delayed ──► [Wet] ─────────────────────────►  (+) ───► y[n]
```

## 16. Delay analog-style con saturazione nel feedback

```text
                              ┌──────────────┐
                              │ Feedback f   │
                              └──────┬───────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │ Tone H(z)    │
                              └──────┬───────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │ sat()        │
                              └──────┬───────┘
                                     │
                                     ▼
                                   ┌────┐
x[n] ─────────────────────────────►│ (+)│────► [Delay z^-D] ─────┬────► delayed
                                   └────┘                        │
                                     ▲                           │
                                     │                           │
                                     └───────────────────────────┘


x[n] ──► [Dry] ─────────────────────────────────────┐
                                                     ▼
delayed ──► [Wet] ───────────────────────────────►  (+) ───► y[n]
```

## 17. Tape delay semplificato

```text
x[n] ──► [Record EQ] ──► [Tape Saturation] ──► (+) ──► [Variable Delay z^-D[n]] ──► [Playback EQ] ──► [Noise/Wear] ──► wet
                                             ▲                                      │
                                             │                                      │
                                             │                                      ▼
                                             │                              [Feedback EQ]
                                             │                                      │
                                             │                                      ▼
                                             │                                [sat()]
                                             │                                      │
                                             └────────────── [Feedback f] ◄─────────┘


x[n] ──► [Dry Gain] ─────────────────────────────────────────────────────┐
                                                                          ▼
wet ──► [Wet Gain] ───────────────────────────────────────────────────►  (+) ───► y[n]
```

## 18. BBD delay / bucket-brigade style

```text
x[n]
  │
  ▼
[Input Anti-Alias LPF]
  │
  ▼
[Compander Encode]
  │
  ▼
[Pre-emphasis / Drive]
  │
  ▼
[BBD Delay Model z^-D]
  │
  ├──────────────► [Clock Noise / Leakage Add]
  │
  ▼
[Reconstruction LPF]
  │
  ▼
[Compander Decode]
  │
  ▼
wet
```

## 19. Chorus

```text
                    ┌────────────┐
                    │ LFO        │
                    └─────┬──────┘
                          │
                          ▼
                    ┌────────────┐
                    │ D[n]       │
                    │ delay time │
                    └─────┬──────┘
                          │
                          ▼
x[n] ────────┬────► [Fractional Delay z^-D[n]] ──► [Wet Gain] ──┐
             │                                                   │
             │                                                   ▼
             └────► [Dry Gain] ───────────────────────────────► (+) ───► y[n]
```

## 20. Flanger

```text
                    ┌────────────┐
                    │ LFO        │
                    └─────┬──────┘
                          │
                          ▼
                    ┌────────────┐
                    │ D[n]       │
                    └─────┬──────┘
                          │
                          ▼
x[n] ──────────────► (+) ─────► [Fractional Delay z^-D[n]] ─────┬────► delayed
                    ▲                                           │
                    │                                           │
                    │             ┌──────────────┐              │
                    └─────────────┤ Feedback f   │◄─────────────┘
                                  └──────────────┘


x[n] ──► [Dry] ───────────────────────────────┐
                                               ▼
delayed ──► [Wet] ─────────────────────────►  (+) ───► y[n]
```

## 21. Vibrato

```text
                    ┌────────────┐
                    │ LFO        │
                    └─────┬──────┘
                          │
                          ▼
                    ┌────────────┐
                    │ D[n]       │
                    └─────┬──────┘
                          │
                          ▼
x[n] ─────────────► [Fractional Delay z^-D[n]] ───► y[n]
```

## 22. Slapback delay

```text
x[n] ──┬──► [Dry Gain] ─────────────────────────────┐
       │                                             ▼
       └──► [Delay 60–140 ms] ──► [Wet Gain] ─────► (+) ───► y[n]
```

## 23. Ping-pong delay stereo

```text
xL ──► (+) ──► [Delay L] ──► wetL ──► yL
        ▲                         │
        │                         ▼
        │                  [Cross Feedback fLR]
        │                         │
        └────────────── from R ◄──┘


xR ──► (+) ──► [Delay R] ──► wetR ──► yR
        ▲                         │
        │                         ▼
        │                  [Cross Feedback fRL]
        │                         │
        └────────────── from L ◄──┘
```

## 24. Multi-tap delay

```text
x[n] ─────► [Delay Buffer] ───┬──► tap D1 ─► gain a1 ─┐
                              ├──► tap D2 ─► gain a2 ─┤
                              ├──► tap D3 ─► gain a3 ─┤
                              ├──► tap D4 ─► gain a4 ─┤
                              │                       ▼
x[n] ─────► [Dry Gain] ───────┴────────────────────► (+) ───► y[n]
```

## 25. Reverse delay

```text
                 ┌────────────────────┐
x[n] ───────────►│ Record Buffer A     │
                 └────────────────────┘
                          │
                          ▼
                 ┌────────────────────┐
                 │ Reverse Playback A │────┐
                 └────────────────────┘    │
                                           ▼
                                      ┌────────┐
                                      │Crossfade│──► wet
                                      └────────┘
                                           ▲
                 ┌────────────────────┐    │
x[n] ───────────►│ Record Buffer B     │    │
                 └────────────────────┘    │
                          │                │
                          ▼                │
                 ┌────────────────────┐    │
                 │ Reverse Playback B │────┘
                 └────────────────────┘
```

## 26. Ducking delay

```text
x[n] ───────────────────────► [Delay Algorithm] ───► wet ───► [VCA / Gain] ───┐
                                                                               ▼
x[n] ───────────────────────► [Dry Gain] ───────────────────────────────────► (+) ─► y[n]


x[n] ─► [Envelope Follower] ─► [Gain Computer / Inverter] ───────────────────► controls VCA
```

## 27. Diffused delay / ambient delay

```text
x[n] ───────────► (+) ──► [Delay z^-D] ──► [Allpass 1] ──► [Allpass 2] ──► [Tone H(z)] ──► wet
                  ▲                                                                       │
                  │                                                                       │
                  └────────────────────────── [Feedback f] ◄──────────────────────────────┘


x[n] ──► [Dry] ─────────────────────────────────────────────────────────────┐
                                                                             ▼
wet ──► [Wet] ───────────────────────────────────────────────────────────►  (+) ─► y[n]
```

## 28. Feedback Delay Network, FDN

```text
                 ┌──────────────┐
x[n] ──► input ─►│ Delay D1     │──► y1 ─┐
        mix      ├──────────────┤        │
                 │ Delay D2     │──► y2 ─┤
                 ├──────────────┤        │
                 │ Delay D3     │──► y3 ─┤──► [Output Mix] ─► wet
                 ├──────────────┤        │
                 │ Delay D4     │──► y4 ─┘
                 └──────┬───────┘
                        ▲
                        │
                 ┌──────────────┐
                 │ Matrix A     │
                 │ feedback mix │
                 └──────────────┘
```

## 29. Pitch-shift / shimmer delay

```text
x[n] ─────────────► (+) ──► [Delay z^-D] ──► wet ─────────────┐
                     ▲                                        │
                     │                                        ▼
                     │                              [Pitch Shifter +12]
                     │                                        │
                     │                                        ▼
                     │                                  [Tone Filter]
                     │                                        │
                     │                                        ▼
                     └────────────── [Feedback f] ◄───────────┘


x[n] ──► [Dry] ─────────────────────────────────────────────┐
                                                             ▼
wet ──► [Wet] ───────────────────────────────────────────►  (+) ─► y[n]
```

## 30. Granular delay

```text
x[n] ─────► [Circular Audio Buffer]
                  │
                  ├──► [Grain Reader 1] ─► [Window] ─► [Pitch/Rate] ─┐
                  ├──► [Grain Reader 2] ─► [Window] ─► [Pitch/Rate] ─┤
                  ├──► [Grain Reader 3] ─► [Window] ─► [Pitch/Rate] ─┤
                  └──► [Grain Reader N] ─► [Window] ─► [Pitch/Rate] ─┤
                                                                      ▼
                                                                 [Grain Mix]
                                                                      │
                                                                      ▼
                                                                    wet
```

## 31. Karplus–Strong / resonator delay

```text
[Excitation Noise / Pick] ──► (+) ──► [Short Delay z^-N] ──► [Loop Filter] ──► [Decay Gain] ──┐
                              ▲                                                              │
                              │                                                              │
                              └──────────────────────────────────────────────────────────────┘
```

Guitar-like extension:

```text
[Pick Excitation]
        │
        ▼
[Pick Position Filter]
        │
        ▼
      (+) ──► [Fractional Delay / String Length] ──► [Loss Filter] ──► [Dispersion Allpass] ──┐
       ▲                                                                                      │
       │                                                                                      │
       └────────────────────────────── [Loop Gain / Decay] ◄──────────────────────────────────┘
        │
        ▼
[Pickup Position Filter] ──► [Body Resonance] ──► y[n]
```

## 32. Mermaid examples

### Feedback delay

```mermaid
flowchart LR
    X[x[n]] --> SUM((+))
    SUM --> DELAY[Delay z^-D]
    DELAY --> WET[Wet Gain]
    X --> DRY[Dry Gain]
    DRY --> OUTSUM((+))
    WET --> OUTSUM
    OUTSUM --> Y[y[n]]
    DELAY --> FB[Feedback Gain f]
    FB --> SUM
```

### Filtered analog-style delay

```mermaid
flowchart LR
    X[x[n]] --> SUM((+))
    SUM --> DELAY[Delay z^-D]
    DELAY --> WET[Wet Gain]
    X --> DRY[Dry Gain]
    DRY --> OUTSUM((+))
    WET --> OUTSUM
    OUTSUM --> Y[y[n]]

    DELAY --> LPF[Feedback Filter H(z)]
    LPF --> SAT[Saturation]
    SAT --> FB[Feedback Gain f]
    FB --> SUM
```

### Chorus

```mermaid
flowchart LR
    X[x[n]] --> DELAY[Fractional Delay z^-D[n]]
    LFO[LFO] --> MOD[Delay Modulation]
    MOD --> DELAY
    DELAY --> WET[Wet Gain]
    X --> DRY[Dry Gain]
    DRY --> SUM((+))
    WET --> SUM
    SUM --> Y[y[n]]
```

### Tape delay

```mermaid
flowchart LR
    X[x[n]] --> REC[Record EQ]
    REC --> SAT[Tape Saturation]
    SAT --> SUM((+))
    SUM --> DELAY[Variable Delay z^-D[n]]
    MOD[Wow / Flutter / Drift] --> DELAY
    DELAY --> PLAY[Playback EQ]
    PLAY --> NOISE[Noise / Wear]
    NOISE --> WET[Wet Gain]
    X --> DRY[Dry Gain]
    DRY --> OUT((+))
    WET --> OUT
    OUT --> Y[y[n]]

    PLAY --> FBEQ[Feedback EQ]
    FBEQ --> FBSAT[Feedback Saturation]
    FBSAT --> FB[Feedback Gain]
    FB --> SUM
```

### Karplus–Strong

```mermaid
flowchart LR
    EXC[Excitation / Noise Burst] --> SUM((+))
    SUM --> DELAY[Short Delay z^-N]
    DELAY --> FILTER[Loop Filter]
    FILTER --> GAIN[Decay Gain]
    GAIN --> SUM
    DELAY --> BODY[Body / Pickup Filter]
    BODY --> Y[y[n]]
```

## 33. Suggested implementation progression

1. Delay buffer with integer read.
2. Wet/dry plus feedback.
3. Low-pass in the feedback loop.
4. Linear interpolation.
5. Delay-time smoothing.
6. LFO for chorus/flanger.
7. Saturation in the feedback loop.
8. Stereo ping-pong.
9. Allpass diffusors.
10. Tape/BBD coloration.

---

### User

create full chat contents markdown file

### Assistant Action

Created this Markdown transcript file in the repository.

---

## Addendum — Practical Parameter Values and Ranges

This addendum fills the gap between the theory above and implementation-ready parameter choices. The values below are starting points for guitar-focused real-time DSP at `48 kHz`; scale sample counts by `Fs / 48000` for other sample rates. They are deliberately expressed as ranges plus defaults because guitar delay designs are taste-dependent and because several cited papers give structural constraints rather than one universal pedal preset.

### Source-grounded implementation anchors

- **Flanger vs. chorus delay time:** Huovilainen describes flangers as delayed-copy comb filters with delay times around a few milliseconds, while increasing delay to tens of milliseconds is perceived as chorus. Use that as the main boundary between `flanger` and `chorus` modes. Source: DAFx-05 analog modulation model paper.
- **BBD support blocks:** The DAFx-05 BBD discussion states that BBD delay systems need anti-aliasing and anti-imaging low-pass filters, typically second- to fourth-order, and often use a compressor before the BBD plus an expander after it because SNR worsens at longer delay times. Source: DAFx-05.
- **BBD delay-time behavior:** For an `N`-stage BBD, steady delay is tied to clock rate by approximately `td = N / fclock`; Huovilainen also notes that changing clock rate gives inverse/warped delay-time behavior rather than a perfectly linear digital delay trajectory. Source: DAFx-05.
- **Fractional interpolation choice:** DSPRelated/CCRMA notes that linear interpolation is cheap, works best when audio is oversampled or low-frequency-heavy, but rolls off near Nyquist and suppresses images only modestly; it also notes that first-order allpass interpolation costs about the same but has no gain distortion, which matters in near-lossless feedback loops.
- **Tape-like variable speed:** The DAFx-18 tape-delay paper treats tape delay as variable-speed read/write behavior and points out that speedups pitch-shift material upward, which can create content above Nyquist unless the interpolation/readout is bandwidth-limited. It also discusses using linear or cubic interpolation at non-integer read positions.
- **Karplus–Strong tuning and decay:** Karplus and Strong state that wavetable length/period `p` sets frequency approximately as `Fs / p`; their analysis also emphasizes that decay rises strongly with period and falls with harmonic number, so short high notes need compensation if musical sustain is desired.

### Global ranges for a guitar delay module

| Parameter | Practical range | Useful default | Notes |
|---|---:|---:|---|
| `sample_rate` | 44.1, 48, 88.2, 96 kHz | 48 kHz | Use `48 kHz` for embedded guitar pedals unless CPU permits oversampling. |
| `max_delay_time` | 1–4 s | 2 s | Allocate `ceil(max_delay_time * Fs) + interpolation_margin` samples. |
| `delay_time` | 1 ms–2 s | 375 ms | Below 30 ms becomes comb/doubling; 60–140 ms is slapback; 250–750 ms is classic echo. |
| `dry_gain` | 0.0–1.0 | 1.0 | Use equal-power mix if the wet path is dense/modulated. |
| `wet_gain` | 0.0–1.0 | 0.35 | Pedal-style default; raise for ambient or fully wet sends. |
| `feedback` | 0.0–0.95 | 0.35 | Keep `< 1`; if a loop filter boosts, clamp lower. Self-oscillation modes may use saturation and `0.95–1.10`. |
| `input_headroom` | -18 to -6 dBFS nominal | -12 dBFS | Leaves room for feedback buildup and saturation. |
| `parameter_smoothing` | 5–100 ms | 20 ms | Shorter for performance knobs; longer for click-free preset changes. |
| `crossfade_time` | 5–100 ms | 25 ms | Use for clickless delay jumps instead of tape-style pitch glide. |
| `denormal_floor` | `1e-20` to `1e-15` | `1e-18` | Add tiny noise or zero values below threshold. |

### Algorithm-specific starting presets

| Algorithm | Delay time | Mod rate | Mod depth | Feedback | Tone/filtering | Mix |
|---|---:|---:|---:|---:|---|---:|
| Clean digital echo | 125–1000 ms | off | off | 0.15–0.75 | optional HPF 80–150 Hz, LPF 8–16 kHz | wet 20–45% |
| Slapback | 60–140 ms | off | off | 0.0–0.15 | HPF 100 Hz, LPF 4–8 kHz | wet 15–35% |
| Dub delay | 250–750 ms | optional 0.05–0.3 Hz | 1–8 ms | 0.55–0.95 | HPF 120–250 Hz, LPF 1.5–5 kHz, saturation | wet 25–60% |
| Analog/BBD-style delay | 80–600 ms | 0.1–2.5 Hz | 0.5–8 ms | 0.25–0.80 | 2nd–4th order LPF, clock/noise, compander optional | wet 20–45% |
| Tape delay | 80–1200 ms | wow 0.1–1 Hz, flutter 3–12 Hz | 0.2–10 ms equivalent | 0.25–0.90 | record/playback EQ, saturation, hiss | wet 20–50% |
| Chorus | 10–35 ms | 0.1–5 Hz | 1–10 ms | 0.0–0.20 | LPF 6–12 kHz if bright | wet 20–50% |
| Flanger | 0.2–10 ms | 0.05–2 Hz | 0.1–5 ms | -0.80–0.80 | polarity switch; feedback HPF useful | wet 30–60% |
| Vibrato | 5–25 ms | 3–8 Hz | 1–8 ms | 0 | no dry signal | wet 100% |
| Diffused/ambient delay | 200–1200 ms | optional slow | 0–10 ms | 0.45–0.90 | 2–8 allpass stages, HPF/LPF | wet 35–80% |
| Shimmer delay | 300–1200 ms | optional slow | 0–5 ms | 0.40–0.85 | pitch +12 semitones, HPF 150–300 Hz, LPF 6–10 kHz | wet 30–70% |
| Karplus–Strong resonator | `Fs / f0` samples | n/a | fractional tuning | loop gain 0.95–0.999 | loop low-pass and optional body filter | effect-specific |

### Feedback gain as decay time instead of arbitrary knob value

For a musically meaningful `Decay` control, convert desired `RT60` to feedback gain:

```math
feedback = 10^{-3T/RT60}
```

where `T` is delay time in seconds. Useful `RT60` ranges:

| Use | `RT60` range | Notes |
|---|---:|---|
| Short slap | 0.15–0.6 s | Usually no more than 1–2 audible repeats. |
| Standard echo | 1–6 s | Maps better to users than raw feedback. |
| Ambient | 6–20 s | Needs loop filtering and saturation/limiting. |
| Freeze/hold | effectively infinite | Use explicit freeze mode, not uncontrolled `feedback > 1`. |

Example at `delay_time = 500 ms`:

| Desired `RT60` | Feedback |
|---:|---:|
| 1 s | 0.0316 |
| 2 s | 0.1778 |
| 4 s | 0.4217 |
| 8 s | 0.6494 |
| 12 s | 0.7499 |

### Filter and tone ranges

| Block | Range | Default | Why |
|---|---:|---:|---|
| Feedback HPF | 40–300 Hz | 120 Hz | Prevents low-end buildup and keeps repeats behind guitar. |
| Feedback LPF, digital | 6–18 kHz | 12 kHz | Clean but not brittle. |
| Feedback LPF, analog/BBD | 1.5–8 kHz | 4.5 kHz | Darker repeats; aligns with BBD bandwidth limitations and clock-noise filtering. |
| Tape playback LPF | 3–12 kHz | 7 kHz | Warm repeats without excessive dullness. |
| Tape/BBD pre-emphasis | +0–6 dB above 1–3 kHz | +3 dB | Helps saturation/compander feel before later low-pass. |
| Low-mid cleanup | -0–6 dB at 200–500 Hz | -2 dB | Reduces mud in high feedback. |
| Diffusion allpass delay | 3–60 ms | 7, 13, 23 ms | Use mutually prime-ish values to avoid ringing. |
| Allpass feedback `g` | 0.2–0.75 | 0.5 | Higher values smear more but can ring. |

For one-pole smoothing/filters, prefer coefficient calculation from time/frequency instead of magic constants:

```math
alpha_{smooth} = e^{-1/(tau_s Fs)}
```

```math
g_{onepole} = 1 - e^{-2\pi f_c/Fs}
```

### Modulation values

| Mod source | Range | Default | Use |
|---|---:|---:|---|
| Chorus LFO rate | 0.1–5 Hz | 0.8 Hz | Slow ensemble to obvious wobble. |
| Chorus depth | 1–10 ms | 4 ms | Keep base delay high enough that `D[n] > 0`. |
| Flanger LFO rate | 0.05–2 Hz | 0.2 Hz | Slow sweeps are usually more guitar-friendly. |
| Flanger depth | 0.1–5 ms | 1.5 ms | Avoid crossing below interpolation safety margin unless through-zero design. |
| Vibrato rate | 3–8 Hz | 5.5 Hz | Guitar-like pitch vibrato. |
| Vibrato depth | 1–8 ms | 3 ms | Convert to cents by listening; perceived pitch depends on delay derivative. |
| Tape wow | 0.1–1 Hz | 0.35 Hz | Slow speed drift. |
| Tape flutter | 3–12 Hz | 6 Hz | Small depth; avoid seasick pitch unless intentional. |
| Random drift cutoff | 0.05–0.5 Hz | 0.15 Hz | Filtered noise into delay-time modulation. |
| Ducking attack | 1–20 ms | 5 ms | Fast enough to clear picked notes. |
| Ducking release | 100–1000 ms | 350 ms | Delay blooms after phrase endings. |
| Ducking depth | 3–18 dB | 9 dB | More for lead guitar, less for rhythm. |

### BBD-specific practical mapping

For a BBD-style control, expose `delay_time` to the user but internally compute clock-like behavior:

```math
f_{clock} \approx N / t_d
```

Typical virtual stage counts:

| Virtual BBD stages `N` | Time range target | Character |
|---:|---:|---|
| 512–1024 | 1–40 ms | flanger/chorus |
| 2048–4096 | 20–300 ms | short analog delay |
| 8192 | 80–600 ms | long, dark analog delay |

Implementation starting points:

- Use 2nd–4th order low-pass filters before and after the BBD core.
- Lower the low-pass cutoff as delay time increases: `cutoff ≈ clamp(0.35 * fclock, 1.5 kHz, 10 kHz)`.
- Add clock leakage as a very low-level sine or narrowband component near `fclock` only if the modeled clock lands below or near the audible band after scaling; otherwise it becomes unrealistic fizz.
- Place a compressor before and expander after the BBD core for long-delay modes; start with gentle 2:1 compression and matching expansion rather than extreme dynamics.

### Tape-delay practical mapping

Tape-style delay should avoid instant read-pointer jumps. Use variable-speed transition instead:

| Parameter | Range | Default |
|---|---:|---:|
| Time-change slew | 50–1000 ms | 250 ms |
| Record drive | 0–18 dB | 6 dB |
| Feedback drive | 0–24 dB | 9 dB |
| Saturator | `tanh(kx)` with `k = 1–5` | `k = 2` |
| Hiss | -90 to -55 dBFS | -75 dBFS |
| Wow depth | 0.05–1.5% speed variation | 0.25% |
| Flutter depth | 0.01–0.5% speed variation | 0.08% |

Because DAFx-18 warns that speedups can create above-Nyquist content, use either oversampling, bandwidth-limited interpolation, or a dynamic low-pass when `read_speed / record_speed > 1`.

### Interpolation decision table

| Interpolator | When to use | Practical notes |
|---|---|---|
| Nearest | Lo-fi only | Clicky/aliased under modulation. |
| Linear | Embedded CPU budget, darker delays | One multiply and two additions; acceptable for analog-like repeats. |
| First-order allpass | Near-lossless feedback or resonator loops | Similar cost to linear but no magnitude error; phase is less transparent. |
| 3rd-order Lagrange/Hermite | General high-quality guitar delay | Good default for chorus, flanger, tape, and clean delay. |
| Windowed-sinc/Farrow | Studio/plugin quality or heavy pitch motion | Higher CPU; pair with oversampling for best results. |

### Minimal implementation constants for a first working pedal

If you need one conservative implementation profile:

```text
Fs                 = 48000
max_delay_time     = 2.0 s
interpolator       = 3rd-order Lagrange, linear fallback
input_headroom     = -12 dBFS nominal
wet_default        = 0.35
feedback_default   = 0.40
feedback_limit     = 0.92 normal, 1.05 self-osc with saturator
feedback_hpf       = 120 Hz, one-pole or biquad
feedback_lpf       = 4500 Hz analog mode, 12000 Hz clean mode
parameter_smooth   = 20 ms
crossfade_time     = 25 ms
saturator          = tanh(2.0 * x) / tanh(2.0)
chorus             = base 18 ms, depth 4 ms, rate 0.8 Hz
flanger            = base 2 ms, depth 1.5 ms, rate 0.2 Hz, feedback 0.45
slapback           = 95 ms, feedback 0.08, wet 0.25
lead delay         = dotted eighth or 375 ms at 120 BPM, feedback 0.35, wet 0.30
tape               = 420 ms, feedback 0.45, wow 0.35 Hz at 0.25%, flutter 6 Hz at 0.08%
```
