import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const LogicNotBlock: BlockDefinition = {
    id: 'logic_not',
    className: 'DVPE_Not',
    displayName: 'NOT',
    category: BlockCategory.UTILITY,

    cppInlineProcess: '({{in}} <= 0.5f ? 1.0f : 0.0f)',

    parameters: [],

    ports: [
        { id: 'in', displayName: 'IN', signalType: SignalType.TRIGGER, direction: PortDirection.INPUT },
        { id: 'out', displayName: 'OUT', signalType: SignalType.TRIGGER, direction: PortDirection.OUTPUT },
    ],

    colorScheme: BlockColorScheme.LOGIC,
    icon: 'MinusSquare',

    description: 'Logical NOT',
    documentation: 'Outputs 1.0 if input is <= 0.5, else 0.0.',
};
