/**
 * AlignmentToolbar Component
 * Floating toolbar for block alignment and distribution operations
 * Appears when multiple blocks are selected
 */

import React, { memo } from 'react';
import { Panel } from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlignHorizontalJustifyStart,
    AlignHorizontalJustifyCenter,
    AlignHorizontalJustifyEnd,
    AlignVerticalJustifyStart,
    AlignVerticalJustifyCenter,
    AlignVerticalJustifyEnd,
    AlignHorizontalSpaceAround,
    AlignVerticalSpaceAround,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePatchStore } from '@/stores';

// ============================================================================
// TOOLBAR BUTTON COMPONENT
// ============================================================================

interface ToolbarButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    disabled?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
    icon,
    label,
    onClick,
    disabled = false,
}) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
            'w-7 h-7 rounded flex items-center justify-center',
            'bg-surface-tertiary text-text-secondary',
            'hover:bg-accent-primary/20 hover:text-accent-primary transition-colors',
            'focus:outline-none focus:ring-1 focus:ring-accent-primary/50',
            disabled && 'opacity-40 cursor-not-allowed hover:bg-surface-tertiary hover:text-text-secondary'
        )}
        aria-label={label}
        title={label}
    >
        {icon}
    </button>
);

// ============================================================================
// ALIGNMENT TOOLBAR COMPONENT
// ============================================================================

const AlignmentToolbar: React.FC = () => {
    const selectedBlockIds = usePatchStore((state) => state.selectedBlockIds);
    const alignBlocksLeft = usePatchStore((state) => state.alignBlocksLeft);
    const alignBlocksRight = usePatchStore((state) => state.alignBlocksRight);
    const alignBlocksCenterH = usePatchStore((state) => state.alignBlocksCenterH);
    const alignBlocksTop = usePatchStore((state) => state.alignBlocksTop);
    const alignBlocksBottom = usePatchStore((state) => state.alignBlocksBottom);
    const alignBlocksCenterV = usePatchStore((state) => state.alignBlocksCenterV);
    const distributeBlocksH = usePatchStore((state) => state.distributeBlocksH);
    const distributeBlocksV = usePatchStore((state) => state.distributeBlocksV);

    const showToolbar = selectedBlockIds.length >= 2;
    const canDistribute = selectedBlockIds.length >= 3;

    return (
        <AnimatePresence>
            {showToolbar && (
                <Panel position="top-center" className="mt-2">
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                            'flex items-center gap-1 px-2 py-1.5',
                            'bg-surface-secondary/95 backdrop-blur-sm rounded-lg',
                            'border border-border shadow-lg'
                        )}
                    >
                        {/* Horizontal Alignment */}
                        <div className="flex items-center gap-0.5">
                            <ToolbarButton
                                icon={<AlignHorizontalJustifyStart className="w-4 h-4" />}
                                label="Align Left"
                                onClick={alignBlocksLeft}
                            />
                            <ToolbarButton
                                icon={<AlignHorizontalJustifyCenter className="w-4 h-4" />}
                                label="Align Center Horizontal"
                                onClick={alignBlocksCenterH}
                            />
                            <ToolbarButton
                                icon={<AlignHorizontalJustifyEnd className="w-4 h-4" />}
                                label="Align Right"
                                onClick={alignBlocksRight}
                            />
                        </div>

                        {/* Divider */}
                        <div className="w-px h-5 bg-border mx-1" />

                        {/* Vertical Alignment */}
                        <div className="flex items-center gap-0.5">
                            <ToolbarButton
                                icon={<AlignVerticalJustifyStart className="w-4 h-4" />}
                                label="Align Top"
                                onClick={alignBlocksTop}
                            />
                            <ToolbarButton
                                icon={<AlignVerticalJustifyCenter className="w-4 h-4" />}
                                label="Align Center Vertical"
                                onClick={alignBlocksCenterV}
                            />
                            <ToolbarButton
                                icon={<AlignVerticalJustifyEnd className="w-4 h-4" />}
                                label="Align Bottom"
                                onClick={alignBlocksBottom}
                            />
                        </div>

                        {/* Divider */}
                        <div className="w-px h-5 bg-border mx-1" />

                        {/* Distribution */}
                        <div className="flex items-center gap-0.5">
                            <ToolbarButton
                                icon={<AlignHorizontalSpaceAround className="w-4 h-4" />}
                                label="Distribute Horizontally"
                                onClick={distributeBlocksH}
                                disabled={!canDistribute}
                            />
                            <ToolbarButton
                                icon={<AlignVerticalSpaceAround className="w-4 h-4" />}
                                label="Distribute Vertically"
                                onClick={distributeBlocksV}
                                disabled={!canDistribute}
                            />
                        </div>

                        {/* Selection count badge */}
                        <div className="ml-1 px-1.5 py-0.5 bg-accent-primary/20 rounded text-[10px] text-accent-primary font-medium">
                            {selectedBlockIds.length}
                        </div>
                    </motion.div>
                </Panel>
            )}
        </AnimatePresence>
    );
};

export default memo(AlignmentToolbar);
