/**
 * FDN Reverb Block
 * 
 * DAFX Book delaynetwork.m - Feedback Delay Network reverberator
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

export const FdnReverbBlock: BlockDefinition = {
    // === IDENTITY ===
    id: 'fdnReverb',
    className: 'daisysp::FDNReverb<8192>',
    displayName: 'FDN REVERB',
    category: BlockCategory.EFFECTS,

    // === C++ CODE GENERATION ===
    headerFile: 'effects/fdn_reverb.h',
    namespace: 'daisysp',
    initMethod: 'Init',
    initParams: ['sample_rate'],
    processMethod: 'Process',
    processReturnType: 'float',

    // === PARAMETERS ===
    parameters: [
        {
            id: 'decay',
            displayName: 'Decay',
            type: ParameterType.FLOAT,
            cppSetter: 'SetDecay',
            defaultValue: 0.97,
            range: { min: 0.9, max: 0.999, step: 0.001, curve: ParameterCurve.LINEAR },
            cvModulatable: true,
            group: 'Reverb',
            description: 'Reverb tail decay factor',
        },
        {
            id: 'mix',
            displayName: 'Mix',
            type: ParameterType.FLOAT,
            cppSetter: 'SetMix',
            defaultValue: 0.5,
            range: { min: 0.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: true,
            group: 'Output',
            description: 'Dry/wet mix',
        },
        {
            id: 'damping',
            displayName: 'Damping',
            type: ParameterType.FLOAT,
            cppSetter: 'SetDamping',
            defaultValue: 0.3,
            range: { min: 0.0, max: 0.99, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: true,
            group: 'Reverb',
            description: 'High-frequency damping',
        },
        {
            id: 'delayScale',
            displayName: 'Size',
            type: ParameterType.FLOAT,
            cppSetter: 'SetDelayScale',
            defaultValue: 1.0,
            range: { min: 0.1, max: 4.0, step: 0.1, curve: ParameterCurve.LINEAR },
            group: 'Reverb',
            description: 'Room size (delay scale)',
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
            id: 'decay_cv',
            displayName: 'DECAY CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Decay modulation input',
        },
        {
            id: 'mix_cv',
            displayName: 'MIX CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Mix modulation input',
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
    icon: 'Box',

    // === DOCUMENTATION ===
    description: 'Feedback Delay Network reverb (DAFX)',
    documentation: `
4-channel FDN reverb with Hadamard feedback matrix and prime-length delay lines.

Parameters:
- Decay: Reverb tail length (0.9-0.999)
- Mix: Dry/wet blend
- Damping: High-frequency absorption
- Size: Delay scale for room size

Based on DAFX Book Chapter 5 (delaynetwork.m by V. Pulkki, T. Lokki)
    `.trim(),
};
