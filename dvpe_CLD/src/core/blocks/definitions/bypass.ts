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
    description: 'Pass-through utility block',
    documentation: `
Simply passes the input directly to output.

out = in

Use for:
- Signal routing clarity
- Creating named nodes
- Placeholder for future processing
  `.trim(),
};
