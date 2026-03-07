# Node Specification: SVC_ExportService - Export Service

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Handles all file export operations for the DVPE application: generating C++ code from the current patch, packaging it into a ZIP archive for download, saving the patch as a `.dvpe` JSON file, and providing code preview text for the export modal UI. Abstracts the difference between Tauri native file dialogs and browser download fallback.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** SVC_CodeGenerator
* **Input Data/State:** Current patch state from `STATE_PatchStore`; custom block definitions from `STATE_CustomBlockStore`; `GeneratedCode` from `SVC_CodeGenerator.generate()`

## 3. Interfaces
* **Outputs / Results:** Downloaded ZIP file (C++ export) or JSON file (`.dvpe` patch export) delivered to user's filesystem; preview string returned for UI display
* **File Location:** `src/codegen/exportService.ts`

## 4. Core Logic & Processing Steps
1. `exportPatch(): string`:
   - Serialize current `STATE_PatchStore` state via `getPatch()`
   - Collect referenced custom block definitions via `STATE_CustomBlockStore.collectReferencedCustomBlocks()`
   - Assemble `SerializedProject { version, patch, customBlocks }` and JSON stringify
   - Return JSON string (caller handles download trigger)
2. `previewCode(): GeneratedCode`:
   - Call `SVC_CodeGenerator.generate()` with current patch and hardware config
   - Return full `GeneratedCode` object (caller displays `mainCpp`, `makefile`, errors, warnings in UI)
   - Does NOT trigger any download
3. `downloadExport(): Promise<void>`:
   - Call `SVC_CodeGenerator.generate()`; if `errors.length > 0`, throw or return error to caller (do not download)
   - Create `JSZip` instance; add `main.cpp` with `generatedCode.mainCpp`; add `Makefile` with `generatedCode.makefile`
   - Generate ZIP as `Blob`
   - Call `downloadFile(blob, "patch_export.zip", "application/zip")`
4. `downloadPatch(): Promise<void>`:
   - Call `exportPatch()` to get JSON string
   - Call `downloadFile(json, "patch.dvpe", "application/json")`
5. `downloadFile(content: string | Blob, filename: string, mimeType: string): Promise<void>`:
   - Try Tauri: if `window.__TAURI__` is defined, call `dialog.save({ defaultPath: filename })` to get user-chosen save path, then `fs.writeFile()` to write content
   - Fallback (web/browser): create `Blob` from content, create hidden `<a>` element with `href = URL.createObjectURL(blob)` and `download = filename`, programmatically click, then revoke object URL

## 5. Data Structures
* Uses `GeneratedCode { mainCpp: string, makefile: string, errors: string[], warnings: string[] }` from `SVC_CodeGenerator`
* Uses `SerializedProject { version: string, patch: SerializedPatch, customBlocks: CustomBlockDefinition[] }` for `.dvpe` format
* ZIP: created via JSZip 3.10.1

## 6. Error Handling & Edge Cases
* **Code generation errors (non-empty `errors[]`):** Do not proceed with download; surface errors to the Export Modal UI for display; emit `warnings[]` as non-blocking notices
* **Tauri file dialog cancelled by user:** User pressed Cancel — treat as no-op, no download, no error toast
* **Tauri `fs.writeFile()` failure:** Catch and rethrow as user-facing error with message "Failed to save file: [system error]"
* **Browser fallback object URL leak:** Always call `URL.revokeObjectURL()` in a `setTimeout(0)` or `finally` block after anchor click
* **Empty patch on export:** Proceed with export (generates minimal code skeleton); show warning in `GeneratedCode.warnings`

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: `downloadExport()` produces a ZIP file containing exactly `main.cpp` and `Makefile` as top-level entries
    * ARC_FUNC_02: `exportPatch()` produces valid JSON that can be parsed and re-imported by `UI_App` load logic without data loss
* **Input Validation Criteria:**
    * (Covered by ERR_01)
* **Error Handling Criteria:**
    * ARC_ERR_01: When `SVC_CodeGenerator.generate()` returns non-empty `errors[]`, `downloadExport()` does not produce or trigger a download and instead surfaces the error messages to the caller

## 8. Notes & Considerations
* JSZip version 3.10.1 for ZIP generation
* file-saver 2.0.5 may be used as an alternative to the manual anchor-click approach for browser download fallback — check current implementation
* Tauri integration uses `@tauri-apps/api/dialog` and `@tauri-apps/api/fs`; these must be dynamically imported or guarded with `window.__TAURI__` checks to avoid breaking the web (non-Tauri) build
* The `.dvpe` file extension is custom to this application; MIME type `application/json` is used since it is valid JSON
