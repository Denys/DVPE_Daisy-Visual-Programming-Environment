/**
 * LFO Block Definition
 * daisysp::Oscillator configured for low-frequency modulation
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

export const LfoBlock: BlockDefinition = {
    // Identity
    id: 'lfo',
    className: 'daisysp::Oscillator',
    displayName: 'LFO',
    category: BlockCategory.MODULATORS,

    // C++ Code Generation
    headerFile: 'daisysp.h',
    namespace: 'daisysp',
    initMethod: 'Init',
    initParams: ['sample_rate'],
    processMethod: 'Process',
    processReturnType: 'float',

    // Parameters
    parameters: [
        {
            id: 'freq',
            displayName: 'Rate',
            type: ParameterType.FLOAT,
            cppSetter: 'SetFreq',
            defaultValue: 1.0,
            range: {
                min: 0.01,
                max: 100.0,
                step: 0.01,
                curve: ParameterCurve.LOGARITHMIC,
            },
            unit: 'Hz',
            cvModulatable: true,
            group: 'Main',
            description: 'LFO rate in Hz (0.01-100 Hz)',
        },
        {
            id: 'amp',
            displayName: 'Depth',
            type: ParameterType.FLOAT,
            cppSetter: 'SetAmp',
            defaultValue: 1.0,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Modulation depth (0-1)',
        },
        {
            id: 'waveform',
            displayName: 'Shape',
            type: ParameterType.ENUM,
            cppSetter: 'SetWaveform',
            defaultValue: 'WAVE_SIN',
            enumValues: [
                { label: 'Sine', value: 'WAVE_SIN', cppValue: 'Oscillator::WAVE_SIN' },
                { label: 'Triangle', value: 'WAVE_TRI', cppValue: 'Oscillator::WAVE_TRI' },
                { label: 'Saw', value: 'WAVE_SAW', cppValue: 'Oscillator::WAVE_SAW' },
                { label: 'Ramp', value: 'WAVE_RAMP', cppValue: 'Oscillator::WAVE_RAMP' },
                { label: 'Square', value: 'WAVE_SQUARE', cppValue: 'Oscillator::WAVE_SQUARE' },
            ],
            group: 'Main',
            description: 'LFO waveform shape',
            cvModulatable: true,
        },
    ],

    // Ports
    ports: [

        {
            id: 'amp_cv',
            displayName: 'AMP CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Amplitude modulation input',
        },
        {
            id: 'freq_cv',
            displayName: 'RATE CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Rate modulation input',
        },
        {
            id: 'waveform_cv',
            displayName: 'WAVE CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Waveform selection modulation',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT,
            cppMethod: 'Process',
            description: 'Modulation output (-1 to 1)',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.CONTROL,
    icon: 'Activity',

    // Documentation
    description: 'Low Frequency Oscillator for modulation',
    documentation: `
LFO (Low Frequency Oscillator) generates slow-moving waveforms for modulating
other parameters like filter cutoff, oscillator pitch, or amplitude.

Rate range: 0.01 Hz (100 seconds period) to 100 Hz
Output range: -1 to +1 (bipolar)

Common uses:
- Vibrato: LFO → Oscillator Freq CV
- Tremolo: LFO → VCA CV
- Filter sweep: LFO → Filter Cutoff CV
  `.trim(),
};
