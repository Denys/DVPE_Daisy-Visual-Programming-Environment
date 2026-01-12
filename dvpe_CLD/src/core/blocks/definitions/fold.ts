/**
 * Fold Block Definition
 * daisysp::Fold - Wavefolding distortion
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

export const FoldBlock: BlockDefinition = {
    // Identity
    id: 'fold',
    className: 'daisysp::Fold',
    displayName: 'FOLD',
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
            id: 'incr',
            displayName: 'Drive',
            type: ParameterType.FLOAT,
            cppSetter: 'SetIncrement',
            defaultValue: 1.0,
            range: {
                min: 0.1,
                max: 10.0,
                step: 0.1,
                curve: ParameterCurve.LOGARITHMIC,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Input gain / fold intensity',
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
            id: 'incr_cv',
            displayName: 'INCR CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Increment modulation input',
        },
        {
            id: 'drive_cv',
            displayName: 'DRIVE CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Drive modulation',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            cppMethod: 'Process',
            description: 'Folded output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.AUDIO,
    icon: 'Repeat',

    // Documentation
    description: 'Wavefolding waveshaper',
    documentation: `
Wavefolder creates complex harmonics by "folding" the waveform
back on itself when it exceeds a threshold.

Higher drive values = more folds = more harmonics.
Great for creating complex timbres from simple waveforms.

Classic West Coast synthesis technique.
  `.trim(),
};
