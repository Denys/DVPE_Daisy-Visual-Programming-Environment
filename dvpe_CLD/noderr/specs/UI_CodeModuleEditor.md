# Node Specification: UI_CodeModuleEditor - C++ Code Module Editor

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Complex

## 1. Purpose
* **Goal:** Monaco editor-based interface for writing inline C++ code for a custom block. The user writes the C++ implementation of the block's process() method, declares input/output ports and state variables using special comment syntax. This code becomes the block's audio processing logic in the generated firmware.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** @monaco-editor/react, TYPES_CustomBlock
* **Input Data/State:** CodeModuleDefinition from the active CustomBlockDefinition (existing code if editing); block name and metadata for template generation

## 3. Interfaces
* **Outputs / Results:** Updated CodeModuleDefinition saved to CustomBlockDefinition.codeModule in STATE_CustomBlockStore; the code is used by SVC_CodeGenerator to emit C++ for the custom block's process() body
* **File Location:** src/components/BlockDesigner/CodeModuleEditor.tsx

## 4. Core Logic & Processing Steps
1. Render Monaco editor configured for C++ language mode with syntax highlighting
2. If no existing code: populate with boilerplate template including comment-based port declaration syntax and a stub process() method
3. Load existing code from CustomBlockDefinition.codeModule.code if present
4. Provide a toolbar with: Save, Reset to Template, Copy to Clipboard, Format
5. Parse port declarations from special comment annotations (e.g., `// @port input audio in_signal` and `// @port output audio out_signal`) to extract port definitions
6. On save: serialize editor content into CodeModuleDefinition { code: string, declaredPorts: PortBinding[], declaredStateVars: string[] }; update STATE_CustomBlockStore
7. Show a "Ports Parsed" section below the editor listing detected port declarations for verification
8. Optionally show a panel with Daisy API reference snippets (class names, common methods) for user reference

## 5. Data Structures
* `CodeModuleDefinition` — code: string, declaredPorts: PortBinding[], declaredStateVars: string[]
* `PortBinding` — id: string, name: string, direction: 'input' | 'output', signalType: SignalType
* Boilerplate template structure:
  ```cpp
  // @port input audio in_signal
  // @port output audio out_signal
  // @state float myParam = 0.5f;

  // Called once at initialization
  void init(float sample_rate) {
    // setup code
  }

  // Called per sample in audio callback
  float process(float in_signal) {
    return in_signal * myParam;
  }
  ```

## 6. Error Handling & Edge Cases
* If Monaco fails to load (network/module error), fall back to a plain `<textarea>` with a warning banner
* Port annotation parse errors should be shown as warnings in the "Ports Parsed" section without preventing save
* Unsaved changes indicator (dirty flag) when editor content differs from the last saved CodeModuleDefinition

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify C++ code written in the editor is saved into CustomBlockDefinition.codeModule.code on save action
    * ARC_FUNC_02: Verify port annotations in the code are parsed and listed in the "Ports Parsed" section
    * ARC_FUNC_03: Verify the boilerplate template is inserted for new blocks with no existing codeModule
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify the editor displays an unsaved changes indicator when content is modified
    * ARC_VAL_02: Verify save button is only active when the editor content differs from the saved state (dirty check)
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify Monaco load failure degrades gracefully to a textarea fallback with a user-visible warning

## 8. Notes & Considerations
* Monaco provides C++ syntax highlighting out of the box; Daisy/DaisySP autocomplete is a future enhancement requiring a custom language server or snippet file
* The port annotation syntax is a DVPE-specific convention; it must be documented clearly in the boilerplate template
* SVC_CodeGenerator must be aware of the CodeModuleDefinition format to correctly emit the custom block's C++ in the final generated firmware file
