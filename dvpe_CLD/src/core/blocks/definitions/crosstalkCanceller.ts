import { BlockDefinition, BlockCategory, BlockColorScheme, SignalType, PortDirection, ParameterType } from '@/types';

export const crosstalkCanceller: BlockDefinition = {
    id: 'crosstalk_canceller',
    displayName: 'Crosstalk Cancel',
    className: 'daisysp::CrosstalkCanceller<256>',
    headerFile: 'spatial/crosstalk_canceller.h',
    initMethod: 'Init',
    initParams: ['sample_rate'],
    processMethod: 'Process',
    description: 'DAFX Stereo Crosstalk Canceller',
    category: BlockCategory.EFFECTS,
    colorScheme: BlockColorScheme.FX,
    documentation: 'classes/classdaisysp_1_1CrosstalkCanceller.html',

    ports: [
        {
            id: 'left_in',
            displayName: 'L In',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT
        },
        {
            id: 'right_in',
            displayName: 'R In',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT
        },
        {
            id: 'left_out',
            displayName: 'L Out',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT
        },
        {
            id: 'right_out',
            displayName: 'R Out',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT
        }
    ],

    parameters: [
        {
            id: 'angle',
            displayName: 'Spk Angle',
            type: ParameterType.FLOAT,
            defaultValue: 10.0,
            range: { min: 5.0, max: 30.0, step: 1.0 },
            unit: 'deg',
            cppSetter: 'SetSpeakerAngle'
        },
        {
            id: 'regularization',
            displayName: 'Regularization',
            type: ParameterType.FLOAT,
            defaultValue: 0.00001,
            range: { min: 0.000001, max: 0.001, step: 0.000001 },
            cppSetter: 'SetRegularization'
        }
    ]
};
