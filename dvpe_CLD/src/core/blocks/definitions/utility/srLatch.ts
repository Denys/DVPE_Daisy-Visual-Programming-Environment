import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const SRLatchBlock: BlockDefinition = {
    id: 'sr_latch',
    className: 'DVPE_SRLatch',
    displayName: 'SR Latch',
    category: BlockCategory.UTILITY,

    cppStateVars: [
        { type: 'bool', name: 'state', init: 'false' }
    ],

    cppProcessTemplate: `
    if ({{reset}} > 0.5f) {{state}} = false;
    else if ({{set}} > 0.5f) {{state}} = true;
    {{out}} = {{state}} ? 1.0f : 0.0f;
    {{not_out}} = {{state}} ? 0.0f : 1.0f;
  `,

    parameters: [],

    ports: [
        { id: 'set', displayName: 'S', signalType: SignalType.TRIGGER, direction: PortDirection.INPUT },
        { id: 'reset', displayName: 'R', signalType: SignalType.TRIGGER, direction: PortDirection.INPUT },
        { id: 'out', displayName: 'Q', signalType: SignalType.TRIGGER, direction: PortDirection.OUTPUT },
        { id: 'not_out', displayName: '!Q', signalType: SignalType.TRIGGER, direction: PortDirection.OUTPUT },
    ],

    colorScheme: BlockColorScheme.LOGIC,
    icon: 'Square', // Placeholder

    description: 'SR Latch',
    documentation: 'Set/Reset Latch. Reset priority.',
};
