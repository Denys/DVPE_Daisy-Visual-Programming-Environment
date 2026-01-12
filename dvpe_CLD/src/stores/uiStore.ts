/**
 * UI Store
 * Zustand store for managing UI state (panels, viewport, preferences)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ViewportState } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

export type PanelId = 'library' | 'inspector' | 'console' | 'minimap';
export type Theme = 'dark' | 'light' | 'system';
export type GridMode = 'dots' | 'lines' | 'none';

interface PanelState {
  visible: boolean;
  width?: number;
  height?: number;
}

interface UIState {
  // Panels
  panels: Record<PanelId, PanelState>;

  // Viewport
  viewport: ViewportState;
  minZoom: number;
  maxZoom: number;

  // Canvas settings
  gridEnabled: boolean;
  gridSize: number;
  gridMode: GridMode;
  snapToGrid: boolean;

  // Theme
  theme: Theme;
  reducedMotion: boolean;
  highContrast: boolean;

  // Inspector
  inspectedBlockId: string | null;

  // Modal state
  activeModal: string | null;
  modalData: unknown;

  // Drag state for connection creation
  connectionDrag: {
    active: boolean;
    sourceBlockId: string | null;
    sourcePortId: string | null;
    sourcePosition: { x: number; y: number } | null;
    currentPosition: { x: number; y: number } | null;
  };

  // Marquee selection
  marquee: {
    active: boolean;
    start: { x: number; y: number } | null;
    end: { x: number; y: number } | null;
  };

  // Drag state for block creation
  draggingBlockId: string | null;
}

interface UIActions {
  // Panel actions
  togglePanel: (panelId: PanelId) => void;
  setPanel: (panelId: PanelId, state: Partial<PanelState>) => void;
  setPanelWidth: (panelId: PanelId, width: number) => void;

  // Viewport actions
  setViewport: (viewport: Partial<ViewportState>) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: () => void;
  resetZoom: () => void;
  pan: (dx: number, dy: number) => void;

  // Canvas settings
  setGridEnabled: (enabled: boolean) => void;
  setGridSize: (size: number) => void;
  setGridMode: (mode: GridMode) => void;
  setSnapToGrid: (snap: boolean) => void;

  // Theme
  setTheme: (theme: Theme) => void;
  setReducedMotion: (reduced: boolean) => void;
  setHighContrast: (high: boolean) => void;

  // Inspector
  inspectBlock: (blockId: string | null) => void;

  // Modal
  openModal: (modalId: string, data?: unknown) => void;
  closeModal: () => void;

  // Connection drag
  startConnectionDrag: (
    blockId: string,
    portId: string,
    position: { x: number; y: number }
  ) => void;
  updateConnectionDrag: (position: { x: number; y: number }) => void;
  endConnectionDrag: () => void;

  // Marquee
  startMarquee: (position: { x: number; y: number }) => void;
  updateMarquee: (position: { x: number; y: number }) => void;
  endMarquee: () => void;

  // Block drag
  setDraggingBlock: (blockId: string | null) => void;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: UIState = {
  panels: {
    library: { visible: true, width: 240 },
    inspector: { visible: true, width: 320 },
    console: { visible: false, height: 200 },
    minimap: { visible: true },
  },
  viewport: { x: 0, y: 0, zoom: 1 },
  minZoom: 0.1,
  maxZoom: 4,
  gridEnabled: true,
  gridSize: 20,
  gridMode: 'dots',
  snapToGrid: true,
  theme: 'dark',
  reducedMotion: false,
  highContrast: false,
  inspectedBlockId: null,
  activeModal: null,
  modalData: null,
  connectionDrag: {
    active: false,
    sourceBlockId: null,
    sourcePortId: null,
    sourcePosition: null,
    currentPosition: null,
  },
  marquee: {
    active: false,
    start: null,
    end: null,
  },
  draggingBlockId: null,
};

// ============================================================================
// STORE
// ============================================================================

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // === Panel Actions ===

      togglePanel: (panelId) => {
        set((state) => ({
          panels: {
            ...state.panels,
            [panelId]: {
              ...state.panels[panelId],
              visible: !state.panels[panelId].visible,
            },
          },
        }));
      },

      setPanel: (panelId, panelState) => {
        set((state) => ({
          panels: {
            ...state.panels,
            [panelId]: {
              ...state.panels[panelId],
              ...panelState,
            },
          },
        }));
      },

      setPanelWidth: (panelId, width) => {
        set((state) => ({
          panels: {
            ...state.panels,
            [panelId]: {
              ...state.panels[panelId],
              width,
            },
          },
        }));
      },

      // === Viewport Actions ===

      setViewport: (viewport) => {
        set((state) => ({
          viewport: { ...state.viewport, ...viewport },
        }));
      },

      zoomIn: () => {
        const { viewport, maxZoom } = get();
        const newZoom = Math.min(viewport.zoom * 1.2, maxZoom);
        set({ viewport: { ...viewport, zoom: newZoom } });
      },

      zoomOut: () => {
        const { viewport, minZoom } = get();
        const newZoom = Math.max(viewport.zoom / 1.2, minZoom);
        set({ viewport: { ...viewport, zoom: newZoom } });
      },

      zoomToFit: () => {
        // This will be implemented with knowledge of canvas bounds
        // For now, just reset
        set({ viewport: { x: 0, y: 0, zoom: 1 } });
      },

      resetZoom: () => {
        const { viewport } = get();
        set({ viewport: { ...viewport, zoom: 1 } });
      },

      pan: (dx, dy) => {
        const { viewport } = get();
        set({
          viewport: {
            ...viewport,
            x: viewport.x + dx,
            y: viewport.y + dy,
          },
        });
      },

      // === Canvas Settings ===

      setGridEnabled: (enabled) => set({ gridEnabled: enabled }),
      setGridSize: (size) => set({ gridSize: size }),
      setGridMode: (mode) => set({ gridMode: mode }),
      setSnapToGrid: (snap) => set({ snapToGrid: snap }),

      // === Theme ===

      setTheme: (theme) => set({ theme }),
      setReducedMotion: (reduced) => set({ reducedMotion: reduced }),
      setHighContrast: (high) => set({ highContrast: high }),

      // === Inspector ===

      inspectBlock: (blockId) => set({ inspectedBlockId: blockId }),

      // === Modal ===

      openModal: (modalId, data) =>
        set({ activeModal: modalId, modalData: data }),
      closeModal: () => set({ activeModal: null, modalData: null }),

      // === Connection Drag ===

      startConnectionDrag: (blockId, portId, position) => {
        set({
          connectionDrag: {
            active: true,
            sourceBlockId: blockId,
            sourcePortId: portId,
            sourcePosition: position,
            currentPosition: position,
          },
        });
      },

      updateConnectionDrag: (position) => {
        set((state) => ({
          connectionDrag: {
            ...state.connectionDrag,
            currentPosition: position,
          },
        }));
      },

      endConnectionDrag: () => {
        set({
          connectionDrag: {
            active: false,
            sourceBlockId: null,
            sourcePortId: null,
            sourcePosition: null,
            currentPosition: null,
          },
        });
      },

      // === Marquee ===

      startMarquee: (position) => {
        set({
          marquee: {
            active: true,
            start: position,
            end: position,
          },
        });
      },

      updateMarquee: (position) => {
        set((state) => ({
          marquee: {
            ...state.marquee,
            end: position,
          },
        }));
      },

      endMarquee: () => {
        set({
          marquee: {
            active: false,
            start: null,
            end: null,
          },
        });
      },

      // === Block Drag ===
      setDraggingBlock: (blockId) => set({ draggingBlockId: blockId }),
    }),
    {
      name: 'dvpe-ui-state',
      partialize: (state) => ({
        // Only persist user preferences
        panels: state.panels,
        gridEnabled: state.gridEnabled,
        gridSize: state.gridSize,
        gridMode: state.gridMode,
        snapToGrid: state.snapToGrid,
        theme: state.theme,
        reducedMotion: state.reducedMotion,
        highContrast: state.highContrast,
      }),
    }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

export const selectPanels = (state: UIState) => state.panels;
export const selectViewport = (state: UIState) => state.viewport;
export const selectTheme = (state: UIState) => state.theme;
export const selectGridEnabled = (state: UIState) => state.gridEnabled;
export const selectSnapToGrid = (state: UIState) => state.snapToGrid;
export const selectInspectedBlockId = (state: UIState) => state.inspectedBlockId;
export const selectConnectionDrag = (state: UIState) => state.connectionDrag;
export const selectMarquee = (state: UIState) => state.marquee;
export const selectDraggingBlockId = (state: UIState) => state.draggingBlockId;
