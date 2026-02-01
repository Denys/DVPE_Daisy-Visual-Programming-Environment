import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const GreaterBlock: BlockDefinition = {
    id: 'greater',
    className: 'DVPE_Greater',
    displayName: '>',
    category: BlockCategory.UTILITY,

    cppInlineProcess: '({{a}} > {{b}} ? 1.0f : 0.0f)',

    parameters: [],

    ports: [
        { id: 'a', displayName: 'A', signalType: SignalType.CV, direction: PortDirection.INPUT },
        { id: 'b', displayName: 'B', signalType: SignalType.CV, direction: PortDirection.INPUT },
        { id: 'out', displayName: 'OUT', signalType: SignalType.TRIGGER, direction: PortDirection.OUTPUT },
    ],

    colorScheme: BlockColorScheme.LOGIC,
    icon: 'ChevronRight',

    description: 'Greater Than',
    documentation: 'Outputs 1.0 (true) if A > B.',
};
