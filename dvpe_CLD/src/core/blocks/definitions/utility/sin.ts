import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const SinBlock: BlockDefinition = {
    id: 'sin',
    className: 'DVPE_Sin',
    displayName: 'SIN',
    category: BlockCategory.MATH,

    cppInlineProcess: 'sinf({{in}})',

    parameters: [],

    ports: [
        {
            id: 'in',
            displayName: 'IN',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Input Value (Radians)',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT,
            description: 'Sine Output',
        },
    ],

    colorScheme: BlockColorScheme.LOGIC,
    icon: 'Activity', // Closest to a wave

    description: 'Sine function',
    documentation: 'Calculates the sine of the input value (in radians).',
};
