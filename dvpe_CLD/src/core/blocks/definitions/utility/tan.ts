import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const TanBlock: BlockDefinition = {
    id: 'tan',
    className: 'DVPE_Tan',
    displayName: 'TAN',
    category: BlockCategory.MATH,

    cppInlineProcess: 'tanf({{in}})',

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
            description: 'Tangent Output',
        },
    ],

    colorScheme: BlockColorScheme.LOGIC,
    icon: 'Activity',

    description: 'Tangent function',
    documentation: 'Calculates the tangent of the input value (in radians).',
};
