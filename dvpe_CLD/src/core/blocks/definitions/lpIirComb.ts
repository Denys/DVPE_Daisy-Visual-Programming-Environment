/**
 * LP IIR Comb Filter Block
 * 
 * DAFX Book lpiircomb.m - Damped comb filter for reverb
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

export const LpIirCombBlock: BlockDefinition = {
    // === IDENTITY ===
    id: 'lpIirComb',
    className: 'daisysp::LPIIRComb<4096>',
    displayName: 'LP COMB',
    category: BlockCategory.EFFECTS,

    // === C++ CODE GENERATION ===
    headerFile: 'effects/lp_iir_comb.h',
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
            defaultValue: 50.0,
            range: { min: 1.0, max: 100.0, step: 0.1, curve: ParameterCurve.LOGARITHMIC },
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
            defaultValue: 0.7,
            range: { min: 0.0, max: 0.999, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: true,
            group: 'Filter',
            description: 'Feedback gain',
        },
        {
            id: 'damping',
            displayName: 'Damping',
            type: ParameterType.FLOAT,
            cppSetter: 'SetDamping',
            defaultValue: 0.3,
            range: { min: 0.0, max: 0.999, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: true,
            group: 'Filter',
            description: 'High-frequency damping',
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
            id: 'damping_cv',
            displayName: 'DAMP CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Damping modulation input',
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
    icon: 'Disc3',

    // === DOCUMENTATION ===
    description: 'Low-pass IIR comb filter for reverb (DAFX)',
    documentation: `
Comb filter with LP filter in feedback loop for frequency-dependent decay.

Creates natural high-frequency absorption similar to acoustic absorption.

Parameters:
- Delay: Delay time (1-100 ms)
- Feedback: Overall feedback gain
- Damping: High-frequency damping amount

Ideal for reverb building blocks and physical modeling.

Based on DAFX Book Chapters 2 and 5 (lpiircomb.m)
    `.trim(),
};
