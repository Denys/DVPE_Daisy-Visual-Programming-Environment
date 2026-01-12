/**
 * Resonator Block Definition
 * daisysp::Resonator - Modal resonator for physical modeling
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

export const ResonatorBlock: BlockDefinition = {
    // Identity
    id: 'resonator',
    className: 'daisysp::Resonator',
    displayName: 'RESONATOR',
    category: BlockCategory.PHYSICAL_MODELING,

    // C++ Code Generation
    headerFile: 'daisysp.h',
    namespace: 'daisysp',
    initMethod: 'Init',
    initParams: ['0.015f', 'sample_rate'],
    processMethod: 'Process',
    processReturnType: 'float',

    // Parameters
    parameters: [
        {
            id: 'freq',
            displayName: 'Frequency',
            type: ParameterType.FLOAT,
            cppSetter: 'SetFreq',
            defaultValue: 440.0,
            range: {
                min: 20.0,
                max: 10000.0,
                step: 1.0,
                curve: ParameterCurve.LOGARITHMIC,
            },
            unit: 'Hz',
            cvModulatable: true,
            group: 'Main',
            description: 'Resonator frequency',
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
            description: 'Modal structure',
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
            description: 'High frequency content',
        },
        {
            id: 'damping',
            displayName: 'Damping',
            type: ParameterType.FLOAT,
            cppSetter: 'SetDamping',
            defaultValue: 0.3,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Decay time (lower = longer)',
        },
    ],

    // Ports
    ports: [
        {
            id: 'in',
            displayName: 'IN',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            description: 'Excitation input',
        },
        {
            id: 'freq_cv',
            displayName: 'FREQ CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Frequency modulation',
        },
        {
            id: 'structure_cv',
            displayName: 'STRUCT CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Structure modulation',
        },
        {
            id: 'brightness_cv',
            displayName: 'BRIGHT CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Brightness modulation',
        },
        {
            id: 'damping_cv',
            displayName: 'DAMP CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Damping modulation',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            cppMethod: 'Process',
            description: 'Resonator output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.AUDIO,
    icon: 'CircleDot',

    // Documentation
    description: 'Modal resonator for physical modeling synthesis',
    documentation: `
Bank of tuned resonators for physical modeling.
Feed with noise or impulses for metallic and bell-like sounds.
Structure controls the harmonic content of the resonance.
    `.trim(),
};
