# Node Specification: UI_CommentNode - Annotation Node

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Provide a canvas node for adding free-text annotations to a patch. Users double-click to enter edit mode, type their annotation, and blur or press Enter to save. Supports resizing and repositioning to help document patch intent and organize the canvas visually.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** STATE_PatchStore
* **Input Data/State:** CommentNode data from React Flow node props (id, data.text, data.width, data.height, selected); mutations dispatched to STATE_PatchStore

## 3. Interfaces
* **Outputs / Results:** Updated comment text persisted in STATE_PatchStore; resized dimensions stored in STATE_PatchStore or React Flow node data
* **File Location:** src/components/Canvas/CommentNode.tsx

## 4. Core Logic & Processing Steps
1. Render a styled div with comment text in display mode by default
2. On double-click: switch to edit mode, render a <textarea> pre-filled with current text, focus the textarea
3. On textarea blur or Enter key press: save text back to STATE_PatchStore via updateCommentNode(id, text)
4. On Escape key press: cancel edit, revert to previous text without saving
5. Render resize handles (at corners or edges) that allow the user to drag-resize the comment box
6. On resize completion: update width/height in STATE_PatchStore or React Flow node data
7. Apply selection highlight when selected=true (matching React Flow selection style)

## 5. Data Structures
* CommentNode data: `{ text: string, width: number, height: number, backgroundColor?: string }`
* STATE_PatchStore mutation: `updateCommentNode(id: string, updates: Partial<CommentNodeData>)`

## 6. Error Handling & Edge Cases
* Empty text on save: allow empty comment (user may want a visual spacer); do not delete on empty
* Very large text input: cap textarea height with overflow scroll rather than expanding the node unboundedly
* Concurrent edit if user somehow opens two canvases: last-write-wins is acceptable for this use case
* Minimum size constraint: enforce minimum width/height (e.g., 100x40px) to prevent zero-size comment nodes

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify double-click on comment node switches to textarea edit mode
    * ARC_FUNC_02: Verify edited text is persisted in STATE_PatchStore after blur or Enter
    * ARC_FUNC_03: Verify Escape key cancels edit and restores original text
    * ARC_FUNC_04: Verify resize handles update node dimensions in STATE_PatchStore
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify resize below minimum dimensions is clamped to minimum values
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify STATE_PatchStore update failure shows no crash (graceful silent failure or retry)

## 8. Notes & Considerations
* React Flow's NodeResizer component can be used to implement resize handles rather than building custom resize logic
* Comment nodes should not have port handles; they are purely visual and do not participate in the signal graph
* Consider a light transparent background (e.g., rgba(255, 255, 100, 0.05)) with a subtle border to distinguish comment nodes visually from block nodes without being distracting
* The node should be excluded from code generation; SVC_CodeGenerator should skip comment nodes when traversing the patch graph
