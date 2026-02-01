import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const CentsToRatioBlock: BlockDefinition = {
    id: 'cents_to_ratio',
    className: 'DVPE_CentsToRatio',
    displayName: 'CENTS -> RATIO',
    category: BlockCategory.MATH,

    cppInlineProcess: 'powf(2.0f, {{cents}} * 0.0008333333f)',

    parameters: [],

    ports: [
        {
            id: 'cents',
            displayName: 'CENTS',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Pitch Shift (Cents)',
        },
        {
            id: 'out',
            displayName: 'RATIO',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT,
            description: 'Frequency Ratio',
        },
    ],

    colorScheme: BlockColorScheme.UTILITY,
    icon: 'Percent',

    description: 'Cents to Frequency Ratio',
    documentation: 'Converts pitch shift in cents to a frequency multiplication ratio (e.g., 1200 cents = 2.0).',
};
