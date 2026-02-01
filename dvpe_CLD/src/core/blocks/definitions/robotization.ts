import { BlockDefinition, BlockCategory, BlockColorScheme, SignalType, PortDirection, ParameterType } from '@/types';

export const robotization: BlockDefinition = {
    id: 'robotization',
    displayName: 'Robotization',
    className: 'daisysp::Robotization<512>',
    headerFile: 'spectral/robotization.h',
    initMethod: 'Init',
    initParams: ['sample_rate'],
    processMethod: 'Process',
    description: 'DAFX FFT-based robotization effect',
    category: BlockCategory.EFFECTS,
    colorScheme: BlockColorScheme.FX,
    documentation: 'classes/classdaisysp_1_1Robotization.html',

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
