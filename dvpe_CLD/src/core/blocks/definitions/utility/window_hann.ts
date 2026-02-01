import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

// Hann window: 0.5 * (1 - cos(2*PI*n/N))
export const WindowHannBlock: BlockDefinition = {
    id: 'window_hann',
    className: 'DVPE_WindowHann',
    displayName: 'HANN',
    category: BlockCategory.UTILITY,

    // phase input is 0-1, output is window coefficient
    cppInlineProcess: '0.5f * (1.0f - cosf(2.0f * 3.14159265359f * {{phase}}))',

    parameters: [],

    ports: [
        { id: 'phase', displayName: 'PHS', signalType: SignalType.CV, direction: PortDirection.INPUT },
        { id: 'out', displayName: 'OUT', signalType: SignalType.CV, direction: PortDirection.OUTPUT },
    ],

    colorScheme: BlockColorScheme.UTILITY,
    icon: 'Activity',

    description: 'Hann Window',
    documentation: 'Generates Hann window coefficient from phase (0-1). Use with phasor for windowing.',
};
