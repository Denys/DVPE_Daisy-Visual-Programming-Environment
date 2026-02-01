import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const EdgeFallBlock: BlockDefinition = {
    id: 'edge_fall',
    className: 'DVPE_EdgeFall',
    displayName: 'FALL',
    category: BlockCategory.UTILITY,

    cppStateVars: [
        { type: 'bool', name: 'prev', init: 'false' }
    ],

    cppProcessTemplate: `
    {{out}} = (!({{in}} > 0.5f) && {{prev}}) ? 1.0f : 0.0f;
    {{prev}} = ({{in}} > 0.5f);
  `,

    parameters: [],

    ports: [
        { id: 'in', displayName: 'IN', signalType: SignalType.TRIGGER, direction: PortDirection.INPUT },
        { id: 'out', displayName: 'OUT', signalType: SignalType.TRIGGER, direction: PortDirection.OUTPUT },
    ],

    colorScheme: BlockColorScheme.LOGIC,
    icon: 'TrendingDown',

    description: 'Falling Edge Detector',
    documentation: 'Emits a trigger when input goes from high to low.',
};
