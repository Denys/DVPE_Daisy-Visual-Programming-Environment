/**
 * Tone Stack Block
 * 
 * DAFX Book tonestack.m - 3-band amp EQ
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

export const ToneStackBlock: BlockDefinition = {
    // === IDENTITY ===
    id: 'toneStack',
    className: 'daisysp::ToneStack',
    displayName: 'TONE STACK',
    category: BlockCategory.EFFECTS,

    // === C++ CODE GENERATION ===
    headerFile: 'effects/tonestack.h',
    namespace: 'daisysp',
    initMethod: 'Init',
    initParams: ['sample_rate'],
    processMethod: 'Process',
    processReturnType: 'float',

    // === PARAMETERS ===
    parameters: [
        {
            id: 'bass',
            displayName: 'Bass',
            type: ParameterType.FLOAT,
            cppSetter: 'SetBass',
            defaultValue: 0.0,
            range: { min: -1.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: true,
            group: 'EQ',
            description: 'Low frequency boost/cut',
        },
        {
            id: 'middle',
            displayName: 'Middle',
            type: ParameterType.FLOAT,
            cppSetter: 'SetMiddle',
            defaultValue: 0.0,
            range: { min: -1.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: true,
            group: 'EQ',
            description: 'Mid frequency boost/cut',
        },
        {
            id: 'treble',
            displayName: 'Treble',
            type: ParameterType.FLOAT,
            cppSetter: 'SetTreble',
            defaultValue: 0.0,
            range: { min: -1.0, max: 1.0, step: 0.01, curve: ParameterCurve.LINEAR },
            cvModulatable: true,
            group: 'EQ',
            description: 'High frequency boost/cut',
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
            id: 'bass_cv',
            displayName: 'BASS CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Bass modulation input',
        },
        {
            id: 'middle_cv',
            displayName: 'MID CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Middle modulation input',
        },
        {
            id: 'treble_cv',
            displayName: 'TREB CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Treble modulation input',
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
    icon: 'SlidersHorizontal',

    // === DOCUMENTATION ===
    description: 'Three-band tone stack EQ (DAFX)',
    documentation: `
Simplified amp-style 3-band EQ modeled after classic Fender/Marshall circuits.

Parameters:
- Bass: Low frequency boost/cut (-1 to +1)
- Middle: Mid frequency boost/cut (-1 to +1)
- Treble: High frequency boost/cut (-1 to +1)

Based on DAFX Book Chapter 12, Section 12.4
    `.trim(),
};
