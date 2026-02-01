import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
} from '@/types';

export const Atan2Block: BlockDefinition = {
    id: 'atan2',
    className: 'DVPE_Atan2',
    displayName: 'ATAN2',
    category: BlockCategory.MATH,

    cppInlineProcess: 'atan2f({{y}}, {{x}})',

    parameters: [],

    ports: [
        {
            id: 'y',
            displayName: 'Y',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'Y Coordinate',
        },
        {
            id: 'x',
            displayName: 'X',
            signalType: SignalType.CV,
            direction: PortDirection.INPUT,
            description: 'X Coordinate',
        },
        {
            id: 'out',
            displayName: 'OUT',
            signalType: SignalType.CV,
            direction: PortDirection.OUTPUT,
            description: 'Angle Output (Radians)',
        },
    ],

    colorScheme: BlockColorScheme.LOGIC,
    icon: 'Compass',

    description: 'Arctangent 2 function',
    documentation: 'Calculates the angle (in radians) from the X axis to a point (y, x).',
};
