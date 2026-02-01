import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const DLatchBlock: BlockDefinition = {
    id: 'd_latch',
    className: 'DVPE_DLatch',
    displayName: 'D Latch',
    category: BlockCategory.UTILITY,

    cppStateVars: [
        { type: 'bool', name: 'state', init: 'false' }
    ],

    cppProcessTemplate: `
    if ({{enable}} > 0.5f) {{state}} = ({{data}} > 0.5f);
    {{out}} = {{state}} ? 1.0f : 0.0f;
  `,

    parameters: [],

    ports: [
        { id: 'data', displayName: 'D', signalType: SignalType.TRIGGER, direction: PortDirection.INPUT },
        { id: 'enable', displayName: 'E', signalType: SignalType.TRIGGER, direction: PortDirection.INPUT },
        { id: 'out', displayName: 'Q', signalType: SignalType.TRIGGER, direction: PortDirection.OUTPUT },
    ],

    colorScheme: BlockColorScheme.LOGIC,
    icon: 'Square',

    description: 'D Latch',
    documentation: 'Transparent latch. Output follows Data when Enable is high, holds value when Enable is low.',
};
