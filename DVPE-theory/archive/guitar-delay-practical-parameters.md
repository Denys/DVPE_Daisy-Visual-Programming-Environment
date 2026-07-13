# Guitar Delay Algorithms: Practical Parameters and Ranges

This note converts delay-effect theory into implementation-ready control ranges for DVPE/Daisy-style blocks. It is aimed at guitar-pedal use, where the same delay primitive is reused as a doubler, slapback, rhythmic echo, chorus, flanger, resonator, or ambient wash.

## Source anchors

- DaisySP `DelayLine<T, max_size>` sets delay in **samples**, including fractional samples for interpolation, so UI controls in milliseconds or note divisions must be converted to samples before `SetDelay()`.
  Source: <https://electro-smith.github.io/DaisySP/classdaisysp_1_1_delay_line.html>
- DAFX Chapter 3 frames delay effects as feedforward/feedback structures and names vibrato, flanger, chorus, doubling, and echo as delay-based effects.
  Source: <https://www.dafx.de/DAFX_Book_Page/chapter3.html>
- The Dattorro/Reiss delay-effect ranges are useful for separating effects by nominal delay: flange around 1 ms, chorus around 5 ms, doubling around 20 ms, and echo from about 80 ms upward.
  Source: <https://en.wikipedia.org/wiki/Dattorro_industry_scheme>
- Slapback echo is commonly treated as roughly 60-250 ms with little or no feedback.
  Source: <https://en.wikipedia.org/wiki/Delay_%28audio_effect%29>
- MATLAB's delay-based effects example is a useful implementation reference for chorus/flanger/echo modulation patterns.
  Source: <https://www.mathworks.com/help/audio/ug/delay-based-audio-effects.html>
- PT2399-style guitar delays become darker/noisier at longer times, which is musically useful but should be modeled intentionally with filtering, saturation, and bandwidth loss rather than by leaving values unspecified.
  Sources: <https://electrosmash.mas-effects.com/ElectroSmash%20-%20PT2399%20Analysis.pdf>, <https://ihatemornings.com/making-sense-of-the-pt2399-filters>

## Global implementation constants

| Variable | Practical default | Safe range | Notes |
|---|---:|---:|---|
| `sampleRateHz` | 48000 | 44100-96000 | Daisy projects commonly run at 48 kHz. Always derive delay samples from the runtime sample rate. |
| `maxDelayMs` | 2000 | 500-8000 | Guitar pedals usually need 1-2 s. Ambient/looper-like modes can use more if SDRAM is available. |
| `maxDelaySamples` | `ceil(sampleRateHz * maxDelayMs / 1000)` | n/a | Allocate statically for DaisySP template delay lines. |
| `minDelayMs` | 0.1 | 0.02-1.0 | Below 1 ms enters flanging/comb territory; use fractional interpolation and smooth modulation. |
| `controlSmoothingMs` | 10 | 1-100 | Smooth time, feedback, mix, and tone controls to reduce zipper noise. Use shorter values for performance controls and longer values for tap-tempo jumps. |
| `delayTimeSlewMs` | 25 | 5-250 | Time changes cause pitch artifacts. Short slew gives tape-like bends; long slew hides jumps. |
| `inputHeadroomDb` | -6 | -18 to 0 | Leave headroom before feedback and wet/dry summing. |
| `outputCeiling` | 0.95 | 0.5-0.99 | Clamp or soft-limit feedback paths to avoid runaway output. |

## Core delay-line controls

| Parameter | Default | Range | Curve / step | Implementation guidance |
|---|---:|---:|---|---|
| `delayTimeMs` | 375 | 1-2000 ms | Log, 1 ms | Main echo control. Log scaling gives useful resolution below 150 ms while still reaching long delays. |
| `delayTimeSamples` | `delayTimeMs * sampleRateHz / 1000` | 1-`maxDelaySamples` | Float | Pass samples to `DelayLine::SetDelay()`. Keep fractional values when interpolation is available. |
| `feedback` | 0.35 | 0-0.95 | Linear, 0.01 | 0 gives one repeat. 0.3-0.6 is normal pedal territory. 0.75-0.9 is dub/ambient. Keep below 1 unless a limiter/freeze path is explicit. |
| `wetMix` | 0.35 | 0-1 | Equal-power or linear, 0.01 | For inline guitar effects, 0.2-0.45 is usually more usable than 0.5+. Full wet is useful for parallel buses or special modes. |
| `dryMix` | 1.0 | 0-1 | Linear, 0.01 | Keep dry at unity for pedal-style operation. Reduce dry only in vibrato or wet-only send modes. |
| `feedbackPolarity` | +1 | -1 or +1 | Toggle | Negative feedback creates hollow/phasey repeats and comb notches. |
| `pingPongWidth` | 0.75 | 0-1 | Linear, 0.01 | 0 is mono feedback; 1 alternates hard left/right. Keep mono-safe sum in mind. |
| `crossFeedback` | 0.25 | 0-0.95 | Linear, 0.01 | Stereo delays use this to feed left repeats into right and vice versa. |

## Delay-time presets by effect role

| Use case | Delay range | Feedback | Wet mix | Mod depth | Mod rate | Notes |
|---|---:|---:|---:|---:|---:|---|
| Comb/resonator | 0.1-10 ms | -0.8 to +0.8 | 0.2-0.7 | 0-1 ms | 0-2 Hz | Small changes strongly alter pitch/notches. Clamp feedback and consider DC blocking. |
| Flanger | 0.1-10 ms | -0.7 to +0.7 | 0.25-0.6 | 0.1-5 ms | 0.05-2 Hz | Use triangle/sine LFO; through-zero flanging needs dual delay paths or dry delay compensation. |
| Chorus | 5-30 ms | 0-0.25 | 0.2-0.5 | 1-10 ms | 0.1-5 Hz | Use low/no feedback. Stereo chorus benefits from opposite LFO phases. |
| Doubling/ADT | 10-100 ms | 0-0.15 | 0.15-0.45 | 1-15 ms | 0.05-1 Hz | Random or slow wow works better than obvious cyclic modulation. |
| Slapback | 60-250 ms | 0-0.2 | 0.15-0.4 | 0-3 ms | 0-1 Hz | Classic rockabilly/early studio echo. Usually one repeat or very low feedback. |
| Rhythmic echo | 125-1000 ms | 0.25-0.75 | 0.25-0.55 | 0-5 ms | 0-1 Hz | Derive from BPM divisions. Dotted eighth at 120 BPM is 375 ms. |
| Ambient wash | 500-4000 ms | 0.55-0.9 | 0.35-0.8 | 0-20 ms | 0.02-0.5 Hz | Add high/low cuts, diffusion, saturation, and optional ducking. |

## Tempo-synced delay values

Use this formula:

```text
quarterMs = 60000 / bpm
delayMs = quarterMs * noteMultiplier
```

| Division | `noteMultiplier` | Delay at 120 BPM | Typical use |
|---|---:|---:|---|
| 1/16 | 0.25 | 125 ms | Fast rhythmic thickening |
| Dotted 1/16 | 0.375 | 187.5 ms | Shuffle delay |
| 1/8 triplet | 1/3 | 166.7 ms | Triplet feel |
| 1/8 | 0.5 | 250 ms | Short rhythmic echo |
| Dotted 1/8 | 0.75 | 375 ms | Common guitar lead delay |
| 1/4 | 1.0 | 500 ms | Quarter-note echo |
| Dotted 1/4 | 1.5 | 750 ms | Wide ambient repeats |
| 1/2 | 2.0 | 1000 ms | Sparse long echo |

Clamp tempo-synced values to the allocated `maxDelaySamples`. If the requested value exceeds the buffer, either cap it visibly in the UI or choose a smaller note division.

## Tone, degradation, and analog-style controls

| Parameter | Default | Range | Notes |
|---|---:|---:|---|
| `lowCutHz` | 120 | 20-1000 Hz | Prevents low-end buildup in feedback. Guitar delay often benefits from 100-250 Hz. |
| `highCutHz` | 4500 | 800-12000 Hz | Lower values mimic analog/PT2399/tape bandwidth loss; higher values are clean digital delay. |
| `feedbackHighCutHz` | 3500 | 500-10000 Hz | Put this inside the feedback loop so repeats darken over time. |
| `feedbackLowCutHz` | 150 | 20-1000 Hz | Also inside the feedback loop. Reduces mud and runaway low frequencies. |
| `tone` | 0.5 | 0-1 | Map to paired low/high cut presets rather than a raw one-pole coefficient. |
| `saturationDrive` | 0.1 | 0-1 | Apply gently inside feedback for tape/BBD/PT2399 flavor. Keep makeup gain conservative. |
| `noiseLevel` | 0.0 | 0-0.03 | Optional analog/lo-fi mode only. Gate or scale by wet signal to avoid idle hiss. |
| `bitDepth` | 24 | 8-24 bits | Digital degradation mode. Default should be transparent. |
| `sampleRateReduction` | 1 | 1-16 | Lo-fi mode. Apply before feedback filtering if emulating cheap digital delay. |

## Modulation variables

| Parameter | Default | Range | Notes |
|---|---:|---:|---|
| `modRateHz` | 0.25 | 0.01-10 Hz | 0.1-1 Hz is common for delay/tape movement; chorus can go faster. |
| `modDepthMs` | 2 | 0-30 ms | Clamp so `delayTimeMs - depth` remains above the minimum safe delay. |
| `modWaveform` | sine | sine, triangle, random, smoothed random | Random/smoothed random is better for tape wow/flutter than perfect sine. |
| `wowRateHz` | 0.3 | 0.05-1 Hz | Slow tape-speed variation. |
| `wowDepthMs` | 2 | 0-20 ms | Scales with delay time for tape-like behavior. |
| `flutterRateHz` | 6 | 3-12 Hz | Faster, shallow variation. |
| `flutterDepthMs` | 0.2 | 0-2 ms | Keep subtle to avoid seasick pitch. |
| `stereoPhaseDeg` | 90 | 0-180 degrees | 90-180 degrees widens stereo modulation. |

## Feedback safety and special modes

| Feature | Recommended values | Implementation notes |
|---|---|---|
| Runaway guard | limit feedback-path absolute sample to 0.95 | Use soft clipping or a limiter in the feedback loop. Hard clipping is audible but acceptable as a deliberate lo-fi mode. |
| Freeze | feedback = 1.0, input send = 0.0 | Freeze should disconnect or strongly attenuate new input, not simply raise normal feedback above 1. |
| Momentary swell | feedback 0.7-0.92, wet +0.1 to +0.3 | Ramp over 20-100 ms to avoid clicks. |
| Tap tempo smoothing | slew from old to new delay over 50-250 ms | Instant delay-time jumps click or pitch-shift abruptly. Slewed changes create tape-speed bends. |
| Spillover/tails | keep delay processing after bypass; set input send to 0 | True bypass behavior should be explicit and separate from tails mode. |

## Practical default patches

| Patch | Delay | Feedback | Wet | Tone/high cut | Modulation |
|---|---:|---:|---:|---:|---|
| Clean digital quarter | 500 ms | 0.35 | 0.32 | 8000 Hz | off |
| Dotted-eighth lead at 120 BPM | 375 ms | 0.42 | 0.38 | 5500 Hz | 0.4 ms at 0.2 Hz |
| Slapback | 110 ms | 0.08 | 0.25 | 6500 Hz | off |
| Analog warm | 420 ms | 0.48 | 0.36 | 3200 Hz in feedback | 1.5 ms wow at 0.25 Hz |
| Tape echo | 360 ms | 0.55 | 0.4 | 4500 Hz plus saturation | wow 2 ms at 0.3 Hz, flutter 0.2 ms at 6 Hz |
| Ambient | 750 ms | 0.78 | 0.55 | 2800 Hz feedback high cut, 180 Hz low cut | 6 ms smoothed random |
| Chorus from delay | 18 ms | 0.05 | 0.35 | 9000 Hz | 5 ms at 0.8 Hz |
| Flanger from delay | 3 ms | 0.45 | 0.5 | 9000 Hz | 2 ms at 0.2 Hz |

## Mapping notes for DVPE block definitions

1. Prefer user-facing `ms` for delay blocks, but generate samples internally for DaisySP.
2. Give every continuous parameter a `defaultValue`, `range`, `unit`, `step`, and curve. Delay time should usually be logarithmic; mix, feedback, tone, and modulation depth are usually linear.
3. Distinguish **normal safe ranges** from **expert ranges**. For example, expose feedback as 0-0.95 by default and reserve 0.95-1.0 for freeze or self-oscillation modes with limiting.
4. For CV modulation, document whether CV is bipolar or unipolar. A useful default is bipolar modulation around the knob value for time/mod depth, and unipolar scaling for wet mix.
5. For analog/PT2399/tape models, parameterize the non-ideal parts: feedback filtering, saturation, noise, and modulation. Do not hide them as magic constants.
