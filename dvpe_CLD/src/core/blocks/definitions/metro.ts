/**
 * Metro Block Definition
 * daisysp::Metro - Clock signal generator
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

export const MetroBlock: BlockDefinition = {
    // Identity
    id: 'metro',
    className: 'daisysp::Metro',
    displayName: 'METRO',
    category: BlockCategory.UTILITY,

    // C++ Code Generation
    headerFile: 'daisysp.h',
    namespace: 'daisysp',
    initMethod: 'Init',
    initParams: ['1.0f', 'sample_rate'], // Default 1Hz
    processMethod: 'Process',
    processReturnType: 'bool',

    // Parameters
    parameters: [
        {
            id: 'freq',
            displayName: 'Frequency',
            type: ParameterType.FLOAT,
            cppSetter: 'SetFreq',
            defaultValue: 2.0,
            range: {
                min: 0.1,
                max: 50.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            unit: 'Hz',
            cvModulatable: true,
            group: 'Main',
            description: 'Clock frequency in Hz',
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
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.TRIGGER,
            direction: PortDirection.OUTPUT,
            cppMethod: 'Process',
            description: 'Trigger output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.CONTROL,
    icon: 'Clock',

    // Documentation
    description: 'BPM clock / metronome',
    documentation: `
Generates a trigger signal at a specific frequency.
Useful for driving sequencers, envelopes, and other timed events.

The frequency can be controlled via parameter or modulated via CV.
  `.trim(),
};
