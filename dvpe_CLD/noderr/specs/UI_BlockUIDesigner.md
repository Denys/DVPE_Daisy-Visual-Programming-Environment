# Node Specification: UI_BlockUIDesigner - Block UI Designer Workspace

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Complex

## 1. Purpose
* **Goal:** The main workspace for designing custom block UI layouts. Users drag UI elements (knobs, sliders, LEDs, labels) from a panel onto a design canvas, position and size them, then bind them to block parameters or ports. The resulting layout defines how the custom block looks in the Inspector.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** STATE_BlockDesignerStore, STATE_CustomBlockStore, UI_DesignCanvas, UI_ElementLibraryPanel, UI_PropertyEditor, UI_BindingEditor, UI_CreateBlockDialog, UI_CodeModuleEditor, UI_DesignerToolbar, UI_DesignerStatusBar, UI_PresetBrowser
* **Input Data/State:** Active custom block being designed (from STATE_CustomBlockStore), existing UILayout if editing a saved block, available parameter and port definitions from the block's BlockDefinition

## 3. Interfaces
* **Outputs / Results:** Updated CustomBlockDefinition.uiLayout saved to STATE_CustomBlockStore; triggers re-render of any Inspector instances showing the block
* **File Location:** src/components/BlockDesigner/BlockUIDesigner.tsx

## 4. Core Logic & Processing Steps
1. Initialize designer state in STATE_BlockDesignerStore (clear selected element, reset history)
2. If editing an existing block, load its CustomBlockDefinition.uiLayout into STATE_BlockDesignerStore
3. Render 3-panel layout: UI_ElementLibraryPanel (left), UI_DesignCanvas (center), UI_PropertyEditor + UI_BindingEditor (right)
4. Render UI_DesignerToolbar at top and UI_DesignerStatusBar at bottom
5. Handle element drag events from UI_ElementLibraryPanel: on drop onto canvas, create new UIElement entry in STATE_BlockDesignerStore with default size and position
6. Handle element selection in STATE_BlockDesignerStore: propagate selected element ID to UI_PropertyEditor and UI_BindingEditor
7. On save action (from UI_DesignerToolbar or keyboard shortcut): serialize current STATE_BlockDesignerStore layout to CustomBlockDefinition.uiLayout and call STATE_CustomBlockStore update
8. On preview action: render a read-only preview of the designed layout as it will appear in the Inspector

## 5. Data Structures
* `UIElement` — individual draggable element on the canvas (id, type, position, size, properties, binding)
* `BlockUILayout` — full layout: array of UIElements with canvas dimensions
* `CustomBlockDefinition` — extends BlockDefinition with uiLayout field

## 6. Error Handling & Edge Cases
* If no block is selected for design, show empty state with prompt to create or select a custom block
* If an element is dropped outside the canvas bounds, clamp position to canvas edges
* If the block definition has no parameters, BindingEditor shows an empty state message
* Unsaved changes warning when user attempts to close the designer with a dirty state

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify dragging a knob element from UI_ElementLibraryPanel onto UI_DesignCanvas creates a new UIElement of type RotaryKnob in STATE_BlockDesignerStore with default position and size
    * ARC_FUNC_02: Verify saving the layout calls STATE_CustomBlockStore update and the CustomBlockDefinition.uiLayout reflects all current UIElements
    * ARC_FUNC_03: Verify loading an existing custom block populates the canvas with its saved UIElements
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify that attempting to open the designer without an active custom block target shows an appropriate empty/error state
    * ARC_VAL_02: Verify element position values are clamped to canvas bounds (0 to canvas width/height)
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify closing with unsaved changes displays a confirmation dialog before discarding state

## 8. Notes & Considerations
* TODO status — needs spec verification and full test coverage
* Undo/redo history for designer operations should be scoped to STATE_BlockDesignerStore and not bleed into the main patch undo stack
* Preview mode should re-use Inspector rendering logic to guarantee WYSIWYG accuracy
