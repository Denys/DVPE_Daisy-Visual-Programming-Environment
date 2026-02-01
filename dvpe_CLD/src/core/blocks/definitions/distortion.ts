/**
 * Distortion Block Definition
 * Tube-style waveshaper distortion - inline implementation
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

export const DistortionBlock: BlockDefinition = {
    // Identity
    id: 'distortion',
    className: 'inline::Distortion',
    displayName: 'DISTORTION',
    category: BlockCategory.EFFECTS,

    // C++ Code Generation - inline
    headerFile: 'daisysp.h',
    namespace: 'daisysp',
    initMethod: '',
    initParams: [],
    processMethod: '',
    processReturnType: 'float',

    // Parameters
    parameters: [
        {
            id: 'drive',
            displayName: 'Drive',
            type: ParameterType.FLOAT,
            cppSetter: '',
            defaultValue: 0.5,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Distortion drive amount',
        },
        {
            id: 'tone',
            displayName: 'Tone',
            type: ParameterType.FLOAT,
            cppSetter: '',
            defaultValue: 0.5,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Tone control (low-high)',
        },
        {
            id: 'level',
            displayName: 'Level',
            type: ParameterType.FLOAT,
            cppSetter: '',
            defaultValue: 0.5,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Output level',
        },
    ],

    // Ports
    ports: [
        {
            id: 'in',
            displayName: 'IN',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            description: 'Audio input',
        },
        {
            id: 'drive_cv',
            displayName: 'DRIVE CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Drive modulation',
        },
        {
            id: 'tone_cv',
            displayName: 'TONE CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Tone modulation',
        },
        {
            id: 'level_cv',
            displayName: 'LEVEL CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Level modulation',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            description: 'Distorted output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.AUDIO,
    icon: 'Flame',

    // Documentation
    description: 'Tube-style distortion with tone control',
    documentation: `
Asymmetric tube-style distortion with tone shaping.
Drive controls the amount of harmonic distortion.
Tone adjusts the frequency balance of the distorted signal.
    `.trim(),
};
