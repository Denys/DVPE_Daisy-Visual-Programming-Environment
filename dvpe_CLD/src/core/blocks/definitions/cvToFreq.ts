/**
 * CvToFreq Block Definition
 * Convert 1V/Octave CV to frequency
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

export const CvToFreqBlock: BlockDefinition = {
    // Identity
    id: 'cvtofreq',
    className: 'CvToFreq',
    displayName: 'CV→FREQ',
    category: BlockCategory.UTILITY,

    // C++ Code Generation (inline operation)
    headerFile: '',
    namespace: '',
    initMethod: '',
    initParams: [],
    processMethod: '',
    processReturnType: 'float',

    // Parameters
    parameters: [
        {
            id: 'base_freq',
            displayName: 'Base Freq',
            type: ParameterType.FLOAT,
            cppSetter: '',
            defaultValue: 261.63,
            range: {
                min: 20.0,
                max: 2000.0,
                step: 0.01,
                curve: ParameterCurve.LOGARITHMIC,
            },
            unit: 'Hz',
            cvModulatable: false,
            group: 'Main',
            description: 'Base frequency at CV=0 (default: C4)',
        },
    ],

    // Ports
    ports: [
        {
            id: 'cv_in',
            displayName: 'CV IN',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: '1V/Oct CV input',
        },
        {
            id: 'freq_out',
            displayName: 'FREQ',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT,
            description: 'Frequency in Hz',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.CONTROL,
    icon: 'Music',

    // Documentation
    description: 'Converts 1V/oct CV to frequency',
    documentation: `
Converts control voltage to frequency using 1V/octave scaling.

freq = base_freq * 2^(cv_in)

With default base_freq (261.63 Hz = C4):
- CV = 0 → 261.63 Hz (C4)
- CV = 1 → 523.25 Hz (C5)
- CV = -1 → 130.81 Hz (C3)

Each integer step = one octave.
  `.trim(),
};
