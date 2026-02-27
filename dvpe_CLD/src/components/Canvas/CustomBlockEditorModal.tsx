/**
 * CustomBlockEditorModal
 *
 * Fullscreen modal that lets the user view and edit the internal patch
 * of a custom block. Opens when the user clicks "Edit" in the context menu
 * (ModuleLibrary, right-click) or uses Ctrl/Cmd+Double-click on a custom
 * block instance on the main canvas.
 *
 * Scope:
 *  - Read-write: connections between existing internal blocks (add / remove)
 *  - Read-only:  the set of internal blocks themselves (adding new blocks is a
 *                future enhancement and would require a second palette + drop
 *                zone inside the modal)
 *
 * On Save:
 *  1. Updates internalPatch via updateCustomBlock()
 *  2. Re-runs CustomBlockManager.createCustomBlock() to recompute exposed ports
 *     (preserving block metadata such as id, displayName, category, etc.)
 *  3. Calls updateCustomBlock() a second time with refreshed ports so that
 *     instances already on the main canvas pick up the new interface.
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
    ReactFlow,
    Background,
    BackgroundVariant,
    Controls,
    Connection,
    Node as FlowNode,
    Edge,
    OnNodesChange,
    OnEdgesChange,
    OnConnect,
    NodeTypes,
    EdgeTypes,
    ReactFlowProvider,
    useReactFlow,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowLeft, Save, AlertCircle, Layers } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useCustomBlockStore } from '@/stores/customBlockStore';
import { BlockRegistry } from '@/core/blocks/BlockRegistry';
import { CustomBlockManager, CustomBlockMetadata } from '@/core/blocks/CustomBlockManager';
import { CustomBlockDefinition } from '@/types/customBlock';
import { BlockInstance, Connection as DVPEConnection } from '@/types';
import BlockNode, { BlockNodeData } from './BlockNode';
import ConnectionEdge, { ConnectionEdgeData } from './ConnectionEdge';

// ============================================================================
// NODE / EDGE TYPE REGISTRATION  (same ones the main Canvas uses)
// ============================================================================

const nodeTypes: NodeTypes = {
    dspBlock: BlockNode as any,
};

const edgeTypes: EdgeTypes = {
    connection: ConnectionEdge as any,
};

// ============================================================================
// HELPERS
// ============================================================================

/** Convert DVPE BlockInstances → ReactFlow nodes */
function blocksToNodes(blocks: BlockInstance[]): FlowNode<BlockNodeData>[] {
    return blocks.map((b) => ({
        id: b.id,
        type: 'dspBlock',
        position: b.position,
        data: { instance: b },
    }));
}

/** Convert DVPE Connections → ReactFlow edges */
function connectionsToEdges(connections: DVPEConnection[]): Edge<ConnectionEdgeData>[] {
    return connections.map((c) => ({
        id: c.id,
        source: c.sourceBlockId,
        sourceHandle: c.sourcePortId,
        target: c.targetBlockId,
        targetHandle: c.targetPortId,
        type: 'connection',
        data: {
            type: c.type,
            animated: c.type === 'audio',
        },
    }));
}

/** Convert ReactFlow edges back to DVPE Connections */
function edgesToConnections(edges: Edge<ConnectionEdgeData>[]): DVPEConnection[] {
    return edges.map((e) => ({
        id: e.id,
        sourceBlockId: e.source,
        sourcePortId: e.sourceHandle ?? '',
        targetBlockId: e.target,
        targetPortId: e.targetHandle ?? '',
        type: (e.data?.type ?? 'audio') as DVPEConnection['type'],
    }));
}

// ============================================================================
// INNER EDITOR  (needs to be inside ReactFlowProvider for useReactFlow)
// ============================================================================

interface InnerEditorProps {
    customDef: CustomBlockDefinition;
    onSave: (newConnections: DVPEConnection[]) => void;
    onClose: () => void;
}

const InnerEditor: React.FC<InnerEditorProps> = ({ customDef, onSave, onClose }) => {
    const { fitView } = useReactFlow();

    // Local mutable copies — we only allow editing connections, not blocks
    const [nodes, setNodes] = useState<FlowNode<BlockNodeData>[]>(() =>
        blocksToNodes(customDef.internalPatch?.blocks ?? [])
    );
    const [edges, setEdges] = useState<Edge<ConnectionEdgeData>[]>(() =>
        connectionsToEdges(customDef.internalPatch?.connections ?? [])
    );

    // Fit view once on mount
    useEffect(() => {
        const timer = setTimeout(() => fitView({ padding: 0.2 }), 100);
        return () => clearTimeout(timer);
    }, [fitView]);

    // Node changes: allow position moves only — no removal (blocks are read-only)
    const onNodesChange: OnNodesChange = useCallback((changes) => {
        // Pass through all changes except 'remove' so blocks stay in place
        setNodes((nds) => applyNodeChanges(
            changes.filter((c) => c.type !== 'remove') as Parameters<typeof applyNodeChanges>[0],
            nds
        ) as FlowNode<BlockNodeData>[]);
    }, []);

    // Edge changes: full control (add / remove connections)
    const onEdgesChange: OnEdgesChange = useCallback((changes) => {
        setEdges((eds) => applyEdgeChanges(changes, eds) as Edge<ConnectionEdgeData>[]);
    }, []);

    // New connection drawn by user
    const onConnect: OnConnect = useCallback((connection: Connection) => {
        if (
            !connection.source ||
            !connection.sourceHandle ||
            !connection.target ||
            !connection.targetHandle
        ) return;

        const newEdge: Edge<ConnectionEdgeData> = {
            id: `e_${Date.now()}`,
            source: connection.source,
            sourceHandle: connection.sourceHandle,
            target: connection.target,
            targetHandle: connection.targetHandle,
            type: 'connection',
            data: { type: 'audio', animated: true },
        };

        setEdges((eds) => addEdge(newEdge, eds));
    }, []);

    // Connection validation (reuse BlockRegistry logic)
    const isValidConnection = useCallback(
        (conn: Connection | Edge): boolean => {
            const source = conn.source;
            const sourceHandle = conn.sourceHandle ?? undefined;
            const target = conn.target;
            const targetHandle = conn.targetHandle ?? undefined;

            if (!source || !sourceHandle || !target || !targetHandle) return false;

            // Find block instances inside the internal patch
            const internalBlocks = customDef.internalPatch?.blocks ?? [];
            const srcBlock = internalBlocks.find((b) => b.id === source);
            const tgtBlock = internalBlocks.find((b) => b.id === target);

            if (!srcBlock || !tgtBlock) return false;

            const validation = BlockRegistry.validateConnection(
                srcBlock.definitionId,
                sourceHandle,
                tgtBlock.definitionId,
                targetHandle
            );
            return validation.valid;
        },
        [customDef.internalPatch]
    );

    const handleSave = useCallback(() => {
        onSave(edgesToConnections(edges));
    }, [edges, onSave]);

    const hasBlocks = (customDef.internalPatch?.blocks?.length ?? 0) > 0;

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-surface-primary">
            {/* ─── Header ─────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface-secondary flex-shrink-0">
                {/* Back / Close */}
                <button
                    onClick={onClose}
                    className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Main Canvas
                </button>

                {/* Breadcrumb */}
                <span className="text-text-tertiary">›</span>
                <div className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-semibold text-text-primary">
                        {customDef.displayName}
                    </span>
                    <span className="text-xs text-text-tertiary ml-1">
                        ({customDef.internalPatch?.blocks?.length ?? 0} blocks,&nbsp;
                        {edges.length} connections)
                    </span>
                </div>

                <div className="flex-1" />

                {/* Info badge */}
                <div className="flex items-center gap-1.5 text-xs text-text-tertiary bg-surface-tertiary/50 px-2 py-1 rounded">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Connect / disconnect wires, then Save
                </div>

                {/* Save */}
                <button
                    onClick={handleSave}
                    className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium',
                        'bg-audio-primary text-black hover:bg-audio-primary/90 transition-colors'
                    )}
                >
                    <Save className="w-4 h-4" />
                    Save
                </button>
            </div>

            {/* ─── Canvas ─────────────────────────────────────────────── */}
            <div className="flex-1 overflow-hidden">
                {hasBlocks ? (
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        isValidConnection={isValidConnection}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        fitView
                        fitViewOptions={{ padding: 0.25 }}
                        minZoom={0.1}
                        maxZoom={4}
                        proOptions={{ hideAttribution: true }}
                        zoomOnDoubleClick={false}
                        deleteKeyCode="Delete"
                        className="touch-none"
                    >
                        <Background
                            variant={BackgroundVariant.Dots}
                            gap={20}
                            size={1}
                            color="rgba(255,255,255,0.05)"
                        />
                        <Controls
                            showInteractive={false}
                            className="fill-surface-tertiary stroke-text-primary"
                        />
                    </ReactFlow>
                ) : (
                    <div className="flex items-center justify-center h-full text-text-tertiary text-sm">
                        This custom block has no internal blocks to display.
                    </div>
                )}
            </div>

            {/* ─── Footer hint ─────────────────────────────────────────── */}
            <div className="px-4 py-2 border-t border-border bg-surface-secondary text-xs text-text-tertiary flex-shrink-0">
                <kbd className="px-1 py-0.5 bg-surface-primary rounded mr-1">Del</kbd> Remove selected wire
                &nbsp;•&nbsp; Drag from a port to create a new connection
                &nbsp;•&nbsp; Block positions are fixed (drag blocks to rearrange without affecting the patch)
            </div>
        </div>
    );
};

// ============================================================================
// MAIN EXPORTED COMPONENT
// ============================================================================

export interface CustomBlockEditorModalProps {
    /** Definition ID of the custom block to edit */
    blockDefinitionId: string | null;
    onClose: () => void;
}

export const CustomBlockEditorModal: React.FC<CustomBlockEditorModalProps> = ({
    blockDefinitionId,
    onClose,
}) => {
    const updateCustomBlock = useCustomBlockStore((state) => state.updateCustomBlock);
    const customBlocks = useCustomBlockStore((state) => state.customBlocks);

    const customDef = useMemo(
        () => (blockDefinitionId ? customBlocks[blockDefinitionId] : undefined),
        [blockDefinitionId, customBlocks]
    );

    const handleSave = useCallback(
        (newConnections: DVPEConnection[]) => {
            if (!customDef) return;

            const updatedPatch = {
                ...customDef.internalPatch,
                connections: newConnections,
            };

            // 1. Persist the new internalPatch
            updateCustomBlock(customDef.id, { internalPatch: updatedPatch });

            // 2. Re-run analysis to refresh exposed ports based on new connections
            const metadata: CustomBlockMetadata = {
                id: customDef.id,
                displayName: customDef.displayName,
                description: customDef.description,
                category: customDef.category,
                author: undefined,
                icon: customDef.icon,
            };

            const reanalysed = CustomBlockManager.createCustomBlock(updatedPatch, metadata);

            // 3. Update ports / exposedPorts / exposedParameters
            updateCustomBlock(customDef.id, {
                ports: reanalysed.ports,
                exposedPorts: reanalysed.exposedPorts,
                exposedParameters: reanalysed.exposedParameters,
                parameters: reanalysed.parameters,
            });

            onClose();
        },
        [customDef, updateCustomBlock, onClose]
    );

    if (!blockDefinitionId || !customDef) return null;

    return (
        <ReactFlowProvider>
            <InnerEditor customDef={customDef} onSave={handleSave} onClose={onClose} />
        </ReactFlowProvider>
    );
};

export default CustomBlockEditorModal;
