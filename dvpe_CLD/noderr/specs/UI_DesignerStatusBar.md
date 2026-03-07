# Node Specification: UI_DesignerStatusBar - Designer Status Bar

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Status bar displayed at the bottom of the Block UI Designer workspace. Shows real-time contextual information: count of selected elements, canvas pixel dimensions, current zoom level percentage, and a dirty state indicator showing whether there are unsaved changes.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** STATE_BlockDesignerStore
* **Input Data/State:** selectedElementId (or multi-selection count in future), canvas width/height, zoomLevel, isDirty flag — all from STATE_BlockDesignerStore

## 3. Interfaces
* **Outputs / Results:** Read-only display component; no state mutations; provides user orientation information
* **File Location:** src/components/BlockDesigner/DesignerStatusBar.tsx

## 4. Core Logic & Processing Steps
1. Subscribe to STATE_BlockDesignerStore for: selectedElementId, elements count, canvasDimensions, zoomLevel, isDirty
2. Derive selectedCount: 0 if none selected, 1 if selectedElementId is set (multi-select is future scope)
3. Render a horizontal bar with sections separated by dividers:
   - Left: "X element(s) selected" or "No selection"
   - Center-left: "Canvas: [width]×[height]px"
   - Center-right: "Zoom: [zoomLevel]%"
   - Right: Dirty indicator — "Unsaved changes" badge (highlighted) when isDirty, "Saved" when clean
4. Update reactively on any STATE_BlockDesignerStore change; no user interaction required

## 5. Data Structures
* Display-only; reads: selectedElementId (string | null), elements (Map size), canvasDimensions {width, height}, zoomLevel (number), isDirty (boolean) from STATE_BlockDesignerStore

## 6. Error Handling & Edge Cases
* If STATE_BlockDesignerStore is in an undefined state during initialization, render dashes ("—") as placeholder values
* Canvas dimensions of 0 should not be displayed; show "—" instead

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify "1 element selected" is displayed when an element is selected on the canvas
    * ARC_FUNC_02: Verify "No selection" is displayed when selectedElementId is null
    * ARC_FUNC_03: Verify "Unsaved changes" indicator appears when isDirty is true and clears after save
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify zoomLevel is formatted as a percentage integer (e.g., 1.0 → "100%", 1.5 → "150%")
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify undefined/null canvas dimensions render as "—" without throwing

## 8. Notes & Considerations
* Status bar is intentionally read-only; all actions are delegated to UI_DesignerToolbar
* Future multi-select support should update selectedCount to reflect the selection set size
* Color code the dirty indicator: amber/yellow for "Unsaved changes", neutral for "Saved"
