/**
 * DC Source Block Definition
 * Constant Value Source
 */

import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    ParameterType,
    SignalType,
    PortDirection,
} from '@/types';

export const DcSourceBlock: BlockDefinition = {
    // Identity
    id: 'dc_source',
    className: 'DcSource',
    displayName: 'DC SOURCE',
    category: BlockCategory.SOURCES,

    // C++ Code Generation
    headerFile: '',
    namespace: '',
    initMethod: '',
    initParams: [],
    processMethod: '',
    processReturnType: 'float',

    // Parameters
    parameters: [
        {
            id: 'value',
            displayName: 'Value',
            type: ParameterType.FLOAT,
            cppSetter: '',
            defaultValue: 1.0,
            range: {
                min: -1000.0,
                max: 1000.0,
                step: 0.01,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Constant output value',
        },
    ],

    // Ports
    ports: [
        {
            id: 'value_cv',
            displayName: 'VAL CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Value modulation',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT,
            description: 'Constant output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.AUDIO, // Or LOGIC/USER, but it's a Source so SOURCES (AUDIO usually)
    icon: 'Hash', // Number symbol

    // Documentation
    description: 'Constant DC value source',
    documentation: `
Generates a constant DC (Direct Current) output value.

Use for:
- Fixed CV offsets
- Setting constant parameters
- Logic high/low (1/0)
  `.trim(),
};
