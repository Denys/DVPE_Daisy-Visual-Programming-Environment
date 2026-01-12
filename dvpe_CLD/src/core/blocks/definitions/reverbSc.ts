/**
 * ReverbSc Block Definition
 * daisysp::ReverbSc - Stereo reverb based on Sean Costello's design
 */

import {
  BlockDefinition,
  BlockCategory,
  BlockColorScheme,
  ParameterType,
  ParameterCurve,
  SignalType,
  PortDirection,
} from '@/types';

export const ReverbScBlock: BlockDefinition = {
  // Identity
  id: 'reverb_sc',
  className: 'daisysp::ReverbSc',
  displayName: 'REVERB',
  category: BlockCategory.EFFECTS,

  // C++ Code Generation
  headerFile: 'daisysp.h',
  namespace: 'daisysp',
  initMethod: 'Init',
  initParams: ['sample_rate'],
  processMethod: 'Process',
  processReturnType: 'void',

  // Parameters
  parameters: [
    {
      id: 'feedback',
      displayName: 'Decay',
      type: ParameterType.FLOAT,
      cppSetter: 'SetFeedback',
      defaultValue: 0.7,
      range: {
        min: 0.0,
        max: 0.99,
        step: 0.01,
        curve: ParameterCurve.LINEAR,
      },
      cvModulatable: true,
      group: 'Main',
      description: 'Reverb decay time / tail length',
    },
    {
      id: 'lpfreq',
      displayName: 'Damping',
      type: ParameterType.FLOAT,
      cppSetter: 'SetLpFreq',
      defaultValue: 10000.0,
      range: {
        min: 500.0,
        max: 18000.0,
        step: 100,
        curve: ParameterCurve.LOGARITHMIC,
      },
      unit: 'Hz',
      cvModulatable: true,
      group: 'Main',
      description: 'Lowpass filter frequency for high-frequency damping',
    },
    {
      id: 'wet_dry',
      displayName: 'Wet/Dry',
      type: ParameterType.FLOAT,
      cppSetter: '',
      defaultValue: 0.3,
      range: {
        min: 0.0,
        max: 1.0,
        step: 0.01,
        curve: ParameterCurve.LINEAR,
      },
      cvModulatable: true,
      group: 'Main',
      description: 'Mix between dry (0) and wet (1) signal',
    },
  ],

  // Ports
  ports: [
    {
      id: 'in_l',
      displayName: 'IN L',
      signalType: SignalType.AUDIO,
      direction: PortDirection.INPUT,
      description: 'Left audio input',
    },
    {
      id: 'in_r',
      displayName: 'IN R',
      signalType: SignalType.AUDIO,
      direction: PortDirection.INPUT,
      description: 'Right audio input',
    },
    {
      id: 'feedback_cv',
      displayName: 'DECAY CV',
      signalType: SignalType.CV,
      direction: PortDirection.INPUT,
      description: 'Decay time modulation input',
    },
    {
      id: 'wet_dry_cv',
      displayName: 'MIX CV',
      signalType: SignalType.CV,
      direction: PortDirection.INPUT,
      description: 'Wet/Dry mix modulation input',
    },
    {
      id: 'lpfreq_cv',
      displayName: 'DAMP CV',
      signalType: SignalType.CV,
      direction: PortDirection.INPUT,
      description: 'Damping frequency modulation input',
    },
    {
      id: 'out_l',
      displayName: 'OUT L',
      signalType: SignalType.AUDIO,
      direction: PortDirection.OUTPUT,
      description: 'Left audio output',
    },
    {
      id: 'out_r',
      displayName: 'OUT R',
      signalType: SignalType.AUDIO,
      direction: PortDirection.OUTPUT,
      description: 'Right audio output',
    },
  ],

  // Visual
  colorScheme: BlockColorScheme.AUDIO,
  icon: 'Sparkles',

  // Code Generation Hints
  requiresSdram: true,

  // Documentation
  description: 'High-quality stereo reverb for ambient and room simulation',
  documentation: `
ReverbSc is a stereo reverb algorithm based on Sean Costello's reverb designs,
known for their smooth, lush character suitable for a wide range of material.

Parameters:
- Decay (Feedback): Controls the reverb tail length. Higher values = longer reverb.
  Keep below 1.0 to prevent infinite reverb.
- Damping (LP Freq): High-frequency rolloff in the reverb tail. Lower values
  create a darker, more natural-sounding decay.
- Wet/Dry: Balance between original and reverberated signal.

Processing signature:
  reverb.Process(inL, inR, &outL, &outR);

Note: This reverb uses internal delay lines that are placed in SDRAM to
accommodate the necessary buffer sizes. The reverb produces true stereo
output even from a mono input.
  `.trim(),
};
