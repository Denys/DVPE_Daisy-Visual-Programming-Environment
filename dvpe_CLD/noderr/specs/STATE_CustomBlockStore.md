# Node Specification: STATE_CustomBlockStore - Custom Block Definitions

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Zustand store managing user-created custom block definitions. Custom blocks are either subgraph wrappers (encapsulating a portion of the patch graph) or inline C++ code modules (user-supplied code with declared ports). Definitions are embedded in `.dvpe` files so patches remain fully portable across machines without requiring re-import.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** TYPES_CustomBlock
* **Input Data/State:** User actions in Block Designer (create/update/delete custom blocks); patch load events (restore embedded custom defs); `SVC_CustomBlockManager` calls

## 3. Interfaces
* **Outputs / Results:** `CustomBlockDefinition` objects consumed by `SVC_BlockRegistry` (for instantiation), `UI_ModuleLibrary` (for display in library), `SVC_CustomBlockManager` (for lifecycle management); serialized definitions embedded in `.dvpe` patch JSON
* **File Location:** `src/stores/customBlockStore.ts`

## 4. Core Logic & Processing Steps
1. Store `definitions: Map<string, CustomBlockDefinition>` — keyed by custom block ID
2. `addCustomBlock(definition: CustomBlockDefinition)`:
   - Validate no duplicate ID (reject or overwrite — see Edge Cases)
   - Add to internal map
   - Call `SVC_BlockRegistry.register(definition)` to make it instantiable
3. `removeCustomBlock(id: string)`:
   - Check if any `BlockInstance` in the current patch uses this definition ID
   - If in use: warn user (return warning message or trigger UI warning); do not remove silently
   - If confirmed: remove from map; call `SVC_BlockRegistry.unregister(id)`
4. `getCustomBlock(id: string)`: retrieve `CustomBlockDefinition` by ID; return `undefined` if not found
5. `getAllCustomBlocks()`: return all definitions as array (for UI_ModuleLibrary listing)
6. `collectReferencedCustomBlocks(patchBlocks: BlockInstance[])`: scan the provided block list, find all `definitionId` values that match custom block IDs, return those `CustomBlockDefinition` objects — used during `.dvpe` serialization to embed only the definitions actually used
7. `restoreFromPatch(definitions: CustomBlockDefinition[])`: called during patch load; registers each definition into both the store and `SVC_BlockRegistry`; called before the patch graph itself is loaded

## 5. Data Structures
* `CustomBlockDefinition` extends `BlockDefinition` with additional fields:
  - `internalPatch?: SerializedPatch` — the subgraph (for subgraph-type custom blocks)
  - `exposedPorts: PortDefinition[]` — ports that appear on the outside of the custom block
  - `exposedParameters: ParameterDefinition[]` — parameters visible to the user
  - `codeModule?: CodeModuleDefinition` — inline C++ code + declarations (for code-module-type custom blocks)
  - `uiLayout?: UILayout` — custom visual layout from Block Designer

## 6. Error Handling & Edge Cases
* **Duplicate custom block ID on `addCustomBlock`:** Reject with error (do not silently overwrite production definitions); during patch restoration (`restoreFromPatch`) overwrite is acceptable since we are restoring known state
* **Removing a definition that is in use:** Return a warning/error; require explicit user confirmation before proceeding; never silently remove a def with live instances
* **`getCustomBlock` with unknown ID:** Return `undefined`; callers must handle gracefully
* **`restoreFromPatch` with unknown element types in definitions:** Warn and skip unrecognized fields; do not fail entire restore

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: `addCustomBlock()` makes the block available in `SVC_BlockRegistry` (can be `get()`-ted by ID) and visible in `UI_ModuleLibrary`
    * ARC_FUNC_02: `collectReferencedCustomBlocks()` returns all (and only) custom block definitions that have at least one instance in the provided block list — no extras, no omissions
* **Input Validation Criteria:**
    * (No separate ARC_VAL criteria — validation is embedded in FUNC and ERR checks)
* **Error Handling Criteria:**
    * ARC_ERR_01: `removeCustomBlock()` warns the user (via return value or thrown error) before removing a definition that has live instances in the current patch, rather than silently deleting it

## 8. Notes & Considerations
* Custom block definitions are embedded in the `.dvpe` JSON (not stored separately) so patches are self-contained — a patch file contains everything needed to reconstruct it
* `restoreFromPatch` must be called BEFORE `STATE_PatchStore.loadPatch()` to ensure custom block types are registered when block instances are created
* Future consideration: versioning of custom block definitions — if a definition changes, existing instances may have stale parameter values
