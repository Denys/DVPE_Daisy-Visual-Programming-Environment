/**
 * UI Store
 * Zustand store for managing UI state (panels, viewport, preferences)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ViewportState } from '@/types';
import { getDefaultAIModel, type AIProvider } from '@/codegen/advancedExportService';
import {
  DEFAULT_STITCH_NEON_SETTINGS,
  normalizeStitchNeonSettings,
  type StitchNeonSettings,
} from '@/lib/stitchNeonStyle';

// ============================================================================
// TYPES
// ============================================================================

export type PanelId = 'library' | 'inspector' | 'console' | 'minimap' | 'experimentator';
export type Theme = 'dark' | 'light' | 'system';
export type LayoutStyle = 'original' | 'glass' | 'experiment';
export type GridMode = 'dots' | 'lines' | 'none';

export interface DesignSettings {
  glowIntensity: number;
  glowSpread: number;
  baseTransparency: number;
  borderWidth: number;
  borderRadius: number;
  neonSaturation: number;
  glassTint: number;
}

export interface DesignPreset {
  id: string;
  name: string;
  settings: DesignSettings;
}

export interface StitchNeonPreset {
  id: string;
  name: string;
  settings: StitchNeonSettings;
}

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

  // Theme & Layout
  theme: Theme;
  layoutStyle: LayoutStyle;
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

  // Design Experimentator
  designSettings: DesignSettings;
  customPresets: DesignPreset[];
  stitchNeonSettings: StitchNeonSettings;
  stitchNeonPresets: StitchNeonPreset[];

  // AI Export
  aiProvider: AIProvider;
  aiModel: string;
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

  // Theme & Layout
  setTheme: (theme: Theme) => void;
  setLayoutStyle: (layout: LayoutStyle) => void;
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

  // Design Experimentator
  updateDesignSettings: (settings: Partial<DesignSettings>) => void;
  resetDesignSettings: () => void;
  saveDesignPreset: (name: string) => void;
  loadDesignPreset: (presetId: string) => void;
  deleteDesignPreset: (presetId: string) => void;
  updateStitchNeonSettings: (settings: Partial<StitchNeonSettings>) => void;
  resetStitchNeonSettings: () => void;
  saveStitchNeonPreset: (name: string) => void;
  loadStitchNeonPreset: (presetId: string) => void;
  deleteStitchNeonPreset: (presetId: string) => void;

  // AI Export
  setAIProvider: (provider: AIProvider) => void;
  setAIModel: (model: string) => void;
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
    experimentator: { visible: false, width: 280 },
  },
  viewport: { x: 0, y: 0, zoom: 1 },
  minZoom: 0.1,
  maxZoom: 4,
  gridEnabled: true,
  gridSize: 20,
  gridMode: 'dots',
  snapToGrid: true,
  theme: 'dark',
  layoutStyle: 'original',
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
  designSettings: {
    glowIntensity: 0.4,
    glowSpread: 160,
    baseTransparency: 0.08,
    borderWidth: 1,
    borderRadius: 16,
    neonSaturation: 1.0,
    glassTint: 0.15,
  },
  customPresets: [],
  stitchNeonSettings: { ...DEFAULT_STITCH_NEON_SETTINGS },
  stitchNeonPresets: [],
  aiProvider: 'gemini' as AIProvider,
  aiModel: getDefaultAIModel('gemini'),
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

      // === Theme & Layout ===

      setTheme: (theme) => set({ theme }),
      setLayoutStyle: (layout) => set({ layoutStyle: layout }),
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

      // === Design Experimentator ===
      updateDesignSettings: (settings) => {
        set((state) => ({
          designSettings: { ...state.designSettings, ...settings },
          layoutStyle: 'experiment', // Auto-switch to experiment layout when tweaking
        }));
      },

      resetDesignSettings: () => {
        set({ designSettings: initialState.designSettings });
      },

      saveDesignPreset: (name) => {
        const { designSettings, customPresets } = get();
        const newPreset: DesignPreset = {
          id: `preset-${Date.now()}`,
          name,
          settings: { ...designSettings },
        };
        set({ customPresets: [...customPresets, newPreset] });
      },

      loadDesignPreset: (presetId) => {
        const { customPresets } = get();
        const preset = customPresets.find((p) => p.id === presetId);
        if (preset) {
          set({ 
            designSettings: { ...preset.settings },
            layoutStyle: 'experiment'
          });
        }
      },

      deleteDesignPreset: (presetId) => {
        set((state) => ({
          customPresets: state.customPresets.filter((p) => p.id !== presetId),
        }));
      },

      updateStitchNeonSettings: (settings) => {
        set((state) => {
          const current = normalizeStitchNeonSettings(state.stitchNeonSettings);
          return {
            stitchNeonSettings: normalizeStitchNeonSettings({
              ...current,
              ...settings,
              blockTypeColors: {
                ...current.blockTypeColors,
                ...settings.blockTypeColors,
              },
            }),
            layoutStyle: 'glass',
          };
        });
      },

      resetStitchNeonSettings: () => {
        set({ stitchNeonSettings: { ...DEFAULT_STITCH_NEON_SETTINGS } });
      },

      saveStitchNeonPreset: (name) => {
        const { stitchNeonSettings, stitchNeonPresets } = get();
        const newPreset: StitchNeonPreset = {
          id: `stitch-preset-${Date.now()}`,
          name,
          settings: normalizeStitchNeonSettings(stitchNeonSettings),
        };
        set({ stitchNeonPresets: [...stitchNeonPresets, newPreset] });
      },

      loadStitchNeonPreset: (presetId) => {
        const { stitchNeonPresets } = get();
        const preset = stitchNeonPresets.find((p) => p.id === presetId);
        if (preset) {
          set({
            stitchNeonSettings: normalizeStitchNeonSettings(preset.settings),
            layoutStyle: 'glass',
          });
        }
      },

      deleteStitchNeonPreset: (presetId) => {
        set((state) => ({
          stitchNeonPresets: state.stitchNeonPresets.filter((p) => p.id !== presetId),
        }));
      },

      // === AI Export ===
      setAIProvider: (provider) => set({ aiProvider: provider }),
      setAIModel: (model) => set({ aiModel: model }),
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
        layoutStyle: state.layoutStyle,
        reducedMotion: state.reducedMotion,
        highContrast: state.highContrast,
        designSettings: state.designSettings,
        customPresets: state.customPresets,
        stitchNeonSettings: normalizeStitchNeonSettings(state.stitchNeonSettings),
        stitchNeonPresets: state.stitchNeonPresets,
        aiProvider: state.aiProvider,
        aiModel: state.aiModel,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<UIState> | undefined;
        return {
          ...currentState,
          ...(persisted || {}),
          stitchNeonSettings: normalizeStitchNeonSettings(persisted?.stitchNeonSettings),
          stitchNeonPresets: Array.isArray(persisted?.stitchNeonPresets)
            ? persisted.stitchNeonPresets.map((preset) => ({
              ...preset,
              settings: normalizeStitchNeonSettings(preset.settings),
            }))
            : [],
        };
      },
    }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

export const selectPanels = (state: UIState) => state.panels;
export const selectViewport = (state: UIState) => state.viewport;
export const selectTheme = (state: UIState) => state.theme;
export const selectLayoutStyle = (state: UIState) => state.layoutStyle;
export const selectGridEnabled = (state: UIState) => state.gridEnabled;
export const selectSnapToGrid = (state: UIState) => state.snapToGrid;
export const selectInspectedBlockId = (state: UIState) => state.inspectedBlockId;
export const selectConnectionDrag = (state: UIState) => state.connectionDrag;
export const selectMarquee = (state: UIState) => state.marquee;
export const selectDraggingBlockId = (state: UIState) => state.draggingBlockId;
