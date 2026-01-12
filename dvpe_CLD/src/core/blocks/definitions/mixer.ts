/**
 * Mixer Block Definition
 * Utility block for mixing multiple audio signals
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

export const MixerBlock: BlockDefinition = {
  // Identity
  id: 'mixer',
  className: 'Mixer',
  displayName: 'MIXER',
  category: BlockCategory.UTILITY,

  // C++ Code Generation - Mixer is implemented inline
  headerFile: '',
  initMethod: '',
  initParams: [],
  processMethod: '',
  processReturnType: 'float',

  // Parameters
  parameters: [
    {
      id: 'inputCount',
      displayName: 'Inputs',
      type: ParameterType.ENUM,
      cppSetter: '',
      defaultValue: '4',
      enumValues: [
        { label: '2 Inputs', value: '2' },
        { label: '3 Inputs', value: '3' },
        { label: '4 Inputs', value: '4' },
      ],
      group: 'Main',
      description: 'Number of active input channels',
    },
    {
      id: 'level_1',
      displayName: 'Level 1',
      type: ParameterType.FLOAT,
      cppSetter: '',
      defaultValue: 1.0,
      range: {
        min: 0.0,
        max: 1.0,
        step: 0.01,
        curve: ParameterCurve.LINEAR,
      },
      cvModulatable: true,
      group: 'Levels',
      description: 'Level for input 1',
    },
    {
      id: 'level_2',
      displayName: 'Level 2',
      type: ParameterType.FLOAT,
      cppSetter: '',
      defaultValue: 1.0,
      range: {
        min: 0.0,
        max: 1.0,
        step: 0.01,
        curve: ParameterCurve.LINEAR,
      },
      cvModulatable: true,
      group: 'Levels',
      description: 'Level for input 2',
    },
    {
      id: 'level_3',
      displayName: 'Level 3',
      type: ParameterType.FLOAT,
      cppSetter: '',
      defaultValue: 1.0,
      range: {
        min: 0.0,
        max: 1.0,
        step: 0.01,
        curve: ParameterCurve.LINEAR,
      },
      cvModulatable: true,
      group: 'Levels',
      description: 'Level for input 3',
    },
    {
      id: 'level_4',
      displayName: 'Level 4',
      type: ParameterType.FLOAT,
      cppSetter: '',
      defaultValue: 1.0,
      range: {
        min: 0.0,
        max: 1.0,
        step: 0.01,
        curve: ParameterCurve.LINEAR,
      },
      cvModulatable: true,
      group: 'Levels',
      description: 'Level for input 4',
    },
    {
      id: 'master',
      displayName: 'Master',
      type: ParameterType.FLOAT,
      cppSetter: '',
      defaultValue: 1.0,
      range: {
        min: 0.0,
        max: 1.0,
        step: 0.01,
        curve: ParameterCurve.LINEAR,
      },
      cvModulatable: true,
      group: 'Output',
      description: 'Master output level',
    },
  ],

  // Ports
  ports: [
    {
      id: 'in_1',
      displayName: 'IN 1',
      signalType: SignalType.AUDIO,
      direction: PortDirection.INPUT,
      description: 'Audio input 1',
    },
    {
      id: 'in_2',
      displayName: 'IN 2',
      signalType: SignalType.AUDIO,
      direction: PortDirection.INPUT,
      description: 'Audio input 2',
    },
    {
      id: 'in_3',
      displayName: 'IN 3',
      signalType: SignalType.AUDIO,
      direction: PortDirection.INPUT,
      description: 'Audio input 3',
    },
    {
      id: 'in_4',
      displayName: 'IN 4',
      signalType: SignalType.AUDIO,
      direction: PortDirection.INPUT,
      description: 'Audio input 4',
    },
    {
      id: 'level_1_cv',
      displayName: 'LVL 1 CV',
      signalType: SignalType.CV,
      direction: PortDirection.INPUT,
      description: 'Level 1 modulation',
    },
    {
      id: 'level_2_cv',
      displayName: 'LVL 2 CV',
      signalType: SignalType.CV,
      direction: PortDirection.INPUT,
      description: 'Level 2 modulation',
    },
    {
      id: 'level_3_cv',
      displayName: 'LVL 3 CV',
      signalType: SignalType.CV,
      direction: PortDirection.INPUT,
      description: 'Level 3 modulation',
    },
    {
      id: 'level_4_cv',
      displayName: 'LVL 4 CV',
      signalType: SignalType.CV,
      direction: PortDirection.INPUT,
      description: 'Level 4 modulation',
    },
    {
      id: 'master_cv',
      displayName: 'MST CV',
      signalType: SignalType.CV,
      direction: PortDirection.INPUT,
      description: 'Master level modulation',
    },
    {
      id: 'out',
      displayName: 'OUT',
      signalType: SignalType.AUDIO,
      direction: PortDirection.OUTPUT,
      description: 'Mixed audio output',
    },
  ],

  // Visual
  colorScheme: BlockColorScheme.LOGIC,
  icon: 'Sliders',

  // Documentation
  description: '4-channel audio mixer with individual level controls',
  documentation: `
The Mixer combines up to 4 audio signals into a single output.
Each input has an independent level control, plus a master output level.

Operation:
output = (in1 × level1 + in2 × level2 + in3 × level3 + in4 × level4) × master

Unused inputs are treated as zero and don't affect the output.

Common uses:
- Combining multiple oscillators
- Mixing drum sounds
- Creating submixes before effects processing
- Layering sounds

Note: Watch overall levels to avoid clipping. If the output exceeds 1.0,
you may hear distortion. Reduce individual levels or master to compensate.
  `.trim(),
};
