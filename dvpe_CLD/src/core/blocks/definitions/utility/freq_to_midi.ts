import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const FreqToMidiBlock: BlockDefinition = {
    id: 'freq_to_midi',
    className: 'DVPE_FreqToMidi',
    displayName: 'Hz -> MIDI',
    category: BlockCategory.MATH,

    cppInlineProcess: '12.0f * log2f(fmaxf({{freq}}, 0.00001f) / 440.0f) + 69.0f',

    parameters: [],

    ports: [
        {
            id: 'freq',
            displayName: 'Hz',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Frequency (Hz)',
        },
        {
            id: 'out',
            displayName: 'NOTE',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT,
            description: 'MIDI Note Number',
        },
    ],

    colorScheme: BlockColorScheme.UTILITY,
    icon: 'Music',

    description: 'Frequency to MIDI Note',
    documentation: 'Converts frequency in Hz to MIDI note number (A4 = 440Hz = Note 69).',
};
