/**
 * Audio Input Block Definition
 * Hardware audio input (ADC) access
 */

import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const AudioInputBlock: BlockDefinition = {
    // Identity
    id: 'audio_input',
    className: 'AudioInput',
    displayName: 'AUDIO INPUT',
    category: BlockCategory.USER_IO,

    // C++ Code Generation
    headerFile: 'daisy_field.h',
    namespace: 'daisy',
    initMethod: 'Init',
    initParams: [],
    processMethod: 'Input',
    processReturnType: 'void',

    // Parameters (none for audio input)
    parameters: [],

    // Ports
    ports: [
        {
            id: 'left',
            displayName: 'L',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            description: 'Left channel audio input',
        },
        {
            id: 'right',
            displayName: 'R',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            description: 'Right channel audio input',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.USER,
    icon: 'Mic',

    // Documentation
    description: 'Stereo audio input from hardware',
    documentation: `
Routes audio from the hardware ADC inputs to your patch.
Provides stereo input (left and right channels) from the audio codec.

In the generated code, this maps to reading from the AudioCallback input buffer:
- Left channel: in[0][i]
- Right channel: in[1][i]

Use this block to process external audio sources or create effects.
  `.trim(),
};
