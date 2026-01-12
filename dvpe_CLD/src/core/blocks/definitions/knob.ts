/**
 * Knob Block Definition
 * Hardware potentiometer/knob input access via ADC
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

export const KnobBlock: BlockDefinition = {
    // Identity
    id: 'knob',
    className: 'Knob',
    displayName: 'KNOB',
    category: BlockCategory.USER_IO,

    // C++ Code Generation (hardware ADC access, no DaisySP class)
    headerFile: '',
    namespace: '',
    initMethod: '',
    initParams: [],
    processMethod: '', // Uses hardware.adc.GetFloat(channel)
    processReturnType: 'float',

    // Parameters
    parameters: [
        {
            id: 'channel',
            displayName: 'Channel',
            type: ParameterType.ENUM,
            cppSetter: '',
            defaultValue: '0',
            enumValues: [
                { label: 'ADC 0', value: '0', cppValue: '0' },
                { label: 'ADC 1', value: '1', cppValue: '1' },
                { label: 'ADC 2', value: '2', cppValue: '2' },
                { label: 'ADC 3', value: '3', cppValue: '3' },
                { label: 'ADC 4', value: '4', cppValue: '4' },
                { label: 'ADC 5', value: '5', cppValue: '5' },
                { label: 'ADC 6', value: '6', cppValue: '6' },
                { label: 'ADC 7', value: '7', cppValue: '7' },
            ],
            group: 'Hardware',
            description: 'ADC channel the knob is connected to',
        },
        {
            id: 'min',
            displayName: 'Min',
            type: ParameterType.FLOAT,
            cppSetter: '',
            defaultValue: 0.0,
            range: {
                min: -1000.0,
                max: 1000.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: false,
            group: 'Scaling',
            description: 'Output value when knob is fully CCW',
        },
        {
            id: 'max',
            displayName: 'Max',
            type: ParameterType.FLOAT,
            cppSetter: '',
            defaultValue: 1.0,
            range: {
                min: -1000.0,
                max: 1000.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: false,
            group: 'Scaling',
            description: 'Output value when knob is fully CW',
        },
        {
            id: 'curve',
            displayName: 'Curve',
            type: ParameterType.ENUM,
            cppSetter: '',
            defaultValue: 'linear',
            enumValues: [
                { label: 'Linear', value: 'linear' },
                { label: 'Logarithmic', value: 'logarithmic' },
                { label: 'Exponential', value: 'exponential' },
            ],
            group: 'Scaling',
            description: 'Response curve for the knob',
        },
    ],

    // Ports
    ports: [
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT,
            description: 'Scaled CV output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.USER,
    icon: 'Gauge',

    // Documentation
    description: 'Hardware knob/potentiometer input',
    documentation: `
Reads analog input from a hardware ADC channel (potentiometer, CV jack, etc.)
and scales it to a user-defined output range.

Min/Max set the output range.
Curve adjusts the response:
- Linear: Direct mapping (good for general use)
- Logarithmic: Faster at start, slower at end (good for frequency)
- Exponential: Slower at start, faster at end (good for amplitude)

The generated code reads from the ADC at control rate, not audio rate,
to avoid unnecessary CPU usage.
  `.trim(),
};
