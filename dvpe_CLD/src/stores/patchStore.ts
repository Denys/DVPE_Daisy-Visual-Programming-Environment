/**
 * Patch Store
 * Zustand store for managing the patch graph (blocks and connections)
 * Implements undo/redo with immer-powered immutable updates
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import {
  BlockInstance,
  Connection,
  ConnectionType,
  PatchGraph,
  ProjectMetadata,
  SignalType,
  CommentNode,
} from '@/types';
import { BlockRegistry } from '@/core/blocks/BlockRegistry';

// ============================================================================
// TYPES
// ============================================================================

interface HistoryEntry {
  blocks: BlockInstance[];
  connections: Connection[];
  description: string;
}

interface PatchState {
  // Core state
  blocks: BlockInstance[];
  connections: Connection[];
  comments: CommentNode[];
  metadata: ProjectMetadata;

  // History for undo/redo
  history: HistoryEntry[];
  historyIndex: number;
  maxHistoryLength: number;

  // Selection
  selectedBlockIds: string[];
  selectedConnectionIds: string[];

  // Dirty flag
  isDirty: boolean;
}

interface PatchActions {
  // Block operations
  addBlock: (definitionId: string, position: { x: number; y: number }) => BlockInstance | null;
  removeBlock: (blockId: string) => void;
  removeBlocks: (blockIds: string[]) => void;
  updateBlockPosition: (blockId: string, position: { x: number; y: number }) => void;
  updateBlockPositions: (updates: Array<{ id: string; position: { x: number; y: number } }>) => void;
  updateBlockParameter: (blockId: string, parameterId: string, value: number | boolean | string) => void;
  setBlockLabel: (blockId: string, label: string) => void;
  toggleCvPort: (blockId: string, parameterId: string, enabled: boolean) => void;

  addConnection: (
    sourceBlockId: string,
    sourcePortId: string,
    targetBlockId: string,
    targetPortId: string
  ) => Connection | null;
  removeConnection: (connectionId: string) => void;
  removeConnections: (connectionIds: string[]) => void;
  setConnectionLabel: (connectionId: string, label: string) => void;

  // Comment operations
  addComment: (position: { x: number; y: number }, text?: string) => CommentNode;
  removeComment: (commentId: string) => void;
  updateComment: (commentId: string, updates: Partial<Omit<CommentNode, 'id'>>) => void;

  // Alignment operations
  alignBlocksLeft: () => void;
  alignBlocksRight: () => void;
  alignBlocksCenterH: () => void;
  alignBlocksTop: () => void;
  alignBlocksBottom: () => void;
  alignBlocksCenterV: () => void;
  distributeBlocksH: () => void;
  distributeBlocksV: () => void;

  // Selection operations
  selectBlock: (blockId: string, addToSelection?: boolean) => void;
  selectBlocks: (blockIds: string[], replace?: boolean) => void;
  selectConnection: (connectionId: string, addToSelection?: boolean) => void;
  selectAll: () => void;
  clearSelection: () => void;
  deleteSelection: () => void;

  // History operations
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Project operations
  newPatch: () => void;
  loadPatch: (patch: PatchGraph) => void;
  getPatch: () => PatchGraph;
  setMetadata: (metadata: Partial<ProjectMetadata>) => void;
  markClean: () => void;

  // Utility
  getBlockById: (blockId: string) => BlockInstance | undefined;
  getConnectionById: (connectionId: string) => Connection | undefined;
  getConnectionsForBlock: (blockId: string) => Connection[];
  getConnectionsForPort: (blockId: string, portId: string) => Connection[];
}

// ============================================================================
// DEFAULT STATE
// ============================================================================

const createDefaultMetadata = (): ProjectMetadata => ({
  name: 'Untitled Patch',
  author: '',
  description: '',
  created: new Date().toISOString(),
  modified: new Date().toISOString(),
  version: '1.0.0',
  targetHardware: 'seed',
  sampleRate: 48000,
  blockSize: 48,
});

const initialState: PatchState = {
  blocks: [],
  connections: [],
  comments: [],
  metadata: createDefaultMetadata(),
  history: [],
  historyIndex: -1,
  maxHistoryLength: 50,
  selectedBlockIds: [],
  selectedConnectionIds: [],
  isDirty: false,
};

// ============================================================================
// STORE
// ============================================================================

export const usePatchStore = create<PatchState & PatchActions>()(
  subscribeWithSelector(
    immer((set, get) => {
      // Helper to save history
      const saveHistory = (description: string) => {
        set((state) => {
          // Truncate future history if we're not at the end
          const newHistory = state.history.slice(0, state.historyIndex + 1);

          // Add current state to history
          newHistory.push({
            blocks: JSON.parse(JSON.stringify(state.blocks)),
            connections: JSON.parse(JSON.stringify(state.connections)),
            description,
          });

          // Limit history length
          if (newHistory.length > state.maxHistoryLength) {
            newHistory.shift();
          }

          state.history = newHistory;
          state.historyIndex = newHistory.length - 1;
          state.isDirty = true;
          state.metadata.modified = new Date().toISOString();
        });
      };

      // Determine connection type from source port
      const getConnectionType = (
        sourceBlockId: string,
        sourcePortId: string
      ): ConnectionType => {
        const block = get().blocks.find((b) => b.id === sourceBlockId);
        if (!block) return 'audio';

        const definition = BlockRegistry.get(block.definitionId);
        if (!definition) return 'audio';

        const port = definition.ports.find((p) => p.id === sourcePortId);
        if (!port) return 'audio';

        switch (port.signalType) {
          case SignalType.AUDIO:
            return 'audio';
          case SignalType.CV:
            return 'cv';
          case SignalType.TRIGGER:
            return 'trigger';
          default:
            return 'audio';
        }
      };

      return {
        ...initialState,

        // === Block Operations ===

        addBlock: (definitionId, position) => {
          const instance = BlockRegistry.createInstance(definitionId, position);
          if (!instance) return null;

          set((state) => {
            state.blocks.push(instance);
          });

          saveHistory(`Add ${definitionId} block`);
          return instance;
        },

        removeBlock: (blockId) => {
          set((state) => {
            // Remove the block
            state.blocks = state.blocks.filter((b) => b.id !== blockId);
            // Remove associated connections
            state.connections = state.connections.filter(
              (c) => c.sourceBlockId !== blockId && c.targetBlockId !== blockId
            );
            // Update selection
            state.selectedBlockIds = state.selectedBlockIds.filter((id) => id !== blockId);
          });

          saveHistory('Remove block');
        },

        removeBlocks: (blockIds) => {
          const blockIdSet = new Set(blockIds);
          set((state) => {
            state.blocks = state.blocks.filter((b) => !blockIdSet.has(b.id));
            state.connections = state.connections.filter(
              (c) => !blockIdSet.has(c.sourceBlockId) && !blockIdSet.has(c.targetBlockId)
            );
            state.selectedBlockIds = state.selectedBlockIds.filter((id) => !blockIdSet.has(id));
          });

          saveHistory(`Remove ${blockIds.length} blocks`);
        },

        updateBlockPosition: (blockId, position) => {
          set((state) => {
            const block = state.blocks.find((b) => b.id === blockId);
            if (block) {
              block.position = position;
            }
          });
          // Don't save history for position updates (too frequent)
        },

        updateBlockPositions: (updates) => {
          set((state) => {
            for (const update of updates) {
              const block = state.blocks.find((b) => b.id === update.id);
              if (block) {
                block.position = update.position;
              }
            }
          });
        },

        updateBlockParameter: (blockId, parameterId, value) => {
          set((state) => {
            const block = state.blocks.find((b) => b.id === blockId);
            if (block) {
              block.parameterValues[parameterId] = value;
            }
          });

          saveHistory(`Update ${parameterId}`);
        },

        setBlockLabel: (blockId, label) => {
          set((state) => {
            const block = state.blocks.find((b) => b.id === blockId);
            if (block) {
              block.label = label;
            }
          });

          saveHistory('Rename block');
        },

        toggleCvPort: (blockId, parameterId, enabled) => {
          set((state) => {
            const block = state.blocks.find((b) => b.id === blockId);
            if (block) {
              if (!block.enabledCvPorts) {
                block.enabledCvPorts = [];
              }

              if (enabled) {
                if (!block.enabledCvPorts.includes(parameterId)) {
                  block.enabledCvPorts.push(parameterId);
                }
              } else {
                block.enabledCvPorts = block.enabledCvPorts.filter(id => id !== parameterId);
              }
            }
          });

          saveHistory(enabled ? 'Enable CV port' : 'Disable CV port');
        },

        // === Connection Operations ===

        addConnection: (sourceBlockId, sourcePortId, targetBlockId, targetPortId) => {
          const sourceBlock = get().blocks.find((b) => b.id === sourceBlockId);
          const targetBlock = get().blocks.find((b) => b.id === targetBlockId);

          if (!sourceBlock || !targetBlock) {
            console.error('Invalid block IDs for connection');
            return null;
          }

          // Validate connection
          const validation = BlockRegistry.validateConnection(
            sourceBlock.definitionId,
            sourcePortId,
            targetBlock.definitionId,
            targetPortId
          );

          if (!validation.valid) {
            console.error('Invalid connection:', validation.error);
            return null;
          }

          // Check for cycles
          if (BlockRegistry.wouldCreateCycle(get().connections, get().blocks, sourceBlockId, targetBlockId)) {
            console.error('Connection would create a cycle');
            return null;
          }

          // Check if connection already exists
          const existing = get().connections.find(
            (c) =>
              c.sourceBlockId === sourceBlockId &&
              c.sourcePortId === sourcePortId &&
              c.targetBlockId === targetBlockId &&
              c.targetPortId === targetPortId
          );

          if (existing) {
            console.warn('Connection already exists');
            return existing;
          }

          const connection: Connection = {
            id: uuidv4(),
            sourceBlockId,
            sourcePortId,
            targetBlockId,
            targetPortId,
            type: getConnectionType(sourceBlockId, sourcePortId),
          };

          set((state) => {
            state.connections.push(connection);
          });

          saveHistory('Add connection');
          return connection;
        },

        removeConnection: (connectionId) => {
          set((state) => {
            state.connections = state.connections.filter((c) => c.id !== connectionId);
            state.selectedConnectionIds = state.selectedConnectionIds.filter((id) => id !== connectionId);
          });

          saveHistory('Remove connection');
        },

        removeConnections: (connectionIds) => {
          const idSet = new Set(connectionIds);
          set((state) => {
            state.connections = state.connections.filter((c) => !idSet.has(c.id));
            state.selectedConnectionIds = state.selectedConnectionIds.filter((id) => !idSet.has(id));
          });

          saveHistory(`Remove ${connectionIds.length} connections`);
        },

        setConnectionLabel: (connectionId, label) => {
          set((state) => {
            const connection = state.connections.find((c) => c.id === connectionId);
            if (connection) {
              connection.label = label || undefined;
            }
          });

          saveHistory('Label connection');
        },

        // === Comment Operations ===

        addComment: (position, text = '') => {
          const comment: CommentNode = {
            id: uuidv4(),
            text,
            position,
            size: { width: 200, height: 100 },
            color: '#374151', // gray-700
          };

          set((state) => {
            state.comments.push(comment);
          });

          saveHistory('Add comment');
          return comment;
        },

        removeComment: (commentId) => {
          set((state) => {
            state.comments = state.comments.filter((c) => c.id !== commentId);
          });

          saveHistory('Remove comment');
        },

        updateComment: (commentId, updates) => {
          set((state) => {
            const comment = state.comments.find((c) => c.id === commentId);
            if (comment) {
              Object.assign(comment, updates);
            }
          });

          saveHistory('Update comment');
        },

        // === Alignment Operations ===

        alignBlocksLeft: () => {
          const { selectedBlockIds, blocks } = get();
          if (selectedBlockIds.length < 2) return;

          const selectedBlocks = blocks.filter((b) => selectedBlockIds.includes(b.id));
          const minX = Math.min(...selectedBlocks.map((b) => b.position.x));

          set((state) => {
            state.blocks.forEach((block) => {
              if (selectedBlockIds.includes(block.id)) {
                block.position.x = minX;
              }
            });
          });

          saveHistory('Align left');
        },

        alignBlocksRight: () => {
          const { selectedBlockIds, blocks } = get();
          if (selectedBlockIds.length < 2) return;

          const selectedBlocks = blocks.filter((b) => selectedBlockIds.includes(b.id));
          const maxX = Math.max(...selectedBlocks.map((b) => b.position.x));

          set((state) => {
            state.blocks.forEach((block) => {
              if (selectedBlockIds.includes(block.id)) {
                block.position.x = maxX;
              }
            });
          });

          saveHistory('Align right');
        },

        alignBlocksCenterH: () => {
          const { selectedBlockIds, blocks } = get();
          if (selectedBlockIds.length < 2) return;

          const selectedBlocks = blocks.filter((b) => selectedBlockIds.includes(b.id));
          const avgX = selectedBlocks.reduce((sum, b) => sum + b.position.x, 0) / selectedBlocks.length;

          set((state) => {
            state.blocks.forEach((block) => {
              if (selectedBlockIds.includes(block.id)) {
                block.position.x = avgX;
              }
            });
          });

          saveHistory('Align center horizontal');
        },

        alignBlocksTop: () => {
          const { selectedBlockIds, blocks } = get();
          if (selectedBlockIds.length < 2) return;

          const selectedBlocks = blocks.filter((b) => selectedBlockIds.includes(b.id));
          const minY = Math.min(...selectedBlocks.map((b) => b.position.y));

          set((state) => {
            state.blocks.forEach((block) => {
              if (selectedBlockIds.includes(block.id)) {
                block.position.y = minY;
              }
            });
          });

          saveHistory('Align top');
        },

        alignBlocksBottom: () => {
          const { selectedBlockIds, blocks } = get();
          if (selectedBlockIds.length < 2) return;

          const selectedBlocks = blocks.filter((b) => selectedBlockIds.includes(b.id));
          const maxY = Math.max(...selectedBlocks.map((b) => b.position.y));

          set((state) => {
            state.blocks.forEach((block) => {
              if (selectedBlockIds.includes(block.id)) {
                block.position.y = maxY;
              }
            });
          });

          saveHistory('Align bottom');
        },

        alignBlocksCenterV: () => {
          const { selectedBlockIds, blocks } = get();
          if (selectedBlockIds.length < 2) return;

          const selectedBlocks = blocks.filter((b) => selectedBlockIds.includes(b.id));
          const avgY = selectedBlocks.reduce((sum, b) => sum + b.position.y, 0) / selectedBlocks.length;

          set((state) => {
            state.blocks.forEach((block) => {
              if (selectedBlockIds.includes(block.id)) {
                block.position.y = avgY;
              }
            });
          });

          saveHistory('Align center vertical');
        },

        distributeBlocksH: () => {
          const { selectedBlockIds, blocks } = get();
          if (selectedBlockIds.length < 3) return;

          const selectedBlocks = blocks
            .filter((b) => selectedBlockIds.includes(b.id))
            .sort((a, b) => a.position.x - b.position.x);

          const minX = selectedBlocks[0].position.x;
          const maxX = selectedBlocks[selectedBlocks.length - 1].position.x;
          const spacing = (maxX - minX) / (selectedBlocks.length - 1);

          set((state) => {
            selectedBlocks.forEach((block, index) => {
              const stateBlock = state.blocks.find((b) => b.id === block.id);
              if (stateBlock) {
                stateBlock.position.x = minX + index * spacing;
              }
            });
          });

          saveHistory('Distribute horizontally');
        },

        distributeBlocksV: () => {
          const { selectedBlockIds, blocks } = get();
          if (selectedBlockIds.length < 3) return;

          const selectedBlocks = blocks
            .filter((b) => selectedBlockIds.includes(b.id))
            .sort((a, b) => a.position.y - b.position.y);

          const minY = selectedBlocks[0].position.y;
          const maxY = selectedBlocks[selectedBlocks.length - 1].position.y;
          const spacing = (maxY - minY) / (selectedBlocks.length - 1);

          set((state) => {
            selectedBlocks.forEach((block, index) => {
              const stateBlock = state.blocks.find((b) => b.id === block.id);
              if (stateBlock) {
                stateBlock.position.y = minY + index * spacing;
              }
            });
          });

          saveHistory('Distribute vertically');
        },

        // === Selection Operations ===

        selectBlock: (blockId, addToSelection = false) => {
          set((state) => {
            if (addToSelection) {
              if (!state.selectedBlockIds.includes(blockId)) {
                state.selectedBlockIds.push(blockId);
              }
            } else {
              state.selectedBlockIds = [blockId];
              state.selectedConnectionIds = [];
            }
          });
        },

        selectBlocks: (blockIds, replace = true) => {
          set((state) => {
            if (replace) {
              state.selectedBlockIds = blockIds;
              state.selectedConnectionIds = [];
            } else {
              for (const id of blockIds) {
                if (!state.selectedBlockIds.includes(id)) {
                  state.selectedBlockIds.push(id);
                }
              }
            }
          });
        },

        selectConnection: (connectionId, addToSelection = false) => {
          set((state) => {
            if (addToSelection) {
              if (!state.selectedConnectionIds.includes(connectionId)) {
                state.selectedConnectionIds.push(connectionId);
              }
            } else {
              state.selectedBlockIds = [];
              state.selectedConnectionIds = [connectionId];
            }
          });
        },

        selectAll: () => {
          set((state) => {
            state.selectedBlockIds = state.blocks.map((b) => b.id);
            state.selectedConnectionIds = state.connections.map((c) => c.id);
          });
        },

        clearSelection: () => {
          set((state) => {
            state.selectedBlockIds = [];
            state.selectedConnectionIds = [];
          });
        },

        deleteSelection: () => {
          const { selectedBlockIds, selectedConnectionIds } = get();

          if (selectedBlockIds.length === 0 && selectedConnectionIds.length === 0) {
            return;
          }

          set((state) => {
            // Remove selected connections
            const connIdSet = new Set(selectedConnectionIds);
            state.connections = state.connections.filter((c) => !connIdSet.has(c.id));

            // Remove selected blocks and their connections
            const blockIdSet = new Set(selectedBlockIds);
            state.blocks = state.blocks.filter((b) => !blockIdSet.has(b.id));
            state.connections = state.connections.filter(
              (c) => !blockIdSet.has(c.sourceBlockId) && !blockIdSet.has(c.targetBlockId)
            );

            // Clear selection
            state.selectedBlockIds = [];
            state.selectedConnectionIds = [];
          });

          saveHistory('Delete selection');
        },

        // === History Operations ===

        undo: () => {
          const { historyIndex, history } = get();
          if (historyIndex <= 0) return;

          const previousState = history[historyIndex - 1];
          set((state) => {
            state.blocks = JSON.parse(JSON.stringify(previousState.blocks));
            state.connections = JSON.parse(JSON.stringify(previousState.connections));
            state.historyIndex = historyIndex - 1;
            state.selectedBlockIds = [];
            state.selectedConnectionIds = [];
          });
        },

        redo: () => {
          const { historyIndex, history } = get();
          if (historyIndex >= history.length - 1) return;

          const nextState = history[historyIndex + 1];
          set((state) => {
            state.blocks = JSON.parse(JSON.stringify(nextState.blocks));
            state.connections = JSON.parse(JSON.stringify(nextState.connections));
            state.historyIndex = historyIndex + 1;
            state.selectedBlockIds = [];
            state.selectedConnectionIds = [];
          });
        },

        canUndo: () => get().historyIndex > 0,
        canRedo: () => get().historyIndex < get().history.length - 1,

        // === Project Operations ===

        newPatch: () => {
          set((state) => {
            state.blocks = [];
            state.connections = [];
            state.metadata = createDefaultMetadata();
            state.history = [];
            state.historyIndex = -1;
            state.selectedBlockIds = [];
            state.selectedConnectionIds = [];
            state.isDirty = false;
          });
        },

        loadPatch: (patch) => {
          set((state) => {
            state.blocks = patch.blocks;
            state.connections = patch.connections;
            state.metadata = patch.metadata;
            state.history = [];
            state.historyIndex = -1;
            state.selectedBlockIds = [];
            state.selectedConnectionIds = [];
            state.isDirty = false;
          });

          // Save initial state to history
          saveHistory('Load patch');
        },

        getPatch: () => ({
          metadata: get().metadata,
          blocks: get().blocks,
          connections: get().connections,
        }),

        setMetadata: (metadata) => {
          set((state) => {
            state.metadata = { ...state.metadata, ...metadata };
            state.isDirty = true;
          });
        },

        markClean: () => {
          set((state) => {
            state.isDirty = false;
          });
        },

        // === Utility ===

        getBlockById: (blockId) => get().blocks.find((b) => b.id === blockId),

        getConnectionById: (connectionId) => get().connections.find((c) => c.id === connectionId),

        getConnectionsForBlock: (blockId) =>
          get().connections.filter(
            (c) => c.sourceBlockId === blockId || c.targetBlockId === blockId
          ),

        getConnectionsForPort: (blockId, portId) =>
          get().connections.filter(
            (c) =>
              (c.sourceBlockId === blockId && c.sourcePortId === portId) ||
              (c.targetBlockId === blockId && c.targetPortId === portId)
          ),
      };
    })
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

export const selectBlocks = (state: PatchState) => state.blocks;
export const selectConnections = (state: PatchState) => state.connections;
export const selectMetadata = (state: PatchState) => state.metadata;
export const selectSelectedBlockIds = (state: PatchState) => state.selectedBlockIds;
export const selectSelectedConnectionIds = (state: PatchState) => state.selectedConnectionIds;
export const selectIsDirty = (state: PatchState) => state.isDirty;

export const selectSelectedBlocks = (state: PatchState) =>
  state.blocks.filter((b) => state.selectedBlockIds.includes(b.id));

export const selectSelectedConnections = (state: PatchState) =>
  state.connections.filter((c) => state.selectedConnectionIds.includes(c.id));
