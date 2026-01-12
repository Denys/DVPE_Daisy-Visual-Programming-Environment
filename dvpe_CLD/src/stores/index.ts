/**
 * Stores Index
 * Re-exports all Zustand stores
 */

export { usePatchStore } from './patchStore';
export { useUIStore } from './uiStore';

// Re-export selectors
export {
  selectBlocks,
  selectConnections,
  selectMetadata,
  selectSelectedBlockIds,
  selectSelectedConnectionIds,
  selectIsDirty,
  selectSelectedBlocks,
  selectSelectedConnections,
} from './patchStore';

export {
  selectPanels,
  selectViewport,
  selectTheme,
  selectGridEnabled,
  selectSnapToGrid,
  selectInspectedBlockId,
  selectConnectionDrag,
  selectMarquee,
} from './uiStore';

export type { PanelId, Theme, GridMode } from './uiStore';
