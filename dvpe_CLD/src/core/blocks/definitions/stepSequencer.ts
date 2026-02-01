/**
 * StepSequencer Block Definition
 * A multi-track 16-step sequencer for drum patterns
 */

import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    ParameterType,
    SignalType,
    PortDirection,
} from '@/types';

export const StepSequencerBlock: BlockDefinition = {
    // Identity
    id: 'step_sequencer',
    className: 'StepSequencer',
    displayName: 'STEP SEQ',
    category: BlockCategory.UTILITY,

    // C++ Code Generation (Custom implementation required in backend)
    headerFile: '',
    namespace: '',
    initMethod: 'Init',
    initParams: ['sample_rate'],
    processMethod: 'Process',
    processReturnType: 'void',

    // Parameters
    parameters: [
        {
            id: 'trackSelect',
            displayName: 'Track',
            type: ParameterType.INT,
            cppSetter: 'SetTrackSelect',
            defaultValue: 0,
            range: {
                min: 0,
                max: 3,
                step: 1,
            },
            group: 'Main',
            description: 'Select track to edit (0-3)',
        },
        {
            id: 'tempo',
            displayName: 'Tempo',
            type: ParameterType.FLOAT,
            cppSetter: 'SetTempo',
            defaultValue: 120.0,
            range: {
                min: 40.0,
                max: 240.0,
                step: 0.1,
            },
            unit: 'BPM',
            group: 'Main',
            description: 'Internal tempo (if no clock connected)',
        },
        {
            id: 'swing',
            displayName: 'Swing',
            type: ParameterType.FLOAT,
            cppSetter: 'SetSwing',
            defaultValue: 0.0,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
            },
            group: 'Main',
            description: 'Swing/shuffle amount',
        },
    ],

    // Ports
    ports: [
        {
            id: 'clk',
            displayName: 'CLK',
            signalType: SignalType.TRIGGER,
            direction: PortDirection.INPUT,
            description: 'Clock trigger input',
        },
        {
            id: 'reset',
            displayName: 'RESET',
            signalType: SignalType.TRIGGER,
            direction: PortDirection.INPUT,
            description: 'Reset to first step',
        },
        {
            id: 'swing_cv',
            displayName: 'SWING CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Swing modulation input',
        },
        // Track Triggers
        {
            id: 'out1',
            displayName: 'KICK',
            signalType: SignalType.TRIGGER,
            direction: PortDirection.OUTPUT,
            description: 'Track 1 trigger output (Kick)',
        },
        {
            id: 'out2',
            displayName: 'SNARE',
            signalType: SignalType.TRIGGER,
            direction: PortDirection.OUTPUT,
            description: 'Track 2 trigger output (Snare)',
        },
        {
            id: 'out3',
            displayName: 'HAT',
            signalType: SignalType.TRIGGER,
            direction: PortDirection.OUTPUT,
            description: 'Track 3 trigger output (Hi-Hat)',
        },
        {
            id: 'out4',
            displayName: 'PERC',
            signalType: SignalType.TRIGGER,
            direction: PortDirection.OUTPUT,
            description: 'Track 4 trigger output (Perc)',
        },
        // Hardware Key Inputs (Simulated as trigger ports for the diagram)
        ...Array.from({ length: 8 }, (_, i) => ({
            id: `key_a${i + 1}`,
            displayName: `A${i + 1}`,
            signalType: SignalType.TRIGGER,
            direction: PortDirection.INPUT,
            group: 'Keys',
            description: `Pattern step ${i + 1} toggle`,
        })),
        ...Array.from({ length: 8 }, (_, i) => ({
            id: `key_b${i + 1}`,
            displayName: `B${i + 1}`,
            signalType: SignalType.TRIGGER,
            direction: PortDirection.INPUT,
            group: 'Keys',
            description: `Pattern step ${i + 9} toggle`,
        })),
    ],

    // Visual
    colorScheme: BlockColorScheme.LOGIC,
    icon: 'Grid',

    // Documentation
    description: '16-step 4-track pattern sequencer',
    documentation: `
A multi-track sequencer designed for drum machines.
Features 16 steps across 4 independent tracks.

Connect Metro to CLK to drive the sequence.
Connect hardware Keys to A1-B8 ports to toggle pattern steps for the selected track.
  `.trim(),
};
