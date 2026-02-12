/**
 * BlockContextMenu Component
 * Context menu for custom blocks in the library palette
 * Provides Edit, Duplicate, Export, Delete actions
 */

import React, { useCallback, useRef, useEffect } from 'react';
import {
    Edit3,
    Copy,
    Download,
    Trash2,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface ContextMenuAction {
    id: 'edit' | 'duplicate' | 'export' | 'delete';
    label: string;
    icon: React.ReactNode;
    variant?: 'default' | 'danger';
}

export interface BlockContextMenuProps {
    isOpen: boolean;
    position: { x: number; y: number };
    blockId: string;
    blockName: string;
    onAction: (action: ContextMenuAction['id']) => void;
    onClose: () => void;
}

// ============================================================================
// MENU ITEMS CONFIGURATION
// ============================================================================

const MENU_ITEMS: ContextMenuAction[] = [
    { id: 'edit', label: 'Edit', icon: <Edit3 className="w-4 h-4" />, variant: 'default' },
    { id: 'duplicate', label: 'Duplicate', icon: <Copy className="w-4 h-4" />, variant: 'default' },
    { id: 'export', label: 'Export as .dvpe-block', icon: <Download className="w-4 h-4" />, variant: 'default' },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="w-4 h-4" />, variant: 'danger' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export const BlockContextMenu: React.FC<BlockContextMenuProps> = ({
    isOpen,
    position,
    blockId,
    blockName,
    onAction,
    onClose,
}) => {
    const menuRef = useRef<HTMLDivElement>(null);

    // Handle click outside to close
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    // Handle action click
    const handleAction = useCallback((actionId: ContextMenuAction['id']) => {
        onAction(actionId);
        onClose();
    }, [onAction, onClose]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            />

            {/* Menu */}
            <div
                ref={menuRef}
                className={cn(
                    'fixed z-50 w-56 rounded-lg border border-border',
                    'bg-surface-primary shadow-lg shadow-black/20',
                    'py-1 animate-in fade-in zoom-in-95 duration-100'
                )}
                style={{
                    left: position.x,
                    top: position.y,
                }}
            >
                {/* Header */}
                <div className="px-3 py-2 border-b border-border/50">
                    <div className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
                        Custom Block
                    </div>
                    <div className="text-sm font-semibold text-text-primary truncate">
                        {blockName}
                    </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                    {MENU_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleAction(item.id)}
                            className={cn(
                                'w-full flex items-center gap-3 px-3 py-2 text-sm',
                                'transition-colors duration-100',
                                item.variant === 'danger'
                                    ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                                    : 'text-text-primary hover:bg-surface-tertiary'
                            )}
                        >
                            <span className={cn(
                                'flex-shrink-0',
                                item.variant === 'danger' ? 'text-red-400' : 'text-text-secondary'
                            )}>
                                {item.icon}
                            </span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
};

export default BlockContextMenu;
