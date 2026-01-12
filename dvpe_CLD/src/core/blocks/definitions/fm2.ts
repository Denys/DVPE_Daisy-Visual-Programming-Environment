/**
 * FM2 Block Definition
 * daisysp::Fm2 - 2-operator FM synthesis oscillator
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

export const Fm2Block: BlockDefinition = {
  // Identity
  id: 'fm2',
  className: 'daisysp::Fm2',
  displayName: 'FM2',
  category: BlockCategory.SOURCES,

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
      displayName: 'Frequency',
      type: ParameterType.FLOAT,
      cppSetter: 'SetFrequency',
      defaultValue: 440.0,
      range: {
        min: 20.0,
        max: 20000.0,
        step: 1.0,
        curve: ParameterCurve.LOGARITHMIC,
      },
      unit: 'Hz',
      cvModulatable: true,
      group: 'Carrier',
      description: 'Carrier frequency in Hz',
    },
    {
      id: 'ratio',
      displayName: 'Ratio',
      type: ParameterType.FLOAT,
      cppSetter: 'SetRatio',
      defaultValue: 2.0,
      range: {
        min: 0.0,
        max: 20.0,
        step: 0.01,
        curve: ParameterCurve.LINEAR,
      },
      cvModulatable: true,
      group: 'Modulator',
      description: 'Modulator-to-carrier frequency ratio',
    },
    {
      id: 'index',
      displayName: 'Index',
      type: ParameterType.FLOAT,
      cppSetter: 'SetIndex',
      defaultValue: 1.0,
      range: {
        min: 0.0,
        max: 20.0,
        step: 0.1,
        curve: ParameterCurve.LINEAR,
      },
      cvModulatable: true,
      group: 'Modulator',
      description: 'FM modulation index (depth)',
    },
  ],

  // Ports
  ports: [
    {
      id: 'freq_cv',
      displayName: 'FREQ CV',
      signalType: SignalType.CV,
      direction: PortDirection.INPUT,
      description: 'Frequency modulation input',
    },
    {
      id: 'ratio_cv',
      displayName: 'RATIO CV',
      signalType: SignalType.CV,
      direction: PortDirection.INPUT,
      description: 'Ratio modulation input',
    },
    {
      id: 'index_cv',
      displayName: 'INDEX CV',
      signalType: SignalType.CV,
      direction: PortDirection.INPUT,
      description: 'FM index modulation input',
    },
    {
      id: 'out',
      displayName: 'OUT',
      signalType: SignalType.AUDIO,
      direction: PortDirection.OUTPUT,
      cppMethod: 'Process',
      description: 'Audio output',
    },
  ],

  // Visual
  colorScheme: BlockColorScheme.AUDIO,
  icon: 'Radio',

  // Documentation
  description: '2-operator FM synthesis oscillator',
  documentation: `
Fm2 provides classic 2-operator FM synthesis.
Ratio controls the modulator-to-carrier frequency ratio.
Index controls the modulation depth for harmonic richness.
Higher index values create more complex, metallic timbres.

Common ratios:
- 1:1 = Bell-like tones
- 2:1 = Hollow, woody sounds
- 3:1 = Brass-like sounds
- 7:1 = Metallic, inharmonic tones
  `.trim(),
};
