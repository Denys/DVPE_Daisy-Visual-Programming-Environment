/**
 * Divide Block Definition
 * Signal division (protected)
 */

import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const DivideBlock: BlockDefinition = {
    // Identity
    id: 'divide',
    className: 'Divide',
    displayName: 'DIVIDE',
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
            displayName: 'DIVIDEND',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            description: 'Input to be divided',
        },
        {
            id: 'in2',
            displayName: 'DIVISOR',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            description: 'Divide by this signal',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            description: 'Quotient',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.LOGIC,
    icon: 'Divide',

    // Documentation
    description: 'Divides first signal by second (protected)',
    documentation: `
Signal division with protection against divide-by-zero.

out = in1 / max(abs(in2), 0.0001)

The divisor is clamped to prevent infinity/NaN.

Use for:
- Ratio calculations
- Normalization
- Inverse modulation
  `.trim(),
};
