/**
 * Mux Block Definition
 * Signal multiplexer (selector)
 */

import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    ParameterType,
    SignalType,
    PortDirection,
} from '@/types';

export const MuxBlock: BlockDefinition = {
    // Identity
    id: 'mux',
    className: 'Mux',
    displayName: 'MUX',
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
            description: 'Number of available input ports',
        },
        {
            id: 'select',
            displayName: 'Select',
            type: ParameterType.INT,
            cppSetter: '',
            defaultValue: 0,
            range: {
                min: 0,
                max: 3,
                step: 1,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Select which input (0-3)',
        },
    ],

    // Ports
    ports: [
        {
            id: 'in0',
            displayName: 'IN 0',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            description: 'Input 0',
        },
        {
            id: 'in1',
            displayName: 'IN 1',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            description: 'Input 1',
        },
        {
            id: 'in2',
            displayName: 'IN 2',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            description: 'Input 2',
        },
        {
            id: 'in3',
            displayName: 'IN 3',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            description: 'Input 3',
        },
        {
            id: 'select_cv',
            displayName: 'SEL CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'CV selection (0-1 maps to 0-3)',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            description: 'Selected input',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.LOGIC,
    icon: 'GitMerge',

    // Documentation
    description: 'Selects one of 4 inputs to pass to output',
    documentation: `
Multiplexer - routes one of 4 inputs to the output based on selection.

Can be controlled by:
- Select parameter (0-3)
- CV input (0-1 maps to inputs 0-3)

Use for:
- Switching between sound sources
- Sequencer-controlled routing
- A/B/C/D comparisons
  `.trim(),
};
