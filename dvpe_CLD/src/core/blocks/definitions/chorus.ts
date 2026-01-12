/**
 * Chorus Block Definition
 * daisysp::Chorus - Stereo chorus effect
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

export const ChorusBlock: BlockDefinition = {
    // Identity
    id: 'chorus',
    className: 'daisysp::Chorus',
    displayName: 'CHORUS',
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
            id: 'lfo_freq',
            displayName: 'Rate',
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
            displayName: 'Depth',
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
            description: 'Modulation depth (0-1)',
        },
        {
            id: 'delay',
            displayName: 'Delay',
            type: ParameterType.FLOAT,
            cppSetter: 'SetDelay',
            defaultValue: 0.5,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: false,
            group: 'Main',
            description: 'Base delay time',
        },
        {
            id: 'feedback',
            displayName: 'Feedback',
            type: ParameterType.FLOAT,
            cppSetter: 'SetFeedback',
            defaultValue: 0.2,
            range: {
                min: 0.0,
                max: 0.99,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: false,
            group: 'Advanced',
            description: 'Feedback amount (0-0.99)',
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
            id: 'lfo_freq_cv',
            displayName: 'RATE CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Rate modulation input',
        },
        {
            id: 'lfo_depth_cv',
            displayName: 'DPTH CV',
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
            description: 'Processed audio output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.AUDIO,
    icon: 'Layers',

    // Documentation
    description: 'Chorus effect with LFO modulation',
    documentation: `
Creates a rich, shimmering sound by mixing the input with delayed,
pitch-modulated copies of itself.

Great for:
- Thickening synth pads and strings
- Adding movement to clean guitar tones
- Creating ensemble-like textures
  `.trim(),
};
