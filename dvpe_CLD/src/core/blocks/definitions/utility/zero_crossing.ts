import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const ZeroCrossingBlock: BlockDefinition = {
    id: 'zero_crossing',
    className: 'DVPE_ZeroCrossing',
    displayName: 'ZERO X',
    category: BlockCategory.UTILITY,

    cppStateVars: [
        { type: 'float', name: 'prev', init: '0.0f' }
    ],

    cppProcessTemplate: `
    {{out}} = ({{in}} >= 0.0f && {{prev}} < 0.0f) || ({{in}} < 0.0f && {{prev}} >= 0.0f) ? 1.0f : 0.0f;
    {{prev}} = {{in}};
  `,

    parameters: [],

    ports: [
        { id: 'in', displayName: 'IN', signalType: SignalType.AUDIO, direction: PortDirection.INPUT },
        { id: 'out', displayName: 'OUT', signalType: SignalType.TRIGGER, direction: PortDirection.OUTPUT },
    ],

    colorScheme: BlockColorScheme.LOGIC,
    icon: 'Activity',

    description: 'Zero Crossing Detector',
    documentation: 'Emits a trigger when the input signal crosses zero (either direction).',
};
