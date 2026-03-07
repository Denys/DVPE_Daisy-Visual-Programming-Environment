# Node Specification: UI_CreateBlockDialog - Create Custom Block Dialog

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Wizard dialog for creating a new custom block. The user provides: a name, an optional description, chooses between subgraph wrapping (encapsulating existing patch nodes) or code module mode (writing inline C++), and selects which ports to expose. On completion, creates an initial CustomBlockDefinition and registers it in STATE_CustomBlockStore.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** SVC_CustomBlockManager
* **Input Data/State:** Current patch selection (for subgraph mode — selected BlockInstances become the internal patch), user-provided name and description, chosen creation mode, selected ports to expose

## 3. Interfaces
* **Outputs / Results:** On successful submission, calls SVC_CustomBlockManager.createFromSubgraph() or SVC_CustomBlockManager.createFromCodeModule(); new CustomBlockDefinition appears in UI_ModuleLibrary under the Custom category; dialog closes
* **File Location:** src/components/BlockDesigner/CreateBlockDialog.tsx

## 4. Core Logic & Processing Steps
1. Open dialog (triggered from toolbar, context menu, or keyboard shortcut)
2. Step 1 — Basic Info: render name input (required, must be unique), description textarea (optional), category selector (defaults to Custom)
3. Step 2 — Mode Selection: radio choice between "Subgraph Wrapper" and "Code Module"; show explanation text for each mode
4. Step 3a (Subgraph): list BlockInstances from current selection; allow user to toggle which ports of those blocks to expose externally
5. Step 3b (Code Module): show introductory text; skip port selection (ports are declared in the code via UI_CodeModuleEditor)
6. Validate all required fields before enabling the "Create" button
7. On submit: call SVC_CustomBlockManager.createFromSubgraph(selectedNodes, exposedPorts, name, description) or SVC_CustomBlockManager.createFromCodeModule(name, description)
8. On success: close dialog, optionally open UI_BlockUIDesigner for the new block immediately
9. On failure: display error inline without closing dialog

## 5. Data Structures
* `CreateBlockPayload` — name: string, description: string, mode: 'subgraph' | 'codeModule', selectedNodeIds: string[], exposedPortIds: string[]
* `CustomBlockDefinition` — the resulting type created by SVC_CustomBlockManager

## 6. Error Handling & Edge Cases
* Name validation: non-empty, alphanumeric + spaces, must not conflict with existing block IDs
* Subgraph mode with empty selection: warn the user that no nodes are selected; allow proceeding with an empty internal patch
* Submission failure from SVC_CustomBlockManager: display error message inline; keep dialog open for retry

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify a custom block created via the dialog appears in UI_ModuleLibrary under the Custom category
    * ARC_FUNC_02: Verify subgraph mode correctly captures the selected BlockInstances into the CustomBlockDefinition.internalPatch
    * ARC_FUNC_03: Verify code module mode creates a CustomBlockDefinition with an empty codeModule ready for editing
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify the Create button is disabled when name is empty or contains invalid characters
    * ARC_VAL_02: Verify duplicate name submission is rejected with an inline error
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify SVC_CustomBlockManager failure shows an inline error without closing the dialog

## 8. Notes & Considerations
* The dialog should be a multi-step wizard with Back/Next/Create navigation
* Consider auto-populating the name field from the primary selected block's display name in subgraph mode
* On create, auto-opening UI_BlockUIDesigner improves the workflow but should be opt-in (checkbox: "Open designer after creating")
