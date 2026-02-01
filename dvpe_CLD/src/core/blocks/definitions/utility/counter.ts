import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
    ParameterType,
} from '@/types';

export const CounterBlock: BlockDefinition = {
    id: 'counter',
    className: 'DVPE_Counter',
    displayName: 'COUNT',
    category: BlockCategory.UTILITY,

    cppStateVars: [
        { type: 'float', name: 'count', init: '0.0f' },
        { type: 'bool', name: 'prev_trig', init: 'false' }
    ],

    // Count from 0 to Max-1? Or 1 to Max? Usually 0-indexed.
    // Helper: if reset input
    cppProcessTemplate: `
    if ({{reset}} > 0.5f) {
        {{count}} = 0.0f;
    } else if ({{trig}} > 0.5f && !{{prev_trig}}) {
        {{count}} += 1.0f;
        if ({{count}} >= {{max}}) {
            {{count}} = 0.0f;
        }
    }
    {{prev_trig}} = ({{trig}} > 0.5f);
    {{out}} = {{count}};
  `,

    parameters: [
        {
            id: 'max',
            displayName: 'Max',
            type: ParameterType.FLOAT,
            defaultValue: 10,
            range: { min: 1, max: 1000, step: 1 },
            cppSetter: ''
        }
    ],

    ports: [
        { id: 'trig', displayName: 'TRIG', signalType: SignalType.TRIGGER, direction: PortDirection.INPUT },
        { id: 'reset', displayName: 'RST', signalType: SignalType.TRIGGER, direction: PortDirection.INPUT },
        { id: 'out', displayName: 'OUT', signalType: SignalType.CV, direction: PortDirection.OUTPUT },
    ],

    colorScheme: BlockColorScheme.LOGIC,
    icon: 'Hash',

    description: 'Counter',
    documentation: 'Increments on trigger. Resets to 0 when reaching Max or when Reset is high.',
};
