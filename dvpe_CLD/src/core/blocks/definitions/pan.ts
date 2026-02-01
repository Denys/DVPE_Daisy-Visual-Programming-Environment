/**
 * Pan Block Definition
 * Mono to stereo panning - inline implementation
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

export const PanBlock: BlockDefinition = {
    // Identity
    id: 'pan',
    className: 'inline::Pan',
    displayName: 'PAN',
    category: BlockCategory.UTILITY,

    // C++ Code Generation - inline, no DaisySP class
    headerFile: 'daisysp.h',
    namespace: 'daisysp',
    initMethod: '',
    initParams: [],
    processMethod: '',
    processReturnType: 'void',

    // Parameters
    parameters: [
        {
            id: 'pan',
            displayName: 'Pan',
            type: ParameterType.FLOAT,
            cppSetter: '',
            defaultValue: 0.5,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Pan position (0=left, 1=right)',
        },
    ],

    // Ports
    ports: [
        {
            id: 'in',
            displayName: 'IN',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            description: 'Mono audio input',
        },
        {
            id: 'pan_cv',
            displayName: 'PAN CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Pan modulation',
        },
        {
            id: 'left',
            displayName: 'L',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            description: 'Left output',
        },
        {
            id: 'right',
            displayName: 'R',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            description: 'Right output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.AUDIO,
    icon: 'MoveHorizontal',

    // Documentation
    description: 'Mono to stereo panning',
    documentation: `
Pans a mono signal across a stereo field.
Position 0 = full left, 0.5 = center, 1 = full right.
Uses equal-power panning for smooth transitions.
    `.trim(),
};
