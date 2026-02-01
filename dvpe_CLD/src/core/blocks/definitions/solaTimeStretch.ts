import { BlockDefinition, BlockCategory, BlockColorScheme, SignalType, PortDirection, ParameterType } from '@/types';

export const solaTimeStretch: BlockDefinition = {
    id: 'sola_time_stretch',
    displayName: 'Time Stretch',
    className: 'daisysp::SOLATimeStretch<4096, 2048>',
    headerFile: 'effects/sola_time_stretch.h',
    initMethod: 'Init',
    initParams: ['sample_rate'],
    processMethod: 'GetOutput', // Streaming API needs special handling
    description: 'DAFX SOLA Time Stretch Algorithm',
    category: BlockCategory.EFFECTS,
    colorScheme: BlockColorScheme.FX,
    documentation: 'classes/classdaisysp_1_1SOLATimeStretch.html',

    ports: [
        {
            id: 'in',
            displayName: 'In',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            cppParam: 'in' // Actually FeedInput(in) is called separately
        },
        {
            id: 'out',
            displayName: 'Out',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT
        }
    ],

    parameters: [
        {
            id: 'stretch',
            displayName: 'Stretch',
            type: ParameterType.FLOAT,
            defaultValue: 1.0,
            range: { min: 0.25, max: 2.0, step: 0.01 },
            unit: 'x',
            cppSetter: 'SetTimeStretch'
        }
    ]
};
