/**
 * SampleRateReducer Block Definition
 * daisysp::SampleRateReducer - Pure sample rate reduction
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

export const SampleRateReducerBlock: BlockDefinition = {
    // Identity
    id: 'sample_rate_reducer',
    className: 'daisysp::SampleRateReducer',
    displayName: 'SR REDUCE',
    category: BlockCategory.EFFECTS,

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
            id: 'frequency',
            displayName: 'Target Rate',
            type: ParameterType.FLOAT,
            cppSetter: 'SetFreq',
            defaultValue: 10000.0,
            range: {
                min: 100.0,
                max: 48000.0,
                step: 100.0,
                curve: ParameterCurve.LOGARITHMIC,
            },
            unit: 'Hz',
            cvModulatable: true,
            group: 'Main',
            description: 'Target sample rate',
        },
    ],

    // Ports
    ports: [
        {
            id: 'in',
            displayName: 'IN',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            description: 'Audio input',
        },
        {
            id: 'frequency_cv',
            displayName: 'RATE CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Sample rate modulation',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            cppMethod: 'Process',
            description: 'Reduced output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.AUDIO,
    icon: 'Stairs',

    // Documentation
    description: 'Sample rate reduction for aliasing effects',
    documentation: `
Reduces the effective sample rate of the input signal.
Lower rates create more aliasing and digital artifacts.
Use for lo-fi and retro digital sound effects.
    `.trim(),
};
