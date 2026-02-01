import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const MidSideDecodeBlock: BlockDefinition = {
    id: 'mid_side_decode',
    className: 'DVPE_MidSideDecode',
    displayName: 'M/S DEC',
    category: BlockCategory.UTILITY,

    cppProcessTemplate: `
    {{left}} = {{mid}} + {{side}};
    {{right}} = {{mid}} - {{side}};
  `,

    parameters: [],

    ports: [
        { id: 'mid', displayName: 'M', signalType: SignalType.AUDIO, direction: PortDirection.INPUT },
        { id: 'side', displayName: 'S', signalType: SignalType.AUDIO, direction: PortDirection.INPUT },
        { id: 'left', displayName: 'L', signalType: SignalType.AUDIO, direction: PortDirection.OUTPUT },
        { id: 'right', displayName: 'R', signalType: SignalType.AUDIO, direction: PortDirection.OUTPUT },
    ],

    colorScheme: BlockColorScheme.UTILITY,
    icon: 'Columns',

    description: 'Mid/Side Decoder',
    documentation: 'Converts Mid/Side back to stereo L/R. L = M+S, R = M-S.',
};
