# Node Specification: UI_BlockNode - Block Node Renderer

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Complex

## 1. Purpose
* **Goal:** Render a single DSP block as a custom React Flow node component. Display the block's display name, category color scheme, input ports on the left side, output ports on the right side, inline parameter controls for simple parameters, and correct visual states for selection and hover.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** SVC_BlockRegistry, STATE_PatchStore, TYPES_BlockDefinition
* **Input Data/State:** BlockInstance data passed by React Flow via node props; BlockDefinition fetched from SVC_BlockRegistry using definitionId; selection state from React Flow's selected prop

## 3. Interfaces
* **Outputs / Results:** Rendered block node DOM; user interactions forwarded to STATE_PatchStore (parameter updates) and STATE_UIStore (inspection requests)
* **File Location:** src/components/Canvas/BlockNode.tsx

## 4. Core Logic & Processing Steps
1. Receive BlockInstance data from React Flow node props (id, data, selected)
2. Lookup BlockDefinition from SVC_BlockRegistry using data.definitionId
3. Render category color header bar using BlockDefinition.colorScheme
4. Render input ports on the left side using React Flow Handle components with type="target"
5. Render output ports on the right side using React Flow Handle components with type="source"
6. Each Handle receives id=portId, style colored by port's SignalType
7. Show block in collapsed state (name + ports only) by default; expanded state shows inline parameter widgets
8. Apply selection highlight (bright border) when selected prop is true
9. Apply hover highlight (subtle border) on mouseenter/mouseleave
10. Double-click on block header → dispatch to STATE_UIStore to set inspectedBlockId; if it is a custom block, open UI_CustomBlockEditorModal instead

## 5. Data Structures
* `BlockInstance.data`: { definitionId: string, parameters: Record<string, ParameterValue>, label?: string }
* `BlockDefinition.colorScheme`: { header: string, border: string, portColors: Record<SignalType, string> }
* `PortDefinition`: { id: string, label: string, direction: 'input'|'output', signalType: SignalType }
* `SignalType` enum: AUDIO, CV, TRIGGER, LOGIC

## 6. Error Handling & Edge Cases
* If BlockDefinition not found in registry (deleted/unknown block): render an "Unknown Block" placeholder with error styling and definitionId shown
* If BlockDefinition has zero ports: render block body with no handles; still show name and category
* Port label overflow: truncate with ellipsis for long port labels
* Collapsed vs expanded state: collapse by default to keep canvas readable; persist collapse state per block in STATE_PatchStore or local state

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify block renders the correct number of input and output ports as defined in BlockDefinition.ports
    * ARC_FUNC_02: Verify category color scheme is applied correctly (header color matches BlockDefinition.colorScheme.header)
    * ARC_FUNC_03: Verify double-clicking the block header sets the correct inspectedBlockId in STATE_UIStore
    * ARC_FUNC_04: Verify selected=true prop applies the selection highlight border
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify that a block with an unknown definitionId renders a visible error placeholder instead of crashing
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify SVC_BlockRegistry lookup failure is caught and results in "Unknown Block" display without React error boundary trigger

## 8. Notes & Considerations
* Port colors encode signal type per Neon Glass spec: AUDIO=#00F0FF (cyan), CV=#FFD600 (yellow), TRIGGER=#FF5200 (orange), LOGIC=#B800FF (purple)
* React Flow Handle components must have matching id values with the Connection sourcePortId/targetPortId for correct edge routing
* Avoid heavy computation in this component; it is rendered for every block on the canvas and must be performant
* Custom block types should show a distinct visual indicator (e.g., a small "C" badge or dashed border) to distinguish them from built-in blocks
