# Node Specification: UI_DragOverlay - Drag Overlay

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Display a ghost preview of a block being dragged from the library onto the canvas. Provides visual affordance to the user so they can see what block they are placing and where it will land before releasing the drag.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** STATE_UIStore
* **Input Data/State:** draggingBlockId (definitionId of block being dragged) from STATE_UIStore; block display name and category color from SVC_BlockRegistry; cursor position from DOM drag events

## 3. Interfaces
* **Outputs / Results:** Rendered ghost preview DOM element following cursor position during drag; removed from DOM on drop or drag-cancel
* **File Location:** src/components/Canvas/DragOverlay.tsx

## 4. Core Logic & Processing Steps
1. Subscribe to draggingBlockId in STATE_UIStore
2. When draggingBlockId is set: look up block display name and category colorScheme from SVC_BlockRegistry
3. Render a semi-transparent block preview element positioned at current cursor coordinates
4. Track cursor position via dragover event listener on the document or canvas element
5. Update overlay position on every dragover event using CSS transform: translate(x, y)
6. When drag ends (drop or dragend event): clear draggingBlockId in STATE_UIStore, remove overlay
7. Apply reduced opacity (e.g., 0.7) and dashed border to visually signal "preview" state

## 5. Data Structures
* STATE_UIStore.draggingBlockId: string | null
* Overlay render data: `{ displayName: string, colorScheme: BlockColorScheme, cursorX: number, cursorY: number }`

## 6. Error Handling & Edge Cases
* draggingBlockId set but SVC_BlockRegistry returns undefined: render generic gray ghost block with "Unknown" label
* Drag cancelled mid-canvas without drop: dragend event fires; ensure draggingBlockId is cleared and overlay unmounts
* High-frequency dragover events: throttle position update to requestAnimationFrame to avoid layout thrashing
* Overlay appearing on wrong layer (behind blocks): ensure overlay has a high z-index and is rendered in a portal at document body level

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify drag overlay appears at cursor position when dragging a block from the library
    * ARC_FUNC_02: Verify drag overlay follows cursor smoothly during drag
    * ARC_FUNC_03: Verify drag overlay disappears when drag ends (whether dropped on canvas or cancelled)
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify overlay renders a fallback appearance when draggingBlockId is unknown
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify no lingering overlay element remains in DOM after drag cancel event

## 8. Notes & Considerations
* Alternatively, HTML5 Drag and Drop API's setDragImage() can be used to set a custom drag image without a separate overlay component; however this approach has limited styling capabilities in some browsers
* React DnD or @dnd-kit libraries provide more control over drag preview rendering and are worth evaluating if HTML5 DnD limitations are encountered
* The overlay should be rendered via React Portal (ReactDOM.createPortal) to avoid CSS containment and stacking context issues within the canvas component tree
* Keep overlay rendering lightweight; avoid expensive computations inside the dragover handler
