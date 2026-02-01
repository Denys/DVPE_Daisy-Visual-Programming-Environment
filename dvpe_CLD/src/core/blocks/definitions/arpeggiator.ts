/**
 * Arpeggiator Block Definition
 * Transforms held MIDI notes into rhythmic patterns driven by a clock.
 */

import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    ParameterType,
    SignalType,
    PortDirection,
} from '@/types';

export const ArpeggiatorBlock: BlockDefinition = {
    // Identity
    id: 'arpeggiator',
    className: 'SimpleArpeggiator',
    displayName: 'ARPEGGIATOR',
    category: BlockCategory.UTILITY,
    // Actually BlockCategory usually has UTILITY. I will check imports in a second, usually safe to use what's there.
    // Let's use UTILITY if MIDI isn't standard, or check standard categories.
    // Based on previous file views, USER_IO exists. Let's stick to UTILITY or USER_IO.
    // 'category: BlockCategory.USER_IO' matches MidiNote.

    // C++ Code Generation
    headerFile: '', // Injected globally
    namespace: '',
    initMethod: 'Init',
    initParams: ['SAMPLE_RATE'],
    processMethod: 'Process',
    processReturnType: 'void',

    // Parameters
    parameters: [
        {
            id: 'mode',
            displayName: 'Mode',
            type: ParameterType.ENUM,
            defaultValue: 0,
            enumValues: [
                { value: 0, label: 'Up', cppValue: 'SimpleArpeggiator::Mode::UP' },
                { value: 1, label: 'Down', cppValue: 'SimpleArpeggiator::Mode::DOWN' },
                { value: 2, label: 'Up/Down', cppValue: 'SimpleArpeggiator::Mode::UP_DOWN' },
                { value: 3, label: 'Random', cppValue: 'SimpleArpeggiator::Mode::RANDOM' },
                { value: 4, label: 'As Played', cppValue: 'SimpleArpeggiator::Mode::AS_PLAYED' },
            ],
            cppSetter: 'SetMode',
            description: 'Note sequence pattern',
        },
        {
            id: 'octave_range',
            displayName: 'Octaves',
            type: ParameterType.INT,
            defaultValue: 1,
            range: { min: 1, max: 4, step: 1 },
            cppSetter: 'SetOctaveRange',
            description: 'Number of octaves to span',
        },
        {
            id: 'gate_length',
            displayName: 'Gate Len',
            type: ParameterType.FLOAT,
            defaultValue: 0.5,
            range: { min: 0.1, max: 1.0 },
            cppSetter: 'SetGateLength',
            description: 'Gate duration relative to clock step (0.1=Staccato, 1.0=Legato)',
        },
    ],

    // Ports
    ports: [
        {
            id: 'clock',
            displayName: 'CLOCK',
            signalType: SignalType.TRIGGER,
            direction: PortDirection.INPUT,
            description: 'Step clock input',
        },
        {
            id: 'reset',
            displayName: 'RESET',
            signalType: SignalType.TRIGGER,
            direction: PortDirection.INPUT,
            description: 'Reset sequence to start',
        },
        {
            id: 'pitch',
            displayName: 'PITCH',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT,
            description: 'Arpeggiated Pitch (V/Oct)',
        },
        {
            id: 'gate',
            displayName: 'GATE',
            signalType: SignalType.TRIGGER,
            direction: PortDirection.OUTPUT,
            description: 'Note Gate',
        },
        {
            id: 'velocity',
            displayName: 'VEL',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT,
            description: 'Note Velocity',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.USER, // Matches MidiNote
    icon: 'MusicNote', // Generic icon placeholder

    // Documentation
    description: 'MIDI Arpeggiator that sequences held notes.',
    documentation: `
Transforms held MIDI notes into melodic patterns.
Requires a Clock signal to advance.
Modes: Up, Down, Up/Down, Random, As Played.
    `.trim(),
};
