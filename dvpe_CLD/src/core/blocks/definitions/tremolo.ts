/**
 * Tremolo Block Definition
 * daisysp::Tremolo - Amplitude modulation effect
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

export const TremoloBlock: BlockDefinition = {
    // Identity
    id: 'tremolo',
    className: 'daisysp::Tremolo',
    displayName: 'TREMOLO',
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
            id: 'freq',
            displayName: 'Rate',
            type: ParameterType.FLOAT,
            cppSetter: 'SetFreq',
            defaultValue: 5.0,
            range: {
                min: 0.1,
                max: 20.0,
                step: 0.1,
                curve: ParameterCurve.LOGARITHMIC,
            },
            unit: 'Hz',
            cvModulatable: true,
            group: 'Main',
            description: 'Tremolo rate',
        },
        {
            id: 'depth',
            displayName: 'Depth',
            type: ParameterType.FLOAT,
            cppSetter: 'SetDepth',
            defaultValue: 0.5,
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
            id: 'waveform',
            displayName: 'Waveform',
            type: ParameterType.ENUM,
            cppSetter: 'SetWaveform',
            defaultValue: 0,
            enumValues: [
                { value: 0, label: 'Sine', cppValue: 'Oscillator::WAVE_SIN' },
                { value: 1, label: 'Triangle', cppValue: 'Oscillator::WAVE_TRI' },
                { value: 2, label: 'Square', cppValue: 'Oscillator::WAVE_SQUARE' },
            ],
            cvModulatable: true,
            group: 'Main',
            description: 'LFO waveform shape',
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
            id: 'freq_cv',
            displayName: 'RATE CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Rate modulation',
        },
        {
            id: 'depth_cv',
            displayName: 'DEPTH CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Depth modulation',
        },
        {
            id: 'waveform_cv',
            displayName: 'WAVE CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Waveform selection modulation',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            cppMethod: 'Process',
            description: 'Tremolo output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.AUDIO,
    icon: 'Activity',

    // Documentation
    description: 'Amplitude modulation tremolo effect',
    documentation: `
Classic tremolo effect that modulates the audio amplitude with an LFO.
Creates pulsing volume changes at the set rate.
Choose different waveforms for varied modulation character.
    `.trim(),
};
