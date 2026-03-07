# Node Specification: STATE_UIStore - UI State

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Zustand store for all transient UI state that does not belong in the patch graph. Manages panel visibility and dimensions, canvas viewport (pan/zoom), grid settings, theme and accessibility preferences, the active modal, the block currently being inspected, connection dragging state, and marquee selection state.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** None (self-contained)
* **Input Data/State:** User interactions (resize panels, zoom canvas, change theme, open modals, drag wires, drag-select); localStorage for persisted preferences

## 3. Interfaces
* **Outputs / Results:** Reactive state consumed by UI_Canvas, UI_Inspector, UI_ModuleLibrary, UI_App, and all modal components
* **File Location:** `src/stores/uiStore.ts`

## 4. Core Logic & Processing Steps
1. **Panel state:**
   - `panelVisibility: { library: boolean, inspector: boolean, console: boolean, minimap: boolean }` — toggle each panel independently
   - `panelDimensions: { libraryWidth: number, inspectorWidth: number }` — persisted; clamped to min/max values
   - `togglePanel(key)`: flip visibility of named panel
   - `setPanelWidth(key, width)`: set width, clamped to `[minWidth, maxWidth]`
2. **Viewport state:**
   - `viewport: { x: number, y: number, zoom: number }` — React Flow canvas transform
   - `setViewport(viewport)`: update pan/zoom position
   - `resetViewport()`: return to default (0,0, zoom=1)
3. **Grid settings:**
   - `gridEnabled: boolean`, `gridSize: number`, `gridMode: "dots" | "lines"`, `snapToGrid: boolean`
   - `setGridEnabled(v)`, `setGridSize(n)`, `setGridMode(m)`, `setSnapToGrid(v)`
4. **Theme and accessibility:**
   - `theme: "dark" | "light" | "system"` — persisted to localStorage via Zustand persist middleware
   - `reducedMotion: boolean`, `highContrast: boolean` — accessibility preferences
   - `setTheme(t)`, `setReducedMotion(v)`, `setHighContrast(v)`
5. **Inspector target:**
   - `inspectedBlockId: string | null` — which block's parameters are shown in the Inspector panel
   - `inspectBlock(id | null)`: set or clear the inspected block
6. **Modal routing:**
   - `activeModal: string | null` — key identifying which modal is open (e.g., `"architecture"`, `"blockDesigner"`, `"shortcuts"`)
   - `modalData: unknown` — arbitrary payload passed to the modal
   - `openModal(key, data?)`: set activeModal + modalData; replaces any currently open modal
   - `closeModal()`: set activeModal to null
7. **Connection drag state (transient, not persisted):**
   - `connectionDrag: ConnectionDragState | null` — active wire drag: `{ sourceBlockId, sourcePortId, signalType, currentX, currentY }`
   - `startConnectionDrag(...)`, `updateConnectionDrag(x, y)`, `endConnectionDrag()`
8. **Marquee selection (transient, not persisted):**
   - `marquee: MarqueeState | null` — drag-select box: `{ startX, startY, currentX, currentY }`
   - `startMarquee(x, y)`, `updateMarquee(x, y)`, `endMarquee()`

## 5. Data Structures
* `PanelState { visibility: Record<string, boolean>, dimensions: Record<string, number> }`
* `ViewportState { x: number, y: number, zoom: number }`
* `ConnectionDragState { sourceBlockId: string, sourcePortId: string, signalType: SignalType, currentX: number, currentY: number }`
* `MarqueeState { startX: number, startY: number, currentX: number, currentY: number }`

## 6. Error Handling & Edge Cases
* **Opening modal while another is open:** Replace the existing modal (last-write wins); no stacking
* **Panel width below minimum:** Clamp to `minWidth` constant (e.g., 200px); do not allow collapse via resize (use `togglePanel` for that)
* **`inspectBlock(null)`:** Clears inspector — must handle `null` input explicitly, not treat as no-op
* **`setViewport` with NaN values:** Validate and reject; log warning

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: `togglePanel("library")` correctly flips `panelVisibility.library` from true to false and back
    * ARC_FUNC_02: `setTheme("dark")` persists the value to localStorage such that it is restored on next app load
* **Input Validation Criteria:**
    * ARC_VAL_01: `inspectBlock(null)` clears the inspector (sets `inspectedBlockId` to null) without error
* **Error Handling Criteria:**
    * ARC_ERR_01: `setPanelWidth` with a value below minimum clamps to minimum rather than setting invalid width

## 8. Notes & Considerations
* Uses Zustand `persist` middleware for `theme`, `gridEnabled`, `gridSize`, `gridMode`, `snapToGrid`, and panel dimensions — these survive page reload
* `connectionDrag` and `marquee` state are purely transient: NOT persisted, NOT in undo history
* `openModal` replaces — no modal stacking architecture; if stacking is needed in future, this is a refactor point
* `reducedMotion` should also check `window.matchMedia("(prefers-reduced-motion: reduce)")` on initialization as a default
