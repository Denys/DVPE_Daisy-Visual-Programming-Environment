# Node Specification: TYPES_CustomBlock - Custom Block Type Definitions

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** TypeScript types for user-defined custom blocks. Custom blocks are either subgraph wrappers (encapsulating an internal patch as a reusable block) or code modules (inline C++ logic written by the user). These types extend the core BlockDefinition system to support these two custom modes.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** TYPES_BlockDefinition
* **Input Data/State:** TYPES_BlockDefinition (BlockDefinition, PortDefinition, ParameterDefinition, PatchGraph interfaces)

## 3. Interfaces
* **Outputs / Results:** Exported TypeScript types: PortBinding, CodeModuleDefinition, CustomBlockDefinition; consumed by STATE_CustomBlockStore, SVC_CustomBlockManager, UI_BlockUIDesigner, UI_CodeModuleEditor, SVC_CodeGenerator
* **File Location:** src/types/customBlock.ts

## 4. Core Logic & Processing Steps
1. Define `PortBinding` interface: port declaration for code module mode
   - { id: string, name: string, direction: 'input' | 'output', signalType: SignalType }
2. Define `StateVarDeclaration` interface: declared C++ state variable
   - { name: string, cppType: string, initialValue: string }
3. Define `CodeModuleDefinition` interface: the user-authored C++ code with metadata
   - { code: string, declaredPorts: PortBinding[], declaredStateVars: StateVarDeclaration[], lastModified?: string }
4. Define `ExposedPort` interface: a port from an internal block exposed at the custom block boundary
   - { internalBlockId: string, internalPortId: string, externalPortId: string, externalName?: string }
5. Define `CustomBlockDefinition` interface extending BlockDefinition:
   - All BlockDefinition fields (id, className, displayName, category, parameters, ports, colorScheme)
   - `isCustom`: true (discriminator flag)
   - `mode`: 'subgraph' | 'codeModule'
   - `internalPatch`?: PatchGraph (for subgraph mode — the encapsulated blocks and connections)
   - `exposedPorts`: ExposedPort[] (which internal ports are visible at the custom block boundary)
   - `exposedParameters`?: string[] (which internal parameter IDs are surfaced as custom block parameters)
   - `codeModule`?: CodeModuleDefinition (for code module mode — the user-written C++)
   - `uiLayout`?: BlockUILayout (optional custom Inspector UI layout from Block UI Designer)
   - `createdAt`: string (ISO timestamp)
   - `updatedAt`: string (ISO timestamp)

## 5. Data Structures
* CustomBlockDefinition is a superset of BlockDefinition — it satisfies the BlockDefinition interface plus additional custom fields
* The `isCustom: true` flag allows runtime discrimination between standard library blocks and user-created blocks
* `mode` discriminates between subgraph (internalPatch is set) and codeModule (codeModule is set) variants

## 6. Error Handling & Edge Cases
* A CustomBlockDefinition in subgraph mode must have internalPatch defined; in codeModule mode it must have codeModule defined; validation should enforce this
* ExposedPort references (internalBlockId, internalPortId) must resolve to actual blocks and ports within the internalPatch — stale references indicate a consistency error
* uiLayout is optional — if absent, the Inspector falls back to auto-generating controls from the parameters array

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify CustomBlockDefinition satisfies the BlockDefinition interface (TypeScript assignability)
    * ARC_FUNC_02: Verify `isCustom: true` discriminator allows runtime type narrowing from BlockDefinition to CustomBlockDefinition
    * ARC_FUNC_03: Verify SVC_CodeGenerator reads codeModule.code for codeModule-mode blocks and emits it verbatim in the generated C++ process() body
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify TypeScript enforces that either internalPatch or codeModule is present (not both absent) — may require a discriminated union or runtime validation
    * ARC_VAL_02: Verify ExposedPort internalBlockId references are validated against the internalPatch.blocks array on save
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify SVC_CustomBlockManager.createFromSubgraph() validates exposed port references before creating the CustomBlockDefinition

## 8. Notes & Considerations
* CustomBlockDefinition extends BlockDefinition structurally in TypeScript — avoid using `extends` on the interface if BlockDefinition is a simple interface to prevent runtime issues; use intersection type if needed
* uiLayout field points to TYPES_UILayout — circular dependency risk if UILayout also imports from this file; check import chain
* The `createdAt`/`updatedAt` fields are for metadata tracking; SVC_CustomBlockManager should set these automatically
