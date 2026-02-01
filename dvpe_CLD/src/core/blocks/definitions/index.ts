/**
 * Block Definitions Index
 * Exports all DaisySP block definitions (Essential 8 + 12 ported from dvpe)
 */

// === Original Essential 8 ===
export { OscillatorBlock } from './oscillator';
export { MoogLadderBlock } from './moogLadder';
export { AdsrBlock } from './adsr';
export { VcaBlock } from './vca';
export { MixerBlock } from './mixer';
export { DelayLineBlock } from './delayLine';
export { ReverbScBlock } from './reverbSc';
export { CompressorBlock } from './compressor';

// === Ported from dvpe: Sources ===
export { Fm2Block } from './fm2';
export { ParticleBlock } from './particle';
export { GrainletOscillatorBlock } from './grainletOscillator';

// === Ported from dvpe: Filters ===
export { SvfBlock } from './svf';

// === Ported from dvpe: Modulators ===
export { AdEnvBlock } from './adEnv';

// === Ported from dvpe: Effects ===
export { OverdriveBlock } from './overdrive';

// === Phase 1: Core DSP ===
export { LfoBlock } from './lfo';
export { WhiteNoiseBlock } from './whiteNoise';
export { ChorusBlock } from './chorus';
export { FlangerBlock } from './flanger';
export { OnePoleBlock } from './onePole';
export { AToneBlock } from './atone';
export { DcBlockBlock } from './dcBlock';
export { LimiterBlock } from './limiter';
export { FoldBlock } from './fold';

// === Phase 2: Math & Utility ===
export { AddBlock } from './add';
export { MultiplyBlock } from './multiply';
export { SubtractBlock } from './subtract';
export { DivideBlock } from './divide';
export { GainBlock } from './gain';
export { BypassBlock } from './bypass';
export { SampleDelayBlock } from './sampleDelay';
export { CvToFreqBlock } from './cvToFreq';
export { MuxBlock } from './mux';
export { DemuxBlock } from './demux';
export { LinearVcaBlock } from './linearVca';

// === Ported from dvpe: User I/O ===
export { AudioInputBlock } from './audioInput';
export { AudioOutputBlock } from './audioOutput';
export { GateTriggerInBlock } from './gateTriggerIn';
export { KnobBlock } from './knob';
export { EncoderBlock } from './encoder';
export { KeyBlock } from './key';

// === Phase 3: Drums ===
export { HiHatBlock } from './hihat';
export { AnalogBassDrumBlock } from './analogBassDrum';
export { AnalogSnareDrumBlock } from './analogSnareDrum';
export { SynthBassDrumBlock } from './synthBassDrum';
export { SynthSnareDrumBlock } from './synthSnareDrum';

// === Phase 3: Physical Modeling & Effects ===
export { DripBlock } from './drip';
export { ModalVoiceBlock } from './modalVoice';
export { StringVoiceBlock } from './stringVoice';
export { WavefolderBlock } from './wavefolder';
export { DustBlock } from './dust';

// === Phase 4A: Advanced Effects ===
export { DecimatorBlock } from './decimator';
export { PhaserBlock } from './phaser';
export { TremoloBlock } from './tremolo';
export { AutowahBlock } from './autowah';
export { ResonatorBlock } from './resonator';
export { PluckBlock } from './pluck';
export { CrossFadeBlock } from './crossfade';
export { SampleRateReducerBlock } from './sampleRateReducer';

// === Phase 4B: Inline Utilities ===
export { PanBlock } from './pan';
export { BalanceBlock } from './balance';
export { SoftClipBlock } from './softClip';
export { HardClipBlock } from './hardClip';
export { RectifierBlock } from './rectifier';
export { SlewBlock } from './slew';
export { SmoothBlock } from './smooth';
export { GateBlock } from './gate';

// === Phase 4C: Complex Blocks ===
export { BitcrushBlock } from './bitcrush';
export { DistortionBlock } from './distortion';
export { StereoMixerBlock } from './stereoMixer';
export { PitchShifterBlock } from './pitchShifter';

// === Phase 5: Hardware I/O ===
export { MidiNoteBlock } from './midiNote';
export { MidiCCBlock } from './midiCC';
export { CVInputBlock } from './cvInput';
export { CVOutputBlock } from './cvOutput';
export { GateOutputBlock } from './gateOutput';
export { LEDOutputBlock } from './ledOutput';

// === Phase 12: New Features ===
export { SliderBlock } from './slider';
export { SwitchBlock } from './switch';
export { AbsBlock } from './abs';
export { ExpBlock } from './exp';
export { Pow2Block } from './pow2';
export { DcSourceBlock } from './dcSource';
export { MetroBlock } from './metro';
export { StepSequencerBlock } from './stepSequencer';

// === DAFX Integration: Phase 1 ===
export { TubeBlock } from './tube';
export { WahWahBlock } from './wahwah';
export { ToneStackBlock } from './toneStack';
export { LowShelvingBlock } from './lowShelving';
export { HighShelvingBlock } from './highShelving';
export { PeakFilterBlock } from './peakFilter';
export { NoiseGateBlock } from './noiseGate';

// === DAFX Integration: Phase 2 ===
export { VibratoBlock } from './vibrato';
export { RingModulatorBlock } from './ringModulator';
export { FdnReverbBlock } from './fdnReverb';
export { StereoPanBlock } from './stereoPan';

// === DAFX Integration: Phase 3 ===
export { UniversalCombBlock } from './universalComb';
export { LpIirCombBlock } from './lpIirComb';
export { PhaseVocoderPitchBlock } from './phaseVocoderPitch';

// === DAFX Integration: Phase 4 ===
export { compressorExpander as CompressorExpanderBlock } from './compressorExpander';
export { solaTimeStretch as SolaTimeStretchBlock } from './solaTimeStretch';
export { crosstalkCanceller as CrosstalkCancellerBlock } from './crosstalkCanceller';
export { robotization as RobotizationBlock } from './robotization';
export { whisperization as WhisperizationBlock } from './whisperization';
export { yinPitch as YinPitchBlock } from './yinPitch';


// === DAFX Integration: Phase 12 (New) ===
export { ArpeggiatorBlock } from './arpeggiator';

// === Synthesis Blocks (DaisySP Gap Fill) ===
export { FormantOscillatorBlock } from './formantOscillator';
export { VosimOscillatorBlock } from './vosimOscillator';
export { VariableShapeOscillatorBlock } from './variableShapeOscillator';
export { HarmonicOscillatorBlock } from './harmonicOscillator';
export { OscillatorBankBlock } from './oscillatorBank';
export { VariableSawOscillatorBlock } from './variableSawOscillator';
export { ZOscillatorBlock } from './zOscillator';

// === Remaining DaisySP Blocks ===
export { PhasorBlock } from './phasor';
export { SampleHoldBlock } from './sampleHold';
export { ClockedNoiseBlock } from './clockedNoise';
export { LooperBlock } from './looper';

// === Phase 13.1: Utility Blocks ===
export * from './utility';
