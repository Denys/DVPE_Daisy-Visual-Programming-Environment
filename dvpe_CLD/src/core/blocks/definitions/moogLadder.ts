/**
 * Moog Ladder Filter Block Definition
 * daisysp::MoogLadder - Classic 24dB/oct ladder filter
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

export const MoogLadderBlock: BlockDefinition = {
  // Identity
  id: 'moog_ladder',
  className: 'daisysp::MoogLadder',
  displayName: 'MOOG LADDER',
  category: BlockCategory.FILTERS,

  // C++ Code Generation
  headerFile: 'daisysp.h',
  namespace: 'daisysp',
  initMethod: 'Init',
  initParams: ['sample_rate'],
  processMethod: 'Process',
  processReturnType: 'float',

  // Parameters
  parameters: [
    {
      id: 'freq',
      displayName: 'Cutoff',
      type: ParameterType.FLOAT,
      cppSetter: 'SetFreq',
      defaultValue: 1000.0,
      range: {
        min: 20.0,
        max: 20000.0,
        step: 1.0,
        curve: ParameterCurve.LOGARITHMIC,
      },
      unit: 'Hz',
      cvModulatable: true,
      group: 'Main',
      description: 'Filter cutoff frequency',
    },
    {
      id: 'res',
      displayName: 'Resonance',
      type: ParameterType.FLOAT,
      cppSetter: 'SetRes',
      defaultValue: 0.4,
      range: {
        min: 0.0,
        max: 1.0,
        step: 0.01,
        curve: ParameterCurve.LINEAR,
      },
      cvModulatable: true,
      group: 'Main',
      description: 'Filter resonance (self-oscillation at high values)',
    },
  ],

  // Ports
  ports: [
    {
      id: 'in',
      displayName: 'IN',
      signalType: SignalType.AUDIO,
      direction: PortDirection.INPUT,
      cppParam: 'in',
      description: 'Audio input',
    },
    {
      id: 'freq_cv',
      displayName: 'FREQ CV',
      signalType: SignalType.CV,
      direction: PortDirection.INPUT,
      description: 'Cutoff frequency modulation input',
    },
    {
      id: 'res_cv',
      displayName: 'RES CV',
      signalType: SignalType.CV,
      direction: PortDirection.INPUT,
      description: 'Resonance modulation input',
    },
    {
      id: 'out',
      displayName: 'OUT',
      signalType: SignalType.AUDIO,
      direction: PortDirection.OUTPUT,
      cppMethod: 'Process',
      description: 'Filtered audio output',
    },
  ],

  // Visual
  colorScheme: BlockColorScheme.AUDIO,
  icon: 'Filter',

  // Documentation
  description: '24dB/oct ladder filter with classic Moog character',
  documentation: `
The MoogLadder filter provides the warm, musical filtering characteristic 
of the classic Moog synthesizer ladder filter design.

Features:
- 24dB/octave lowpass slope
- Self-oscillation at high resonance settings
- Smooth frequency response

Typical usage:
- Connect an oscillator to the IN port
- Modulate the FREQ_CV with an envelope for filter sweeps
- Use resonance to add harmonic emphasis
  `.trim(),
};
