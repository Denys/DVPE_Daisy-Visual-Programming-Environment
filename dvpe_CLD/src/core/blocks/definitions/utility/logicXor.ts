import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const LogicXorBlock: BlockDefinition = {
    id: 'logic_xor',
    className: 'DVPE_Xor',
    displayName: 'XOR',
    category: BlockCategory.UTILITY,

    cppInlineProcess: '((({{a}} > 0.5f) != ({{b}} > 0.5f)) ? 1.0f : 0.0f)',

    parameters: [],

    ports: [
        { id: 'a', displayName: 'A', signalType: SignalType.TRIGGER, direction: PortDirection.INPUT },
        { id: 'b', displayName: 'B', signalType: SignalType.TRIGGER, direction: PortDirection.INPUT },
        { id: 'out', displayName: 'OUT', signalType: SignalType.TRIGGER, direction: PortDirection.OUTPUT },
    ],

    colorScheme: BlockColorScheme.LOGIC,
    icon: 'X',

    description: 'Logical XOR',
    documentation: 'Outputs 1.0 if inputs are different (one high, one low).',
};
