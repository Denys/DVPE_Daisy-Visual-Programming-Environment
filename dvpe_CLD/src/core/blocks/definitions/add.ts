/**
 * Add Block Definition
 * Simple signal addition (2-4 inputs)
 */

import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    ParameterType,
    SignalType,
    PortDirection,
} from '@/types';

export const AddBlock: BlockDefinition = {
    // Identity
    id: 'add',
    className: 'Add',
    displayName: 'ADD',
    category: BlockCategory.UTILITY,

    // C++ Code Generation (inline operation)
    headerFile: '',
    namespace: '',
    initMethod: '',
    initParams: [],
    processMethod: '',
    processReturnType: 'float',

    // Parameters
    parameters: [
        {
            id: 'inputCount',
            displayName: 'Inputs',
            type: ParameterType.ENUM,
            cppSetter: '',
            defaultValue: '4',
            enumValues: [
                { label: '2 Inputs', value: '2' },
                { label: '3 Inputs', value: '3' },
                { label: '4 Inputs', value: '4' },
            ],
            group: 'Main',
            description: 'Number of active input ports',
        },
    ],

    // Ports
    ports: [
        {
            id: 'in1',
            displayName: 'IN 1',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            description: 'First input signal',
        },
        {
            id: 'in2',
            displayName: 'IN 2',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            description: 'Second input signal',
        },
        {
            id: 'in3',
            displayName: 'IN 3',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            description: 'Third input signal (optional)',
        },
        {
            id: 'in4',
            displayName: 'IN 4',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            description: 'Fourth input signal (optional)',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            description: 'Sum of all connected inputs',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.LOGIC,
    icon: 'Plus',

    // Documentation
    description: 'Adds up to 4 signals together',
    documentation: `
Simple signal addition. Sums all connected inputs.
Unconnected inputs contribute 0.

out = in1 + in2 + in3 + in4

Use for:
- Mixing modulation sources
- Combining CV signals
- Audio submixing
  `.trim(),
};
