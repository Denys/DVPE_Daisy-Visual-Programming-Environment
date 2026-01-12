/**
 * ADSR Envelope Block Definition
 * daisysp::Adsr - Attack-Decay-Sustain-Release envelope generator
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

export const AdsrBlock: BlockDefinition = {
  // Identity
  id: 'adsr',
  className: 'daisysp::Adsr',
  displayName: 'ADSR ENVELOPE',
  category: BlockCategory.MODULATORS,

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
      id: 'attack',
      displayName: 'Attack',
      type: ParameterType.FLOAT,
      cppSetter: 'SetTime',
      defaultValue: 0.01,
      range: {
        min: 0.001,
        max: 10.0,
        step: 0.001,
        curve: ParameterCurve.LOGARITHMIC,
      },
      unit: 's',
      cvModulatable: true,
      group: 'Envelope',
      description: 'Attack time - how quickly the envelope reaches peak level',
    },
    {
      id: 'decay',
      displayName: 'Decay',
      type: ParameterType.FLOAT,
      cppSetter: 'SetTime',
      defaultValue: 0.1,
      range: {
        min: 0.001,
        max: 10.0,
        step: 0.001,
        curve: ParameterCurve.LOGARITHMIC,
      },
      unit: 's',
      cvModulatable: true,
      group: 'Envelope',
      description: 'Decay time - how quickly the envelope falls to sustain level',
    },
    {
      id: 'sustain',
      displayName: 'Sustain',
      type: ParameterType.FLOAT,
      cppSetter: 'SetSustainLevel',
      defaultValue: 0.7,
      range: {
        min: 0.0,
        max: 1.0,
        step: 0.01,
        curve: ParameterCurve.LINEAR,
      },
      group: 'Envelope',
      cvModulatable: true,
      description: 'Sustain level - held while gate is high',
    },
    {
      id: 'release',
      displayName: 'Release',
      type: ParameterType.FLOAT,
      cppSetter: 'SetTime',
      defaultValue: 0.3,
      range: {
        min: 0.001,
        max: 10.0,
        step: 0.001,
        curve: ParameterCurve.LOGARITHMIC,
      },
      unit: 's',
      cvModulatable: true,
      group: 'Envelope',
      description: 'Release time - how quickly the envelope falls to zero after gate release',
    },
  ],

  // Ports
  ports: [
    {
      id: 'gate',
      displayName: 'GATE',
      signalType: SignalType.TRIGGER,
      direction: PortDirection.INPUT,
      cppParam: 'gate',
      description: 'Gate input - high triggers attack, low triggers release',
    },
    {
      id: 'attack_cv',
      displayName: 'ATK CV',
      signalType: SignalType.CV,
      direction: PortDirection.INPUT,
      description: 'Attack time modulation',
    },
    {
      id: 'decay_cv',
      displayName: 'DEC CV',
      signalType: SignalType.CV,
      direction: PortDirection.INPUT,
      description: 'Decay time modulation',
    },
    {
      id: 'sustain_cv',
      displayName: 'SUS CV',
      signalType: SignalType.CV,
      direction: PortDirection.INPUT,
      description: 'Sustain level modulation',
    },
    {
      id: 'release_cv',
      displayName: 'REL CV',
      signalType: SignalType.CV,
      direction: PortDirection.INPUT,
      description: 'Release time modulation',
    },
    {
      id: 'out',
      displayName: 'OUT',
      signalType: SignalType.CV,
      direction: PortDirection.OUTPUT,
      cppMethod: 'Process',
      description: 'Envelope output (0-1)',
    },
  ],

  // Visual
  colorScheme: BlockColorScheme.CONTROL,
  icon: 'TrendingUp',

  // Documentation
  description: 'ADSR envelope generator for amplitude and modulation control',
  documentation: `
The ADSR (Attack-Decay-Sustain-Release) envelope is a fundamental modulation 
source in synthesizers. It generates a control signal that shapes the 
amplitude or timbre of sounds over time.

Stages:
- Attack: Time to rise from 0 to peak (1.0) when gate goes high
- Decay: Time to fall from peak to sustain level
- Sustain: Level held while gate remains high
- Release: Time to fall from sustain to 0 when gate goes low

Common uses:
- Amplitude envelope (connect OUT to VCA CV input)
- Filter envelope (connect OUT to filter FREQ_CV)
- Pitch envelope (connect OUT to oscillator FREQ_CV)

The gate input should be a boolean signal - typically from a keyboard,
MIDI note, or trigger generator.
  `.trim(),
};
