/**
 * AnalogBassDrum Block Definition
 * daisysp::AnalogBassDrum - Analog bass drum synthesis
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

export const AnalogBassDrumBlock: BlockDefinition = {
    // Identity
    id: 'analog_bass_drum',
    className: 'daisysp::AnalogBassDrum',
    displayName: 'ANALOG KICK',
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
            description: 'Drum tone/brightness',
        },
        {
            id: 'decay',
            displayName: 'Decay',
            type: ParameterType.FLOAT,
            cppSetter: 'SetDecay',
            defaultValue: 0.3,
            range: {
                min: 0.05,
                max: 2.0,
                step: 0.01,
                curve: ParameterCurve.LOGARITHMIC,
            },
            unit: 's',
            cvModulatable: true,
            group: 'Main',
            description: 'Amplitude decay time',
        },
        {
            id: 'attack_fm_amount',
            displayName: 'FM Amount',
            type: ParameterType.FLOAT,
            cppSetter: 'SetAttackFmAmount',
            defaultValue: 0.5,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            group: 'Attack',
            description: 'Attack FM modulation depth',
            cvModulatable: true,
        },
        {
            id: 'self_fm_amount',
            displayName: 'Self FM',
            type: ParameterType.FLOAT,
            cppSetter: 'SetSelfFmAmount',
            defaultValue: 0.1,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Self-FM modulation depth',
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
            id: 'attack_fm_amount_cv',
            displayName: 'FM AMT CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Attack FM modulation input',
        },
        {
            id: 'self_fm_amount_cv',
            displayName: 'SELF FM CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Self-FM modulation input',
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
    description: 'Analog-modeled bass drum/kick synthesizer',
    documentation: `
Analog bass drum synthesizer based on classic drum machine circuits.
Features pitch sweep, FM, and self-modulation for punchy kick sounds.

Parameters:
- Pitch: Base frequency
- Tone: Brightness
- Decay: Sound duration
- FM Amount: Attack transient character
- Self FM: Adds harmonic content
- Accent: Velocity response
  `.trim(),
};
