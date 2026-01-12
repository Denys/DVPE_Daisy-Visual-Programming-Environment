/**
 * LinearVCA Block Definition
 * daisysp-style linear VCA
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

export const LinearVcaBlock: BlockDefinition = {
    // Identity
    id: 'linearvca',
    className: 'LinearVCA',
    displayName: 'LINEAR VCA',
    category: BlockCategory.DYNAMICS,

    // C++ Code Generation (inline operation)
    headerFile: '',
    namespace: '',
    initMethod: '',
    initParams: [],
    processMethod: '',
    processReturnType: 'float',

    // Parameters
    parameters: [
        {
            id: 'level',
            displayName: 'Level',
            type: ParameterType.FLOAT,
            cppSetter: '',
            defaultValue: 1.0,
            range: {
                min: 0.0,
                max: 1.0,
                step: 0.01,
                curve: ParameterCurve.LINEAR,
            },
            cvModulatable: true,
            group: 'Main',
            description: 'Base amplitude level',
        },
    ],

    // Ports
    ports: [
        {
            id: 'in',
            displayName: 'IN',
            signalType: SignalType.AUDIO,
            direction: PortDirection.INPUT,
            description: 'Audio input',
        },
        {
            id: 'level_cv',
            displayName: 'CV',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Control voltage for level',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.AUDIO,
            direction: PortDirection.OUTPUT,
            description: 'Amplitude-controlled output',
        },
    ],

    // Visual
    colorScheme: BlockColorScheme.LOGIC,
    icon: 'Sliders',

    // Documentation
    description: 'Linear voltage-controlled amplifier',
    documentation: `
Linear VCA with CV control over amplitude.

out = in * (level * cv)

Where cv is typically from an envelope or LFO.

Linear response means:
- CV 0.0 → silence
- CV 0.5 → half amplitude
- CV 1.0 → full amplitude

Use VCA block for exponential/musical response,
this block for precise linear amplitude control.
  `.trim(),
};
