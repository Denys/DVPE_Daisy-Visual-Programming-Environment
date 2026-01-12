/**
 * Limiter Block Definition
 * daisysp::Limiter - Soft limiter/clipper
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

export const LimiterBlock: BlockDefinition = {
    // Identity
    id: 'limiter',
    className: 'daisysp::Limiter',
    displayName: 'LIMITER',
    category: BlockCategory.DYNAMICS,

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
            id: 'pre_gain',
            displayName: 'Pre-Gain',
            type: ParameterType.FLOAT,
            cppSetter: 'SetPreGain',
            defaultValue: 1.0,
            range: {
                min: 0.1,
                max: 10.0,
                step: 0.1,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: false,
            group: 'Main',
            description: 'Input gain before limiting',
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
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            cppMethod: 'Process',
            description: 'Limited output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.LOGIC,
    icon: 'Maximize2',

    // Documentation
    description: 'Soft limiter to prevent clipping',
    documentation: `
Soft limiter that prevents the signal from exceeding +/- 1.0.

Uses a smooth soft-clipping curve rather than hard clipping,
preserving harmonics while preventing digital distortion.

Place at the end of your signal chain before the audio output
to prevent clipping on hot signals.
  `.trim(),
};
