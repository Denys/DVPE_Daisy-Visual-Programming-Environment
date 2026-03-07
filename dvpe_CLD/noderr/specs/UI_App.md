# Node Specification: UI_App - Main App Shell

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Critical

## 1. Purpose
* **Goal:** Top-level React component that manages the overall application shell. Renders the resizable 3-panel layout (Library | Canvas | Inspector), handles file I/O for loading and saving `.dvpe` patches, routes modal dialogs (architecture config, block designer, help), and integrates with Tauri for native file dialogs when available.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** STATE_PatchStore, STATE_UIStore, STATE_CustomBlockStore, SVC_ExportService
* **Input Data/State:** Zustand stores (patch graph, UI state, custom block definitions); filesystem events (file open/save); keyboard shortcut events

## 3. Interfaces
* **Outputs / Results:** Rendered application shell with all panels mounted; triggers store mutations on file load/save; opens/closes modals via STATE_UIStore
* **File Location:** `src/App.tsx`

## 4. Core Logic & Processing Steps
1. Initialize Zustand stores on mount (stores are singletons, but any startup side-effects are triggered here)
2. Render resizable 3-panel layout using `react-resizable-panels`: Library panel (left), Canvas panel (center), Inspector panel (right)
3. Bind keyboard shortcuts via `react-hotkeys-hook` (Ctrl+S save, Ctrl+Z undo, Ctrl+Y redo, Ctrl+A select all, Delete remove selected, etc.)
4. On file open: try Tauri dialog (`dialog.open()`), fallback to browser `<input type="file">` File API; read file content as text
5. Deserialize loaded `.dvpe` JSON: parse `SerializedProject`; restore custom block definitions into `STATE_CustomBlockStore` first, then load patch graph into `STATE_PatchStore`
6. On file save: serialize current patch via `STATE_PatchStore.getPatch()` + `STATE_CustomBlockStore.collectReferencedCustomBlocks()`; try Tauri `dialog.save()`, fallback to browser anchor-click download
7. Route modals based on `STATE_UIStore.activeModal`: render `<ArchitectureModal>`, `<BlockDesignerModal>`, `<ShortcutsHelpModal>` conditionally
8. Show toast notifications via `sonner` library on save/export success or error
9. Track dirty state: show "●" indicator in title bar when patch has unsaved changes

## 5. Data Structures
* `SerializedProject = { version: string, patch: SerializedPatch, customBlocks: CustomBlockDefinition[] }` — top-level `.dvpe` file format

## 6. Error Handling & Edge Cases
* **Tauri unavailable (web mode):** Falls back to browser File API for open and anchor-click for save; all functionality preserved
* **Dirty state on new/load:** Prompt user to confirm discarding unsaved changes before proceeding
* **Corrupt/invalid `.dvpe` file:** Catch JSON parse errors and deserialization errors; show error toast, do not modify current patch state
* **Missing custom block definitions on load:** Warn user which blocks are missing; load remaining patch with placeholders

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Loading a `.dvpe` file correctly restores all blocks, connections, and custom block definitions to their saved state
    * ARC_FUNC_02: Saving produces valid JSON with correct `version` field and all patch data intact
* **Input Validation Criteria:**
    * ARC_VAL_01: Corrupt or invalid `.dvpe` files show an error toast instead of crashing the application
* **Error Handling Criteria:**
    * ARC_ERR_01: Application degrades gracefully when Tauri file dialogs are unavailable, using browser File API fallback without user-visible errors

## 8. Notes & Considerations
* `isDirty` flag is tracked in `STATE_PatchStore` and reflected as "●" prefix in the document title bar
* Undo/redo history is stored in `STATE_PatchStore` with a 50-entry limit
* Panel widths are persisted via `STATE_UIStore` Zustand persist middleware (localStorage)
* Tauri integration uses `@tauri-apps/api/dialog` and `@tauri-apps/api/fs`; these imports must be dynamic or guarded to avoid breaking the web build
