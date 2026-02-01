import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const SplitterBlock: BlockDefinition = {
    id: 'splitter',
    className: 'DVPE_Splitter',
    displayName: 'SPLIT',
    category: BlockCategory.UTILITY,

    // Simply copies input to multiple outputs
    cppProcessTemplate: `
    {{out1}} = {{in}};
    {{out2}} = {{in}};
    {{out3}} = {{in}};
    {{out4}} = {{in}};
  `,

    parameters: [],

    ports: [
        { id: 'in', displayName: 'IN', signalType: SignalType.AUDIO, direction: PortDirection.INPUT },
        { id: 'out1', displayName: 'OUT1', signalType: SignalType.AUDIO, direction: PortDirection.OUTPUT },
        { id: 'out2', displayName: 'OUT2', signalType: SignalType.AUDIO, direction: PortDirection.OUTPUT },
        { id: 'out3', displayName: 'OUT3', signalType: SignalType.AUDIO, direction: PortDirection.OUTPUT },
        { id: 'out4', displayName: 'OUT4', signalType: SignalType.AUDIO, direction: PortDirection.OUTPUT },
    ],

    colorScheme: BlockColorScheme.UTILITY,
    icon: 'GitBranch',

    description: 'Signal Splitter',
    documentation: 'Copies input signal to 4 outputs. Use only the outputs you need.',
};
