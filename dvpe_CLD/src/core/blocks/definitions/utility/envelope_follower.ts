import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
    ParameterType,
} from '@/types';

export const EnvelopeFollowerBlock: BlockDefinition = {
    id: 'envelope_follower',
    className: 'DVPE_EnvelopeFollower',
    displayName: 'ENV FOL',
    category: BlockCategory.DYNAMICS,

    cppStateVars: [
        { type: 'float', name: 'current_level', init: '0.0f' },
    ],

    // Simple rectify + one-pole lowpass
    cppProcessTemplate: `
    float input = fabsf({{in}});
    float attack_coeff = {{attack}};
    float release_coeff = {{release}};
    
    // Choose coefficient based on rising/falling
    float coeff = (input > current_level) ? attack_coeff : release_coeff;
    
    // One-pole LPF
    current_level += coeff * (input - current_level);
    
    {{out}} = current_level;
  `,

    parameters: [
        {
            id: 'attack',
            displayName: 'Attack',
            type: ParameterType.FLOAT,
            defaultValue: 0.1, // Coefficient, not time (simplified for inline)
            description: 'Attack Coefficient (0-1)',
            cppSetter: '',
        },
        {
            id: 'release',
            displayName: 'Release',
            type: ParameterType.FLOAT,
            defaultValue: 0.01, // Coefficient
            description: 'Release Coefficient (0-1)',
            cppSetter: '',
        },
    ],

    ports: [
        {
            id: 'in',
            displayName: 'IN',
            signalType: SignalType.AUDIO, // Usually audio rate
            direction: PortDirection.INPUT,
            description: 'Input Signal',
        },
        {
            id: 'out',
            displayName: 'ENV',
            signalType: SignalType.CV, // Output is control signal
            direction: PortDirection.OUTPUT,
            description: 'Envelope Output',
        },
    ],

    colorScheme: BlockColorScheme.DYNAMICS,
    icon: 'Activity',

    description: 'Envelope Follower',
    documentation: 'Tracks the amplitude envelope of the input signal. Attack and Release set the tracking speed.',
};
