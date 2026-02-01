/**
 * Universal Comb Filter Block
 * 
 * DAFX Book unicomb.m - Configurable comb filter
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

export const UniversalCombBlock: BlockDefinition = {
    // === IDENTITY ===
    id: 'universalComb',
    className: 'daisysp::UniversalComb<2048>',
    displayName: 'UNI COMB',
    category: BlockCategory.EFFECTS,

    // === C++ CODE GENERATION ===
    headerFile: 'effects/universal_comb.h',
    namespace: 'daisysp',
    initMethod: 'Init',
    initParams: ['sample_rate'],
    processMethod: 'Process',
    processReturnType: 'float',

    // === PARAMETERS ===
    parameters: [
        {
            id: 'delayMs',
            displayName: 'Delay',
            type: ParameterType.FLOAT,
            cppSetter: 'SetDelayMs',
            defaultValue: 10.0,
            range: { min: 0.1, max: 50.0, step: 0.1, curve: ParameterCurve.LOGARITHMIC },
            unit: 'ms',
            cvModulatable: true,
            group: 'Delay',
            description: 'Delay time in milliseconds',
        },
        {
            id: 'feedback',
            displayName: 'Feedback',
            type: ParameterType.FLOAT,
            cppSetter: 'SetFeedback',
            defaultValue: 0.0,
            range: { min: -0.999, max: 0.999, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: true,
            group: 'Filter',
            description: 'Feedback coefficient (FB)',
        },
        {
            id: 'feedforward',
            displayName: 'Feedforward',
            type: ParameterType.FLOAT,
            cppSetter: 'SetFeedforward',
            defaultValue: 1.0,
            range: { min: -1.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: true,
            group: 'Filter',
            description: 'Feedforward coefficient (FF)',
        },
        {
            id: 'blend',
            displayName: 'Blend',
            type: ParameterType.FLOAT,
            cppSetter: 'SetBlend',
            defaultValue: 0.5,
            range: { min: 0.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: true,
            group: 'Filter',
            description: 'Dry signal blend (BL)',
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
            description: 'Audio input',
        },
        {
            id: 'delayMs_cv',
            displayName: 'DLY CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Delay modulation input',
        },
        {
            id: 'feedback_cv',
            displayName: 'FB CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Feedback modulation input',
        },
        {
            id: 'feedforward_cv',
            displayName: 'FF CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Feedforward modulation input',
        },
        {
            id: 'blend_cv',
            displayName: 'BL CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Blend modulation input',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            cppMethod: 'Process',
            description: 'Audio output',
        },
    ],

    // === VISUAL ===
    colorScheme: BlockColorScheme.FX,
    icon: 'Repeat',

    // === DOCUMENTATION ===
    description: 'Universal comb filter with FB/FF/blend (DAFX)',
    documentation: `
Flexible comb filter structure for flanger, chorus, and physical modeling.

y[n] = FF * x[n-M] + BL * x[n] + FB * y[n-M]

Parameters:
- Delay: Delay time (0.1-50 ms)
- Feedback: FB coefficient (-1 to +1)
- Feedforward: FF coefficient (-1 to +1)
- Blend: Dry signal mix (0-1)

Based on DAFX Book Chapter 2 (unicomb.m by P. Dutilleux, U Zölzer)
    `.trim(),
};
