/**
 * Phase Vocoder Pitch Shifter Block
 * 
 * DAFX Book VX_pitch_pv.m - FFT-based pitch shifting
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

export const PhaseVocoderPitchBlock: BlockDefinition = {
    // === IDENTITY ===
    id: 'phaseVocoderPitch',
    className: 'daisysp::PhaseVocoder<2048>',
    displayName: 'PV PITCH',
    category: BlockCategory.EFFECTS,

    // === C++ CODE GENERATION ===
    headerFile: 'spectral/phase_vocoder.h',
    namespace: 'daisysp',
    initMethod: 'Init',
    initParams: ['sample_rate'],
    processMethod: 'Process',
    processReturnType: 'float',

    // === PARAMETERS ===
    parameters: [
        {
            id: 'pitchRatio',
            displayName: 'Pitch',
            type: ParameterType.FLOAT,
            cppSetter: 'SetPitchRatio',
            defaultValue: 1.0,
            range: { min: 0.5, max: 2.0, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: true,
            group: 'Pitch',
            description: 'Pitch ratio (0.5 = -1 oct, 1.0 = unity, 2.0 = +1 oct)',
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
            id: 'pitchRatio_cv',
            displayName: 'PITCH CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Pitch ratio modulation input',
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
    icon: 'TrendingUp',

    // === DOCUMENTATION ===
    description: 'FFT-based pitch shifter using phase vocoder (DAFX)',
    documentation: `
Phase vocoder pitch shifter using FFT analysis/synthesis.

Parameters:
- Pitch: Pitch ratio (0.5 = octave down, 2.0 = octave up)

Uses 2048-point FFT with 75% overlap. Higher CPU usage but high quality.

Based on DAFX Book Chapter 7 (VX_pitch_pv.m)
    `.trim(),
};
