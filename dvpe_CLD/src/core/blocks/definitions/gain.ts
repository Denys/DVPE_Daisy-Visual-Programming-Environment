/**
 * Gain Block Definition
 * Simple signal gain/attenuation
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

export const GainBlock: BlockDefinition = {
    // Identity
    id: 'gain',
    className: 'Gain',
    displayName: 'GAIN',
    category: BlockCategory.UTILITY,

    // C++ Code Generation (inline operation)
    headerFile: '',
    namespace: '',
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
                max: 4.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Gain multiplier (0 = silence, 1 = unity, >1 = boost)',
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
            id: 'gain_cv',
            displayName: 'GAIN CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Gain modulation',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            description: 'Scaled output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.LOGIC,
    icon: 'Volume2',

    // Documentation
    description: 'Simple gain/attenuation control',
    documentation: `
Multiplies input signal by a gain factor.

out = in * gain

0.0 = silence
1.0 = unity (no change)
2.0 = double amplitude (+6dB)
4.0 = quadruple amplitude (+12dB)
  `.trim(),
};
