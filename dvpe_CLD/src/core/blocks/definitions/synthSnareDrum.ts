/**
 * SynthSnareDrum Block Definition
 * daisysp::SyntheticSnareDrum - Digital snare drum synthesis
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

export const SynthSnareDrumBlock: BlockDefinition = {
    // Identity
    id: 'synth_snare_drum',
    className: 'daisysp::SyntheticSnareDrum',
    displayName: 'SYNTH SNARE',
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
            defaultValue: 180.0,
            range: {
                min: 50.0,
                max: 500.0,
                step: 1.0,
                curve: ParameterCurve.LOGARITHMIC,
            },
            unit: 'Hz',
            cvModulatable: true,
            group: 'Main',
            description: 'Body pitch frequency',
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
            description: 'Body tone color',
        },
        {
            id: 'decay',
            displayName: 'Decay',
            type: ParameterType.FLOAT,
            cppSetter: 'SetDecay',
            defaultValue: 0.15,
            range: {
                min: 0.02,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LOGARITHMIC,
            },
            unit: 's',
            cvModulatable: true,
            group: 'Main',
            description: 'Amplitude decay time',
        },
        {
            id: 'snappy',
            displayName: 'Snappy',
            type: ParameterType.FLOAT,
            cppSetter: 'SetSnappy',
            defaultValue: 0.5,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Snare wire noise amount',
        },
        {
            id: 'fm_amount',
            displayName: 'FM Amount',
            type: ParameterType.FLOAT,
            cppSetter: 'SetFmAmount',
            defaultValue: 0.2,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'FM',
            description: 'FM modulation depth',
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
            id: 'snappy_cv',
            displayName: 'SNAPPY CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Snappy modulation input',
        },
        {
            id: 'fm_amount_cv',
            displayName: 'FM CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'FM amount modulation input',
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
    description: 'Synthetic/digital snare drum synthesizer',
    documentation: `
Digital snare drum synthesis with tonal body and noise snare wires.
More versatile than analog model for electronic music production.

Parameters:
- Pitch: Body frequency
- Tone: Body character
- Decay: Sound duration
- Snappy: Snare wire noise amount
- FM Amount: FM modulation depth
- Accent: Velocity response
  `.trim(),
};
