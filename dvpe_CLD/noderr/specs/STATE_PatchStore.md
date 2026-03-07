# Node Specification: STATE_PatchStore - Patch Graph State

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Critical

## 1. Purpose
* **Goal:** Central Zustand store holding the entire patch graph state: all `BlockInstance` objects, `Connection` objects, `CommentNode` objects, `ProjectMetadata`, `HardwareConfiguration`, and a full undo/redo history. This is the single source of truth for the patch being actively edited.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** TYPES_BlockDefinition, TYPES_HardwareConfig
* **Input Data/State:** Actions dispatched by UI components (add/remove/move blocks, connect/disconnect ports, update parameters); serialized patch JSON on load

## 3. Interfaces
* **Outputs / Results:** Reactive state consumed by UI_Canvas, UI_BlockNode, UI_Inspector, UI_AlignmentToolbar, SVC_CodeGenerator; serialized patch JSON via `getPatch()`
* **File Location:** `src/stores/patchStore.ts`

## 4. Core Logic & Processing Steps
1. Store core arrays: `blocks: BlockInstance[]`, `connections: Connection[]`, `comments: CommentNode[]`
2. Maintain undo/redo history stack (max 50 entries) using Immer snapshots; push snapshot before every mutating action
3. **Block operations:**
   - `addBlock(definitionId, position)`: create new `BlockInstance` with default parameter values; push to history
   - `removeBlock(id)`: remove block and all connections referencing it; push to history
   - `updateBlockPosition(id, position)`: update x/y; push to history (debounced during drag)
   - `updateBlockParameter(id, paramId, value)`: update a single parameter value
   - `setBlockLabel(id, label)`: set custom display label
   - `toggleCvPort(id, portId)`: flip `cvPortsVisible` flag on a block instance
4. **Connection operations:**
   - `addConnection(sourceBlockId, sourcePortId, targetBlockId, targetPortId)`: validate signal type compatibility via `SVC_BlockRegistry.validateConnection()`, then add; reject duplicates
   - `removeConnection(id)`: remove by connection ID
5. **Selection operations:** `selectBlock(id)`, `selectBlocks(ids[])`, `selectAll()`, `clearSelection()` — maintain `selectedBlockIds: Set<string>`
6. **Project operations:**
   - `newPatch()`: reset all state to empty defaults
   - `loadPatch(serialized)`: deserialize and restore full state
   - `getPatch()`: serialize current state to `SerializedPatch` JSON
   - `setMetadata(metadata)`: update project name, author, description fields
7. **Alignment operations:** `alignBlocksLeft()`, `alignBlocksRight()`, `alignBlocksTop()`, `alignBlocksBottom()`, `distributeBlocksHorizontally()`, `distributeBlocksVertically()` — operate on current selection
8. `markDirty()` / `markClean()`: track unsaved changes; exposed as `isDirty` boolean

## 5. Data Structures
* `BlockInstance { id: string, definitionId: string, position: { x: number, y: number }, parameterValues: Record<string, number|string|boolean>, label: string | undefined, isCollapsed: boolean, cvPortsVisible: boolean, selectedPortIds: string[] }`
* `Connection { id: string, sourceBlockId: string, sourcePortId: string, targetBlockId: string, targetPortId: string }`
* `CommentNode { id: string, position: { x: number, y: number }, text: string, width: number }`
* `ProjectMetadata { name: string, author: string, description: string, created: string, modified: string }`
* `HardwareConfiguration { platform: "seed" | "pod" | "field", sampleRate: number, blockSize: number }`

## 6. Error Handling & Edge Cases
* **Incompatible signal types:** `addConnection` calls `SVC_BlockRegistry.validateConnection()` and silently rejects (or throws catchable error) if types are incompatible (e.g., AUDIO → CV)
* **Duplicate connections:** same source port to same target port → prevented; check before pushing to array
* **Undo past empty:** `undo()` when history index is 0 → no-op, do not corrupt state
* **`removeBlock` cascade:** must remove all connections where `sourceBlockId === id` OR `targetBlockId === id`
* **`loadPatch` with malformed data:** wrap in try/catch; on failure do not partially apply state; keep existing patch intact

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: `addBlock()` creates a `BlockInstance` with the correct `definitionId` and all parameter values initialized to their defaults from the `BlockDefinition`
    * ARC_FUNC_02: `undo()` after `addBlock()` restores the exact previous state (block absent, connection count unchanged)
    * ARC_FUNC_03: `removeBlock()` removes the block AND all connections that reference it (both as source and target)
* **Input Validation Criteria:**
    * ARC_VAL_01: `addConnection()` rejects connections where source and target port signal types are incompatible
* **Error Handling Criteria:**
    * ARC_ERR_01: `loadPatch()` handles malformed/incomplete JSON without crashing the store or corrupting existing state

## 8. Notes & Considerations
* Uses Immer for immutable state updates with mutable syntax — wrap all mutations in `produce()`
* Uses `subscribeWithSelector` middleware for granular subscriptions (e.g., subscribe to only `blocks` changes)
* History push should be debounced during continuous drag operations to avoid 50-entry exhaustion from a single drag
* `getPatch()` must not include transient UI state (selection, collapse state is intentionally excluded from serialization — or included, TBD per design)
