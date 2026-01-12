/**
 * DCBlock Block Definition
 * daisysp::DcBlock - DC offset remover
 */

import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const DcBlockBlock: BlockDefinition = {
    // Identity
    id: 'dcblock',
    className: 'daisysp::DcBlock',
    displayName: 'DC BLOCK',
    category: BlockCategory.UTILITY,

    // C++ Code Generation
    headerFile: 'daisysp.h',
    namespace: 'daisysp',
    initMethod: 'Init',
    initParams: ['sample_rate'],
    processMethod: 'Process',
    processReturnType: 'float',

    // Parameters - DC Block has no user-adjustable parameters
    parameters: [],

    // Ports
    ports: [
        {
            id: 'in',
            displayName: 'IN',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            description: 'Audio input (may contain DC offset)',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            cppMethod: 'Process',
            description: 'DC-blocked output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.LOGIC,
    icon: 'MinusCircle',

    // Documentation
    description: 'Removes DC offset from audio signal',
    documentation: `
Removes any DC (direct current) offset from the audio signal.
DC offset can cause clicks, pops, and speaker damage.

Place after:
- Oscillators with asymmetric waveforms
- Rectified signals
- Math operations that may introduce offset

This is a very gentle highpass filter optimized for DC removal
without affecting the audible frequency content.
  `.trim(),
};
