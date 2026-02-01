import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const CosBlock: BlockDefinition = {
    id: 'cos',
    className: 'DVPE_Cos',
    displayName: 'COS',
    category: BlockCategory.MATH,

    cppInlineProcess: 'cosf({{in}})',

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
            description: 'Cosine Output',
        },
    ],

    colorScheme: BlockColorScheme.LOGIC,
    icon: 'Activity',

    description: 'Cosine function',
    documentation: 'Calculates the cosine of the input value (in radians).',
};
