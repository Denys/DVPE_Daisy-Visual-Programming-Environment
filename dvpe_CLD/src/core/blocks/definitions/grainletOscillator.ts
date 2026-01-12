/**
 * GrainletOscillator Block Definition
 * daisysp::GrainletOscillator - Granular oscillator with formant control
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

export const GrainletOscillatorBlock: BlockDefinition = {
    // Identity
    id: 'grainlet_oscillator',
    className: 'daisysp::GrainletOscillator',
    displayName: 'GRAINLET',
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
            defaultValue: 220.0,
            range: {
                min: 20.0,
                max: 20000.0,
                step: 1.0,
                curve: ParameterCurve.LOGARITHMIC,
            },
            unit: 'Hz',
            cvModulatable: true,
            group: 'Main',
            description: 'Base frequency in Hz',
        },
        {
            id: 'formant_freq',
            displayName: 'Formant',
            type: ParameterType.FLOAT,
            cppSetter: 'SetFormantFreq',
            defaultValue: 800.0,
            range: {
                min: 20.0,
                max: 10000.0,
                step: 1.0,
                curve: ParameterCurve.LOGARITHMIC,
            },
            unit: 'Hz',
            cvModulatable: true,
            group: 'Formant',
            description: 'Formant frequency (spectral peak)',
        },
        {
            id: 'shape',
            displayName: 'Shape',
            type: ParameterType.FLOAT,
            cppSetter: 'SetShape',
            defaultValue: 0.5,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Grain window shape',
        },
        {
            id: 'bleed',
            displayName: 'Bleed',
            type: ParameterType.FLOAT,
            cppSetter: 'SetBleed',
            defaultValue: 0.0,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Inter-grain overlap amount',
        },
    ],

    // Ports
    ports: [
        {
            id: 'freq_cv',
            displayName: 'FREQ CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Frequency modulation input',
        },
        {
            id: 'formant_freq_cv',
            displayName: 'FORM CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Formant frequency modulation input',
        },
        {
            id: 'shape_cv',
            displayName: 'SHPE CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Shape modulation input',
        },
        {
            id: 'bleed_cv',
            displayName: 'BLED CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Bleed modulation input',
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
    icon: 'Wheat',

    // Documentation
    description: 'Granular oscillator with formant control',
    documentation: `
GrainletOscillator creates complex timbres through granular synthesis.
Formant frequency controls the spectral peak of the grains.
Shape morphs between different grain window shapes.
Bleed adds inter-grain overlap for smoother or rougher textures.

Excellent for vocal-like sounds, evolving textures, and experimental timbres.
  `.trim(),
};
