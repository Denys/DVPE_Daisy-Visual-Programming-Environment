/**
 * StereoMixer Block Definition
 * 4-channel stereo mixer - inline implementation
 */

import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    ParameterType,
    ParameterCurve,
    SignalType,
    PortDirection,
} from '@/types';

export const StereoMixerBlock: BlockDefinition = {
    // Identity
    id: 'stereo_mixer',
    className: 'inline::StereoMixer',
    displayName: 'ST MIXER',
    category: BlockCategory.UTILITY,

    // C++ Code Generation - inline
    headerFile: 'daisysp.h',
    namespace: 'daisysp',
    initMethod: '',
    initParams: [],
    processMethod: '',
    processReturnType: 'void',

    // Parameters
    parameters: [
        {
            id: 'ch1_level',
            displayName: 'Ch1 Level',
            type: ParameterType.FLOAT,
            cppSetter: '',
            defaultValue: 0.8,
            range: { min: 0.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: false,
            group: 'Channel 1',
            description: 'Channel 1 level',
        },
        {
            id: 'ch1_pan',
            displayName: 'Ch1 Pan',
            type: ParameterType.FLOAT,
            cppSetter: '',
            defaultValue: 0.5,
            range: { min: 0.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: false,
            group: 'Channel 1',
            description: 'Channel 1 pan',
        },
        {
            id: 'ch2_level',
            displayName: 'Ch2 Level',
            type: ParameterType.FLOAT,
            cppSetter: '',
            defaultValue: 0.8,
            range: { min: 0.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: false,
            group: 'Channel 2',
            description: 'Channel 2 level',
        },
        {
            id: 'ch2_pan',
            displayName: 'Ch2 Pan',
            type: ParameterType.FLOAT,
            cppSetter: '',
            defaultValue: 0.5,
            range: { min: 0.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: false,
            group: 'Channel 2',
            description: 'Channel 2 pan',
        },
        {
            id: 'ch3_level',
            displayName: 'Ch3 Level',
            type: ParameterType.FLOAT,
            cppSetter: '',
            defaultValue: 0.8,
            range: { min: 0.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: false,
            group: 'Channel 3',
            description: 'Channel 3 level',
        },
        {
            id: 'ch3_pan',
            displayName: 'Ch3 Pan',
            type: ParameterType.FLOAT,
            cppSetter: '',
            defaultValue: 0.5,
            range: { min: 0.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: false,
            group: 'Channel 3',
            description: 'Channel 3 pan',
        },
        {
            id: 'ch4_level',
            displayName: 'Ch4 Level',
            type: ParameterType.FLOAT,
            cppSetter: '',
            defaultValue: 0.8,
            range: { min: 0.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: false,
            group: 'Channel 4',
            description: 'Channel 4 level',
        },
        {
            id: 'ch4_pan',
            displayName: 'Ch4 Pan',
            type: ParameterType.FLOAT,
            cppSetter: '',
            defaultValue: 0.5,
            range: { min: 0.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: false,
            group: 'Channel 4',
            description: 'Channel 4 pan',
        },
    ],

    // Ports
    ports: [
        {
            id: 'ch1',
            displayName: 'CH1',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            description: 'Channel 1 input',
        },
        {
            id: 'ch2',
            displayName: 'CH2',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            description: 'Channel 2 input',
        },
        {
            id: 'ch3',
            displayName: 'CH3',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            description: 'Channel 3 input',
        },
        {
            id: 'ch4',
            displayName: 'CH4',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            description: 'Channel 4 input',
        },
        {
            id: 'left',
            displayName: 'L',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            description: 'Left output',
        },
        {
            id: 'right',
            displayName: 'R',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            description: 'Right output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.AUDIO,
    icon: 'Sliders',

    // Documentation
    description: '4-channel stereo mixer with pan controls',
    documentation: `
Mixes up to 4 mono inputs to stereo with level and pan per channel.
Pan at 0 = left, 0.5 = center, 1 = right.
Each channel has independent level and pan controls.
    `.trim(),
};
