import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const MidSideEncodeBlock: BlockDefinition = {
    id: 'mid_side_encode',
    className: 'DVPE_MidSideEncode',
    displayName: 'M/S ENC',
    category: BlockCategory.UTILITY,

    cppInlineProcess: '({{left}} + {{right}}) * 0.5f',

    // Need second output for Side
    cppProcessTemplate: `
    {{mid}} = ({{left}} + {{right}}) * 0.5f;
    {{side}} = ({{left}} - {{right}}) * 0.5f;
  `,

    parameters: [],

    ports: [
        { id: 'left', displayName: 'L', signalType: SignalType.AUDIO, direction: PortDirection.INPUT },
        { id: 'right', displayName: 'R', signalType: SignalType.AUDIO, direction: PortDirection.INPUT },
        { id: 'mid', displayName: 'M', signalType: SignalType.AUDIO, direction: PortDirection.OUTPUT },
        { id: 'side', displayName: 'S', signalType: SignalType.AUDIO, direction: PortDirection.OUTPUT },
    ],

    colorScheme: BlockColorScheme.UTILITY,
    icon: 'Columns',

    description: 'Mid/Side Encoder',
    documentation: 'Converts stereo L/R to Mid/Side. Mid = (L+R)/2, Side = (L-R)/2.',
};
