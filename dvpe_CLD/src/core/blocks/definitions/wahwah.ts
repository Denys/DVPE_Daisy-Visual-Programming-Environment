/**
 * WahWah Block
 * 
 * DAFX Book wahwah.m - Variable resonant bandpass filter
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

export const WahWahBlock: BlockDefinition = {
    // === IDENTITY ===
    id: 'wahwah',
    className: 'daisysp::WahWah',
    displayName: 'WAHWAH',
    category: BlockCategory.EFFECTS,

    // === C++ CODE GENERATION ===
    headerFile: 'effects/wahwah.h',
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
            defaultValue: 500.0,
            range: { min: 200.0, max: 2000.0, step: 1.0, curve: ParameterCurve.LOGARITHMIC },
            unit: 'Hz',
            cvModulatable: true,
            group: 'Main',
            description: 'Wah pedal position frequency',
        },
        {
            id: 'q',
            displayName: 'Q',
            type: ParameterType.FLOAT,
            cppSetter: 'SetQ',
            defaultValue: 5.0,
            range: { min: 1.0, max: 20.0, step: 0.1, curve: ParameterCurve.LINEAR },
            cvModulatable: true,
            group: 'Main',
            description: 'Filter resonance (Q factor)',
        },
        {
            id: 'depth',
            displayName: 'Depth',
            type: ParameterType.FLOAT,
            cppSetter: 'SetDepth',
            defaultValue: 1.0,
            range: { min: 0.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: true,
            group: 'Main',
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
            description: 'Frequency modulation input (pedal position)',
        },
        {
            id: 'q_cv',
            displayName: 'Q CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Q modulation input',
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
    colorScheme: BlockColorScheme.FX,
    icon: 'Footprints',

    // === DOCUMENTATION ===
    description: 'Wah-wah effect with variable bandpass filter (DAFX)',
    documentation: `
Classic wah-wah effect using a modulated bandpass filter.

Connect an LFO to FREQ CV for auto-wah, or use a control input for expression pedal.

Parameters:
- Frequency: Center frequency of the bandpass filter (pedal position)
- Q: Filter resonance / sharpness
- Depth: Modulation intensity

Based on DAFX Book Chapter 12, Section 12.3
    `.trim(),
};
