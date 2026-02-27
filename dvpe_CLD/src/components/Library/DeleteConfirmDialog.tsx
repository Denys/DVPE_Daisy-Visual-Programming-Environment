/**
 * DeleteConfirmDialog Component
 * Confirmation dialog for deleting custom blocks
 */

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface DeleteConfirmDialogProps {
    isOpen: boolean;
    blockName: string;
    blockId: string;
    onConfirm: () => void;
    onCancel: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
    isOpen,
    blockName,
    blockId,
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Dialog */}
            <div className="relative w-full max-w-md mx-4 bg-surface-primary rounded-xl border border-border shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-lg font-semibold text-text-primary">
                        Delete Block
                    </h2>
                    <button
                        onClick={onCancel}
                        aria-label="Close"
                        className="p-1 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-tertiary transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-6 h-6 text-red-400" />
                        </div>
                        <div>
                            <p className="text-text-primary font-medium mb-2">
                                Are you sure you want to delete this block?
                            </p>
                            <p className="text-text-secondary text-sm mb-4">
                                <span className="font-medium">{blockName}</span>
                                <span className="text-text-tertiary ml-2">({blockId})</span>
                            </p>
                            <p className="text-text-tertiary text-sm">
                                This action cannot be undone. Any instances of this block
                                on the canvas will become invalid.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-surface-secondary/50 rounded-b-xl">
                    <button
                        onClick={onCancel}
                        className={cn(
                            'px-4 py-2 rounded-lg font-medium',
                            'text-text-secondary hover:text-text-primary',
                            'hover:bg-surface-tertiary transition-colors'
                        )}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={cn(
                            'px-4 py-2 rounded-lg font-medium',
                            'bg-red-500 text-white',
                            'hover:bg-red-600 transition-colors'
                        )}
                    >
                        Delete Block
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmDialog;
