/**
 * ModalVoice Block Definition
 * daisysp::ModalVoice - Modal synthesis voice
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

export const ModalVoiceBlock: BlockDefinition = {
    // Identity
    id: 'modal_voice',
    className: 'daisysp::ModalVoice',
    displayName: 'MODAL VOICE',
    category: BlockCategory.PHYSICAL_MODELING,

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
            defaultValue: 220.0,
            range: {
                min: 20.0,
                max: 2000.0,
                step: 1.0,
                curve: ParameterCurve.LOGARITHMIC,
            },
            unit: 'Hz',
            cvModulatable: true,
            group: 'Main',
            description: 'Fundamental frequency',
        },
        {
            id: 'structure',
            displayName: 'Structure',
            type: ParameterType.FLOAT,
            cppSetter: 'SetStructure',
            defaultValue: 0.5,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Modal structure (ratio between partials)',
        },
        {
            id: 'brightness',
            displayName: 'Brightness',
            type: ParameterType.FLOAT,
            cppSetter: 'SetBrightness',
            defaultValue: 0.5,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'High-frequency content',
        },
        {
            id: 'damping',
            displayName: 'Damping',
            type: ParameterType.FLOAT,
            cppSetter: 'SetDamping',
            defaultValue: 0.5,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Decay rate of resonance',
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
            group: 'Main',
            description: 'Strike intensity',
            cvModulatable: true,
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
            description: 'Trigger/strike input',
        },
        {
            id: 'freq_cv',
            displayName: 'FREQ CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Frequency modulation input',
        },
        {
            id: 'structure_cv',
            displayName: 'STRUC CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Structure modulation input',
        },
        {
            id: 'brightness_cv',
            displayName: 'BRIGHT CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Brightness modulation input',
        },
        {
            id: 'damping_cv',
            displayName: 'DAMP CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Damping modulation input',
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
    icon: 'Zap',

    // Documentation
    description: 'Modal synthesis voice for struck/plucked sounds',
    documentation: `
Modal synthesis voice that models resonant objects with multiple modes.
Great for metallic, bell-like, and mallet percussion sounds.

Parameters:
- Frequency: Fundamental pitch
- Structure: Modal frequency ratios
- Brightness: High-frequency content
- Damping: How quickly modes decay
- Accent: Strike/excitation intensity

Usage: Send triggers to excite the resonator.
  `.trim(),
};
