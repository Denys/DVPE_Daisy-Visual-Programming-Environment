/**
 * MidiNote Block Definition
 * MIDI Note input with pitch and velocity outputs
 */

import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    ParameterType,
    SignalType,
    PortDirection,
} from '@/types';

export const MidiNoteBlock: BlockDefinition = {
    // Identity
    id: 'midi_note',
    className: 'inline::MidiNote',
    displayName: 'MIDI NOTE',
    category: BlockCategory.USER_IO,

    // C++ Code Generation - handled via MIDI event callback
    headerFile: 'daisy_seed.h',
    namespace: 'daisy',
    initMethod: '',
    initParams: [],
    processMethod: '',
    processReturnType: 'void',

    // Parameters
    parameters: [
        {
            id: 'channel',
            displayName: 'Channel',
            type: ParameterType.INT,
            cppSetter: '',
            defaultValue: 1,
            range: {
                min: 1,
                max: 16,
                step: 1,
            },
            group: 'Main',
            description: 'MIDI channel (1-16)',
        },
    ],

    // Ports
    ports: [
        {
            id: 'pitch',
            displayName: 'PITCH',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT,
            description: 'Note pitch (0-127 scaled to 0-1)',
        },
        {
            id: 'velocity',
            displayName: 'VEL',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT,
            description: 'Note velocity (0-127 scaled to 0-1)',
        },
        {
            id: 'gate',
            displayName: 'GATE',
            signalType: SignalType.TRIGGER,
            direction: PortDirection.OUTPUT,
            description: 'Note gate (high when held)',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.USER,
    icon: 'Piano',

    // Documentation
    description: 'MIDI note input with pitch, velocity, and gate',
    documentation: `
Receives MIDI notes on specified channel.
Pitch outputs scaled 0-1 (C-1 to G9).
Gate is high while note is held.
    `.trim(),
};
