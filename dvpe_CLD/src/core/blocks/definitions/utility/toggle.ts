import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const ToggleBlock: BlockDefinition = {
    id: 'toggle',
    className: 'DVPE_Toggle',
    displayName: 'TOGGLE',
    category: BlockCategory.UTILITY,

    cppStateVars: [
        { type: 'bool', name: 'state', init: 'false' },
        { type: 'bool', name: 'prev_trig', init: 'false' }
    ],

    cppProcessTemplate: `
    if ({{trig}} > 0.5f && !{{prev_trig}}) {
        {{state}} = !{{state}};
    }
    {{prev_trig}} = ({{trig}} > 0.5f);
    {{out}} = {{state}} ? 1.0f : 0.0f;
  `,

    parameters: [],

    ports: [
        { id: 'trig', displayName: 'TRIG', signalType: SignalType.TRIGGER, direction: PortDirection.INPUT },
        { id: 'out', displayName: 'OUT', signalType: SignalType.TRIGGER, direction: PortDirection.OUTPUT },
    ],

    colorScheme: BlockColorScheme.LOGIC,
    icon: 'ToggleRight',

    description: 'Toggle Switch',
    documentation: 'Flips output state on each rising edge of input trigger.',
};
