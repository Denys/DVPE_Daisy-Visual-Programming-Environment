/**
 * Rectifier Block Definition
 * Wave rectification (full or half) - inline implementation
 */

import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    ParameterType,
    SignalType,
    PortDirection,
} from '@/types';

export const RectifierBlock: BlockDefinition = {
    // Identity
    id: 'rectifier',
    className: 'inline::Rectifier',
    displayName: 'RECTIFIER',
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
            id: 'mode',
            displayName: 'Mode',
            type: ParameterType.ENUM,
            cppSetter: '',
            defaultValue: 0,
            enumValues: [
                { value: 0, label: 'Full', cppValue: '0' },
                { value: 1, label: 'Half', cppValue: '1' },
            ],
            group: 'Main',
            description: 'Rectification mode',
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
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            description: 'Rectified output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.AUDIO,
    icon: 'Minus',

    // Documentation
    description: 'Full or half wave rectification',
    documentation: `
Rectifies the audio waveform for distortion effects.
Full mode: absolute value (folds negative to positive).
Half mode: clips negative portion to zero.
    `.trim(),
};
