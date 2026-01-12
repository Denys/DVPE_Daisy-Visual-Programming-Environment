/**
 * StringVoice Block Definition
 * daisysp::StringVoice - Karplus-Strong string synthesis
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

export const StringVoiceBlock: BlockDefinition = {
    // Identity
    id: 'string_voice',
    className: 'daisysp::StringVoice',
    displayName: 'STRING VOICE',
    category: BlockCategory.PHYSICAL_MODELING,

    // C++ Code Generation
    headerFile: 'daisysp.h',
    namespace: 'daisysp',
    initMethod: 'Init',
    initParams: ['sample_rate'],
    processMethod: 'Process',
    processReturnType: 'float',
    requiresSdram: true,

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
            description: 'String pitch',
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
            description: 'String material/stiffness',
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
            description: 'Decay rate of string vibration',
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
            description: 'Pluck intensity',
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
            description: 'Trigger/pluck input',
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
    icon: 'Music',

    // Documentation
    description: 'Physical modeling of plucked strings (Karplus-Strong)',
    documentation: `
Physical model of a plucked string using Karplus-Strong synthesis.
Creates realistic guitar, harp, and plucked string sounds.

Parameters:
- Frequency: String pitch
- Structure: String material character
- Brightness: Initial pluck brightness
- Damping: How quickly string decays
- Accent: Pluck intensity/velocity

Note: This block requires SDRAM for the delay buffer.
  `.trim(),
};
