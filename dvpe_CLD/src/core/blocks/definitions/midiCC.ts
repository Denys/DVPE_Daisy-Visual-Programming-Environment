/**
 * MidiCC Block Definition
 * MIDI Control Change input
 */

import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    ParameterType,
    SignalType,
    PortDirection,
} from '@/types';

export const MidiCCBlock: BlockDefinition = {
    // Identity
    id: 'midi_cc',
    className: 'inline::MidiCC',
    displayName: 'MIDI CC',
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
        {
            id: 'cc_number',
            displayName: 'CC#',
            type: ParameterType.INT,
            cppSetter: '',
            defaultValue: 1,
            range: {
                min: 0,
                max: 127,
                step: 1,
            },
            group: 'Main',
            description: 'CC number (0-127)',
        },
    ],

    // Ports
    ports: [
        {
            id: 'value',
            displayName: 'VALUE',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT,
            description: 'CC value (0-127 scaled to 0-1)',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.USER,
    icon: 'Sliders',

    // Documentation
    description: 'MIDI Control Change input',
    documentation: `
Receives MIDI CC messages on specified channel.
Output is 0-1 scaled from CC value (0-127).
Common CCs: 1=Mod Wheel, 7=Volume, 74=Cutoff.
    `.trim(),
};
