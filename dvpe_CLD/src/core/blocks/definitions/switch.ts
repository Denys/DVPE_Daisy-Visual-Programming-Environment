/**
 * Switch Block Definition
 * Hardware switch input access
 */

import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    ParameterType,
    SignalType,
    PortDirection,
} from '@/types';

export const SwitchBlock: BlockDefinition = {
    // Identity
    id: 'switch',
    className: 'Switch',
    displayName: 'SWITCH',
    category: BlockCategory.USER_IO,

    // C++ Code Generation
    headerFile: '',
    namespace: '',
    initMethod: '',
    initParams: [],
    processMethod: '',
    processReturnType: 'float',

    // Parameters
    parameters: [
        {
            id: 'channel',
            displayName: 'Channel',
            type: ParameterType.ENUM,
            cppSetter: '',
            defaultValue: '0',
            enumValues: [
                { label: 'Switch 1', value: '0', cppValue: '0' },
                { label: 'Switch 2', value: '1', cppValue: '1' },
                { label: 'Switch 3', value: '2', cppValue: '2' },
                { label: 'Switch 4', value: '3', cppValue: '3' },
            ],
            group: 'Hardware',
            description: 'Hardware switch channel',
        },
    ],

    // Ports
    ports: [
        {
            id: 'gate',
            displayName: 'GATE',
            signalType: SignalType.TRIGGER,
            direction: PortDirection.OUTPUT,
            description: 'High while switch is engaged',
        },
        {
            id: 'trig',
            displayName: 'TRIG',
            signalType: SignalType.TRIGGER,
            direction: PortDirection.OUTPUT,
            description: 'Pulse on switch engagement',
        },
        {
            id: 'latch',
            displayName: 'LATCH',
            signalType: SignalType.TRIGGER, // Represented as 0/1 CV/Trigger
            direction: PortDirection.OUTPUT,
            description: 'Toggles state on each press (Software Latch)',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.USER,
    icon: 'ToggleLeft',

    // Documentation
    description: 'Hardware switch input',
    documentation: `
Reads binary input from a hardware switch or button.

Outputs:
- **GATE**: High (1.0) while the switch/button is held/on.
- **TRIG**: A single pulse when the switch is pressed/turned on.
- **LATCH**: Toggles between 0.0 and 1.0 each time the switch is pressed (Software Toggling).
  `.trim(),
};
