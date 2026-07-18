/**
 * PolyGrainletVoice Block Definition
 * Compact Daisy Field polyphonic Grainlet voice for GranularSynth-style patches.
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

export const PolyGrainletVoiceBlock: BlockDefinition = {
    id: 'poly_grainlet_voice',
    className: 'PolyGrainletVoice',
    displayName: 'POLY GRAINLET',
    category: BlockCategory.SOURCES,

    headerFile: 'daisysp.h',
    namespace: 'daisysp',
    initMethod: 'Init',
    initParams: ['sample_rate'],
    processMethod: 'Process',
    processReturnType: 'void',

    parameters: [
        {
            id: 'voice_count',
            displayName: 'Voices',
            type: ParameterType.INT,
            defaultValue: 8,
            range: { min: 1, max: 16, step: 1 },
            group: 'Polyphony',
            description: 'Maximum number of allocated polyphonic voices',
        },
        {
            id: 'octave',
            displayName: 'Octave',
            type: ParameterType.INT,
            defaultValue: 2,
            range: { min: 0, max: 4, step: 1 },
            group: 'Keyboard',
            description: 'Base octave for the Daisy Field key scale',
        },
        {
            id: 'shape',
            displayName: 'Shape',
            type: ParameterType.FLOAT,
            cppSetter: 'SetShape',
            defaultValue: 0.35,
            range: { min: 0.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: true,
            group: 'Timbre',
            description: 'Grain window shape',
        },
        {
            id: 'formant_freq',
            displayName: 'Formant',
            type: ParameterType.FLOAT,
            cppSetter: 'SetFormantFreq',
            defaultValue: 1200.0,
            range: { min: 120.0, max: 6000.0, step: 1.0, curve: ParameterCurve.LOGARITHMIC },
            unit: 'Hz',
            cvModulatable: true,
            group: 'Timbre',
            description: 'Formant frequency',
        },
        {
            id: 'bleed',
            displayName: 'Bleed',
            type: ParameterType.FLOAT,
            cppSetter: 'SetBleed',
            defaultValue: 0.25,
            range: { min: 0.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: true,
            group: 'Timbre',
            description: 'Inter-grain bleed amount',
        },
        {
            id: 'attack',
            displayName: 'Attack',
            type: ParameterType.FLOAT,
            defaultValue: 0.01,
            range: { min: 0.001, max: 1.25, step: 0.001, curve: ParameterCurve.LOGARITHMIC },
            unit: 's',
            cvModulatable: true,
            group: 'Envelope',
            description: 'Voice envelope attack time',
        },
        {
            id: 'release',
            displayName: 'Release',
            type: ParameterType.FLOAT,
            defaultValue: 0.25,
            range: { min: 0.02, max: 2.5, step: 0.001, curve: ParameterCurve.LOGARITHMIC },
            unit: 's',
            cvModulatable: true,
            group: 'Envelope',
            description: 'Voice envelope release time',
        },
        {
            id: 'spread',
            displayName: 'Spread',
            type: ParameterType.FLOAT,
            defaultValue: 0.4,
            range: { min: 0.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: true,
            group: 'Stereo',
            description: 'Equal-power stereo spread by key position',
        },
        {
            id: 'output_gain',
            displayName: 'Gain',
            type: ParameterType.FLOAT,
            defaultValue: 0.18,
            range: { min: 0.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            group: 'Output',
            description: 'Post-sum safety gain',
        },
    ],

    ports: [
        {
            id: 'shape_cv',
            displayName: 'SHP CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Shape modulation or macro input',
        },
        {
            id: 'formant_freq_cv',
            displayName: 'FRM CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Formant modulation or macro input',
        },
        {
            id: 'bleed_cv',
            displayName: 'BLD CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Bleed modulation or macro input',
        },
        {
            id: 'attack_cv',
            displayName: 'ATK CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Attack modulation or macro input',
        },
        {
            id: 'release_cv',
            displayName: 'REL CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Release modulation or macro input',
        },
        {
            id: 'spread_cv',
            displayName: 'SPR CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Stereo spread modulation or macro input',
        },
        {
            id: 'left',
            displayName: 'L',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            description: 'Left summed voice output',
        },
        {
            id: 'right',
            displayName: 'R',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            description: 'Right summed voice output',
        },
    ],

    colorScheme: BlockColorScheme.AUDIO,
    icon: 'Layers3',
    maxInstanceCount: 4,

    description: 'Daisy Field polyphonic Grainlet voice with built-in voice allocation',
    documentation: `
Compact GranularSynth-style source for Daisy Field patches.

The block scans the 13 playable Field keys, allocates up to the configured
voice count, and renders GrainletOscillator voices through ADSR envelopes and
equal-power stereo spread. V1 intentionally keeps the polyphony inside this
block instead of introducing a generic poly signal type.
    `.trim(),
};
