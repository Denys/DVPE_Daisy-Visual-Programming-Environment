# Guitar Delay Algorithms — Theory, Derived Relationships, and Practical Parameters

Status: canonical Markdown reference for DVPE delay-block design  
Research basis: PR #1 theory/formulas/diagrams + PR #2 parameter research + the existing HTML study  
Reference operating point: `Fs = 48 kHz`, `float32`, guitar-pedal / embedded real-time use

> This document deliberately follows **formula → derived relationship → practical values → DVPE mapping → verification**.  
> The archived PR source documents are retained in `DVPE-theory/archive/` for provenance, but this file is the implementation-facing authority.

---

## 0. Evidence labels and conventions

Parameter values in audio products are partly source-derived and partly engineering choices. To stop those categories from quietly mutating into “facts,” this document uses three labels:

- **SRC** — directly supported by a cited paper, book, library contract, or device relationship.
- **DERIVED** — calculated from a sourced formula or explicit design target.
- **REC** — recommended starting point for DVPE/Daisy guitar use; verify by measurement and listening.

Notation:

| Symbol | Meaning |
|---|---|
| `x[n]` | input sample |
| `y[n]` | output sample |
| `d[n]` | delayed sample |
| `Fs` | sample rate, samples/s |
| `D` | delay in samples |
| `T` | delay in seconds |
| `g` | scalar loop feedback gain |
| `F(z)` | loop filter or loop processor |
| `w` | wet-path gain |
| `a` | dry-path gain |
| `μ` | fractional sample position, `0 ≤ μ < 1` |

Recommended global defaults:

| Parameter | Default | Normal range | Expert range | Label |
|---|---:|---:|---:|---|
| `sampleRateHz` | 48000 | 44100–48000 | 88200–96000 | REC |
| `maxDelayMs` | 2000 ms | 500–4000 ms | up to 8000 ms with SDRAM | REC |
| `inputNominalDbfs` | -12 dBFS | -18 to -6 dBFS | hardware-specific | REC |
| `parameterSmoothMs` | 20 ms | 5–100 ms | 1–250 ms by control role | REC |
| `delayCrossfadeMs` | 25 ms | 5–100 ms | 250 ms for deliberately slow morphs | REC |
| `outputCeiling` | 0.95 FS | 0.8–0.98 | model-specific | REC |
| `normalFeedbackMax` | 0.92 | 0.85–0.95 | >0.95 only in explicit self-oscillation/freeze modes | REC |

---

## 1. Core circular delay line

### 1.1 Signal model

For a fixed integer delay:

```math
D = T F_s
```

```math
d[n] = x[n-D]
```

Wet/dry output:

```math
y[n] = a x[n] + w d[n]
```

Canonical circular-buffer operation:

```text
write_index = n mod buffer_size
read_index  = (write_index - D) mod buffer_size

delayed = buffer[read_index]
buffer[write_index] = input
```

For a feedback delay, read before writing unless the intended one-sample topology says otherwise:

```cpp
float delayed = delay.read(delaySamples);
float loopIn  = input + feedback * loopProcessor(delayed);
delay.write(loopIn);
float output  = dryGain * input + wetGain * delayed;
```

### 1.2 Derived implementation quantities

```math
D_{samples} = \frac{T_{ms}}{1000} F_s
```

```math
T_{ms} = 1000 \frac{D_{samples}}{F_s}
```

Buffer allocation with interpolation guard:

```math
N_{buffer} = \lceil F_s T_{max} \rceil + N_{guard}
```

At 48 kHz:

| Delay | Samples | float32 mono | float32 stereo | Label |
|---:|---:|---:|---:|---|
| 100 ms | 4,800 | 18.75 KiB | 37.5 KiB | DERIVED |
| 500 ms | 24,000 | 93.75 KiB | 187.5 KiB | DERIVED |
| 1 s | 48,000 | 187.5 KiB | 375 KiB | DERIVED |
| 2 s | 96,000 | 375 KiB | 750 KiB | DERIVED |
| 4 s | 192,000 | 750 KiB | 1.465 MiB | DERIVED |

### 1.3 Practical parameters

| Parameter | Default | Normal range | Curve / step | Constraint | Label |
|---|---:|---:|---|---|---|
| `delayTimeMs` | 375 ms | 1–2000 ms | logarithmic, 1 ms display | clamp to allocated memory | REC |
| `dryGain` | 1.0 | 0–1 | linear, 0.01 | 0 in wet-only/vibrato mode | REC |
| `wetGain` | 0.35 | 0–1 | linear or equal-power | preserve headroom in summing | REC |
| `feedback` | 0.35 | 0–0.92 | shaped linear, 0.01 | use complete-loop gain limit | REC |
| `feedbackPolarity` | +1 | -1 / +1 | toggle | negative feedback changes comb pattern | REC |

### 1.4 DVPE mapping

```yaml
delayTimeMs:
  defaultValue: 375
  range: [1, 2000]
  unit: ms
  step: 1
  curve: log
  generatedExpression: delayTimeMs * sampleRateHz / 1000.0

feedback:
  defaultValue: 0.35
  range: [0.0, 0.92]
  expertRange: [0.92, 1.10]
  unit: ratio
  step: 0.01
  curve: linear
  validation: completeLoopPeakGainMustRemainBounded
```

### 1.5 Verification

- Impulse at every buffer wrap position.
- Delay error ≤ 1 sample for integer mode.
- No click at wrap or maximum delay.
- Read/write ordering documented and unit-tested.
- Long soak with maximum delay, active UI, codec DMA, and SDRAM traffic.

---

## 2. Feedforward, feedback, and decay-time mapping

### 2.1 Feedforward comb

```math
y[n] = x[n] + b x[n-D]
```

```math
H(z) = 1 + b z^{-D}
```

For equal dry and delayed amplitudes, comb notches occur at:

```math
f_k = \frac{(2k+1)F_s}{2D}, \qquad k=0,1,2,\ldots
```

### 2.2 Feedback comb

```math
y[n] = x[n] + g y[n-D]
```

```math
H(z) = \frac{1}{1-gz^{-D}}
```

With a loop processor:

```math
H_{wet}(z) = \frac{z^{-D}}{1-gF(z)z^{-D}}
```

For a linear time-invariant loop, a practical sufficient stability condition is:

```math
|g|\,\|F\|_{\infty} < 1
```

A saturator bounds amplitude but does not prove linear stability, remove DC bias, or prevent limit cycles.

### 2.3 RT60 to feedback conversion

A repeat passes through the loop every `T` seconds. To reach -60 dB amplitude after `RT60`:

```math
g = 10^{-3T/RT60}
```

Inverse mapping:

```math
RT60 = -\frac{3T}{\log_{10}|g|}
```

Example for `T = 500 ms`:

| RT60 target | Feedback | Label |
|---:|---:|---|
| 1 s | 0.0316 | DERIVED |
| 2 s | 0.1778 | DERIVED |
| 4 s | 0.4217 | DERIVED |
| 8 s | 0.6494 | DERIVED |
| 12 s | 0.7499 | DERIVED |

Useful UI ranges:

| Use | RT60 range | Notes | Label |
|---|---:|---|---|
| short slap | 0.15–0.6 s | 1–2 dominant repeats | REC |
| standard echo | 1–6 s | better perceptual mapping than raw `g` | REC |
| ambient | 6–20 s | needs loop HPF/LPF and saturation | REC |
| hold/freeze | explicit mode | do not fake with uncontrolled `g > 1` | REC |

### 2.4 DVPE recommendation

Expose either:

1. `feedback` for conventional pedal behavior, or
2. `decayTimeS` for predictable acoustic decay.

When `decayTimeS` is selected, compute `g` from current delay time. This prevents the same knob value from producing radically different repeat counts at 100 ms and 1 s.

---

## 3. Tempo synchronization

Quarter-note duration:

```math
T_{quarter,ms} = \frac{60000}{BPM}
```

```math
T_{delay,ms} = T_{quarter,ms} \cdot m_{division}
```

| Division | Multiplier | 120 BPM | Label |
|---|---:|---:|---|
| 1/16 | 0.25 | 125 ms | DERIVED |
| dotted 1/16 | 0.375 | 187.5 ms | DERIVED |
| 1/8 triplet | 1/3 | 166.7 ms | DERIVED |
| 1/8 | 0.5 | 250 ms | DERIVED |
| dotted 1/8 | 0.75 | 375 ms | DERIVED |
| 1/4 | 1.0 | 500 ms | DERIVED |
| dotted 1/4 | 1.5 | 750 ms | DERIVED |
| 1/2 | 2.0 | 1000 ms | DERIVED |

DVPE constraints:

- Derive from the runtime sample rate, not a compile-time assumption.
- If the selected division exceeds the buffer, visibly clamp or select a smaller division.
- Separate retiming policies:
  - `slew`: deliberate Doppler/tape pitch transition.
  - `crossfade`: transparent old-tap to new-tap transition.
  - `jump`: explicit glitch mode only.

Recommended defaults:

| Parameter | Default | Range | Label |
|---|---:|---:|---|
| `tapTempoMinBpm` | 40 | 20–80 | REC |
| `tapTempoMaxBpm` | 240 | 180–400 | REC |
| `tapTimeoutMs` | 2000 | 1000–4000 | REC |
| `retimePolicy` | crossfade | crossfade / slew / jump | REC |
| `retimeCrossfadeMs` | 25 | 5–100 | REC |
| `retimeSlewMs` | 250 | 50–1000 | REC |

---

## 4. Fractional delay and interpolation

### 4.1 Signal model

```math
D[n] = N[n] + \mu[n]
```

where `N` is integer and `0 ≤ μ < 1`.

Linear interpolation:

```math
d[n] = (1-\mu)x[k] + \mu x[k+1]
```

At `μ = 0.5`, the linear-interpolator magnitude response contains severe high-frequency droop and reaches zero at Nyquist. In a feedback loop, the signal traverses this error repeatedly.

### 4.2 Interpolator decision table

| Interpolator | Recommended use | Main limitation | Label |
|---|---|---|---|
| nearest | intentional lo-fi only | clicks and strong aliasing under modulation | REC |
| linear | CPU-minimal, dark analog-like repeats | magnitude droop in feedback | SRC/REC |
| first-order allpass | near-lossless resonator / waveguide loop | phase approximation and recursive modulation care | SRC/REC |
| 3rd-order Lagrange / Farrow | general DVPE moving-head default | residual magnitude/phase error | SRC/REC |
| windowed sinc / polyphase | large pitch motion or premium mode | CPU, memory, coefficient table | SRC/REC |

Recommended DVPE default:

```text
interpolator = Lagrange3
fallback     = Linear
```

### 4.3 Practical constraints

| Parameter | Default | Range | Constraint | Label |
|---|---:|---:|---|---|
| `minDelaySamples` | 4 samples | 1–8 | depends on interpolator neighborhood | REC |
| `fractionalGuardSamples` | 4 | 2–16 | allocate beyond max delay | REC |
| `controlUpdateHz` | 1000 Hz | 200–48000 Hz | interpolate controls to audio rate | REC |
| `modulatedReadHeadCount` | 1 | 1–4 | benchmark SDRAM/cache worst case | REC |

Verification:

- Sweep `μ` from 0 to 1 using sine tones at 1, 5, 10, 15, and 20 kHz.
- Measure magnitude, group delay, sidebands, and feedback-loop spectral decay.
- Test coefficient updates at both control and audio rates.

---

## 5. Time-varying delay and pitch

Read position:

```math
r[n] = n - D[n]
```

Approximate read-rate / pitch ratio:

```math
p \approx \Delta r[n] = 1 - \Delta D[n]
```

A delay-time slew therefore creates pitch change. It is not a transparent click-removal mechanism.

Use four explicit policies:

| Policy | Result | Use |
|---|---|---|
| one moving head | continuous Doppler glide | tape time knob, vibrato |
| two fixed taps + crossfade | no continuous pitch bend; brief overlap | tap-tempo and preset updates |
| transport coordinate | record/playback-speed-consistent tape behavior | higher-fidelity tape mode |
| hard jump | discontinuity / glitch | explicit special effect |

---

## 6. Flanger, chorus, vibrato, and doubling

Shared model:

```math
D[n] = D_0 + m[n]
```

```math
y[n] = a x[n] + w x[n-D[n]]
```

Feedback variant:

```math
u[n] = x[n] + g x[n-D[n]]
```

### 6.1 Practical ranges

| Mode | Base delay | Mod depth | Mod rate | Feedback | Wet | Label |
|---|---:|---:|---:|---:|---:|---|
| flanger | 0.2–10 ms | 0.1–5 ms | 0.05–2 Hz | -0.8 to +0.8 | 0.3–0.6 | SRC/REC |
| chorus | 10–35 ms | 1–10 ms | 0.1–5 Hz | 0–0.2 | 0.2–0.5 | SRC/REC |
| vibrato | 5–25 ms | 1–8 ms | 3–8 Hz | 0 | 1.0, dry=0 | SRC/REC |
| doubling / ADT | 20–100 ms | 1–15 ms | 0.05–1 Hz | 0–0.15 | 0.15–0.45 | REC |

Reference defaults:

```text
flanger: base 2.0 ms, depth 1.5 ms, rate 0.20 Hz, feedback +0.45, wet 0.50
chorus:  base 18 ms, depth 4.0 ms, rate 0.80 Hz, feedback 0.05, wet 0.35
vibrato: base 12 ms, depth 3.0 ms, rate 5.5 Hz, feedback 0.00, wet 1.00
ADT:     base 38 ms, depth 6.0 ms, rate 0.20 Hz smoothed-random, feedback 0.05, wet 0.28
```

### 6.2 Modulation sources

| Source | Default | Range | Use | Label |
|---|---:|---:|---|---|
| sine LFO | 0.8 Hz | 0.05–8 Hz | smooth conventional modulation | REC |
| triangle LFO | 0.2 Hz | 0.05–2 Hz | linear flange sweep | REC |
| random-drift cutoff | 0.15 Hz | 0.05–0.5 Hz | ADT/tape irregularity | REC |
| stereo phase | 90° | 0–180° | stereo widening | REC |

Stereo recommendation: share macro motion but decorrelate the fine random component. Completely independent wide modulation can produce unpleasant image wander.

### 6.3 Constraints

```math
D_0 - |m[n]| \ge D_{min}
```

Through-zero flanging requires a delayed dry/reference path or two-sided delay architecture; a normal causal delay cannot read the future.

---

## 7. Clean, slapback, rhythmic, dub, and ambient echo

| Mode | Delay | Feedback | Wet | Loop HPF | Loop LPF | Label |
|---|---:|---:|---:|---:|---:|---|
| clean digital | 125–1000 ms | 0.15–0.75 | 0.2–0.45 | 20–150 Hz | 8–18 kHz | REC |
| classic slapback | 60–140 ms | 0–0.15 | 0.15–0.35 | ~100 Hz | 4–8 kHz | SRC/REC |
| extended slap / short echo | 140–250 ms | 0–0.25 | 0.15–0.40 | 80–150 Hz | 4–10 kHz | REC |
| rhythmic echo | 125–1000 ms | 0.25–0.75 | 0.25–0.55 | 80–200 Hz | 4–12 kHz | REC |
| dub | 250–750 ms | 0.55–0.92 | 0.25–0.60 | 120–250 Hz | 1.5–5 kHz | REC |
| ambient | 500–4000 ms | 0.55–0.90 | 0.35–0.80 | 100–300 Hz | 1.5–5 kHz | REC |

Reference presets:

```text
Slapback:     95 ms, feedback 0.08, wet 0.25, HPF 100 Hz, LPF 6.5 kHz
Quarter:      500 ms, feedback 0.35, wet 0.32, HPF 100 Hz, LPF 12 kHz
Dotted 1/8:   375 ms @120 BPM, feedback 0.42, wet 0.38, LPF 5.5 kHz
Dub:          420 ms, feedback 0.78, wet 0.45, HPF 180 Hz, LPF 2.8 kHz, soft saturation
Ambient:      750 ms, feedback 0.78, wet 0.55, HPF 180 Hz, LPF 2.8 kHz, diffusion enabled
```

---

## 8. Feedback filtering and saturation

Loop processing:

```math
u[n] = x[n] + g\,S\{F(z)d[n]\}
```

Typical saturation:

```math
S(x) = \frac{\tanh(kx)}{\tanh(k)}
```

Smoothing coefficient from a time constant:

```math
\alpha = e^{-1/(\tau F_s)}
```

One-pole low-pass coefficient form:

```math
c = 1 - e^{-2\pi f_c/F_s}
```

### 8.1 Practical ranges

| Block | Default | Range | Label |
|---|---:|---:|---|
| feedback HPF | 120 Hz | 40–300 Hz | REC |
| clean feedback LPF | 12 kHz | 6–18 kHz | REC |
| analog/BBD LPF | 4.5 kHz | 1.5–8 kHz | REC |
| tape playback LPF | 7 kHz | 3–12 kHz | REC |
| low-mid cut | -2 dB @ 300 Hz | 0 to -6 dB, 200–500 Hz | REC |
| saturation `k` | 2.0 | 1–5 | REC |
| record drive | +6 dB | 0–18 dB | REC |
| feedback drive | +9 dB | 0–24 dB | REC |

Do not apply makeup gain blindly inside the feedback loop. Verify the complete loop magnitude after every filter and nonlinear stage.

---

## 9. Tape delay

### 9.1 Simplified model

```math
y[n] = Playback\{Delay_{D[n]}(Record\{x[n] + g y[n]\})\}
```

A physically motivated fixed-head transport obeys:

```math
\int_{t_i}^{t_o} v(\tau)d\tau = L
```

Pitch ratio:

```math
p = \frac{v(t_o)}{v(t_i)}
```

This is not generally equivalent to directly modulating a delay length.

### 9.2 Recommended block order

```text
input
  → record EQ
  → record nonlinearity / hysteresis approximation
  → transport / variable-speed delay
  → playback-head loss
  → playback EQ
  → noise / wear
  → wet output

playback signal
  → feedback EQ
  → feedback saturation
  → feedback gain
  → record summing node
```

### 9.3 Practical parameters

| Parameter | Default | Range | Label |
|---|---:|---:|---|
| delay | 420 ms | 80–1200 ms | REC |
| feedback | 0.45 | 0.25–0.90 | REC |
| time-change slew | 250 ms | 50–1000 ms | REC |
| wow rate | 0.35 Hz | 0.1–1 Hz | SRC/REC |
| flutter rate | 6 Hz | 3–12 Hz | SRC/REC |
| wow speed variation | 0.25% | 0.05–1.5% | REC |
| flutter speed variation | 0.08% | 0.01–0.5% | REC |
| hiss | -75 dBFS | -90 to -55 dBFS | REC |
| playback LPF | 7 kHz | 3–12 kHz | REC |
| record drive | +6 dB | 0–18 dB | REC |
| feedback drive | +9 dB | 0–24 dB | REC |

Use speed variation internally for the transport model. An “equivalent depth in ms” may be shown in the UI, but it is not the primary physical parameter.

When read speed exceeds record speed, use bandwidth-limited interpolation, dynamic low-pass filtering, or local oversampling to prevent above-Nyquist content from folding back.

---

## 10. Bucket-brigade delay (BBD)

A BBD transfers charge through `N` stages using a two-phase clock. If `fCP` denotes the external two-phase clock frequency:

```math
T_{delay} = \frac{N}{2 f_{CP}}
```

Equivalently:

```math
f_{CP} = \frac{N}{2T_{delay}}
```

> Some literature or code uses “transfer-event rate” instead of external clock frequency and then writes `T=N/f`. DVPE must name the convention explicitly to avoid a factor-of-two error.

Approximate signal-band relation:

```math
f_{signal,max} \lesssim \frac{f_{CP}}{2}
```

The actual circuit needs margin and clock-rejection filtering.

### 10.1 Example calculations

| Stages | Delay | `fCP` | Approx. upper signal edge | Label |
|---:|---:|---:|---:|---|
| 1024 | 10 ms | 51.2 kHz | 25.6 kHz before practical margin | DERIVED |
| 4096 | 300 ms | 6.83 kHz | 3.41 kHz before practical margin | DERIVED |
| 8192 | 600 ms | 6.83 kHz | 3.41 kHz before practical margin | DERIVED |

### 10.2 Complete BBD model

```text
input
  → compressor
  → anti-alias LPF
  → pre-emphasis / drive
  → clocked BBD core
  → clock leakage / modeled artifacts
  → reconstruction LPF
  → expander
  → wet output
```

### 10.3 Practical mappings

| Virtual stages | Time target | Use | Label |
|---:|---:|---|---|
| 512–1024 | 1–40 ms | flanger / chorus | SRC/REC |
| 2048–4096 | 20–300 ms | short analog delay | SRC/REC |
| 8192 | 80–600 ms | long dark delay | SRC/REC |

| Parameter | Default | Range | Label |
|---|---:|---:|---|
| input/output LPF order | 2nd | 2nd–4th | SRC/REC |
| compander ratio | 2:1 | 1.2:1–4:1 | REC |
| feedback | 0.45 | 0.2–0.80 | REC |
| modulation rate | 0.4 Hz | 0.1–2.5 Hz | REC |
| modulation depth | 1.5 ms | 0.5–8 ms | REC |
| clock leakage | off | -100 to -60 dBFS equivalent | REC |

Starting cutoff law:

```math
f_c = clamp(0.35f_{CP},\;1.5\text{ kHz},\;10\text{ kHz})
```

This is a **REC**, not a universal physical law. Validate against the specific BBD/circuit being emulated.

---

## 11. Multi-tap, stereo, and ping-pong delay

Multi-tap feedforward form:

```math
y[n] = a x[n] + \sum_{k=1}^{K} b_k x[n-D_k]
```

Stereo feedback matrix:

```math
\mathbf{u}[n] = \mathbf{x}[n] + \mathbf{A}\,\mathbf{d}[n]
```

Ping-pong special case:

```math
\mathbf{A} = \begin{bmatrix}0 & g\\g & 0\end{bmatrix}
```

Scaled rotation:

```math
\mathbf{A}=g\begin{bmatrix}\cos\theta & -\sin\theta\\\sin\theta & \cos\theta\end{bmatrix}
```

For the linear matrix alone, eigenvalue magnitude is `|g|`; filters and gains in each branch still affect full-loop stability.

### 11.1 Practical parameters

| Parameter | Default | Range | Label |
|---|---:|---:|---|
| tap count | 4 | 1–8 | REC |
| tap gain | mode-specific | 0–1 | REC |
| ping-pong width | 0.75 | 0–1 | REC |
| cross feedback | 0.35 | 0–0.92 | REC |
| stereo rotation | 45° | 0–90° | REC |
| tap pan | spread | -1 to +1 | REC |

Define equations, not only labels:

```text
mono → A=identity-scaled
pingPongWidth=1 → cross-coupled matrix
pingPongWidth=0 → same-channel matrix
intermediate values → normalized interpolation between matrices
```

Verification:

- eigenvalue / spectral-radius scan;
- mono-sum cancellation;
- left/right impulse routing;
- equal-energy pan behavior;
- preset transitions without matrix-gain jumps.

---

## 12. Reverse delay

A real-time reverse effect cannot read future samples. It captures a finite block or grain, then reads it backward while capturing subsequent audio.

Overlap-add model:

```math
y[n] = \sum_g w[n-gH]\,x[a_g-(n-gH)]
```

where `L` is grain length and `H` is hop size.

### 12.1 Recommended two-head implementation

```text
continuous history buffer
  ├─ reverse head A + window A
  └─ reverse head B + window B, offset by H
                 ↓
              overlap-add
```

### 12.2 Practical values

| Parameter | Default | Normal range | Label |
|---|---:|---:|---|
| grain/block length | 500 ms | 250–2000 ms | REC |
| overlap | 50% | 25–75% | REC |
| hop | `L/2` | `L/4`–`3L/4` | DERIVED/REC |
| window | periodic Hann | Hann / sqrt-Hann / custom | SRC/REC |
| feedback | 0.35 | 0–0.85 | REC |
| seam crossfade | window-defined | 10–100 ms explicit fallback | REC |
| quantization | off | free / 1/16 / 1/8 / beat / bar | REC |
| wet | 0.45 | 0.2–1.0 | REC |

Causal latency is at least the capture interval needed by the selected scheduler. A simple full-block reverse has roughly one block of startup latency. Do not market this as “zero latency,” because causality remains stubbornly employed.

Verification:

- constant-overlap-add gain;
- sine seam residual;
- transient duplication;
- startup latency and bypass behavior;
- feedback energy over many grains.

---

## 13. Granular delay

```text
history buffer
  → N grain readers
  → per-grain position / rate / pitch
  → window
  → grain mixer
  → feedback / wet output
```

### 13.1 Practical values

| Parameter | Default | Normal range | Label |
|---|---:|---:|---|
| grain size | 80 ms | 20–200 ms | REC |
| active grains | 4 | 2–8 | REC |
| density | 12 grains/s | 5–40 grains/s | REC |
| position range | 500 ms | 20–2000 ms behind write head | REC |
| position jitter | 50 ms | 0–500 ms | REC |
| rate | 1.0 | 0.5–2.0 | REC |
| pitch | 0 st | -12 to +12 st | REC |
| pan jitter | 0.35 | 0–1 | REC |
| feedback | 0.35 | 0–0.85 | REC |
| window | Hann | Hann / Blackman / custom | SRC/REC |

Constraints:

- normalize overlapping grain energy;
- seed random generators deterministically for preset recall;
- band-limit upward rate/pitch motion;
- expose maximum simultaneous-grain cost to the DVPE resource estimator.

---

## 14. Pitch-shifted delay and shimmer

Pitch ratio for semitone shift `s`:

```math
p = 2^{s/12}
```

A moving read head advances at `p`; relative delay-distance rate is:

```math
\Delta D = 1-p
```

Head lifetime before reset, for available span `ΔDspan` samples:

```math
T_{head}=\frac{\Delta D_{span}}{|1-p|F_s}
```

Example: `p=2`, span `2048` samples, `Fs=48 kHz`:

```math
T_{head}=42.7\text{ ms}
```

### 14.1 Shimmer topology

```text
input → base delay → wet
                  ↘ pitch shifter → tone/anti-alias → feedback gain → delay input
```

Parallel unshifted and shifted feedback branches are often easier to stabilize musically than shifting all loop energy.

### 14.2 Practical values

| Parameter | Default | Normal range | Label |
|---|---:|---:|---|
| pitch interval | +12 st | -12 to +12 st | REC |
| pitch window/head span | 40 ms | 20–100 ms | REC |
| head overlap | 50% | 25–75% | REC |
| shifted-branch gain | 0.35 | 0–0.75 | REC |
| total feedback | 0.55 | 0.2–0.85 | REC |
| feedback HPF | 200 Hz | 150–300 Hz | REC |
| feedback LPF | 8 kHz | 6–10 kHz | REC |
| diffusion before pitch | 0.2 | 0–0.7 | REC |
| wet | 0.45 | 0.2–0.8 | REC |

Method selection:

| Method | Use | Cost/artifact |
|---|---|---|
| dual moving heads | embedded octave shimmer | periodic reset/crossfade texture |
| granular / correlation-assisted | moderate ratios, guitar | grain/transient artifacts |
| phase vocoder | polyphonic premium mode | FFT cost, latency, transient handling |

Verification:

- alias energy for high strings and distortion;
- periodic head-reset sidebands;
- feedback spectral migration toward Nyquist;
- latency and dry/wet phase behavior.

---

## 15. Diffusion and feedback delay networks

Schroeder allpass:

```math
H(z)=\frac{-g+z^{-D}}{1-gz^{-D}}
```

An `N`-line FDN:

```math
\mathbf{s}[n] = \mathbf{x}[n] + \mathbf{A}\,\mathbf{G}(z)\mathbf{d}[n]
```

Orthogonal/unitary matrices redistribute energy without matrix gain:

```math
\mathbf{A}^T\mathbf{A}=\mathbf{I}
```

Per-line decay target:

```math
|G_i(e^{j\omega})|=10^{-3D_i/(F_sT_{60}(\omega))}
```

### 15.1 Practical values

| Parameter | Default | Normal range | Label |
|---|---:|---:|---|
| FDN lines | 4 | 4–8 | REC |
| line delays | 31, 37, 43, 53 ms | 20–120 ms, mutually incommensurate | REC |
| matrix | normalized Hadamard | Hadamard / Householder / rotation | SRC/REC |
| pre-diffusers | 2 | 0–6 | REC |
| allpass delays | 7, 13, 23 ms | 3–60 ms | REC |
| allpass `g` | 0.5 | 0.2–0.75 | REC |
| low-band RT60 | 8 s | 1–20 s | REC |
| high-band RT60 | 3 s | 0.5–12 s | REC |
| wet | 0.45 | 0.2–0.8 | REC |

Use audible direct taps and the diffuse late network as separate layers. This preserves rhythmic clarity while allowing an ambient tail.

---

## 16. Freeze / hold

“Freeze” must specify what representation is frozen:

| Mode | Invariant | Main artifact |
|---|---|---|
| loop latch | exact waveform segment | periodicity and seam |
| granular freeze | local grains | cloud/noise texture |
| spectral freeze | STFT magnitude | phasiness / static spectrum |
| predictive/noise freeze | estimated resonant filter | statistical rather than exact sustain |

### 16.1 Recommended loop-latch policy

```text
on freeze trigger:
  capture or latch current state
  ramp inputSend → 0
  bypass or compensate lossy loop stages
  normalize retained level
  crossfade into held state
```

| Parameter | Default | Range | Label |
|---|---:|---:|---|
| freeze crossfade | 50 ms | 20–200 ms | REC |
| input-send ramp | 30 ms | 5–100 ms | REC |
| loop correction | off until measured | -0.1% to +0.1% / cycle | REC |
| motion depth | 0.1 | 0–0.5 | REC |
| release fade | 100 ms | 20–1000 ms | REC |

Do not define freeze merely as `feedback = 1.0`. Interpolation, filtering, diffusion, and nonlinearities generally make the full loop magnitude frequency-dependent.

---

## 17. Karplus–Strong / short resonator delay

Basic recurrence:

```math
y[n] = \frac{1}{2}\left(y[n-N]+y[n-N-1]\right)
```

Approximate pitch:

```math
f_0 \approx \frac{F_s}{N+1/2}
```

A practical string loop:

```text
excitation
  → pick-position filter
  → fractional delay / string length
  → loss filter
  → dispersion allpass
  → loop gain
  → feedback
  → pickup-position/body filter
```

### 17.1 Practical values

| Parameter | Default | Range | Label |
|---|---:|---:|---|
| frequency | MIDI-derived | 27.5 Hz–4 kHz practical | REC |
| loop gain | 0.995 | 0.95–0.9999 | REC |
| fractional interpolator | first-order allpass or Lagrange3 | method-dependent | SRC/REC |
| excitation length | 1 period | 0.5–4 periods | REC |
| pick position | 0.2 | 0.02–0.98 | REC |
| pickup position | 0.8 | 0.02–0.98 | REC |
| dispersion | subtle | 0–1 normalized | REC |

Use decay-time mapping by pitch rather than one fixed loop gain; high notes otherwise decay differently from low notes.

---

## 18. Ducking delay

Sidechain envelope:

```text
input → envelope follower → gain computer → wet VCA
input → delay algorithm → wet VCA → output sum
```

| Parameter | Default | Range | Label |
|---|---:|---:|---|
| duck threshold | -24 dBFS | -60 to -6 dBFS | REC |
| duck depth | 9 dB | 3–18 dB | REC |
| attack | 5 ms | 1–20 ms | REC |
| release | 350 ms | 100–1000 ms | REC |
| detector HPF | 80 Hz | 20–300 Hz | REC |

A smooth gain computer should control only the wet path unless a special effect explicitly ducks dry guitar too.

---

## 19. Shared embedded architecture

Recommended shared services:

```text
Audio I/O
  → input conditioning / DC block
  → delay-memory service
  → read-head engine
      integer
      Lagrange/Farrow
      dual-tap crossfade
      transport coordinate
      grain/pitch heads
  → mode scheduler
  → wet output

read signal
  → loop HPF/LPF
  → optional diffusion
  → optional pitch branch
  → optional saturation/compander
  → loop gain / safety guard
  → delay write input
```

Mode adapters should map user controls to shared primitives. Avoid separate bespoke buffers for every algorithm; that duplicates wrap, transition, and stability bugs with admirable bureaucratic efficiency.

### 19.1 Resource estimates at 48 kHz

Minimum payload traffic, excluding cache-line overfetch and interpolation neighbors:

| Case | Traffic | Label |
|---|---:|---|
| stereo one read + one write | 0.768 MB/s | DERIVED |
| stereo four reads + one write | 1.92 MB/s | DERIVED |
| eight mono FDN lines read + write | 3.072 MB/s | DERIVED |

Benchmark the adversarial case, not the friendly demo:

- stereo;
- four fractional heads;
- nonlinear feedback;
- UI/display/USB activity;
- codec DMA;
- external SDRAM;
- near-maximum feedback.

---

## 20. DVPE parameter schema contract

Every continuous parameter should define:

```yaml
id: delayTimeMs
name: Time
defaultValue: 375
range: [1, 2000]
expertRange: [0.1, 8000]
unit: ms
step: 1
curve: log
smoothingMs: 20
cvPolarity: bipolar
cvDepthDefault: 0
constraints:
  - delayTimeMs >= minDelayMs
  - delayTimeMs <= allocatedMaxDelayMs
codegen:
  targetUnit: samples
  expression: delayTimeMs * sampleRateHz / 1000.0
```

Required metadata:

- `defaultValue`
- `range`
- optional `expertRange`
- `unit`
- `step`
- `curve`
- `smoothingMs`
- CV polarity and scaling
- generated internal unit
- cross-parameter constraints
- resource-impact metadata when the parameter changes memory or head count

Recommended semantic controls:

| User control | Internal mapping |
|---|---|
| Time | milliseconds or tempo division → samples |
| Repeats | raw feedback or RT60 mapping |
| Mix | defined dry/wet law, not two unrelated gains unless advanced mode |
| Tone | paired loop HPF/LPF or explicit filters |
| Mod | depth/rate macro with safe delay bounds |
| Character | mode-specific interpolation/filter/nonlinearity macro |
| Width | normalized feedback/pan matrix interpolation |
| Freeze | explicit state transition, not a raw gain jump |

---

## 21. Verification matrix

| Test | Stimulus | Metric | Exposes |
|---|---|---|---|
| impulse timing | impulse at every wrap position | sample index and amplitude | off-by-one / wrap / read-write order |
| decay law | impulse at several delays and RT60 values | fitted per-band RT60 | wrong feedback mapping |
| fractional response | sine sweep for `μ=0…1` | magnitude/group delay | interpolation error |
| modulation sidebands | 1, 8, 15 kHz tones | spectrogram / sidebands | zippering and aliasing |
| time transition | delay step at high feedback | peak and energy | clicks / Doppler / overlap burst |
| reverse seam | sine, impulse train, chords | OLA gain and residual | window/scheduler error |
| pitch loop | wideband guitar, +12 st | alias energy / periodicity | head-reset and Nyquist buildup |
| BBD clock sweep | delay sweep across clock range | bandwidth and artifacts | factor-of-two / filter tracking |
| stereo mono sum | correlated/anti-correlated signals | level and phase | mono cancellation |
| long soak | randomized controls, near-unity loop | no NaN/underrun/growth | rare state and memory faults |
| target load | worst mode + DMA/UI | cycle histogram/deadlines | average-load optimism |

Listening corpus:

- muted single-note transients;
- clean arpeggios;
- dense distorted chords;
- palm-muted low strings;
- sustained harmonics;
- silence/noise-floor behavior;
- active time/tap/preset gestures under feedback.

Level-match comparisons to approximately 0.2 dB when judging tone or interpolation quality.

---

## 22. Conservative first-pedal profile

```text
Fs                       = 48000
state                    = float32
max_delay_time           = 2.0 s
interpolator             = 3rd-order Lagrange; linear fallback
input_nominal            = -12 dBFS
wet_default              = 0.35
feedback_default         = 0.40
feedback_normal_limit    = 0.92
feedback_hpf             = 120 Hz
feedback_lpf_clean       = 12 kHz
feedback_lpf_analog      = 4.5 kHz
parameter_smoothing      = 20 ms
transparent_retime       = dual-tap, 25 ms crossfade
tape_retime              = moving-head/transport, 250 ms slew
saturator                = tanh(2x)/tanh(2)
chorus                    = 18 ms, 4 ms depth, 0.8 Hz, feedback 0.05, wet 0.35
flanger                   = 2 ms, 1.5 ms depth, 0.2 Hz, feedback 0.45, wet 0.50
slapback                  = 95 ms, feedback 0.08, wet 0.25
lead_delay                = dotted 1/8 or 375 ms @120 BPM, feedback 0.35, wet 0.30
tape                      = 420 ms, feedback 0.45, wow 0.35 Hz / 0.25%, flutter 6 Hz / 0.08%
reverse                   = 500 ms grains, 50% overlap, Hann, feedback 0.35
shimmer                   = +12 st, 40 ms pitch windows, feedback 0.55, HPF 200 Hz, LPF 8 kHz
ambient_fdn               = 4 lines, 31/37/43/53 ms, Hadamard, low/high RT60 8/3 s
```

---

## 23. Source anchors

Primary and implementation-relevant references used by the source PRs and the existing HTML report:

1. P. Dutilleux et al., delay structures and delay-based effects, in *DAFX: Digital Audio Effects*, 2nd ed., 2011.
2. T. I. Laakso, V. Välimäki, M. Karjalainen, and U. K. Laine, “Splitting the Unit Delay — Tools for Fractional Delay Filter Design,” *IEEE Signal Processing Magazine*, 1996.
3. J. Dattorro, “Effect Design, Part 2: Delay-Line Modulation and Chorus,” *JAES*, 1997.
4. A. Huovilainen, “Enhanced Digital Models for Analog Modulation Effects,” DAFx-05.
5. V. Zavalishin and J. D. Parker, “Efficient Emulation of Tape-Like Delay Modulation Behavior,” DAFx-18.
6. J. Chowdhury, “Real-Time Physical Modelling for Analog Tape Machines,” DAFx-19.
7. C. Raffel and J. O. Smith, “Practical Modeling of Bucket-Brigade Device Circuits,” DAFx-10.
8. M. Holters and J. D. Parker, “A Combined Model for a Bucket Brigade Device and its Input and Output Filters,” DAFx-18.
9. L. Gabrielli, S. D’Angelo, and S. Squartini, “Antialiasing in BBD Chips Using BLEP,” DAFx-25.
10. K. Karplus and A. Strong, “Digital Synthesis of Plucked-String and Drum Timbres,” 1983.
11. Electro-Smith DaisySP `DelayLine<T, max_size>` documentation for sample-unit API behavior.
12. The existing companion report: `DVPE-theory/guitar_delay_algorithms_research_report.html`.

Source URLs and full bibliographic links are preserved in the HTML report and archived PR documents.

---

## 24. Authority and maintenance

- **Canonical implementation reference:** this file.
- **Canonical visual report:** `guitar_delay_algorithms_research_report.html`.
- **Historical provenance only:** `archive/guitar-delay-algorithms-chat-transcript.md` and `archive/guitar-delay-practical-parameters.md`.
- When values change, update the formula-adjacent table in this file first.
- Do not maintain a second independent “practical defaults” table elsewhere without an explicit generation pipeline.
