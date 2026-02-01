import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const ReciprocalBlock: BlockDefinition = {
    id: 'reciprocal',
    className: 'DVPE_Reciprocal',
    displayName: '1/x',
    category: BlockCategory.MATH,

    // Add epsilon to avoid divide by zero
    cppInlineProcess: '1.0f / ({{in}} + ({{in}} >= 0.0f ? 1e-9f : -1e-9f))',
    // Or simpler: (fabsf({{in}}) < 1e-9f) ? 0.0f : (1.0f / {{in}})

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
    icon: 'Divide',

    description: 'Reciprocal (1/x)',
    documentation: 'Calculates 1 divided by the input.',
};
