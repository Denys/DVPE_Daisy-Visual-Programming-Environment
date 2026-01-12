/**
 * Slew Block Definition
 * Slew rate limiter - inline implementation
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

export const SlewBlock: BlockDefinition = {
    // Identity
    id: 'slew',
    className: 'inline::Slew',
    displayName: 'SLEW',
    category: BlockCategory.UTILITY,

    // C++ Code Generation - inline
    headerFile: 'daisysp.h',
    namespace: 'daisysp',
    initMethod: '',
    initParams: [],
    processMethod: '',
    processReturnType: 'float',

    // Parameters
    parameters: [
        {
            id: 'rise',
            displayName: 'Rise',
            type: ParameterType.FLOAT,
            cppSetter: '',
            defaultValue: 0.01,
            range: {
                min: 0.001,
                max: 1.0,
                step: 0.001,
                curve: ParameterCurve.LOGARITHMIC,
            },
            unit: 's',
            cvModulatable: true,
            group: 'Main',
            description: 'Rise time (attack)',
        },
        {
            id: 'fall',
            displayName: 'Fall',
            type: ParameterType.FLOAT,
            cppSetter: '',
            defaultValue: 0.01,
            range: {
                min: 0.001,
                max: 1.0,
                step: 0.001,
                curve: ParameterCurve.LOGARITHMIC,
            },
            unit: 's',
            cvModulatable: true,
            group: 'Main',
            description: 'Fall time (decay)',
        },
    ],

    // Ports
    ports: [
        {
            id: 'in',
            displayName: 'IN',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'CV input',
        },
        {
            id: 'rise_cv',
            displayName: 'RISE CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Rise time modulation',
        },
        {
            id: 'fall_cv',
            displayName: 'FALL CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Fall time modulation',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT,
            description: 'Slew-limited output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.CONTROL,
    icon: 'TrendingDown',

    // Documentation
    description: 'Slew rate limiter with separate rise/fall times',
    documentation: `
Limits how fast a signal can change (portamento/glide).
Rise controls positive-going transitions.
Fall controls negative-going transitions.
    `.trim(),
};
