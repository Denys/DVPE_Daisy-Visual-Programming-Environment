# Node Specification: UI_ModuleLibrary - Block Library Panel

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Provide the left panel listing all available DSP blocks organized by category. Allow users to drag blocks onto the canvas to instantiate them. Show both built-in blocks (from SVC_BlockRegistry) and user-created custom blocks (from STATE_CustomBlockStore) with the custom blocks in a dedicated "Custom" section.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** SVC_BlockRegistry, STATE_CustomBlockStore
* **Input Data/State:** All BlockDefinitions from SVC_BlockRegistry; CustomBlockDefinitions from STATE_CustomBlockStore; search/filter query from local state or STATE_UIStore

## 3. Interfaces
* **Outputs / Results:** draggingBlockId set in STATE_UIStore when drag begins; definitionId passed as drag data to UI_Canvas drop handler; visual library panel rendered in left sidebar
* **File Location:** src/components/Library/ModuleLibrary.tsx

## 4. Core Logic & Processing Steps
1. On mount: call SVC_BlockRegistry.getAllCategories() to get category list; load all BlockDefinitions per category
2. Subscribe to STATE_CustomBlockStore for custom block list
3. Render collapsible accordion sections, one per category (Sources, Filters, Effects, Modulators, Dynamics, User I/O, Utility, Drums, Physical Modeling)
4. Append a "Custom" section at the end for STATE_CustomBlockStore entries
5. Each block item is rendered as a draggable row with display name and category color accent
6. On drag start: set STATE_UIStore.draggingBlockId = definitionId; set drag data via event.dataTransfer.setData('definitionId', id)
7. On drag end: clear STATE_UIStore.draggingBlockId
8. Search input (if present): filter visible block items by name (case-insensitive substring match)
9. Right-click on a custom block item: show "Edit" and "Delete" context menu options

## 5. Data Structures
* `BlockCategory`: enum of all block categories
* `BlockDefinition`: { id: string, displayName: string, category: BlockCategory, ... }
* `CustomBlockDefinition`: { id: string, name: string, category: BlockCategory, ... }
* Library item shape: `{ definitionId: string, displayName: string, category: string, isCustom: boolean }`

## 6. Error Handling & Edge Cases
* SVC_BlockRegistry returns empty: show "No blocks available" placeholder; not expected in normal operation
* Very large block library (200+ blocks): virtualize the list if performance degrades; collapsible categories already limit visible items
* Custom block definition deleted while placed on canvas: orphaned canvas instances show "Unknown Block" per UI_BlockNode spec
* Search returning no results: show "No matching blocks" empty state within the panel

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify all 200+ built-in blocks appear in their correct categories
    * ARC_FUNC_02: Verify dragging a block from the library to the canvas creates the correct block type (correct definitionId) in STATE_PatchStore
    * ARC_FUNC_03: Verify custom blocks appear in the "Custom" section after being created
    * ARC_FUNC_04: Verify search/filter input narrows the visible block list correctly
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify empty search query shows all blocks (no filtering)
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify SVC_BlockRegistry.getAllCategories() failure shows an error message in the panel rather than crashing the application

## 8. Notes & Considerations
* Categories should be collapsible with persist state per session (e.g., Sources expanded by default, Drums collapsed) stored in STATE_UIStore or localStorage
* Block items can show a tooltip on hover with a brief description from BlockDefinition.description
* The library panel may also show a "Favorites" pinned section in the future; spec should accommodate this with a pin icon on each block item
* Drag behavior for touch devices requires pointer events or a DnD library since HTML5 drag API has limited touch support
