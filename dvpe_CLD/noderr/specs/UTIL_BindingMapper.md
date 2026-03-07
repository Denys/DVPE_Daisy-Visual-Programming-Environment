# Node Specification: UTIL_BindingMapper - Binding Path Mapper

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Service/utility for resolving parameter binding paths between UI designer elements and block parameters or ports. Parses binding path strings (e.g., "blockId.parameterId") to locate the actual ParameterDefinition or PortDefinition from the active block's definition. Used by UI_Inspector and UI_BindingEditor to map UI controls to live block state.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** TYPES_BlockDefinition
* **Input Data/State:** Binding path string (e.g., "frequency" or "blockId.frequency"), BlockDefinition or BlockInstance of the target block, SVC_BlockRegistry for resolving definition from instance

## 3. Interfaces
* **Outputs / Results:** `BindingResolutionResult` — { valid: boolean, parameter?: ParameterDefinition, port?: PortDefinition, resolvedPath: string, error?: string }; used by UI_BindingEditor to validate selections and by UI_Inspector to wire controls to parameter state
* **File Location:** src/core/bindingMapper.ts

## 4. Core Logic & Processing Steps
1. Export `resolveBinding(blockDef: BlockDefinition, bindingPath: string): BindingResolutionResult`
2. Parse bindingPath: if it contains a "." separator, split into [blockId, parameterId]; otherwise treat as a local parameter/port ID
3. Look up the parameterId in blockDef.parameters; if found, return valid result with the ParameterDefinition
4. If not found in parameters, look up in blockDef.ports; if found, return valid result with the PortDefinition
5. If not found in either, return invalid result with descriptive error message
6. Export `resolveAllBindings(blockDef: BlockDefinition): Map<string, ParameterDefinition | PortDefinition>` — returns a map of all bindable paths for UI_BindingEditor dropdown population
7. Export `formatBindingPath(blockId: string, parameterId: string): string` — canonical path formatter ensuring consistent format
8. Export `parseBindingPath(path: string): { blockId?: string, parameterId: string }` — inverse of formatBindingPath

## 5. Data Structures
* `BindingResolutionResult`:
  ```typescript
  interface BindingResolutionResult {
    valid: boolean;
    parameter?: ParameterDefinition;
    port?: PortDefinition;
    resolvedPath: string;
    error?: string;
  }
  ```
* Binding path format: `"parameterId"` (local, most common) or `"blockId.parameterId"` (cross-block, for subgraph custom blocks)

## 6. Error Handling & Edge Cases
* Unknown parameterId in binding path returns `{ valid: false, error: "Parameter 'xyz' not found in block definition" }`
* Empty binding path string returns `{ valid: false, error: "Binding path cannot be empty" }`
* Binding path referencing a port ID (for port bindings) should still resolve successfully — result contains port field, not parameter field
* For custom blocks with subgraph mode, binding paths may reference internal block parameters; recursive resolution may be needed

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify `resolveBinding(oscBlockDef, "frequency")` returns valid: true with the frequency ParameterDefinition
    * ARC_FUNC_02: Verify `resolveBinding(oscBlockDef, "nonexistent")` returns valid: false with a descriptive error string
    * ARC_FUNC_03: Verify `resolveAllBindings(blockDef)` returns a map with entries for every parameter and port in the block definition
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify resolveBinding with an empty string path returns valid: false
    * ARC_VAL_02: Verify parseBindingPath correctly splits "blockId.paramId" into { blockId: "blockId", parameterId: "paramId" }
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify resolveBinding does not throw on malformed paths (e.g., multiple dots, special characters) — returns error result instead

## 8. Notes & Considerations
* This utility is a pure function module — no React state, no side effects, fully testable in isolation
* The binding path format must be stable across serialized projects; changing the format is a breaking change requiring migration
* Future: for subgraph custom blocks, binding paths may need to traverse the internalPatch graph — this would require SVC_BlockRegistry access for recursive resolution
