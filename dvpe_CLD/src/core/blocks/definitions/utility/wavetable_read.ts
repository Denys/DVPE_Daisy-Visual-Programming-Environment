import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
    ParameterType,
} from '@/types';

export const WavetableReadBlock: BlockDefinition = {
    id: 'wavetable_read',
    className: 'DVPE_WavetableRead',
    displayName: 'WT READ',
    category: BlockCategory.UTILITY,

    cppStateVars: [
        { type: 'float', name: 'buffer[256]', init: '{0.0f}' }
    ],

    // Read from buffer using phase input (0-1 normalized)
    cppProcessTemplate: `
    size_t idx = static_cast<size_t>(fmodf(fabsf({{phase}}), 1.0f) * {{size}});
    if (idx >= {{size}}) idx = {{size}} - 1;
    {{out}} = {{buffer}}[idx];
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
        { id: 'phase', displayName: 'PHASE', signalType: SignalType.CV, direction: PortDirection.INPUT },
        { id: 'out', displayName: 'OUT', signalType: SignalType.AUDIO, direction: PortDirection.OUTPUT },
    ],

    colorScheme: BlockColorScheme.UTILITY,
    icon: 'Database',

    description: 'Wavetable Read',
    documentation: 'Reads from a 256-sample wavetable using normalized phase (0-1). Use with WavetableWrite to create custom wavetables.',
};
