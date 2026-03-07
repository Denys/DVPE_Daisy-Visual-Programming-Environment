# Node Specification: UI_CustomBlockInternalsModal - Custom Block Internals Viewer

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Show the internal subgraph patch that defines a custom block's behavior. Renders a mini React Flow canvas (read-only by default) displaying the blocks and connections that make up the custom block's implementation, including how the exposed ports map to internal connections.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** STATE_CustomBlockStore
* **Input Data/State:** customBlockId to open; CustomBlockDefinition.internalPatch (PatchData) from STATE_CustomBlockStore; modal open/close state from STATE_UIStore

## 3. Interfaces
* **Outputs / Results:** Read-only visual representation of the internal patch; optionally allows navigation into sub-blocks; close event returns to parent canvas without state changes
* **File Location:** src/components/Canvas/CustomBlockInternalsModal.tsx

## 4. Core Logic & Processing Steps
1. Open modal with target customBlockId
2. Load CustomBlockDefinition from STATE_CustomBlockStore, extract internalPatch
3. Initialize a read-only React Flow instance with nodes and edges from internalPatch
4. Render special "interface boundary" nodes showing exposed input/output ports and how they connect to the internal graph
5. Apply pan/zoom within the mini canvas; fit-to-view on open
6. Disable edge creation and block dragging (read-only mode)
7. Optionally: show an "Edit" button that opens UI_CustomBlockEditorModal for the same block
8. Close button dismisses modal

## 5. Data Structures
* `PatchData`: { blocks: BlockInstance[], connections: Connection[], commentNodes: CommentNodeData[] }
* `InterfaceBoundaryNode`: { portId: string, portLabel: string, direction: 'input'|'output', signalType: SignalType }

## 6. Error Handling & Edge Cases
* Custom block with mode='code' (no internalPatch): show the raw C++ code snippet in a code viewer instead of the React Flow canvas
* Empty internalPatch (no blocks or connections): show a placeholder message "Internal patch is empty"
* customBlockId not found in STATE_CustomBlockStore: show error state "Block not found"
* Deeply nested custom blocks (custom block containing another custom block): render inner custom block as a collapsed block node; do not recursively expand

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify internal patch blocks and connections are rendered in the mini React Flow canvas
    * ARC_FUNC_02: Verify interface boundary nodes show the exposed ports and their connections into the internal graph
    * ARC_FUNC_03: Verify read-only mode prevents adding/removing blocks or connections in the internal view
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify modal shows code viewer for code-mode custom blocks instead of React Flow canvas
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify missing internalPatch data renders a clear "Internal patch is empty" placeholder
    * ARC_ERR_02: Verify invalid customBlockId renders error state without crashing

## 8. Notes & Considerations
* React Flow supports multiple independent instances on the same page; this modal creates a second instance scoped to the modal
* Fit-to-view should be called after the mini canvas mounts and after React Flow has calculated node positions
* The modal could potentially support edit mode in a future iteration, allowing users to modify the internal patch directly; this would require careful state management to avoid corrupting the parent patch
* Consider using a smaller node scale or zoom-out default for the internal view since the internal patch may have many blocks
