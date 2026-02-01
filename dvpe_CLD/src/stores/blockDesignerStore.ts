/**
 * Block Designer Store
 * Zustand store for managing the Visual UI Builder state
 * Phase 13.2 - Agent A Day 2
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UIElement, UIElementType, Position, Size } from '@/types/uiElement';
import { ParameterBinding } from '@/types/parameterBinding';

// ============================================================================
// TYPES
// ============================================================================

/** History entry for undo/redo */
interface HistoryEntry {
    elements: UIElement[];
    timestamp: number;
    action: string;
}

/** Canvas view state */
interface CanvasViewState {
    zoom: number;
    panOffset: Position;
    gridVisible: boolean;
    gridSize: number;
    snapToGrid: boolean;
    rulersVisible: boolean;
}

/** Designer mode */
export type DesignerMode = 'select' | 'pan' | 'place';

/** Block designer state */
interface BlockDesignerState {
    // Canvas elements
    elements: UIElement[];

    // Selection
    selectedIds: string[];

    // Clipboard
    clipboard: UIElement[];

    // Canvas view
    view: CanvasViewState;

    // Current mode
    mode: DesignerMode;

    // Element being placed (from library)
    placingElementType: UIElementType | null;

    // History for undo/redo (50-step)
    history: {
        past: HistoryEntry[];
        future: HistoryEntry[];
    };

    // Active block being designed
    activeBlockId: string | null;

    // Canvas dimensions (block size)
    canvasDimensions: Size;

    // Whether there are unsaved changes
    isDirty: boolean;
}

/** Block designer actions */
interface BlockDesignerActions {
    // === Element CRUD ===
    addElement: (element: Omit<UIElement, 'id'>) => string;
    removeElement: (elementId: string) => void;
    removeElements: (elementIds: string[]) => void;
    updateElement: (elementId: string, updates: Partial<UIElement>) => void;
    duplicateElements: (elementIds: string[]) => string[];

    // === Selection ===
    selectElement: (elementId: string, addToSelection?: boolean) => void;
    selectElements: (elementIds: string[]) => void;
    selectAll: () => void;
    clearSelection: () => void;

    // === Transform ===
    moveElements: (elementIds: string[], delta: Position) => void;
    resizeElement: (elementId: string, newSize: Size, anchor?: string) => void;
    rotateElement: (elementId: string, rotation: number) => void;

    // === Z-Order ===
    bringToFront: (elementId: string) => void;
    sendToBack: (elementId: string) => void;
    bringForward: (elementId: string) => void;
    sendBackward: (elementId: string) => void;

    // === Clipboard ===
    copy: () => void;
    cut: () => void;
    paste: (offset?: Position) => string[];

    // === History ===
    undo: () => void;
    redo: () => void;
    clearHistory: () => void;

    // === View ===
    setZoom: (zoom: number) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    resetView: () => void;
    setPan: (offset: Position) => void;
    toggleGrid: () => void;
    toggleRulers: () => void;
    setSnapToGrid: (snap: boolean) => void;

    // === Mode ===
    setMode: (mode: DesignerMode) => void;
    startPlacing: (elementType: UIElementType) => void;
    cancelPlacing: () => void;

    // === Block ===
    setActiveBlock: (blockId: string | null) => void;
    setCanvasDimensions: (dimensions: Size) => void;

    // === Binding ===
    setElementBinding: (elementId: string, binding: ParameterBinding | undefined) => void;

    // === Persistence ===
    loadElements: (elements: UIElement[]) => void;
    clearDesigner: () => void;
    markClean: () => void;
}

// ============================================================================
// HELPERS
// ============================================================================

let elementIdCounter = 0;
const generateElementId = (): string => {
    return `elem-${Date.now()}-${++elementIdCounter}`;
};

const MAX_HISTORY_SIZE = 50;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: BlockDesignerState = {
    elements: [],
    selectedIds: [],
    clipboard: [],
    view: {
        zoom: 1,
        panOffset: { x: 0, y: 0 },
        gridVisible: true,
        gridSize: 10,
        snapToGrid: true,
        rulersVisible: true,
    },
    mode: 'select',
    placingElementType: null,
    history: {
        past: [],
        future: [],
    },
    activeBlockId: null,
    canvasDimensions: { width: 240, height: 160 },
    isDirty: false,
};

// ============================================================================
// STORE
// ============================================================================

export const useBlockDesignerStore = create<BlockDesignerState & BlockDesignerActions>()(
    persist(
        (set, get) => {
            // Helper to save history
            const saveHistory = (action: string) => {
                const state = get();
                const entry: HistoryEntry = {
                    elements: JSON.parse(JSON.stringify(state.elements)),
                    timestamp: Date.now(),
                    action,
                };

                set({
                    history: {
                        past: [...state.history.past.slice(-MAX_HISTORY_SIZE + 1), entry],
                        future: [], // Clear redo stack on new action
                    },
                    isDirty: true,
                });
            };

            return {
                ...initialState,

                // === Element CRUD ===

                addElement: (element) => {
                    const id = generateElementId();
                    const newElement: UIElement = {
                        ...element,
                        id,
                        zIndex: get().elements.length,
                    };

                    saveHistory('Add element');
                    set((state) => ({
                        elements: [...state.elements, newElement],
                    }));

                    return id;
                },

                removeElement: (elementId) => {
                    saveHistory('Remove element');
                    set((state) => ({
                        elements: state.elements.filter((e) => e.id !== elementId),
                        selectedIds: state.selectedIds.filter((id) => id !== elementId),
                    }));
                },

                removeElements: (elementIds) => {
                    saveHistory('Remove elements');
                    const idSet = new Set(elementIds);
                    set((state) => ({
                        elements: state.elements.filter((e) => !idSet.has(e.id)),
                        selectedIds: state.selectedIds.filter((id) => !idSet.has(id)),
                    }));
                },

                updateElement: (elementId, updates) => {
                    saveHistory('Update element');
                    set((state) => ({
                        elements: state.elements.map((e) =>
                            e.id === elementId ? { ...e, ...updates } : e
                        ),
                    }));
                },

                duplicateElements: (elementIds) => {
                    const state = get();
                    const newIds: string[] = [];
                    const elementsToDuplicate = state.elements.filter((e) =>
                        elementIds.includes(e.id)
                    );

                    saveHistory('Duplicate elements');

                    const duplicates = elementsToDuplicate.map((e) => {
                        const newId = generateElementId();
                        newIds.push(newId);
                        return {
                            ...e,
                            id: newId,
                            position: {
                                x: e.position.x + 20,
                                y: e.position.y + 20,
                            },
                            zIndex: state.elements.length + newIds.length - 1,
                        };
                    });

                    set((state) => ({
                        elements: [...state.elements, ...duplicates],
                        selectedIds: newIds,
                    }));

                    return newIds;
                },

                // === Selection ===

                selectElement: (elementId, addToSelection = false) => {
                    set((state) => ({
                        selectedIds: addToSelection
                            ? state.selectedIds.includes(elementId)
                                ? state.selectedIds.filter((id) => id !== elementId)
                                : [...state.selectedIds, elementId]
                            : [elementId],
                    }));
                },

                selectElements: (elementIds) => {
                    set({ selectedIds: elementIds });
                },

                selectAll: () => {
                    set((state) => ({
                        selectedIds: state.elements.map((e) => e.id),
                    }));
                },

                clearSelection: () => {
                    set({ selectedIds: [] });
                },

                // === Transform ===

                moveElements: (elementIds, delta) => {
                    saveHistory('Move elements');
                    const idSet = new Set(elementIds);
                    set((state) => ({
                        elements: state.elements.map((e) =>
                            idSet.has(e.id)
                                ? {
                                    ...e,
                                    position: {
                                        x: e.position.x + delta.x,
                                        y: e.position.y + delta.y,
                                    },
                                }
                                : e
                        ),
                    }));
                },

                resizeElement: (elementId, newSize) => {
                    saveHistory('Resize element');
                    set((state) => ({
                        elements: state.elements.map((e) =>
                            e.id === elementId ? { ...e, size: newSize } : e
                        ),
                    }));
                },

                rotateElement: (elementId, rotation) => {
                    saveHistory('Rotate element');
                    set((state) => ({
                        elements: state.elements.map((e) =>
                            e.id === elementId ? { ...e, rotation: rotation % 360 } : e
                        ),
                    }));
                },

                // === Z-Order ===

                bringToFront: (elementId) => {
                    saveHistory('Bring to front');
                    const maxZ = Math.max(...get().elements.map((e) => e.zIndex ?? 0));
                    set((state) => ({
                        elements: state.elements.map((e) =>
                            e.id === elementId ? { ...e, zIndex: maxZ + 1 } : e
                        ),
                    }));
                },

                sendToBack: (elementId) => {
                    saveHistory('Send to back');
                    const minZ = Math.min(...get().elements.map((e) => e.zIndex ?? 0));
                    set((state) => ({
                        elements: state.elements.map((e) =>
                            e.id === elementId ? { ...e, zIndex: minZ - 1 } : e
                        ),
                    }));
                },

                bringForward: (elementId) => {
                    saveHistory('Bring forward');
                    set((state) => ({
                        elements: state.elements.map((e) =>
                            e.id === elementId ? { ...e, zIndex: (e.zIndex ?? 0) + 1 } : e
                        ),
                    }));
                },

                sendBackward: (elementId) => {
                    saveHistory('Send backward');
                    set((state) => ({
                        elements: state.elements.map((e) =>
                            e.id === elementId ? { ...e, zIndex: Math.max(0, (e.zIndex ?? 0) - 1) } : e
                        ),
                    }));
                },

                // === Clipboard ===

                copy: () => {
                    const state = get();
                    const selectedElements = state.elements.filter((e) =>
                        state.selectedIds.includes(e.id)
                    );
                    set({ clipboard: JSON.parse(JSON.stringify(selectedElements)) });
                },

                cut: () => {
                    const state = get();
                    const selectedElements = state.elements.filter((e) =>
                        state.selectedIds.includes(e.id)
                    );
                    saveHistory('Cut elements');
                    set({
                        clipboard: JSON.parse(JSON.stringify(selectedElements)),
                        elements: state.elements.filter((e) => !state.selectedIds.includes(e.id)),
                        selectedIds: [],
                    });
                },

                paste: (offset = { x: 20, y: 20 }) => {
                    const state = get();
                    const newIds: string[] = [];

                    saveHistory('Paste elements');

                    const pasted = state.clipboard.map((e) => {
                        const newId = generateElementId();
                        newIds.push(newId);
                        return {
                            ...e,
                            id: newId,
                            position: {
                                x: e.position.x + offset.x,
                                y: e.position.y + offset.y,
                            },
                        };
                    });

                    set((state) => ({
                        elements: [...state.elements, ...pasted],
                        selectedIds: newIds,
                    }));

                    return newIds;
                },

                // === History ===

                undo: () => {
                    const state = get();
                    if (state.history.past.length === 0) return;

                    const previous = state.history.past[state.history.past.length - 1];
                    const current: HistoryEntry = {
                        elements: JSON.parse(JSON.stringify(state.elements)),
                        timestamp: Date.now(),
                        action: 'Undo',
                    };

                    set({
                        elements: previous.elements,
                        history: {
                            past: state.history.past.slice(0, -1),
                            future: [current, ...state.history.future],
                        },
                        selectedIds: [],
                        isDirty: state.history.past.length > 1,
                    });
                },

                redo: () => {
                    const state = get();
                    if (state.history.future.length === 0) return;

                    const next = state.history.future[0];
                    const current: HistoryEntry = {
                        elements: JSON.parse(JSON.stringify(state.elements)),
                        timestamp: Date.now(),
                        action: 'Redo',
                    };

                    set({
                        elements: next.elements,
                        history: {
                            past: [...state.history.past, current],
                            future: state.history.future.slice(1),
                        },
                        selectedIds: [],
                        isDirty: true,
                    });
                },

                clearHistory: () => {
                    set({
                        history: { past: [], future: [] },
                    });
                },

                // === View ===

                setZoom: (zoom) => {
                    const clampedZoom = Math.min(Math.max(zoom, 0.25), 4);
                    set((state) => ({
                        view: { ...state.view, zoom: clampedZoom },
                    }));
                },

                zoomIn: () => {
                    const { view } = get();
                    const newZoom = Math.min(view.zoom * 1.25, 4);
                    set({ view: { ...view, zoom: newZoom } });
                },

                zoomOut: () => {
                    const { view } = get();
                    const newZoom = Math.max(view.zoom / 1.25, 0.25);
                    set({ view: { ...view, zoom: newZoom } });
                },

                resetView: () => {
                    set((state) => ({
                        view: {
                            ...state.view,
                            zoom: 1,
                            panOffset: { x: 0, y: 0 },
                        },
                    }));
                },

                setPan: (offset) => {
                    set((state) => ({
                        view: { ...state.view, panOffset: offset },
                    }));
                },

                toggleGrid: () => {
                    set((state) => ({
                        view: { ...state.view, gridVisible: !state.view.gridVisible },
                    }));
                },

                toggleRulers: () => {
                    set((state) => ({
                        view: { ...state.view, rulersVisible: !state.view.rulersVisible },
                    }));
                },

                setSnapToGrid: (snap) => {
                    set((state) => ({
                        view: { ...state.view, snapToGrid: snap },
                    }));
                },

                // === Mode ===

                setMode: (mode) => {
                    set({ mode, placingElementType: null });
                },

                startPlacing: (elementType) => {
                    set({ mode: 'place', placingElementType: elementType });
                },

                cancelPlacing: () => {
                    set({ mode: 'select', placingElementType: null });
                },

                // === Block ===

                setActiveBlock: (blockId) => {
                    set({ activeBlockId: blockId });
                },

                setCanvasDimensions: (dimensions) => {
                    set({ canvasDimensions: dimensions });
                },

                // === Binding ===

                setElementBinding: (elementId, binding) => {
                    saveHistory('Set binding');
                    set((state) => ({
                        elements: state.elements.map((e) =>
                            e.id === elementId ? { ...e, binding } : e
                        ),
                    }));
                },

                // === Persistence ===

                loadElements: (elements) => {
                    set({
                        elements,
                        selectedIds: [],
                        history: { past: [], future: [] },
                        isDirty: false,
                    });
                },

                clearDesigner: () => {
                    set({
                        ...initialState,
                        history: { past: [], future: [] },
                    });
                },

                markClean: () => {
                    set({ isDirty: false });
                },
            };
        },
        {
            name: 'dvpe-block-designer',
            partialize: (state) => ({
                // Persist view preferences and current elements (draft)
                view: state.view,
                canvasDimensions: state.canvasDimensions,
                elements: state.elements,
                // Do not persist selection, clipboard, or history
            }),
        }
    )
);

// ============================================================================
// SELECTORS
// ============================================================================

export const selectElements = (state: BlockDesignerState) => state.elements;
export const selectSelectedIds = (state: BlockDesignerState) => state.selectedIds;
export const selectSelectedElements = (state: BlockDesignerState) =>
    state.elements.filter((e) => state.selectedIds.includes(e.id));
export const selectClipboard = (state: BlockDesignerState) => state.clipboard;
export const selectView = (state: BlockDesignerState) => state.view;
export const selectMode = (state: BlockDesignerState) => state.mode;
export const selectPlacingElementType = (state: BlockDesignerState) => state.placingElementType;
export const selectCanUndo = (state: BlockDesignerState) => state.history.past.length > 0;
export const selectCanRedo = (state: BlockDesignerState) => state.history.future.length > 0;
export const selectIsDirty = (state: BlockDesignerState) => state.isDirty;
export const selectActiveBlockId = (state: BlockDesignerState) => state.activeBlockId;
export const selectCanvasDimensions = (state: BlockDesignerState) => state.canvasDimensions;

// Element by ID selector
export const selectElementById = (state: BlockDesignerState, elementId: string) =>
    state.elements.find((e) => e.id === elementId);
