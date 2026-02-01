import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const LogBlock: BlockDefinition = {
    id: 'log',
    className: 'DVPE_Log',
    displayName: 'LOG',
    category: BlockCategory.MATH,

    cppInlineProcess: 'logf(fmaxf(1e-9f, {{in}}))',

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

    colorScheme: BlockColorScheme.LOGIC,
    icon: 'TrendingUp',

    description: 'Natural Logarithm (ln)',
    documentation: 'Calculates the natural logarithm of the input. Input clamped > 0.',
};
