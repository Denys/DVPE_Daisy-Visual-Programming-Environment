import { BlockDefinition, BlockCategory, BlockColorScheme, SignalType, PortDirection, ParameterType } from '@/types';

export const envelopeFollower: BlockDefinition = {
    id: 'envelope_follower',
    displayName: 'Env Follow',
    className: 'daisysp::EnvelopeFollower',
    headerFile: 'utility/envelopefollower.h',
    initMethod: 'Init',
    initParams: ['sample_rate'],
    processMethod: 'Process',
    description: 'DAFX Envelope Follower (Peak/RMS)',
    category: BlockCategory.UTILITY, // or DYNAMICS?
    colorScheme: BlockColorScheme.UTILITY,
    documentation: 'classes/classdaisysp_1_1EnvelopeFollower.html',

    ports: [
        {
            id: 'in',
            displayName: 'In',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            cppParam: 'in'
        },
        {
            id: 'env',
            displayName: 'Env CV',
            signalType: SignalType.CV, // It outputs CV, logic is fine.
            direction: PortDirection.OUTPUT
        }
    ],

    parameters: [
        {
            id: 'attack',
            displayName: 'Attack',
            type: ParameterType.FLOAT,
            defaultValue: 0.01,
            range: { min: 0.0001, max: 1.0, step: 0.0001 },
            unit: 's',
            cppSetter: 'SetAttackTime'
        },
        {
            id: 'release',
            displayName: 'Release',
            type: ParameterType.FLOAT,
            defaultValue: 0.1,
            range: { min: 0.001, max: 5.0, step: 0.001 },
            unit: 's',
            cppSetter: 'SetReleaseTime'
        },
        {
            id: 'mode',
            displayName: 'Mode',
            type: ParameterType.ENUM,
            defaultValue: 0,
            cppSetter: 'SetMode',
            enumValues: [
                { label: 'Peak', value: 0, cppValue: 'EnvelopeMode::Peak' },
                { label: 'RMS', value: 1, cppValue: 'EnvelopeMode::RMS' }
            ]
        }
    ]
};
