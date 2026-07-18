import {
    BlockDefinition,
    BlockInstance,
    Connection,
    FieldControlMapping,
    FieldMappingLayer,
    FieldToggleState,
    ParameterType,
    PortDirection,
    SignalType,
} from '@/types';

export const FIELD_MAPPING_LAYERS: FieldMappingLayer[] = ['normal', 'sw1', 'sw2', 'sw1_sw2'];
export const FIELD_KNOB_IDS = ['K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7', 'K8'];
export const FIELD_SWITCH_IDS = ['SW1', 'SW2'];
export const FIELD_KEY_IDS = [
    'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8',
    'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8',
];

export const FIELD_HARDWARE_LIMITS = {
    knobs: 8,
    switches: 2,
    keys: 16,
    cvInputs: 4,
    cvOutputs: 2,
    gateInputs: 1,
    gateOutputs: 1,
    audioInputs: 2,
    audioOutputs: 2,
};

export interface FieldKnobTarget {
    blockId: string;
    parameterId: string;
    label: string;
    defaultRange: [number, number];
}

export interface FieldKeyTarget {
    blockId: string;
    portId: string;
    label: string;
}

export interface FieldKeyToggleTarget {
    blockId: string;
    parameterId: string;
    label: string;
    states: [FieldToggleState, FieldToggleState, FieldToggleState];
}

export function getActiveFieldMappingLayer(sw1Held: boolean, sw2Held: boolean): FieldMappingLayer {
    if (sw1Held && sw2Held) return 'sw1_sw2';
    if (sw2Held) return 'sw2';
    if (sw1Held) return 'sw1';
    return 'normal';
}

export function getFieldControlMappingForLayer(
    mappings: FieldControlMapping[] | undefined,
    controlId: string,
    layer: FieldMappingLayer
): FieldControlMapping | undefined {
    const allMappings = mappings ?? [];
    const layerPriority: Record<FieldMappingLayer, FieldMappingLayer[]> = {
        normal: ['normal'],
        sw1: ['sw1', 'normal'],
        sw2: ['sw2', 'normal'],
        sw1_sw2: ['sw1_sw2', 'sw2', 'sw1', 'normal'],
    };

    for (const candidateLayer of layerPriority[layer]) {
        const candidate = allMappings.find((mapping) =>
            mapping.controlId === controlId && mapping.layer === candidateLayer
        );
        if (candidate) return candidate;
    }

    return undefined;
}

export function getFieldKeyIndex(controlId: string): number {
    const index = FIELD_KEY_IDS.indexOf(controlId);
    return index >= 0 ? index : 0;
}

export function getFieldKnobIndex(controlId: string): number {
    const index = FIELD_KNOB_IDS.indexOf(controlId);
    return index >= 0 ? index : 0;
}

export function getFieldSwitchIndex(controlId: string): number {
    const index = FIELD_SWITCH_IDS.indexOf(controlId);
    return index >= 0 ? index : 0;
}

export function listFieldKnobTargets(
    blocks: BlockInstance[],
    blockDefs: Map<string, BlockDefinition>
): FieldKnobTarget[] {
    return blocks.flatMap((block) => {
        const def = blockDefs.get(block.definitionId);
        if (!def) return [];

        return def.parameters
            .filter((parameter) =>
                parameter.cvModulatable === true &&
                (parameter.type === ParameterType.FLOAT || parameter.type === ParameterType.INT) &&
                Boolean(parameter.cppSetter)
            )
            .map((parameter) => ({
                blockId: block.id,
                parameterId: parameter.id,
                label: `${block.label || def.displayName} - ${parameter.displayName}`,
                defaultRange: [
                    parameter.range?.min ?? 0,
                    parameter.range?.max ?? 1,
                ] as [number, number],
            }));
    });
}

export function listFieldKeyTargets(
    blocks: BlockInstance[],
    blockDefs: Map<string, BlockDefinition>
): FieldKeyTarget[] {
    return blocks.flatMap((block) => {
        const def = blockDefs.get(block.definitionId);
        if (!def) return [];

        return def.ports
            .filter((port) => port.direction === PortDirection.INPUT && port.signalType === SignalType.TRIGGER)
            .map((port) => ({
                blockId: block.id,
                portId: port.id,
                label: `${block.label || def.displayName} - ${port.displayName}`,
            }));
    });
}

export function listFieldKeyToggleTargets(
    blocks: BlockInstance[],
    blockDefs: Map<string, BlockDefinition>
): FieldKeyToggleTarget[] {
    return blocks.flatMap((block) => {
        const def = blockDefs.get(block.definitionId);
        if (!def) return [];

        return def.parameters.flatMap((parameter) => {
            if (!parameter.cppSetter) return [];

            const states = buildDefaultToggleStates(parameter);
            if (!states) return [];

            return [{
                blockId: block.id,
                parameterId: parameter.id,
                label: `${block.label || def.displayName} - ${parameter.displayName}`,
                states,
            }];
        });
    });
}

function buildDefaultToggleStates(parameter: BlockDefinition['parameters'][number]):
    [FieldToggleState, FieldToggleState, FieldToggleState] | null {
    const ledStates: FieldToggleState['led'][] = ['off', 'blink', 'on'];

    if (parameter.type === ParameterType.ENUM && parameter.enumValues && parameter.enumValues.length >= 3) {
        const [first, second, third] = parameter.enumValues;
        return [first, second, third].map((option, index) => ({
            label: option.label,
            value: option.value,
            cppValue: option.cppValue,
            led: ledStates[index],
        })) as [FieldToggleState, FieldToggleState, FieldToggleState];
    }

    if (
        (parameter.type === ParameterType.FLOAT || parameter.type === ParameterType.INT) &&
        parameter.range
    ) {
        const min = parameter.range.min;
        const max = parameter.range.max;
        const mid = min + ((max - min) / 2);
        return [
            { label: 'Low', value: min, led: 'off' },
            { label: 'Mid', value: mid, led: 'blink' },
            { label: 'High', value: max, led: 'on' },
        ];
    }

    return null;
}

export function buildFieldMappingConflictErrors(
    mappings: FieldControlMapping[] | undefined,
    connections: Connection[]
): string[] {
    return (mappings ?? []).flatMap((mapping) => {
        const targetPortId = mapping.targetPortId ?? (
            mapping.targetParameterId ? `${mapping.targetParameterId}_cv` : undefined
        );

        if (!targetPortId) return [];

        const hasGraphConnection = connections.some((connection) =>
            connection.targetBlockId === mapping.targetBlockId &&
            connection.targetPortId === targetPortId
        );

        if (!hasGraphConnection) return [];

        return [
            `Field mapping ${mapping.controlId} ${mapping.layer} targets ${mapping.targetBlockId}.${targetPortId}, but that input already has a graph connection.`,
        ];
    });
}
