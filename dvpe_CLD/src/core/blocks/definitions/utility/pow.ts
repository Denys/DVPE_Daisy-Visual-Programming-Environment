import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const PowBlock: BlockDefinition = {
    id: 'pow',
    className: 'DVPE_Pow',
    displayName: 'POW',
    category: BlockCategory.MATH,

    cppInlineProcess: 'powf({{base}}, {{conc}})',

    parameters: [],

    ports: [
        {
            id: 'base',
            displayName: 'BASE',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
        },
        {
            id: 'conc',
            displayName: 'EXP',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Exponent',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT,
        },
    ],

    colorScheme: BlockColorScheme.LOGIC, // Math/Logic
    icon: 'TrendingUp',

    description: 'Power function',
    documentation: 'Calculates Base raised to the power of Exponent.',
};
