/**
 * HiHat Block Definition
 * daisysp::HiHat - Analog hi-hat synthesis
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

export const HiHatBlock: BlockDefinition = {
    // Identity
    id: 'hihat',
    className: 'daisysp::HiHat',
    displayName: 'HI-HAT',
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
            displayName: 'Tone',
            type: ParameterType.FLOAT,
            cppSetter: 'SetFreq',
            defaultValue: 3000.0,
            range: {
                min: 200.0,
                max: 12000.0,
                step: 10.0,
                curve: ParameterCurve.LOGARITHMIC,
            },
            unit: 'Hz',
            cvModulatable: true,
            group: 'Main',
            description: 'Hi-hat tone frequency',
        },
        {
            id: 'tone',
            displayName: 'Brightness',
            type: ParameterType.FLOAT,
            cppSetter: 'SetTone',
            defaultValue: 0.5,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Hi-hat brightness/timbre',
        },
        {
            id: 'decay',
            displayName: 'Decay',
            type: ParameterType.FLOAT,
            cppSetter: 'SetDecay',
            defaultValue: 0.2,
            range: {
                min: 0.01,
                max: 2.0,
                step: 0.01,
                curve: ParameterCurve.LOGARITHMIC,
            },
            unit: 's',
            cvModulatable: true,
            group: 'Main',
            description: 'Hi-hat decay time',
        },
        {
            id: 'accent',
            displayName: 'Accent',
            type: ParameterType.FLOAT,
            cppSetter: 'SetAccent',
            defaultValue: 0.5,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Accent amount',
        },
        {
            id: 'noisiness',
            displayName: 'Noisiness',
            type: ParameterType.FLOAT,
            cppSetter: 'SetNoisiness',
            defaultValue: 0.5,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
        },
        {
            id: 'sustain',
            displayName: 'Sustain',
            type: ParameterType.INT,
            cppSetter: '',
            defaultValue: 0,
            range: {
                min: 0,
                max: 1,
                step: 1,
            },
            group: 'Main',
            description: 'Sustain mode (0=decay, 1=sustain)',
        },
    ],

    // Ports
    ports: [
        {
            id: 'trig',
            displayName: 'TRIG',
            signalType: SignalType.TRIGGER,
            direction: PortDirection.INPUT,
            cppParam: 'trig',
            description: 'Trigger input',
        },
        {
            id: 'freq_cv',
            displayName: 'TONE CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Tone frequency modulation input',
        },
        {
            id: 'tone_cv',
            displayName: 'BRIGHT CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Brightness modulation input',
        },
        {
            id: 'decay_cv',
            displayName: 'DECAY CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Decay modulation input',
        },
        {
            id: 'accent_cv',
            displayName: 'ACCENT CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Accent modulation input',
        },
        {
            id: 'noisiness_cv',
            displayName: 'NOISE CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Noisiness modulation input',
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
    icon: 'Disc',

    // Documentation
    description: 'Analog-style hi-hat synthesizer',
    documentation: `
Synthesizes hi-hat sounds using analog modeling techniques.
Trigger input initiates the hi-hat sound.

Parameters:
- Tone: Base frequency
- Brightness: High-frequency content
- Decay: Sound duration
- Accent: Velocity/emphasis
  `.trim(),
};
