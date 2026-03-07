# Node Specification: SVC_GraphAnalyzer - Graph Analyzer — Topological Sort

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Critical

## 1. Purpose
* **Goal:** Analyzes the patch connection graph to determine the correct audio processing order required for C++ code generation. Uses Kahn's algorithm (BFS-based topological sort) to produce an ordered list of blocks for the audio callback. Also detects cycles (which produce invalid patches) and identifies unreachable blocks (not connected to any output).

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** TYPES_BlockDefinition
* **Input Data/State:** `BlockInstance[]` and `Connection[]` arrays from `STATE_PatchStore`; `BlockDefinition` port information from `SVC_BlockRegistry`

## 3. Interfaces
* **Outputs / Results:** `ProcessingOrder` object consumed by `SVC_CodeGenerator`; also used by `UI_Canvas` to highlight invalid (cyclic) patches
* **File Location:** `src/core/graph/GraphAnalyzer.ts`

## 4. Core Logic & Processing Steps
1. `buildAdjacencyList(blocks: BlockInstance[], connections: Connection[]): AdjacencyMap`:
   - Build directed graph where edges go from source block to target block (signal flow direction)
   - Key: `blockId`, Value: `Set<string>` of downstream block IDs
2. `detectCycles(adjacencyMap: AdjacencyMap): string[][]`:
   - DFS-based cycle detection using "white/gray/black" node coloring (unvisited/in-stack/done)
   - Return list of cycles, each as an array of block IDs forming the cycle
   - Short-circuit: return on first cycle found for performance (full cycle enumeration optional)
3. `getProcessingOrder(blocks: BlockInstance[], connections: Connection[]): ProcessingOrder`:
   - Step 1: Build adjacency list and in-degree map for all blocks
   - Step 2: Initialize queue with all blocks having in-degree 0 (source blocks — no incoming connections)
   - Step 3: Kahn's algorithm — process queue: for each block, add to `orderedBlockIds`, decrement in-degree of all successors, enqueue any successor that reaches in-degree 0
   - Step 4: If `orderedBlockIds.length < blocks.length` after processing, remaining blocks are in a cycle → set `isValid = false`, call `detectCycles()` to populate `cycles`
   - Step 5: Identify unreachable blocks (not connected to any audio output block)
4. `validateConnections(connections: Connection[], registry: SVC_BlockRegistry): ValidationResult[]`:
   - For each connection: fetch source and target port definitions; check signal type compatibility
   - Return array of validation errors (empty array = all valid)
5. `getUnreachableBlocks(orderedBlockIds: string[], allBlockIds: string[]): string[]`:
   - Blocks in `allBlockIds` but not in `orderedBlockIds` after a valid sort — OR blocks in a valid sort that have no path to any AudioOutput block

## 5. Data Structures
* `ProcessingOrder { orderedBlockIds: string[], isValid: boolean, cycles: string[][], unreachableBlockIds: string[] }`
* `AdjacencyMap = Map<string, Set<string>>` — directed edges from source to target block
* `InDegreeMap = Map<string, number>` — count of incoming edges per block
* `ValidationResult { connectionId: string, error: string }` — per-connection validation error

## 6. Error Handling & Edge Cases
* **Empty patch:** Valid result with `orderedBlockIds = []`, `isValid = true`, `cycles = []`, `unreachableBlockIds = []`
* **Self-loops (block connected to itself):** Detected as a single-node cycle; `isValid = false`
* **Disconnected islands:** Blocks with no connections to any output path — included in `orderedBlockIds` (they will still be initialized in generated code) but also listed in `unreachableBlockIds` with a warning
* **Audio output block not reachable:** Set `isValid = false` with a specific warning that no signal reaches the output
* **Multiple output blocks:** Valid — order ensures all paths reach outputs; each output is independently reachable

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: For a valid linear patch (A → B → C), topological sort produces an order where A precedes B and B precedes C — all source blocks appear before their dependents
    * ARC_FUNC_02: Cycle detection correctly identifies a 3-node cycle (A → B → C → A) and returns `[["A", "B", "C"]]` (or equivalent rotation) in `cycles`
* **Input Validation Criteria:**
    * ARC_VAL_01: `validateConnections()` returns a `ValidationResult` error for a connection between an AUDIO source port and a CV target port
* **Error Handling Criteria:**
    * ARC_ERR_01: A cyclic patch returns `isValid = false` and a non-empty `cycles` array — `getProcessingOrder()` does NOT throw; it returns a `ProcessingOrder` with error data for the caller to handle

## 8. Notes & Considerations
* CRITICAL CORRECTNESS REQUIREMENT: Wrong processing order causes audio artifacts at runtime (reading unprocessed block outputs). This logic must be thoroughly unit tested.
* Kahn's algorithm is preferred over DFS topological sort because it naturally detects cycles (remaining nodes after sort = cycle members) without a separate cycle-detection pass for the common (non-cyclic) case
* The analyzer operates on IDs only — it does not need to know the C++ semantics of each block; that is `SVC_CodeGenerator`'s responsibility
* Consider caching the result and invalidating when `STATE_PatchStore` blocks or connections change (expensive to recompute on every render)
