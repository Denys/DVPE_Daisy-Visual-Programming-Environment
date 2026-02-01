import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const LinearToDbBlock: BlockDefinition = {
    id: 'linear_to_db',
    className: 'DVPE_LinearToDb',
    displayName: 'LIN -> dB',
    category: BlockCategory.UTILITY,

    cppInlineProcess: '20.0f * log10f(fmaxf(fabsf({{in}}), 0.00001f))',

    parameters: [],

    ports: [
        {
            id: 'in',
            displayName: 'LIN',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Linear Amplitude',
        },
        {
            id: 'out',
            displayName: 'dB',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT,
            description: 'Output Value (Decibels)',
        },
    ],

    colorScheme: BlockColorScheme.UTILITY,
    icon: 'BarChart2',

    description: 'Linear to Decibels conversion',
    documentation: 'Converts linear amplitude to decibels. Protected against log(0).',
};
