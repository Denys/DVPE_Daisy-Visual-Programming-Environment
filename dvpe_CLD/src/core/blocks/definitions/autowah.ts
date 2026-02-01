/**
 * AutoWah Block Definition
 * daisysp::Autowah - Envelope-controlled filter effect
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

export const AutowahBlock: BlockDefinition = {
    // Identity
    id: 'autowah',
    className: 'daisysp::Autowah',
    displayName: 'AUTOWAH',
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
            id: 'wah',
            displayName: 'Wah',
            type: ParameterType.FLOAT,
            cppSetter: 'SetWah',
            defaultValue: 0.5,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Manual wah position',
        },
        {
            id: 'dry_wet',
            displayName: 'Dry/Wet',
            type: ParameterType.FLOAT,
            cppSetter: 'SetDryWet',
            defaultValue: 1.0,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Dry/wet mix (1.0 = fully wet)',
        },
        {
            id: 'level',
            displayName: 'Level',
            type: ParameterType.FLOAT,
            cppSetter: 'SetLevel',
            defaultValue: 0.5,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Output level',
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
            id: 'wah_cv',
            displayName: 'WAH CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Wah position modulation',
        },
        {
            id: 'dry_wet_cv',
            displayName: 'MIX CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Mix modulation',
        },
        {
            id: 'level_cv',
            displayName: 'LEVEL CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Level modulation',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            cppMethod: 'Process',
            description: 'Autowah output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.AUDIO,
    icon: 'AudioWaveform',

    // Documentation
    description: 'Envelope-controlled wah filter effect',
    documentation: `
Automatic wah effect that responds to input dynamics.
The filter sweeps based on the input signal envelope.
Use external CV for manual wah pedal control.
    `.trim(),
};
