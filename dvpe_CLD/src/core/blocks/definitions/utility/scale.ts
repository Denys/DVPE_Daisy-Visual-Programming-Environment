import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
    ParameterType,
} from '@/types';

export const ScaleBlock: BlockDefinition = {
    id: 'scale',
    className: 'DVPE_Scale',
    displayName: 'SCALE',
    category: BlockCategory.UTILITY,

    cppInlineProcess: '{{in}} * {{factor}}',

    parameters: [
        {
            id: 'factor',
            displayName: 'Factor',
            type: ParameterType.FLOAT,
            defaultValue: 1.0,
            description: 'Multiplication factor',
            cppSetter: '', // Inline processing uses direct value substitution
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
            description: 'Scaled output',
        },
    ],

    colorScheme: BlockColorScheme.UTILITY,
    icon: 'Maximize',

    description: 'Multiply signal by a factor',
    documentation: 'Multiplies the input signal by the specified factor.',
};
