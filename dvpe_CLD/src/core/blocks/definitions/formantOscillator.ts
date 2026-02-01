/**
 * Formant Oscillator Block Definition
 * daisysp::FormantOscillator - Vocal formant synthesis oscillator
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

export const FormantOscillatorBlock: BlockDefinition = {
    // Identity
    id: 'formant_oscillator',
    className: 'daisysp::FormantOscillator',
    displayName: 'FORMANT OSC',
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
            id: 'carrier_freq',
            displayName: 'Carrier Freq',
            type: ParameterType.FLOAT,
            cppSetter: 'SetCarrierFreq',
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
            description: 'Carrier (fundamental) frequency in Hz',
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
            description: 'Formant frequency for vocal character',
        },
        {
            id: 'phase_shift',
            displayName: 'Phase Shift',
            type: ParameterType.FLOAT,
            cppSetter: 'SetPhaseShift',
            defaultValue: 0.0,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Modulation',
            description: 'Phase shift amount (0-1)',
        },
    ],

    // Ports
    ports: [
        {
            id: 'carrier_freq_cv',
            displayName: 'CARR CV',
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
            id: 'phase_shift_cv',
            displayName: 'PHS CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Phase shift modulation',
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
    icon: 'Mic',

    // Documentation
    description: 'Vocal formant oscillator with phase reset',
    documentation: `
The FormantOscillator generates vocal-like sounds by combining a carrier frequency
with a formant frequency. It uses aliasing-free phase reset for clean formant synthesis.

Typical usage:
- Carrier: Voice fundamental (100-400 Hz)
- Formant: Vowel characteristic (800-3000 Hz)
- Phase Shift: Adds timbral variation

Originally from Mutable Instruments Plaits.
  `.trim(),
};
