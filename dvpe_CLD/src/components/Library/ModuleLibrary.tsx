/**
 * ModuleLibrary Component
 * Side panel showing available DSP blocks organized by category
 * Supports drag-to-canvas and search functionality
 */

import React, { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, GripVertical } from 'lucide-react';
import * as Icons from 'lucide-react';

import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores';
import { BlockRegistry } from '@/core/blocks/BlockRegistry';
import { BlockCategory, BlockColorScheme } from '@/types';

// ============================================================================
// CATEGORY STYLING
// ============================================================================

const getCategoryColor = (category: BlockCategory): string => {
  switch (category) {
    case BlockCategory.SOURCES:
      return 'text-audio-primary';
    case BlockCategory.FILTERS:
      return 'text-audio-primary';
    case BlockCategory.EFFECTS:
      return 'text-cv-primary';
    case BlockCategory.MODULATORS:
      return 'text-cv-primary';
    case BlockCategory.USER_IO:
      return 'text-user-primary';
    case BlockCategory.UTILITY:
      return 'text-logic-primary';
    default:
      return 'text-text-secondary';
  }
};

const getBlockSchemeColor = (scheme: BlockColorScheme): string => {
  switch (scheme) {
    case BlockColorScheme.AUDIO:
      return 'border-audio-primary/30 hover:border-audio-primary/60 bg-audio-primary/5';
    case BlockColorScheme.CONTROL:
      return 'border-cv-primary/30 hover:border-cv-primary/60 bg-cv-primary/5';
    case BlockColorScheme.USER:
      return 'border-user-primary/30 hover:border-user-primary/60 bg-user-primary/5';
    case BlockColorScheme.LOGIC:
      return 'border-logic-primary/30 hover:border-logic-primary/60 bg-logic-primary/5';
    default:
      return 'border-border hover:border-border/80 bg-surface-tertiary';
  }
};

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
}

const BlockItem: React.FC<BlockItemProps> = ({
  id,
  displayName,
  // className - passed but unused, the block's DaisySP class name
  description,
  icon,
  colorScheme,
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

      e.dataTransfer.setData('application/dvpe-block', id);
      e.dataTransfer.setData('text/plain', id); // Fallback for compatibility
      e.dataTransfer.effectAllowed = 'copyMove'; // Allow copy or move
    },
    [id]
  );

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={cn(
        'flex items-center gap-2 p-2 rounded-lg border cursor-grab active:cursor-grabbing',
        'transition-colors duration-150',
        getBlockSchemeColor(colorScheme)
      )}
    >
      {/* Drag Handle */}
      <GripVertical className="w-3 h-3 text-text-tertiary flex-shrink-0" />

      {/* Icon */}
      <div
        className={cn(
          'w-8 h-8 rounded flex items-center justify-center flex-shrink-0',
          colorScheme === BlockColorScheme.AUDIO && 'bg-audio-primary/20 text-audio-primary',
          colorScheme === BlockColorScheme.CONTROL && 'bg-cv-primary/20 text-cv-primary',
          colorScheme === BlockColorScheme.USER && 'bg-user-primary/20 text-user-primary',
          colorScheme === BlockColorScheme.LOGIC && 'bg-logic-primary/20 text-logic-primary'
        )}
      >
        <IconComponent className="w-4 h-4" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-text-primary truncate">
          {displayName}
        </div>
        <div className="text-xs text-text-tertiary truncate">{description}</div>
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
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  blocks,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-2">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 w-full px-3 py-2 rounded-lg',
          'text-sm font-medium transition-colors',
          'hover:bg-surface-tertiary/50',
          getCategoryColor(category)
        )}
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

  // Get all blocks grouped by category
  const blocksByCategory = useMemo(() => {
    const categories = BlockRegistry.getCategories();
    const grouped = new Map<BlockCategory, ReturnType<typeof BlockRegistry.getAll>>();

    for (const category of categories) {
      grouped.set(category, BlockRegistry.getByCategory(category));
    }

    return grouped;
  }, []);

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

  // Handle search input
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  if (!panels.library?.visible) return null;

  return (
    <div
      className={cn(
        'w-full h-full border-r border-border bg-surface-secondary',
        'flex flex-col overflow-hidden'
      )}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-surface-primary">
        <h2 className="font-semibold text-text-primary mb-2">Modules</h2>

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
        {Array.from(filteredBlocks.entries()).map(([category, blocks]) =>
          blocks.length > 0 ? (
            <CategorySection
              key={category}
              category={category}
              blocks={blocks}
              defaultOpen={!searchQuery}
            />
          ) : null
        )}

        {/* Empty state */}
        {Array.from(filteredBlocks.values()).every((b) => b.length === 0) && (
          <div className="text-center py-8 text-text-tertiary text-sm">
            No modules match "{searchQuery}"
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2 border-t border-border bg-surface-primary text-xs text-text-tertiary">
        Drag modules to the canvas to add them
      </div>
    </div>
  );
};

export default ModuleLibrary;
