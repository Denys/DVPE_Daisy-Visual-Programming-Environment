# Node Specification: UI_AlignmentToolbar - Alignment Toolbar

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Provide a floating toolbar that appears when two or more blocks are selected on the canvas. Offers one-click alignment (left, right, top, bottom) and distribution (horizontal, vertical) of the selected blocks to help users organize their patch layout cleanly.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** STATE_PatchStore
* **Input Data/State:** selectedBlockIds from STATE_UIStore; block positions (BlockInstance.position) from STATE_PatchStore; triggered whenever selectedBlockIds.length >= 2

## 3. Interfaces
* **Outputs / Results:** Updated block positions in STATE_PatchStore for all selected blocks; toolbar is shown/hidden based on selection count
* **File Location:** src/components/Canvas/AlignmentToolbar.tsx

## 4. Core Logic & Processing Steps
1. Subscribe to selectedBlockIds from STATE_UIStore
2. Conditionally render: show toolbar only when selectedBlockIds.length >= 2; hide otherwise
3. Position toolbar as floating element above or beside the selection bounding box on the canvas
4. Align Left button: compute minimum X among selected blocks; set all selected blocks' X to that value via STATE_PatchStore.alignBlocks('left', selectedBlockIds)
5. Align Right button: compute maximum (X + width) among selected blocks; align all right edges to that value
6. Align Top button: compute minimum Y; set all selected blocks' Y to that value
7. Align Bottom button: compute maximum (Y + height); align all bottom edges
8. Distribute Horizontal button: sort blocks by X, compute equal spacing between leftmost and rightmost, reposition intermediate blocks
9. Distribute Vertical button: sort blocks by Y, compute equal spacing between topmost and bottommost, reposition intermediate blocks

## 5. Data Structures
* `selectedBlockIds`: string[] from STATE_UIStore
* `BlockInstance.position`: { x: number, y: number }
* Alignment action payload: `{ type: 'left'|'right'|'top'|'bottom'|'distributeH'|'distributeV', blockIds: string[] }`

## 6. Error Handling & Edge Cases
* Single block selected (selectedBlockIds.length === 1): toolbar is hidden; no alignment action applies
* All selected blocks at same position: distribute no-ops gracefully (equal spacing is zero)
* Block width/height unknown (React Flow may not expose rendered size): use a default assumed block size (e.g., 160x80px) for alignment calculations
* Alignment action with empty selectedBlockIds: guard with early return

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify align-left sets all selected blocks to the same X coordinate as the leftmost block
    * ARC_FUNC_02: Verify align-top sets all selected blocks to the same Y coordinate as the topmost block
    * ARC_FUNC_03: Verify distribute-horizontal produces equal horizontal spacing between selected blocks
    * ARC_FUNC_04: Verify toolbar is hidden when fewer than 2 blocks are selected
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify toolbar does not appear for single-block selection
    * ARC_VAL_02: Verify alignment with 2 identical positions does not produce NaN coordinates
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify that alignment action with invalid block IDs does not crash STATE_PatchStore

## 8. Notes & Considerations
* Toolbar positioning should account for canvas zoom level; use React Flow's viewport transform to place the toolbar correctly in screen space
* Consider using a floating UI library (e.g., Floating UI / Popper.js) or simply fixed positioning offset from canvas bounds for toolbar placement
* Icons for each alignment action should clearly communicate the operation; use standard alignment icons (align-left, align-right, etc.)
* Alignment actions should be undoable; consider dispatching through an undo-aware action creator in STATE_PatchStore
