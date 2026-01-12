/**
 * Subtract Block Definition
 * Signal subtraction
 */

import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const SubtractBlock: BlockDefinition = {
    // Identity
    id: 'subtract',
    className: 'Subtract',
    displayName: 'SUBTRACT',
    category: BlockCategory.UTILITY,

    // C++ Code Generation (inline operation)
    headerFile: '',
    namespace: '',
    initMethod: '',
    initParams: [],
    processMethod: '',
    processReturnType: 'float',

    // Parameters
    parameters: [],

    // Ports
    ports: [
        {
            id: 'in1',
            displayName: 'IN 1 (+)',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            description: 'Positive input (minuend)',
        },
        {
            id: 'in2',
            displayName: 'IN 2 (-)',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            description: 'Negative input (subtrahend)',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            description: 'Difference of inputs',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.LOGIC,
    icon: 'Minus',

    // Documentation
    description: 'Subtracts second signal from first',
    documentation: `
Signal subtraction.

out = in1 - in2

Use for:
- Inverting phase
- Difference signals
- Sidechain-like effects
  `.trim(),
};
