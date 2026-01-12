/**
 * CVInput Block Definition
 * Hardware CV input jack (ADC)
 */

import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    ParameterType,
    SignalType,
    PortDirection,
} from '@/types';

export const CVInputBlock: BlockDefinition = {
    // Identity
    id: 'cv_input',
    className: 'inline::CVInput',
    displayName: 'CV IN',
    category: BlockCategory.USER_IO,

    // C++ Code Generation - uses hw.adc.GetFloat()
    headerFile: 'daisy_seed.h',
    namespace: 'daisy',
    initMethod: '',
    initParams: [],
    processMethod: '',
    processReturnType: 'float',

    // Parameters
    parameters: [
        {
            id: 'channel',
            displayName: 'ADC Channel',
            type: ParameterType.INT,
            cppSetter: '',
            defaultValue: 0,
            range: {
                min: 0,
                max: 11,
                step: 1,
            },
            group: 'Main',
            description: 'ADC input channel (0-11)',
        },
        {
            id: 'bipolar',
            displayName: 'Bipolar',
            type: ParameterType.BOOL,
            cppSetter: '',
            defaultValue: false,
            group: 'Main',
            description: 'Scale to -1 to +1 range',
        },
    ],

    // Ports
    ports: [
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT,
            description: 'CV output (0-1 or -1 to +1)',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.USER,
    icon: 'ArrowDownToLine',

    // Documentation
    description: 'Hardware CV input from ADC',
    documentation: `
Reads control voltage from hardware input jack.
Unipolar: 0-1 range (0-3.3V).
Bipolar: -1 to +1 range (centered at 1.65V).
    `.trim(),
};
