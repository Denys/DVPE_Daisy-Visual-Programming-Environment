import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const SelectBlock: BlockDefinition = {
    id: 'select',
    className: 'DVPE_Select',
    displayName: 'SELECT',
    category: BlockCategory.UTILITY,

    // headerFile: undefined, // Optional
    // namespace: undefined, // Optional
    // initMethod: undefined, // Optional
    // processMethod: undefined, // Optional

    cppInlineProcess: '({{gate}} > 0.5f ? {{in_b}} : {{in_a}})',

    parameters: [],

    ports: [
        {
            id: 'in_a',
            displayName: 'A',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Input when Gate is Low',
        },
        {
            id: 'in_b',
            displayName: 'B',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Input when Gate is High',
        },
        {
            id: 'gate',
            displayName: 'GATE',
            signalType: SignalType.TRIGGER,
            direction: PortDirection.INPUT,
            description: 'Select Control (0=A, 1=B)',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT,
            description: 'Selected Output',
        },
    ],

    colorScheme: BlockColorScheme.UTILITY,
    icon: 'GitBranch',

    description: 'Select between two inputs based on Gate',
    documentation: 'Outputs Input A when Gate is Low (0), Input B when Gate is High (1).',
};
