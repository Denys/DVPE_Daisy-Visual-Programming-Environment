/**
 * Vibrato Block
 * 
 * DAFX Book vibrato.m - Delay-based pitch modulation
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

export const VibratoBlock: BlockDefinition = {
    // === IDENTITY ===
    id: 'vibrato',
    className: 'daisysp::Vibrato',
    displayName: 'VIBRATO',
    category: BlockCategory.MODULATORS,

    // === C++ CODE GENERATION ===
    headerFile: 'modulation/vibrato.h',
    namespace: 'daisysp',
    initMethod: 'Init',
    initParams: ['sample_rate'],
    processMethod: 'Process',
    processReturnType: 'float',

    // === PARAMETERS ===
    parameters: [
        {
            id: 'frequency',
            displayName: 'Rate',
            type: ParameterType.FLOAT,
            cppSetter: 'SetFrequency',
            defaultValue: 5.0,
            range: { min: 0.1, max: 20.0, step: 0.1, curve: ParameterCurve.LOGARITHMIC },
            unit: 'Hz',
            cvModulatable: true,
            group: 'Modulation',
            description: 'Modulation frequency',
        },
        {
            id: 'width',
            displayName: 'Depth',
            type: ParameterType.FLOAT,
            cppSetter: 'SetWidth',
            defaultValue: 0.005,
            range: { min: 0.0001, max: 0.1, step: 0.0001, curve: ParameterCurve.LOGARITHMIC },
            unit: 's',
            cvModulatable: true,
            group: 'Modulation',
            description: 'Modulation depth (delay width)',
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
            displayName: 'RATE CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Rate modulation input',
        },
        {
            id: 'width_cv',
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
    icon: 'Waves',

    // === DOCUMENTATION ===
    description: 'Vibrato effect using modulated delay line (DAFX)',
    documentation: `
Pitch modulation effect using a modulated delay line with linear interpolation.

Parameters:
- Rate: Modulation frequency (0.1-20 Hz)
- Depth: Modulation depth / delay width (0.1-100 ms)

Based on DAFX Book Chapter 2, Section 2.4 (vibrato.m by S. Disch)
    `.trim(),
};
