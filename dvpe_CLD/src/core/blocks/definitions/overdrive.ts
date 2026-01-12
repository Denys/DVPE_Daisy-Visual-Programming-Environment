/**
 * Overdrive Block Definition
 * daisysp::Overdrive - Soft clipping distortion
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

export const OverdriveBlock: BlockDefinition = {
    // Identity
    id: 'overdrive',
    className: 'daisysp::Overdrive',
    displayName: 'OVERDRIVE',
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
            id: 'drive',
            displayName: 'Drive',
            type: ParameterType.FLOAT,
            cppSetter: 'SetDrive',
            defaultValue: 0.5,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Distortion amount (0-1)',
        },
    ],

    // Ports
    ports: [
        {
            id: 'in',
            displayName: 'IN',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            cppParam: 'in',
            description: 'Audio input',
        },
        {
            id: 'drive_cv',
            displayName: 'DRIVE CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Drive modulation input',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            cppMethod: 'Process',
            description: 'Distorted audio output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.AUDIO,
    icon: 'Flame',

    // Documentation
    description: 'Soft clipping overdrive distortion',
    documentation: `
Overdrive provides warm, soft-clipping distortion using a tanh-based waveshaper.

At low settings, adds subtle harmonic warmth and compression.
At high settings, creates classic overdrive distortion with even harmonics.

Unlike hard clipping, soft clipping produces a smoother, more musical distortion
that's easier on the ears while still adding presence and grit.

Best used after filters to tame harshness, or before for more aggressive tones.
  `.trim(),
};
