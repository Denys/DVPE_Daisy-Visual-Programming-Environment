/**
 * Gate Block Definition
 * Noise gate - inline implementation
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

export const GateBlock: BlockDefinition = {
    // Identity
    id: 'gate',
    className: 'inline::Gate',
    displayName: 'GATE',
    category: BlockCategory.DYNAMICS,

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
            id: 'threshold',
            displayName: 'Threshold',
            type: ParameterType.FLOAT,
            cppSetter: '',
            defaultValue: 0.01,
            range: {
                min: 0.0,
                max: 0.5,
                step: 0.001,
                curve: ParameterCurve.LOGARITHMIC,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Gate threshold level',
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
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            description: 'Gated output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.LOGIC,
    icon: 'DoorClosed',

    // Documentation
    description: 'Noise gate with threshold control',
    documentation: `
Silences audio below the threshold level.
Use to remove background noise or create gated effects.
Higher threshold = more aggressive gating.
    `.trim(),
};
