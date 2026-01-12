/**
 * Bitcrush Block Definition
 * Pure bit depth reduction - inline implementation
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

export const BitcrushBlock: BlockDefinition = {
    // Identity
    id: 'bitcrush',
    className: 'inline::Bitcrush',
    displayName: 'BITCRUSH',
    category: BlockCategory.EFFECTS,

    // C++ Code Generation - inline
    headerFile: 'daisysp.h',
    namespace: 'daisysp',
    initMethod: '',
    initParams: [],
    processMethod: '',
    processReturnType: 'float',

    // Parameters
    parameters: [
        {
            id: 'bits',
            displayName: 'Bits',
            type: ParameterType.FLOAT,
            cppSetter: '',
            defaultValue: 8,
            range: {
                min: 1,
                max: 16,
                step: 1,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Bit depth (lower = more crushed)',
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
            id: 'bits_cv',
            displayName: 'BITS CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Bit depth modulation',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            description: 'Crushed output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.FX,
    icon: 'Binary',

    // Documentation
    description: 'Bit depth reduction effect',
    documentation: `
Reduces the bit depth of the audio signal.
Lower values create more digital distortion and stair-stepping.
Use for lo-fi and retro gaming sound effects.
    `.trim(),
};
