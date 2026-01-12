/**
 * Pluck Block Definition
 * daisysp::Pluck - Karplus-Strong plucked string synthesis
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

export const PluckBlock: BlockDefinition = {
    // Identity
    id: 'pluck',
    className: 'daisysp::Pluck',
    displayName: 'PLUCK',
    category: BlockCategory.PHYSICAL_MODELING,

    // C++ Code Generation
    headerFile: 'daisysp.h',
    namespace: 'daisysp',
    initMethod: 'Init',
    initParams: ['sample_rate', '256', 'PLUCK_MODE_RECURSIVE'],
    processMethod: 'Process',
    processReturnType: 'float',

    // Parameters
    parameters: [
        {
            id: 'freq',
            displayName: 'Frequency',
            type: ParameterType.FLOAT,
            cppSetter: 'SetFreq',
            defaultValue: 220.0,
            range: {
                min: 20.0,
                max: 2000.0,
                step: 1.0,
                curve: ParameterCurve.LOGARITHMIC,
            },
            unit: 'Hz',
            cvModulatable: true,
            group: 'Main',
            description: 'Pluck frequency (pitch)',
        },
        {
            id: 'decay',
            displayName: 'Decay',
            type: ParameterType.FLOAT,
            cppSetter: 'SetDecay',
            defaultValue: 0.9,
            range: {
                min: 0.1,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Decay time',
        },
        {
            id: 'amp',
            displayName: 'Amplitude',
            type: ParameterType.FLOAT,
            cppSetter: 'SetAmp',
            defaultValue: 0.8,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Output amplitude',
        },
        {
            id: 'damp',
            displayName: 'Damping',
            type: ParameterType.FLOAT,
            cppSetter: 'SetDamp',
            defaultValue: 0.5,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'High frequency damping',
        },
    ],

    // Ports
    ports: [
        {
            id: 'trig',
            displayName: 'TRIG',
            signalType: SignalType.TRIGGER,
            direction: PortDirection.INPUT,
            cppParam: 'trig',
            description: 'Trigger to pluck the string',
        },
        {
            id: 'freq_cv',
            displayName: 'FREQ CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Frequency modulation',
        },
        {
            id: 'decay_cv',
            displayName: 'DECAY CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Decay modulation',
        },
        {
            id: 'amp_cv',
            displayName: 'AMP CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Amplitude modulation',
        },
        {
            id: 'damp_cv',
            displayName: 'DAMP CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Damping modulation',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            cppMethod: 'Process',
            description: 'Pluck output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.AUDIO,
    icon: 'Guitar',

    // Documentation
    description: 'Karplus-Strong plucked string synthesis',
    documentation: `
Physical model of a plucked string using the Karplus-Strong algorithm.
Trigger input excites the string, producing a natural decay.
Damping controls the brightness of the string tone.
    `.trim(),
};
