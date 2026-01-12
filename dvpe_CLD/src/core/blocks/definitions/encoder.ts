/**
 * Encoder Block Definition
 * Hardware rotary encoder with push button
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

export const EncoderBlock: BlockDefinition = {
    // Identity
    id: 'encoder',
    className: 'Encoder',
    displayName: 'ENCODER',
    category: BlockCategory.USER_IO,

    // C++ Code Generation
    headerFile: 'daisy_field.h',
    namespace: 'daisy',
    initMethod: 'Init',
    initParams: [],
    processMethod: 'Increment',
    processReturnType: 'float', // Encoder returns int, but type system uses float

    // Parameters
    parameters: [
        {
            id: 'min_val',
            displayName: 'Min',
            type: ParameterType.FLOAT,
            cppSetter: 'SetMin',
            defaultValue: 0.0,
            range: {
                min: -1000.0,
                max: 1000.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: false,
            group: 'Range',
            description: 'Minimum output value',
        },
        {
            id: 'max_val',
            displayName: 'Max',
            type: ParameterType.FLOAT,
            cppSetter: 'SetMax',
            defaultValue: 1.0,
            range: {
                min: -1000.0,
                max: 1000.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: false,
            group: 'Range',
            description: 'Maximum output value',
        },
        {
            id: 'step',
            displayName: 'Step',
            type: ParameterType.FLOAT,
            cppSetter: 'SetStep',
            defaultValue: 0.01,
            range: {
                min: 0.001,
                max: 1.0,
                step: 0.001,
                curve: ParameterCurve.LOGARITHMIC,
            },
            cvModulatable: false,
            group: 'Range',
            description: 'Value change per encoder tick',
        },
    ],

    // Ports
    ports: [
        {
            id: 'value',
            displayName: 'VALUE',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT,
            description: 'Accumulated position value (min to max)',
        },
        {
            id: 'increment',
            displayName: 'INC',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT,
            description: 'Delta change per tick (-1, 0, or +1)',
        },
        {
            id: 'press',
            displayName: 'PRESS',
            signalType: SignalType.TRIGGER,
            direction: PortDirection.OUTPUT,
            description: 'Button press trigger',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.USER,
    icon: 'RotateCw',

    // Documentation
    description: 'Rotary encoder with push button',
    documentation: `
Reads rotary encoder input with increment/decrement detection.

Outputs:
- VALUE: Accumulated position within min/max range (wraps or clamps)
- INC: Delta change per tick (-step, 0, or +step)
- PRESS: Trigger when encoder button is pressed

Use VALUE for parameter control (like a virtual knob).
Use INC for scrolling or relative adjustments.
Use PRESS for selection or mode switching.

Common on Daisy Pod, Field, and Patch.Init hardware.
  `.trim(),
};
