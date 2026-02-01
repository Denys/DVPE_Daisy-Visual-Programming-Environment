/**
 * HardClip Block Definition
 * Hard clipping distortion - inline implementation
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

export const HardClipBlock: BlockDefinition = {
    // Identity
    id: 'hardclip',
    className: 'inline::HardClip',
    displayName: 'HARDCLIP',
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
            id: 'threshold',
            displayName: 'Threshold',
            type: ParameterType.FLOAT,
            cppSetter: '',
            defaultValue: 0.8,
            range: {
                min: 0.01,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Clipping threshold level',
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
            id: 'threshold_cv',
            displayName: 'THRESH CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Threshold modulation',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            description: 'Hard-clipped output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.AUDIO,
    icon: 'Square',

    // Documentation
    description: 'Hard clipping distortion',
    documentation: `
Clips signal at the threshold level for harsh digital distortion.
Lower threshold = more aggressive clipping and odd harmonics.
Creates square-wave-like waveforms at extreme settings.
    `.trim(),
};
