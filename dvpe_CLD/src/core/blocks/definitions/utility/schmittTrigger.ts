import {
    BlockDefinition,
    BlockCategory,
    BlockColorScheme,
    SignalType,
    PortDirection,
    ParameterType,
} from '@/types';

export const SchmittTriggerBlock: BlockDefinition = {
    id: 'schmitt_trigger',
    className: 'DVPE_Schmitt',
    displayName: 'SCHMITT',
    category: BlockCategory.UTILITY,

    cppStateVars: [
        { type: 'bool', name: 'state', init: 'false' }
    ],

    cppProcessTemplate: `
    if (!{{state}} && {{in}} > {{thresh_high}}) {{state}} = true;
    else if ({{state}} && {{in}} < {{thresh_low}}) {{state}} = false;
    {{out}} = {{state}} ? 1.0f : 0.0f;
  `,

    parameters: [
        {
            id: 'thresh_high',
            displayName: 'High',
            type: ParameterType.FLOAT,
            defaultValue: 0.8,
            range: { min: 0, max: 1 },
            cppSetter: ''
        },
        {
            id: 'thresh_low',
            displayName: 'Low',
            type: ParameterType.FLOAT,
            defaultValue: 0.2,
            range: { min: 0, max: 1 },
            cppSetter: ''
        },
    ],

    ports: [
        { id: 'in', displayName: 'IN', signalType: SignalType.CV, direction: PortDirection.INPUT },
        { id: 'out', displayName: 'OUT', signalType: SignalType.TRIGGER, direction: PortDirection.OUTPUT },
    ],

    colorScheme: BlockColorScheme.LOGIC,
    icon: 'Activity',

    description: 'Schmitt Trigger',
    documentation: 'Comparator with hysteresis. Goes high when Input > High, goes low when Input < Low.',
};
