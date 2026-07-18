import { describe, expect, it } from 'vitest';
import { usePatchStore } from '../patchStore';
import { DEFAULT_HARDWARE_CONFIG } from '@/types/hardware';
import type { FieldControlMapping, PatchGraph } from '@/types';

const mapping: FieldControlMapping = {
    controlType: 'knob',
    controlId: 'K1',
    layer: 'sw1',
    targetBlockId: 'filter1',
    targetParameterId: 'freq',
    mappingType: 'log',
    outputRange: [20, 20000],
};

const switchMapping: FieldControlMapping = {
    controlType: 'switch',
    controlId: 'SW1',
    layer: 'normal',
    interaction: 'shortPress',
    targetBlockId: 'env1',
    targetPortId: 'trig',
    keyOutput: 'trigger',
};

const toggleMapping: FieldControlMapping = {
    controlType: 'key',
    controlId: 'A1',
    layer: 'normal',
    keyOutput: 'toggle3',
    targetBlockId: 'osc1',
    targetParameterId: 'waveform',
    toggleStates: [
        { label: 'Sine', value: 'WAVE_SIN', cppValue: 'Oscillator::WAVE_SIN', led: 'off' },
        { label: 'Saw', value: 'WAVE_SAW', cppValue: 'Oscillator::WAVE_SAW', led: 'blink' },
        { label: 'Square', value: 'WAVE_SQUARE', cppValue: 'Oscillator::WAVE_SQUARE', led: 'on' },
    ],
};

describe('patch store Field mappings', () => {
    it('persists Field control mappings through hardware config, load, and undo/redo', () => {
        const store = usePatchStore.getState();
        store.newPatch();

        usePatchStore.getState().setHardwareConfig({
            platform: 'field',
            fieldControlMappings: [mapping],
        });

        expect(usePatchStore.getState().getPatch().hardwareConfig?.fieldControlMappings).toEqual([mapping]);

        const loadedPatch: PatchGraph = {
            metadata: {
                name: 'Loaded',
                author: 'test',
                created: '2026-05-15T00:00:00.000Z',
                modified: '2026-05-15T00:00:00.000Z',
                version: '1.0.0',
                targetHardware: 'field',
                sampleRate: 48000,
                blockSize: 48,
            },
            blocks: [],
            connections: [],
            hardwareConfig: {
                ...DEFAULT_HARDWARE_CONFIG,
                platform: 'field',
                fieldControlMappings: [mapping, switchMapping, toggleMapping],
            },
        };

        usePatchStore.getState().loadPatch(loadedPatch);
        expect(usePatchStore.getState().hardwareConfig.fieldControlMappings).toEqual([mapping, switchMapping, toggleMapping]);

        usePatchStore.getState().setHardwareConfig({ fieldControlMappings: [] });
        expect(usePatchStore.getState().hardwareConfig.fieldControlMappings).toEqual([]);

        usePatchStore.getState().undo();
        expect(usePatchStore.getState().hardwareConfig.fieldControlMappings).toEqual([mapping, switchMapping, toggleMapping]);

        usePatchStore.getState().redo();
        expect(usePatchStore.getState().hardwareConfig.fieldControlMappings).toEqual([]);
    });
});
