/**
 * Canvas Component
 * Main React Flow canvas for the visual programming environment
 * Implements drag-drop block placement, connection creation, and viewport controls
 */

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  Connection,
  Node as FlowNode,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  NodeTypes,
  EdgeTypes,
  SelectionMode,
  OnNodeDrag,
  useReactFlow,
  ReactFlowProvider,
  useNodesInitialized,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useHotkeys } from 'react-hotkeys-hook';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { usePatchStore, useUIStore } from '@/stores';
// import { BlockInstance } from '@/types'; // Unused
import { BlockRegistry } from '@/core/blocks/BlockRegistry';
import BlockNode, { BlockNodeData } from './BlockNode';
import CommentNode from './CommentNode'; // CommentNodeData unused
import PolyVoiceBlanketNode, { PolyVoiceBlanketNodeData } from './PolyVoiceBlanketNode';
import ConnectionEdge, { ConnectionEdgeData } from './ConnectionEdge';
import AlignmentToolbar from './AlignmentToolbar';
import { DragOverlay } from './DragOverlay';
import { resolveNodeDoubleClickAction } from './doubleClickActions';
import { getStitchNeonCanvasStyle } from '@/lib/stitchNeonStyle';
import {
  DVPE_BLOCK_DRAG_TYPE,
  DVPE_POLY_VOICE_BLANKET_DRAG_TYPE,
  DVPE_POLY_VOICE_BLANKET_PAYLOAD,
} from './dragTypes';

// ============================================================================
// NODE TYPES REGISTRATION
// ============================================================================

const nodeTypes: NodeTypes = {
  dspBlock: BlockNode as any, // Type assertion required for memo-wrapped component
  comment: CommentNode as any,
  polyVoiceBlanket: PolyVoiceBlanketNode as any,
};

const edgeTypes: EdgeTypes = {
  connection: ConnectionEdge as any, // Type assertion required for memo-wrapped component
};

const hasPositionChanged = (
  current: { x: number; y: number } | undefined,
  next: { x: number; y: number }
): boolean => !current || Math.abs(current.x - next.x) > 0.5 || Math.abs(current.y - next.y) > 0.5;

const hasSizeChanged = (
  current: { width: number; height: number } | undefined,
  next: { width: number; height: number }
): boolean => !current || Math.abs(current.width - next.width) > 0.5 || Math.abs(current.height - next.height) > 0.5;

// ============================================================================
// CANVAS INNER COMPONENT (needs ReactFlow context)
// ============================================================================

const CanvasInner: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const suppressDragPositionUpdatesRef = useRef(false);
  const { screenToFlowPosition, fitView } = useReactFlow();
  const nodesInitialized = useNodesInitialized();

  // Store state
  const blocks = usePatchStore((state) => state.blocks);
  const connections = usePatchStore((state) => state.connections);
  const polyVoiceBlankets = usePatchStore((state) => state.polyVoiceBlankets);
  const selectedBlockIds = usePatchStore((state) => state.selectedBlockIds);
  const selectedConnectionIds = usePatchStore((state) => state.selectedConnectionIds);
  const selectedPolyVoiceBlanketIds = usePatchStore((state) => state.selectedPolyVoiceBlanketIds);
  const addBlock = usePatchStore((state) => state.addBlock);
  const addPolyVoiceBlanket = usePatchStore((state) => state.addPolyVoiceBlanket);
  const addConnection = usePatchStore((state) => state.addConnection);
  const updateBlockPositions = usePatchStore((state) => state.updateBlockPositions);
  const updatePolyVoiceBlanket = usePatchStore((state) => state.updatePolyVoiceBlanket);
  const removeBlocks = usePatchStore((state) => state.removeBlocks);
  const removePolyVoiceBlanket = usePatchStore((state) => state.removePolyVoiceBlanket);
  const removeConnections = usePatchStore((state) => state.removeConnections);
  const selectBlocks = usePatchStore((state) => state.selectBlocks);
  const clearSelection = usePatchStore((state) => state.clearSelection);
  const deleteSelection = usePatchStore((state) => state.deleteSelection);
  const copySelection = usePatchStore((state) => state.copySelection);
  const cutSelection = usePatchStore((state) => state.cutSelection);
  const pasteClipboard = usePatchStore((state) => state.pasteClipboard);
  const beginMoveTransaction = usePatchStore((state) => state.beginMoveTransaction);
  const cancelMoveTransaction = usePatchStore((state) => state.cancelMoveTransaction);
  const commitMoveTransaction = usePatchStore((state) => state.commitMoveTransaction);
  const undo = usePatchStore((state) => state.undo);
  const redo = usePatchStore((state) => state.redo);

  const loadCount = usePatchStore((state) => state.loadCount);

  const viewport = useUIStore((state) => state.viewport);
  const setViewport = useUIStore((state) => state.setViewport);
  const gridEnabled = useUIStore((state) => state.gridEnabled);
  const gridSize = useUIStore((state) => state.gridSize);
  const gridMode = useUIStore((state) => state.gridMode);
  const snapToGrid = useUIStore((state) => state.snapToGrid);
  const panels = useUIStore((state) => state.panels);
  const inspectBlock = useUIStore((state) => state.inspectBlock);
  const openModal = useUIStore((state) => state.openModal);
  const draggingBlockId = useUIStore((state) => state.draggingBlockId);
  const setDraggingBlock = useUIStore((state) => state.setDraggingBlock);
  const layoutStyle = useUIStore((state) => state.layoutStyle);
  const stitchNeonSettings = useUIStore((state) => state.stitchNeonSettings);

  // Convert blocks to React Flow nodes
  // Convert blocks to React Flow nodes
  const nodes: FlowNode<BlockNodeData | PolyVoiceBlanketNodeData>[] = useMemo(
    () =>
      [
        ...polyVoiceBlankets.map((blanket) => ({
          id: blanket.id,
          type: 'polyVoiceBlanket',
          position: blanket.position,
          data: { blanket } as PolyVoiceBlanketNodeData,
          selected: selectedPolyVoiceBlanketIds.includes(blanket.id),
          style: {
            width: blanket.size.width,
            height: blanket.size.height,
          },
          zIndex: 0,
        })),
        ...blocks.map((block) => ({
        id: block.id,
        type: 'dspBlock',
        position: block.position,
        data: { instance: block },
        selected: selectedBlockIds.includes(block.id),
        zIndex: 10,
        // Removed dragHandle restriction - blocks can be dragged by any part
        })),
      ] as FlowNode<BlockNodeData | PolyVoiceBlanketNodeData>[],
    [blocks, polyVoiceBlankets, selectedBlockIds, selectedPolyVoiceBlanketIds]
  );

  // Convert connections to React Flow edges
  const edges: Edge<ConnectionEdgeData>[] = useMemo(
    () =>
      connections.map((conn) => ({
        id: conn.id,
        source: conn.sourceBlockId,
        sourceHandle: conn.sourcePortId,
        target: conn.targetBlockId,
        targetHandle: conn.targetPortId,
        type: 'connection',
        selected: selectedConnectionIds.includes(conn.id),
        data: {
          type: conn.type,
          animated: conn.type === 'audio',
          label: conn.label,
        },
      })),
    [connections, selectedConnectionIds]
  );

  // Handle node changes (position, selection)
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      // Handle position changes
      const blanketIds = new Set(usePatchStore.getState().polyVoiceBlankets.map((blanket) => blanket.id));
      const positionChanges = changes.filter(
        (c) => c.type === 'position' && 'position' in c && c.position !== undefined
      );
      if (positionChanges.length > 0 && !suppressDragPositionUpdatesRef.current) {
        const blockPositionUpdates = positionChanges
          .filter((c) => !blanketIds.has((c as { id: string }).id))
          .map((c) => {
            // Type guard ensures c has id and position
            const change = c as { id: string; position: { x: number; y: number } };
            return {
              id: change.id,
              position: change.position,
            };
          });

        if (blockPositionUpdates.length > 0) {
          updateBlockPositions(blockPositionUpdates);
        }

        positionChanges
          .filter((c) => blanketIds.has((c as { id: string }).id))
          .forEach((c) => {
            const change = c as { id: string; position: { x: number; y: number } };
            const currentBlanket = usePatchStore.getState().polyVoiceBlankets.find((blanket) => blanket.id === change.id);
            if (hasPositionChanged(currentBlanket?.position, change.position)) {
              updatePolyVoiceBlanket(change.id, { position: change.position }, { saveHistory: false });
            }
          });
      }

      const dimensionChanges = changes.filter(
        (c) => c.type === 'dimensions' && 'dimensions' in c && c.dimensions !== undefined
      );
      if (dimensionChanges.length > 0) {
        dimensionChanges
          .filter((c) => blanketIds.has((c as { id: string }).id))
          .forEach((c) => {
            const change = c as { id: string; dimensions: { width: number; height: number } };
            const currentBlanket = usePatchStore.getState().polyVoiceBlankets.find((blanket) => blanket.id === change.id);
            if (hasSizeChanged(currentBlanket?.size, change.dimensions)) {
              updatePolyVoiceBlanket(change.id, { size: change.dimensions });
            }
          });
      }

      // Handle removal
      const removeChanges = changes.filter((c) => c.type === 'remove');
      if (removeChanges.length > 0) {
        const removedIds = removeChanges.map((c) => (c as { id: string }).id);
        const removedBlanketIds = removedIds.filter((id) => blanketIds.has(id));
        const removedBlockIds = removedIds.filter((id) => !blanketIds.has(id));
        if (removedBlockIds.length > 0) {
          removeBlocks(removedBlockIds);
        }
        removedBlanketIds.forEach(removePolyVoiceBlanket);
      }
    },
    [updateBlockPositions, updatePolyVoiceBlanket, removeBlocks, removePolyVoiceBlanket]
  );

  // Handle edge changes
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      // Handle removal
      const removeChanges = changes.filter((c) => c.type === 'remove');
      if (removeChanges.length > 0) {
        removeConnections(removeChanges.map((c) => c.id));
      }
    },
    [removeConnections]
  );

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }: {
      nodes: FlowNode<BlockNodeData | PolyVoiceBlanketNodeData>[];
      edges: Edge<ConnectionEdgeData>[];
    }) => {
      const blanketIds = new Set(usePatchStore.getState().polyVoiceBlankets.map((blanket) => blanket.id));
      const nextBlockIds: string[] = [];
      const nextBlanketIds: string[] = [];

      selectedNodes.forEach((node) => {
        if (blanketIds.has(node.id)) {
          nextBlanketIds.push(node.id);
        } else {
          nextBlockIds.push(node.id);
        }
      });

      usePatchStore.setState({
        selectedBlockIds: nextBlockIds,
        selectedConnectionIds: selectedEdges.map((edge) => edge.id),
        selectedPolyVoiceBlanketIds: nextBlanketIds,
      });

      if (nextBlockIds.length !== 1 || nextBlanketIds.length > 0 || selectedEdges.length > 0) {
        inspectBlock(null);
      }
    },
    [inspectBlock]
  );

  // Handle new connections
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (
        connection.source &&
        connection.sourceHandle &&
        connection.target &&
        connection.targetHandle
      ) {
        addConnection(
          connection.source,
          connection.sourceHandle,
          connection.target,
          connection.targetHandle
        );
      }
    },
    [addConnection]
  );

  // Handle connection validation
  const isValidConnection = useCallback(
    (connection: Connection | Edge<ConnectionEdgeData>): boolean => {
      // Extract common properties that exist in both Connection and Edge
      const source = connection.source;
      const target = connection.target;
      const sourceHandle = connection.sourceHandle ?? undefined;
      const targetHandle = connection.targetHandle ?? undefined;

      if (
        !source ||
        !sourceHandle ||
        !target ||
        !targetHandle
      ) {
        return false;
      }

      // Find blocks
      const sourceBlock = blocks.find((b) => b.id === source);
      const targetBlock = blocks.find((b) => b.id === target);

      if (!sourceBlock || !targetBlock) return false;

      // Validate using registry
      const validation = BlockRegistry.validateConnection(
        sourceBlock.definitionId,
        sourceHandle,
        targetBlock.definitionId,
        targetHandle
      );

      return validation.valid;
    },
    [blocks]
  );


  // Handle canvas click to clear selection
  const onPaneClick = useCallback(() => {
    clearSelection();
    inspectBlock(null);
  }, [clearSelection, inspectBlock]);

  // Handle node double-click to open inspector
  const onNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: FlowNode<BlockNodeData | PolyVoiceBlanketNodeData>) => {
      if (node.type === 'polyVoiceBlanket') {
        return;
      }

      // Preserve existing behavior exactly: double-click always inspects block
      inspectBlock(node.id);

      // Additional behavior: Ctrl/Cmd + double-click on custom block opens the nested editor
      const block = blocks.find((item) => item.id === node.id);
      const definition = block ? BlockRegistry.get(block.definitionId) : undefined;
      const action = resolveNodeDoubleClickAction({
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        definition,
      });

      if (action === 'inspect-custom-internals') {
        // Open the full nested editor, keyed by definitionId so the modal can
        // look up the block in the custom block store directly
        openModal('custom-block-editor', { blockDefinitionId: block?.definitionId });
      }
    },
    [inspectBlock, blocks, openModal]
  );

  // Re-initialize React Flow node layout after patch load
  // (fixes Ctrl+Drag box select not working in loaded projects)
  useEffect(() => {
    if (loadCount > 0 && nodes.length > 0 && nodesInitialized) {
      const timer = setTimeout(() => {
        fitView({ duration: 300, padding: 0.2, maxZoom: 1.5 });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loadCount, nodes.length, nodesInitialized, fitView]);

  // Keyboard shortcuts
  useHotkeys('delete,backspace', () => deleteSelection(), [deleteSelection]);
  useHotkeys('mod+c', () => copySelection(), [copySelection]);
  useHotkeys('mod+x', () => cutSelection(), [cutSelection]);
  useHotkeys('mod+v', () => pasteClipboard(), [pasteClipboard]);
  useHotkeys('mod+z', () => undo(), [undo]);
  useHotkeys('mod+shift+z,mod+y', () => redo(), [redo]);
  useHotkeys('mod+a', (e: KeyboardEvent) => {
    e.preventDefault();
    selectBlocks(blocks.map((b) => b.id));
  }, [blocks, selectBlocks]);
  useHotkeys('escape', () => {
    if (cancelMoveTransaction()) {
      suppressDragPositionUpdatesRef.current = true;
      return;
    }
    clearSelection();
    inspectBlock(null);
  }, [cancelMoveTransaction, clearSelection, inspectBlock]);
  useHotkeys('mod+0', () => fitView(), [fitView]);

  const onNodeDragStart: OnNodeDrag<FlowNode<BlockNodeData | PolyVoiceBlanketNodeData>> = useCallback(
    (_event, node, draggedNodes) => {
      suppressDragPositionUpdatesRef.current = false;
      const nodeIds = draggedNodes.length > 0 ? draggedNodes.map((item) => item.id) : [node.id];
      beginMoveTransaction(nodeIds);
    },
    [beginMoveTransaction]
  );

  const onNodeDragStop: OnNodeDrag<FlowNode<BlockNodeData | PolyVoiceBlanketNodeData>> = useCallback(
    () => {
      if (suppressDragPositionUpdatesRef.current) {
        window.setTimeout(() => {
          suppressDragPositionUpdatesRef.current = false;
        }, 0);
        return;
      }
      commitMoveTransaction();
    },
    [commitMoveTransaction]
  );

  // Handle Drag Over
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  // Handle Drop
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      if (snapToGrid) {
        position.x = Math.round(position.x / gridSize) * gridSize;
        position.y = Math.round(position.y / gridSize) * gridSize;
      }

      const directiveId = event.dataTransfer.getData(DVPE_POLY_VOICE_BLANKET_DRAG_TYPE);
      const isPolyVoiceBlanketDrop =
        directiveId === DVPE_POLY_VOICE_BLANKET_PAYLOAD ||
        draggingBlockId === DVPE_POLY_VOICE_BLANKET_PAYLOAD;

      if (isPolyVoiceBlanketDrop) {
        addPolyVoiceBlanket({
          label: 'Poly Voice Blanket V1',
          position,
          size: { width: 560, height: 340 },
          memberBlockIds: [],
        });
        setDraggingBlock(null);
        return;
      }

      // We prioritize the store ID as it's more reliable within the app
      const blockId = draggingBlockId || event.dataTransfer.getData(DVPE_BLOCK_DRAG_TYPE);

      if (blockId) {
        console.log('Canvas: Dropping block:', blockId, 'at', position);
        addBlock(blockId, position);
        setDraggingBlock(null); // Clear state immediately
      }
    },
    [draggingBlockId, screenToFlowPosition, snapToGrid, gridSize, addBlock, addPolyVoiceBlanket, setDraggingBlock]
  );

  // Native Drag/Drop handled by DragOverlay component now
  // This avoids event propagation issues in WebView/Tauri

  // Background variant based on grid mode
  const backgroundVariant: BackgroundVariant = useMemo(() => {
    switch (gridMode) {
      case 'dots':
        return BackgroundVariant.Dots;
      case 'lines':
        return BackgroundVariant.Lines;
      default:
        return BackgroundVariant.Dots;
    }
  }, [gridMode]);

  return (
    <div
      ref={reactFlowWrapper}
      className={cn("w-full h-full", layoutStyle === 'glass' ? "bg-black" : "bg-surface-primary")}
      style={layoutStyle === 'glass' ? getStitchNeonCanvasStyle(stitchNeonSettings) : {}}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onSelectionChange={onSelectionChange}
        onPaneClick={onPaneClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultViewport={viewport}
        onViewportChange={setViewport}
        snapToGrid={snapToGrid}
        snapGrid={[gridSize, gridSize]}
        selectionMode={SelectionMode.Partial}
        selectionOnDrag={true}
        selectionKeyCode={['Control', 'Meta', 'Shift']}
        selectNodesOnDrag={false}
        multiSelectionKeyCode={['Control', 'Meta', 'Shift']}
        deleteKeyCode={null} // We handle delete ourselves
        fitView
        fitViewOptions={{
          padding: 0.2,
          maxZoom: 1.5,
        }}
        minZoom={0.1}
        maxZoom={4}
        proOptions={{ hideAttribution: true }}
        zoomOnDoubleClick={false}
        className="touch-none"
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {/* Background Grid */}
        {gridEnabled && (
          <Background
            variant={backgroundVariant}
            gap={gridSize}
            size={1}
            color="rgba(255, 255, 255, 0.05)"
          />
        )}

        {/* Viewport Controls */}
        <Controls
          showInteractive={false}
          className="fill-surface-tertiary stroke-text-primary text-text-primary"
        />

        {/* Minimap */}
        {panels.minimap?.visible && (
          <MiniMap
            nodeColor={(node) => {
              const block = blocks.find((b) => b.id === node.id);
              if (!block) return '#4b5563';
              const def = BlockRegistry.get(block.definitionId);
              if (!def) return '#4b5563';

              switch (def.colorScheme) {
                case 'audio':
                  return '#22d3ee';
                case 'control':
                  return '#facc15';
                case 'user':
                  return '#4ade80';
                case 'logic':
                  return '#a78bfa';
                default:
                  return '#6b7280';
              }
            }}
            maskColor="rgba(0, 0, 0, 0.8)"
            className="bg-surface-secondary border border-border rounded-lg"
            zoomable
            pannable
          />
        )}

        {/* Global Drag Overlay */}
        <DragOverlay />

        {/* Alignment Toolbar (shown when multiple blocks selected) */}
        <AlignmentToolbar />


        {/* Help Panel */}
        <Panel position="bottom-center" className="mb-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-secondary/80 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-text-tertiary border border-border"
          >
            <span className="mr-3">
              <kbd className="px-1 py-0.5 bg-surface-primary rounded">Del</kbd> Delete
            </span>
            <span className="mr-3">
              <kbd className="px-1 py-0.5 bg-surface-primary rounded">Ctrl/Cmd+C/X/V</kbd> Clipboard
            </span>
            <span className="mr-3">
              <kbd className="px-1 py-0.5 bg-surface-primary rounded">⌘Z</kbd> Undo
            </span>
            <span className="mr-3">
              <kbd className="px-1 py-0.5 bg-surface-primary rounded">Shift</kbd> Multi-select
            </span>
            <span className="mr-3">
              <kbd className="px-1 py-0.5 bg-surface-primary rounded">Ctrl/Shift+Drag</kbd> Box select
            </span>
            <span className="mr-3">
              <kbd className="px-1 py-0.5 bg-surface-primary rounded">Esc</kbd> Cancel drag
            </span>
            <span>
              <kbd className="px-1 py-0.5 bg-surface-primary rounded">Double-click</kbd> Inspect
            </span>
            <span className="ml-3">
              <kbd className="px-1 py-0.5 bg-surface-primary rounded">Ctrl+Double-click</kbd> Custom internals
            </span>
          </motion.div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

// ============================================================================
// CANVAS WRAPPER WITH PROVIDER
// ============================================================================

const Canvas: React.FC = () => {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
};

export default Canvas;
