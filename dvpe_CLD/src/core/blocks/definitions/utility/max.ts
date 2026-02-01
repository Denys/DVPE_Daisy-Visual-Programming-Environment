import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const MaxBlock: BlockDefinition = {
    id: 'max',
    className: 'DVPE_Max',
    displayName: 'MAX',
    category: BlockCategory.UTILITY,

    cppInlineProcess: 'fmaxf({{in_a}}, {{in_b}})',

    parameters: [],

    ports: [
        {
            id: 'in_a',
            displayName: 'A',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
        },
        {
            id: 'in_b',
            displayName: 'B',
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
    icon: 'ArrowUp',

    description: 'Maximum of two signals',
    documentation: 'Outputs the larger of the two input values.',
};
