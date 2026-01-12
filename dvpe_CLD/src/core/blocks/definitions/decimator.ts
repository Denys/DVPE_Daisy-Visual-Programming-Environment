/**
 * Decimator Block Definition
 * daisysp::Decimator - Sample rate reduction + bitcrush effect
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

export const DecimatorBlock: BlockDefinition = {
    // Identity
    id: 'decimator',
    className: 'daisysp::Decimator',
    displayName: 'DECIMATOR',
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
            id: 'downsample',
            displayName: 'Downsample',
            type: ParameterType.FLOAT,
            cppSetter: 'SetDownsampleFactor',
            defaultValue: 0.5,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Amount of sample rate reduction',
        },
        {
            id: 'bitcrush',
            displayName: 'Bitcrush',
            type: ParameterType.FLOAT,
            cppSetter: 'SetBitcrushFactor',
            defaultValue: 0.0,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Amount of bit depth reduction',
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
            id: 'downsample_cv',
            displayName: 'DS CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Downsample modulation',
        },
        {
            id: 'bitcrush_cv',
            displayName: 'BC CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Bitcrush modulation',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            cppMethod: 'Process',
            description: 'Decimated output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.FX,
    icon: 'Grid3X3',

    // Documentation
    description: 'Sample rate reduction and bitcrushing effect',
    documentation: `
Reduces sample rate and bit depth for lo-fi digital degradation effects.
Higher downsample values create more aliasing artifacts.
Higher bitcrush values reduce bit depth for grittier sound.
    `.trim(),
};
