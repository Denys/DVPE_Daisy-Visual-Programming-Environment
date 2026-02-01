/**
 * Stereo Pan Block
 * 
 * DAFX Book stereopan.m - Stereo panning with tangent law
 * Ported from DAFX_2_Daisy_lib
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

export const StereoPanBlock: BlockDefinition = {
    // === IDENTITY ===
    id: 'stereoPan',
    className: 'daisysp::StereoPan',
    displayName: 'STEREO PAN',
    category: BlockCategory.UTILITY,

    // === C++ CODE GENERATION ===
    headerFile: 'spatial/stereopan.h',
    namespace: 'daisysp',
    initMethod: 'Init',
    initParams: [],
    processMethod: 'Process',
    processReturnType: 'void',

    // === PARAMETERS ===
    parameters: [
        {
            id: 'pan',
            displayName: 'Pan',
            type: ParameterType.FLOAT,
            cppSetter: 'SetPan',
            defaultValue: 0.0,
            range: { min: -1.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: true,
            group: 'Position',
            description: 'Pan position (-1 = left, 0 = center, +1 = right)',
        },
        {
            id: 'speakerAngle',
            displayName: 'Angle',
            type: ParameterType.FLOAT,
            cppSetter: 'SetSpeakerAngle',
            defaultValue: 30.0,
            range: { min: 0.0, max: 60.0, step: 1.0, curve: ParameterCurve.LINEAR },
            unit: '°',
            group: 'Position',
            description: 'Loudspeaker base angle',
        },
    ],

    // === PORTS ===
    ports: [
        {
            id: 'in',
            displayName: 'IN',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            cppParam: 'in',
            description: 'Mono audio input',
        },
        {
            id: 'pan_cv',
            displayName: 'PAN CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Pan position modulation input',
        },
        {
            id: 'left',
            displayName: 'L',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            cppMethod: 'out_left',
            description: 'Left audio output',
        },
        {
            id: 'right',
            displayName: 'R',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            cppMethod: 'out_right',
            description: 'Right audio output',
        },
    ],

    // === VISUAL ===
    colorScheme: BlockColorScheme.UTILITY,
    icon: 'MoveHorizontal',

    // === DOCUMENTATION ===
    description: 'Stereo panning with tangent law (DAFX)',
    documentation: `
Mono-to-stereo panning using tangent law for natural sound distribution.

Parameters:
- Pan: Position from -1 (left) to +1 (right)
- Angle: Loudspeaker base angle for tangent law calculation

Outputs L/R stereo signal from mono input.

Based on DAFX Book Chapter 5, Section 5.1 (stereopan.m by V. Pulkki, T. Lokki)
    `.trim(),
};
