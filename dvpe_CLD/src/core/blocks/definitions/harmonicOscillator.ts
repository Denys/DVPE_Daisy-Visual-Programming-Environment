/**
 * Harmonic Oscillator Block Definition
 * daisysp::HarmonicOscillator - Additive synthesis with harmonic control
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

export const HarmonicOscillatorBlock: BlockDefinition = {
    // Identity
    id: 'harmonic_oscillator',
    className: 'daisysp::HarmonicOscillator<16>',
    displayName: 'HARMONIC OSC',
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
            defaultValue: 110.0,
            range: {
                min: 20.0,
                max: 2000.0,
                step: 1.0,
                curve: ParameterCurve.LOGARITHMIC,
            },
            unit: 'Hz',
            cvModulatable: true,
            group: 'Main',
            description: 'Root frequency in Hz',
        },
        {
            id: 'first_harm_idx',
            displayName: 'First Harmonic',
            type: ParameterType.INT,
            cppSetter: 'SetFirstHarmIdx',
            defaultValue: 1,
            range: {
                min: 1,
                max: 64,
                step: 1,
            },
            cvModulatable: false,
            group: 'Harmonics',
            description: 'Starting harmonic index (1 = fundamental)',
        },
        {
            id: 'amp_1',
            displayName: 'Amp 1',
            type: ParameterType.FLOAT,
            cppSetter: 'SetSingleAmp',
            defaultValue: 1.0,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Harmonics',
            description: 'Amplitude of 1st harmonic',
        },
        {
            id: 'amp_2',
            displayName: 'Amp 2',
            type: ParameterType.FLOAT,
            cppSetter: 'SetSingleAmp',
            defaultValue: 0.5,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Harmonics',
            description: 'Amplitude of 2nd harmonic',
        },
        {
            id: 'amp_3',
            displayName: 'Amp 3',
            type: ParameterType.FLOAT,
            cppSetter: 'SetSingleAmp',
            defaultValue: 0.33,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Harmonics',
            description: 'Amplitude of 3rd harmonic',
        },
        {
            id: 'amp_4',
            displayName: 'Amp 4',
            type: ParameterType.FLOAT,
            cppSetter: 'SetSingleAmp',
            defaultValue: 0.25,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Harmonics',
            description: 'Amplitude of 4th harmonic',
        },
        {
            id: 'amp_5',
            displayName: 'Amp 5',
            type: ParameterType.FLOAT,
            cppSetter: 'SetSingleAmp',
            defaultValue: 0.2,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Harmonics',
            description: 'Amplitude of 5th harmonic',
        },
        {
            id: 'amp_6',
            displayName: 'Amp 6',
            type: ParameterType.FLOAT,
            cppSetter: 'SetSingleAmp',
            defaultValue: 0.16,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Harmonics',
            description: 'Amplitude of 6th harmonic',
        },
        {
            id: 'amp_7',
            displayName: 'Amp 7',
            type: ParameterType.FLOAT,
            cppSetter: 'SetSingleAmp',
            defaultValue: 0.14,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Harmonics',
            description: 'Amplitude of 7th harmonic',
        },
        {
            id: 'amp_8',
            displayName: 'Amp 8',
            type: ParameterType.FLOAT,
            cppSetter: 'SetSingleAmp',
            defaultValue: 0.125,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Harmonics',
            description: 'Amplitude of 8th harmonic',
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
            id: 'amp_1_cv',
            displayName: 'A1 CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Harmonic 1 amplitude modulation',
        },
        {
            id: 'amp_2_cv',
            displayName: 'A2 CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Harmonic 2 amplitude modulation',
        },
        {
            id: 'amp_3_cv',
            displayName: 'A3 CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Harmonic 3 amplitude modulation',
        },
        {
            id: 'amp_4_cv',
            displayName: 'A4 CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Harmonic 4 amplitude modulation',
        },
        {
            id: 'amp_5_cv',
            displayName: 'A5 CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Harmonic 5 amplitude modulation',
        },
        {
            id: 'amp_6_cv',
            displayName: 'A6 CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Harmonic 6 amplitude modulation',
        },
        {
            id: 'amp_7_cv',
            displayName: 'A7 CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Harmonic 7 amplitude modulation',
        },
        {
            id: 'amp_8_cv',
            displayName: 'A8 CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Harmonic 8 amplitude modulation',
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
    icon: 'BarChart',

    // Documentation
    description: 'Additive synthesis oscillator with 16 harmonics',
    documentation: `
Harmonic Oscillator uses Chebyshev polynomials for efficient additive synthesis.
Controls 8 of 16 internal harmonics (remaining use default decay).

First Harmonic Index offsets the harmonic series (e.g., 3 starts at 3rd harmonic).
Amplitudes should sum to < 1 to avoid clipping.

Originally from Mutable Instruments Plaits. Great for organ, bell, and metallic tones.
  `.trim(),
};
