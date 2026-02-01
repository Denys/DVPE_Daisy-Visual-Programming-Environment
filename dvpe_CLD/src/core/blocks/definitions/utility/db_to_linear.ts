import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const DbToLinearBlock: BlockDefinition = {
    id: 'db_to_linear',
    className: 'DVPE_DbToLinear',
    displayName: 'dB -> LIN',
    category: BlockCategory.UTILITY,

    cppInlineProcess: 'powf(10.0f, {{in}} * 0.05f)',

    parameters: [],

    ports: [
        {
            id: 'in',
            displayName: 'dB',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Input Value (Decibels)',
        },
        {
            id: 'out',
            displayName: 'LIN',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT,
            description: 'Linear Amplitude',
        },
    ],

    colorScheme: BlockColorScheme.UTILITY,
    icon: 'BarChart2',

    description: 'Decibels to Linear conversion',
    documentation: 'Converts a value in decibels to linear amplitude (e.g., -6dB ≈ 0.5).',
};
