# Node Specification: UI_CustomBlockEditorModal - Custom Block Editor Modal

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Complex

## 1. Purpose
* **Goal:** Provide a modal dialog for editing an existing custom block definition. Allow the user to rename the block, modify its exposed ports, update its description, alter embedded patch references, or switch between patch-based and code-module modes. All changes are saved through SVC_CustomBlockManager.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** SVC_CustomBlockManager, STATE_CustomBlockStore
* **Input Data/State:** customBlockId passed when modal opens; CustomBlockDefinition loaded from STATE_CustomBlockStore; modal open/close state from STATE_UIStore

## 3. Interfaces
* **Outputs / Results:** Updated CustomBlockDefinition persisted via SVC_CustomBlockManager.update(); updated STATE_CustomBlockStore; UI_ModuleLibrary refreshes to show new name/ports
* **File Location:** src/components/Canvas/CustomBlockEditorModal.tsx

## 4. Core Logic & Processing Steps
1. Open modal with the target customBlockId; load CustomBlockDefinition from STATE_CustomBlockStore
2. Populate form fields: name input, description textarea, category selector
3. Render editable port list: each port shows id, label, direction (input/output), signalType; allow add/remove/reorder
4. Render parameter list: each parameter shows id, label, type, default value, min/max; allow add/remove
5. Show mode selector: "Patch" (internal subgraph) vs "Code Module" (raw C++ snippet)
6. On Save: validate all fields (name non-empty, port IDs unique, no duplicate parameter IDs) → call SVC_CustomBlockManager.update(customBlockId, updatedDefinition)
7. On success: close modal, emit refresh event to STATE_CustomBlockStore and UI_ModuleLibrary
8. On Cancel: close modal without saving; confirm with UI_DeleteConfirmDialog if there are unsaved changes

## 5. Data Structures
* `CustomBlockDefinition`: { id: string, name: string, description: string, category: BlockCategory, ports: PortDefinition[], parameters: ParameterDefinition[], mode: 'patch'|'code', internalPatch?: PatchData, codeModule?: string }
* `PortDefinition`: { id: string, label: string, direction: 'input'|'output', signalType: SignalType }
* `ParameterDefinition`: { id: string, label: string, type: ParameterType, defaultValue: any, min?: number, max?: number }

## 6. Error Handling & Edge Cases
* Duplicate port IDs: show validation error inline; block save until resolved
* Removing a port that is currently connected in the parent patch: warn user that existing connections to this port will be removed
* Custom block name collision with existing block: warn but allow (custom blocks are namespaced separately from built-in blocks)
* Modal opened with unknown customBlockId: show error state "Block not found" with close button

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify changes to custom block name are reflected in UI_ModuleLibrary after saving
    * ARC_FUNC_02: Verify adding a new port appears in the block's handle list on UI_BlockNode after saving
    * ARC_FUNC_03: Verify removing a port triggers a warning when that port has active connections
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify empty name field prevents saving and shows validation error
    * ARC_VAL_02: Verify duplicate port IDs within the editor show validation error
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify SVC_CustomBlockManager.update() failure shows error toast and keeps modal open
    * ARC_ERR_02: Verify opening modal with invalid customBlockId shows "Block not found" error state

## 8. Notes & Considerations
* This modal is distinct from UI_CustomBlockInternalsModal: this one edits the definition/interface; that one shows the internal patch subgraph
* Consider splitting into tabs: "Definition" (name, ports, params) and "Implementation" (patch vs code mode) if the form becomes too long
* SVC_CustomBlockManager.update() should propagate changes to all instances of the custom block currently placed on the canvas
* Tech debt: if "Code Module" mode is implemented, a code editor component (e.g., Monaco Editor or CodeMirror) will be needed within this modal
