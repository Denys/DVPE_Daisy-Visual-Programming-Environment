/**
 * Dust Block Definition
 * Random impulse/noise burst generator
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

export const DustBlock: BlockDefinition = {
    // Identity
    id: 'dust',
    className: 'inline',
    displayName: 'DUST',
    category: BlockCategory.SOURCES,

    // C++ Code Generation
    headerFile: 'daisysp.h',
    namespace: 'daisysp',
    initMethod: 'Init',
    initParams: [],
    processMethod: 'Process',
    processReturnType: 'float',

    // Parameters
    parameters: [
        {
            id: 'density',
            displayName: 'Density',
            type: ParameterType.FLOAT,
            cppSetter: 'SetDensity',
            defaultValue: 10.0,
            range: {
                min: 0.1,
                max: 1000.0,
                step: 0.1,
                curve: ParameterCurve.LOGARITHMIC,
            },
            unit: 'Hz',
            cvModulatable: true,
            group: 'Main',
            description: 'Average impulses per second',
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
            group: 'Main',
            description: 'Output amplitude',
            cvModulatable: false,
        },
    ],

    // Ports
    ports: [
        {
            id: 'density_cv',
            displayName: 'DENSITY CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Density modulation input',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            cppMethod: 'Process',
            description: 'Audio/impulse output',
        },
        {
            id: 'trig_out',
            displayName: 'TRIG',
            signalType: SignalType.TRIGGER,
            direction: PortDirection.OUTPUT,
            description: 'Trigger output on each impulse',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.AUDIO,
    icon: 'Sparkles',

    // Documentation
    description: 'Random impulse/noise burst generator',
    documentation: `
Generates random impulses (clicks) at a configurable density.
Similar to SuperCollider's Dust UGen.

Parameters:
- Density: Average impulses per second
- Amplitude: Impulse amplitude

Outputs:
- OUT: Audio signal with impulses
- TRIG: Trigger output for each impulse

Use for:
- Granular effects
- Random triggers
- Vinyl crackle textures
- Stochastic percussion
  `.trim(),
};
