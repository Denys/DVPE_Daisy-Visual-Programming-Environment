# Node Specification: SVC_CustomBlockManager - Custom Block CRUD Manager

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Complex

## 1. Purpose
* **Goal:** Service managing the full lifecycle of custom block definitions — creation from subgraphs or from inline C++ code modules, serialization/deserialization, and registration into `SVC_BlockRegistry`. Acts as the bridge between user actions in the Block Designer and the central registry, encapsulating all business logic for custom block CRUD.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** SVC_BlockRegistry, STATE_CustomBlockStore, TYPES_CustomBlock
* **Input Data/State:** User confirmation from Block Designer (create/update/delete actions); serialized patch JSON (on load, for `deserialize`); current patch graph from `STATE_PatchStore` (for subgraph extraction)

## 3. Interfaces
* **Outputs / Results:** `CustomBlockDefinition` objects; registration side effects in `SVC_BlockRegistry` and `STATE_CustomBlockStore`; serialized JSON for `.dvpe` embedding
* **File Location:** `src/core/blocks/CustomBlockManager.ts`

## 4. Core Logic & Processing Steps
1. `createFromSubgraph(selectedBlockIds: string[], exposedPortMap: ExposedPortMap): CustomBlockDefinition`:
   - Extract the subgraph: copy selected `BlockInstance` objects and all `Connection` objects between them from `STATE_PatchStore`
   - Build `exposedPorts: PortDefinition[]` from `exposedPortMap` (maps internal block ports to external custom block ports)
   - Extract `exposedParameters` from the selected blocks' parameter definitions
   - Generate a unique ID (slug from user-provided name + UUID fragment)
   - Return assembled `CustomBlockDefinition` with `internalPatch` containing the extracted subgraph
2. `createFromCodeModule(name: string, codeModule: CodeModuleDefinition): CustomBlockDefinition`:
   - Validate `codeModule` has at least one port declaration
   - Wrap as `CustomBlockDefinition` with `ports` derived from `codeModule.portDeclarations`, `parameters` from `codeModule.parameterDeclarations`
   - Set `codeModule` field; no `internalPatch`
3. `register(definition: CustomBlockDefinition)`:
   - Call `SVC_BlockRegistry.register(definition)` — makes it instantiable
   - Call `STATE_CustomBlockStore.addCustomBlock(definition)` — adds to store for persistence and UI display
4. `update(id: string, updates: Partial<CustomBlockDefinition>)`:
   - Merge updates into existing definition
   - Re-register in `SVC_BlockRegistry` (overwrites existing entry)
   - Update in `STATE_CustomBlockStore`
5. `delete(id: string)`:
   - Check usage in `STATE_CustomBlockStore.removeCustomBlock(id)` (which handles the in-use warning)
   - If confirmed: call `SVC_BlockRegistry.unregister(id)`
6. `serialize(definition: CustomBlockDefinition): string`:
   - JSON serialize the definition for embedding in `.dvpe` file
7. `deserialize(json: string): CustomBlockDefinition`:
   - Parse JSON; validate structure; return typed `CustomBlockDefinition`
   - Called during patch load before registering into store

## 5. Data Structures
* `ExposedPortMap: { internalBlockId: string, internalPortId: string, externalPortId: string, externalLabel: string }[]` — describes which internal ports become external ports on the custom block
* `CodeModuleDefinition { code: string, portDeclarations: PortDeclaration[], parameterDeclarations: ParameterDeclaration[], includes: string[] }` — raw user C++ code with metadata

## 6. Error Handling & Edge Cases
* **Duplicate custom block ID on create:** If generated ID collides with existing definition, append numeric suffix until unique; do not silently overwrite
* **Subgraph with no valid exposed ports:** Warn user that the custom block would have no external connections; require at least one exposed port
* **`deserialize` with malformed JSON:** Throw typed `DeserializationError` with message; caller handles by showing error toast
* **Code module with no port declarations:** Reject `createFromCodeModule` with validation error — a block with no ports cannot connect to anything

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: `createFromSubgraph()` generates `exposedPorts` that exactly match the ports described in `exposedPortMap` — correct IDs, labels, and signal types
    * ARC_FUNC_02: After `register()`, the custom block is retrievable via `SVC_BlockRegistry.get(id)` and appears in `STATE_CustomBlockStore.getAllCustomBlocks()`
* **Input Validation Criteria:**
    * (Covered by ERR criteria)
* **Error Handling Criteria:**
    * ARC_ERR_01: `createFromSubgraph()` or `register()` with a duplicate ID appends a suffix or throws a typed error rather than silently overwriting an existing definition

## 8. Notes & Considerations
* TECH DEBT: Needs audit to confirm all code paths are exercised, particularly the subgraph extraction logic for complex multi-block selections
* Custom blocks with `codeModule` require special handling in `SVC_CodeGenerator` — the user's raw C++ is inlined directly rather than using DaisySP class calls
* `update()` must handle the case where existing instances of the block are in the current patch — their `parameterValues` may be stale if parameter definitions changed; consider a migration strategy
* This class has no default export — import named functions or the class instance as appropriate
