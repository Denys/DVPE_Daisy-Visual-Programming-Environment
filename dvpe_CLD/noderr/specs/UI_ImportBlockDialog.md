# Node Specification: UI_ImportBlockDialog - Import Custom Block Dialog

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Provide a dialog for importing a custom block definition from a JSON file. Validate the imported definition against the CustomBlockDefinition schema before adding it to STATE_CustomBlockStore. Show clear error messages for invalid imports.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** STATE_CustomBlockStore
* **Input Data/State:** File selected by user via file input; opened from a toolbar action or library panel button; STATE_CustomBlockStore for collision detection

## 3. Interfaces
* **Outputs / Results:** Valid CustomBlockDefinition added to STATE_CustomBlockStore; dialog closed on success; error message shown on failure
* **File Location:** src/components/Library/ImportBlockDialog.tsx

## 4. Core Logic & Processing Steps
1. Render a modal dialog with a file input accepting .json files
2. On file selection: read file contents using FileReader API
3. Parse JSON string; catch JSON.parse errors and show "Invalid JSON format" error
4. Validate parsed object against CustomBlockDefinition schema: required fields (id, name, ports), correct field types
5. Check for ID collision with existing blocks in STATE_CustomBlockStore; if collision: offer to rename (append suffix) or abort
6. On validation success: call STATE_CustomBlockStore.addCustomBlock(definition); show success message; close dialog after brief delay
7. On validation failure: show specific error message identifying missing or invalid fields; keep dialog open for user to select a different file
8. Cancel button: close dialog without importing

## 5. Data Structures
* Expected import format: `CustomBlockDefinition` JSON (see UI_CustomBlockEditorModal for full schema)
* Validation result: `{ valid: boolean, errors: string[] }`

## 6. Error Handling & Edge Cases
* Non-JSON file selected: show "File must be a .json file"
* JSON file with wrong schema: list specific missing required fields
* ID collision: present rename option with suggested new ID (e.g., "myblock_2")
* Very large JSON file (>1MB): warn user and offer to proceed or cancel

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify a valid custom block JSON file is imported and appears in UI_ModuleLibrary under "Custom" section
    * ARC_FUNC_02: Verify successful import closes the dialog
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify invalid JSON content shows a specific error message ("Invalid JSON format") instead of importing
    * ARC_VAL_02: Verify missing required fields in the JSON shows a field-specific validation error
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify FileReader API failure (e.g., file access error) shows user-friendly error message

## 8. Notes & Considerations
* FileReader API is asynchronous; use onload/onerror event handlers and update React state accordingly
* The JSON schema validation can use a lightweight validator (e.g., Zod schema) rather than a heavy library like ajv
* Consider supporting drag-and-drop onto the dialog as an alternative to the file picker button
* Export functionality (inverse of import) should be available through a separate action in the library panel context menu for custom blocks
