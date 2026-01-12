/**
 * CrossFade Block Definition
 * daisysp::CrossFade - Mix between two signals
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

export const CrossFadeBlock: BlockDefinition = {
    // Identity
    id: 'crossfade',
    className: 'daisysp::CrossFade',
    displayName: 'CROSSFADE',
    category: BlockCategory.UTILITY,

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
            id: 'pos',
            displayName: 'Position',
            type: ParameterType.FLOAT,
            cppSetter: 'SetPos',
            defaultValue: 0.5,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Crossfade position (0=A, 1=B)',
        },
    ],

    // Ports
    ports: [
        {
            id: 'in1',
            displayName: 'A',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            description: 'Input A (position 0)',
        },
        {
            id: 'in2',
            displayName: 'B',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            description: 'Input B (position 1)',
        },
        {
            id: 'pos_cv',
            displayName: 'POS CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Position modulation',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            cppMethod: 'Process',
            description: 'Mixed output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.UTILITY,
    icon: 'ArrowLeftRight',

    // Documentation
    description: 'Smooth crossfade between two signals',
    documentation: `
Mixes between two input signals with equal-power crossfade.
Position at 0 outputs only input A, at 1 outputs only input B.
Middle position (0.5) provides equal mix of both signals.
    `.trim(),
};
