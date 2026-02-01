import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const LogicOrBlock: BlockDefinition = {
    id: 'logic_or',
    className: 'DVPE_Or',
    displayName: 'OR',
    category: BlockCategory.UTILITY,

    cppInlineProcess: '(({{a}} > 0.5f || {{b}} > 0.5f) ? 1.0f : 0.0f)',

    parameters: [],

    ports: [
        { id: 'a', displayName: 'A', signalType: SignalType.TRIGGER, direction: PortDirection.INPUT },
        { id: 'b', displayName: 'B', signalType: SignalType.TRIGGER, direction: PortDirection.INPUT },
        { id: 'out', displayName: 'OUT', signalType: SignalType.TRIGGER, direction: PortDirection.OUTPUT },
    ],

    colorScheme: BlockColorScheme.LOGIC,
    icon: 'PlusSquare',

    description: 'Logical OR',
    documentation: 'Outputs 1.0 if either A or B is > 0.5.',
};
