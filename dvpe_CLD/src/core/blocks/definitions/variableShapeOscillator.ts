/**
 * Variable Shape Oscillator Block Definition
 * daisysp::VariableShapeOscillator - Morphing waveform oscillator with sync
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

export const VariableShapeOscillatorBlock: BlockDefinition = {
    // Identity
    id: 'variable_shape_oscillator',
    className: 'daisysp::VariableShapeOscillator',
    displayName: 'VAR SHAPE OSC',
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
            displayName: 'Pulse Width / Shape',
            type: ParameterType.FLOAT,
            cppSetter: 'SetPW',
            defaultValue: 0.5,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Modulation',
            description: 'PW for square, shape for saw/ramp/tri (0-1)',
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
            description: '0 = saw/ramp/tri, 1 = square',
        },
        {
            id: 'sync_freq',
            displayName: 'Sync Freq',
            type: ParameterType.FLOAT,
            cppSetter: 'SetSyncFreq',
            defaultValue: 440.0,
            range: {
                min: 20.0,
                max: 20000.0,
                step: 1.0,
                curve: ParameterCurve.LOGARITHMIC,
            },
            unit: 'Hz',
            cvModulatable: true,
            group: 'Sync',
            description: 'Hard sync oscillator frequency',
        },
        {
            id: 'sync_enable',
            displayName: 'Sync Enable',
            type: ParameterType.BOOL,
            cppSetter: 'SetSync',
            defaultValue: false,
            group: 'Sync',
            description: 'Enable hard sync',
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
            description: 'Pulse width / shape modulation',
        },
        {
            id: 'waveshape_cv',
            displayName: 'SHAPE CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Waveshape modulation',
        },
        {
            id: 'sync_freq_cv',
            displayName: 'SYNC CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Sync frequency modulation',
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
    icon: 'WaveSine',

    // Documentation
    description: 'Continuously variable waveform oscillator with hard sync',
    documentation: `
Variable Shape Oscillator morphs between saw/ramp/triangle (waveshape=0) 
and square wave (waveshape=1). The PW parameter controls pulse width for square,
or shape variation for saw/ramp/tri.

Hard sync can be enabled for classic sync sweep effects. Sync frequency should
typically be lower than the main frequency.

Originally from Mutable Instruments Plaits.
  `.trim(),
};
