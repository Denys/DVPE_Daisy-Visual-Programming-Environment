/**
 * Demux Block Definition
 * Signal demultiplexer (router)
 */

import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    ParameterType,
    SignalType,
    PortDirection,
} from '@/types';

export const DemuxBlock: BlockDefinition = {
    // Identity
    id: 'demux',
    className: 'Demux',
    displayName: 'DEMUX',
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
            id: 'outputCount',
            displayName: 'Outputs',
            type: ParameterType.ENUM,
            cppSetter: '',
            defaultValue: '4',
            enumValues: [
                { label: '2 Outputs', value: '2' },
                { label: '3 Outputs', value: '3' },
                { label: '4 Outputs', value: '4' },
            ],
            group: 'Main',
            description: 'Number of available output ports',
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
            description: 'Select which output (0-3)',
        },
    ],

    // Ports
    ports: [
        {
            id: 'in',
            displayName: 'IN',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            description: 'Input signal',
        },
        {
            id: 'select_cv',
            displayName: 'SEL CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'CV selection (0-1 maps to 0-3)',
        },
        {
            id: 'out0',
            displayName: 'OUT 0',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            description: 'Output 0',
        },
        {
            id: 'out1',
            displayName: 'OUT 1',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            description: 'Output 1',
        },
        {
            id: 'out2',
            displayName: 'OUT 2',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            description: 'Output 2',
        },
        {
            id: 'out3',
            displayName: 'OUT 3',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            description: 'Output 3',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.LOGIC,
    icon: 'GitBranch',

    // Documentation
    description: 'Routes input to one of 4 outputs',
    documentation: `
Demultiplexer - routes input to one of 4 outputs based on selection.
Non-selected outputs are silent (0.0).

Can be controlled by:
- Select parameter (0-3)
- CV input (0-1 maps to outputs 0-3)

Use for:
- Routing to different effect chains
- Polyphonic voice distribution
- Sequencer-controlled signal routing
  `.trim(),
};
