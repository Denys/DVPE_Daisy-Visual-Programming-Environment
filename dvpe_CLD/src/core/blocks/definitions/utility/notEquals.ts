import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const NotEqualsBlock: BlockDefinition = {
    id: 'not_equals',
    className: 'DVPE_NotEquals',
    displayName: 'NOT EQ',
    category: BlockCategory.UTILITY,

    cppInlineProcess: '(fabsf({{a}} - {{b}}) >= 0.0001f ? 1.0f : 0.0f)',

    parameters: [],

    ports: [
        { id: 'a', displayName: 'A', signalType: SignalType.CV, direction: PortDirection.INPUT },
        { id: 'b', displayName: 'B', signalType: SignalType.CV, direction: PortDirection.INPUT },
        { id: 'out', displayName: 'OUT', signalType: SignalType.TRIGGER, direction: PortDirection.OUTPUT },
    ],

    colorScheme: BlockColorScheme.LOGIC,
    icon: 'XCircle',

    description: 'Inequality Check',
    documentation: 'Outputs 1.0 (true) if A is not equal to B.',
};
