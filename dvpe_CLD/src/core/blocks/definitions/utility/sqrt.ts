import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const SqrtBlock: BlockDefinition = {
    id: 'sqrt',
    className: 'DVPE_Sqrt',
    displayName: 'SQRT',
    category: BlockCategory.MATH,

    cppInlineProcess: 'sqrtf(fmaxf(0.0f, {{in}}))',

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
    icon: 'Activity', // Closest to curve?

    description: 'Square Root',
    documentation: 'Calculates the square root of the input. Input is clamped to 0.',
};
