/**
 * Oscillator Bank Block Definition
 * daisysp::OscillatorBank - Bank of 7 oscillators
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

export const OscillatorBankBlock: BlockDefinition = {
    // Identity
    id: 'oscillator_bank',
    className: 'daisysp::OscillatorBank',
    displayName: 'OSC BANK',
    category: BlockCategory.SOURCES,

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
            displayName: 'Frequency',
            type: ParameterType.FLOAT,
            cppSetter: 'SetFreq',
            defaultValue: 440.0,
            range: {
                min: 20.0,
                max: 20000.0,
                step: 1.0,
                curve: ParameterCurve.LOGARITHMIC,
            },
            unit: 'Hz',
            cvModulatable: true,
            group: 'Main',
            description: 'Base frequency for all oscillators',
        },
        {
            id: 'amp_saw_8',
            displayName: 'Saw 8\'',
            type: ParameterType.FLOAT,
            cppSetter: 'SetSingleAmp',
            cppSetterIndex: 0,
            defaultValue: 0.5,
            range: { min: 0.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: true,
            group: 'Amplitudes',
            description: 'Sawtooth 8\' Amplitude',
        },
        {
            id: 'amp_sqr_8',
            displayName: 'Sqr 8\'',
            type: ParameterType.FLOAT,
            cppSetter: 'SetSingleAmp',
            cppSetterIndex: 1,
            defaultValue: 0.0,
            range: { min: 0.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: true,
            group: 'Amplitudes',
            description: 'Square 8\' Amplitude',
        },
        {
            id: 'amp_saw_4',
            displayName: 'Saw 4\'',
            type: ParameterType.FLOAT,
            cppSetter: 'SetSingleAmp',
            cppSetterIndex: 2,
            defaultValue: 0.0,
            range: { min: 0.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: true,
            group: 'Amplitudes',
            description: 'Sawtooth 4\' Amplitude',
        },
        {
            id: 'amp_sqr_4',
            displayName: 'Sqr 4\'',
            type: ParameterType.FLOAT,
            cppSetter: 'SetSingleAmp',
            cppSetterIndex: 3,
            defaultValue: 0.0,
            range: { min: 0.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: true,
            group: 'Amplitudes',
            description: 'Square 4\' Amplitude',
        },
        {
            id: 'amp_saw_2',
            displayName: 'Saw 2\'',
            type: ParameterType.FLOAT,
            cppSetter: 'SetSingleAmp',
            cppSetterIndex: 4,
            defaultValue: 0.0,
            range: { min: 0.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: true,
            group: 'Amplitudes',
            description: 'Sawtooth 2\' Amplitude',
        },
        {
            id: 'amp_sqr_2',
            displayName: 'Sqr 2\'',
            type: ParameterType.FLOAT,
            cppSetter: 'SetSingleAmp',
            cppSetterIndex: 5,
            defaultValue: 0.0,
            range: { min: 0.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: true,
            group: 'Amplitudes',
            description: 'Square 2\' Amplitude',
        },
        {
            id: 'amp_saw_1',
            displayName: 'Saw 1\'',
            type: ParameterType.FLOAT,
            cppSetter: 'SetSingleAmp',
            cppSetterIndex: 6,
            defaultValue: 0.0,
            range: { min: 0.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: true,
            group: 'Amplitudes',
            description: 'Sawtooth 1\' Amplitude',
        },
        {
            id: 'gain',
            displayName: 'Gain',
            type: ParameterType.FLOAT,
            cppSetter: 'SetGain',
            defaultValue: 0.5,
            range: { min: 0.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: true,
            group: 'Main',
            description: 'Mix Gain',
        },
    ],

    // Ports
    ports: [
        {
            id: 'freq_cv',
            displayName: 'FREQ CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Frequency modulation for all oscillators',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            cppMethod: 'Process',
            description: 'Mixed audio output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.AUDIO,
    icon: 'Layers',

    // Documentation
    description: 'Bank of 7 oscillators for rich, detuned textures',
    documentation: `
OscillatorBank runs 7 oscillators with slight detuning for a thick, chorus-like sound.
Perfect for pad sounds, detuned leads, and supersaw-style synthesis.

All oscillators share the same base frequency but are internally detuned slightly
for natural beating and movement. Gain controls the overall output level.
  `.trim(),
};
