/**
 * POW2 Block Definition
 * Power of 2 (2^x)
 */

import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const Pow2Block: BlockDefinition = {
    // Identity
    id: 'pow2',
    className: 'Pow2',
    displayName: 'POW2',
    category: BlockCategory.MATH,

    // C++ Code Generation
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
            id: 'in',
            displayName: 'IN',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Input value (exponent)',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT,
            description: '2^in output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.LOGIC,
    icon: 'ChevronsUp',

    // Documentation
    description: 'Power of 2 (2^x)',
    documentation: `
Calculates 2 raised to the power of the input.

out = 2 ^ in

Commonly used for frequency intervals (octaves).
  `.trim(),
};
