/**
 * WhiteNoise Block Definition
 * daisysp::WhiteNoise - White noise generator
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

export const WhiteNoiseBlock: BlockDefinition = {
    // Identity
    id: 'whitenoise',
    className: 'daisysp::WhiteNoise',
    displayName: 'WHITE NOISE',
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
            description: 'Noise amplitude (0-1)',
        },
    ],

    // Ports
    ports: [
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
            description: 'Noise output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.AUDIO,
    icon: 'Zap',

    // Documentation
    description: 'White noise generator',
    documentation: `
Generates random white noise with uniform spectral density.

Uses a high-quality pseudo-random number generator.
Output range: -amplitude to +amplitude.

Common uses:
- Hi-hats and snares (filtered noise)
- Wind/ocean sound effects
- Random modulation source
- Adding texture to pads
  `.trim(),
};
