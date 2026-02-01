/**
 * Bypass Block Definition
 * Pass-through utility
 */

import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const BypassBlock: BlockDefinition = {
    // Identity
    id: 'bypass',
    className: 'Bypass',
    displayName: 'BYPASS',
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
            id: 'in',
            displayName: 'IN',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            description: 'Input signal',
        },
        {
            id: 'ctrl',
            displayName: 'CTRL',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Control input (> 0.5 passes signal)',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            description: 'Pass-through output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.LOGIC,
    icon: 'ArrowRight',

    // Documentation
    description: 'Pass-through utility / Mute',
    documentation: `
Passes input availability based on Control signal.

If CTRL > 0.5 (or unconnected): out = in
If CTRL <= 0.5: out = 0

Acts as a mute/gate or simple switch.
  `.trim(),
};
