/**
 * Gate/Trigger Input Block Definition
 * Hardware gate and trigger input access
 */

import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    ParameterType,
    SignalType,
    PortDirection,
} from '@/types';

export const GateTriggerInBlock: BlockDefinition = {
    // Identity
    id: 'gate_trigger_in',
    className: 'GateIn',
    displayName: 'GATE/TRIG IN',
    category: BlockCategory.USER_IO,

    // C++ Code Generation
    headerFile: 'daisy_field.h',
    namespace: 'daisy',
    initMethod: 'Init',
    initParams: [],
    processMethod: 'Trig',
    processReturnType: 'bool',

    // Parameters
    parameters: [
        {
            id: 'channel',
            displayName: 'Channel',
            type: ParameterType.ENUM,
            cppSetter: 'SetChannel',
            defaultValue: '0',
            enumValues: [
                { label: 'Gate 1', value: '0', cppValue: '0' },
                { label: 'Gate 2', value: '1', cppValue: '1' },
            ],
            group: 'Config',
            description: 'Hardware gate input channel',
        },
    ],

    // Ports
    ports: [
        {
            id: 'gate',
            displayName: 'GATE',
            signalType: SignalType.TRIGGER,
            direction: PortDirection.OUTPUT,
            description: 'Gate output (high while input held)',
        },
        {
            id: 'trig',
            displayName: 'TRIG',
            signalType: SignalType.TRIGGER,
            direction: PortDirection.OUTPUT,
            description: 'Trigger output (pulse on rising edge)',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.USER,
    icon: 'Zap',

    // Documentation
    description: 'Gate and trigger input from hardware',
    documentation: `
Reads gate and trigger signals from hardware inputs (e.g., Eurorack gate jacks).

Gate output stays high while the input is held.
Trig output generates a single-sample pulse on rising edge.

Use Gate for sustaining envelopes (ADSR).
Use Trig for percussive/one-shot envelopes (AD).

Commonly used with:
- ADSR/AD envelopes
- Sequencer sync
- External modular gear
  `.trim(),
};
