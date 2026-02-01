import { BlockDefinition, BlockCategory, BlockColorScheme, SignalType, PortDirection, ParameterType } from '@/types';

export const yinPitch: BlockDefinition = {
    id: 'yin_pitch',
    displayName: 'Yin Pitch',
    className: 'daisysp::Yin1024',
    headerFile: 'analysis/yin.h',
    initMethod: 'Init',
    initParams: ['sample_rate'],
    processMethod: 'ProcessSample', // Special handling
    processReturnType: 'bool',
    description: 'DAFX YIN Pitch Detection Algorithm',
    category: BlockCategory.UTILITY,
    colorScheme: BlockColorScheme.UTILITY,
    documentation: 'classes/classdaisysp_1_1Yin.html',

    ports: [
        {
            id: 'in',
            displayName: 'In',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            cppParam: 'in'
        },
        {
            id: 'freq',
            displayName: 'Freq CV',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT
        },
        {
            id: 'midi',
            displayName: 'Midi CV',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT
        },
        {
            id: 'conf',
            displayName: 'Conf CV',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT
        }
    ],

    parameters: [
        {
            id: 'freq_min',
            displayName: 'Freq Min',
            type: ParameterType.FLOAT,
            defaultValue: 50.0,
            range: { min: 20.0, max: 200.0, step: 1.0 },
            unit: 'Hz',
            cppSetter: 'SetFrequencyRange'
            // CodeGen needs to handle tuple for SetFrequencyRange(min, max)?
            // Or we ignore setters here and handle manually in CodeGenerator.
        },
        {
            id: 'freq_max',
            displayName: 'Freq Max',
            type: ParameterType.FLOAT,
            defaultValue: 500.0,
            range: { min: 200.0, max: 2000.0, step: 10.0 },
            unit: 'Hz',
            cppSetter: 'SetFrequencyRange'
        }
    ]
};
