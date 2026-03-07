# Node Specification: UI_DesignCanvas - Block UI Design Canvas

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Complex

## 1. Purpose
* **Goal:** The canvas within the Block UI Designer where users place and arrange UI elements. Supports drag-to-position, resize handles, grid snapping, and selection. Provides a WYSIWYG preview of how the custom block's UI will appear in the Inspector.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** STATE_BlockDesignerStore, TYPES_UILayout
* **Input Data/State:** Array of UIElements from STATE_BlockDesignerStore, selected element ID, snap-to-grid setting and grid size, canvas dimensions from designer config

## 3. Interfaces
* **Outputs / Results:** Updates STATE_BlockDesignerStore with new element positions and sizes on drag/resize; emits selection change events; provides drop target for UI_ElementLibraryPanel drag sources
* **File Location:** src/components/BlockDesigner/DesignCanvas.tsx

## 4. Core Logic & Processing Steps
1. Render a fixed-dimension canvas area styled to represent the Inspector panel size
2. Draw a background dot grid (or line grid) when snap-to-grid is enabled
3. Iterate STATE_BlockDesignerStore.elements and render each UIElement at its stored position and size using its type-specific preview component
4. On canvas click (no element hit): clear selection in STATE_BlockDesignerStore
5. On element click: set selected element ID in STATE_BlockDesignerStore
6. On element mousedown: begin drag operation — track pointer delta and update element position in STATE_BlockDesignerStore on mousemove; commit on mouseup
7. Apply grid snapping: round position values to nearest grid increment when snap is enabled
8. On selected element: render TransformHandles (8-point resize handles) around its bounding box
9. On handle drag: update element width/height in STATE_BlockDesignerStore; enforce minimum size constraints
10. Accept HTML5 DnD drop events from UI_ElementLibraryPanel: read element type from dataTransfer, create new UIElement at drop coordinates, add to STATE_BlockDesignerStore

## 5. Data Structures
* `UIElement` — id, type, position {x, y}, size {width, height}, properties, binding
* `TransformHandle` — directional handle position (N, NE, E, SE, S, SW, W, NW) for resize
* `SnapConfig` — enabled flag, gridSize (default 8px)

## 6. Error Handling & Edge Cases
* Dropped elements are clamped so their full bounding box stays within canvas boundaries
* Minimum element size enforced (e.g., 16x16px) during resize to prevent zero-dimension elements
* If STATE_BlockDesignerStore.elements is empty, render a centered placeholder label "Drag elements here"
* Multi-select not required in v1 — single selection model only

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify dragging an element to a new position updates its x/y in STATE_BlockDesignerStore and re-renders at the new location
    * ARC_FUNC_02: Verify resize handle drag changes element width/height in STATE_BlockDesignerStore
    * ARC_FUNC_03: Verify snap-to-grid rounds element position to the nearest grid increment
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify element position is clamped to canvas bounds on drop
    * ARC_VAL_02: Verify element size cannot be reduced below minimum (16x16px)
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify drop events with missing or invalid dataTransfer type are silently ignored without throwing

## 8. Notes & Considerations
* Canvas dimensions should match Inspector panel dimensions to provide accurate WYSIWYG preview
* Consider a zoom control for the canvas if Inspector panels become large
* Keyboard nudge (arrow keys) for selected element position should be handled here or delegated to HOOK_ParameterShortcuts
