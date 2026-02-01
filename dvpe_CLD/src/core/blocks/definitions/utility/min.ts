import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const MinBlock: BlockDefinition = {
    id: 'min',
    className: 'DVPE_Min',
    displayName: 'MIN',
    category: BlockCategory.UTILITY,

    cppInlineProcess: 'fminf({{in_a}}, {{in_b}})',

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
    icon: 'ArrowDown',

    description: 'Minimum of two signals',
    documentation: 'Outputs the smaller of the two input values.',
};
