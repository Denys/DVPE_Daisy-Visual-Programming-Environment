import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const NegateBlock: BlockDefinition = {
    id: 'negate',
    className: 'DVPE_Negate',
    displayName: 'NEGATE',
    category: BlockCategory.UTILITY,

    cppInlineProcess: '(-{{in}})',

    parameters: [],

    ports: [
        {
            id: 'in',
            displayName: 'IN',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT,
        },
    ],

    colorScheme: BlockColorScheme.UTILITY,
    icon: 'Minus',

    description: 'Invert signal polarity',
    documentation: 'Outputs -Input.',
};
