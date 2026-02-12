import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CustomBlockDefinition } from '@/types/customBlock';
import { BlockRegistry } from '@/core/blocks/BlockRegistry';

// ============================================================================
// EXPORT/IMPORT TYPES
// ============================================================================

/**
 * Serialized block format for .dvpe-block files
 */
export interface ExportedBlock {
    /** Format version for migration support */
    version: string;
    /** Block metadata */
    metadata: {
        exportedAt: string;
        exportedFrom: string;
    };
    /** The actual block definition */
    block: CustomBlockDefinition;
}

/**
 * Result of import operation
 */
export interface ImportResult {
    success: boolean;
    blockId?: string;
    error?: string;
    duplicateId?: string;
}

/**
 * Conflict resolution strategy for duplicate IDs
 */
export type DuplicateResolution = 'replace' | 'rename' | 'cancel';

interface CustomBlockState {
    customBlocks: Record<string, CustomBlockDefinition>;

    // Actions
    addCustomBlock: (block: CustomBlockDefinition) => void;
    removeCustomBlock: (id: string) => void;
    updateCustomBlock: (id: string, updates: Partial<CustomBlockDefinition>) => void;
    clearAllCustomBlocks: () => void;

    // Export/Import
    exportBlock: (id: string) => ExportedBlock | null;
    exportBlockToFile: (id: string) => boolean;
    importBlock: (data: unknown, resolution?: DuplicateResolution) => ImportResult;
    duplicateBlock: (id: string, newId?: string) => CustomBlockDefinition | null;

    // Selectors
    getCustomBlock: (id: string) => CustomBlockDefinition | undefined;
    hasCustomBlock: (id: string) => boolean;
    getCustomBlockIds: () => string[];

    // Helpers
    registerAllWithRegistry: () => void;
}

/**
 * Validation result for imported blocks
 */
interface ValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * Validate that imported data conforms to ExportedBlock structure
 */
function validateImportedBlock(data: unknown): ValidationResult {
    if (data === null || typeof data !== 'object') {
        return { valid: false, error: 'Invalid data: expected object' };
    }

    const exported = data as Record<string, unknown>;

    // Check version
    if (!exported.version || typeof exported.version !== 'string') {
        return { valid: false, error: 'Invalid format: missing or invalid version' };
    }

    // Check block exists and is object
    if (!exported.block || typeof exported.block !== 'object') {
        return { valid: false, error: 'Invalid format: missing or invalid block data' };
    }

    const block = exported.block as Record<string, unknown>;

    // Required BlockDefinition fields
    if (!block.id || typeof block.id !== 'string') {
        return { valid: false, error: 'Invalid block: missing or invalid id' };
    }

    if (!block.displayName || typeof block.displayName !== 'string') {
        return { valid: false, error: 'Invalid block: missing or invalid displayName' };
    }

    if (!block.className || typeof block.className !== 'string') {
        return { valid: false, error: 'Invalid block: missing or invalid className' };
    }

    if (!block.description || typeof block.description !== 'string') {
        return { valid: false, error: 'Invalid block: missing or invalid description' };
    }

    if (!block.category || typeof block.category !== 'string') {
        return { valid: false, error: 'Invalid block: missing or invalid category' };
    }

    if (!block.colorScheme || typeof block.colorScheme !== 'string') {
        return { valid: false, error: 'Invalid block: missing or invalid colorScheme' };
    }

    if (!Array.isArray(block.ports)) {
        return { valid: false, error: 'Invalid block: ports must be an array' };
    }

    if (!Array.isArray(block.parameters)) {
        return { valid: false, error: 'Invalid block: parameters must be an array' };
    }

    // Check isCustom flag
    if (block.isCustom !== true) {
        return { valid: false, error: 'Invalid block: isCustom flag must be true' };
    }

    // Check internalPatch (can be null for code modules)
    if (block.internalPatch !== null && typeof block.internalPatch !== 'object') {
        return { valid: false, error: 'Invalid block: internalPatch must be null or object' };
    }

    // Check exposedPorts
    if (!block.exposedPorts || typeof block.exposedPorts !== 'object') {
        return { valid: false, error: 'Invalid block: missing or invalid exposedPorts' };
    }

    // Check exposedParameters
    if (!block.exposedParameters || typeof block.exposedParameters !== 'object') {
        return { valid: false, error: 'Invalid block: missing or invalid exposedParameters' };
    }

    return { valid: true };
}

/**
 * Collect custom block definitions referenced by a patch's blocks.
 * Recurses into nested custom blocks (depth-limited to match CodeGenerator).
 */
export function collectReferencedCustomBlocks(
    blocks: { definitionId: string }[],
    customBlocks: Record<string, CustomBlockDefinition>,
    maxDepth = 3
): CustomBlockDefinition[] {
    const collected = new Map<string, CustomBlockDefinition>();

    function collect(blockList: { definitionId: string }[], depth: number) {
        if (depth >= maxDepth) return;
        for (const block of blockList) {
            if (collected.has(block.definitionId)) continue;
            const customDef = customBlocks[block.definitionId];
            if (customDef) {
                collected.set(customDef.id, customDef);
                if (customDef.internalPatch?.blocks?.length) {
                    collect(customDef.internalPatch.blocks, depth + 1);
                }
            }
        }
    }

    collect(blocks, 0);
    return Array.from(collected.values());
}

export const useCustomBlockStore = create<CustomBlockState>()(
    persist(
        (set, get) => ({
            customBlocks: {},

            addCustomBlock: (block) => {
                set(state => {
                    const newState = {
                        customBlocks: { ...state.customBlocks, [block.id]: block }
                    };
                    // Side effect: Register immediately
                    BlockRegistry.register(block);
                    return newState;
                });
            },

            removeCustomBlock: (id) => {
                set(state => {
                    const { [id]: removed, ...rest } = state.customBlocks;
                    // Side effect: Unregister immediately
                    BlockRegistry.unregister(id);
                    return { customBlocks: rest };
                });
            },

            updateCustomBlock: (id, updates) => {
                set(state => {
                    const existing = state.customBlocks[id];
                    if (!existing) return state;
                    const updated = { ...existing, ...updates };

                    // Side effect: Register (update)
                    BlockRegistry.register(updated);

                    return {
                        customBlocks: { ...state.customBlocks, [id]: updated }
                    };
                });
            },

            clearAllCustomBlocks: () => {
                set(state => {
                    // Unregister all
                    Object.keys(state.customBlocks).forEach(id => {
                        BlockRegistry.unregister(id);
                    });
                    return { customBlocks: {} };
                });
            },

            getCustomBlock: (id) => get().customBlocks[id],
            hasCustomBlock: (id) => !!get().customBlocks[id],
            getCustomBlockIds: () => Object.keys(get().customBlocks),

            registerAllWithRegistry: () => {
                const blocks = get().customBlocks;
                Object.values(blocks).forEach(block => {
                    BlockRegistry.register(block);
                });
            },

            // ============================================================================
            // EXPORT/IMPORT IMPLEMENTATION
            // ============================================================================

            exportBlock: (id: string): ExportedBlock | null => {
                const block = get().customBlocks[id];
                if (!block) {
                    console.error(`Cannot export: Block '${id}' not found`);
                    return null;
                }

                const exported: ExportedBlock = {
                    version: '1.0',
                    metadata: {
                        exportedAt: new Date().toISOString(),
                        exportedFrom: 'DVPE'
                    },
                    block: { ...block }
                };

                return exported;
            },

            exportBlockToFile: (id: string): boolean => {
                const exported = get().exportBlock(id);
                if (!exported) return false;

                const blob = new Blob([JSON.stringify(exported, null, 2)], {
                    type: 'application/json'
                });

                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${exported.block.id}.dvpe-block`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                return true;
            },

            importBlock: (data: unknown, resolution?: DuplicateResolution): ImportResult => {
                // Validate structure
                const validation = validateImportedBlock(data);
                if (!validation.valid) {
                    return { success: false, error: validation.error };
                }

                const exported = data as ExportedBlock;
                const block = exported.block;

                // Check for duplicate ID
                const existingBlock = get().customBlocks[block.id];
                const registryHasBlock = BlockRegistry.has(block.id);

                if (existingBlock || registryHasBlock) {
                    // Handle based on resolution strategy
                    switch (resolution) {
                        case 'cancel':
                            return {
                                success: false,
                                error: 'Import cancelled - block with same ID already exists',
                                duplicateId: block.id
                            };

                        case 'replace':
                            // Replace existing block
                            get().addCustomBlock(block);
                            return { success: true, blockId: block.id };

                        case 'rename':
                        default:
                            // Return duplicate info - caller should prompt for new ID
                            return {
                                success: false,
                                error: 'Block with same ID already exists',
                                duplicateId: block.id
                            };
                    }
                }

                // No conflict - add the block
                get().addCustomBlock(block);
                return { success: true, blockId: block.id };
            },

            duplicateBlock: (id: string, newId?: string): CustomBlockDefinition | null => {
                const block = get().customBlocks[id];
                if (!block) {
                    console.error(`Cannot duplicate: Block '${id}' not found`);
                    return null;
                }

                // Generate new ID if not provided
                const finalNewId = newId || `${id}_copy_${Date.now()}`;

                // Create a deep copy with new ID
                const duplicated: CustomBlockDefinition = {
                    ...block,
                    id: finalNewId,
                    displayName: `${block.displayName} (Copy)`,
                    isCustom: true
                };

                get().addCustomBlock(duplicated);
                return duplicated;
            }
        }),
        {
            name: 'dvpe-custom-blocks',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                // Ensure blocks are registered when store is loaded from disk
                state?.registerAllWithRegistry();
            }
        }
    )
);
