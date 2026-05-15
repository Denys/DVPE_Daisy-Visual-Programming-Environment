import { describe, expect, it } from 'vitest';
import {
    FIELD_HARDWARE_LIMITS,
    FIELD_SWITCH_IDS,
    buildFieldMappingConflictErrors,
    getActiveFieldMappingLayer,
    getFieldControlMappingForLayer,
    getFieldSwitchIndex,
    listFieldKeyToggleTargets,
    listFieldKeyTargets,
    listFieldKnobTargets,
} from '../fieldMapping';
import { BlockCategory, BlockColorScheme, ParameterType, SignalType, PortDirection } from '@/types';
import type { BlockDefinition, BlockInstance, Connection, FieldControlMapping } from '@/types';

const filterDef: BlockDefinition = {
    id: 'svf',
    className: 'Svf',
    displayName: 'SVF',
    description: 'State variable filter',
    category: BlockCategory.FILTERS,
    colorScheme: BlockColorScheme.FILTER,
    headerFile: '',
    initMethod: '',
    initParams: [],
    processMethod: '',
    parameters: [
        {
            id: 'freq',
            displayName: 'Cutoff',
            type: ParameterType.FLOAT,
            defaultValue: 1000,
            cppSetter: 'SetFreq',
            cvModulatable: true,
            range: { min: 20, max: 20000 },
        },
        {
            id: 'mode',
            displayName: 'Mode',
            type: ParameterType.ENUM,
            defaultValue: 'low',
            enumValues: [
                { label: 'Low', value: 'low', cppValue: 'Svf::LOW' },
                { label: 'Band', value: 'band', cppValue: 'Svf::BAND' },
                { label: 'High', value: 'high', cppValue: 'Svf::HIGH' },
            ],
            cppSetter: 'SetMode',
            cvModulatable: true,
        },
    ],
    ports: [
        { id: 'in', displayName: 'IN', signalType: SignalType.AUDIO, direction: PortDirection.INPUT },
        { id: 'freq_cv', displayName: 'FREQ CV', signalType: SignalType.CV, direction: PortDirection.INPUT },
    ],
};

const envDef: BlockDefinition = {
    id: 'ad_env',
    className: 'AdEnv',
    displayName: 'AD ENV',
    description: 'Attack decay envelope',
    category: BlockCategory.MODULATORS,
    colorScheme: BlockColorScheme.CONTROL,
    headerFile: '',
    initMethod: '',
    initParams: [],
    processMethod: '',
    parameters: [],
    ports: [
        { id: 'trig', displayName: 'TRIG', signalType: SignalType.TRIGGER, direction: PortDirection.INPUT },
        { id: 'out', displayName: 'OUT', signalType: SignalType.CV, direction: PortDirection.OUTPUT },
    ],
};

const blocks: BlockInstance[] = [
    { id: 'filter1', definitionId: 'svf', position: { x: 0, y: 0 }, parameterValues: {} },
    { id: 'env1', definitionId: 'ad_env', position: { x: 0, y: 0 }, parameterValues: {} },
];

const blockDefs = new Map<string, BlockDefinition>([
    ['svf', filterDef],
    ['ad_env', envDef],
]);

describe('Field mapping helpers', () => {
    it('uses the actual Daisy Field hardware limits', () => {
        expect(FIELD_HARDWARE_LIMITS).toEqual({
            knobs: 8,
            switches: 2,
            keys: 16,
            cvInputs: 4,
            cvOutputs: 2,
            gateInputs: 1,
            gateOutputs: 1,
            audioInputs: 2,
            audioOutputs: 2,
        });
        expect(FIELD_SWITCH_IDS).toEqual(['SW1', 'SW2']);
        expect(getFieldSwitchIndex('SW2')).toBe(1);
    });

    it('resolves held SW layers with SW1+SW2 priority', () => {
        expect(getActiveFieldMappingLayer(false, false)).toBe('normal');
        expect(getActiveFieldMappingLayer(true, false)).toBe('sw1');
        expect(getActiveFieldMappingLayer(false, true)).toBe('sw2');
        expect(getActiveFieldMappingLayer(true, true)).toBe('sw1_sw2');
    });

    it('resolves active-layer mappings with held-switch priority', () => {
        const mappings: FieldControlMapping[] = [
            {
                controlType: 'knob',
                controlId: 'K1',
                layer: 'normal',
                targetBlockId: 'filter1',
                targetParameterId: 'freq',
                mappingType: 'log',
                outputRange: [20, 20000],
            },
            {
                controlType: 'knob',
                controlId: 'K1',
                layer: 'sw1',
                targetBlockId: 'filter1',
                targetParameterId: 'res',
                mappingType: 'direct',
                outputRange: [0, 1],
            },
            {
                controlType: 'knob',
                controlId: 'K1',
                layer: 'sw2',
                targetBlockId: 'filter1',
                targetParameterId: 'drive',
                mappingType: 'direct',
                outputRange: [0, 1],
            },
        ];

        expect(getFieldControlMappingForLayer(mappings, 'K1', 'normal')?.targetParameterId).toBe('freq');
        expect(getFieldControlMappingForLayer(mappings, 'K1', 'sw1')?.layer).toBe('sw1');
        expect(getFieldControlMappingForLayer(mappings, 'K1', 'sw1')?.targetParameterId).toBe('res');
        expect(getFieldControlMappingForLayer(mappings, 'K1', 'sw1_sw2')?.targetParameterId).toBe('drive');
        expect(getFieldControlMappingForLayer(mappings, 'K2', 'sw1')).toBeUndefined();
    });

    it('lists only safe knob and key targets', () => {
        expect(listFieldKnobTargets(blocks, blockDefs)).toEqual([
            {
                blockId: 'filter1',
                parameterId: 'freq',
                label: 'SVF - Cutoff',
                defaultRange: [20, 20000],
            },
        ]);

        expect(listFieldKeyTargets(blocks, blockDefs)).toEqual([
            {
                blockId: 'env1',
                portId: 'trig',
                label: 'AD ENV - TRIG',
            },
        ]);
    });

    it('lists safe three-state key toggle parameter targets', () => {
        expect(listFieldKeyToggleTargets(blocks, blockDefs)).toEqual([
            {
                blockId: 'filter1',
                parameterId: 'freq',
                label: 'SVF - Cutoff',
                states: [
                    { label: 'Low', value: 20, led: 'off' },
                    { label: 'Mid', value: 10010, led: 'blink' },
                    { label: 'High', value: 20000, led: 'on' },
                ],
            },
            {
                blockId: 'filter1',
                parameterId: 'mode',
                label: 'SVF - Mode',
                states: [
                    { label: 'Low', value: 'low', cppValue: 'Svf::LOW', led: 'off' },
                    { label: 'Band', value: 'band', cppValue: 'Svf::BAND', led: 'blink' },
                    { label: 'High', value: 'high', cppValue: 'Svf::HIGH', led: 'on' },
                ],
            },
        ]);
    });

    it('reports stale mappings that conflict with graph connections', () => {
        const mappings: FieldControlMapping[] = [
            {
                controlType: 'key',
                controlId: 'A1',
                layer: 'normal',
                targetBlockId: 'env1',
                targetPortId: 'trig',
                keyOutput: 'trigger',
            },
        ];
        const connections: Connection[] = [
            {
                id: 'c1',
                sourceBlockId: 'clock1',
                sourcePortId: 'trig',
                targetBlockId: 'env1',
                targetPortId: 'trig',
                type: 'trigger',
            },
        ];

        expect(buildFieldMappingConflictErrors(mappings, connections)).toEqual([
            'Field mapping A1 normal targets env1.trig, but that input already has a graph connection.',
        ]);
    });
});
