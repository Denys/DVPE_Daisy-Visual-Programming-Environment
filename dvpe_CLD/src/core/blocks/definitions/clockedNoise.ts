/**
 * ClockedNoise Block Definition
 * daisysp::ClockedNoise - Sample-rate reduced noise
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

export const ClockedNoiseBlock: BlockDefinition = {
    // Identity
    id: 'clocked_noise',
    className: 'daisysp::ClockedNoise',
    displayName: 'CLK NOISE',
    category: BlockCategory.SOURCES, // Technically a source of noise, though likely used for modulation/texture

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
            defaultValue: 1000.0, // Default to a moderate noise rate
            range: {
                min: 0.1,
                max: 20000.0,
                step: 0.1,
                curve: ParameterCurve.LOGARITHMIC,
            },
            unit: 'Hz',
            cvModulatable: true,
            group: 'Main',
            description: 'Frequency of the internal S&H clock',
        },
    ],

    // Ports
    ports: [
        {
            id: 'freq_cv',
            displayName: 'FREQ CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Frequency modulation',
        },
        {
            id: 'sync',
            displayName: 'SYNC',
            signalType: SignalType.TRIGGER,
            direction: PortDirection.INPUT,
            cppMethod: 'Sync', // Maps to Sync() method
            description: 'Forces new random value generation',
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
    icon: 'CloudDrizzle', // Noise/Grainy

    // Documentation
    description: 'Noise processed by a Sample & Hold running at a target frequency.',
    documentation: `
Generates random values at a specific clock rate.
Great for lo-fi textures (high freq) or random control steps (low freq).

- **Frequency**: Controls how often the noise value changes.
- **Sync**: Forces an immediate update.
  `.trim(),
};
