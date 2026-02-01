/**
 * SampleDelay Block Definition
 * Single sample delay (z^-1)
 */

import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    ParameterType,
    SignalType,
    PortDirection,
} from '@/types';

export const SampleDelayBlock: BlockDefinition = {
    // Identity
    id: 'sampledelay',
    className: 'SampleDelay',
    displayName: 'Z⁻¹',
    category: BlockCategory.UTILITY,

    // C++ Code Generation (needs state variable)
    headerFile: '',
    namespace: '',
    initMethod: '',
    initParams: [],
    processMethod: '',
    processReturnType: 'float',

    // Parameters
    parameters: [
        {
            id: 'delay_samples',
            displayName: 'Delay',
            type: ParameterType.INT,
            cppSetter: '',
            defaultValue: 1,
            range: {
                min: 1,
                max: 1000,
                step: 1,
            },
            group: 'Main',
            description: 'Delay in samples',
        },
    ],

    // Ports
    ports: [
        {
            id: 'in',
            displayName: 'IN',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            description: 'Input signal',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            description: 'Delayed by one sample',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.LOGIC,
    icon: 'Clock',

    // Documentation
    description: 'Single sample delay (z⁻¹)',
    documentation: `
Delays the input signal by exactly one sample.

Essential building block for:
- Feedback loops (breaks zero-delay feedback)
- FIR/IIR filter construction
- Comb filter building
- Allpass structure creation

z⁻¹ notation comes from the Z-transform.
  `.trim(),
};
