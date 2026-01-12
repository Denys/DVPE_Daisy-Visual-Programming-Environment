/**
 * SVF (State Variable Filter) Block Definition
 * daisysp::Svf - State Variable Filter with multiple simultaneous outputs
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

export const SvfBlock: BlockDefinition = {
    // Identity
    id: 'svf',
    className: 'daisysp::Svf',
    displayName: 'SVF',
    category: BlockCategory.FILTERS,

    // C++ Code Generation
    headerFile: 'daisysp.h',
    namespace: 'daisysp',
    initMethod: 'Init',
    initParams: ['sample_rate'],
    processMethod: 'Process',
    processReturnType: 'void',

    // Parameters
    parameters: [
        {
            id: 'freq',
            displayName: 'Cutoff',
            type: ParameterType.FLOAT,
            cppSetter: 'SetFreq',
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
            description: 'Filter cutoff frequency',
        },
        {
            id: 'res',
            displayName: 'Resonance',
            type: ParameterType.FLOAT,
            cppSetter: 'SetRes',
            defaultValue: 0.5,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Filter resonance (Q)',
        },
        {
            id: 'drive',
            displayName: 'Drive',
            type: ParameterType.FLOAT,
            cppSetter: 'SetDrive',
            defaultValue: 0.0,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Pre-filter saturation drive',
        },
    ],

    // Ports
    ports: [
        {
            id: 'in',
            displayName: 'IN',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            cppParam: 'in',
            description: 'Audio input',
        },
        {
            id: 'freq_cv',
            displayName: 'FREQ CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Cutoff frequency modulation',
        },
        {
            id: 'res_cv',
            displayName: 'RES CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Resonance modulation',
        },
        {
            id: 'drive_cv',
            displayName: 'DRV CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Drive modulation',
        },
        {
            id: 'low',
            displayName: 'LOW',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            outputMethod: 'Low',
            description: 'Lowpass output',
        },
        {
            id: 'high',
            displayName: 'HIGH',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            outputMethod: 'High',
            description: 'Highpass output',
        },
        {
            id: 'band',
            displayName: 'BAND',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            outputMethod: 'Band',
            description: 'Bandpass output',
        },
        {
            id: 'notch',
            displayName: 'NOTCH',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            outputMethod: 'Notch',
            description: 'Notch/band-reject output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.AUDIO,
    icon: 'SlidersHorizontal',

    // Documentation
    description: 'State Variable Filter with multiple outputs',
    documentation: `
SVF (State Variable Filter) provides simultaneous lowpass, highpass,
bandpass, and notch outputs from a single input signal.

All filter outputs are available simultaneously, allowing creative routing.
The drive parameter adds subtle saturation before filtering.
12dB/octave slope on all filter types.

Usage tips:
- Use LOW output for classic subtractive synthesis
- Mix LOW and HIGH for shelf-like response
- BAND is great for formant-like effects
- NOTCH removes a narrow frequency band
  `.trim(),
};
