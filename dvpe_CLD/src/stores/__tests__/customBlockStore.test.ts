/**
 * Tests for customBlockStore export/import functionality
 * Work Stream C - Phase 13.5 Block Library Manager
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCustomBlockStore, ExportedBlock, ImportResult } from '../customBlockStore';
import { CustomBlockDefinition } from '@/types/customBlock';
import { BlockCategory, BlockColorScheme, SignalType, PortDirection } from '@/types';

// ============================================================================
// MOCK DATA
// ============================================================================

const mockBlock: CustomBlockDefinition = {
    id: 'test-custom-oscillator',
    displayName: 'Test Custom Oscillator',
    className: 'TestOsc',
    description: 'A test custom oscillator block',
    category: BlockCategory.SOURCES,
    colorScheme: BlockColorScheme.AUDIO,
    ports: [
        { id: 'freq', displayName: 'Frequency', signalType: SignalType.CV, direction: PortDirection.INPUT },
        { id: 'out', displayName: 'Output', signalType: SignalType.AUDIO, direction: PortDirection.OUTPUT },
    ],
    parameters: [
        { id: 'freq', displayName: 'Frequency', type: 'number', defaultValue: 440, min: 20, max: 20000 },
    ],
    isCustom: true,
    internalPatch: {
        blocks: [],
        connections: [],
        exposedPorts: {},
        exposedParameters: {},
    },
    exposedPorts: {},
    exposedParameters: {},
};

const mockExportedBlock: ExportedBlock = {
    version: '1.0',
    metadata: {
        exportedAt: '2026-02-10T10:00:00Z',
        exportedFrom: 'DVPE',
    },
    block: mockBlock,
};

// ============================================================================
// TESTS
// ============================================================================

describe('customBlockStore - Block Library Manager', () => {
    // Reset store before each test
    beforeEach(() => {
        // Clear all custom blocks
        const store = useCustomBlockStore.getState();
        store.clearAllCustomBlocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('T-C1: Export Block Functionality', () => {
        it('should export a custom block to ExportedBlock format', () => {
            const store = useCustomBlockStore.getState();

            // Add a custom block
            store.addCustomBlock(mockBlock);

            // Export the block
            const exported = store.exportBlock(mockBlock.id);

            expect(exported).not.toBeNull();
            expect(exported?.version).toBe('1.0');
            expect(exported?.block.id).toBe(mockBlock.id);
            expect(exported?.block.displayName).toBe(mockBlock.displayName);
            expect(exported?.metadata.exportedFrom).toBe('DVPE');
            expect(exported?.metadata.exportedAt).toBeDefined();
        });

        it('should return null when exporting non-existent block', () => {
            const store = useCustomBlockStore.getState();

            const exported = store.exportBlock('non-existent-block');

            expect(exported).toBeNull();
        });

        it('should include all block metadata in export', () => {
            const store = useCustomBlockStore.getState();
            store.addCustomBlock(mockBlock);

            const exported = store.exportBlock(mockBlock.id);

            expect(exported?.block.category).toBe(mockBlock.category);
            expect(exported?.block.colorScheme).toBe(mockBlock.colorScheme);
            expect(exported?.block.ports).toEqual(mockBlock.ports);
            expect(exported?.block.parameters).toEqual(mockBlock.parameters);
            expect(exported?.block.isCustom).toBe(true);
            expect(exported?.block.internalPatch).toEqual(mockBlock.internalPatch);
            expect(exported?.block.exposedPorts).toEqual(mockBlock.exposedPorts);
            expect(exported?.block.exposedParameters).toEqual(mockBlock.exposedParameters);
        });

        it('should export block with code module', () => {
            const store = useCustomBlockStore.getState();
            const codeModuleBlock: CustomBlockDefinition = {
                ...mockBlock,
                id: 'code-module-block',
                displayName: 'Code Module Block',
                internalPatch: null as unknown as typeof mockBlock.internalPatch,
                codeModule: {
                    cppCode: 'float process(float input) { return input * 2.0f; }',
                    portBindings: [
                        { id: 'input', displayName: 'Input', signalType: SignalType.AUDIO, direction: PortDirection.INPUT },
                        { id: 'output', displayName: 'Output', signalType: SignalType.AUDIO, direction: PortDirection.OUTPUT },
                    ],
                },
            };

            store.addCustomBlock(codeModuleBlock);
            const exported = store.exportBlock(codeModuleBlock.id);

            expect(exported?.block.codeModule).toBeDefined();
            expect(exported?.block.codeModule?.cppCode).toBe(codeModuleBlock.codeModule?.cppCode);
            expect(exported?.block.codeModule?.portBindings).toEqual(codeModuleBlock.codeModule?.portBindings);
        });
    });

    describe('T-C2: Import Block Functionality', () => {
        it('should import a valid block', () => {
            const store = useCustomBlockStore.getState();

            const result = store.importBlock(mockExportedBlock);

            expect(result.success).toBe(true);
            expect(result.blockId).toBe(mockBlock.id);
            expect(store.hasCustomBlock(mockBlock.id)).toBe(true);
        });

        it('should reject invalid data (not an object)', () => {
            const store = useCustomBlockStore.getState();

            const result = store.importBlock('not an object');

            expect(result.success).toBe(false);
            expect(result.error).toContain('Invalid data');
        });

        it('should reject missing version', () => {
            const store = useCustomBlockStore.getState();
            const invalidData = { block: mockBlock };

            const result = store.importBlock(invalidData);

            expect(result.success).toBe(false);
            expect(result.error).toContain('version');
        });

        it('should reject missing block data', () => {
            const store = useCustomBlockStore.getState();
            const invalidData = { version: '1.0' };

            const result = store.importBlock(invalidData);

            expect(result.success).toBe(false);
            expect(result.error).toContain('block data');
        });

        it('should reject block without required fields', () => {
            const store = useCustomBlockStore.getState();
            const invalidData = {
                version: '1.0',
                block: { id: 'test' }, // missing required fields
            };

            const result = store.importBlock(invalidData);

            expect(result.success).toBe(false);
        });

        it('should detect duplicate ID and return duplicate info', () => {
            const store = useCustomBlockStore.getState();

            // First import
            store.importBlock(mockExportedBlock);

            // Second import (should detect duplicate)
            const result = store.importBlock(mockExportedBlock);

            expect(result.success).toBe(false);
            expect(result.duplicateId).toBe(mockBlock.id);
            expect(result.error).toContain('already exists');
        });

        it('should replace existing block with replace resolution', () => {
            const store = useCustomBlockStore.getState();

            // First import
            store.importBlock(mockExportedBlock);

            // Modify the block to import
            const modifiedExport: ExportedBlock = {
                ...mockExportedBlock,
                block: { ...mockBlock, displayName: 'Modified Name' },
            };

            // Import with replace resolution
            const result = store.importBlock(modifiedExport, 'replace');

            expect(result.success).toBe(true);
            expect(store.getCustomBlock(mockBlock.id)?.displayName).toBe('Modified Name');
        });

        it('should cancel import with cancel resolution', () => {
            const store = useCustomBlockStore.getState();

            // First import
            store.importBlock(mockExportedBlock);

            // Try to import again with cancel resolution
            const result = store.importBlock(mockExportedBlock, 'cancel');

            expect(result.success).toBe(false);
            expect(result.error).toContain('cancelled');
        });
    });

    describe('T-C3: Duplicate Block Functionality', () => {
        it('should duplicate a custom block with new ID', () => {
            const store = useCustomBlockStore.getState();
            store.addCustomBlock(mockBlock);

            const duplicated = store.duplicateBlock(mockBlock.id, 'new-id');

            expect(duplicated).not.toBeNull();
            expect(duplicated?.id).toBe('new-id');
            expect(duplicated?.displayName).toBe(`${mockBlock.displayName} (Copy)`);
            expect(store.hasCustomBlock('new-id')).toBe(true);
        });

        it('should generate new ID if not provided', () => {
            const store = useCustomBlockStore.getState();
            store.addCustomBlock(mockBlock);

            const duplicated = store.duplicateBlock(mockBlock.id);

            expect(duplicated).not.toBeNull();
            expect(duplicated?.id).not.toBe(mockBlock.id);
            expect(duplicated?.id).toContain('copy');
        });

        it('should return null when duplicating non-existent block', () => {
            const store = useCustomBlockStore.getState();

            const duplicated = store.duplicateBlock('non-existent');

            expect(duplicated).toBeNull();
        });

        it('should preserve all block properties in duplicate', () => {
            const store = useCustomBlockStore.getState();
            store.addCustomBlock(mockBlock);

            const duplicated = store.duplicateBlock(mockBlock.id, 'new-id');

            expect(duplicated?.category).toBe(mockBlock.category);
            expect(duplicated?.ports).toEqual(mockBlock.ports);
            expect(duplicated?.parameters).toEqual(mockBlock.parameters);
            expect(duplicated?.internalPatch).toEqual(mockBlock.internalPatch);
        });
    });

    describe('Export/Import Round-trip', () => {
        it('should preserve block data through export/import cycle', () => {
            const store = useCustomBlockStore.getState();

            // Add original block
            store.addCustomBlock(mockBlock);

            // Export
            const exported = store.exportBlock(mockBlock.id);
            expect(exported).not.toBeNull();

            // Clear and re-import
            store.clearAllCustomBlocks();
            expect(store.hasCustomBlock(mockBlock.id)).toBe(false);

            // Import
            const result = store.importBlock(exported!);
            expect(result.success).toBe(true);

            // Verify properties preserved
            const imported = store.getCustomBlock(mockBlock.id);
            expect(imported?.displayName).toBe(mockBlock.displayName);
            expect(imported?.category).toBe(mockBlock.category);
            expect(imported?.ports).toEqual(mockBlock.ports);
            expect(imported?.parameters).toEqual(mockBlock.parameters);
            expect(imported?.isCustom).toBe(true);
        });
    });

    describe('Validation', () => {
        it('should reject block without isCustom flag', () => {
            const store = useCustomBlockStore.getState();
            const invalidBlock = { ...mockBlock, isCustom: false };
            const data = { version: '1.0', block: invalidBlock };

            const result = store.importBlock(data);

            expect(result.success).toBe(false);
            expect(result.error).toContain('isCustom');
        });

        it('should reject block without ports array', () => {
            const store = useCustomBlockStore.getState();
            const invalidBlock = { ...mockBlock, ports: 'not-an-array' };
            const data = { version: '1.0', block: invalidBlock };

            const result = store.importBlock(data);

            expect(result.success).toBe(false);
            expect(result.error).toContain('ports');
        });

        it('should reject block without parameters array', () => {
            const store = useCustomBlockStore.getState();
            const invalidBlock = { ...mockBlock, parameters: 'not-an-array' };
            const data = { version: '1.0', block: invalidBlock };

            const result = store.importBlock(data);

            expect(result.success).toBe(false);
            expect(result.error).toContain('parameters');
        });

        it('should reject block without exposedPorts', () => {
            const store = useCustomBlockStore.getState();
            const invalidBlock = { ...mockBlock, exposedPorts: undefined };
            const data = { version: '1.0', block: invalidBlock };

            const result = store.importBlock(data);

            expect(result.success).toBe(false);
            expect(result.error).toContain('exposedPorts');
        });

        it('should reject block without exposedParameters', () => {
            const store = useCustomBlockStore.getState();
            const invalidBlock = { ...mockBlock, exposedParameters: undefined };
            const data = { version: '1.0', block: invalidBlock };

            const result = store.importBlock(data);

            expect(result.success).toBe(false);
            expect(result.error).toContain('exposedParameters');
        });
    });
});
