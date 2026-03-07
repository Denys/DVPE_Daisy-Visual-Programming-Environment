# Node Specification: UI_DesignerToolbar - Designer Toolbar

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Toolbar in the Block UI Designer providing tool controls and actions: pointer/select tool, move tool, snap-to-grid toggle, zoom in/out/reset, save layout, preview mode toggle, undo, and redo for designer-scoped operations.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** STATE_BlockDesignerStore
* **Input Data/State:** Current active tool from STATE_BlockDesignerStore, snap-to-grid setting, zoom level, undo/redo stack availability (canUndo, canRedo), dirty state flag

## 3. Interfaces
* **Outputs / Results:** Dispatches tool change, zoom change, snap toggle, undo, redo, and save actions to STATE_BlockDesignerStore; save action triggers STATE_CustomBlockStore update
* **File Location:** src/components/BlockDesigner/DesignerToolbar.tsx

## 4. Core Logic & Processing Steps
1. Read current state from STATE_BlockDesignerStore (activeTool, snapEnabled, zoomLevel, canUndo, canRedo, isDirty)
2. Render toolbar buttons grouped by function: Tools | Grid | Zoom | History | File
3. Tool group: Pointer (select/resize) and Move tool buttons; highlight active tool
4. Grid group: Snap-to-Grid toggle button with current snap state indicator
5. Zoom group: Zoom In (+), Zoom Out (-), Reset Zoom (100%) buttons; display current zoom percentage
6. History group: Undo button (disabled when canUndo is false), Redo button (disabled when canRedo is false)
7. File group: Save button (highlighted/pulsing when isDirty), Preview toggle
8. All actions dispatch corresponding state updates to STATE_BlockDesignerStore
9. Keyboard shortcut hints shown as tooltips on each button

## 5. Data Structures
* `DesignerTool` — enum: 'select' | 'move'
* Toolbar reads: activeTool, snapEnabled, zoomLevel (number, e.g., 1.0 = 100%), canUndo, canRedo, isDirty from STATE_BlockDesignerStore

## 6. Error Handling & Edge Cases
* Zoom level clamped to a valid range (e.g., 0.25x to 4x); buttons disable at the limits
* Save button is a no-op if isDirty is false (no unsaved changes)
* Undo/Redo buttons are disabled when the respective stack is empty

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify clicking Snap-to-Grid toggles STATE_BlockDesignerStore.snapEnabled and updates grid visibility on UI_DesignCanvas
    * ARC_FUNC_02: Verify Undo button dispatches undo action and is disabled when canUndo is false
    * ARC_FUNC_03: Verify Save button triggers layout serialization and STATE_CustomBlockStore update
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify Zoom In button disables when zoom level reaches the maximum (4x)
    * ARC_VAL_02: Verify Zoom Out button disables when zoom level reaches the minimum (0.25x)
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify Save action failure surfaces an error notification without corrupting STATE_BlockDesignerStore

## 8. Notes & Considerations
* Keyboard shortcuts for toolbar actions should be registered via HOOK_ParameterShortcuts or a designer-scoped hotkey hook
* The toolbar should be visually distinct from the main application toolbar to avoid confusion when the designer is embedded in the main UI
