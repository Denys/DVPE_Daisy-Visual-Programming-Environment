/**
 * OnePole (LPF) Block Definition
 * daisysp::OnePole - Simple one-pole lowpass filter
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

export const OnePoleBlock: BlockDefinition = {
    // Identity
    id: 'onepole',
    className: 'daisysp::OnePole',
    displayName: 'LPF (1-POLE)',
    category: BlockCategory.FILTERS,

    // C++ Code Generation
    headerFile: 'daisysp.h',
    namespace: 'daisysp',
    initMethod: 'Init',
    initParams: [],
    processMethod: 'Process',
    processReturnType: 'float',

    // Parameters
    parameters: [
        {
            id: 'freq',
            displayName: 'Cutoff',
            type: ParameterType.FLOAT,
            cppSetter: 'SetFrequency',
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
            description: 'Cutoff frequency in Hz',
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
            displayName: 'FREQ CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Cutoff frequency modulation',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            cppMethod: 'Process',
            description: 'Filtered output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.AUDIO,
    icon: 'Filter',

    // Documentation
    description: 'Simple one-pole lowpass filter (-6dB/octave)',
    documentation: `
A simple first-order lowpass filter with -6dB/octave slope.
Very smooth and gentle filtering, good for:
- Smoothing control signals
- Gentle high-frequency rolloff
- Envelope following
  `.trim(),
};
