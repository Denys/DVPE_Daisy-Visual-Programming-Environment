import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
    ParameterType,
} from '@/types';

export const RangeMapBlock: BlockDefinition = {
    id: 'range_map',
    className: 'DVPE_RangeMap',
    displayName: 'MAP',
    category: BlockCategory.UTILITY,

    // out = out_min + (in - in_min) * (out_max - out_min) / (in_max - in_min)
    cppInlineProcess: '{{out_min}} + ({{in}} - {{in_min}}) * ({{out_max}} - {{out_min}}) / ({{in_max}} - {{in_min}})',

    parameters: [
        {
            id: 'in_min',
            displayName: 'In Min',
            type: ParameterType.FLOAT,
            defaultValue: 0.0,
            description: 'Input minimum',
            cppSetter: '',
        },
        {
            id: 'in_max',
            displayName: 'In Max',
            type: ParameterType.FLOAT,
            defaultValue: 1.0,
            description: 'Input maximum',
            cppSetter: '',
        },
        {
            id: 'out_min',
            displayName: 'Out Min',
            type: ParameterType.FLOAT,
            defaultValue: 0.0,
            description: 'Output minimum',
            cppSetter: '',
        },
        {
            id: 'out_max',
            displayName: 'Out Max',
            type: ParameterType.FLOAT,
            defaultValue: 1.0,
            description: 'Output maximum',
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
            description: 'Mapped output',
        },
    ],

    colorScheme: BlockColorScheme.UTILITY,
    icon: 'Minimize2',

    description: 'Map signal from one range to another',
    documentation: 'Linearly maps the input value from [In Min, In Max] to [Out Min, Out Max].',
};
