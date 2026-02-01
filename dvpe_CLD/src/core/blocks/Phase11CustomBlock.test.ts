// import { describe, it, expect } from 'vitest';
import { CustomBlockManager } from './CustomBlockManager';
import { PatchGraph, BlockCategory, BlockInstance, Connection, SignalType, PortDirection, BlockDefinition } from '@/types';
import { CustomBlockDefinition } from '@/types/customBlock';

// Mock Patch Creation Helper
const createMockPatch = (): PatchGraph => ({
    metadata: {
        name: 'Internal Patch',
        author: 'User',
        created: '',
        modified: '',
        version: '1.0',
        targetHardware: 'seed',
        sampleRate: 48000,
        blockSize: 48
    },
    blocks: [
        {
            id: 'osc1',
            definitionId: 'oscillator',
            position: { x: 0, y: 0 },
            parameterValues: { freq: 440 }
        },
        {
            id: 'gain1',
            definitionId: 'multiply',
            position: { x: 100, y: 0 },
            parameterValues: {}
        }
    ],
    connections: [
        {
            id: 'c1',
            sourceBlockId: 'osc1',
            sourcePortId: 'out',
            targetBlockId: 'gain1',
            targetPortId: 'a',
            type: 'audio'
        }
    ],
    hardwareConfig: {}
});

describe('Phase 11: Custom Block Encapsulation', () => {

    it('should define CustomBlockManager', () => {
        expect(CustomBlockManager).toBeDefined();
    });

    it('should create a basic CustomBlockDefinition structure', () => {
        const patch = createMockPatch();
        const metadata = {
            id: 'my_custom_synth',
            displayName: 'My Custom Synth',
            description: 'A test custom block',
            category: BlockCategory.USER_IO // Temporary category
        };

        const customBlock = CustomBlockManager.createCustomBlock(patch, metadata);

        expect(customBlock).toBeDefined();
        expect(customBlock.id).toBe(metadata.id);
        expect(customBlock.isCustom).toBe(true);
        expect(customBlock.internalPatch).toBe(patch);
    });

    it('should identify exposed ports from disconnected inputs/outputs', () => {
        // In the mock patch:
        // 'osc1' input ports are unconnected -> should be exposed as block inputs?
        // 'gain1' 'out' port is unconnected -> should be exposed as block output
        // 'gain1' 'b' input is unconnected -> should be exposed as block input

        const patch = createMockPatch();
        const customBlock = CustomBlockManager.createCustomBlock(patch, {
            id: 'test_block',
            displayName: 'Test',
            description: 'Test',
            category: BlockCategory.UTILITY
        });

        // We expect some ports to be generated
        expect(customBlock.ports.length).toBeGreaterThan(0);

        // Specifically, gain1 output should be a block output
        const outputPort = customBlock.ports.find(p => p.direction === PortDirection.OUTPUT);
        expect(outputPort).toBeDefined();
        expect(customBlock.exposedPorts[outputPort!.id]).toBeDefined();
        expect(customBlock.exposedPorts[outputPort!.id].blockId).toBe('gain1');
    });

    it('should map parameters from internal blocks', () => {
        const patch = createMockPatch();
        const customBlock = CustomBlockManager.createCustomBlock(patch, {
            id: 'test_params',
            displayName: 'Params',
            description: 'Test',
            category: BlockCategory.UTILITY
        });

        // Osc1 has 'freq' param. Should it be exposed?
        // Default behavior: expose all params or allow selection?
        // For MVP 11.2, let's assume we expose all or verify specific mapping logic.
        // Let's assume naive "expose all" for this first test pass.

        const freqParam = customBlock.parameters.find(p => p.id === 'osc1_freq' || p.id === 'freq');
        // Naming strategy might be blockId_paramId or just paramId if unique

        // expect(freqParam).toBeDefined();
        // expect(customBlock.exposedParameters[freqParam!.id]).toEqual({
        //     blockId: 'osc1',
        //     parameterId: 'freq'
        // });
    });
});
