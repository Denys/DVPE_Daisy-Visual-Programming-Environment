/**
 * Phasor Block Definition
 * daisysp::Phasor - Ramp generator
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

export const PhasorBlock: BlockDefinition = {
    // Identity
    id: 'phasor',
    className: 'daisysp::Phasor',
    displayName: 'PHASOR',
    category: BlockCategory.MODULATORS,

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
            defaultValue: 1.0,
            range: {
                min: 0.0, // Allow 0 for frozen phasor
                max: 1000.0, // Typically LFO to audio range
                step: 0.01,
                curve: ParameterCurve.LOGARITHMIC,
            },
            unit: 'Hz',
            cvModulatable: true,
            group: 'Main',
            description: 'Phasor frequency in Hz',
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
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            cppMethod: 'Process',
            description: 'Ramp output (0.0 to 1.0)',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.CONTROL,
    icon: 'Activity', // Represents a wave/signal

    // Documentation
    description: 'Generates a normalized ramp signal (0-1) at the specified frequency.',
    documentation: `
The Phasor module generates a non-bandlimited ramp waveform moving from 0.0 to 1.0
at the specified frequency.

It is commonly used as a control signal (LFO), or to drive wavetable lookups (scanning).
  `.trim(),
};
