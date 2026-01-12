/**
 * Smooth Block Definition
 * Signal smoothing (one-pole lowpass) - inline implementation
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

export const SmoothBlock: BlockDefinition = {
    // Identity
    id: 'smooth',
    className: 'inline::Smooth',
    displayName: 'SMOOTH',
    category: BlockCategory.UTILITY,

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
            id: 'smooth',
            displayName: 'Smoothing',
            type: ParameterType.FLOAT,
            cppSetter: '',
            defaultValue: 0.99,
            range: {
                min: 0.0,
                max: 0.9999,
                step: 0.001,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Smoothing amount (higher = slower)',
        },
    ],

    // Ports
    ports: [
        {
            id: 'in',
            displayName: 'IN',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'CV input',
        },
        {
            id: 'smooth_cv',
            displayName: 'SMOOTH CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Smoothing modulation',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT,
            description: 'Smoothed output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.CONTROL,
    icon: 'Waves',

    // Documentation
    description: 'Signal smoothing filter',
    documentation: `
One-pole lowpass filter for smoothing control signals.
Higher values = slower response, more smoothing.
Use to remove noise or zipper artifacts from controls.
    `.trim(),
};
