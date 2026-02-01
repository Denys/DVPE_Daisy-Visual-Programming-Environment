/**
 * Low Shelving Filter Block
 * 
 * DAFX Book lowshelving.m - First-order low shelving EQ
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

export const LowShelvingBlock: BlockDefinition = {
    // === IDENTITY ===
    id: 'lowShelving',
    className: 'daisysp::LowShelving',
    displayName: 'LOW SHELF',
    category: BlockCategory.FILTERS,

    // === C++ CODE GENERATION ===
    headerFile: 'filters/lowshelving.h',
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
            defaultValue: 100.0,
            range: { min: 20.0, max: 500.0, step: 1.0, curve: ParameterCurve.LOGARITHMIC },
            unit: 'Hz',
            cvModulatable: true,
            group: 'Filter',
            description: 'Corner frequency',
        },
        {
            id: 'gain',
            displayName: 'Gain',
            type: ParameterType.FLOAT,
            cppSetter: 'SetGain',
            defaultValue: 0.0,
            range: { min: -20.0, max: 20.0, step: 0.1, curve: ParameterCurve.LINEAR },
            unit: 'dB',
            cvModulatable: true,
            group: 'Filter',
            description: 'Boost/cut amount in dB',
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
            id: 'gain_cv',
            displayName: 'GAIN CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Gain modulation input',
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
    colorScheme: BlockColorScheme.FILTER,
    icon: 'ArrowDownToLine',

    // === DOCUMENTATION ===
    description: 'Low-frequency shelving filter (DAFX)',
    documentation: `
First-order low shelving filter for bass boost/cut.

Parameters:
- Frequency: Corner frequency (20-500 Hz)
- Gain: Boost or cut amount (-20 to +20 dB)

Based on DAFX Book Chapter 2, Section 2.3 (lowshelving.m by M. Holters)
    `.trim(),
};
