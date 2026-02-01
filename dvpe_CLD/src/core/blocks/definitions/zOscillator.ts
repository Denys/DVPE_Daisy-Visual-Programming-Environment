/**
 * Z Oscillator Block Definition
 * daisysp::ZOscillator - Complex modulation oscillator
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

export const ZOscillatorBlock: BlockDefinition = {
    // Identity
    id: 'z_oscillator',
    className: 'daisysp::ZOscillator',
    displayName: 'Z OSC',
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
            id: 'formant_freq',
            displayName: 'Formant Freq',
            type: ParameterType.FLOAT,
            cppSetter: 'SetFormantFreq',
            defaultValue: 1000.0,
            range: {
                min: 20.0,
                max: 20000.0,
                step: 1.0,
                curve: ParameterCurve.LOGARITHMIC,
            },
            unit: 'Hz',
            cvModulatable: true,
            group: 'Main',
            description: 'Formant oscillator frequency',
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
            group: 'Modulation',
            description: 'Waveform contour (0-1)',
        },
        {
            id: 'mode',
            displayName: 'Mode',
            type: ParameterType.FLOAT,
            cppSetter: 'SetMode',
            defaultValue: 0.0,
            range: {
                min: -1.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Modulation',
            description: 'Phase shift/offset mode (-1 to 1)',
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
            id: 'formant_freq_cv',
            displayName: 'FORM CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Formant frequency modulation',
        },
        {
            id: 'shape_cv',
            displayName: 'SHAPE CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Shape modulation',
        },
        {
            id: 'mode_cv',
            displayName: 'MODE CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Mode modulation',
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
    icon: 'Zap',

    // Documentation
    description: 'Complex modulation oscillator with formant sync',
    documentation: `
Z Oscillator creates complex timbres by multiplying and syncing a sine wave
to a carrier frequency.

Mode parameter (<1/3 = phase shift, >2/3 = offset, between = both).
Shape adjusts waveform contour for metallic and bell-like sounds.

Originally from Mutable Instruments Plaits.
  `.trim(),
};
