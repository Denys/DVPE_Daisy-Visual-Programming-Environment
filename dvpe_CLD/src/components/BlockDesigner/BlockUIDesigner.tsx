/**
 * BlockUIDesigner - Main container for the Visual UI Builder
 * Phase 13.2: Custom Block Visual Layout Designer
 * 
 * Provides a 3-panel layout:
 * - Left: Element Library (draggable UI elements)
 * - Center: Design Canvas (drop zone for block layout)
 * - Right: Inspector Panel (property editor)
 * 
 * Uses Zustand store for state management (Agent A Day 5 integration)
 */

import React, { useCallback, useEffect, useState } from 'react';
import { DesignerToolbar } from './DesignerToolbar';
import { DesignerStatusBar } from './DesignerStatusBar';
import { ElementLibraryPanel } from './ElementLibraryPanel';
import { DesignCanvas } from './DesignCanvas';
import { InspectorPanel } from './InspectorPanel';
import { UIElement } from '../../types/uiElement';
import {
    useBlockDesignerStore,
    selectElements,
    selectSelectedIds,
    selectSelectedElements,
    selectView
} from '../../stores/blockDesignerStore';
import './BlockUIDesigner.css';

interface BlockUIDesignerProps {
    blockId?: string;
    blockName?: string;
    onSave?: (elements: UIElement[]) => void;
    onCancel?: () => void;
    availableParameters?: Array<{
        blockId: string;
        blockName: string;
        parameterId: string;
        parameterName: string;
        cppSetter: string;
    }>;
}

export const BlockUIDesigner: React.FC<BlockUIDesignerProps> = ({
    blockId,
    blockName: _blockName = 'Custom Block',
    onSave: _onSave,
    onCancel: _onCancel,
    availableParameters = [],
}) => {
    // === Zustand Store State ===
    const elements = useBlockDesignerStore(selectElements);
    const selectedIds = useBlockDesignerStore(selectSelectedIds);
    const selectedElements = useBlockDesignerStore(selectSelectedElements);
    const view = useBlockDesignerStore(selectView);

    // === Zustand Store Actions ===
    const {
        addElement,
        removeElement,
        removeElements,
        updateElement,
        selectElements: selectMultiple,
        selectAll,
        zoomIn,
        zoomOut,
        resetView,
        setActiveBlock,
    } = useBlockDesignerStore();

    // Local state for cursor position (not persisted)
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const showGrid = view.gridVisible; // Synced from store

    // Set active block on mount
    useEffect(() => {
        if (blockId) {
            setActiveBlock(blockId);
        }
        return () => setActiveBlock(null);
    }, [blockId, setActiveBlock]);

    // Zoom is 0-1 scale in store, convert to percentage for display
    const zoomPercent = Math.round(view.zoom * 100);

    // Zoom handlers using store actions
    const handleZoomIn = useCallback(() => {
        zoomIn();
    }, [zoomIn]);

    const handleZoomOut = useCallback(() => {
        zoomOut();
    }, [zoomOut]);

    const handleZoomReset = useCallback(() => {
        resetView();
    }, [resetView]);

    // Element CRUD operations using store actions
    const handleElementAdd = useCallback((elementData: Omit<UIElement, 'id'>) => {
        const newId = addElement(elementData);
        // Selection is handled automatically by the store
        return newId;
    }, [addElement]);

    const handleElementUpdate = useCallback((id: string, updates: Partial<UIElement>) => {
        updateElement(id, updates);
    }, [updateElement]);

    const handleElementDelete = useCallback((id: string) => {
        removeElement(id);
    }, [removeElement]);

    const handleDeleteSelected = useCallback(() => {
        removeElements(selectedIds);
    }, [selectedIds, removeElements]);

    // Selection handlers using store actions
    const handleSelectionChange = useCallback((ids: string[]) => {
        selectMultiple(ids);
    }, [selectMultiple]);

    const handleSelectAll = useCallback(() => {
        selectAll();
    }, [selectAll]);

    // Cursor tracking (local state, not in store)
    const handleCursorMove = useCallback((pos: { x: number; y: number }) => {
        setCursorPos(pos);
    }, []);

    // Alignment handlers using store actions
    const handleAlignLeft = useCallback(() => {
        if (selectedIds.length < 2) return;
        const selected = elements.filter(el => selectedIds.includes(el.id));
        const minX = Math.min(...selected.map(el => el.position.x));
        selected.forEach(el => {
            updateElement(el.id, { position: { ...el.position, x: minX } });
        });
    }, [selectedIds, elements, updateElement]);

    const handleAlignCenter = useCallback(() => {
        if (selectedIds.length < 2) return;
        const selected = elements.filter(el => selectedIds.includes(el.id));
        const centerX = selected.reduce((sum, el) => sum + el.position.x + el.size.width / 2, 0) / selected.length;
        selected.forEach(el => {
            updateElement(el.id, { position: { ...el.position, x: centerX - el.size.width / 2 } });
        });
    }, [selectedIds, elements, updateElement]);

    const handleAlignRight = useCallback(() => {
        if (selectedIds.length < 2) return;
        const selected = elements.filter(el => selectedIds.includes(el.id));
        const maxRight = Math.max(...selected.map(el => el.position.x + el.size.width));
        selected.forEach(el => {
            updateElement(el.id, { position: { ...el.position, x: maxRight - el.size.width } });
        });
    }, [selectedIds, elements, updateElement]);

    return (
        <div className="block-ui-designer">
            <DesignerToolbar
                zoom={zoomPercent}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onZoomReset={handleZoomReset}
                hasSelection={selectedIds.length > 0}
                onDelete={handleDeleteSelected}
                onSelectAll={handleSelectAll}
                onAlignLeft={handleAlignLeft}
                onAlignCenter={handleAlignCenter}
                onAlignRight={handleAlignRight}
            />

            <div className="designer-main">
                <ElementLibraryPanel />

                <DesignCanvas
                    elements={elements}
                    selectedIds={selectedIds}
                    zoom={zoomPercent}
                    showGrid={showGrid}
                    onElementAdd={handleElementAdd}
                    onElementUpdate={handleElementUpdate}
                    onElementDelete={handleElementDelete}
                    onSelectionChange={handleSelectionChange}
                    onCursorMove={handleCursorMove}
                />

                <InspectorPanel
                    selectedElements={selectedElements}
                    onElementUpdate={handleElementUpdate}
                    availableParameters={availableParameters}
                />
            </div>

            <DesignerStatusBar
                zoom={zoomPercent}
                cursorX={cursorPos.x}
                cursorY={cursorPos.y}
                selectedCount={selectedIds.length}
                elementCount={elements.length}
            />
        </div>
    );
};

