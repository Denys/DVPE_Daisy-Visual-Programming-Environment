import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const ClampBlock: BlockDefinition = {
    id: 'clamp',
    className: 'DVPE_Clamp',
    displayName: 'CLAMP',
    category: BlockCategory.UTILITY,

    cppInlineProcess: 'fmaxf({{min}}, fminf({{max}}, {{in}}))',

    parameters: [],

    ports: [
        {
            id: 'in',
            displayName: 'IN',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Input Signal',
        },
        {
            id: 'min',
            displayName: 'MIN',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Minimum Value',
        },
        {
            id: 'max',
            displayName: 'MAX',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Maximum Value',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT,
        },
    ],

    colorScheme: BlockColorScheme.UTILITY,
    icon: 'Minimize',

    description: 'Constrain signal to range',
    documentation: 'Clamps input signal between Min and Max values.',
};
