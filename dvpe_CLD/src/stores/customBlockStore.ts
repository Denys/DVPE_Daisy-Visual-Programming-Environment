import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CustomBlockDefinition } from '@/types/customBlock';
import { BlockRegistry } from '@/core/blocks/BlockRegistry';

interface CustomBlockState {
    customBlocks: Record<string, CustomBlockDefinition>;

    // Actions
    addCustomBlock: (block: CustomBlockDefinition) => void;
    removeCustomBlock: (id: string) => void;
    updateCustomBlock: (id: string, updates: Partial<CustomBlockDefinition>) => void;
    clearAllCustomBlocks: () => void;

    // Selectors
    getCustomBlock: (id: string) => CustomBlockDefinition | undefined;
    hasCustomBlock: (id: string) => boolean;
    getCustomBlockIds: () => string[];

    // Helpers
    registerAllWithRegistry: () => void;
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
