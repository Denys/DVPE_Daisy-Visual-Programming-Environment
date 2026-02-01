/**
 * Flanger Block Definition
 * daisysp::Flanger - Flanger effect with LFO
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

export const FlangerBlock: BlockDefinition = {
    // Identity
    id: 'flanger',
    className: 'daisysp::Flanger',
    displayName: 'FLANGER',
    category: BlockCategory.EFFECTS,

    // C++ Code Generation
    headerFile: 'daisysp.h',
    namespace: 'daisysp',
    initMethod: 'Init',
    initParams: ['sample_rate'],
    processMethod: 'Process',
    processReturnType: 'float',

    // Parameters
    parameters: [
        {
            id: 'lfo_freq',
            displayName: 'Rate',
            type: ParameterType.FLOAT,
            cppSetter: 'SetLfoFreq',
            defaultValue: 0.3,
            range: {
                min: 0.01,
                max: 10.0,
                step: 0.01,
                curve: ParameterCurve.LOGARITHMIC,
            },
            unit: 'Hz',
            cvModulatable: true,
            group: 'Main',
            description: 'LFO modulation rate',
        },
        {
            id: 'lfo_depth',
            displayName: 'Depth',
            type: ParameterType.FLOAT,
            cppSetter: 'SetLfoDepth',
            defaultValue: 0.8,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Modulation depth',
        },
        {
            id: 'feedback',
            displayName: 'Feedback',
            type: ParameterType.FLOAT,
            cppSetter: 'SetFeedback',
            defaultValue: 0.5,
            range: {
                min: 0.0,
                max: 0.99,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Feedback for more intense effect',
        },
        {
            id: 'delay',
            displayName: 'Delay',
            type: ParameterType.FLOAT,
            cppSetter: 'SetDelay',
            defaultValue: 0.5,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
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
            id: 'lfo_freq_cv',
            displayName: 'RATE CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Rate modulation input',
        },
        {
            id: 'lfo_depth_cv',
            displayName: 'WIDTH CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Depth modulation input',
        },
        {
            id: 'feedback_cv',
            displayName: 'FDBK CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Feedback modulation input',
        },
        {
            id: 'delay_cv',
            displayName: 'DLY CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Delay modulation input',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            cppMethod: 'Process',
            description: 'Flanged output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.AUDIO,
    icon: 'Wind',

    // Documentation
    description: 'Flanger effect with LFO modulation',
    documentation: `
Classic flanger effect using a modulated short delay mixed with the original.
Creates a sweeping, jet-like sound characteristic of flanging.

Higher feedback creates more intense, resonant sweeps.
  `.trim(),
};
