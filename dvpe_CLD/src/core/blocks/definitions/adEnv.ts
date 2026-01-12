/**
 * AD Envelope Block Definition
 * daisysp::AdEnv - Attack-Decay envelope generator
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

export const AdEnvBlock: BlockDefinition = {
    // Identity
    id: 'ad_env',
    className: 'daisysp::AdEnv',
    displayName: 'AD ENVELOPE',
    category: BlockCategory.MODULATORS,

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
            id: 'attack',
            displayName: 'Attack',
            type: ParameterType.FLOAT,
            cppSetter: 'SetTime',
            defaultValue: 0.01,
            range: {
                min: 0.001,
                max: 10.0,
                step: 0.001,
                curve: ParameterCurve.LOGARITHMIC,
            },
            unit: 's',
            cvModulatable: true,
            group: 'Time',
            description: 'Attack time in seconds',
        },
        {
            id: 'decay',
            displayName: 'Decay',
            type: ParameterType.FLOAT,
            cppSetter: 'SetTime',
            defaultValue: 0.5,
            range: {
                min: 0.001,
                max: 10.0,
                step: 0.001,
                curve: ParameterCurve.LOGARITHMIC,
            },
            unit: 's',
            cvModulatable: true,
            group: 'Time',
            description: 'Decay time in seconds',
        },
        {
            id: 'curve',
            displayName: 'Curve',
            type: ParameterType.FLOAT,
            cppSetter: 'SetCurve',
            defaultValue: 0.0,
            range: {
                min: -10.0,
                max: 10.0,
                step: 0.1,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Shape',
            description: 'Envelope curve shape (-10 to +10)',
        },
    ],

    // Ports
    ports: [
        {
            id: 'trig',
            displayName: 'TRIG',
            signalType: SignalType.TRIGGER,
            direction: PortDirection.INPUT,
            description: 'Trigger input to start envelope',
        },
        {
            id: 'attack_cv',
            displayName: 'ATK CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Attack time modulation',
        },
        {
            id: 'decay_cv',
            displayName: 'DEC CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Decay time modulation',
        },
        {
            id: 'curve_cv',
            displayName: 'CRV CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Curve shape modulation',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT,
            cppMethod: 'Process',
            description: 'Envelope CV output (0-1)',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.CONTROL,
    icon: 'TrendingUp',

    // Documentation
    description: 'Attack-Decay envelope generator',
    documentation: `
AdEnv generates a simple attack-decay envelope triggered by a gate/trigger signal.
Unlike ADSR, it has no sustain phase - useful for percussive sounds.

The curve parameter shapes the envelope from logarithmic to exponential:
- Negative values: Logarithmic (fast attack/decay, slow taper)
- Zero: Linear
- Positive values: Exponential (slow attack/decay, fast taper)

Perfect for:
- Kick drums and percussion
- Plucked sounds
- Snappy modulation effects
  `.trim(),
};
