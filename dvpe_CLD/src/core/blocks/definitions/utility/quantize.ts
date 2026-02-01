import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
    ParameterType,
} from '@/types';

export const QuantizeBlock: BlockDefinition = {
    id: 'quantize',
    className: 'DVPE_Quantize',
    displayName: 'QUANTIZE',
    category: BlockCategory.UTILITY,

    // round(in / step) * step
    cppInlineProcess: 'roundf({{in}} / {{step}}) * {{step}}',

    parameters: [
        {
            id: 'step',
            displayName: 'Step',
            type: ParameterType.FLOAT,
            defaultValue: 0.1,
            description: 'Quantization step size',
            cppSetter: '',
        },
    ],

    ports: [
        {
            id: 'in',
            displayName: 'IN',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Input signal',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT,
            description: 'Quantized output',
        },
    ],

    colorScheme: BlockColorScheme.UTILITY,
    icon: 'Grid',

    description: 'Quantize signal to discrete steps',
    documentation: 'Rounds the input signal to the nearest multiple of the Step value.',
};
