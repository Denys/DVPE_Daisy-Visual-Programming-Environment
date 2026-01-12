/**
 * PitchShifter Block Definition
 * Basic pitch shifting - inline implementation (simplified)
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

export const PitchShifterBlock: BlockDefinition = {
    // Identity
    id: 'pitch_shifter',
    className: 'inline::PitchShifter',
    displayName: 'PITCHSHIFT',
    category: BlockCategory.EFFECTS,

    // C++ Code Generation - inline with delay buffer
    headerFile: 'daisysp.h',
    namespace: 'daisysp',
    initMethod: '',
    initParams: [],
    processMethod: '',
    processReturnType: 'float',

    // Parameters
    parameters: [
        {
            id: 'semitones',
            displayName: 'Semitones',
            type: ParameterType.FLOAT,
            cppSetter: '',
            defaultValue: 0,
            range: {
                min: -12,
                max: 12,
                step: 1,
                curve: ParameterCurve.LINEAR,
            },
            unit: 'st',
            cvModulatable: true,
            group: 'Main',
            description: 'Pitch shift in semitones',
        },
        {
            id: 'mix',
            displayName: 'Mix',
            type: ParameterType.FLOAT,
            cppSetter: '',
            defaultValue: 1.0,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: false,
            group: 'Main',
            description: 'Dry/wet mix',
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
            id: 'semitones_cv',
            displayName: 'PITCH CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Pitch shift modulation',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            description: 'Pitch-shifted output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.FX,
    icon: 'ArrowUpDown',

    // Documentation
    description: 'Basic pitch shifter',
    documentation: `
Shifts the pitch of audio up or down.
Semitones controls the amount of shift (+/- 12 = one octave).
Note: Uses simplified algorithm, may have artifacts at extreme settings.
    `.trim(),
};
