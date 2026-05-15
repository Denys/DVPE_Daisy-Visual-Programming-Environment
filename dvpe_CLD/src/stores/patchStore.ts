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
  PolyVoiceBlanket,
} from '@/types';
import { HardwareConfiguration, DEFAULT_HARDWARE_CONFIG } from '@/types/hardware';
import { BlockRegistry } from '@/core/blocks/BlockRegistry';

const createDefaultHardwareConfig = (): HardwareConfiguration => JSON.parse(JSON.stringify(DEFAULT_HARDWARE_CONFIG));

// ============================================================================
// TYPES
// ============================================================================

interface HistoryEntry {
  blocks: BlockInstance[];
  connections: Connection[];
  polyVoiceBlankets: PolyVoiceBlanket[];
  hardwareConfig: HardwareConfiguration;
  description: string;
}

interface PatchState {
  // Core state
  blocks: BlockInstance[];
  connections: Connection[];
  comments: CommentNode[];
  polyVoiceBlankets: PolyVoiceBlanket[];
  metadata: ProjectMetadata;
  hardwareConfig: HardwareConfiguration;

  // History for undo/redo
  history: HistoryEntry[];
  historyIndex: number;
  maxHistoryLength: number;

  // Selection
  selectedBlockIds: string[];
  selectedConnectionIds: string[];
  selectedPolyVoiceBlanketIds: string[];

  // Dirty flag
  isDirty: boolean;

  // Load counter — incremented on each loadPatch to signal Canvas to re-initialize nodes
  loadCount: number;
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

  // Poly voice blanket operations
  createPolyVoiceBlanketFromSelection: () => PolyVoiceBlanket | null;
  addPolyVoiceBlanket: (blanket: Partial<Omit<PolyVoiceBlanket, 'id'>> & { id?: string }) => PolyVoiceBlanket;
  removePolyVoiceBlanket: (blanketId: string) => void;
  updatePolyVoiceBlanket: (blanketId: string, updates: Partial<Omit<PolyVoiceBlanket, 'id'>>) => void;
  refreshPolyVoiceBlanketMembers: (blanketId: string) => void;
  selectPolyVoiceBlanket: (blanketId: string, addToSelection?: boolean) => void;

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
  setHardwareConfig: (config: Partial<HardwareConfiguration>) => void;
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

const DEFAULT_BLOCK_BOUNDS = { width: 180, height: 100 };
const BLANKET_PADDING = 40;

const getBlockIdsInsideRect = (
  blocks: BlockInstance[],
  position: { x: number; y: number },
  size: { width: number; height: number }
): string[] => {
  const left = position.x;
  const top = position.y;
  const right = position.x + size.width;
  const bottom = position.y + size.height;

  return blocks
    .filter((block) =>
      block.position.x >= left &&
      block.position.x <= right &&
      block.position.y >= top &&
      block.position.y <= bottom
    )
    .map((block) => block.id);
};

const createDefaultPolyVoiceBlanket = (
  input: Partial<Omit<PolyVoiceBlanket, 'id'>> & { id?: string }
): PolyVoiceBlanket => ({
  id: input.id || uuidv4(),
  label: input.label || 'Poly Voice',
  position: input.position || { x: 0, y: 0 },
  size: input.size || { width: 320, height: 220 },
  voiceCount: input.voiceCount ?? 8,
  octave: input.octave ?? 2,
  allocator: input.allocator || 'reuse_free_oldest',
  memberBlockIds: input.memberBlockIds ? [...input.memberBlockIds] : [],
  selected: input.selected,
});

const initialState: PatchState = {
  blocks: [],
  connections: [],
  comments: [],
  polyVoiceBlankets: [],
  metadata: createDefaultMetadata(),
  hardwareConfig: createDefaultHardwareConfig(),
  history: [],
  historyIndex: -1,
  maxHistoryLength: 50,
  selectedBlockIds: [],
  selectedConnectionIds: [],
  selectedPolyVoiceBlanketIds: [],
  isDirty: false,
  loadCount: 0,
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
            polyVoiceBlankets: JSON.parse(JSON.stringify(state.polyVoiceBlankets)),
            hardwareConfig: JSON.parse(JSON.stringify(state.hardwareConfig)),
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
            state.polyVoiceBlankets.forEach((blanket) => {
              blanket.memberBlockIds = blanket.memberBlockIds.filter((id) => id !== blockId);
            });
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
            state.polyVoiceBlankets.forEach((blanket) => {
              blanket.memberBlockIds = blanket.memberBlockIds.filter((id) => !blockIdSet.has(id));
            });
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

            // AUTO-ENABLE CV PORT: If target port is a *_cv port, enable it on the target block
            if (targetPortId.endsWith('_cv')) {
              const paramId = targetPortId.replace(/_cv$/, '');
              const block = state.blocks.find((b) => b.id === targetBlockId);
              if (block) {
                if (!block.enabledCvPorts) {
                  block.enabledCvPorts = [];
                }
                if (!block.enabledCvPorts.includes(paramId)) {
                  block.enabledCvPorts.push(paramId);
                }
              }
            }
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

        // === Poly Voice Blanket Operations ===

        createPolyVoiceBlanketFromSelection: () => {
          const { blocks, selectedBlockIds } = get();
          const selectedBlocks = blocks.filter((block) => selectedBlockIds.includes(block.id));
          if (selectedBlocks.length === 0) {
            return null;
          }

          const minX = Math.min(...selectedBlocks.map((block) => block.position.x));
          const minY = Math.min(...selectedBlocks.map((block) => block.position.y));
          const maxX = Math.max(...selectedBlocks.map((block) => block.position.x + DEFAULT_BLOCK_BOUNDS.width));
          const maxY = Math.max(...selectedBlocks.map((block) => block.position.y + DEFAULT_BLOCK_BOUNDS.height));

          const blanket = createDefaultPolyVoiceBlanket({
            position: { x: minX - BLANKET_PADDING, y: minY - BLANKET_PADDING },
            size: {
              width: Math.max(180, maxX - minX + BLANKET_PADDING * 2),
              height: Math.max(140, maxY - minY + BLANKET_PADDING * 2),
            },
            memberBlockIds: selectedBlocks.map((block) => block.id),
          });

          set((state) => {
            state.polyVoiceBlankets.push(blanket);
            state.selectedPolyVoiceBlanketIds = [blanket.id];
          });

          saveHistory('Create poly voice blanket');
          return blanket;
        },

        addPolyVoiceBlanket: (input) => {
          const blanket = createDefaultPolyVoiceBlanket(input);

          set((state) => {
            state.polyVoiceBlankets.push(blanket);
          });

          saveHistory('Add poly voice blanket');
          return blanket;
        },

        removePolyVoiceBlanket: (blanketId) => {
          set((state) => {
            state.polyVoiceBlankets = state.polyVoiceBlankets.filter((blanket) => blanket.id !== blanketId);
            state.selectedPolyVoiceBlanketIds = state.selectedPolyVoiceBlanketIds.filter((id) => id !== blanketId);
          });

          saveHistory('Remove poly voice blanket');
        },

        updatePolyVoiceBlanket: (blanketId, updates) => {
          set((state) => {
            const blanket = state.polyVoiceBlankets.find((item) => item.id === blanketId);
            if (blanket) {
              Object.assign(blanket, updates);
            }
          });

          saveHistory('Update poly voice blanket');
        },

        refreshPolyVoiceBlanketMembers: (blanketId) => {
          set((state) => {
            const blanket = state.polyVoiceBlankets.find((item) => item.id === blanketId);
            if (!blanket) return;
            blanket.memberBlockIds = getBlockIdsInsideRect(state.blocks, blanket.position, blanket.size);
          });

          saveHistory('Refresh poly voice blanket members');
        },

        selectPolyVoiceBlanket: (blanketId, addToSelection = false) => {
          set((state) => {
            if (addToSelection) {
              if (!state.selectedPolyVoiceBlanketIds.includes(blanketId)) {
                state.selectedPolyVoiceBlanketIds.push(blanketId);
              }
            } else {
              state.selectedPolyVoiceBlanketIds = [blanketId];
              state.selectedBlockIds = [];
              state.selectedConnectionIds = [];
            }
          });
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
              state.selectedPolyVoiceBlanketIds = [];
            }
          });
        },

        selectBlocks: (blockIds, replace = true) => {
          set((state) => {
            if (replace) {
              state.selectedBlockIds = blockIds;
              state.selectedConnectionIds = [];
              state.selectedPolyVoiceBlanketIds = [];
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
              state.selectedPolyVoiceBlanketIds = [];
            }
          });
        },

        selectAll: () => {
          set((state) => {
            state.selectedBlockIds = state.blocks.map((b) => b.id);
            state.selectedConnectionIds = state.connections.map((c) => c.id);
            state.selectedPolyVoiceBlanketIds = state.polyVoiceBlankets.map((blanket) => blanket.id);
          });
        },

        clearSelection: () => {
          set((state) => {
            state.selectedBlockIds = [];
            state.selectedConnectionIds = [];
            state.selectedPolyVoiceBlanketIds = [];
          });
        },

        deleteSelection: () => {
          const { selectedBlockIds, selectedConnectionIds, selectedPolyVoiceBlanketIds } = get();

          if (selectedBlockIds.length === 0 && selectedConnectionIds.length === 0 && selectedPolyVoiceBlanketIds.length === 0) {
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
            state.polyVoiceBlankets.forEach((blanket) => {
              blanket.memberBlockIds = blanket.memberBlockIds.filter((id) => !blockIdSet.has(id));
            });

            const blanketIdSet = new Set(selectedPolyVoiceBlanketIds);
            state.polyVoiceBlankets = state.polyVoiceBlankets.filter((blanket) => !blanketIdSet.has(blanket.id));

            // Clear selection
            state.selectedBlockIds = [];
            state.selectedConnectionIds = [];
            state.selectedPolyVoiceBlanketIds = [];
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
            state.polyVoiceBlankets = JSON.parse(JSON.stringify(previousState.polyVoiceBlankets || []));
            state.hardwareConfig = JSON.parse(JSON.stringify(previousState.hardwareConfig));
            state.historyIndex = historyIndex - 1;
            state.selectedBlockIds = [];
            state.selectedConnectionIds = [];
            state.selectedPolyVoiceBlanketIds = [];
          });
        },

        redo: () => {
          const { historyIndex, history } = get();
          if (historyIndex >= history.length - 1) return;

          const nextState = history[historyIndex + 1];
          set((state) => {
            state.blocks = JSON.parse(JSON.stringify(nextState.blocks));
            state.connections = JSON.parse(JSON.stringify(nextState.connections));
            state.polyVoiceBlankets = JSON.parse(JSON.stringify(nextState.polyVoiceBlankets || []));
            state.hardwareConfig = JSON.parse(JSON.stringify(nextState.hardwareConfig));
            state.historyIndex = historyIndex + 1;
            state.selectedBlockIds = [];
            state.selectedConnectionIds = [];
            state.selectedPolyVoiceBlanketIds = [];
          });
        },

        canUndo: () => get().historyIndex > 0,
        canRedo: () => get().historyIndex < get().history.length - 1,

        // === Project Operations ===

        newPatch: () => {
          set((state) => {
            state.blocks = [];
            state.connections = [];
            state.polyVoiceBlankets = [];
            state.metadata = createDefaultMetadata();
            state.hardwareConfig = createDefaultHardwareConfig();
            state.history = [];
            state.historyIndex = -1;
            state.selectedBlockIds = [];
            state.selectedConnectionIds = [];
            state.selectedPolyVoiceBlanketIds = [];
            state.isDirty = false;
          });
        },

        loadPatch: (patch) => {
          set((state) => {
            state.blocks = patch.blocks;
            state.connections = patch.connections;
            state.polyVoiceBlankets = (patch.polyVoiceBlankets || []).map((blanket) =>
              createDefaultPolyVoiceBlanket(blanket)
            );
            state.metadata = patch.metadata;
            // Load hardware config or default if missing (backward compatibility)
            state.hardwareConfig = {
              ...createDefaultHardwareConfig(),
              ...(patch.hardwareConfig || {}),
              fieldControlMappings: patch.hardwareConfig?.fieldControlMappings ?? [],
            };

            // Sync platform from metadata if missing in hardwareConfig (migration)
            if (!patch.hardwareConfig && patch.metadata.targetHardware) {
              // @ts-ignore - casting string to PlatformType
              state.hardwareConfig.platform = patch.metadata.targetHardware as any;
            }

            // AUTO-ENABLE CV PORTS: Infer enabledCvPorts from existing connections
            for (const conn of state.connections) {
              if (conn.targetPortId.endsWith('_cv')) {
                const paramId = conn.targetPortId.replace(/_cv$/, '');
                const block = state.blocks.find((b) => b.id === conn.targetBlockId);
                if (block) {
                  if (!block.enabledCvPorts) {
                    block.enabledCvPorts = [];
                  }
                  if (!block.enabledCvPorts.includes(paramId)) {
                    block.enabledCvPorts.push(paramId);
                  }
                }
              }
            }

            state.history = [];
            state.historyIndex = -1;
            state.selectedBlockIds = [];
            state.selectedConnectionIds = [];
            state.selectedPolyVoiceBlanketIds = [];
            state.isDirty = false;
            state.loadCount = (state.loadCount ?? 0) + 1;
          });

          // Save initial state to history
          saveHistory('Load patch');
        },

        getPatch: () => ({
          metadata: get().metadata,
          blocks: get().blocks,
          connections: get().connections,
          polyVoiceBlankets: get().polyVoiceBlankets,
          hardwareConfig: get().hardwareConfig,
        }),

        setMetadata: (metadata) => {
          set((state) => {
            state.metadata = { ...state.metadata, ...metadata };
            state.isDirty = true;
          });
        },

        setHardwareConfig: (config) => {
          set((state) => {
            state.hardwareConfig = {
              ...state.hardwareConfig,
              ...config,
              fieldControlMappings: config.fieldControlMappings ?? state.hardwareConfig.fieldControlMappings ?? [],
            };

            // Sync metadata for backward compatibility if platform changes
            if (config.platform) {
              // @ts-ignore - Valid cast as PlatformType is compatible with targetHardware string union
              state.metadata.targetHardware = config.platform;
            }

            state.isDirty = true;
          });

          saveHistory('Update hardware config');
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
export const selectPolyVoiceBlankets = (state: PatchState) => state.polyVoiceBlankets;
export const selectMetadata = (state: PatchState) => state.metadata;
export const selectSelectedBlockIds = (state: PatchState) => state.selectedBlockIds;
export const selectSelectedConnectionIds = (state: PatchState) => state.selectedConnectionIds;
export const selectSelectedPolyVoiceBlanketIds = (state: PatchState) => state.selectedPolyVoiceBlanketIds;
export const selectIsDirty = (state: PatchState) => state.isDirty;
export const selectHardwareConfig = (state: PatchState) => state.hardwareConfig;

export const selectSelectedBlocks = (state: PatchState) =>
  state.blocks.filter((b) => state.selectedBlockIds.includes(b.id));

export const selectSelectedConnections = (state: PatchState) =>
  state.connections.filter((c) => state.selectedConnectionIds.includes(c.id));
