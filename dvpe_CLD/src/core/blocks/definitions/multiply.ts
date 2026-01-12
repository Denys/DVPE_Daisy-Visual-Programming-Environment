/**
 * Multiply Block Definition
 * Signal multiplication (ring modulation)
 */

import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const MultiplyBlock: BlockDefinition = {
    // Identity
    id: 'multiply',
    className: 'Multiply',
    displayName: 'MULTIPLY',
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
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            description: 'Product of inputs',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.LOGIC,
    icon: 'X',

    // Documentation
    description: 'Multiplies two signals together',
    documentation: `
Signal multiplication (ring modulation).

out = in1 * in2

Use for:
- Ring modulation effects
- Amplitude modulation (AM)
- VCA-like behavior with CV input
- Scaling signals
  `.trim(),
};
