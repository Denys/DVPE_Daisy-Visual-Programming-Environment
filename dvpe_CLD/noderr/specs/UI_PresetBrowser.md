# Node Specification: UI_PresetBrowser - UI Layout Preset Browser

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Panel for browsing and applying pre-made UI layout templates (presets) within the Block UI Designer. Presets provide starting points for common block UI patterns such as: Single Knob, Stereo Mixer (two knobs + pan), ADSR Controls (four knobs in a row), Oscillator Panel (frequency + waveform + detune), or Filter Panel. Applying a preset populates UI_DesignCanvas with the preset's UIElements.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** TYPES_UILayout
* **Input Data/State:** Static or file-loaded registry of LayoutPreset objects; current STATE_BlockDesignerStore canvas state (for checking conflicts before apply)

## 3. Interfaces
* **Outputs / Results:** On preset apply, dispatches a layout replace action to STATE_BlockDesignerStore that replaces the current UIElements with the preset's UIElements; triggers re-render of UI_DesignCanvas
* **File Location:** src/components/BlockDesigner/PresetBrowser.tsx

## 4. Core Logic & Processing Steps
1. Load LayoutPreset list from a static definition file or local storage
2. Render a scrollable grid of preset cards, each showing: preset name, thumbnail preview, and element count
3. On preset card click: if canvas has existing elements, show a confirmation dialog ("Replace current layout?")
4. On confirmation (or empty canvas): dispatch STATE_BlockDesignerStore action to replace elements with preset's UIElements array (deep cloned with new IDs to avoid reference conflicts)
5. Assign new unique IDs to all pasted elements to avoid ID collisions with any existing session elements
6. After apply: clear selection in STATE_BlockDesignerStore; mark canvas as dirty

## 5. Data Structures
* `LayoutPreset` — id: string, name: string, description: string, thumbnail: string, layout: BlockUILayout
* `BlockUILayout` — canvasWidth: number, canvasHeight: number, elements: UIElement[]

## 6. Error Handling & Edge Cases
* If preset list is empty or fails to load, show "No presets available" with a link to documentation
* Deep clone preset UIElements with regenerated IDs before inserting into STATE_BlockDesignerStore to prevent shared references
* If applying a preset that references more parameters than the target block has, binding fields will be empty (user must re-bind); show a warning

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify applying a preset replaces the current UIElements in STATE_BlockDesignerStore with the preset's elements
    * ARC_FUNC_02: Verify applied preset elements receive new unique IDs distinct from original preset IDs
    * ARC_FUNC_03: Verify a confirmation dialog is shown when applying a preset to a non-empty canvas
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify the preset browser renders a sensible empty state when no presets are available
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify a failed preset load (e.g., malformed JSON) shows an error in the panel without crashing the designer

## 8. Notes & Considerations
* Tech debt: preset storage and wiring may be incomplete; this node needs implementation audit against the actual codebase
* Preset thumbnails can be generated as small SVG previews rendered from the UIElement definitions
* Future enhancement: allow users to save their current layout as a named preset directly from this panel
