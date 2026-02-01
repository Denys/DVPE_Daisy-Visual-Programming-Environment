import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const MidiToFreqBlock: BlockDefinition = {
    id: 'midi_to_freq',
    className: 'DVPE_MidiToFreq',
    displayName: 'MIDI -> Hz',
    category: BlockCategory.MATH,

    cppInlineProcess: '440.0f * powf(2.0f, ({{note}} - 69.0f) * 0.08333333f)',

    parameters: [],

    ports: [
        {
            id: 'note',
            displayName: 'NOTE',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'MIDI Note Number',
        },
        {
            id: 'out',
            displayName: 'Hz',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT,
            description: 'Frequency (Hz)',
        },
    ],

    colorScheme: BlockColorScheme.UTILITY,
    icon: 'Music',

    description: 'MIDI Note to Frequency',
    documentation: 'Converts MIDI note number to frequency in Hz (Note 69 = 440Hz).',
};
