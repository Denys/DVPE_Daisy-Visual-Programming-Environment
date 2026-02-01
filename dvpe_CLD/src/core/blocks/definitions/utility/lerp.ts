import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const LerpBlock: BlockDefinition = {
    id: 'lerp',
    className: 'DVPE_Lerp',
    displayName: 'LERP',
    category: BlockCategory.MATH,

    cppInlineProcess: '{{a}} + ({{b}} - {{a}}) * {{t}}',

    parameters: [],

    ports: [
        {
            id: 'a',
            displayName: 'A',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Start Value (t=0)',
        },
        {
            id: 'b',
            displayName: 'B',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'End Value (t=1)',
        },
        {
            id: 't',
            displayName: 'Mix',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Interpolation Factor (0-1)',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT,
            description: 'Interpolated Output',
        },
    ],

    colorScheme: BlockColorScheme.UTILITY,
    icon: 'GitMerge',

    description: 'Linear Interpolation',
    documentation: 'Linearly interpolates between A and B based on T.',
};
