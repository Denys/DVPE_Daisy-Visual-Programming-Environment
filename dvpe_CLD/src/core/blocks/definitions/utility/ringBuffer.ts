import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
    ParameterType,
} from '@/types';

export const RingBufferBlock: BlockDefinition = {
    id: 'ring_buffer',
    className: 'DVPE_RingBuffer',
    displayName: 'Ring Buffer',
    category: BlockCategory.UTILITY,

    cppStateVars: [
        { type: 'float', name: 'buffer[1024]', init: '{0.0f}' },
        { type: 'size_t', name: 'write_ptr', init: '0' },
        { type: 'size_t', name: 'read_ptr', init: '0' },
        { type: 'bool', name: 'prev_write', init: 'false' },
        { type: 'bool', name: 'prev_read', init: 'false' }
    ],

    cppProcessTemplate: `
    if ({{reset}} > 0.5f) {
        {{write_ptr}} = 0;
        {{read_ptr}} = 0;
    }

    if ({{write_trig}} > 0.5f && !{{prev_write}}) {
        {{buffer}}[{{write_ptr}}] = {{in}};
        {{write_ptr}}++;
        if ({{write_ptr}} >= {{size}}) {{write_ptr}} = 0;
    }
    {{prev_write}} = ({{write_trig}} > 0.5f);

    if ({{read_trig}} > 0.5f && !{{prev_read}}) {
        {{out}} = {{buffer}}[{{read_ptr}}];
        {{read_ptr}}++;
        if ({{read_ptr}} >= {{size}}) {{read_ptr}} = 0;
    }
    {{prev_read}} = ({{read_trig}} > 0.5f);
  `,

    parameters: [
        {
            id: 'size',
            displayName: 'Size',
            type: ParameterType.INT,
            defaultValue: 16,
            range: { min: 1, max: 1024, step: 1 },
            cppSetter: ''
        }
    ],

    ports: [
        { id: 'in', displayName: 'IN', signalType: SignalType.CV, direction: PortDirection.INPUT },
        { id: 'write_trig', displayName: 'WRITE', signalType: SignalType.TRIGGER, direction: PortDirection.INPUT },
        { id: 'read_trig', displayName: 'READ', signalType: SignalType.TRIGGER, direction: PortDirection.INPUT },
        { id: 'reset', displayName: 'RST', signalType: SignalType.TRIGGER, direction: PortDirection.INPUT },
        { id: 'out', displayName: 'OUT', signalType: SignalType.CV, direction: PortDirection.OUTPUT },
    ],

    colorScheme: BlockColorScheme.LOGIC,
    icon: 'Database',

    description: 'Ring Buffer',
    documentation: 'FIFO buffer with adjustable size (max 1024). Write stores input, Read retrieves next value.',
};
