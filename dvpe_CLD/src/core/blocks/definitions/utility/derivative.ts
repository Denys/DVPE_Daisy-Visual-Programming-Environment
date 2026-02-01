import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const DerivativeBlock: BlockDefinition = {
    id: 'derivative',
    className: 'DVPE_Derivative',
    displayName: 'D/dt',
    category: BlockCategory.MATH,

    cppStateVars: [
        { type: 'float', name: 'prev', init: '0.0f' }
    ],

    cppProcessTemplate: `
    {{out}} = ({{in}} - {{prev}}) * sr;
    {{prev}} = {{in}};
  `,

    parameters: [],

    ports: [
        { id: 'in', displayName: 'IN', signalType: SignalType.CV, direction: PortDirection.INPUT },
        { id: 'out', displayName: 'OUT', signalType: SignalType.CV, direction: PortDirection.OUTPUT },
    ],

    colorScheme: BlockColorScheme.LOGIC,
    icon: 'TrendingUp', // or similar

    description: 'Derivative',
    documentation: 'Calculates the rate of change of the signal (difference per second).',
};
