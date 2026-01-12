/**
 * Balance Block Definition
 * Stereo balance control - inline implementation
 */

import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    ParameterType,
    ParameterCurve,
    SignalType,
    PortDirection,
} from '@/types';

export const BalanceBlock: BlockDefinition = {
    // Identity
    id: 'balance',
    className: 'inline::Balance',
    displayName: 'BALANCE',
    category: BlockCategory.UTILITY,

    // C++ Code Generation - inline
    headerFile: 'daisysp.h',
    namespace: 'daisysp',
    initMethod: '',
    initParams: [],
    processMethod: '',
    processReturnType: 'void',

    // Parameters
    parameters: [
        {
            id: 'balance',
            displayName: 'Balance',
            type: ParameterType.FLOAT,
            cppSetter: '',
            defaultValue: 0.5,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Stereo balance (0=left, 1=right)',
        },
    ],

    // Ports
    ports: [
        {
            id: 'left_in',
            displayName: 'L IN',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            description: 'Left input',
        },
        {
            id: 'right_in',
            displayName: 'R IN',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            description: 'Right input',
        },
        {
            id: 'balance_cv',
            displayName: 'BAL CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Balance modulation',
        },
        {
            id: 'left_out',
            displayName: 'L OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            description: 'Left output',
        },
        {
            id: 'right_out',
            displayName: 'R OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            description: 'Right output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.UTILITY,
    icon: 'Scale',

    // Documentation
    description: 'Stereo balance control',
    documentation: `
Adjusts the balance between left and right channels.
Position 0 = only left, 0.5 = equal, 1 = only right.
Maintains total energy as balance shifts.
    `.trim(),
};
