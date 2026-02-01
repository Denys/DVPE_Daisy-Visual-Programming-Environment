/**
 * ABS Block Definition
 * Absolute Value
 */

import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const AbsBlock: BlockDefinition = {
    // Identity
    id: 'abs',
    className: 'Abs',
    displayName: 'ABS',
    category: BlockCategory.MATH,

    // C++ Code Generation
    cppInlineProcess: 'fabsf({{in}})',

    // Parameters
    parameters: [],

    // Ports
    ports: [
        {
            id: 'in',
            displayName: 'IN',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Input value',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT,
            description: 'Absolute value output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.LOGIC,
    icon: 'MoreHorizontal',

    // Documentation
    description: 'Absolute value of input',
    documentation: `
Calculates the absolute value of the input.

out = |in|

Transforms bipolar signals (-1 to 1) to unipolar signals (0 to 1).
  `.trim(),
};
