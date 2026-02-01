import { BlockDefinition, BlockCategory, BlockColorScheme, SignalType, PortDirection, ParameterType } from '@/types';

export const whisperization: BlockDefinition = {
    id: 'whisperization',
    displayName: 'Whisperization',
    className: 'daisysp::Whisperization<512>',
    headerFile: 'spectral/whisperization.h',
    initMethod: 'Init',
    initParams: ['sample_rate'],
    processMethod: 'Process',
    description: 'DAFX FFT-based whisperization effect',
    category: BlockCategory.EFFECTS,
    colorScheme: BlockColorScheme.FX,
    documentation: 'classes/classdaisysp_1_1Whisperization.html',

    ports: [
        {
            id: 'in',
            displayName: 'In',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            cppParam: 'in'
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
            id: 'mix',
            displayName: 'Mix',
            type: ParameterType.FLOAT,
            defaultValue: 1.0,
            range: { min: 0.0, max: 1.0, step: 0.01 },
            unit: '%',
            cppSetter: 'SetMix'
        }
    ]
};
