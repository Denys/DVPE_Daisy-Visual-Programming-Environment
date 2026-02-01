import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
    ParameterType,
} from '@/types';

export const GateLengthBlock: BlockDefinition = {
    id: 'gate_length',
    className: 'DVPE_GateLength',
    displayName: 'GATE LEN',
    category: BlockCategory.UTILITY,

    cppStateVars: [
        { type: 'size_t', name: 'counter', init: '0' },
        { type: 'bool', name: 'active', init: 'false' },
        { type: 'bool', name: 'prev_trig', init: 'false' }
    ],

    // On trigger, start gate for specified duration in samples
    cppProcessTemplate: `
    if ({{trig}} > 0.5f && !{{prev_trig}}) {
        {{active}} = true;
        {{counter}} = static_cast<size_t>({{length}} * sr);
    }
    {{prev_trig}} = ({{trig}} > 0.5f);
    
    if ({{active}}) {
        {{out}} = 1.0f;
        if ({{counter}} > 0) {{counter}}--;
        else {{active}} = false;
    } else {
        {{out}} = 0.0f;
    }
  `,

    parameters: [
        {
            id: 'length',
            displayName: 'Length (s)',
            type: ParameterType.FLOAT,
            defaultValue: 0.1,
            range: { min: 0.001, max: 10.0 },
            cppSetter: ''
        }
    ],

    ports: [
        { id: 'trig', displayName: 'TRIG', signalType: SignalType.TRIGGER, direction: PortDirection.INPUT },
        { id: 'out', displayName: 'GATE', signalType: SignalType.TRIGGER, direction: PortDirection.OUTPUT },
    ],

    colorScheme: BlockColorScheme.LOGIC,
    icon: 'Clock',

    description: 'Gate Length',
    documentation: 'Converts trigger to gate with configurable duration in seconds.',
};
