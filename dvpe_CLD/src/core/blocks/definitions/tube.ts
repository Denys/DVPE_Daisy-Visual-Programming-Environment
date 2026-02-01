/**
 * Tube Distortion Block
 * 
 * DAFX Book tube.m - Asymmetrical waveshaping tube amp simulation
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

export const TubeBlock: BlockDefinition = {
    // === IDENTITY ===
    id: 'tube',
    className: 'daisysp::Tube',
    displayName: 'TUBE',
    category: BlockCategory.EFFECTS,

    // === C++ CODE GENERATION ===
    headerFile: 'effects/tube.h',
    namespace: 'daisysp',
    initMethod: 'Init',
    initParams: ['sample_rate'],
    processMethod: 'Process',
    processReturnType: 'float',

    // === PARAMETERS ===
    parameters: [
        {
            id: 'drive',
            displayName: 'Drive',
            type: ParameterType.FLOAT,
            cppSetter: 'SetDrive',
            defaultValue: 0.5,
            range: { min: 0.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: true,
            group: 'Distortion',
            description: 'Input gain / saturation amount',
        },
        {
            id: 'bias',
            displayName: 'Bias',
            type: ParameterType.FLOAT,
            cppSetter: 'SetBias',
            defaultValue: 0.0,
            range: { min: 0.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: true,
            group: 'Distortion',
            description: 'Asymmetry (even harmonics)',
        },
        {
            id: 'distortion',
            displayName: 'Distortion',
            type: ParameterType.FLOAT,
            cppSetter: 'SetDistortion',
            defaultValue: 0.5,
            range: { min: 0.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: true,
            group: 'Distortion',
            description: 'Waveshaper intensity',
        },
        {
            id: 'highPassPole',
            displayName: 'HP Pole',
            type: ParameterType.FLOAT,
            cppSetter: 'SetHighPassPole',
            defaultValue: 0.9,
            range: { min: 0.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            group: 'Filter',
            description: 'DC blocking filter pole',
        },
        {
            id: 'lowPassPole',
            displayName: 'LP Pole',
            type: ParameterType.FLOAT,
            cppSetter: 'SetLowPassPole',
            defaultValue: 0.9,
            range: { min: 0.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            group: 'Filter',
            description: 'High-frequency rolloff',
        },
        {
            id: 'mix',
            displayName: 'Mix',
            type: ParameterType.FLOAT,
            cppSetter: 'SetMix',
            defaultValue: 1.0,
            range: { min: 0.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: true,
            group: 'Output',
            description: 'Dry/wet blend',
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
            id: 'drive_cv',
            displayName: 'DRIVE CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Drive modulation input',
        },
        {
            id: 'bias_cv',
            displayName: 'BIAS CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Bias modulation input',
        },
        {
            id: 'distortion_cv',
            displayName: 'DIST CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Distortion modulation input',
        },
        {
            id: 'mix_cv',
            displayName: 'MIX CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Mix modulation input',
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
    icon: 'Flame',

    // === DOCUMENTATION ===
    description: 'Tube distortion with asymmetric waveshaping (DAFX)',
    documentation: `
DAFX Tube distortion simulator modeling tube amplifier saturation.

Signal flow: Input → HP Filter → Waveshaper → LP Filter → Mix → Output

Parameters:
- Drive: Input gain before waveshaper
- Bias: Asymmetry control (0 = symmetric, 1 = full asymmetric)
- Distortion: Waveshaper intensity
- HP/LP Pole: Pre/post filtering coefficients
- Mix: Dry/wet blend

Based on DAFX Book Chapter 5 (tube.m by Bendiksen, Dutilleux, Zölzer)
    `.trim(),
};
