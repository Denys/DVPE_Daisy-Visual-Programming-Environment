/**
 * Phaser Block Definition
 * daisysp::Phaser - Multi-stage allpass phaser effect
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

export const PhaserBlock: BlockDefinition = {
    // Identity
    id: 'phaser',
    className: 'daisysp::Phaser',
    displayName: 'PHASER',
    category: BlockCategory.EFFECTS,

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
            displayName: 'Frequency',
            type: ParameterType.FLOAT,
            cppSetter: 'SetFreq',
            defaultValue: 1000.0,
            range: {
                min: 100.0,
                max: 10000.0,
                step: 1.0,
                curve: ParameterCurve.LOGARITHMIC,
            },
            unit: 'Hz',
            cvModulatable: true,
            group: 'Main',
            description: 'Allpass filter center frequency',
        },
        {
            id: 'lfo_freq',
            displayName: 'LFO Rate',
            type: ParameterType.FLOAT,
            cppSetter: 'SetLfoFreq',
            defaultValue: 0.5,
            range: {
                min: 0.01,
                max: 10.0,
                step: 0.01,
                curve: ParameterCurve.LOGARITHMIC,
            },
            unit: 'Hz',
            cvModulatable: true,
            group: 'Main',
            description: 'LFO modulation rate',
        },
        {
            id: 'lfo_depth',
            displayName: 'LFO Depth',
            type: ParameterType.FLOAT,
            cppSetter: 'SetLfoDepth',
            defaultValue: 0.5,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Amount of LFO modulation',
        },
        {
            id: 'feedback',
            displayName: 'Feedback',
            type: ParameterType.FLOAT,
            cppSetter: 'SetFeedback',
            defaultValue: 0.5,
            range: {
                min: 0.0,
                max: 0.99,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Advanced',
            description: 'Feedback for resonant peaks',
        },
    ],

    // Ports
    ports: [
        {
            id: 'in',
            displayName: 'IN',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            description: 'Audio input',
        },
        {
            id: 'freq_cv',
            displayName: 'FREQ CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Frequency modulation',
        },
        {
            id: 'lfo_freq_cv',
            displayName: 'RATE CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'LFO rate modulation',
        },
        {
            id: 'lfo_depth_cv',
            displayName: 'DEPTH CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'LFO depth modulation',
        },
        {
            id: 'feedback_cv',
            displayName: 'FB CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Feedback modulation',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            cppMethod: 'Process',
            description: 'Phased output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.AUDIO,
    icon: 'Waves',

    // Documentation
    description: 'Multi-stage allpass phaser with LFO',
    documentation: `
Classic phaser effect using cascaded allpass filters.
The LFO sweeps the filter frequencies for the characteristic swirling sound.
Increase feedback for more resonant, pronounced phasing.
    `.trim(),
};
