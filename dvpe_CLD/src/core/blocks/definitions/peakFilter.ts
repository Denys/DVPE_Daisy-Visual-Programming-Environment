/**
 * Peak Filter Block (Parametric EQ)
 * 
 * DAFX Book peakfilt.m - Second-order parametric EQ
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

export const PeakFilterBlock: BlockDefinition = {
    // === IDENTITY ===
    id: 'peakFilter',
    className: 'daisysp::PeakFilter',
    displayName: 'PEAK EQ',
    category: BlockCategory.FILTERS,

    // === C++ CODE GENERATION ===
    headerFile: 'filters/peakfilter.h',
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
            defaultValue: 1000.0,
            range: { min: 20.0, max: 20000.0, step: 1.0, curve: ParameterCurve.LOGARITHMIC },
            unit: 'Hz',
            cvModulatable: true,
            group: 'Filter',
            description: 'Center frequency',
        },
        {
            id: 'bandwidth',
            displayName: 'Bandwidth',
            type: ParameterType.FLOAT,
            cppSetter: 'SetBandwidth',
            defaultValue: 100.0,
            range: { min: 10.0, max: 10000.0, step: 1.0, curve: ParameterCurve.LOGARITHMIC },
            unit: 'Hz',
            cvModulatable: true,
            group: 'Filter',
            description: 'Filter bandwidth',
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
            id: 'bandwidth_cv',
            displayName: 'BW CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Bandwidth modulation input',
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
    icon: 'AudioWaveform',

    // === DOCUMENTATION ===
    description: 'Parametric peak/notch EQ filter (DAFX)',
    documentation: `
Second-order parametric EQ for precise frequency shaping.

Parameters:
- Frequency: Center frequency (20 Hz - 20 kHz)
- Bandwidth: Width of the affected frequency range (Hz)
- Gain: Boost or cut amount (-20 to +20 dB)

Use positive gain for peak boost, negative for notch cut.

Based on DAFX Book Chapter 2, Section 2.3 (peakfilt.m by M. Holters)
    `.trim(),
};
