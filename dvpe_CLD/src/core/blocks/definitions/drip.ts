/**
 * Drip Block Definition
 * daisysp::Drip - Physical modeling of water droplet sounds
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

export const DripBlock: BlockDefinition = {
    // Identity
    id: 'drip',
    className: 'daisysp::Drip',
    displayName: 'DRIP',
    category: BlockCategory.PHYSICAL_MODELING,

    // C++ Code Generation
    headerFile: 'daisysp.h',
    namespace: 'daisysp',
    initMethod: 'Init',
    initParams: ['sample_rate', 'damp'],
    processMethod: 'Process',
    processReturnType: 'float',

    // Parameters
    parameters: [
        {
            id: 'damp',
            displayName: 'Damp',
            type: ParameterType.FLOAT,
            cppSetter: 'SetDamp',
            defaultValue: 0.2,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Damping amount (affects decay)',
        },
        {
            id: 'amp',
            displayName: 'Amplitude',
            type: ParameterType.FLOAT,
            cppSetter: 'SetAmp',
            defaultValue: 0.5,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Output amplitude',
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
            description: 'Trigger input for drip',
        },
        {
            id: 'damp_cv',
            displayName: 'DAMP CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Damping modulation input',
        },
        {
            id: 'amp_cv',
            displayName: 'AMP CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Amplitude modulation input',
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
    icon: 'Droplet',

    // Documentation
    description: 'Physical modeling of water droplet sounds',
    documentation: `
Physical model simulating the sound of water droplets.
Based on Stanford PhISEM library.

Parameters:
- Damp: Damping affects decay and resonance
- Amplitude: Output level

Usage: Send triggers to create individual drip sounds.
  `.trim(),
};
