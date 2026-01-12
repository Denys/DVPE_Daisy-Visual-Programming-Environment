/**
 * Audio Output Block Definition
 * Hardware audio output (DAC) access
 */

import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const AudioOutputBlock: BlockDefinition = {
    // Identity
    id: 'audio_output',
    className: 'AudioOutput',
    displayName: 'AUDIO OUTPUT',
    category: BlockCategory.USER_IO,

    // C++ Code Generation
    headerFile: 'daisy_field.h',
    namespace: 'daisy',
    initMethod: 'Init',
    initParams: [],
    processMethod: 'Output',
    processReturnType: 'void',

    // Parameters (none for audio output)
    parameters: [],

    // Ports
    ports: [
        {
            id: 'left',
            displayName: 'L',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            cppParam: 'left',
            description: 'Left channel audio output',
        },
        {
            id: 'right',
            displayName: 'R',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            cppParam: 'right',
            description: 'Right channel audio output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.USER,
    icon: 'Volume2',

    // Documentation
    description: 'Stereo audio output to hardware',
    documentation: `
Routes audio signals to the hardware DAC outputs.
Supports stereo output (left and right channels) to the audio codec.

In the generated code, this maps to writing to the AudioCallback output buffer:
- Left channel: out[0][i]
- Right channel: out[1][i]

Every patch needs at least one Audio Output block to produce sound.
Connect your final signal chain to this block's inputs.
  `.trim(),
};
