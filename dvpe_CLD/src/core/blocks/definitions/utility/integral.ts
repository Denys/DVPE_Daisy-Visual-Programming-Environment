import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const IntegralBlock: BlockDefinition = {
    id: 'integral',
    className: 'DVPE_Integral',
    displayName: 'INTEGRAL',
    category: BlockCategory.MATH,

    cppStateVars: [
        { type: 'float', name: 'accum', init: '0.0f' }
    ],

    cppProcessTemplate: `
    {{accum}} += {{in}} / sr;
    if ({{reset}} > 0.5f) {{accum}} = 0.0f;
    {{out}} = {{accum}};
  `,

    parameters: [],

    ports: [
        { id: 'in', displayName: 'IN', signalType: SignalType.CV, direction: PortDirection.INPUT },
        { id: 'reset', displayName: 'RESET', signalType: SignalType.TRIGGER, direction: PortDirection.INPUT },
        { id: 'out', displayName: 'OUT', signalType: SignalType.CV, direction: PortDirection.OUTPUT },
    ],

    colorScheme: BlockColorScheme.LOGIC,
    icon: 'Activity',

    description: 'Integral',
    documentation: 'Accumulates the input signal over time. Reset sets accumulator to 0.',
};
