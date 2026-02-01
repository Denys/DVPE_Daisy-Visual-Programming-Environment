/**
 * useBlockDesigner - Custom hook for Visual UI Builder
 * Phase 13.2: Day 5 - Store Integration
 * 
 * Provides simplified API for components to interact with the designer store.
 */

import { useCallback, useMemo } from 'react';
import { useBlockDesignerStore } from '@/stores/blockDesignerStore';
import { UIElementType } from '@/types/uiElement';
import { ParameterBinding } from '@/types/parameterBinding';

/**
 * Hook providing simplified interface to the block designer store.
 */
export function useBlockDesigner() {
    const store = useBlockDesignerStore();

    // === Computed values ===
    const selectedElements = useMemo(() => {
        return store.elements.filter(e => store.selectedIds.includes(e.id));
    }, [store.elements, store.selectedIds]);

    const hasSelection = store.selectedIds.length > 0;
    const selectionCount = store.selectedIds.length;

    // === Element operations ===
    const addElement = useCallback((
        type: UIElementType,
        position: { x: number; y: number },
        config?: Record<string, unknown>
    ) => {
        return store.addElement({
            type,
            position,
            size: getDefaultSizeForType(type),
            rotation: 0,
            label: getDefaultLabelForType(type),
            config: config ?? {},
        });
    }, [store]);

    const deleteSelected = useCallback(() => {
        if (store.selectedIds.length > 0) {
            store.removeElements(store.selectedIds);
        }
    }, [store]);

    const duplicateSelected = useCallback(() => {
        if (store.selectedIds.length > 0) {
            return store.duplicateElements(store.selectedIds);
        }
        return [];
    }, [store]);

    // === Selection operations ===
    const selectElement = useCallback((id: string, addToSelection = false) => {
        store.selectElement(id, addToSelection);
    }, [store]);

    const deselectAll = useCallback(() => {
        store.clearSelection();
    }, [store]);

    // === Transform operations ===
    const moveSelected = useCallback((delta: { x: number; y: number }) => {
        if (store.selectedIds.length > 0) {
            store.moveElements(store.selectedIds, delta);
        }
    }, [store]);

    const resizeElement = useCallback((id: string, size: { width: number; height: number }) => {
        store.resizeElement(id, size);
    }, [store]);

    // === Binding operations ===
    const setBinding = useCallback((elementId: string, binding: ParameterBinding | undefined) => {
        store.setElementBinding(elementId, binding);
    }, [store]);

    // === Zoom operations ===
    const zoomIn = useCallback(() => store.zoomIn(), [store]);
    const zoomOut = useCallback(() => store.zoomOut(), [store]);
    const zoomReset = useCallback(() => store.resetView(), [store]);

    // === History operations ===
    const undo = useCallback(() => store.undo(), [store]);
    const redo = useCallback(() => store.redo(), [store]);

    const canUndo = store.history.past.length > 0;
    const canRedo = store.history.future.length > 0;

    // === Clipboard operations ===
    const copy = useCallback(() => store.copy(), [store]);
    const cut = useCallback(() => store.cut(), [store]);
    const paste = useCallback(() => store.paste(), [store]);

    return {
        // State
        elements: store.elements,
        selectedElements,
        selectedIds: store.selectedIds,
        hasSelection,
        selectionCount,
        zoom: store.view.zoom,
        gridVisible: store.view.gridVisible,
        snapToGrid: store.view.snapToGrid,
        mode: store.mode,
        isDirty: store.isDirty,
        canUndo,
        canRedo,
        clipboard: store.clipboard,
        canvasDimensions: store.canvasDimensions,

        // Element operations
        addElement,
        updateElement: store.updateElement,
        deleteSelected,
        duplicateSelected,

        // Selection
        selectElement,
        selectAll: store.selectAll,
        deselectAll,

        // Transform
        moveSelected,
        resizeElement,
        rotateElement: store.rotateElement,

        // Z-order
        bringToFront: store.bringToFront,
        sendToBack: store.sendToBack,
        bringForward: store.bringForward,
        sendBackward: store.sendBackward,

        // Binding
        setBinding,

        // Zoom/View
        zoomIn,
        zoomOut,
        zoomReset,
        toggleGrid: store.toggleGrid,
        setSnapToGrid: store.setSnapToGrid,

        // History
        undo,
        redo,

        // Clipboard
        copy,
        cut,
        paste,

        // Persistence
        loadElements: store.loadElements,
        clearDesigner: store.clearDesigner,
        markClean: store.markClean,
    };
}

// === Helpers ===

function getDefaultSizeForType(type: UIElementType): { width: number; height: number } {
    switch (type) {
        case UIElementType.ROTARY_KNOB:
            return { width: 60, height: 60 };
        case UIElementType.SLIDER:
            return { width: 120, height: 32 };
        case UIElementType.TOGGLE:
            return { width: 60, height: 28 };
        case UIElementType.DROPDOWN:
            return { width: 120, height: 32 };
        case UIElementType.BUTTON_MOMENTARY:
            return { width: 80, height: 32 };
        case UIElementType.TEXT_LABEL:
            return { width: 100, height: 24 };
        case UIElementType.LED_INDICATOR:
            return { width: 20, height: 20 };
        case UIElementType.NUMERIC_DISPLAY:
            return { width: 80, height: 28 };
        case UIElementType.VU_METER:
            return { width: 32, height: 100 };
        case UIElementType.MINI_OSCILLOSCOPE:
            return { width: 120, height: 80 };
        case UIElementType.ENVELOPE_DISPLAY:
            return { width: 120, height: 60 };
        case UIElementType.GROUP_BOX:
            return { width: 200, height: 120 };
        default:
            return { width: 60, height: 40 };
    }
}

function getDefaultLabelForType(type: UIElementType): string {
    switch (type) {
        case UIElementType.ROTARY_KNOB:
            return 'Knob';
        case UIElementType.SLIDER:
            return 'Slider';
        case UIElementType.TOGGLE:
            return 'Toggle';
        case UIElementType.DROPDOWN:
            return 'Select';
        case UIElementType.BUTTON_MOMENTARY:
            return 'Button';
        case UIElementType.TEXT_LABEL:
            return 'Label';
        case UIElementType.LED_INDICATOR:
            return '';
        case UIElementType.NUMERIC_DISPLAY:
            return '';
        case UIElementType.VU_METER:
            return 'Level';
        case UIElementType.MINI_OSCILLOSCOPE:
            return 'Scope';
        case UIElementType.ENVELOPE_DISPLAY:
            return 'Envelope';
        case UIElementType.GROUP_BOX:
            return 'Group';
        default:
            return 'Element';
    }
}
