/**
 * ATone (HPF) Block Definition
 * daisysp::ATone - First-order highpass filter
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

export const AToneBlock: BlockDefinition = {
    // Identity
    id: 'atone',
    className: 'daisysp::ATone',
    displayName: 'HPF (ATONE)',
    category: BlockCategory.FILTERS,

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
            displayName: 'Cutoff',
            type: ParameterType.FLOAT,
            cppSetter: 'SetFreq',
            defaultValue: 200.0,
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
    description: 'First-order highpass filter (-6dB/octave)',
    documentation: `
ATone is a first-order highpass filter that removes low frequencies.
-6dB/octave slope (gentle rolloff).

Uses:
- Removing DC offset
- Thinning out bass-heavy sounds
- Creating telephone/radio effects
  `.trim(),
};
