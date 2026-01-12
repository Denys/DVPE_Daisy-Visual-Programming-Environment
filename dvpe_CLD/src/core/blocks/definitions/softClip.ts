/**
 * SoftClip Block Definition
 * Soft saturation using tanh waveshaping - inline implementation
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

export const SoftClipBlock: BlockDefinition = {
    // Identity
    id: 'softclip',
    className: 'inline::SoftClip',
    displayName: 'SOFTCLIP',
    category: BlockCategory.EFFECTS,

    // C++ Code Generation - inline
    headerFile: 'daisysp.h',
    namespace: 'daisysp',
    initMethod: '',
    initParams: [],
    processMethod: '',
    processReturnType: 'float',

    // Parameters
    parameters: [
        {
            id: 'drive',
            displayName: 'Drive',
            type: ParameterType.FLOAT,
            cppSetter: '',
            defaultValue: 1.0,
            range: {
                min: 0.1,
                max: 10.0,
                step: 0.1,
                curve: ParameterCurve.LOGARITHMIC,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Saturation drive amount',
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
            id: 'drive_cv',
            displayName: 'DRIVE CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Drive modulation',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            description: 'Soft-clipped output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.FX,
    icon: 'TrendingUp',

    // Documentation
    description: 'Soft saturation using tanh waveshaping',
    documentation: `
Applies smooth saturation using hyperbolic tangent waveshaping.
Higher drive values create more harmonic distortion.
Output is limited to prevent harsh digital clipping.
    `.trim(),
};
