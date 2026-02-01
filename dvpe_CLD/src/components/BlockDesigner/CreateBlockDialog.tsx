/**
 * Create Block Dialog
 * Phase 13.3: Hierarchical Block System
 * 
 * Dialog for creating a new custom block from selected blocks.
 * Allows user to:
 * - Name the block
 * - Select category
 * - Configure exposed ports (boundary detection)
 * - Configure exposed parameters
 */

import React, { useState, useEffect } from 'react';
import { X, Check, Box } from 'lucide-react';
import { CustomBlockManager } from '@/core/blocks/CustomBlockManager';
import { useCustomBlockStore } from '@/stores/customBlockStore';
import { BlockCategory } from '@/types/blocks';
import { CustomBlockDefinition } from '@/types/customBlock';
import { BlockRegistry } from '@/core/blocks/BlockRegistry';

// Styles embedded for now, move to CSS later if needed
const styles = {
    overlay: "fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm",
    dialog: "bg-[#1E1E1E] border border-[#30363d] rounded-lg shadow-xl w-[600px] max-h-[80vh] flex flex-col",
    header: "flex items-center justify-between px-4 py-3 border-b border-[#30363d] bg-[#252526]",
    title: "text-sm font-semibold text-white flex items-center gap-2",
    content: "flex-1 overflow-y-auto p-4 space-y-4",
    section: "space-y-2",
    sectionTitle: "text-xs font-semibold text-[#8b949e] uppercase tracking-wider",
    inputGroup: "space-y-1",
    label: "block text-xs text-[#8b949e]",
    input: "w-full bg-[#3c3c3c] border border-[#30363d] rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-[#58a6ff]",
    select: "w-full bg-[#3c3c3c] border border-[#30363d] rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-[#58a6ff]",
    checkboxList: "space-y-1 bg-[#252526] rounded border border-[#30363d] p-2",
    checkboxItem: "flex items-center gap-2 px-2 py-1 hover:bg-[#3c3c3c] rounded cursor-pointer",
    footer: "flex items-center justify-end gap-2 px-4 py-3 border-t border-[#30363d] bg-[#252526]",
    button: {
        primary: "px-4 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-medium rounded transition-colors flex items-center gap-2",
        secondary: "px-4 py-1.5 bg-[#30363d] hover:bg-[#3c3c3c] text-white text-sm font-medium rounded transition-colors"
    },
    emptyState: "text-xs text-[#8b949e] italic px-2"
};

interface CreateBlockDialogProps {
    isOpen: boolean;
    onClose: () => void;
    currentPatch: any; // Using any for now to avoid strict PatchGraph vs internal types mismatch if any
    selectedBlockIds: string[];
}

export const CreateBlockDialog: React.FC<CreateBlockDialogProps> = ({
    isOpen,
    onClose,
    currentPatch,
    selectedBlockIds
}) => {
    const addCustomBlock = useCustomBlockStore(state => state.addCustomBlock);
    const hasCustomBlock = useCustomBlockStore(state => state.hasCustomBlock);

    const [name, setName] = useState('New Block');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<string>(BlockCategory.CUSTOM);
    const [error, setError] = useState<string | null>(null);

    // Draft definition holding the detected ports/params
    const [draftBlock, setDraftBlock] = useState<CustomBlockDefinition | null>(null);

    // Selection state for exposure (IDs of exposed ports/params)
    const [exposedPortIds, setExposedPortIds] = useState<Set<string>>(new Set());
    const [exposedParamIds, setExposedParamIds] = useState<Set<string>>(new Set());

    // Generate draft on open
    useEffect(() => {
        if (isOpen && currentPatch && selectedBlockIds.length > 0) {
            // Filter patch to only selected blocks for the "internal patch"
            // But CustomBlockManager expects a full patch or subgraph.
            // For now, we assume currentPatch IS the graph we want to analyze
            // BUT technically we want to create a block from the SELECTION.
            // Implementation of CustomBlockManager.createCustomBlock uses the passed patch.
            // So we need to construct a sub-patch from selected blocks.

            // This is a simplification. Ideally CustomBlockManager should take selected IDs.
            // Let's manually construct the sub-patch here.

            const subBlocks = currentPatch.blocks.filter((b: any) => selectedBlockIds.includes(b.id));
            const subConnections = currentPatch.connections.filter((c: any) =>
                selectedBlockIds.includes(c.sourceBlockId) && selectedBlockIds.includes(c.targetBlockId)
            );

            const subPatch = {
                ...currentPatch,
                blocks: subBlocks,
                connections: subConnections
            };

            const metadata = {
                id: 'draft_id', // temporary
                displayName: name,
                description: description,
                category: category as BlockCategory
            };

            const draft = CustomBlockManager.createCustomBlock(subPatch, metadata);
            setDraftBlock(draft);

            // Default: select all detected exposed ports/params
            const initialPortIds = new Set(Object.keys(draft.exposedPorts));
            const initialParamIds = new Set(Object.keys(draft.exposedParameters));
            setExposedPortIds(initialPortIds);
            setExposedParamIds(initialParamIds);
        }
    }, [isOpen, selectedBlockIds, currentPatch]); // Dependencies need care to avoid loops

    const generateId = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    };

    const handleCreate = () => {
        if (!draftBlock) return;

        const id = generateId(name);

        if (hasCustomBlock(id) || BlockRegistry.has(id)) {
            setError(`Block ID '${id}' already exists. Please choose a unique name.`);
            return;
        }

        // Filter draft block based on user selection
        const finalExposedPorts: CustomBlockDefinition['exposedPorts'] = {};
        const finalPorts = draftBlock.ports.filter(p => exposedPortIds.has(p.id));

        finalPorts.forEach(p => {
            // Recover original mapping
            if (draftBlock.exposedPorts[p.id]) {
                finalExposedPorts[p.id] = draftBlock.exposedPorts[p.id];
            }
        });

        const finalExposedParams: CustomBlockDefinition['exposedParameters'] = {};
        const finalParams = draftBlock.parameters.filter(p => exposedParamIds.has(p.id));

        finalParams.forEach(p => {
            if (draftBlock.exposedParameters[p.id]) {
                finalExposedParams[p.id] = draftBlock.exposedParameters[p.id];
            }
        });

        const finalBlock: CustomBlockDefinition = {
            ...draftBlock,
            id,
            className: `Custom_${id}`, // Defines namespace
            displayName: name,
            description,
            category: category as BlockCategory,
            ports: finalPorts,
            parameters: finalParams,
            exposedPorts: finalExposedPorts,
            exposedParameters: finalExposedParams
        };

        addCustomBlock(finalBlock);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.dialog}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.title}>
                        <Box size={16} className="text-[#58a6ff]" />
                        Create Custom Block
                    </div>
                    <button onClick={onClose} className="text-[#8b949e] hover:text-white">
                        <X size={16} />
                    </button>
                </div>

                {/* Content */}
                <div className={styles.content}>
                    {error && (
                        <div className="bg-red-900/30 border border-red-800 text-red-200 px-3 py-2 rounded text-xs">
                            {error}
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Block Name</label>
                            <input
                                className={styles.input}
                                value={name}
                                onChange={e => {
                                    setName(e.target.value);
                                    setError(null);
                                }}
                                placeholder="My Custom Synth"
                                autoFocus
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Category</label>
                            <select
                                className={styles.select}
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                            >
                                <option value={BlockCategory.CUSTOM}>Custom</option>
                                <option value={BlockCategory.SOURCES}>Sources</option>
                                <option value={BlockCategory.EFFECTS}>Effects</option>
                                <option value={BlockCategory.UTILITY}>Utility</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Description</label>
                        <input
                            className={styles.input}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Brief description of functionality..."
                        />
                    </div>

                    {/* Port Exposure */}
                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>Exposed Ports</div>
                        <div className={styles.checkboxList}>
                            {draftBlock?.ports.length === 0 && <div className={styles.emptyState}>No ports detected</div>}
                            {draftBlock?.ports.map(port => (
                                <label key={port.id} className={styles.checkboxItem}>
                                    <input
                                        type="checkbox"
                                        checked={exposedPortIds.has(port.id)}
                                        onChange={e => {
                                            const newSet = new Set(exposedPortIds);
                                            if (e.target.checked) newSet.add(port.id);
                                            else newSet.delete(port.id);
                                            setExposedPortIds(newSet);
                                        }}
                                        className="rounded bg-[#3c3c3c] border-[#30363d]"
                                    />
                                    <span className="text-xs text-white">{port.displayName}</span>
                                    <span className="text-[10px] text-[#8b949e] ml-auto uppercase">{port.direction}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Parameter Exposure */}
                    <div className={styles.section}>
                        <div className={styles.sectionTitle}>Exposed Parameters</div>
                        <div className={styles.checkboxList}>
                            {draftBlock?.parameters.length === 0 && <div className={styles.emptyState}>No parameters detected</div>}
                            {draftBlock?.parameters.map(param => (
                                <label key={param.id} className={styles.checkboxItem}>
                                    <input
                                        type="checkbox"
                                        checked={exposedParamIds.has(param.id)}
                                        onChange={e => {
                                            const newSet = new Set(exposedParamIds);
                                            if (e.target.checked) newSet.add(param.id);
                                            else newSet.delete(param.id);
                                            setExposedParamIds(newSet);
                                        }}
                                        className="rounded bg-[#3c3c3c] border-[#30363d]"
                                    />
                                    <span className="text-xs text-white">{param.displayName}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <button onClick={onClose} className={styles.button.secondary}>
                        Cancel
                    </button>
                    <button onClick={handleCreate} className={styles.button.primary}>
                        <Check size={16} />
                        Create Block
                    </button>
                </div>
            </div>
        </div>
    );
};
