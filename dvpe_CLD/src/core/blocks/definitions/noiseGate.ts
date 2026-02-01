/**
 * Noise Gate Block
 * 
 * DAFX Book noisegt.m - Noise gate with hysteresis
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

export const NoiseGateBlock: BlockDefinition = {
    // === IDENTITY ===
    id: 'noiseGate',
    className: 'daisysp::NoiseGate',
    displayName: 'NOISE GATE',
    category: BlockCategory.DYNAMICS,

    // === C++ CODE GENERATION ===
    headerFile: 'dynamics/noisegate.h',
    namespace: 'daisysp',
    initMethod: 'Init',
    initParams: ['sample_rate'],
    processMethod: 'Process',
    processReturnType: 'float',

    // === PARAMETERS ===
    parameters: [
        {
            id: 'threshold',
            displayName: 'Threshold',
            type: ParameterType.FLOAT,
            cppSetter: 'SetThreshold',
            defaultValue: -40.0,
            range: { min: -60.0, max: 0.0, step: 0.5, curve: ParameterCurve.LINEAR },
            unit: 'dB',
            cvModulatable: true,
            group: 'Gate',
            description: 'Gate open threshold',
        },
        {
            id: 'attack',
            displayName: 'Attack',
            type: ParameterType.FLOAT,
            cppSetter: 'SetAttackTime',
            defaultValue: 0.001,
            range: { min: 0.0001, max: 0.1, step: 0.0001, curve: ParameterCurve.LOGARITHMIC },
            unit: 's',
            cvModulatable: true,
            group: 'Timing',
            description: 'Gate open time',
        },
        {
            id: 'hold',
            displayName: 'Hold',
            type: ParameterType.FLOAT,
            cppSetter: 'SetHoldTime',
            defaultValue: 0.1,
            range: { min: 0.001, max: 1.0, step: 0.001, curve: ParameterCurve.LOGARITHMIC },
            unit: 's',
            group: 'Timing',
            description: 'Minimum gate open time',
        },
        {
            id: 'release',
            displayName: 'Release',
            type: ParameterType.FLOAT,
            cppSetter: 'SetReleaseTime',
            defaultValue: 0.1,
            range: { min: 0.001, max: 1.0, step: 0.001, curve: ParameterCurve.LOGARITHMIC },
            unit: 's',
            cvModulatable: true,
            group: 'Timing',
            description: 'Gate close time',
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
            id: 'threshold_cv',
            displayName: 'THRESH CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Threshold modulation input',
        },
        {
            id: 'attack_cv',
            displayName: 'ATK CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Attack modulation input',
        },
        {
            id: 'release_cv',
            displayName: 'REL CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Release modulation input',
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
    colorScheme: BlockColorScheme.DYNAMICS,
    icon: 'DoorClosed',

    // === DOCUMENTATION ===
    description: 'Noise gate with hysteresis (DAFX)',
    documentation: `
Amplitude-based noise gate for removing unwanted low-level signals.

Parameters:
- Threshold: Level below which the gate closes (-60 to 0 dB)
- Attack: How fast the gate opens (0.1 ms - 100 ms)
- Hold: Minimum time gate stays open (1 ms - 1 s)
- Release: How fast the gate closes (1 ms - 1 s)

Includes hysteresis to prevent chattering at threshold.

Based on DAFX Book Chapter 4, Section 4.2 (noisegt.m by R. Bendiksen)
    `.trim(),
};
