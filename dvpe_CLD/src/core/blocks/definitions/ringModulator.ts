/**
 * Ring Modulator Block
 * 
 * DAFX Book ringmod - Amplitude modulation for metallic tones
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

export const RingModulatorBlock: BlockDefinition = {
    // === IDENTITY ===
    id: 'ringModulator',
    className: 'daisysp::RingModulator',
    displayName: 'RING MOD',
    category: BlockCategory.MODULATORS,

    // === C++ CODE GENERATION ===
    headerFile: 'modulation/ringmod.h',
    namespace: 'daisysp',
    initMethod: 'Init',
    initParams: ['sample_rate'],
    processMethod: 'Process',
    processReturnType: 'float',

    // === PARAMETERS ===
    parameters: [
        {
            id: 'frequency',
            displayName: 'Frequency',
            type: ParameterType.FLOAT,
            cppSetter: 'SetFrequency',
            defaultValue: 440.0,
            range: { min: 1.0, max: 10000.0, step: 1.0, curve: ParameterCurve.LOGARITHMIC },
            unit: 'Hz',
            cvModulatable: true,
            group: 'Modulator',
            description: 'Modulator frequency',
        },
        {
            id: 'depth',
            displayName: 'Depth',
            type: ParameterType.FLOAT,
            cppSetter: 'SetDepth',
            defaultValue: 1.0,
            range: { min: 0.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: true,
            group: 'Modulator',
            description: 'Modulation depth',
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
            id: 'frequency_cv',
            displayName: 'FREQ CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Frequency modulation input',
        },
        {
            id: 'depth_cv',
            displayName: 'DEPTH CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Depth modulation input',
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
    colorScheme: BlockColorScheme.MODULATION,
    icon: 'CircleDot',

    // === DOCUMENTATION ===
    description: 'Ring modulator for metallic/bell tones (DAFX)',
    documentation: `
Ring modulation effect that multiplies input signal by a sine wave.

Creates metallic, bell-like tones and classic ring modulation effects.

Parameters:
- Frequency: Modulator frequency (1-10000 Hz)
- Depth: Modulation depth (0-1)

Based on DAFX Book Chapter 3, Section 3.2
    `.trim(),
};
