/**
 * Looper Block Definition
 * daisysp::Looper - Multimode audio looper
 */

import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    ParameterType,
    SignalType,
    PortDirection,
} from '@/types';

export const LooperBlock: BlockDefinition = {
    // Identity
    id: 'looper',
    className: 'daisysp::Looper',
    displayName: 'LOOPER',
    category: BlockCategory.UTILITY,

    // C++ Code Generation
    headerFile: 'daisysp.h',
    namespace: 'daisysp',
    // Special Init Handling:
    // Requires a buffer pointer and size. 
    // Init(float *mem, size_t size)
    // The code generator must handle allocation of the buffer if it sees this block type or 
    // via a custom init string which DVPE doesn't fully support yet in definitions.
    // For now, we assume the code generator will be updated or we rely on a manual path in the future Phase 13.
    // However, specifically for this block, we can't easily express "pointer to global array".
    // Note: The Init method here is standard, but the params are not standard inputs.
    // We will leave initParams empty and hope to handle it, OR we mark it.
    // Currently, let's mark it as requiring `Init` but we won't list params that effectively map to state.
    initMethod: 'Init',
    // initParams: ['BUFFER_PTR', 'BUFFER_SIZE'], // Conceptual
    processMethod: 'Process',
    processReturnType: 'float',
    processParams: ['input'],

    // Parameters
    parameters: [
        {
            id: 'mode',
            displayName: 'Mode',
            type: ParameterType.INT,
            cppSetter: 'SetMode',
            // Needs cast to Looper::Mode
            defaultValue: 0,
            range: {
                min: 0,
                max: 3,
                step: 1,
            },
            // 0=NORMAL, 1=ONETIME_DUB, 2=REPLACE, 3=FRIPPERTRONICS
            group: 'Main',
            description: 'Looping mode (0: Normal, 1: Onetime Dub, 2: Replace, 3: Frippertronics)',
        },
        {
            id: 'reverse',
            displayName: 'Reverse',
            type: ParameterType.BOOL,
            cppSetter: 'SetReverse',
            defaultValue: false,
            group: 'Playback',
            description: 'Play in reverse',
        },
        {
            id: 'half_speed',
            displayName: 'Half Speed',
            type: ParameterType.BOOL,
            cppSetter: 'SetHalfSpeed',
            defaultValue: false,
            group: 'Playback',
            description: 'Play at half speed',
        },
    ],

    // Ports
    ports: [
        {
            id: 'input',
            displayName: 'IN',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            description: 'Audio input',
        },
        {
            id: 'rec_trig',
            displayName: 'REC',
            signalType: SignalType.TRIGGER,
            direction: PortDirection.INPUT,
            cppMethod: 'TrigRecord',
            description: 'Trigger recording',
        },
        {
            id: 'clear_trig',
            displayName: 'CLR',
            signalType: SignalType.TRIGGER,
            direction: PortDirection.INPUT,
            cppMethod: 'Clear',
            description: 'Clear buffer',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            cppMethod: 'Process', // This is the main output process
            description: 'Loop output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.UTILITY,
    icon: 'Repeat',

    // Documentation
    description: 'Multimode audio looper with buffering.',
    documentation: `
Records and loops audio. Requires memory allocation.

**Modes:**
- **Normal**: Input added to existing loop.
- **Onetime Dub**: Adds input for one loop cycle.
- **Replace**: Overwrites existing audio.
- **Frippertronics**: Infinite looping with decay.

**Controls:**
- **REC**: Toggles recording state. First trigger starts loop.
- **CLR**: Clears the buffer.
  `.trim(),
};
