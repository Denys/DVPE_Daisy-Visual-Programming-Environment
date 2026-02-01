import { BlockDefinition, BlockCategory, BlockColorScheme, SignalType, PortDirection, ParameterType } from '@/types';

export const compressorExpander: BlockDefinition = {
    id: 'compressor_expander',
    displayName: 'Comp/Exp',
    className: 'daisysp::CompressorExpander',
    headerFile: 'dynamics/compressor_expander.h',
    initMethod: 'Init',
    initParams: ['sample_rate'],
    processMethod: 'Process',
    description: 'DAFX Compressor/Expander dynamics processor',
    category: BlockCategory.DYNAMICS,
    colorScheme: BlockColorScheme.DYNAMICS,
    documentation: 'classes/classdaisysp_1_1CompressorExpander.html',

    ports: [
        {
            id: 'in',
            displayName: 'In',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            cppParam: 'in'
        },
        {
            id: 'out',
            displayName: 'Out',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT
        }
    ],

    parameters: [
        {
            id: 'comp_threshold',
            displayName: 'Comp Thresh',
            type: ParameterType.FLOAT,
            defaultValue: -20.0,
            range: { min: -80.0, max: 0.0, step: 0.1 },
            unit: 'dB',
            cppSetter: 'SetCompThreshold'
        },
        {
            id: 'comp_ratio',
            displayName: 'Comp Ratio',
            type: ParameterType.FLOAT,
            defaultValue: 2.0,
            range: { min: 1.0, max: 40.0, step: 0.1 },
            unit: ':1',
            cppSetter: 'SetCompRatio'
        },
        {
            id: 'exp_threshold',
            displayName: 'Exp Thresh',
            type: ParameterType.FLOAT,
            defaultValue: -40.0,
            range: { min: -80.0, max: 0.0, step: 0.1 },
            unit: 'dB',
            cppSetter: 'SetExpThreshold'
        },
        {
            id: 'exp_ratio',
            displayName: 'Exp Ratio',
            type: ParameterType.FLOAT,
            defaultValue: 2.0,
            range: { min: 1.0, max: 40.0, step: 0.1 },
            unit: '1:',
            cppSetter: 'SetExpRatio'
        },
        {
            id: 'attack',
            displayName: 'Attack',
            type: ParameterType.FLOAT,
            defaultValue: 0.03,
            range: { min: 0.001, max: 1.0, step: 0.001 },
            unit: 's',
            cppSetter: 'SetAttackTime'
        },
        {
            id: 'release',
            displayName: 'Release',
            type: ParameterType.FLOAT,
            defaultValue: 0.003,
            range: { min: 0.001, max: 1.0, step: 0.001 },
            unit: 's',
            cppSetter: 'SetReleaseTime'
        },
        {
            id: 'lookahead',
            displayName: 'Lookahead',
            type: ParameterType.INT,
            defaultValue: 150,
            range: { min: 0, max: 256, step: 1 },
            unit: 'smps',
            cppSetter: 'SetLookahead'
        }
    ],

    // Legacy CodeGeneration format removal:
    // The interface in `blocks.ts` has flattened code gen properties
    // like `headerFile`, `processMethod` directly on BlockDefinition.
    // I need to verify `blocks.ts` again to see if `codeGeneration` object exists or not.
    // Step 561 lines 189-201 show properties directly on BlockDefinition.
    // Step 544 used `codeGeneration: {...}`. This was WRONG.
    // I need to use the flat properties.
};
