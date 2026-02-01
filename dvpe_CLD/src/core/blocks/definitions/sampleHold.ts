/**
 * SampleHold Block Definition
 * daisysp::SampleHold - Sample and Hold / Track and Hold
 */

import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    ParameterType,
    SignalType,
    PortDirection,
} from '@/types';

export const SampleHoldBlock: BlockDefinition = {
    // Identity
    id: 'sample_hold',
    className: 'daisysp::SampleHold',
    displayName: 'S&H',
    category: BlockCategory.UTILITY,

    // C++ Code Generation
    headerFile: 'daisysp.h',
    namespace: 'daisysp',
    // No Init method needed for this simple utility, or standard constructor is fine.
    // But typically standard DaisySP Init isn't present for SampleHold?
    // Checking checked header: SampleHold has NO Init() method! It uses constructor.
    // We can omit initMethod or leave it empty if the code generator supports it.
    // Assuming code generator checks if initMethod is present. 
    // Wait, if I look at other utils (like Overdrive), they often don't have Init if not needed.
    // Or I can just not provide initParams.
    // Actually, keeping initMethod undefined/null is best.
    processMethod: 'Process',
    processReturnType: 'float',
    processParams: ['trigger', 'input', 'mode'],

    // Parameters
    parameters: [
        {
            id: 'mode',
            displayName: 'Mode',
            type: ParameterType.INT, // ENUM substitute
            defaultValue: 0,
            range: {
                min: 0,
                max: 1,
                step: 1,
            },
            // 0 = MODE_SAMPLE_HOLD, 1 = MODE_TRACK_HOLD
            // We might need a custom C++ value map if the generator supports it, 
            // otherwise we pass the int, which implicitly casts to enum if compatible or needs casting.
            // Ideally "static_cast<daisysp::SampleHold::Mode>(value)"
            group: 'Settings',
            cvModulatable: false,
            description: '0: Sample & Hold, 1: Track & Hold',
        },
    ],

    // Ports
    ports: [
        {
            id: 'trigger',
            displayName: 'TRIG',
            signalType: SignalType.TRIGGER,
            direction: PortDirection.INPUT,
            description: 'Trigger signal',
        },
        {
            id: 'input',
            displayName: 'IN',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            description: 'Signal to sample',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            cppMethod: 'Process',
            description: 'Held output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.UTILITY,
    icon: 'Minimize2', // Represents capture/hold

    // Documentation
    description: 'Dual mode Sample & Hold / Track & Hold module.',
    documentation: `
Capture a signal value on a trigger.

Modes:
- **Sample & Hold (0)**: Samples the input when Trigger goes high, holds it until next trigger.
- **Track & Hold (1)**: Follows (tracks) the input while Trigger is high, holds the last value when Trigger goes low.
  `.trim(),
};
