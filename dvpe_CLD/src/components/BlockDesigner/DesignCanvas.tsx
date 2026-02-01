/**
 * DesignCanvas - Central drop zone for UI layout design
 * Phase 13.2: Visual UI Builder
 * 
 * Features:
 * - Drop zone for elements from library
 * - Grid overlay for alignment
 * - Zoom/pan support
 * - Element selection and manipulation
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DraggableElement } from './DraggableElement';
import { UIElement } from '../../types/uiElement';

// CanvasElement is a UIElement - use the real type
type CanvasElement = UIElement;

interface DesignCanvasProps {
    elements: CanvasElement[];
    selectedIds: string[];
    zoom: number;
    gridSize?: number;
    showGrid?: boolean;
    blockSize?: { width: number; height: number };
    onElementAdd?: (element: Omit<CanvasElement, 'id'>) => void;
    onElementUpdate?: (id: string, updates: Partial<CanvasElement>) => void;
    onElementDelete?: (id: string) => void;
    onSelectionChange?: (ids: string[]) => void;
    onCursorMove?: (position: { x: number; y: number }) => void;
}

export const DesignCanvas: React.FC<DesignCanvasProps> = ({
    elements,
    selectedIds,
    zoom,
    gridSize = 10,
    showGrid = true,
    blockSize = { width: 240, height: 160 },
    onElementAdd,
    onElementUpdate,
    onElementDelete,
    onSelectionChange,
    onCursorMove,
}) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);

    // Snap position to grid
    const snapToGrid = useCallback((value: number) => {
        return Math.round(value / gridSize) * gridSize;
    }, [gridSize]);

    // Handle element drop from library
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        setIsDragOver(true);

        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
            const x = snapToGrid((e.clientX - rect.left) / (zoom / 100));
            const y = snapToGrid((e.clientY - rect.top) / (zoom / 100));
            setDragPosition({ x, y });
        }
    }, [zoom, snapToGrid]);

    const handleDragLeave = useCallback(() => {
        setIsDragOver(false);
        setDragPosition(null);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        setDragPosition(null);

        const data = e.dataTransfer.getData('application/dvpe-element');
        if (!data) return;

        try {
            const elementData = JSON.parse(data);
            const rect = canvasRef.current?.getBoundingClientRect();

            if (rect && onElementAdd) {
                const x = snapToGrid((e.clientX - rect.left) / (zoom / 100) - elementData.defaultSize.width / 2);
                const y = snapToGrid((e.clientY - rect.top) / (zoom / 100) - elementData.defaultSize.height / 2);

                onElementAdd({
                    type: elementData.type,
                    position: { x, y },
                    size: elementData.defaultSize,
                    rotation: 0,
                    config: {},
                    label: elementData.name,
                });
            }
        } catch (err) {
            console.error('Failed to parse dropped element:', err);
        }
    }, [zoom, snapToGrid, onElementAdd]);

    // Track mouse position
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect && onCursorMove) {
            const x = Math.round((e.clientX - rect.left) / (zoom / 100));
            const y = Math.round((e.clientY - rect.top) / (zoom / 100));
            onCursorMove({ x, y });
        }
    }, [zoom, onCursorMove]);

    // Handle canvas click (deselect)
    const handleCanvasClick = useCallback((e: React.MouseEvent) => {
        if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('block-frame')) {
            onSelectionChange?.([]);
        }
    }, [onSelectionChange]);

    // Handle element selection
    const handleElementSelect = useCallback((id: string, addToSelection: boolean) => {
        if (addToSelection) {
            // Toggle in selection
            if (selectedIds.includes(id)) {
                onSelectionChange?.(selectedIds.filter(s => s !== id));
            } else {
                onSelectionChange?.([...selectedIds, id]);
            }
        } else {
            onSelectionChange?.([id]);
        }
    }, [selectedIds, onSelectionChange]);

    // Handle element move
    const handleElementMove = useCallback((id: string, delta: { x: number; y: number }) => {
        const element = elements.find(el => el.id === id);
        if (element && onElementUpdate) {
            onElementUpdate(id, {
                position: {
                    x: snapToGrid(element.position.x + delta.x),
                    y: snapToGrid(element.position.y + delta.y),
                },
            });
        }
    }, [elements, snapToGrid, onElementUpdate]);

    // Handle element resize
    const handleElementResize = useCallback((id: string, size: { width: number; height: number }) => {
        if (onElementUpdate) {
            onElementUpdate(id, {
                size: {
                    width: snapToGrid(size.width),
                    height: snapToGrid(size.height),
                },
            });
        }
    }, [snapToGrid, onElementUpdate]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                selectedIds.forEach(id => onElementDelete?.(id));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIds, onElementDelete]);

    return (
        <div
            className={`design-canvas ${isDragOver ? 'drag-over' : ''}`}
            onMouseMove={handleMouseMove}
            onClick={handleCanvasClick}
        >
            <div
                ref={canvasRef}
                className="canvas-content"
                style={{ transform: `scale(${zoom / 100})` }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {/* Block frame */}
                <div
                    className="block-frame"
                    style={{ width: blockSize.width, height: blockSize.height }}
                >
                    {elements.length === 0 && !isDragOver && (
                        <span className="block-placeholder">Drop elements here</span>
                    )}

                    {/* Rendered elements */}
                    {elements.map(element => (
                        <DraggableElement
                            key={element.id}
                            element={element}
                            isSelected={selectedIds.includes(element.id)}
                            onSelect={(addToSelection) => handleElementSelect(element.id, addToSelection)}
                            onMove={(delta) => handleElementMove(element.id, delta)}
                            onResize={(size) => handleElementResize(element.id, size)}
                        />
                    ))}

                    {/* Drop indicator */}
                    {isDragOver && dragPosition && (
                        <div
                            className="drop-indicator"
                            style={{
                                left: dragPosition.x,
                                top: dragPosition.y,
                            }}
                        />
                    )}
                </div>
            </div>

            {/* Grid overlay */}
            {showGrid && (
                <div
                    className="canvas-grid-overlay"
                    style={{
                        backgroundSize: `${gridSize * (zoom / 100)}px ${gridSize * (zoom / 100)}px`,
                    }}
                />
            )}
        </div>
    );
};

export type { CanvasElement };
