/**
 * Compressor Block Definition
 * daisysp::Compressor - Dynamics processor
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

export const CompressorBlock: BlockDefinition = {
  // Identity
  id: 'compressor',
  className: 'daisysp::Compressor',
  displayName: 'COMPRESSOR',
  category: BlockCategory.EFFECTS,

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
      id: 'threshold',
      displayName: 'Threshold',
      type: ParameterType.FLOAT,
      cppSetter: 'SetThreshold',
      defaultValue: -12.0,
      range: {
        min: -60.0,
        max: 0.0,
        step: 0.5,
        curve: ParameterCurve.LINEAR,
      },
      unit: 'dB',
      cvModulatable: true,
      group: 'Main',
      description: 'Threshold above which compression starts',
    },
    {
      id: 'ratio',
      displayName: 'Ratio',
      type: ParameterType.FLOAT,
      cppSetter: 'SetRatio',
      defaultValue: 4.0,
      range: {
        min: 1.0,
        max: 20.0,
        step: 0.1,
        curve: ParameterCurve.LINEAR,
      },
      unit: ':1',
      cvModulatable: true,
      group: 'Main',
      description: 'Compression ratio (input:output dB above threshold)',
    },
    {
      id: 'attack',
      displayName: 'Attack',
      type: ParameterType.FLOAT,
      cppSetter: 'SetAttack',
      defaultValue: 0.01,
      range: {
        min: 0.001,
        max: 1.0,
        step: 0.001,
        curve: ParameterCurve.LOGARITHMIC,
      },
      unit: 's',
      cvModulatable: true,
      group: 'Envelope',
      description: 'Attack time - how quickly compression engages',
    },
    {
      id: 'release',
      displayName: 'Release',
      type: ParameterType.FLOAT,
      cppSetter: 'SetRelease',
      defaultValue: 0.1,
      range: {
        min: 0.01,
        max: 2.0,
        step: 0.01,
        curve: ParameterCurve.LOGARITHMIC,
      },
      unit: 's',
      cvModulatable: true,
      group: 'Envelope',
      description: 'Release time - how quickly compression disengages',
    },
    {
      id: 'makeup',
      displayName: 'Makeup Gain',
      type: ParameterType.FLOAT,
      cppSetter: 'SetMakeup',
      defaultValue: 0.0,
      range: {
        min: 0.0,
        max: 40.0,
        step: 0.5,
        curve: ParameterCurve.LINEAR,
      },
      unit: 'dB',
      cvModulatable: true,
      group: 'Output',
      description: 'Output gain to compensate for volume reduction',
    },
    {
      id: 'auto_makeup',
      displayName: 'Auto Makeup',
      type: ParameterType.FLOAT,
      cppSetter: 'AutoMakeup',
      defaultValue: 0.0,
      range: {
        min: 0.0,
        max: 1.0,
        step: 0.01,
        curve: ParameterCurve.LINEAR,
      },
      cvModulatable: true,
      group: 'Output',
      description: 'Auto makeup gain (0 = off, 1 = full auto)',
    },
  ],

  // Ports
  ports: [
    {
      id: 'in',
      displayName: 'IN',
      signalType: SignalType.AUDIO,
      direction: PortDirection.INPUT,
      description: 'Audio input',
    },
    {
      id: 'threshold_cv',
      displayName: 'THRESH CV',
      signalType: SignalType.CV,
      direction: PortDirection.INPUT,
      description: 'Threshold modulation',
    },
    {
      id: 'ratio_cv',
      displayName: 'RATIO CV',
      signalType: SignalType.CV,
      direction: PortDirection.INPUT,
      description: 'Ratio modulation',
    },
    {
      id: 'makeup_cv',
      displayName: 'MAKEUP CV',
      signalType: SignalType.CV,
      direction: PortDirection.INPUT,
      description: 'Makeup gain modulation',
    },
    {
      id: 'sidechain',
      displayName: 'SIDECHAIN',
      signalType: SignalType.AUDIO,
      direction: PortDirection.INPUT,
      description: 'External sidechain input (optional)',
    },
    {
      id: 'attack_cv',
      displayName: 'ATK CV',
      signalType: SignalType.CV,
      direction: PortDirection.INPUT,
      description: 'Attack time CV modulation',
    },
    {
      id: 'release_cv',
      displayName: 'REL CV',
      signalType: SignalType.CV,
      direction: PortDirection.INPUT,
      description: 'Release time CV modulation',
    },
    {
      id: 'auto_makeup_cv',
      displayName: 'A-MAKE CV',
      signalType: SignalType.CV,
      direction: PortDirection.INPUT,
      description: 'Auto makeup modulation input',
    },
    {
      id: 'out',
      displayName: 'OUT',
      signalType: SignalType.AUDIO,
      direction: PortDirection.OUTPUT,
      description: 'Compressed audio output',
    },
    {
      id: 'gain_reduction',
      displayName: 'GR',
      signalType: SignalType.CV,
      direction: PortDirection.OUTPUT,
      description: 'Gain reduction amount for metering',
    },
  ],

  // Visual
  colorScheme: BlockColorScheme.AUDIO,
  icon: 'Gauge',

  // Code Generation Hints
  requiresSdram: false,

  // Documentation
  description: 'Dynamics compressor for controlling signal levels',
  documentation: `
The Compressor module provides dynamic range compression to control
audio signal levels and add punch or consistency to your patches.

Parameters:
- Threshold: Signal level (in dB) where compression starts
- Ratio: How much to reduce signals above threshold (4:1 = 4dB in, 1dB out)
- Attack: Time for compression to engage after signal exceeds threshold
- Release: Time for compression to disengage after signal drops
- Makeup Gain: Manual output gain boost to compensate for compression
- Auto Makeup: Calculate makeup gain automatically based on ratio

Features:
- External sidechain input for ducking/pumping effects
- Gain reduction output for visual metering or modulation
- CV modulation of attack and release times

Processing:
  float output = compressor.Process(input);
  // OR with external sidechain:
  float output = compressor.Process(input, sidechainLevel);

Typical settings:
- Gentle glue: Threshold -6dB, Ratio 2:1, Attack 20ms, Release 200ms
- Drum punch: Threshold -12dB, Ratio 4:1, Attack 5ms, Release 100ms
- Limiting: Threshold -1dB, Ratio 20:1, Attack 0.5ms, Release 50ms
  `.trim(),
};
