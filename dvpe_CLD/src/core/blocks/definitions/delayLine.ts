/**
 * DelayLine Block Definition
 * daisysp::DelayLine - Variable delay with feedback
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

export const DelayLineBlock: BlockDefinition = {
  // Identity
  id: 'delay_line',
  className: 'daisysp::DelayLine<float, MAX_DELAY>',
  displayName: 'DELAY',
  category: BlockCategory.EFFECTS,

  // C++ Code Generation
  headerFile: 'daisysp.h',
  namespace: 'daisysp',
  initMethod: 'Init',
  initParams: [],
  processMethod: 'Read',
  processReturnType: 'float',

  // Parameters
  parameters: [
    {
      id: 'delay_time',
      displayName: 'Delay Time',
      type: ParameterType.FLOAT,
      cppSetter: 'SetDelay',
      defaultValue: 0.25,
      range: {
        min: 0.001,
        max: 2.0,
        step: 0.001,
        curve: ParameterCurve.LOGARITHMIC,
      },
      unit: 's',
      cvModulatable: true,
      group: 'Main',
      description: 'Delay time in seconds',
    },
    {
      id: 'feedback',
      displayName: 'Feedback',
      type: ParameterType.FLOAT,
      cppSetter: '',
      defaultValue: 0.4,
      range: {
        min: 0.0,
        max: 0.95,
        step: 0.01,
        curve: ParameterCurve.LINEAR,
      },
      cvModulatable: true,
      group: 'Main',
      description: 'Feedback amount (keep below 1.0 to prevent runaway)',
    },
    {
      id: 'wet_dry',
      displayName: 'Wet/Dry',
      type: ParameterType.FLOAT,
      cppSetter: '',
      defaultValue: 0.5,
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
      id: 'in',
      displayName: 'IN',
      signalType: SignalType.AUDIO,
      direction: PortDirection.INPUT,
      description: 'Audio input',
    },
    {
      id: 'delay_time_cv',
      displayName: 'TIME CV',
      signalType: SignalType.CV,
      direction: PortDirection.INPUT,
      description: 'Delay time modulation input',
    },
    {
      id: 'feedback_cv',
      displayName: 'FDBK CV',
      signalType: SignalType.CV,
      direction: PortDirection.INPUT,
      description: 'Feedback amount modulation',
    },
    {
      id: 'wet_dry_cv',
      displayName: 'MIX CV',
      signalType: SignalType.CV,
      direction: PortDirection.INPUT,
      description: 'Wet/Dry mix modulation',
    },
    {
      id: 'out',
      displayName: 'OUT',
      signalType: SignalType.AUDIO,
      direction: PortDirection.OUTPUT,
      description: 'Delayed audio output',
    },
  ],

  // Visual
  colorScheme: BlockColorScheme.AUDIO,
  icon: 'Clock',

  // Code Generation Hints
  requiresSdram: true,

  // Documentation
  description: 'Variable delay line with feedback for echo effects',
  documentation: `
The DelayLine provides a variable-length audio delay with optional feedback
for creating echo and rhythmic delay effects.

Features:
- Variable delay time up to 2 seconds
- Feedback control for multiple echoes
- Wet/dry mix for parallel processing

Implementation notes:
- Uses SDRAM for the delay buffer (supports long delays)
- Delay time can be modulated via CV for chorus/flanger-type effects
- Keep feedback below 1.0 to prevent infinite buildup

Usage pattern in generated code:
  float delayed = delay.Read();
  float output = input * (1 - wetdry) + delayed * wetdry;
  delay.Write(input + delayed * feedback);
  `.trim(),
};
