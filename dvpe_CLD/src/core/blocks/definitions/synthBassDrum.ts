/**
 * SynthBassDrum Block Definition
 * daisysp::SyntheticBassDrum - Digital bass drum synthesis
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

export const SynthBassDrumBlock: BlockDefinition = {
    // Identity
    id: 'synth_bass_drum',
    className: 'daisysp::SyntheticBassDrum',
    displayName: 'SYNTH KICK',
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
            displayName: 'Pitch',
            type: ParameterType.FLOAT,
            cppSetter: 'SetFreq',
            defaultValue: 50.0,
            range: {
                min: 20.0,
                max: 200.0,
                step: 1.0,
                curve: ParameterCurve.LOGARITHMIC,
            },
            unit: 'Hz',
            cvModulatable: true,
            group: 'Main',
            description: 'Base pitch frequency',
        },
        {
            id: 'tone',
            displayName: 'Tone',
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
            description: 'Drum tone/color',
        },
        {
            id: 'decay',
            displayName: 'Decay',
            type: ParameterType.FLOAT,
            cppSetter: 'SetDecay',
            defaultValue: 0.4,
            range: {
                min: 0.05,
                max: 3.0,
                step: 0.01,
                curve: ParameterCurve.LOGARITHMIC,
            },
            unit: 's',
            cvModulatable: true,
            group: 'Main',
            description: 'Amplitude decay time',
        },
        {
            id: 'dirty',
            displayName: 'Dirty',
            type: ParameterType.BOOL,
            cppSetter: 'SetDirtiness',
            defaultValue: false,
            group: 'Main',
            description: 'Adds harmonic distortion',
        },
        {
            id: 'fm_envelope_amount',
            displayName: 'FM Env',
            type: ParameterType.FLOAT,
            cppSetter: 'SetFmEnvelopeAmount',
            defaultValue: 0.5,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'FM',
            description: 'FM envelope modulation depth',
        },
        {
            id: 'fm_envelope_decay',
            displayName: 'FM Decay',
            type: ParameterType.FLOAT,
            cppSetter: 'SetFmEnvelopeDecay',
            defaultValue: 0.1,
            range: {
                min: 0.01,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LOGARITHMIC,
            },
            unit: 's',
            cvModulatable: true,
            group: 'FM',
            description: 'FM envelope decay time',
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
            description: 'Accent/velocity amount',
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
            displayName: 'PITCH CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Pitch modulation input',
        },
        {
            id: 'tone_cv',
            displayName: 'TONE CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Tone modulation input',
        },
        {
            id: 'decay_cv',
            displayName: 'DECAY CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Decay modulation input',
        },
        {
            id: 'fm_envelope_amount_cv',
            displayName: 'FM ENV CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'FM envelope amount modulation input',
        },
        {
            id: 'fm_envelope_decay_cv',
            displayName: 'FM DEC CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'FM envelope decay modulation input',
        },
        {
            id: 'accent_cv',
            displayName: 'ACCENT CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Accent modulation input',
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
    icon: 'Circle',

    // Documentation
    description: 'Synthetic/digital bass drum synthesizer',
    documentation: `
Digital bass drum synthesis with FM modulation and dirty mode.
More versatile than analog model, can create electronic and acoustic sounds.

Parameters:
- Pitch: Base frequency
- Tone: Sound color
- Decay: Sound duration
- Dirty: Adds harmonic distortion
- FM Env: Pitch sweep depth
- FM Decay: Pitch sweep speed
- Accent: Velocity response
  `.trim(),
};
