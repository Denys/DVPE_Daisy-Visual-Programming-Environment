/**
 * Particle Block Definition
 * daisysp::Particle - Particle noise generator with resonant filter
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

export const ParticleBlock: BlockDefinition = {
    // Identity
    id: 'particle',
    className: 'daisysp::Particle',
    displayName: 'PARTICLE',
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
            id: 'density',
            displayName: 'Density',
            type: ParameterType.FLOAT,
            cppSetter: 'SetDensity',
            defaultValue: 0.5,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Particle generation density',
        },
        {
            id: 'spread',
            displayName: 'Spread',
            type: ParameterType.FLOAT,
            cppSetter: 'SetSpread',
            defaultValue: 0.5,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Random pitch spread amount',
        },
        {
            id: 'freq',
            displayName: 'Frequency',
            type: ParameterType.FLOAT,
            cppSetter: 'SetFreq',
            defaultValue: 440.0,
            range: {
                min: 20.0,
                max: 20000.0,
                step: 1.0,
                curve: ParameterCurve.LOGARITHMIC,
            },
            unit: 'Hz',
            cvModulatable: true,
            group: 'Main',
            description: 'Center frequency in Hz',
        },
        {
            id: 'resonance',
            displayName: 'Resonance',
            type: ParameterType.FLOAT,
            cppSetter: 'SetResonance',
            defaultValue: 0.5,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Internal bandpass filter resonance',
        },
    ],

    // Ports
    ports: [
        {
            id: 'sync',
            displayName: 'SYNC',
            signalType: SignalType.TRIGGER,
            direction: PortDirection.INPUT,
            description: 'Sync/reset trigger input',
        },
        {
            id: 'density_cv',
            displayName: 'DENS CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Density CV modulation input',
        },
        {
            id: 'spread_cv',
            displayName: 'SPRE CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Spread CV modulation input',
        },
        {
            id: 'freq_cv',
            displayName: 'FREQ CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Frequency CV modulation input',
        },
        {
            id: 'resonance_cv',
            displayName: 'RES CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Resonance CV modulation input',
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
    icon: 'Sparkles',

    // Documentation
    description: 'Particle noise generator with resonant filter',
    documentation: `
Particle generates random noise bursts with controllable density and spread.
Features an internal resonant bandpass filter for tonal noise generation.
Useful for creating percussive textures and granular noise effects.

- Density: How often particles are generated
- Spread: Random variation in pitch
- Resonance: Filter Q for more tonal output
  `.trim(),
};
