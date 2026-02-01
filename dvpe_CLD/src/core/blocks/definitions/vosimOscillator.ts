/**
 * Vosim Oscillator Block Definition
 * daisysp::VosimOscillator - Voice simulation oscillator
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

export const VosimOscillatorBlock: BlockDefinition = {
    // Identity
    id: 'vosim_oscillator',
    className: 'daisysp::VosimOscillator',
    displayName: 'VOSIM OSC',
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
            description: 'Carrier frequency in Hz',
        },
        {
            id: 'form1_freq',
            displayName: 'Formant 1 Freq',
            type: ParameterType.FLOAT,
            cppSetter: 'SetForm1Freq',
            defaultValue: 800.0,
            range: {
                min: 20.0,
                max: 20000.0,
                step: 1.0,
                curve: ParameterCurve.LOGARITHMIC,
            },
            unit: 'Hz',
            cvModulatable: true,
            group: 'Formants',
            description: 'First formant frequency',
        },
        {
            id: 'form2_freq',
            displayName: 'Formant 2 Freq',
            type: ParameterType.FLOAT,
            cppSetter: 'SetForm2Freq',
            defaultValue: 1200.0,
            range: {
                min: 20.0,
                max: 20000.0,
                step: 1.0,
                curve: ParameterCurve.LOGARITHMIC,
            },
            unit: 'Hz',
            cvModulatable: true,
            group: 'Formants',
            description: 'Second formant frequency',
        },
        {
            id: 'shape',
            displayName: 'Shape',
            type: ParameterType.FLOAT,
            cppSetter: 'SetShape',
            defaultValue: 0.0,
            range: {
                min: -1.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Modulation',
            description: 'Waveshaping amount (-1 to 1)',
        },
    ],

    // Ports
    ports: [
        {
            id: 'freq_cv',
            displayName: 'FREQ CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Carrier frequency modulation',
        },
        {
            id: 'form1_freq_cv',
            displayName: 'F1 CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Formant 1 frequency modulation',
        },
        {
            id: 'form2_freq_cv',
            displayName: 'F2 CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Formant 2 frequency modulation',
        },
        {
            id: 'shape_cv',
            displayName: 'SHAPE CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Shape modulation',
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
    icon: 'Radio',

    // Documentation
    description: 'VOSIM voice simulation oscillator',
    documentation: `
VOSIM (VOice SIMulation) creates vocal-like sounds using two sinewaves
multiplied by and synced to a carrier frequency.

Classic for synthetic choir and vocal pads. Developed by Kaegi and Tempelaars
in the 1970s. Originally from Mutable Instruments Plaits.

Formant 1 and 2 create vowel characteristics. Shape parameter adds harmonic complexity.
  `.trim(),
};
