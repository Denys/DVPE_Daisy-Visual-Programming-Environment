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
