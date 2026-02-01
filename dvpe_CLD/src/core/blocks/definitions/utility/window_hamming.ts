import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

// Hamming window: 0.54 - 0.46 * cos(2*PI*n/N)
export const WindowHammingBlock: BlockDefinition = {
    id: 'window_hamming',
    className: 'DVPE_WindowHamming',
    displayName: 'HAMMING',
    category: BlockCategory.UTILITY,

    cppInlineProcess: '0.54f - 0.46f * cosf(2.0f * 3.14159265359f * {{phase}})',

    parameters: [],

    ports: [
        { id: 'phase', displayName: 'PHS', signalType: SignalType.CV, direction: PortDirection.INPUT },
        { id: 'out', displayName: 'OUT', signalType: SignalType.CV, direction: PortDirection.OUTPUT },
    ],

    colorScheme: BlockColorScheme.UTILITY,
    icon: 'Activity',

    description: 'Hamming Window',
    documentation: 'Generates Hamming window coefficient from phase (0-1).',
};
