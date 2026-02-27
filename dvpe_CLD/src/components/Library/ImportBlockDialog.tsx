/**
 * ImportBlockDialog Component
 * Dialog for importing .dvpe-block files with duplicate handling
 */

import React, { useCallback, useRef, useState } from 'react';
import { Upload, AlertTriangle, X, FileJson } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    ImportResult,
    DuplicateResolution
} from '@/stores/customBlockStore';

// ============================================================================
// TYPES
// ============================================================================

export interface ImportBlockDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (data: unknown, resolution?: DuplicateResolution) => ImportResult;
    onImportWithNewId?: (data: unknown, newId: string) => ImportResult;
}

interface ImportState {
    status: 'idle' | 'reading' | 'validating' | 'duplicate' | 'error' | 'success';
    error?: string;
    duplicateId?: string;
    fileName?: string;
    fileData?: unknown;
    importedBlockId?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const ImportBlockDialog: React.FC<ImportBlockDialogProps> = ({
    isOpen,
    onClose,
    onImport,
    onImportWithNewId,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importState, setImportState] = useState<ImportState>({ status: 'idle' });
    const [newIdInput, setNewIdInput] = useState('');

    // Reset state when dialog closes
    const handleClose = useCallback(() => {
        setImportState({ status: 'idle' });
        setNewIdInput('');
        onClose();
    }, [onClose]);

    // Handle file selection
    const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setImportState({ status: 'reading', fileName: file.name });

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            setImportState({ status: 'validating', fileName: file.name, fileData: data });

            // Attempt import without resolution first
            const result = onImport(data);

            if (result.success) {
                setImportState({
                    status: 'success',
                    fileName: file.name,
                    importedBlockId: result.blockId
                });
            } else if (result.duplicateId) {
                setImportState({
                    status: 'duplicate',
                    fileName: file.name,
                    fileData: data,
                    duplicateId: result.duplicateId,
                    error: result.error
                });
            } else {
                setImportState({
                    status: 'error',
                    fileName: file.name,
                    error: result.error || 'Unknown import error'
                });
            }
        } catch (err) {
            setImportState({
                status: 'error',
                fileName: file.name,
                error: err instanceof Error ? err.message : 'Failed to read file'
            });
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [onImport]);

    // Handle drag and drop
    const handleDrop = useCallback(async (event: React.DragEvent) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (!file) return;

        setImportState({ status: 'reading', fileName: file.name });

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            setImportState({ status: 'validating', fileName: file.name, fileData: data });

            const result = onImport(data);

            if (result.success) {
                setImportState({
                    status: 'success',
                    fileName: file.name,
                    importedBlockId: result.blockId
                });
            } else if (result.duplicateId) {
                setImportState({
                    status: 'duplicate',
                    fileName: file.name,
                    fileData: data,
                    duplicateId: result.duplicateId,
                    error: result.error
                });
            } else {
                setImportState({
                    status: 'error',
                    fileName: file.name,
                    error: result.error || 'Unknown import error'
                });
            }
        } catch (err) {
            setImportState({
                status: 'error',
                fileName: file.name,
                error: err instanceof Error ? err.message : 'Failed to read file'
            });
        }
    }, [onImport]);

    const handleDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
    }, []);

    // Handle duplicate resolution
    const handleReplace = useCallback(() => {
        if (importState.fileData) {
            const result = onImport(importState.fileData, 'replace');
            if (result.success) {
                setImportState(prev => ({
                    ...prev,
                    status: 'success',
                    importedBlockId: result.blockId
                }));
            } else {
                setImportState(prev => ({
                    ...prev,
                    status: 'error',
                    error: result.error || 'Replace failed'
                }));
            }
        }
    }, [importState.fileData, onImport]);

    const handleRename = useCallback(() => {
        if (!newIdInput.trim() || !importState.fileData || !onImportWithNewId) return;

        const result = onImportWithNewId(importState.fileData, newIdInput.trim());
        if (result.success) {
            setImportState(prev => ({
                ...prev,
                status: 'success',
                importedBlockId: result.blockId
            }));
        } else {
            setImportState(prev => ({
                ...prev,
                status: 'error',
                error: result.error || 'Rename failed'
            }));
        }
    }, [newIdInput, importState.fileData, onImportWithNewId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Dialog */}
            <div className="relative w-full max-w-md mx-4 bg-surface-primary rounded-xl border border-border shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-lg font-semibold text-text-primary">
                        Import Block
                    </h2>
                    <button
                        onClick={handleClose}
                        aria-label="Close"
                        className="p-1 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-tertiary transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Idle State - File Drop Zone */}
                    {importState.status === 'idle' && (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            className={cn(
                                'border-2 border-dashed border-border rounded-xl',
                                'p-8 text-center cursor-pointer',
                                'hover:border-audio-primary/50 hover:bg-surface-tertiary/50',
                                'transition-colors duration-200'
                            )}
                        >
                            <Upload className="w-12 h-12 mx-auto text-text-tertiary mb-4" />
                            <p className="text-text-primary font-medium mb-2">
                                Drop a .dvpe-block file here
                            </p>
                            <p className="text-text-tertiary text-sm mb-4">
                                or click to browse
                            </p>
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-tertiary text-text-secondary text-sm">
                                <FileJson className="w-4 h-4" />
                                Select File
                            </span>
                        </div>
                    )}

                    {/* Reading State */}
                    {importState.status === 'reading' && (
                        <div className="text-center py-8">
                            <div className="animate-spin w-8 h-8 border-2 border-audio-primary border-t-transparent rounded-full mx-auto mb-4" />
                            <p className="text-text-primary">Reading file...</p>
                            <p className="text-text-tertiary text-sm">{importState.fileName}</p>
                        </div>
                    )}

                    {/* Validating State */}
                    {importState.status === 'validating' && (
                        <div className="text-center py-8">
                            <div className="animate-spin w-8 h-8 border-2 border-audio-primary border-t-transparent rounded-full mx-auto mb-4" />
                            <p className="text-text-primary">Validating block...</p>
                        </div>
                    )}

                    {/* Duplicate State */}
                    {importState.status === 'duplicate' && (
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-amber-200 font-medium">Duplicate Block ID</p>
                                    <p className="text-amber-200/70 text-sm">
                                        A block with ID "{importState.duplicateId}" already exists.
                                    </p>
                                </div>
                            </div>

                            {/* Rename Option */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary">
                                    Import with new ID:
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newIdInput}
                                        onChange={(e) => setNewIdInput(e.target.value)}
                                        placeholder="Enter new block ID"
                                        className={cn(
                                            'flex-1 px-3 py-2 rounded-lg',
                                            'bg-surface-tertiary border border-border',
                                            'text-text-primary placeholder-text-tertiary',
                                            'focus:outline-none focus:ring-2 focus:ring-audio-primary/50'
                                        )}
                                    />
                                    <button
                                        onClick={handleRename}
                                        disabled={!newIdInput.trim()}
                                        className={cn(
                                            'px-4 py-2 rounded-lg font-medium',
                                            'bg-audio-primary text-white',
                                            'disabled:opacity-50 disabled:cursor-not-allowed',
                                            'hover:bg-audio-primary/90 transition-colors'
                                        )}
                                    >
                                        Import
                                    </button>
                                </div>
                            </div>

                            {/* Replace Option */}
                            <div className="pt-2 border-t border-border">
                                <button
                                    onClick={handleReplace}
                                    className={cn(
                                        'w-full px-4 py-2 rounded-lg font-medium',
                                        'border border-border text-text-primary',
                                        'hover:bg-surface-tertiary transition-colors'
                                    )}
                                >
                                    Replace Existing Block
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {importState.status === 'error' && (
                        <div className="text-center py-4">
                            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                                <X className="w-6 h-6 text-red-400" />
                            </div>
                            <p className="text-red-400 font-medium mb-2">Import Failed</p>
                            <p className="text-text-tertiary text-sm">{importState.error}</p>
                            <button
                                onClick={() => setImportState({ status: 'idle' })}
                                className="mt-4 px-4 py-2 rounded-lg bg-surface-tertiary text-text-primary hover:bg-surface-tertiary/80 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Success State */}
                    {importState.status === 'success' && (
                        <div className="text-center py-4">
                            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                                <FileJson className="w-6 h-6 text-green-400" />
                            </div>
                            <p className="text-green-400 font-medium mb-2">Import Successful</p>
                            <p className="text-text-tertiary text-sm">
                                Block "{importState.importedBlockId}" has been added to your library.
                            </p>
                            <button
                                onClick={handleClose}
                                className="mt-4 px-4 py-2 rounded-lg bg-audio-primary text-white hover:bg-audio-primary/90 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    )}

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".dvpe-block,.json"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>
            </div>
        </div>
    );
};

export default ImportBlockDialog;
