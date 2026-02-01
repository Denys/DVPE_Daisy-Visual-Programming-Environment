import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
    ParameterType,
} from '@/types';

export const OffsetBlock: BlockDefinition = {
    id: 'offset',
    className: 'DVPE_Offset',
    displayName: 'OFFSET',
    category: BlockCategory.UTILITY,

    cppInlineProcess: '{{in}} + {{amount}}',

    parameters: [
        {
            id: 'amount',
            displayName: 'Amount',
            type: ParameterType.FLOAT,
            defaultValue: 0.0,
            description: 'DC offset amount',
            cppSetter: '', // Inline processing
        },
    ],

    ports: [
        {
            id: 'in',
            displayName: 'IN',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Input signal',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT,
            description: 'Offset output',
        },
    ],

    colorScheme: BlockColorScheme.UTILITY,
    icon: 'Plus',

    description: 'Add DC offset to signal',
    documentation: 'Adds a constant DC offset to the input signal.',
};
