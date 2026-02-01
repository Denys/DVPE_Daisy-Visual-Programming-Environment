/**
 * Variable Saw Oscillator Block Definition
 * daisysp::VariableSawOscillator - Saw with variable slope/notch
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

export const VariableSawOscillatorBlock: BlockDefinition = {
    // Identity
    id: 'variable_saw_oscillator',
    className: 'daisysp::VariableSawOscillator',
    displayName: 'VAR SAW OSC',
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
            description: 'Oscillator frequency in Hz',
        },
        {
            id: 'pw',
            displayName: 'PW / Notch',
            type: ParameterType.FLOAT,
            cppSetter: 'SetPW',
            defaultValue: 0.0,
            range: {
                min: -1.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Modulation',
            description: 'Notch depth or slope adjustment (-1 to 1)',
        },
        {
            id: 'waveshape',
            displayName: 'Waveshape',
            type: ParameterType.FLOAT,
            cppSetter: 'SetWaveshape',
            defaultValue: 0.0,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Modulation',
            description: '0 = notch, 1 = slope',
        },
    ],

    // Ports
    ports: [
        {
            id: 'freq_cv',
            displayName: 'FREQ CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Frequency modulation',
        },
        {
            id: 'pw_cv',
            displayName: 'PW CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'PW / notch modulation',
        },
        {
            id: 'waveshape_cv',
            displayName: 'SHAPE CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Waveshape modulation',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            cppMethod: 'Process',
            description: 'Audio output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.AUDIO,
    icon: 'TrendingUp',

    // Documentation
    description: 'Variable saw oscillator with slope and notch control',
    documentation: `
Variable Saw Oscillator produces a sawtooth wave with variable slope or notch.

Waveshape parameter selects between two modes:
- 0 (Notch): PW creates a notch in the waveform
- 1 (Slope): PW adjusts the slope asymmetry

Originally from Mutable Instruments Plaits. Great for aggressive leads and bass.
  `.trim(),
};
