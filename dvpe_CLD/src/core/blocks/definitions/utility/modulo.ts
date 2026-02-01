import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const ModuloBlock: BlockDefinition = {
    id: 'modulo',
    className: 'DVPE_Modulo',
    displayName: 'MODULO',
    category: BlockCategory.UTILITY,

    cppInlineProcess: '({{in_a}} - floor({{in_a}} / {{in_b}}) * {{in_b}})',

    parameters: [],

    ports: [
        {
            id: 'in_a',
            displayName: 'A',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Dividend',
        },
        {
            id: 'in_b',
            displayName: 'B',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Divisor',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT,
            description: 'A mod B',
        },
    ],

    colorScheme: BlockColorScheme.UTILITY,
    icon: 'Percent',

    description: 'Modulo (remainder) operation',
    documentation: 'Outputs the remainder of A divided by B.',
};
