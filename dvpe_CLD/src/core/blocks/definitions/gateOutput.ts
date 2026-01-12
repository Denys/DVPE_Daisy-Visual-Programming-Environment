/**
 * GateOutput Block Definition
 * Hardware gate output (GPIO)
 */

import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    ParameterType,
    SignalType,
    PortDirection,
} from '@/types';

export const GateOutputBlock: BlockDefinition = {
    // Identity
    id: 'gate_output',
    className: 'inline::GateOutput',
    displayName: 'GATE OUT',
    category: BlockCategory.USER_IO,

    // C++ Code Generation - uses GPIO output
    headerFile: 'daisy_seed.h',
    namespace: 'daisy',
    initMethod: '',
    initParams: [],
    processMethod: '',
    processReturnType: 'void',

    // Parameters
    parameters: [
        {
            id: 'pin',
            displayName: 'Pin',
            type: ParameterType.INT,
            cppSetter: '',
            defaultValue: 0,
            range: {
                min: 0,
                max: 31,
                step: 1,
            },
            group: 'Main',
            description: 'GPIO pin number',
        },
    ],

    // Ports
    ports: [
        {
            id: 'gate',
            displayName: 'GATE',
            signalType: SignalType.TRIGGER,
            direction: PortDirection.INPUT,
            description: 'Gate signal input',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.USER,
    icon: 'ToggleRight',

    // Documentation
    description: 'Hardware gate output via GPIO',
    documentation: `
Outputs gate/trigger signal to hardware pin.
When gate is high (true), pin outputs 3.3V.
When gate is low (false), pin outputs 0V.
    `.trim(),
};
