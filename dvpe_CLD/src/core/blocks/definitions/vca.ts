/**
 * VCA (Voltage Controlled Amplifier) Block Definition
 * Utility block for amplitude control via CV
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

export const VcaBlock: BlockDefinition = {
  // Identity
  id: 'vca',
  className: 'VCA',
  displayName: 'VCA',
  category: BlockCategory.UTILITY,

  // C++ Code Generation - VCA is implemented inline, not a DaisySP class
  headerFile: '',
  initMethod: '',
  initParams: [],
  processMethod: '',
  processReturnType: 'float',

  // Parameters
  parameters: [
    {
      id: 'gain',
      displayName: 'Gain',
      type: ParameterType.FLOAT,
      cppSetter: '',
      defaultValue: 1.0,
      range: {
        min: 0.0,
        max: 2.0,
        step: 0.01,
        curve: ParameterCurve.LINEAR,
      },
      cvModulatable: true,
      group: 'Main',
      description: 'Base gain multiplier for the input signal',
    },
  ],

  // Ports
  ports: [
    {
      id: 'in',
      displayName: 'IN',
      signalType: SignalType.AUDIO,
      direction: PortDirection.INPUT,
      description: 'Audio input signal',
    },
    {
      id: 'gain_cv',
      displayName: 'CV',
      signalType: SignalType.CV,
      direction: PortDirection.INPUT,
      description: 'Control voltage for amplitude modulation (0-1)',
    },
    {
      id: 'out',
      displayName: 'OUT',
      signalType: SignalType.AUDIO,
      direction: PortDirection.OUTPUT,
      description: 'Amplitude-controlled audio output',
    },
  ],

  // Visual
  colorScheme: BlockColorScheme.LOGIC,
  icon: 'Volume2',

  // Documentation
  description: 'Voltage Controlled Amplifier for dynamic amplitude control',
  documentation: `
The VCA (Voltage Controlled Amplifier) multiplies an audio signal by a 
control voltage, enabling dynamic amplitude control.

Operation:
output = input × cv × gain

Common uses:
- Connect ADSR envelope to CV input for amplitude shaping
- Use LFO on CV input for tremolo effect
- Control mix levels with external CV

The gain parameter sets the base multiplier. The CV input (typically 0-1)
scales this further, allowing for envelope-controlled amplitude.
  `.trim(),
};
