/**
 * Wavefolder Block Definition
 * daisysp::Wavefolder - Waveshaping distortion effect
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

export const WavefolderBlock: BlockDefinition = {
    // Identity
    id: 'wavefolder',
    className: 'daisysp::Wavefolder',
    displayName: 'WAVEFOLDER',
    category: BlockCategory.EFFECTS,

    // C++ Code Generation
    headerFile: 'daisysp.h',
    namespace: 'daisysp',
    initMethod: 'Init',
    initParams: [],
    processMethod: 'Process',
    processReturnType: 'float',

    // Parameters
    parameters: [
        {
            id: 'gain',
            displayName: 'Gain',
            type: ParameterType.FLOAT,
            cppSetter: 'SetGain',
            defaultValue: 1.0,
            range: {
                min: 0.1,
                max: 10.0,
                step: 0.1,
                curve: ParameterCurve.LOGARITHMIC,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Input gain/drive',
        },
        {
            id: 'offset',
            displayName: 'Offset',
            type: ParameterType.FLOAT,
            cppSetter: 'SetOffset',
            defaultValue: 0.0,
            range: {
                min: -1.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'DC offset for asymmetric folding',
        },
    ],

    // Ports
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
            id: 'gain_cv',
            displayName: 'GAIN CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Gain modulation input',
        },
        {
            id: 'offset_cv',
            displayName: 'OFFSET CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Offset modulation input',
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

    // Visual
    colorScheme: BlockColorScheme.FX,
    icon: 'TrendingUp',

    // Documentation
    description: 'Waveshaping distortion via wavefolding',
    documentation: `
Wavefolding reduces amplitude while adding harmonics by folding
the waveform back when it exceeds a threshold.

Parameters:
- Gain: Input drive (higher = more folds = more harmonics)
- Offset: Asymmetric folding for odd harmonics

Use at high gain for complex, evolving timbres.
Great for making simple waveforms more interesting.
  `.trim(),
};
