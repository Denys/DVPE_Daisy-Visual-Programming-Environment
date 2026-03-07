# Node Specification: SVC_BlockRegistry - Block Definition Registry

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Critical

## 1. Purpose
* **Goal:** Central registry (singleton module) that imports and catalogs ALL `BlockDefinition` objects — 200+ built-in blocks across all categories plus custom blocks registered at runtime. Serves as the single authoritative source of block templates for block instantiation, code generation, and the module library UI.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** All `BLOCKS_*` category definition files (oscillators, filters, effects, modulators, etc.), `TYPES_BlockDefinition`
* **Input Data/State:** Static imports of all definition files at module initialization; dynamic `register()`/`unregister()` calls from `STATE_CustomBlockStore`

## 3. Interfaces
* **Outputs / Results:** `BlockDefinition` objects and `BlockInstance` objects consumed by `UI_BlockNode`, `UI_ModuleLibrary`, `SVC_CodeGenerator`, `SVC_GraphAnalyzer`, `STATE_PatchStore`
* **File Location:** `src/core/blocks/BlockRegistry.ts`

## 4. Core Logic & Processing Steps
1. On module initialization: import all built-in block definitions from `definitions/` subdirectories (Sources, Filters, Effects, Modulators, Dynamics, UserIO, Utility, Drums, PhysicalModeling)
2. Register each definition in an internal `Map<string, BlockDefinition>` keyed by `definition.id`
3. `get(id: string): BlockDefinition`:
   - Retrieve definition by ID
   - If not found: throw descriptive `Error` (not return undefined) to fail fast and surface missing registration bugs
4. `getAll(): BlockDefinition[]`:
   - Return all registered definitions as array (built-ins + custom)
5. `getByCategory(category: BlockCategory): BlockDefinition[]`:
   - Filter internal map and return only definitions matching the given category
6. `getAllCategories(): BlockCategory[]`:
   - Return list of distinct `BlockCategory` values that have at least one registered block
7. `instantiate(definitionId: string, position: { x: number, y: number }): BlockInstance`:
   - Call `get(definitionId)` to retrieve definition
   - Create `BlockInstance` with: generated UUID, `definitionId`, given position, `parameterValues` initialized to each parameter's `default` value from `ParameterDefinition[]`, `label = undefined`, `isCollapsed = false`
8. `validateConnection(sourcePort: PortDefinition, targetPort: PortDefinition): boolean`:
   - Return `true` if `sourcePort.signalType === targetPort.signalType`
   - Special rule: AUDIO source can connect to AUDIO target only; CV to CV only; TRIGGER to TRIGGER only; etc.
9. `register(definition: CustomBlockDefinition)`:
   - Add (or overwrite if already present) to internal map — overwrite is intentional for re-registration on patch reload
10. `unregister(id: string)`:
    - Remove definition from map; if ID not found, silently no-op (do not throw)

## 5. Data Structures
* `Map<string, BlockDefinition>` — internal registry, not exported directly
* `BlockDefinition` interface (from `TYPES_BlockDefinition`): `{ id, className, displayName, category, initMethod?, initParams?, processMethod?, parameters: ParameterDefinition[], ports: PortDefinition[], colorScheme: BlockColorScheme, isLGPL?: boolean }`

## 6. Error Handling & Edge Cases
* **Unknown `definitionId` in `get()`:** Throw `Error` with message including the unknown ID — fail fast; this indicates a registration bug, not a user error
* **Duplicate registration (built-in ID collision):** Log warning during development but overwrite; custom blocks may legitimately overwrite during patch reload
* **`unregister` on unknown ID:** Silent no-op (no throw) — idempotent removal
* **`instantiate` with missing parameter defaults:** If `ParameterDefinition.default` is undefined, use `0` as fallback; log warning

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: `get()` returns the correct `BlockDefinition` for all 200+ registered built-in block IDs without error
    * ARC_FUNC_02: `getByCategory(BlockCategory.Filters)` returns only filter blocks — no sources, effects, or other categories
    * ARC_FUNC_03: `validateConnection()` rejects connections between AUDIO and CV signal types, and between AUDIO and TRIGGER signal types; accepts AUDIO→AUDIO, CV→CV, TRIGGER→TRIGGER
    * ARC_FUNC_04: `instantiate()` creates a `BlockInstance` where every parameter in the definition's `parameters` array has a corresponding entry in `parameterValues` set to its `default` value
* **Input Validation Criteria:**
    * (Covered by FUNC_01 and ERR_01)
* **Error Handling Criteria:**
    * ARC_ERR_01: `get()` with an unregistered ID throws an `Error` with a message that includes the unknown ID string

## 8. Notes & Considerations
* CRITICAL: This is the most-imported module in the entire codebase. Any breaking change (rename, interface change, error behavior change) cascades to all consumers. Treat with extreme caution.
* The module uses singleton pattern (module-level `Map`) — there is only one registry instance per application session
* `isLGPL` flag on `BlockDefinition` is used by `SVC_CodeGenerator` to determine if `USE_DAISYSP_LGPL = 1` must be set in the Makefile
* Built-in block definitions are organized in `definitions/` subdirectories; adding a new built-in block requires both a definition file AND importing it here
