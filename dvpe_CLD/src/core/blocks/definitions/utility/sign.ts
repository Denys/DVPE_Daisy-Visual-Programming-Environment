import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const SignBlock: BlockDefinition = {
    id: 'sign',
    className: 'DVPE_Sign',
    displayName: 'SIGN',
    category: BlockCategory.UTILITY,

    cppInlineProcess: '({{in}} > 0.0f ? 1.0f : ({{in}} < 0.0f ? -1.0f : 0.0f))',

    parameters: [],

    ports: [
        {
            id: 'in',
            displayName: 'IN',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Input signal',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT,
            description: 'Sign (-1, 0, 1)',
        },
    ],

    colorScheme: BlockColorScheme.UTILITY,
    icon: 'Sliders',

    description: 'Extract sign of signal',
    documentation: 'Outputs 1.0 if positive, -1.0 if negative, 0.0 if zero.',
};
