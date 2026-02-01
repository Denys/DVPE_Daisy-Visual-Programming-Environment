import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
    ParameterType,
} from '@/types';

export const WavetableWriteBlock: BlockDefinition = {
    id: 'wavetable_write',
    className: 'DVPE_WavetableWrite',
    displayName: 'WT WRITE',
    category: BlockCategory.UTILITY,

    cppStateVars: [
        { type: 'float', name: 'buffer[256]', init: '{0.0f}' },
        { type: 'size_t', name: 'write_idx', init: '0' },
        { type: 'bool', name: 'prev_trig', init: 'false' }
    ],

    // Write to buffer on trigger, increment index
    cppProcessTemplate: `
    if ({{trig}} > 0.5f && !{{prev_trig}}) {
        {{buffer}}[{{write_idx}}] = {{in}};
        {{write_idx}}++;
        if ({{write_idx}} >= {{size}}) {{write_idx}} = 0;
    }
    {{prev_trig}} = ({{trig}} > 0.5f);
    {{out}} = static_cast<float>({{write_idx}});
  `,

    parameters: [
        {
            id: 'size',
            displayName: 'Size',
            type: ParameterType.INT,
            defaultValue: 256,
            range: { min: 2, max: 256, step: 1 },
            cppSetter: ''
        }
    ],

    ports: [
        { id: 'in', displayName: 'IN', signalType: SignalType.AUDIO, direction: PortDirection.INPUT },
        { id: 'trig', displayName: 'TRIG', signalType: SignalType.TRIGGER, direction: PortDirection.INPUT },
        { id: 'out', displayName: 'IDX', signalType: SignalType.CV, direction: PortDirection.OUTPUT },
    ],

    colorScheme: BlockColorScheme.UTILITY,
    icon: 'Save',

    description: 'Wavetable Write',
    documentation: 'Writes input samples to a 256-sample buffer on each trigger. Output is current write index.',
};
