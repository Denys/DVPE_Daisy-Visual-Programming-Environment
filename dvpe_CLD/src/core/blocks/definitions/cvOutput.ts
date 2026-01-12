/**
 * CVOutput Block Definition
 * Hardware CV output jack (DAC)
 */

import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    ParameterType,
    SignalType,
    PortDirection,
} from '@/types';

export const CVOutputBlock: BlockDefinition = {
    // Identity
    id: 'cv_output',
    className: 'inline::CVOutput',
    displayName: 'CV OUT',
    category: BlockCategory.USER_IO,

    // C++ Code Generation - uses DAC output
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
            displayName: 'DAC Channel',
            type: ParameterType.INT,
            cppSetter: '',
            defaultValue: 0,
            range: {
                min: 0,
                max: 1,
                step: 1,
            },
            group: 'Main',
            description: 'DAC output channel (0-1)',
        },
    ],

    // Ports
    ports: [
        {
            id: 'in',
            displayName: 'IN',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'CV input (0-1)',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.USER,
    icon: 'ArrowUpFromLine',

    // Documentation
    description: 'Hardware CV output via DAC',
    documentation: `
Outputs control voltage to hardware jack via DAC.
Input 0-1 maps to 0-3.3V output.
Useful for sending CV to external gear.
    `.trim(),
};
