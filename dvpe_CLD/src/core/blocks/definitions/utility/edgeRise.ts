import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const EdgeRiseBlock: BlockDefinition = {
    id: 'edge_rise',
    className: 'DVPE_EdgeRise',
    displayName: 'RISE',
    category: BlockCategory.UTILITY,

    cppStateVars: [
        { type: 'bool', name: 'prev', init: 'false' }
    ],

    cppProcessTemplate: `
    {{out}} = ({{in}} > 0.5f && !{{prev}}) ? 1.0f : 0.0f;
    {{prev}} = ({{in}} > 0.5f);
  `,

    parameters: [],

    ports: [
        { id: 'in', displayName: 'IN', signalType: SignalType.TRIGGER, direction: PortDirection.INPUT },
        { id: 'out', displayName: 'OUT', signalType: SignalType.TRIGGER, direction: PortDirection.OUTPUT },
    ],

    colorScheme: BlockColorScheme.LOGIC,
    icon: 'TrendingUp',

    description: 'Rising Edge Detector',
    documentation: 'Emits a trigger when input goes from low to high.',
};
