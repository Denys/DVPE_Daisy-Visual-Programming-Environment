/**
 * LEDOutput Block Definition
 * LED control output (GPIO or PWM)
 */

import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    ParameterType,
    SignalType,
    PortDirection,
} from '@/types';

export const LEDOutputBlock: BlockDefinition = {
    // Identity
    id: 'led_output',
    className: 'inline::LEDOutput',
    displayName: 'LED',
    category: BlockCategory.USER_IO,

    // C++ Code Generation - uses GPIO/PWM output
    headerFile: 'daisy_seed.h',
    namespace: 'daisy',
    initMethod: '',
    initParams: [],
    processMethod: '',
    processReturnType: 'void',

    // Parameters
    parameters: [
        {
            id: 'pin',
            displayName: 'Pin',
            type: ParameterType.INT,
            cppSetter: '',
            defaultValue: 0,
            range: {
                min: 0,
                max: 31,
                step: 1,
            },
            group: 'Main',
            description: 'GPIO pin number',
        },
        {
            id: 'pwm',
            displayName: 'PWM Mode',
            type: ParameterType.BOOL,
            cppSetter: '',
            defaultValue: false,
            group: 'Main',
            description: 'Enable PWM for brightness control',
        },
    ],

    // Ports
    ports: [
        {
            id: 'brightness',
            displayName: 'BRIGHT',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'LED brightness (0-1)',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.USER,
    icon: 'Lightbulb',

    // Documentation
    description: 'LED control output',
    documentation: `
Controls an LED connected to a GPIO pin.
In PWM mode, brightness 0-1 controls LED intensity.
Otherwise, brightness > 0.5 turns LED on.
    `.trim(),
};
