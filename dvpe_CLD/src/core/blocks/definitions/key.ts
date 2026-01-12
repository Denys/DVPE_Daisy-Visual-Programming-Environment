/**
 * Key Block Definition
 * Keyboard/MIDI note input (MVP: static values)
 */

import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    ParameterType,
    ParameterCurve,
    SignalType,
    PortDirection,
} from '@/types';

export const KeyBlock: BlockDefinition = {
    // Identity
    id: 'key',
    className: 'Key',
    displayName: 'KEY',
    category: BlockCategory.USER_IO,

    // C++ Code Generation (MVP: static values, MIDI in future)
    headerFile: '',
    namespace: '',
    initMethod: '',
    initParams: [],
    processMethod: '',
    processReturnType: 'void',

    // Parameters
    parameters: [
        {
            id: 'note',
            displayName: 'Note',
            type: ParameterType.INT,
            cppSetter: '',
            defaultValue: 60, // Middle C
            range: {
                min: 0,
                max: 127,
            },
            unit: 'MIDI',
            group: 'Main',
            description: 'MIDI note number (0-127)',
        },
        {
            id: 'velocity',
            displayName: 'Velocity',
            type: ParameterType.FLOAT,
            cppSetter: '',
            defaultValue: 0.8,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: false,
            group: 'Main',
            description: 'Note velocity (0-1)',
        },
        {
            id: 'gate',
            displayName: 'Gate',
            type: ParameterType.BOOL,
            cppSetter: '',
            defaultValue: false,
            group: 'Main',
            description: 'Gate on/off state',
        },
    ],

    // Ports
    ports: [
        {
            id: 'gate_out',
            displayName: 'GATE',
            signalType: SignalType.TRIGGER,
            direction: PortDirection.OUTPUT,
            description: 'Gate output (high when note is held)',
        },
        {
            id: 'cv_out',
            displayName: 'CV',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT,
            description: 'Pitch CV output (1V/octave)',
        },
        {
            id: 'vel_out',
            displayName: 'VEL',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT,
            description: 'Velocity CV output (0-1)',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.USER,
    icon: 'Piano',

    // Documentation
    description: 'Keyboard/MIDI note input',
    documentation: `
MVP: Provides static note and gate values for testing.

CV output is calculated as: 440 * 2^((note - 69) / 12) Hz
This follows the MIDI standard where note 69 = A4 = 440 Hz.

Gate output follows the gate parameter (on/off).
Velocity output provides the velocity value (0-1).

Future versions will support:
- MIDI input from USB/DIN
- Daisy Field capacitive keys
- Polyphonic voice allocation
  `.trim(),
};
