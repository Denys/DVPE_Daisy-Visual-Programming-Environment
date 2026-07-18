/**
 * ModuleLibrary Component
 * Side panel showing available DSP blocks organized by category
 * Supports drag-to-canvas and search functionality
 * Includes custom block management (export, import, duplicate, delete)
 */

import React, { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, GripVertical, Upload, Sparkles, Boxes } from 'lucide-react';
import * as Icons from 'lucide-react';

import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores';
import { useCustomBlockStore } from '@/stores/customBlockStore';
import { BlockRegistry } from '@/core/blocks/BlockRegistry';
import { BlockCategory, BlockColorScheme, BlockDefinition } from '@/types';
import { BlockContextMenu, ContextMenuAction } from './BlockContextMenu';
import { ImportBlockDialog } from './ImportBlockDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { CustomBlockEditorModal } from '@/components/Canvas/CustomBlockEditorModal';
import { getGlassNeonColor } from '@/components/Canvas/BlockNode';
import {
  DVPE_BLOCK_DRAG_TYPE,
  DVPE_POLY_VOICE_BLANKET_DRAG_TYPE,
  DVPE_POLY_VOICE_BLANKET_PAYLOAD,
} from '@/components/Canvas/dragTypes';

// ============================================================================
// CATEGORY STYLING
// ============================================================================

// ============================================================================
// BLOCK ITEM COMPONENT
// ============================================================================

interface BlockItemProps {
  id: string;
  displayName: string;
  className: string;
  description: string;
  icon?: string;
  colorScheme: BlockColorScheme;
  category: BlockCategory;
  isCustom?: boolean;
  onContextMenu?: (e: React.MouseEvent, id: string, name: string) => void;
}

const BlockItem: React.FC<BlockItemProps> = ({
  id,
  displayName,
  // className - passed but unused, the block's DaisySP class name
  description,
  icon,
  colorScheme,
  category,
  isCustom = false,
  onContextMenu,
}) => {
  // Get icon component - use any for dynamic icon lookup from lucide-react
  const IconComponent = useMemo(() => {
    if (!icon) return Icons.Box;
    return ((Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[icon]) || Icons.Box;
  }, [icon]);

  // Handle drag start
  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      console.log('Drag start:', id);
      useUIStore.getState().setDraggingBlock(id);

      e.dataTransfer.setData(DVPE_BLOCK_DRAG_TYPE, id);
      e.dataTransfer.setData('text/plain', id); // Fallback for compatibility
      e.dataTransfer.effectAllowed = 'copyMove'; // Allow copy or move
    },
    [id]
  );

  // Handle context menu (right-click)
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (isCustom && onContextMenu) {
      e.preventDefault();
      onContextMenu(e, id, displayName);
    }
  }, [isCustom, onContextMenu, id, displayName]);

  const neonColor = useMemo(() => getGlassNeonColor(colorScheme, category), [colorScheme, category]);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onContextMenu={handleContextMenu}
      className={cn(
        'group flex items-center gap-2 p-2 rounded-lg border cursor-grab active:cursor-grabbing',
        'transition-colors duration-150',
        'hover:bg-white/10',
        isCustom && 'ring-1 ring-amber-500/30'
      )}
      style={{
        borderColor: `${neonColor}40`,
        backgroundColor: `${neonColor}1a`
      }}
    >
      {/* Drag Handle */}
      <GripVertical className="w-3 h-3 text-text-tertiary flex-shrink-0" />

      {/* Icon */}
      <div
        className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
        style={{
          backgroundColor: `${neonColor}33`,
          color: neonColor
        }}
      >
        <IconComponent className="w-4 h-4" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-text-primary truncate">
            {displayName}
          </span>
          {isCustom && (
            <span title="Custom Block">
              <Sparkles className="w-3 h-3 text-amber-400 flex-shrink-0" />
            </span>
          )}
        </div>
        <div className="text-xs text-text-tertiary truncate">
          {isCustom ? 'Custom • ' : ''}{description}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// CANVAS DIRECTIVE ITEM COMPONENT
// ============================================================================

const PolyVoiceBlanketItem: React.FC = () => {
  const handleDragStart = useCallback((e: React.DragEvent) => {
    useUIStore.getState().setDraggingBlock(DVPE_POLY_VOICE_BLANKET_PAYLOAD);

    e.dataTransfer.setData(DVPE_POLY_VOICE_BLANKET_DRAG_TYPE, DVPE_POLY_VOICE_BLANKET_PAYLOAD);
    e.dataTransfer.setData('text/plain', DVPE_POLY_VOICE_BLANKET_PAYLOAD);
    e.dataTransfer.effectAllowed = 'copyMove';
  }, []);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={cn(
        'group flex items-center gap-2 p-2 rounded-lg border cursor-grab active:cursor-grabbing',
        'transition-colors duration-150 hover:bg-amber-400/10'
      )}
      style={{
        borderColor: 'rgba(245, 158, 11, 0.45)',
        backgroundColor: 'rgba(245, 158, 11, 0.12)',
      }}
    >
      <GripVertical className="w-3 h-3 text-text-tertiary flex-shrink-0" />

      <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 bg-amber-400/20 text-amber-300">
        <Boxes className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-text-primary truncate">
            POLY VOICE BLANKET
          </span>
        </div>
        <div className="text-xs text-text-tertiary truncate">
          Canvas directive for visible poly voice templates
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// CATEGORY SECTION COMPONENT
// ============================================================================

interface CategorySectionProps {
  category: BlockCategory;
  blocks: ReturnType<typeof BlockRegistry.getAll>;
  defaultOpen?: boolean;
  customBlockIds: Set<string>;
  onBlockContextMenu?: (e: React.MouseEvent, id: string, name: string) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  blocks,
  defaultOpen = true,
  customBlockIds,
  onBlockContextMenu,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const neonColor = useMemo(() => getGlassNeonColor(BlockColorScheme.AUDIO, category), [category]);

  return (
    <div className="mb-2">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-[#0f172a]/40',
          'text-sm font-bold tracking-wide transition-colors',
          'hover:bg-[#0f172a]/80'
        )}
        style={{ color: neonColor, borderLeft: `3px solid ${neonColor}80` }}
      >
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.span>
        <span>{category}</span>
        <span className="text-xs text-text-tertiary ml-auto">
          {blocks.length}
        </span>
      </button>

      {/* Items */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-1.5 pt-1.5 pb-2">
              {blocks.map((block) => (
                <BlockItem
                  key={block.id}
                  id={block.id}
                  displayName={block.displayName}
                  className={block.className}
                  description={block.description}
                  icon={block.icon}
                  colorScheme={block.colorScheme}
                  category={block.category}
                  isCustom={customBlockIds.has(block.id)}
                  onContextMenu={onBlockContextMenu}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// MODULE LIBRARY COMPONENT
// ============================================================================

const ModuleLibrary: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const panels = useUIStore((state) => state.panels);

  // Use custom blocks store
  const customBlocks = useCustomBlockStore((state) => state.customBlocks);
  const customBlockIds = useMemo(() => new Set(Object.keys(customBlocks)), [customBlocks]);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    blockId: string;
    blockName: string;
  }>({ isOpen: false, position: { x: 0, y: 0 }, blockId: '', blockName: '' });

  // Dialog states
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Custom block editor state
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

  // Store actions
  const exportBlockToFile = useCustomBlockStore((state) => state.exportBlockToFile);
  const duplicateBlock = useCustomBlockStore((state) => state.duplicateBlock);
  const removeCustomBlock = useCustomBlockStore((state) => state.removeCustomBlock);
  const importBlock = useCustomBlockStore((state) => state.importBlock);

  // Get all blocks grouped by category
  const blocksByCategory = useMemo(() => {
    const categories = BlockRegistry.getCategories();
    const grouped = new Map<BlockCategory, ReturnType<typeof BlockRegistry.getAll>>();

    for (const category of categories) {
      grouped.set(category, BlockRegistry.getByCategory(category));
    }

    return grouped;
  }, [customBlocks]);

  // Filter blocks by search query
  const filteredBlocks = useMemo(() => {
    if (!searchQuery.trim()) return blocksByCategory;

    const results = BlockRegistry.search(searchQuery);
    const grouped = new Map<BlockCategory, typeof results>();

    for (const block of results) {
      const existing = grouped.get(block.category) || [];
      grouped.set(block.category, [...existing, block]);
    }

    return grouped;
  }, [searchQuery, blocksByCategory]);

  const showCanvasDirectives = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return ['poly voice blanket', 'poly', 'voice', 'blanket', 'directive'].some((term) =>
      term.includes(query)
    );
  }, [searchQuery]);

  // Handle search input
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  // Handle block context menu (right-click)
  const handleBlockContextMenu = useCallback((e: React.MouseEvent, id: string, name: string) => {
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      blockId: id,
      blockName: name,
    });
  }, []);

  // Handle context menu action
  const handleContextMenuAction = useCallback((action: ContextMenuAction['id']) => {
    const { blockId, blockName } = contextMenu;

    switch (action) {
      case 'edit':
        setEditingBlockId(blockId);
        break;

      case 'duplicate':
        duplicateBlock(blockId);
        break;

      case 'export':
        exportBlockToFile(blockId);
        break;

      case 'delete':
        setDeleteTarget({ id: blockId, name: blockName });
        setIsDeleteOpen(true);
        break;
    }

    setContextMenu(prev => ({ ...prev, isOpen: false }));
  }, [contextMenu, duplicateBlock, exportBlockToFile]);

  // Handle delete confirmation
  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget) {
      removeCustomBlock(deleteTarget.id);
      setDeleteTarget(null);
      setIsDeleteOpen(false);
    }
  }, [deleteTarget, removeCustomBlock]);

  // Handle import with new ID (for duplicate resolution)
  const handleImportWithNewId = useCallback((data: unknown, newId: string): ReturnType<typeof importBlock> => {
    // Modify the data with new ID before importing
    const modifiedData = JSON.parse(JSON.stringify(data)) as { block: BlockDefinition };
    modifiedData.block.id = newId;
    modifiedData.block.displayName = `${modifiedData.block.displayName} (Imported)`;
    return importBlock(modifiedData, 'replace');
  }, [importBlock]);

  if (!panels.library?.visible) return null;

  return (
    <>
      <div
        className={cn(
          'w-full h-full border-r border-border bg-surface-secondary',
          'flex flex-col overflow-hidden'
        )}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-border bg-surface-primary">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-text-primary">Modules</h2>
            <button
              onClick={() => setIsImportOpen(true)}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs',
                'bg-surface-tertiary text-text-secondary',
                'hover:bg-audio-primary/20 hover:text-audio-primary',
                'transition-colors'
              )}
              title="Import .dvpe-block file"
            >
              <Upload className="w-3.5 h-3.5" />
              Import
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search modules..."
              value={searchQuery}
              onChange={handleSearchChange}
              className={cn(
                'w-full pl-8 pr-3 py-1.5 rounded',
                'bg-surface-tertiary border border-border',
                'text-sm text-text-primary placeholder-text-tertiary',
                'focus:outline-none focus:ring-2 focus:ring-audio-primary/50'
              )}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex-1 overflow-y-auto p-2">
          {showCanvasDirectives && (
            <div className="mb-2">
              <button
                className={cn(
                  'flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-[#0f172a]/40',
                  'text-sm font-bold tracking-wide transition-colors',
                  'hover:bg-[#0f172a]/80'
                )}
                style={{ color: '#f59e0b', borderLeft: '3px solid rgba(245, 158, 11, 0.5)' }}
              >
                <ChevronDown className="w-4 h-4" />
                <span>Canvas Directives</span>
                <span className="text-xs text-text-tertiary ml-auto">1</span>
              </button>
              <div className="space-y-1.5 pt-1.5 pb-2">
                <PolyVoiceBlanketItem />
              </div>
            </div>
          )}

          {Array.from(filteredBlocks.entries()).map(([category, blocks]) =>
            blocks.length > 0 ? (
              <CategorySection
                key={category}
                category={category}
                blocks={blocks}
                defaultOpen={!searchQuery}
                customBlockIds={customBlockIds}
                onBlockContextMenu={handleBlockContextMenu}
              />
            ) : null
          )}

          {/* Empty state */}
          {Array.from(filteredBlocks.values()).every((b) => b.length === 0) && (
            <div className="text-center py-8 text-text-tertiary text-sm">
              No modules match &quot;{searchQuery}&quot;
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-border bg-surface-primary text-xs text-text-tertiary">
          Drag modules to the canvas to add them
          <span className="mx-1">•</span>
          Right-click custom blocks for options
        </div>
      </div>

      {/* Context Menu */}
      <BlockContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        blockId={contextMenu.blockId}
        blockName={contextMenu.blockName}
        onAction={handleContextMenuAction}
        onClose={() => setContextMenu(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Import Dialog */}
      <ImportBlockDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={importBlock}
        onImportWithNewId={handleImportWithNewId}
      />

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <DeleteConfirmDialog
          isOpen={isDeleteOpen}
          blockName={deleteTarget.name}
          blockId={deleteTarget.id}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setIsDeleteOpen(false);
            setDeleteTarget(null);
          }}
        />
      )}

      {/* Custom Block Nested Editor */}
      <CustomBlockEditorModal
        blockDefinitionId={editingBlockId}
        onClose={() => setEditingBlockId(null)}
      />
    </>
  );
};

export default ModuleLibrary;
