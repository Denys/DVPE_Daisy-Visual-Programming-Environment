import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const MergerBlock: BlockDefinition = {
    id: 'merger',
    className: 'DVPE_Merger',
    displayName: 'MERGE',
    category: BlockCategory.UTILITY,

    // Sums all inputs (like a mixer without gain controls)
    cppProcessTemplate: `
    {{out}} = {{in1}} + {{in2}} + {{in3}} + {{in4}};
  `,

    parameters: [],

    ports: [
        { id: 'in1', displayName: 'IN1', signalType: SignalType.AUDIO, direction: PortDirection.INPUT },
        { id: 'in2', displayName: 'IN2', signalType: SignalType.AUDIO, direction: PortDirection.INPUT },
        { id: 'in3', displayName: 'IN3', signalType: SignalType.AUDIO, direction: PortDirection.INPUT },
        { id: 'in4', displayName: 'IN4', signalType: SignalType.AUDIO, direction: PortDirection.INPUT },
        { id: 'out', displayName: 'OUT', signalType: SignalType.AUDIO, direction: PortDirection.OUTPUT },
    ],

    colorScheme: BlockColorScheme.UTILITY,
    icon: 'GitMerge',

    description: 'Signal Merger',
    documentation: 'Sums up to 4 input signals. Unconnected inputs contribute 0.',
};
