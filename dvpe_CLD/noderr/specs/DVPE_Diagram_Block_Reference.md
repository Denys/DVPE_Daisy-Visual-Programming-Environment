# DVPE Diagram Block Reference

<!-- Generated from dvpe_CLD/src/core/blocks/BlockRegistry.ts and src/core/blocks/definitions/*.ts. -->

This is the current built-in block catalog exposed by `BlockRegistry` for the DVPE diagram canvas.

Parameter layout: each parameter appears once. The `CV` column marks `cvModulatable: true`, meaning the parameter can be exposed as a controllable CV input; `-` means ordinary inspector parameter only.

Catalog summary: 173 blocks, 9 categories, 320 parameters, 221 CV-controllable parameters.

## Category Index

- [Sources](#sources) (20)
- [Filters](#filters) (8)
- [Effects](#effects) (30)
- [Modulators](#modulators) (6)
- [Dynamics](#dynamics) (6)
- [Physical Modeling](#physical-modeling) (5)
- [User I/O](#user-i-o) (14)
- [Math](#math) (17)
- [Utility](#utility) (67)

## All Blocks

- [ANALOG KICK (analog_bass_drum)](#sources-analog-kick-analogbassdrum) - Sources
- [ANALOG SNARE (analog_snare_drum)](#sources-analog-snare-analogsnaredrum) - Sources
- [CLK NOISE (clocked_noise)](#sources-clk-noise-clockednoise) - Sources
- [DC SOURCE (dc_source)](#sources-dc-source-dcsource) - Sources
- [DUST (dust)](#sources-dust-dust) - Sources
- [FM2 (fm2)](#sources-fm2-fm2) - Sources
- [FORMANT OSC (formant_oscillator)](#sources-formant-osc-formantoscillator) - Sources
- [GRAINLET (grainlet_oscillator)](#sources-grainlet-grainletoscillator) - Sources
- [HARMONIC OSC (harmonic_oscillator)](#sources-harmonic-osc-harmonicoscillator) - Sources
- [HI-HAT (hihat)](#sources-hi-hat-hihat) - Sources
- [OSC BANK (oscillator_bank)](#sources-osc-bank-oscillatorbank) - Sources
- [OSCILLATOR (oscillator)](#sources-oscillator-oscillator) - Sources
- [PARTICLE (particle)](#sources-particle-particle) - Sources
- [SYNTH KICK (synth_bass_drum)](#sources-synth-kick-synthbassdrum) - Sources
- [SYNTH SNARE (synth_snare_drum)](#sources-synth-snare-synthsnaredrum) - Sources
- [VAR SAW OSC (variable_saw_oscillator)](#sources-var-saw-osc-variablesawoscillator) - Sources
- [VAR SHAPE OSC (variable_shape_oscillator)](#sources-var-shape-osc-variableshapeoscillator) - Sources
- [VOSIM OSC (vosim_oscillator)](#sources-vosim-osc-vosimoscillator) - Sources
- [WHITE NOISE (whitenoise)](#sources-white-noise-whitenoise) - Sources
- [Z OSC (z_oscillator)](#sources-z-osc-zoscillator) - Sources
- [DC BLOCK (dcblock)](#filters-dc-block-dcblock) - Filters
- [HIGH SHELF (highShelving)](#filters-high-shelf-highshelving) - Filters
- [HPF (ATONE) (atone)](#filters-hpf-atone-atone) - Filters
- [LOW SHELF (lowShelving)](#filters-low-shelf-lowshelving) - Filters
- [LPF (1-POLE) (onepole)](#filters-lpf-1-pole-onepole) - Filters
- [MOOG LADDER (moog_ladder)](#filters-moog-ladder-moogladder) - Filters
- [PEAK EQ (peakFilter)](#filters-peak-eq-peakfilter) - Filters
- [SVF (svf)](#filters-svf-svf) - Filters
- [AUTOWAH (autowah)](#effects-autowah-autowah) - Effects
- [BITCRUSH (bitcrush)](#effects-bitcrush-bitcrush) - Effects
- [CHORUS (chorus)](#effects-chorus-chorus) - Effects
- [COMPRESSOR (compressor)](#effects-compressor-compressor) - Effects
- [Crosstalk Cancel (crosstalk_canceller)](#effects-crosstalk-cancel-crosstalkcanceller) - Effects
- [DECIMATOR (decimator)](#effects-decimator-decimator) - Effects
- [DELAY (delay_line)](#effects-delay-delayline) - Effects
- [DISTORTION (distortion)](#effects-distortion-distortion) - Effects
- [FDN REVERB (fdnReverb)](#effects-fdn-reverb-fdnreverb) - Effects
- [FLANGER (flanger)](#effects-flanger-flanger) - Effects
- [FOLD (fold)](#effects-fold-fold) - Effects
- [HARDCLIP (hardclip)](#effects-hardclip-hardclip) - Effects
- [LP COMB (lpIirComb)](#effects-lp-comb-lpiircomb) - Effects
- [OVERDRIVE (overdrive)](#effects-overdrive-overdrive) - Effects
- [PHASER (phaser)](#effects-phaser-phaser) - Effects
- [PITCHSHIFT (pitch_shifter)](#effects-pitchshift-pitchshifter) - Effects
- [PV PITCH (phaseVocoderPitch)](#effects-pv-pitch-phasevocoderpitch) - Effects
- [RECTIFIER (rectifier)](#effects-rectifier-rectifier) - Effects
- [REVERB (reverb_sc)](#effects-reverb-reverbsc) - Effects
- [Robotization (robotization)](#effects-robotization-robotization) - Effects
- [SOFTCLIP (softclip)](#effects-softclip-softclip) - Effects
- [SR REDUCE (sample_rate_reducer)](#effects-sr-reduce-sampleratereducer) - Effects
- [Time Stretch (sola_time_stretch)](#effects-time-stretch-solatimestretch) - Effects
- [TONE STACK (toneStack)](#effects-tone-stack-tonestack) - Effects
- [TREMOLO (tremolo)](#effects-tremolo-tremolo) - Effects
- [TUBE (tube)](#effects-tube-tube) - Effects
- [UNI COMB (universalComb)](#effects-uni-comb-universalcomb) - Effects
- [WAHWAH (wahwah)](#effects-wahwah-wahwah) - Effects
- [WAVEFOLDER (wavefolder)](#effects-wavefolder-wavefolder) - Effects
- [Whisperization (whisperization)](#effects-whisperization-whisperization) - Effects
- [AD ENVELOPE (ad_env)](#modulators-ad-envelope-adenv) - Modulators
- [ADSR ENVELOPE (adsr)](#modulators-adsr-envelope-adsr) - Modulators
- [LFO (lfo)](#modulators-lfo-lfo) - Modulators
- [PHASOR (phasor)](#modulators-phasor-phasor) - Modulators
- [RING MOD (ringModulator)](#modulators-ring-mod-ringmodulator) - Modulators
- [VIBRATO (vibrato)](#modulators-vibrato-vibrato) - Modulators
- [Comp/Exp (compressor_expander)](#dynamics-compexp-compressorexpander) - Dynamics
- [ENV FOL (envelope_follower)](#dynamics-env-fol-envelopefollower) - Dynamics
- [GATE (gate)](#dynamics-gate-gate) - Dynamics
- [LIMITER (limiter)](#dynamics-limiter-limiter) - Dynamics
- [LINEAR VCA (linearvca)](#dynamics-linear-vca-linearvca) - Dynamics
- [NOISE GATE (noiseGate)](#dynamics-noise-gate-noisegate) - Dynamics
- [DRIP (drip)](#physical-modeling-drip-drip) - Physical Modeling
- [MODAL VOICE (modal_voice)](#physical-modeling-modal-voice-modalvoice) - Physical Modeling
- [PLUCK (pluck)](#physical-modeling-pluck-pluck) - Physical Modeling
- [RESONATOR (resonator)](#physical-modeling-resonator-resonator) - Physical Modeling
- [STRING VOICE (string_voice)](#physical-modeling-string-voice-stringvoice) - Physical Modeling
- [AUDIO INPUT (audio_input)](#user-io-audio-input-audioinput) - User I/O
- [AUDIO OUTPUT (audio_output)](#user-io-audio-output-audiooutput) - User I/O
- [CV IN (cv_input)](#user-io-cv-in-cvinput) - User I/O
- [CV OUT (cv_output)](#user-io-cv-out-cvoutput) - User I/O
- [ENCODER (encoder)](#user-io-encoder-encoder) - User I/O
- [GATE OUT (gate_output)](#user-io-gate-out-gateoutput) - User I/O
- [GATE/TRIG IN (gate_trigger_in)](#user-io-gatetrig-in-gatetriggerin) - User I/O
- [KEY (key)](#user-io-key-key) - User I/O
- [KNOB (knob)](#user-io-knob-knob) - User I/O
- [LED (led_output)](#user-io-led-ledoutput) - User I/O
- [MIDI CC (midi_cc)](#user-io-midi-cc-midicc) - User I/O
- [MIDI NOTE (midi_note)](#user-io-midi-note-midinote) - User I/O
- [SLIDER (slider)](#user-io-slider-slider) - User I/O
- [SWITCH (switch)](#user-io-switch-switch) - User I/O
- [1/x (reciprocal)](#math-1x-reciprocal) - Math
- [ABS (abs)](#math-abs-abs) - Math
- [ATAN2 (atan2)](#math-atan2-atan2) - Math
- [CENTS -> RATIO (cents_to_ratio)](#math-cents---ratio-centstoratio) - Math
- [COS (cos)](#math-cos-cos) - Math
- [D/dt (derivative)](#math-ddt-derivative) - Math
- [EXP (exp)](#math-exp-exp) - Math
- [Hz -> MIDI (freq_to_midi)](#math-hz---midi-freqtomidi) - Math
- [INTEGRAL (integral)](#math-integral-integral) - Math
- [LERP (lerp)](#math-lerp-lerp) - Math
- [LOG (log)](#math-log-log) - Math
- [MIDI -> Hz (midi_to_freq)](#math-midi---hz-miditofreq) - Math
- [POW (pow)](#math-pow-pow) - Math
- [POW2 (pow2)](#math-pow2-pow2) - Math
- [SIN (sin)](#math-sin-sin) - Math
- [SQRT (sqrt)](#math-sqrt-sqrt) - Math
- [TAN (tan)](#math-tan-tan) - Math
- [< (less)](#utility--less) - Utility
- [> (greater)](#utility--greater) - Utility
- [4-STATE FSM (fsm_4)](#utility-4-state-fsm-fsm4) - Utility
- [ADD (add)](#utility-add-add) - Utility
- [AND (logic_and)](#utility-and-logicand) - Utility
- [ARPEGGIATOR (arpeggiator)](#utility-arpeggiator-arpeggiator) - Utility
- [BALANCE (balance)](#utility-balance-balance) - Utility
- [BLACKMAN (window_blackman)](#utility-blackman-windowblackman) - Utility
- [BYPASS (bypass)](#utility-bypass-bypass) - Utility
- [CLAMP (clamp)](#utility-clamp-clamp) - Utility
- [COUNT (counter)](#utility-count-counter) - Utility
- [CROSSFADE (crossfade)](#utility-crossfade-crossfade) - Utility
- [CVâ†’FREQ (cvtofreq)](#utility-cvfreq-cvtofreq) - Utility
- [D Latch (d_latch)](#utility-d-latch-dlatch) - Utility
- [dB -> LIN (db_to_linear)](#utility-db---lin-dbtolinear) - Utility
- [DEMUX (demux)](#utility-demux-demux) - Utility
- [DIVIDE (divide)](#utility-divide-divide) - Utility
- [EQUALS (equals)](#utility-equals-equals) - Utility
- [FALL (edge_fall)](#utility-fall-edgefall) - Utility
- [GAIN (gain)](#utility-gain-gain) - Utility
- [GATE LEN (gate_length)](#utility-gate-len-gatelength) - Utility
- [HAMMING (window_hamming)](#utility-hamming-windowhamming) - Utility
- [HANN (window_hann)](#utility-hann-windowhann) - Utility
- [LIN -> dB (linear_to_db)](#utility-lin---db-lineartodb) - Utility
- [LOOPER (looper)](#utility-looper-looper) - Utility
- [M/S DEC (mid_side_decode)](#utility-ms-dec-midsidedecode) - Utility
- [M/S ENC (mid_side_encode)](#utility-ms-enc-midsideencode) - Utility
- [MAP (range_map)](#utility-map-rangemap) - Utility
- [MAX (max)](#utility-max-max) - Utility
- [MERGE (merger)](#utility-merge-merger) - Utility
- [METRO (metro)](#utility-metro-metro) - Utility
- [MIN (min)](#utility-min-min) - Utility
- [MIXER (mixer)](#utility-mixer-mixer) - Utility
- [MODULO (modulo)](#utility-modulo-modulo) - Utility
- [MULTIPLY (multiply)](#utility-multiply-multiply) - Utility
- [MUX (mux)](#utility-mux-mux) - Utility
- [NEGATE (negate)](#utility-negate-negate) - Utility
- [NOT (logic_not)](#utility-not-logicnot) - Utility
- [NOT EQ (not_equals)](#utility-not-eq-notequals) - Utility
- [OFFSET (offset)](#utility-offset-offset) - Utility
- [OLA (overlap_add)](#utility-ola-overlapadd) - Utility
- [OR (logic_or)](#utility-or-logicor) - Utility
- [PAN (pan)](#utility-pan-pan) - Utility
- [QUANTIZE (quantize)](#utility-quantize-quantize) - Utility
- [Ring Buffer (ring_buffer)](#utility-ring-buffer-ringbuffer) - Utility
- [RISE (edge_rise)](#utility-rise-edgerise) - Utility
- [S&H (sample_hold)](#utility-sh-samplehold) - Utility
- [SCALE (scale)](#utility-scale-scale) - Utility
- [SCHMITT (schmitt_trigger)](#utility-schmitt-schmitttrigger) - Utility
- [SELECT (select)](#utility-select-select) - Utility
- [SIGN (sign)](#utility-sign-sign) - Utility
- [SLEW (slew)](#utility-slew-slew) - Utility
- [SMOOTH (smooth)](#utility-smooth-smooth) - Utility
- [SPLIT (splitter)](#utility-split-splitter) - Utility
- [SR Latch (sr_latch)](#utility-sr-latch-srlatch) - Utility
- [ST MIXER (stereo_mixer)](#utility-st-mixer-stereomixer) - Utility
- [STEP SEQ (step_sequencer)](#utility-step-seq-stepsequencer) - Utility
- [STEREO PAN (stereoPan)](#utility-stereo-pan-stereopan) - Utility
- [SUBTRACT (subtract)](#utility-subtract-subtract) - Utility
- [TOGGLE (toggle)](#utility-toggle-toggle) - Utility
- [VCA (vca)](#utility-vca-vca) - Utility
- [WT READ (wavetable_read)](#utility-wt-read-wavetableread) - Utility
- [WT WRITE (wavetable_write)](#utility-wt-write-wavetablewrite) - Utility
- [XOR (logic_xor)](#utility-xor-logicxor) - Utility
- [Yin Pitch (yin_pitch)](#utility-yin-pitch-yinpitch) - Utility
- [Zâ»Â¹ (sampledelay)](#utility-z-sampledelay) - Utility
- [ZERO X (zero_crossing)](#utility-zero-x-zerocrossing) - Utility

## Sources

### ANALOG KICK `analog_bass_drum`

<a id="sources-analog-kick-analogbassdrum"></a>

Analog-modeled bass drum/kick synthesizer

Class: `daisysp::AnalogBassDrum`  
Parameters: 6; CV-controllable: 6

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `freq` Pitch | **CV** | float; 20..200 Hz step 1 logarithmic; default 50; group Main | Base pitch frequency |
| `tone` Tone | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Drum tone/brightness |
| `decay` Decay | **CV** | float; 0.05..2 s step 0.01 logarithmic; default 0.3; group Main | Amplitude decay time |
| `attack_fm_amount` FM Amount | **CV** | float; 0..1 step 0.01; default 0.5; group Attack | Attack FM modulation depth |
| `self_fm_amount` Self FM | **CV** | float; 0..1 step 0.01; default 0.1; group Main | Self-FM modulation depth |
| `accent` Accent | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Accent/velocity amount |

### ANALOG SNARE `analog_snare_drum`

<a id="sources-analog-snare-analogsnaredrum"></a>

Analog-modeled snare drum synthesizer

Class: `daisysp::AnalogSnareDrum`  
Parameters: 5; CV-controllable: 5

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `freq` Pitch | **CV** | float; 50..500 Hz step 1 logarithmic; default 200; group Main | Base pitch frequency |
| `tone` Tone | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Snare tone/body |
| `decay` Decay | **CV** | float; 0.02..1 s step 0.01 logarithmic; default 0.2; group Main | Amplitude decay time |
| `snappy` Snappy | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Snare wire/noise amount |
| `accent` Accent | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Accent/velocity amount |

### CLK NOISE `clocked_noise`

<a id="sources-clk-noise-clockednoise"></a>

Noise processed by a Sample & Hold running at a target frequency.

Class: `daisysp::ClockedNoise`  
Parameters: 1; CV-controllable: 1

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `freq` Frequency | **CV** | float; 0.1..20000 Hz step 0.1 logarithmic; default 1000; group Main | Frequency of the internal S&H clock |

### DC SOURCE `dc_source`

<a id="sources-dc-source-dcsource"></a>

Constant DC value source

Class: `DcSource`  
Parameters: 1; CV-controllable: 1

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `value` Value | **CV** | float; -1000..1000 step 0.01; default 1; group Main | Constant output value |

### DUST `dust`

<a id="sources-dust-dust"></a>

Random impulse/noise burst generator

Class: `inline`  
Parameters: 2; CV-controllable: 1

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `density` Density | **CV** | float; 0.1..1000 Hz step 0.1 logarithmic; default 10; group Main | Average impulses per second |
| `amp` Amplitude | - | float; 0..1 step 0.01; default 0.5; group Main | Output amplitude |

### FM2 `fm2`

<a id="sources-fm2-fm2"></a>

2-operator FM synthesis oscillator

Class: `daisysp::Fm2`  
Parameters: 3; CV-controllable: 3

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `freq` Frequency | **CV** | float; 20..20000 Hz step 1 logarithmic; default 440; group Carrier | Carrier frequency in Hz |
| `ratio` Ratio | **CV** | float; 0..20 step 0.01; default 2; group Modulator | Modulator-to-carrier frequency ratio |
| `index` Index | **CV** | float; 0..20 step 0.1; default 1; group Modulator | FM modulation index (depth) |

### FORMANT OSC `formant_oscillator`

<a id="sources-formant-osc-formantoscillator"></a>

Vocal formant oscillator with phase reset

Class: `daisysp::FormantOscillator`  
Parameters: 3; CV-controllable: 3

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `carrier_freq` Carrier Freq | **CV** | float; 20..20000 Hz step 1 logarithmic; default 440; group Main | Carrier (fundamental) frequency in Hz |
| `formant_freq` Formant Freq | **CV** | float; 20..20000 Hz step 1 logarithmic; default 1000; group Main | Formant frequency for vocal character |
| `phase_shift` Phase Shift | **CV** | float; 0..1 step 0.01; default 0; group Modulation | Phase shift amount (0-1) |

### GRAINLET `grainlet_oscillator`

<a id="sources-grainlet-grainletoscillator"></a>

Granular oscillator with formant control

Class: `daisysp::GrainletOscillator`  
Parameters: 4; CV-controllable: 4

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `freq` Frequency | **CV** | float; 20..20000 Hz step 1 logarithmic; default 220; group Main | Base frequency in Hz |
| `formant_freq` Formant | **CV** | float; 20..10000 Hz step 1 logarithmic; default 800; group Formant | Formant frequency (spectral peak) |
| `shape` Shape | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Grain window shape |
| `bleed` Bleed | **CV** | float; 0..1 step 0.01; default 0; group Main | Inter-grain overlap amount |

### HARMONIC OSC `harmonic_oscillator`

<a id="sources-harmonic-osc-harmonicoscillator"></a>

Additive synthesis oscillator with 16 harmonics

Class: `daisysp::HarmonicOscillator<16>`  
Parameters: 10; CV-controllable: 9

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `freq` Frequency | **CV** | float; 20..2000 Hz step 1 logarithmic; default 110; group Main | Root frequency in Hz |
| `first_harm_idx` First Harmonic | - | int; 1..64 step 1; default 1; group Harmonics | Starting harmonic index (1 = fundamental) |
| `amp_1` Amp 1 | **CV** | float; 0..1 step 0.01; default 1; group Harmonics | Amplitude of 1st harmonic |
| `amp_2` Amp 2 | **CV** | float; 0..1 step 0.01; default 0.5; group Harmonics | Amplitude of 2nd harmonic |
| `amp_3` Amp 3 | **CV** | float; 0..1 step 0.01; default 0.33; group Harmonics | Amplitude of 3rd harmonic |
| `amp_4` Amp 4 | **CV** | float; 0..1 step 0.01; default 0.25; group Harmonics | Amplitude of 4th harmonic |
| `amp_5` Amp 5 | **CV** | float; 0..1 step 0.01; default 0.2; group Harmonics | Amplitude of 5th harmonic |
| `amp_6` Amp 6 | **CV** | float; 0..1 step 0.01; default 0.16; group Harmonics | Amplitude of 6th harmonic |
| `amp_7` Amp 7 | **CV** | float; 0..1 step 0.01; default 0.14; group Harmonics | Amplitude of 7th harmonic |
| `amp_8` Amp 8 | **CV** | float; 0..1 step 0.01; default 0.125; group Harmonics | Amplitude of 8th harmonic |

### HI-HAT `hihat`

<a id="sources-hi-hat-hihat"></a>

Analog-style hi-hat synthesizer

Class: `daisysp::HiHat`  
Parameters: 6; CV-controllable: 5

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `freq` Tone | **CV** | float; 200..12000 Hz step 10 logarithmic; default 3000; group Main | Hi-hat tone frequency |
| `tone` Brightness | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Hi-hat brightness/timbre |
| `decay` Decay | **CV** | float; 0.01..2 s step 0.01 logarithmic; default 0.2; group Main | Hi-hat decay time |
| `accent` Accent | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Accent amount |
| `noisiness` Noisiness | **CV** | float; 0..1 step 0.01; default 0.5; group Main | - |
| `sustain` Sustain | - | int; 0..1 step 1; default 0; group Main | Sustain mode (0=decay, 1=sustain) |

### OSC BANK `oscillator_bank`

<a id="sources-osc-bank-oscillatorbank"></a>

Bank of 7 oscillators for rich, detuned textures

Class: `daisysp::OscillatorBank`  
Parameters: 9; CV-controllable: 9

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `freq` Frequency | **CV** | float; 20..20000 Hz step 1 logarithmic; default 440; group Main | Base frequency for all oscillators |
| `amp_saw_8` Saw 8' | **CV** | float; 0..1 step 0.01; default 0.5; group Amplitudes | Sawtooth 8' Amplitude |
| `amp_sqr_8` Sqr 8' | **CV** | float; 0..1 step 0.01; default 0; group Amplitudes | Square 8' Amplitude |
| `amp_saw_4` Saw 4' | **CV** | float; 0..1 step 0.01; default 0; group Amplitudes | Sawtooth 4' Amplitude |
| `amp_sqr_4` Sqr 4' | **CV** | float; 0..1 step 0.01; default 0; group Amplitudes | Square 4' Amplitude |
| `amp_saw_2` Saw 2' | **CV** | float; 0..1 step 0.01; default 0; group Amplitudes | Sawtooth 2' Amplitude |
| `amp_sqr_2` Sqr 2' | **CV** | float; 0..1 step 0.01; default 0; group Amplitudes | Square 2' Amplitude |
| `amp_saw_1` Saw 1' | **CV** | float; 0..1 step 0.01; default 0; group Amplitudes | Sawtooth 1' Amplitude |
| `gain` Gain | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Mix Gain |

### OSCILLATOR `oscillator`

<a id="sources-oscillator-oscillator"></a>

Band-limited oscillator with multiple waveforms

Class: `daisysp::Oscillator`  
Parameters: 4; CV-controllable: 4

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `freq` Frequency | **CV** | float; 20..20000 Hz step 1 logarithmic; default 440; group Main | Oscillator frequency in Hz |
| `amp` Amplitude | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Output amplitude (0-1) |
| `waveform` Waveform | **CV** | enum; Sine=WAVE_SIN, Triangle=WAVE_TRI, Saw=WAVE_SAW, Ramp=WAVE_RAMP, Square=WAVE_SQUARE, PolyBLEP Tri=WAVE_POLYBLEP_TRI, PolyBLEP Saw=WAVE_POLYBLEP_SAW, PolyBLEP Square=WAVE_POLYBLEP_SQUARE; default WAVE_POLYBLEP_SAW; group Main | Waveform shape (use PolyBLEP variants for anti-aliased output) |
| `pw` Pulse Width | **CV** | float; 0..1 step 0.01; default 0.5; group Modulation | Pulse width for square wave (0-1) |

### PARTICLE `particle`

<a id="sources-particle-particle"></a>

Particle noise generator with resonant filter

Class: `daisysp::Particle`  
Parameters: 4; CV-controllable: 4

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `density` Density | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Particle generation density |
| `spread` Spread | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Random pitch spread amount |
| `freq` Frequency | **CV** | float; 20..20000 Hz step 1 logarithmic; default 440; group Main | Center frequency in Hz |
| `resonance` Resonance | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Internal bandpass filter resonance |

### SYNTH KICK `synth_bass_drum`

<a id="sources-synth-kick-synthbassdrum"></a>

Synthetic/digital bass drum synthesizer

Class: `daisysp::SyntheticBassDrum`  
Parameters: 7; CV-controllable: 7

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `freq` Pitch | **CV** | float; 20..200 Hz step 1 logarithmic; default 50; group Main | Base pitch frequency |
| `tone` Tone | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Drum tone/color |
| `decay` Decay | **CV** | float; 0.05..3 s step 0.01 logarithmic; default 0.4; group Main | Amplitude decay time |
| `dirty` Dirty | **CV** | float; 0..1 step 0.01; default 0; group Main | Adds harmonic distortion (0 = clean, 1 = dirty) |
| `fm_envelope_amount` FM Env | **CV** | float; 0..1 step 0.01; default 0.5; group FM | FM envelope modulation depth |
| `fm_envelope_decay` FM Decay | **CV** | float; 0.01..1 s step 0.01 logarithmic; default 0.1; group FM | FM envelope decay time |
| `accent` Accent | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Accent/velocity amount |

### SYNTH SNARE `synth_snare_drum`

<a id="sources-synth-snare-synthsnaredrum"></a>

Synthetic/digital snare drum synthesizer

Class: `daisysp::SyntheticSnareDrum`  
Parameters: 6; CV-controllable: 6

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `freq` Pitch | **CV** | float; 50..500 Hz step 1 logarithmic; default 180; group Main | Body pitch frequency |
| `tone` Tone | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Body tone color |
| `decay` Decay | **CV** | float; 0.02..1 s step 0.01 logarithmic; default 0.15; group Main | Amplitude decay time |
| `snappy` Snappy | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Snare wire noise amount |
| `fm_amount` FM Amount | **CV** | float; 0..1 step 0.01; default 0.2; group FM | FM modulation depth |
| `accent` Accent | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Accent/velocity amount |

### VAR SAW OSC `variable_saw_oscillator`

<a id="sources-var-saw-osc-variablesawoscillator"></a>

Variable saw oscillator with slope and notch control

Class: `daisysp::VariableSawOscillator`  
Parameters: 3; CV-controllable: 3

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `freq` Frequency | **CV** | float; 20..20000 Hz step 1 logarithmic; default 440; group Main | Oscillator frequency in Hz |
| `pw` PW / Notch | **CV** | float; -1..1 step 0.01; default 0; group Modulation | Notch depth or slope adjustment (-1 to 1) |
| `waveshape` Waveshape | **CV** | float; 0..1 step 0.01; default 0; group Modulation | 0 = notch, 1 = slope |

### VAR SHAPE OSC `variable_shape_oscillator`

<a id="sources-var-shape-osc-variableshapeoscillator"></a>

Continuously variable waveform oscillator with hard sync

Class: `daisysp::VariableShapeOscillator`  
Parameters: 5; CV-controllable: 4

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `freq` Frequency | **CV** | float; 20..20000 Hz step 1 logarithmic; default 440; group Main | Oscillator frequency in Hz |
| `pw` Pulse Width / Shape | **CV** | float; 0..1 step 0.01; default 0.5; group Modulation | PW for square, shape for saw/ramp/tri (0-1) |
| `waveshape` Waveshape | **CV** | float; 0..1 step 0.01; default 0; group Modulation | 0 = saw/ramp/tri, 1 = square |
| `sync_freq` Sync Freq | **CV** | float; 20..20000 Hz step 1 logarithmic; default 440; group Sync | Hard sync oscillator frequency |
| `sync_enable` Sync Enable | - | bool; default false; group Sync | Enable hard sync |

### VOSIM OSC `vosim_oscillator`

<a id="sources-vosim-osc-vosimoscillator"></a>

VOSIM voice simulation oscillator

Class: `daisysp::VosimOscillator`  
Parameters: 4; CV-controllable: 4

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `freq` Frequency | **CV** | float; 20..20000 Hz step 1 logarithmic; default 440; group Main | Carrier frequency in Hz |
| `form1_freq` Formant 1 Freq | **CV** | float; 20..20000 Hz step 1 logarithmic; default 800; group Formants | First formant frequency |
| `form2_freq` Formant 2 Freq | **CV** | float; 20..20000 Hz step 1 logarithmic; default 1200; group Formants | Second formant frequency |
| `shape` Shape | **CV** | float; -1..1 step 0.01; default 0; group Modulation | Waveshaping amount (-1 to 1) |

### WHITE NOISE `whitenoise`

<a id="sources-white-noise-whitenoise"></a>

White noise generator

Class: `daisysp::WhiteNoise`  
Parameters: 1; CV-controllable: 1

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `amp` Amplitude | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Noise amplitude (0-1) |

### Z OSC `z_oscillator`

<a id="sources-z-osc-zoscillator"></a>

Complex modulation oscillator with formant sync

Class: `daisysp::ZOscillator`  
Parameters: 4; CV-controllable: 4

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `freq` Frequency | **CV** | float; 20..20000 Hz step 1 logarithmic; default 440; group Main | Carrier frequency in Hz |
| `formant_freq` Formant Freq | **CV** | float; 20..20000 Hz step 1 logarithmic; default 1000; group Main | Formant oscillator frequency |
| `shape` Shape | **CV** | float; 0..1 step 0.01; default 0.5; group Modulation | Waveform contour (0-1) |
| `mode` Mode | **CV** | float; -1..1 step 0.01; default 0; group Modulation | Phase shift/offset mode (-1 to 1) |


## Filters

### DC BLOCK `dcblock`

<a id="filters-dc-block-dcblock"></a>

Removes DC offset from audio signal

Class: `daisysp::DcBlock`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### HIGH SHELF `highShelving`

<a id="filters-high-shelf-highshelving"></a>

High-frequency shelving filter (DAFX)

Class: `daisysp::HighShelving`  
Parameters: 2; CV-controllable: 2

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `frequency` Frequency | **CV** | float; 1000..16000 Hz step 10 logarithmic; default 4000; group Filter | Corner frequency |
| `gain` Gain | **CV** | float; -20..20 dB step 0.1; default 0; group Filter | Boost/cut amount in dB |

### HPF (ATONE) `atone`

<a id="filters-hpf-atone-atone"></a>

First-order highpass filter (-6dB/octave)

Class: `daisysp::ATone`  
Parameters: 1; CV-controllable: 1

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `freq` Cutoff | **CV** | float; 20..20000 Hz step 1 logarithmic; default 200; group Main | Cutoff frequency in Hz |

### LOW SHELF `lowShelving`

<a id="filters-low-shelf-lowshelving"></a>

Low-frequency shelving filter (DAFX)

Class: `daisysp::LowShelving`  
Parameters: 2; CV-controllable: 2

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `frequency` Frequency | **CV** | float; 20..500 Hz step 1 logarithmic; default 100; group Filter | Corner frequency |
| `gain` Gain | **CV** | float; -20..20 dB step 0.1; default 0; group Filter | Boost/cut amount in dB |

### LPF (1-POLE) `onepole`

<a id="filters-lpf-1-pole-onepole"></a>

Simple one-pole lowpass filter (-6dB/octave)

Class: `daisysp::OnePole`  
Parameters: 1; CV-controllable: 1

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `freq` Cutoff | **CV** | float; 20..20000 Hz step 1 logarithmic; default 1000; group Main | Cutoff frequency in Hz |

### MOOG LADDER `moog_ladder`

<a id="filters-moog-ladder-moogladder"></a>

24dB/oct ladder filter with classic Moog character

Class: `daisysp::MoogLadder`  
Parameters: 2; CV-controllable: 2

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `freq` Cutoff | **CV** | float; 20..20000 Hz step 1 logarithmic; default 1000; group Main | Filter cutoff frequency |
| `res` Resonance | **CV** | float; 0..1 step 0.01; default 0.4; group Main | Filter resonance (self-oscillation at high values) |

### PEAK EQ `peakFilter`

<a id="filters-peak-eq-peakfilter"></a>

Parametric peak/notch EQ filter (DAFX)

Class: `daisysp::PeakFilter`  
Parameters: 3; CV-controllable: 3

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `frequency` Frequency | **CV** | float; 20..20000 Hz step 1 logarithmic; default 1000; group Filter | Center frequency |
| `bandwidth` Bandwidth | **CV** | float; 10..10000 Hz step 1 logarithmic; default 100; group Filter | Filter bandwidth |
| `gain` Gain | **CV** | float; -20..20 dB step 0.1; default 0; group Filter | Boost/cut amount in dB |

### SVF `svf`

<a id="filters-svf-svf"></a>

State Variable Filter with multiple outputs

Class: `daisysp::Svf`  
Parameters: 3; CV-controllable: 3

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `freq` Cutoff | **CV** | float; 20..20000 Hz step 1 logarithmic; default 1000; group Main | Filter cutoff frequency |
| `res` Resonance | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Filter resonance (Q) |
| `drive` Drive | **CV** | float; 0..1 step 0.01; default 0; group Main | Pre-filter saturation drive |


## Effects

### AUTOWAH `autowah`

<a id="effects-autowah-autowah"></a>

Envelope-controlled wah filter effect

Class: `daisysp::Autowah`  
Parameters: 3; CV-controllable: 3

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `wah` Wah | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Manual wah position |
| `dry_wet` Dry/Wet | **CV** | float; 0..1 step 0.01; default 1; group Main | Dry/wet mix (1.0 = fully wet) |
| `level` Level | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Output level |

### BITCRUSH `bitcrush`

<a id="effects-bitcrush-bitcrush"></a>

Bit depth reduction effect

Class: `inline::Bitcrush`  
Parameters: 1; CV-controllable: 1

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `bits` Bits | **CV** | float; 1..16 step 1; default 8; group Main | Bit depth (lower = more crushed) |

### CHORUS `chorus`

<a id="effects-chorus-chorus"></a>

Chorus effect with LFO modulation

Class: `daisysp::Chorus`  
Parameters: 4; CV-controllable: 4

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `lfo_freq` Rate | **CV** | float; 0.01..10 Hz step 0.01 logarithmic; default 0.5; group Main | LFO modulation rate |
| `lfo_depth` Depth | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Modulation depth (0-1) |
| `delay` Delay | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Base delay time |
| `feedback` Feedback | **CV** | float; 0..0.99 step 0.01; default 0.2; group Advanced | Feedback amount (0-0.99) |

### COMPRESSOR `compressor`

<a id="effects-compressor-compressor"></a>

Dynamics compressor for controlling signal levels

Class: `daisysp::Compressor`  
Parameters: 6; CV-controllable: 6

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `threshold` Threshold | **CV** | float; -60..0 dB step 0.5; default -12; group Main | Threshold above which compression starts |
| `ratio` Ratio | **CV** | float; 1..20 :1 step 0.1; default 4; group Main | Compression ratio (input:output dB above threshold) |
| `attack` Attack | **CV** | float; 0.001..1 s step 0.001 logarithmic; default 0.01; group Envelope | Attack time - how quickly compression engages |
| `release` Release | **CV** | float; 0.01..2 s step 0.01 logarithmic; default 0.1; group Envelope | Release time - how quickly compression disengages |
| `makeup` Makeup Gain | **CV** | float; 0..40 dB step 0.5; default 0; group Output | Output gain to compensate for volume reduction |
| `auto_makeup` Auto Makeup | **CV** | float; 0..1 step 0.01; default 0; group Output | Auto makeup gain (0 = off, 1 = full auto) |

### Crosstalk Cancel `crosstalk_canceller`

<a id="effects-crosstalk-cancel-crosstalkcanceller"></a>

DAFX Stereo Crosstalk Canceller

Class: `daisysp::CrosstalkCanceller<256>`  
Parameters: 2; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `angle` Spk Angle | - | float; 5..30 deg step 1; default 10 | - |
| `regularization` Regularization | - | float; 0.000001..0.001 step 0.000001; default 0.00001 | - |

### DECIMATOR `decimator`

<a id="effects-decimator-decimator"></a>

Sample rate reduction and bitcrushing effect

Class: `daisysp::Decimator`  
Parameters: 2; CV-controllable: 2

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `downsample` Downsample | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Amount of sample rate reduction |
| `bitcrush` Bitcrush | **CV** | float; 0..1 step 0.01; default 0; group Main | Amount of bit depth reduction |

### DELAY `delay_line`

<a id="effects-delay-delayline"></a>

Variable delay line with feedback for echo effects

Class: `daisysp::DelayLine<float, MAX_DELAY>`  
Parameters: 3; CV-controllable: 3

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `delay_time` Delay Time | **CV** | float; 0.001..2 s step 0.001 logarithmic; default 0.25; group Main | Delay time in seconds |
| `feedback` Feedback | **CV** | float; 0..0.95 step 0.01; default 0.4; group Main | Feedback amount (keep below 1.0 to prevent runaway) |
| `wet_dry` Wet/Dry | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Mix between dry (0) and wet (1) signal |

### DISTORTION `distortion`

<a id="effects-distortion-distortion"></a>

Tube-style distortion with tone control

Class: `inline::Distortion`  
Parameters: 3; CV-controllable: 3

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `drive` Drive | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Distortion drive amount |
| `tone` Tone | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Tone control (low-high) |
| `level` Level | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Output level |

### FDN REVERB `fdnReverb`

<a id="effects-fdn-reverb-fdnreverb"></a>

Feedback Delay Network reverb (DAFX)

Class: `daisysp::FDNReverb<8192>`  
Parameters: 4; CV-controllable: 3

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `decay` Decay | **CV** | float; 0.9..0.999 step 0.001; default 0.97; group Reverb | Reverb tail decay factor |
| `mix` Mix | **CV** | float; 0..1 step 0.01; default 0.5; group Output | Dry/wet mix |
| `damping` Damping | **CV** | float; 0..0.99 step 0.01; default 0.3; group Reverb | High-frequency damping |
| `delayScale` Size | - | float; 0.1..4 step 0.1; default 1; group Reverb | Room size (delay scale) |

### FLANGER `flanger`

<a id="effects-flanger-flanger"></a>

Flanger effect with LFO modulation

Class: `daisysp::Flanger`  
Parameters: 4; CV-controllable: 4

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `lfo_freq` Rate | **CV** | float; 0.01..10 Hz step 0.01 logarithmic; default 0.3; group Main | LFO modulation rate |
| `lfo_depth` Depth | **CV** | float; 0..1 step 0.01; default 0.8; group Main | Modulation depth |
| `feedback` Feedback | **CV** | float; 0..0.99 step 0.01; default 0.5; group Main | Feedback for more intense effect |
| `delay` Delay | **CV** | float; 0..1 step 0.01; default 0.5 | - |

### FOLD `fold`

<a id="effects-fold-fold"></a>

Wavefolding waveshaper

Class: `daisysp::Fold`  
Parameters: 1; CV-controllable: 1

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `incr` Drive | **CV** | float; 0.1..10 step 0.1 logarithmic; default 1; group Main | Input gain / fold intensity |

### HARDCLIP `hardclip`

<a id="effects-hardclip-hardclip"></a>

Hard clipping distortion

Class: `inline::HardClip`  
Parameters: 1; CV-controllable: 1

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `threshold` Threshold | **CV** | float; 0.01..1 step 0.01; default 0.8; group Main | Clipping threshold level |

### LP COMB `lpIirComb`

<a id="effects-lp-comb-lpiircomb"></a>

Low-pass IIR comb filter for reverb (DAFX)

Class: `daisysp::LPIIRComb<4096>`  
Parameters: 3; CV-controllable: 3

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `delayMs` Delay | **CV** | float; 1..100 ms step 0.1 logarithmic; default 50; group Delay | Delay time in milliseconds |
| `feedback` Feedback | **CV** | float; 0..0.999 step 0.01; default 0.7; group Filter | Feedback gain |
| `damping` Damping | **CV** | float; 0..0.999 step 0.01; default 0.3; group Filter | High-frequency damping |

### OVERDRIVE `overdrive`

<a id="effects-overdrive-overdrive"></a>

Soft clipping overdrive distortion

Class: `daisysp::Overdrive`  
Parameters: 1; CV-controllable: 1

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `drive` Drive | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Distortion amount (0-1) |

### PHASER `phaser`

<a id="effects-phaser-phaser"></a>

Multi-stage allpass phaser with LFO

Class: `daisysp::Phaser`  
Parameters: 4; CV-controllable: 4

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `freq` Frequency | **CV** | float; 100..10000 Hz step 1 logarithmic; default 1000; group Main | Allpass filter center frequency |
| `lfo_freq` LFO Rate | **CV** | float; 0.01..10 Hz step 0.01 logarithmic; default 0.5; group Main | LFO modulation rate |
| `lfo_depth` LFO Depth | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Amount of LFO modulation |
| `feedback` Feedback | **CV** | float; 0..0.99 step 0.01; default 0.5; group Advanced | Feedback for resonant peaks |

### PITCHSHIFT `pitch_shifter`

<a id="effects-pitchshift-pitchshifter"></a>

Basic pitch shifter

Class: `inline::PitchShifter`  
Parameters: 2; CV-controllable: 1

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `semitones` Semitones | **CV** | float; -12..12 st step 1; default 0; group Main | Pitch shift in semitones |
| `mix` Mix | - | float; 0..1 step 0.01; default 1; group Main | Dry/wet mix |

### PV PITCH `phaseVocoderPitch`

<a id="effects-pv-pitch-phasevocoderpitch"></a>

FFT-based pitch shifter using phase vocoder (DAFX)

Class: `daisysp::PhaseVocoder<2048>`  
Parameters: 1; CV-controllable: 1

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `pitchRatio` Pitch | **CV** | float; 0.5..2 step 0.01; default 1; group Pitch | Pitch ratio (0.5 = -1 oct, 1.0 = unity, 2.0 = +1 oct) |

### RECTIFIER `rectifier`

<a id="effects-rectifier-rectifier"></a>

Full or half wave rectification

Class: `inline::Rectifier`  
Parameters: 1; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `mode` Mode | - | enum; Full=0, Half=1; default 0; group Main | Rectification mode |

### REVERB `reverb_sc`

<a id="effects-reverb-reverbsc"></a>

High-quality stereo reverb for ambient and room simulation

Class: `daisysp::ReverbSc`  
Parameters: 3; CV-controllable: 3

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `feedback` Decay | **CV** | float; 0..0.99 step 0.01; default 0.7; group Main | Reverb decay time / tail length |
| `lpfreq` Damping | **CV** | float; 500..18000 Hz step 100 logarithmic; default 10000; group Main | Lowpass filter frequency for high-frequency damping |
| `wet_dry` Wet/Dry | **CV** | float; 0..1 step 0.01; default 0.3; group Main | Mix between dry (0) and wet (1) signal |

### Robotization `robotization`

<a id="effects-robotization-robotization"></a>

DAFX FFT-based robotization effect

Class: `daisysp::Robotization<512>`  
Parameters: 1; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `mix` Mix | - | float; 0..1 % step 0.01; default 1 | - |

### SOFTCLIP `softclip`

<a id="effects-softclip-softclip"></a>

Soft saturation using tanh waveshaping

Class: `inline::SoftClip`  
Parameters: 1; CV-controllable: 1

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `drive` Drive | **CV** | float; 0.1..10 step 0.1 logarithmic; default 1; group Main | Saturation drive amount |

### SR REDUCE `sample_rate_reducer`

<a id="effects-sr-reduce-sampleratereducer"></a>

Sample rate reduction for aliasing effects

Class: `daisysp::SampleRateReducer`  
Parameters: 1; CV-controllable: 1

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `frequency` Target Rate | **CV** | float; 100..48000 Hz step 100 logarithmic; default 10000; group Main | Target sample rate |

### Time Stretch `sola_time_stretch`

<a id="effects-time-stretch-solatimestretch"></a>

DAFX SOLA Time Stretch Algorithm

Class: `daisysp::SOLATimeStretch<4096, 2048>`  
Parameters: 1; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `stretch` Stretch | - | float; 0.25..2 x step 0.01; default 1 | - |

### TONE STACK `toneStack`

<a id="effects-tone-stack-tonestack"></a>

Three-band tone stack EQ (DAFX)

Class: `daisysp::ToneStack`  
Parameters: 3; CV-controllable: 3

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `bass` Bass | **CV** | float; -1..1 step 0.01; default 0; group EQ | Low frequency boost/cut |
| `middle` Middle | **CV** | float; -1..1 step 0.01; default 0; group EQ | Mid frequency boost/cut |
| `treble` Treble | **CV** | float; -1..1 step 0.01; default 0; group EQ | High frequency boost/cut |

### TREMOLO `tremolo`

<a id="effects-tremolo-tremolo"></a>

Amplitude modulation tremolo effect

Class: `daisysp::Tremolo`  
Parameters: 3; CV-controllable: 3

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `freq` Rate | **CV** | float; 0.1..20 Hz step 0.1 logarithmic; default 5; group Main | Tremolo rate |
| `depth` Depth | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Modulation depth |
| `waveform` Waveform | **CV** | enum; Sine=0, Triangle=1, Square=2; default 0; group Main | LFO waveform shape |

### TUBE `tube`

<a id="effects-tube-tube"></a>

Tube distortion with asymmetric waveshaping (DAFX)

Class: `daisysp::Tube`  
Parameters: 6; CV-controllable: 4

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `drive` Drive | **CV** | float; 0..1 step 0.01; default 0.5; group Distortion | Input gain / saturation amount |
| `bias` Bias | **CV** | float; 0..1 step 0.01; default 0; group Distortion | Asymmetry (even harmonics) |
| `distortion` Distortion | **CV** | float; 0..1 step 0.01; default 0.5; group Distortion | Waveshaper intensity |
| `highPassPole` HP Pole | - | float; 0..1 step 0.01; default 0.9; group Filter | DC blocking filter pole |
| `lowPassPole` LP Pole | - | float; 0..1 step 0.01; default 0.9; group Filter | High-frequency rolloff |
| `mix` Mix | **CV** | float; 0..1 step 0.01; default 1; group Output | Dry/wet blend |

### UNI COMB `universalComb`

<a id="effects-uni-comb-universalcomb"></a>

Universal comb filter with FB/FF/blend (DAFX)

Class: `daisysp::UniversalComb<2048>`  
Parameters: 4; CV-controllable: 4

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `delayMs` Delay | **CV** | float; 0.1..50 ms step 0.1 logarithmic; default 10; group Delay | Delay time in milliseconds |
| `feedback` Feedback | **CV** | float; -0.999..0.999 step 0.01; default 0; group Filter | Feedback coefficient (FB) |
| `feedforward` Feedforward | **CV** | float; -1..1 step 0.01; default 1; group Filter | Feedforward coefficient (FF) |
| `blend` Blend | **CV** | float; 0..1 step 0.01; default 0.5; group Filter | Dry signal blend (BL) |

### WAHWAH `wahwah`

<a id="effects-wahwah-wahwah"></a>

Wah-wah effect with variable bandpass filter (DAFX)

Class: `daisysp::WahWah`  
Parameters: 3; CV-controllable: 3

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `frequency` Frequency | **CV** | float; 200..2000 Hz step 1 logarithmic; default 500; group Main | Wah pedal position frequency |
| `q` Q | **CV** | float; 1..20 step 0.1; default 5; group Main | Filter resonance (Q factor) |
| `depth` Depth | **CV** | float; 0..1 step 0.01; default 1; group Main | Modulation depth |

### WAVEFOLDER `wavefolder`

<a id="effects-wavefolder-wavefolder"></a>

Waveshaping distortion via wavefolding

Class: `daisysp::Wavefolder`  
Parameters: 2; CV-controllable: 2

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `gain` Gain | **CV** | float; 0.1..10 step 0.1 logarithmic; default 1; group Main | Input gain/drive |
| `offset` Offset | **CV** | float; -1..1 step 0.01; default 0; group Main | DC offset for asymmetric folding |

### Whisperization `whisperization`

<a id="effects-whisperization-whisperization"></a>

DAFX FFT-based whisperization effect

Class: `daisysp::Whisperization<512>`  
Parameters: 1; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `mix` Mix | - | float; 0..1 % step 0.01; default 1 | - |


## Modulators

### AD ENVELOPE `ad_env`

<a id="modulators-ad-envelope-adenv"></a>

Attack-Decay envelope generator

Class: `daisysp::AdEnv`  
Parameters: 3; CV-controllable: 3

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `attack` Attack | **CV** | float; 0.001..10 s step 0.001 logarithmic; default 0.01; group Time | Attack time in seconds |
| `decay` Decay | **CV** | float; 0.001..10 s step 0.001 logarithmic; default 0.5; group Time | Decay time in seconds |
| `curve` Curve | **CV** | float; -10..10 step 0.1; default 0; group Shape | Envelope curve shape (-10 to +10) |

### ADSR ENVELOPE `adsr`

<a id="modulators-adsr-envelope-adsr"></a>

ADSR envelope generator for amplitude and modulation control

Class: `daisysp::Adsr`  
Parameters: 4; CV-controllable: 4

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `attack` Attack | **CV** | float; 0.001..10 s step 0.001 logarithmic; default 0.01; group Envelope | Attack time - how quickly the envelope reaches peak level |
| `decay` Decay | **CV** | float; 0.001..10 s step 0.001 logarithmic; default 0.1; group Envelope | Decay time - how quickly the envelope falls to sustain level |
| `sustain` Sustain | **CV** | float; 0..1 step 0.01; default 0.7; group Envelope | Sustain level - held while gate is high |
| `release` Release | **CV** | float; 0.001..10 s step 0.001 logarithmic; default 0.3; group Envelope | Release time - how quickly the envelope falls to zero after gate release |

### LFO `lfo`

<a id="modulators-lfo-lfo"></a>

Low Frequency Oscillator for modulation

Class: `daisysp::Oscillator`  
Parameters: 3; CV-controllable: 3

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `freq` Rate | **CV** | float; 0.01..100 Hz step 0.01 logarithmic; default 1; group Main | LFO rate in Hz (0.01-100 Hz) |
| `amp` Depth | **CV** | float; 0..1 step 0.01; default 1; group Main | Modulation depth (0-1) |
| `waveform` Shape | **CV** | enum; Sine=WAVE_SIN, Triangle=WAVE_TRI, Saw=WAVE_SAW, Ramp=WAVE_RAMP, Square=WAVE_SQUARE; default WAVE_SIN; group Main | LFO waveform shape |

### PHASOR `phasor`

<a id="modulators-phasor-phasor"></a>

Generates a normalized ramp signal (0-1) at the specified frequency.

Class: `daisysp::Phasor`  
Parameters: 1; CV-controllable: 1

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `freq` Frequency | **CV** | float; 0..1000 Hz step 0.01 logarithmic; default 1; group Main | Phasor frequency in Hz |

### RING MOD `ringModulator`

<a id="modulators-ring-mod-ringmodulator"></a>

Ring modulator for metallic/bell tones (DAFX)

Class: `daisysp::RingModulator`  
Parameters: 2; CV-controllable: 2

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `frequency` Frequency | **CV** | float; 1..10000 Hz step 1 logarithmic; default 440; group Modulator | Modulator frequency |
| `depth` Depth | **CV** | float; 0..1 step 0.01; default 1; group Modulator | Modulation depth |

### VIBRATO `vibrato`

<a id="modulators-vibrato-vibrato"></a>

Vibrato effect using modulated delay line (DAFX)

Class: `daisysp::Vibrato`  
Parameters: 2; CV-controllable: 2

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `frequency` Rate | **CV** | float; 0.1..20 Hz step 0.1 logarithmic; default 5; group Modulation | Modulation frequency |
| `width` Depth | **CV** | float; 0.0001..0.1 s step 0.0001 logarithmic; default 0.005; group Modulation | Modulation depth (delay width) |


## Dynamics

### Comp/Exp `compressor_expander`

<a id="dynamics-compexp-compressorexpander"></a>

DAFX Compressor/Expander dynamics processor

Class: `daisysp::CompressorExpander`  
Parameters: 7; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `comp_threshold` Comp Thresh | - | float; -80..0 dB step 0.1; default -20 | - |
| `comp_ratio` Comp Ratio | - | float; 1..40 :1 step 0.1; default 2 | - |
| `exp_threshold` Exp Thresh | - | float; -80..0 dB step 0.1; default -40 | - |
| `exp_ratio` Exp Ratio | - | float; 1..40 1: step 0.1; default 2 | - |
| `attack` Attack | - | float; 0.001..1 s step 0.001; default 0.03 | - |
| `release` Release | - | float; 0.001..1 s step 0.001; default 0.003 | - |
| `lookahead` Lookahead | - | int; 0..256 smps step 1; default 150 | - |

### ENV FOL `envelope_follower`

<a id="dynamics-env-fol-envelopefollower"></a>

Envelope Follower

Class: `DVPE_EnvelopeFollower`  
Parameters: 2; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `attack` Attack | - | float; default 0.1 | Attack Coefficient (0-1) |
| `release` Release | - | float; default 0.01 | Release Coefficient (0-1) |

### GATE `gate`

<a id="dynamics-gate-gate"></a>

Noise gate with threshold control

Class: `inline::Gate`  
Parameters: 1; CV-controllable: 1

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `threshold` Threshold | **CV** | float; 0..0.5 step 0.001 logarithmic; default 0.01; group Main | Gate threshold level |

### LIMITER `limiter`

<a id="dynamics-limiter-limiter"></a>

Soft limiter to prevent clipping

Class: `daisysp::Limiter`  
Parameters: 1; CV-controllable: 1

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `pre_gain` Pre-Gain | **CV** | float; 0.1..10 step 0.1; default 1; group Main | Input gain before limiting |

### LINEAR VCA `linearvca`

<a id="dynamics-linear-vca-linearvca"></a>

Linear voltage-controlled amplifier

Class: `LinearVCA`  
Parameters: 1; CV-controllable: 1

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `level` Level | **CV** | float; 0..1 step 0.01; default 1; group Main | Base amplitude level |

### NOISE GATE `noiseGate`

<a id="dynamics-noise-gate-noisegate"></a>

Noise gate with hysteresis (DAFX)

Class: `daisysp::NoiseGate`  
Parameters: 4; CV-controllable: 3

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `threshold` Threshold | **CV** | float; -60..0 dB step 0.5; default -40; group Gate | Gate open threshold |
| `attack` Attack | **CV** | float; 0.0001..0.1 s step 0.0001 logarithmic; default 0.001; group Timing | Gate open time |
| `hold` Hold | - | float; 0.001..1 s step 0.001 logarithmic; default 0.1; group Timing | Minimum gate open time |
| `release` Release | **CV** | float; 0.001..1 s step 0.001 logarithmic; default 0.1; group Timing | Gate close time |


## Physical Modeling

### DRIP `drip`

<a id="physical-modeling-drip-drip"></a>

Physical modeling of water droplet sounds

Class: `daisysp::Drip`  
Parameters: 2; CV-controllable: 2

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `damp` Damp | **CV** | float; 0..1 step 0.01; default 0.2; group Main | Damping amount (affects decay) |
| `amp` Amplitude | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Output amplitude |

### MODAL VOICE `modal_voice`

<a id="physical-modeling-modal-voice-modalvoice"></a>

Modal synthesis voice for struck/plucked sounds

Class: `daisysp::ModalVoice`  
Parameters: 5; CV-controllable: 5

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `freq` Frequency | **CV** | float; 20..2000 Hz step 1 logarithmic; default 220; group Main | Fundamental frequency |
| `structure` Structure | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Modal structure (ratio between partials) |
| `brightness` Brightness | **CV** | float; 0..1 step 0.01; default 0.5; group Main | High-frequency content |
| `damping` Damping | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Decay rate of resonance |
| `accent` Accent | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Strike intensity |

### PLUCK `pluck`

<a id="physical-modeling-pluck-pluck"></a>

Karplus-Strong plucked string synthesis

Class: `daisysp::Pluck`  
Parameters: 4; CV-controllable: 4

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `freq` Frequency | **CV** | float; 20..2000 Hz step 1 logarithmic; default 220; group Main | Pluck frequency (pitch) |
| `decay` Decay | **CV** | float; 0.1..1 step 0.01; default 0.9; group Main | Decay time |
| `amp` Amplitude | **CV** | float; 0..1 step 0.01; default 0.8; group Main | Output amplitude |
| `damp` Damping | **CV** | float; 0..1 step 0.01; default 0.5; group Main | High frequency damping |

### RESONATOR `resonator`

<a id="physical-modeling-resonator-resonator"></a>

Modal resonator for physical modeling synthesis

Class: `daisysp::Resonator`  
Parameters: 4; CV-controllable: 4

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `freq` Frequency | **CV** | float; 20..10000 Hz step 1 logarithmic; default 440; group Main | Resonator frequency |
| `structure` Structure | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Modal structure |
| `brightness` Brightness | **CV** | float; 0..1 step 0.01; default 0.5; group Main | High frequency content |
| `damping` Damping | **CV** | float; 0..1 step 0.01; default 0.3; group Main | Decay time (lower = longer) |

### STRING VOICE `string_voice`

<a id="physical-modeling-string-voice-stringvoice"></a>

Physical modeling of plucked strings (Karplus-Strong)

Class: `daisysp::StringVoice`  
Parameters: 5; CV-controllable: 5

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `freq` Frequency | **CV** | float; 20..2000 Hz step 1 logarithmic; default 220; group Main | String pitch |
| `structure` Structure | **CV** | float; 0..1 step 0.01; default 0.5; group Main | String material/stiffness |
| `brightness` Brightness | **CV** | float; 0..1 step 0.01; default 0.5; group Main | High-frequency content |
| `damping` Damping | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Decay rate of string vibration |
| `accent` Accent | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Pluck intensity |


## User I/O

### AUDIO INPUT `audio_input`

<a id="user-io-audio-input-audioinput"></a>

Stereo audio input from hardware

Class: `AudioInput`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### AUDIO OUTPUT `audio_output`

<a id="user-io-audio-output-audiooutput"></a>

Stereo audio output to hardware

Class: `AudioOutput`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### CV IN `cv_input`

<a id="user-io-cv-in-cvinput"></a>

Hardware CV input from ADC

Class: `inline::CVInput`  
Parameters: 2; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `channel` ADC Channel | - | int; 0..11 step 1; default 0; group Main | ADC input channel (0-11) |
| `bipolar` Bipolar | - | bool; default false; group Main | Scale to -1 to +1 range |

### CV OUT `cv_output`

<a id="user-io-cv-out-cvoutput"></a>

Hardware CV output via DAC

Class: `inline::CVOutput`  
Parameters: 1; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `channel` DAC Channel | - | int; 0..1 step 1; default 0; group Main | DAC output channel (0-1) |

### ENCODER `encoder`

<a id="user-io-encoder-encoder"></a>

Rotary encoder with push button

Class: `Encoder`  
Parameters: 3; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `min_val` Min | - | float; -1000..1000 step 0.01; default 0; group Range | Minimum output value |
| `max_val` Max | - | float; -1000..1000 step 0.01; default 1; group Range | Maximum output value |
| `step` Step | - | float; 0.001..1 step 0.001 logarithmic; default 0.01; group Range | Value change per encoder tick |

### GATE OUT `gate_output`

<a id="user-io-gate-out-gateoutput"></a>

Hardware gate output via GPIO

Class: `inline::GateOutput`  
Parameters: 1; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `pin` Pin | - | int; 0..31 step 1; default 0; group Main | GPIO pin number |

### GATE/TRIG IN `gate_trigger_in`

<a id="user-io-gatetrig-in-gatetriggerin"></a>

Gate and trigger input from hardware

Class: `GateIn`  
Parameters: 1; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `channel` Channel | - | enum; Gate 1=0, Gate 2=1; default 0; group Config | Hardware gate input channel |

### KEY `key`

<a id="user-io-key-key"></a>

Keyboard/MIDI note input

Class: `Key`  
Parameters: 3; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `note` Note | - | int; 0..127 MIDI; default 60; group Main | MIDI note number (0-127) |
| `velocity` Velocity | - | float; 0..1 step 0.01; default 0.8; group Main | Note velocity (0-1) |
| `gate` Gate | - | bool; default false; group Main | Gate on/off state |

### KNOB `knob`

<a id="user-io-knob-knob"></a>

Hardware knob/potentiometer input

Class: `Knob`  
Parameters: 4; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `channel` Channel | - | enum; ADC 0=0, ADC 1=1, ADC 2=2, ADC 3=3, ADC 4=4, ADC 5=5, ADC 6=6, ADC 7=7; default 0; group Hardware | ADC channel the knob is connected to |
| `min` Min | - | float; -1000..1000 step 0.01; default 0; group Scaling | Output value when knob is fully CCW |
| `max` Max | - | float; -1000..1000 step 0.01; default 1; group Scaling | Output value when knob is fully CW |
| `curve` Curve | - | enum; Linear=linear, Logarithmic=logarithmic, Exponential=exponential; default linear; group Scaling | Response curve for the knob |

### LED `led_output`

<a id="user-io-led-ledoutput"></a>

LED control output

Class: `inline::LEDOutput`  
Parameters: 2; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `pin` Pin | - | int; 0..31 step 1; default 0; group Main | GPIO pin number |
| `pwm` PWM Mode | - | bool; default false; group Main | Enable PWM for brightness control |

### MIDI CC `midi_cc`

<a id="user-io-midi-cc-midicc"></a>

MIDI Control Change input

Class: `inline::MidiCC`  
Parameters: 2; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `channel` Channel | - | int; 1..16 step 1; default 1; group Main | MIDI channel (1-16) |
| `cc_number` CC# | - | int; 0..127 step 1; default 1; group Main | CC number (0-127) |

### MIDI NOTE `midi_note`

<a id="user-io-midi-note-midinote"></a>

MIDI note input with pitch, velocity, and gate

Class: `inline::MidiNote`  
Parameters: 1; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `channel` Channel | - | int; 1..16 step 1; default 1; group Main | MIDI channel (1-16) |

### SLIDER `slider`

<a id="user-io-slider-slider"></a>

Hardware slider/fader input

Class: `Slider`  
Parameters: 4; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `channel` Channel | - | enum; ADC 0=0, ADC 1=1, ADC 2=2, ADC 3=3, ADC 4=4, ADC 5=5, ADC 6=6, ADC 7=7; default 0; group Hardware | ADC channel the slider is connected to |
| `min` Min | - | float; -1000..1000 step 0.01; default 0; group Scaling | Output value when slider is at minimum |
| `max` Max | - | float; -1000..1000 step 0.01; default 1; group Scaling | Output value when slider is at maximum |
| `curve` Curve | - | enum; Linear=linear, Logarithmic=logarithmic, Exponential=exponential; default linear; group Scaling | Response curve for the slider |

### SWITCH `switch`

<a id="user-io-switch-switch"></a>

Hardware switch input

Class: `Switch`  
Parameters: 1; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `channel` Channel | - | enum; Switch 1=0, Switch 2=1, Switch 3=2, Switch 4=3; default 0; group Hardware | Hardware switch channel |

## Math

### 1/x `reciprocal`

<a id="math-1x-reciprocal"></a>

Reciprocal (1/x)

Class: `DVPE_Reciprocal`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### ABS `abs`

<a id="math-abs-abs"></a>

Absolute value of input

Class: `Abs`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### ATAN2 `atan2`

<a id="math-atan2-atan2"></a>

Arctangent 2 function

Class: `DVPE_Atan2`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### CENTS -> RATIO `cents_to_ratio`

<a id="math-cents---ratio-centstoratio"></a>

Cents to Frequency Ratio

Class: `DVPE_CentsToRatio`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### COS `cos`

<a id="math-cos-cos"></a>

Cosine function

Class: `DVPE_Cos`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### D/dt `derivative`

<a id="math-ddt-derivative"></a>

Derivative

Class: `DVPE_Derivative`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### EXP `exp`

<a id="math-exp-exp"></a>

Exponential (e^x)

Class: `Exp`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### Hz -> MIDI `freq_to_midi`

<a id="math-hz---midi-freqtomidi"></a>

Frequency to MIDI Note

Class: `DVPE_FreqToMidi`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### INTEGRAL `integral`

<a id="math-integral-integral"></a>

Integral

Class: `DVPE_Integral`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### LERP `lerp`

<a id="math-lerp-lerp"></a>

Linear Interpolation

Class: `DVPE_Lerp`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### LOG `log`

<a id="math-log-log"></a>

Natural Logarithm (ln)

Class: `DVPE_Log`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### MIDI -> Hz `midi_to_freq`

<a id="math-midi---hz-miditofreq"></a>

MIDI Note to Frequency

Class: `DVPE_MidiToFreq`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### POW `pow`

<a id="math-pow-pow"></a>

Power function

Class: `DVPE_Pow`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### POW2 `pow2`

<a id="math-pow2-pow2"></a>

Power of 2 (2^x)

Class: `Pow2`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### SIN `sin`

<a id="math-sin-sin"></a>

Sine function

Class: `DVPE_Sin`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### SQRT `sqrt`

<a id="math-sqrt-sqrt"></a>

Square Root

Class: `DVPE_Sqrt`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### TAN `tan`

<a id="math-tan-tan"></a>

Tangent function

Class: `DVPE_Tan`  
Parameters: 0; CV-controllable: 0

Parameters: none.


## Utility

### < `less`

<a id="utility--less"></a>

Less Than

Class: `DVPE_Less`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### > `greater`

<a id="utility--greater"></a>

Greater Than

Class: `DVPE_Greater`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### 4-STATE FSM `fsm_4`

<a id="utility-4-state-fsm-fsm4"></a>

Fixed 4-state finite state machine with configurable transitions

Class: `DVPE_FSM4`  
Parameters: 8; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `s1_next` S1 Next | - | enum; Stay S1=1, Go S2=2, Go S3=3, Go S4=4; default 2; group State 1 | Next state when S1 condition met |
| `s1_condition` S1 Condition | - | enum; Always (on clock)=0, Input A > 0.5=1, Input B > 0.5=2, Input A < 0.5=3, Input B < 0.5=4; default 0; group State 1 | Condition to trigger transition |
| `s2_next` S2 Next | - | enum; Go S1=1, Stay S2=2, Go S3=3, Go S4=4; default 3; group State 2 | Next state when S2 condition met |
| `s2_condition` S2 Condition | - | enum; Always (on clock)=0, Input A > 0.5=1, Input B > 0.5=2, Input A < 0.5=3, Input B < 0.5=4; default 0; group State 2 | Condition to trigger transition |
| `s3_next` S3 Next | - | enum; Go S1=1, Go S2=2, Stay S3=3, Go S4=4; default 4; group State 3 | Next state when S3 condition met |
| `s3_condition` S3 Condition | - | enum; Always (on clock)=0, Input A > 0.5=1, Input B > 0.5=2, Input A < 0.5=3, Input B < 0.5=4; default 0; group State 3 | Condition to trigger transition |
| `s4_next` S4 Next | - | enum; Go S1=1, Go S2=2, Go S3=3, Stay S4=4; default 1; group State 4 | Next state when S4 condition met |
| `s4_condition` S4 Condition | - | enum; Always (on clock)=0, Input A > 0.5=1, Input B > 0.5=2, Input A < 0.5=3, Input B < 0.5=4; default 0; group State 4 | Condition to trigger transition |

### ADD `add`

<a id="utility-add-add"></a>

Adds up to 4 signals together

Class: `Add`  
Parameters: 1; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `inputCount` Inputs | - | enum; 2 Inputs=2, 3 Inputs=3, 4 Inputs=4; default 4; group Main | Number of active input ports |

### AND `logic_and`

<a id="utility-and-logicand"></a>

Logical AND

Class: `DVPE_And`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### ARPEGGIATOR `arpeggiator`

<a id="utility-arpeggiator-arpeggiator"></a>

MIDI Arpeggiator that sequences held notes.

Class: `SimpleArpeggiator`  
Parameters: 3; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `mode` Mode | - | enum; Up=0, Down=1, Up/Down=2, Random=3, As Played=4; default 0 | Note sequence pattern |
| `octave_range` Octaves | - | int; 1..4 step 1; default 1 | Number of octaves to span |
| `gate_length` Gate Len | - | float; 0.1..1; default 0.5 | Gate duration relative to clock step (0.1=Staccato, 1.0=Legato) |

### BALANCE `balance`

<a id="utility-balance-balance"></a>

Stereo balance control

Class: `inline::Balance`  
Parameters: 1; CV-controllable: 1

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `balance` Balance | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Stereo balance (0=left, 1=right) |

### BLACKMAN `window_blackman`

<a id="utility-blackman-windowblackman"></a>

Blackman Window

Class: `DVPE_WindowBlackman`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### BYPASS `bypass`

<a id="utility-bypass-bypass"></a>

Pass-through utility / Mute

Class: `Bypass`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### CLAMP `clamp`

<a id="utility-clamp-clamp"></a>

Constrain signal to range

Class: `DVPE_Clamp`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### COUNT `counter`

<a id="utility-count-counter"></a>

Counter

Class: `DVPE_Counter`  
Parameters: 1; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `max` Max | - | float; 1..1000 step 1; default 10 | - |

### CROSSFADE `crossfade`

<a id="utility-crossfade-crossfade"></a>

Smooth crossfade between two signals

Class: `daisysp::CrossFade`  
Parameters: 1; CV-controllable: 1

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `pos` Position | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Crossfade position (0=A, 1=B) |

### CVâ†’FREQ `cvtofreq`

<a id="utility-cvfreq-cvtofreq"></a>

Converts 1V/oct CV to frequency

Class: `CvToFreq`  
Parameters: 1; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `base_freq` Base Freq | - | float; 20..2000 Hz step 0.01 logarithmic; default 261.63; group Main | Base frequency at CV=0 (default: C4) |

### D Latch `d_latch`

<a id="utility-d-latch-dlatch"></a>

D Latch

Class: `DVPE_DLatch`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### dB -> LIN `db_to_linear`

<a id="utility-db---lin-dbtolinear"></a>

Decibels to Linear conversion

Class: `DVPE_DbToLinear`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### DEMUX `demux`

<a id="utility-demux-demux"></a>

Routes input to one of 4 outputs

Class: `Demux`  
Parameters: 2; CV-controllable: 1

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `outputCount` Outputs | - | enum; 2 Outputs=2, 3 Outputs=3, 4 Outputs=4; default 4; group Main | Number of available output ports |
| `select` Select | **CV** | int; 0..3 step 1; default 0; group Main | Select which output (0-3) |

### DIVIDE `divide`

<a id="utility-divide-divide"></a>

Divides first signal by second (protected)

Class: `Divide`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### EQUALS `equals`

<a id="utility-equals-equals"></a>

Equality Check

Class: `DVPE_Equals`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### FALL `edge_fall`

<a id="utility-fall-edgefall"></a>

Falling Edge Detector

Class: `DVPE_EdgeFall`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### GAIN `gain`

<a id="utility-gain-gain"></a>

Simple gain/attenuation control

Class: `Gain`  
Parameters: 1; CV-controllable: 1

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `gain` Gain | **CV** | float; 0..4 step 0.01; default 1; group Main | Gain multiplier (0 = silence, 1 = unity, >1 = boost) |

### GATE LEN `gate_length`

<a id="utility-gate-len-gatelength"></a>

Gate Length

Class: `DVPE_GateLength`  
Parameters: 1; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `length` Length (s) | - | float; 0.001..10; default 0.1 | - |

### HAMMING `window_hamming`

<a id="utility-hamming-windowhamming"></a>

Hamming Window

Class: `DVPE_WindowHamming`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### HANN `window_hann`

<a id="utility-hann-windowhann"></a>

Hann Window

Class: `DVPE_WindowHann`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### LIN -> dB `linear_to_db`

<a id="utility-lin---db-lineartodb"></a>

Linear to Decibels conversion

Class: `DVPE_LinearToDb`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### LOOPER `looper`

<a id="utility-looper-looper"></a>

Multimode audio looper with buffering.

Class: `daisysp::Looper`  
Parameters: 3; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `mode` Mode | - | int; 0..3 step 1; default 0; group Main | Looping mode (0: Normal, 1: Onetime Dub, 2: Replace, 3: Frippertronics) |
| `reverse` Reverse | - | bool; default false; group Playback | Play in reverse |
| `half_speed` Half Speed | - | bool; default false; group Playback | Play at half speed |

### M/S DEC `mid_side_decode`

<a id="utility-ms-dec-midsidedecode"></a>

Mid/Side Decoder

Class: `DVPE_MidSideDecode`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### M/S ENC `mid_side_encode`

<a id="utility-ms-enc-midsideencode"></a>

Mid/Side Encoder

Class: `DVPE_MidSideEncode`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### MAP `range_map`

<a id="utility-map-rangemap"></a>

Map signal from one range to another

Class: `DVPE_RangeMap`  
Parameters: 4; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `in_min` In Min | - | float; default 0 | Input minimum |
| `in_max` In Max | - | float; default 1 | Input maximum |
| `out_min` Out Min | - | float; default 0 | Output minimum |
| `out_max` Out Max | - | float; default 1 | Output maximum |

### MAX `max`

<a id="utility-max-max"></a>

Maximum of two signals

Class: `DVPE_Max`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### MERGE `merger`

<a id="utility-merge-merger"></a>

Signal Merger

Class: `DVPE_Merger`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### METRO `metro`

<a id="utility-metro-metro"></a>

BPM clock / metronome

Class: `daisysp::Metro`  
Parameters: 1; CV-controllable: 1

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `freq` Frequency | **CV** | float; 0.1..50 Hz step 0.01; default 2; group Main | Clock frequency in Hz |

### MIN `min`

<a id="utility-min-min"></a>

Minimum of two signals

Class: `DVPE_Min`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### MIXER `mixer`

<a id="utility-mixer-mixer"></a>

4-channel audio mixer with individual level controls

Class: `Mixer`  
Parameters: 6; CV-controllable: 5

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `inputCount` Inputs | - | enum; 2 Inputs=2, 3 Inputs=3, 4 Inputs=4; default 4; group Main | Number of active input channels |
| `level_1` Level 1 | **CV** | float; 0..1 step 0.01; default 1; group Levels | Level for input 1 |
| `level_2` Level 2 | **CV** | float; 0..1 step 0.01; default 1; group Levels | Level for input 2 |
| `level_3` Level 3 | **CV** | float; 0..1 step 0.01; default 1; group Levels | Level for input 3 |
| `level_4` Level 4 | **CV** | float; 0..1 step 0.01; default 1; group Levels | Level for input 4 |
| `master` Master | **CV** | float; 0..1 step 0.01; default 1; group Output | Master output level |

### MODULO `modulo`

<a id="utility-modulo-modulo"></a>

Modulo (remainder) operation

Class: `DVPE_Modulo`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### MULTIPLY `multiply`

<a id="utility-multiply-multiply"></a>

Multiplies two signals together

Class: `Multiply`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### MUX `mux`

<a id="utility-mux-mux"></a>

Selects one of 4 inputs to pass to output

Class: `Mux`  
Parameters: 2; CV-controllable: 1

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `inputCount` Inputs | - | enum; 2 Inputs=2, 3 Inputs=3, 4 Inputs=4; default 4; group Main | Number of available input ports |
| `select` Select | **CV** | int; 0..3 step 1; default 0; group Main | Select which input (0-3) |

### NEGATE `negate`

<a id="utility-negate-negate"></a>

Invert signal polarity

Class: `DVPE_Negate`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### NOT `logic_not`

<a id="utility-not-logicnot"></a>

Logical NOT

Class: `DVPE_Not`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### NOT EQ `not_equals`

<a id="utility-not-eq-notequals"></a>

Inequality Check

Class: `DVPE_NotEquals`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### OFFSET `offset`

<a id="utility-offset-offset"></a>

Add DC offset to signal

Class: `DVPE_Offset`  
Parameters: 1; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `amount` Amount | - | float; default 0 | DC offset amount |

### OLA `overlap_add`

<a id="utility-ola-overlapadd"></a>

Overlap-Add

Class: `DVPE_OverlapAdd`  
Parameters: 1; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `hop_size` Hop | - | int; 64..512 step 64; default 256 | - |

### OR `logic_or`

<a id="utility-or-logicor"></a>

Logical OR

Class: `DVPE_Or`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### PAN `pan`

<a id="utility-pan-pan"></a>

Mono to stereo panning

Class: `inline::Pan`  
Parameters: 1; CV-controllable: 1

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `pan` Pan | **CV** | float; 0..1 step 0.01; default 0.5; group Main | Pan position (0=left, 1=right) |

### QUANTIZE `quantize`

<a id="utility-quantize-quantize"></a>

Quantize signal to discrete steps

Class: `DVPE_Quantize`  
Parameters: 1; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `step` Step | - | float; default 0.1 | Quantization step size |

### Ring Buffer `ring_buffer`

<a id="utility-ring-buffer-ringbuffer"></a>

Ring Buffer

Class: `DVPE_RingBuffer`  
Parameters: 1; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `size` Size | - | int; 1..1024 step 1; default 16 | - |

### RISE `edge_rise`

<a id="utility-rise-edgerise"></a>

Rising Edge Detector

Class: `DVPE_EdgeRise`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### S&H `sample_hold`

<a id="utility-sh-samplehold"></a>

Dual mode Sample & Hold / Track & Hold module.

Class: `daisysp::SampleHold`  
Parameters: 1; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `mode` Mode | - | int; 0..1 step 1; default 0; group Settings | 0: Sample & Hold, 1: Track & Hold |

### SCALE `scale`

<a id="utility-scale-scale"></a>

Multiply signal by a factor

Class: `DVPE_Scale`  
Parameters: 1; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `factor` Factor | - | float; default 1 | Multiplication factor |

### SCHMITT `schmitt_trigger`

<a id="utility-schmitt-schmitttrigger"></a>

Schmitt Trigger

Class: `DVPE_Schmitt`  
Parameters: 2; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `thresh_high` High | - | float; 0..1; default 0.8 | - |
| `thresh_low` Low | - | float; 0..1; default 0.2 | - |

### SELECT `select`

<a id="utility-select-select"></a>

Select between two inputs based on Gate

Class: `DVPE_Select`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### SIGN `sign`

<a id="utility-sign-sign"></a>

Extract sign of signal

Class: `DVPE_Sign`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### SLEW `slew`

<a id="utility-slew-slew"></a>

Slew rate limiter with separate rise/fall times

Class: `inline::Slew`  
Parameters: 2; CV-controllable: 2

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `rise` Rise | **CV** | float; 0.001..1 s step 0.001 logarithmic; default 0.01; group Main | Rise time (attack) |
| `fall` Fall | **CV** | float; 0.001..1 s step 0.001 logarithmic; default 0.01; group Main | Fall time (decay) |

### SMOOTH `smooth`

<a id="utility-smooth-smooth"></a>

Signal smoothing filter

Class: `inline::Smooth`  
Parameters: 1; CV-controllable: 1

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `smooth` Smoothing | **CV** | float; 0..0.9999 step 0.001; default 0.99; group Main | Smoothing amount (higher = slower) |

### SPLIT `splitter`

<a id="utility-split-splitter"></a>

Signal Splitter

Class: `DVPE_Splitter`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### SR Latch `sr_latch`

<a id="utility-sr-latch-srlatch"></a>

SR Latch

Class: `DVPE_SRLatch`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### ST MIXER `stereo_mixer`

<a id="utility-st-mixer-stereomixer"></a>

4-channel stereo mixer with pan controls

Class: `inline::StereoMixer`  
Parameters: 8; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `ch1_level` Ch1 Level | - | float; 0..1 step 0.01; default 0.8; group Channel 1 | Channel 1 level |
| `ch1_pan` Ch1 Pan | - | float; 0..1 step 0.01; default 0.5; group Channel 1 | Channel 1 pan |
| `ch2_level` Ch2 Level | - | float; 0..1 step 0.01; default 0.8; group Channel 2 | Channel 2 level |
| `ch2_pan` Ch2 Pan | - | float; 0..1 step 0.01; default 0.5; group Channel 2 | Channel 2 pan |
| `ch3_level` Ch3 Level | - | float; 0..1 step 0.01; default 0.8; group Channel 3 | Channel 3 level |
| `ch3_pan` Ch3 Pan | - | float; 0..1 step 0.01; default 0.5; group Channel 3 | Channel 3 pan |
| `ch4_level` Ch4 Level | - | float; 0..1 step 0.01; default 0.8; group Channel 4 | Channel 4 level |
| `ch4_pan` Ch4 Pan | - | float; 0..1 step 0.01; default 0.5; group Channel 4 | Channel 4 pan |

### STEP SEQ `step_sequencer`

<a id="utility-step-seq-stepsequencer"></a>

16-step 4-track pattern sequencer

Class: `StepSequencer`  
Parameters: 3; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `trackSelect` Track | - | int; 0..3 step 1; default 0; group Main | Select track to edit (0-3) |
| `tempo` Tempo | - | float; 40..240 BPM step 0.1; default 120; group Main | Internal tempo (if no clock connected) |
| `swing` Swing | - | float; 0..1 step 0.01; default 0; group Main | Swing/shuffle amount |

### STEREO PAN `stereoPan`

<a id="utility-stereo-pan-stereopan"></a>

Stereo panning with tangent law (DAFX)

Class: `daisysp::StereoPan`  
Parameters: 2; CV-controllable: 1

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `pan` Pan | **CV** | float; -1..1 step 0.01; default 0; group Position | Pan position (-1 = left, 0 = center, +1 = right) |
| `speakerAngle` Angle | - | float; 0..60 Â° step 1; default 30; group Position | Loudspeaker base angle |

### SUBTRACT `subtract`

<a id="utility-subtract-subtract"></a>

Subtracts second signal from first

Class: `Subtract`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### TOGGLE `toggle`

<a id="utility-toggle-toggle"></a>

Toggle Switch

Class: `DVPE_Toggle`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### VCA `vca`

<a id="utility-vca-vca"></a>

Voltage Controlled Amplifier for dynamic amplitude control

Class: `VCA`  
Parameters: 1; CV-controllable: 1

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `gain` Gain | **CV** | float; 0..2 step 0.01; default 1; group Main | Base gain multiplier for the input signal |

### WT READ `wavetable_read`

<a id="utility-wt-read-wavetableread"></a>

Wavetable Read

Class: `DVPE_WavetableRead`  
Parameters: 1; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `size` Size | - | int; 2..256 step 1; default 256 | - |

### WT WRITE `wavetable_write`

<a id="utility-wt-write-wavetablewrite"></a>

Wavetable Write

Class: `DVPE_WavetableWrite`  
Parameters: 1; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `size` Size | - | int; 2..256 step 1; default 256 | - |

### XOR `logic_xor`

<a id="utility-xor-logicxor"></a>

Logical XOR

Class: `DVPE_Xor`  
Parameters: 0; CV-controllable: 0

Parameters: none.

### Yin Pitch `yin_pitch`

<a id="utility-yin-pitch-yinpitch"></a>

DAFX YIN Pitch Detection Algorithm

Class: `daisysp::Yin1024`  
Parameters: 2; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `freq_min` Freq Min | - | float; 20..200 Hz step 1; default 50 | - |
| `freq_max` Freq Max | - | float; 200..2000 Hz step 10; default 500 | - |

### Zâ»Â¹ `sampledelay`

<a id="utility-z-sampledelay"></a>

Single sample delay (zâ»Â¹)

Class: `SampleDelay`  
Parameters: 1; CV-controllable: 0

| Parameter | CV | Type / range / default | Description |
|---|---:|---|---|
| `delay_samples` Delay | - | int; 1..1000 step 1; default 1; group Main | Delay in samples |

### ZERO X `zero_crossing`

<a id="utility-zero-x-zerocrossing"></a>

Zero Crossing Detector

Class: `DVPE_ZeroCrossing`  
Parameters: 0; CV-controllable: 0

Parameters: none.


