import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
    ParameterType,
} from '@/types';

// Overlap-add accumulator for windowed processing
export const OverlapAddBlock: BlockDefinition = {
    id: 'overlap_add',
    className: 'DVPE_OverlapAdd',
    displayName: 'OLA',
    category: BlockCategory.UTILITY,

    cppStateVars: [
        { type: 'float', name: 'buffer[512]', init: '{0.0f}' },
        { type: 'size_t', name: 'write_idx', init: '0' }
    ],

    // Accumulates windowed input into buffer, outputs overlapped result
    cppProcessTemplate: `
    size_t hop = static_cast<size_t>({{hop_size}});
    size_t bufSize = 512;
    
    // Add input to buffer at current position
    {{buffer}}[{{write_idx}}] += {{in}};
    
    // Output from hop_size samples ago
    size_t read_idx = ({{write_idx}} + bufSize - hop) % bufSize;
    {{out}} = {{buffer}}[read_idx];
    
    // Clear old buffer position
    {{buffer}}[read_idx] = 0.0f;
    
    // Advance write position
    {{write_idx}} = ({{write_idx}} + 1) % bufSize;
  `,

    parameters: [
        {
            id: 'hop_size',
            displayName: 'Hop',
            type: ParameterType.INT,
            defaultValue: 256,
            range: { min: 64, max: 512, step: 64 },
            cppSetter: ''
        }
    ],

    ports: [
        { id: 'in', displayName: 'IN', signalType: SignalType.AUDIO, direction: PortDirection.INPUT },
        { id: 'out', displayName: 'OUT', signalType: SignalType.AUDIO, direction: PortDirection.OUTPUT },
    ],

    colorScheme: BlockColorScheme.UTILITY,
    icon: 'Layers',

    description: 'Overlap-Add',
    documentation: 'Accumulates windowed frames for overlap-add reconstruction. Use with window functions.',
};
