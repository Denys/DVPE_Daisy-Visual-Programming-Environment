# Node Specification: UI_BlockContextMenu - Block Context Menu

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Provide a right-click context menu on canvas blocks. Offer quick-access actions: Delete, Duplicate, Set Label, Inspect, Collapse/Expand, and for custom blocks, Edit Definition.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** STATE_PatchStore
* **Input Data/State:** blockId and isCustomBlock flag from the right-clicked block; current block label from STATE_PatchStore; menu open/close state and cursor position from local state

## 3. Interfaces
* **Outputs / Results:** State mutations in STATE_PatchStore (delete, duplicate, set label) and STATE_UIStore (inspect, open modal); menu closes after action selection
* **File Location:** src/components/Library/BlockContextMenu.tsx

## 4. Core Logic & Processing Steps
1. Triggered by right-click (onContextMenu) event on a UI_BlockNode
2. Receive blockId, canvas coordinates (menuX, menuY), isCustomBlock boolean
3. Render a floating menu at (menuX, menuY) with the following items:
   - "Inspect" → set STATE_UIStore.inspectedBlockId = blockId; close menu
   - "Duplicate" → create new BlockInstance with same definitionId and parameters, offset position by (+20, +20); call STATE_PatchStore.addBlock(); close menu
   - "Set Label" → show inline text input at menu position; on confirm call STATE_PatchStore.setBlockLabel(blockId, newLabel); close menu
   - "Collapse" / "Expand" → toggle block collapsed state in STATE_PatchStore
   - "Edit Definition" (custom blocks only) → open UI_CustomBlockEditorModal with blockId; close menu
   - "Delete" → call STATE_PatchStore.removeBlock(blockId); close menu (optionally preceded by UI_DeleteConfirmDialog)
4. Clicking outside menu or pressing Escape: close menu without action
5. Position menu within viewport bounds: if menu would overflow right or bottom edge, adjust anchor to open left or upward

## 5. Data Structures
* Menu trigger props: `{ blockId: string, menuX: number, menuY: number, isCustomBlock: boolean }`
* MenuItem shape: `{ label: string, icon?: React.ReactNode, action: () => void, isDanger?: boolean }`

## 6. Error Handling & Edge Cases
* blockId not found in STATE_PatchStore when action fires (deleted between open and click): silently ignore action, close menu
* "Set Label" with empty string: allow clearing label (sets label back to display name)
* Menu opens near viewport edge: reposition to stay within visible area
* Multiple right-clicks without closing: replace current menu with new menu at new position

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify "Delete" removes the block and all its connections from STATE_PatchStore
    * ARC_FUNC_02: Verify "Duplicate" creates a new block with the same definitionId at an offset position
    * ARC_FUNC_03: Verify "Inspect" sets the correct inspectedBlockId in STATE_UIStore
    * ARC_FUNC_04: Verify "Edit Definition" option only appears for custom blocks
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify context menu does not appear when right-clicking on canvas background (only on block nodes)
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify action on a deleted blockId does not crash (graceful no-op)

## 8. Notes & Considerations
* Menu should close on scroll events to prevent misaligned menus after canvas pan
* The "Delete" action for blocks with many connections should ideally show a count ("Delete block and 5 connections?") rather than a generic confirmation
* Keyboard navigation through menu items (arrow keys, Enter to confirm) improves accessibility
* This context menu pattern is reused; consider a generic ContextMenu component that accepts MenuItem arrays and position, used by both block context menus and canvas background context menus
