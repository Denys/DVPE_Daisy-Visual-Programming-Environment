import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

// Blackman window: 0.42 - 0.5*cos(2*PI*n/N) + 0.08*cos(4*PI*n/N)
export const WindowBlackmanBlock: BlockDefinition = {
    id: 'window_blackman',
    className: 'DVPE_WindowBlackman',
    displayName: 'BLACKMAN',
    category: BlockCategory.UTILITY,

    cppInlineProcess: '0.42f - 0.5f * cosf(2.0f * 3.14159265359f * {{phase}}) + 0.08f * cosf(4.0f * 3.14159265359f * {{phase}})',

    parameters: [],

    ports: [
        { id: 'phase', displayName: 'PHS', signalType: SignalType.CV, direction: PortDirection.INPUT },
        { id: 'out', displayName: 'OUT', signalType: SignalType.CV, direction: PortDirection.OUTPUT },
    ],

    colorScheme: BlockColorScheme.UTILITY,
    icon: 'Activity',

    description: 'Blackman Window',
    documentation: 'Generates Blackman window coefficient from phase (0-1).',
};
