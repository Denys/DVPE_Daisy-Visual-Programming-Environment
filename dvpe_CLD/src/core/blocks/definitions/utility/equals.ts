import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const EqualsBlock: BlockDefinition = {
    id: 'equals',
    className: 'DVPE_Equals',
    displayName: 'EQUALS',
    category: BlockCategory.UTILITY,

    cppInlineProcess: '(fabsf({{a}} - {{b}}) < 0.0001f ? 1.0f : 0.0f)',

    parameters: [],

    ports: [
        { id: 'a', displayName: 'A', signalType: SignalType.CV, direction: PortDirection.INPUT },
        { id: 'b', displayName: 'B', signalType: SignalType.CV, direction: PortDirection.INPUT },
        { id: 'out', displayName: 'OUT', signalType: SignalType.TRIGGER, direction: PortDirection.OUTPUT }, // Trigger/Gate output
    ],

    colorScheme: BlockColorScheme.LOGIC,
    icon: 'Copy', // Or 'Equal'

    description: 'Equality Check',
    documentation: 'Outputs 1.0 (true) if A is approximately equal to B.',
};
