# Node Specification: UI_Canvas - Canvas React Flow Workspace

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Critical

## 1. Purpose
* **Goal:** Provide the main visual workspace where users build DSP patches. Host React Flow (@xyflow/react) with custom node/edge types and handle all canvas-level interactions including block dragging from the library, connection creation between ports, canvas pan/zoom, multi-select, grid snapping, and context menus.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** STATE_PatchStore, STATE_UIStore, SVC_BlockRegistry, UI_BlockNode, UI_ConnectionEdge, UI_CommentNode, UI_AlignmentToolbar, UI_DragOverlay
* **Input Data/State:** BlockInstances and Connections from STATE_PatchStore; viewport, snapToGrid, draggingBlockId from STATE_UIStore; block definitions from SVC_BlockRegistry

## 3. Interfaces
* **Outputs / Results:** Updated STATE_PatchStore (blocks added/removed/moved, connections added/removed); updated STATE_UIStore (viewport, selection, inspectedBlockId)
* **File Location:** src/components/Canvas/Canvas.tsx

## 4. Core Logic & Processing Steps
1. Render React Flow with nodes=BlockInstances+CommentNodes, edges=Connections
2. Register custom node types: blockNode → UI_BlockNode, commentNode → UI_CommentNode
3. Register custom edge type: connectionEdge → UI_ConnectionEdge
4. On block drop from library: call screenToFlowPosition() to convert screen coords → addBlock() on STATE_PatchStore
5. On edge creation (onConnect callback): validate source/target port signal types → addConnection() if compatible, or reject with visual feedback if incompatible
6. Selection: marquee drag → selectBlocks() with array of IDs; single click → selectBlock(); click on empty canvas → clearSelection()
7. Pan/zoom: store viewport changes in STATE_UIStore via onViewportChange callback
8. Grid snap: when snapToGrid=true in STATE_UIStore, apply snapping transform to node positions on drag

## 5. Data Structures
* `BlockInstance`: { id: string, definitionId: string, position: {x, y}, parameters: Record<string, any>, label?: string }
* `Connection`: { id: string, sourceBlockId: string, sourcePortId: string, targetBlockId: string, targetPortId: string, signalType: SignalType }
* `Viewport`: { x: number, y: number, zoom: number }
* React Flow `Node<BlockInstance>` and `Edge<Connection>` wrappers

## 6. Error Handling & Edge Cases
* Incompatible port connections (AUDIO to CV): show red highlight on invalid drop target, reject connection
* Drop outside canvas bounds: ignore drop event
* Duplicate connection to same input port: check existing connections before adding; input ports accept only one connection
* Empty canvas: show placeholder text or grid-only background
* React Flow peer dependency version mismatches: pin @xyflow/react version in package.json

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify dropping a block from library creates a BlockInstance in STATE_PatchStore with correct definitionId and canvas position
    * ARC_FUNC_02: Verify connecting two compatible ports creates a Connection entry in STATE_PatchStore with correct source/target IDs
    * ARC_FUNC_03: Verify viewport pan and zoom values are stored in STATE_UIStore after interaction
    * ARC_FUNC_04: Verify marquee selection populates selectedBlockIds in STATE_UIStore
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify connecting incompatible signal types (AUDIO to CV) is rejected with visual feedback (red highlight on invalid handle)
    * ARC_VAL_02: Verify connecting two output ports together is rejected
    * ARC_VAL_03: Verify that a second connection to an already-connected input port replaces the existing connection
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify drop events with undefined drag data are silently ignored without crashing
    * ARC_ERR_02: Verify that if SVC_BlockRegistry cannot resolve a definitionId on drop, a user-visible error is shown

## 8. Notes & Considerations
* React Flow handles most low-level interaction (drag, pan, zoom, edge drawing); DVPE adds custom behavior on top via callbacks and custom node/edge types
* Node positions in React Flow are in flow coordinates; use screenToFlowPosition() from useReactFlow() hook for drop coordinate translation
* Consider memoizing custom node/edge type maps with useMemo to avoid React Flow re-registration on every render
* The canvas background dot grid should match the "Neon Glass" visual spec: #08080A void with dot pattern
