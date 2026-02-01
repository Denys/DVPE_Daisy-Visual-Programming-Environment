/**
 * EXP Block Definition
 * Exponential function (e^x)
 */

import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const ExpBlock: BlockDefinition = {
    // Identity
    id: 'exp',
    className: 'Exp',
    displayName: 'EXP',
    category: BlockCategory.MATH,

    // C++ Code Generation
    cppInlineProcess: 'expf({{in}})',

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
            description: 'Exponential output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.LOGIC,
    icon: 'TrendingUp',

    // Documentation
    description: 'Exponential (e^x)',
    documentation: `
Calculates the exponential of the input.

out = e ^ in

Useful for converting linear signals to exponential scaling (e.g. 1V/Oct).
  `.trim(),
};
