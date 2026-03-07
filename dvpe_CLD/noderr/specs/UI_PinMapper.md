# Node Specification: UI_PinMapper - Pin Mapper

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Complex

## 1. Purpose
* **Goal:** Provide a visual interface for mapping patch I/O blocks (audio inputs/outputs, CV inputs/outputs, gate inputs/outputs) to specific physical hardware pins on the selected Daisy platform. Shows the platform's available pinout and allows the user to assign which physical pin each I/O block uses.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** TYPES_HardwareConfig
* **Input Data/State:** selected platform's PinDefinitions from CONST_PlatformDefinitions; current pinAssignments from HardwareConfiguration; I/O block list from STATE_PatchStore (blocks with category 'User I/O'); onChange callback to parent UI_ArchitectureWindow

## 3. Interfaces
* **Outputs / Results:** Updated pinAssignments Record<blockId, pinId> passed via onChange to parent
* **File Location:** src/components/architecture/PinMapper.tsx

## 4. Core Logic & Processing Steps
1. Receive props: platform, pinDefinitions (available pins), iOBlocks (User I/O block instances), pinAssignments, onChange
2. Render a two-column layout: left column = I/O blocks from patch; right column = available pins
3. Each I/O block row shows block label and a dropdown of available pins filtered by compatibility (audio pins for audio blocks, CV pins for CV blocks)
4. Currently assigned pin is pre-selected in dropdown
5. On dropdown change: update pinAssignments[blockId] = selectedPinId; call onChange(newPinAssignments)
6. Visual highlight on already-used pins to prevent double-assignment: gray out or mark pins already assigned to another block
7. Unassigned I/O blocks shown with a warning icon

## 5. Data Structures
* `PinDefinition`: { id: string, name: string, capabilities: ('audio'|'cv'|'gate'|'gpio')[], physicalNumber: number }
* `pinAssignments`: `Record<string, string>` — blockId → pinId
* I/O block: BlockInstance with category='User I/O' (audio_in, audio_out, cv_input, cv_output, gate_in, gate_out)

## 6. Error Handling & Edge Cases
* No I/O blocks in patch: show message "Add I/O blocks to your patch to configure pin assignments"
* Pin assigned to two blocks: show validation error; prevent second assignment
* Selected platform changes: reset pinAssignments (parent responsibility); re-render with new pinDefinitions
* Platform has fixed controls (Pod/Field): pin mapper is hidden in UI_ArchitectureWindow; this component is only shown for Seed

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify selecting a pin from a block's dropdown updates pinAssignments for that block
    * ARC_FUNC_02: Verify pins already assigned to one block are visually distinguished in other blocks' dropdowns
    * ARC_FUNC_03: Verify correct available pins are shown for each I/O block type (audio vs. CV vs. gate)
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify attempting to assign the same pin to two blocks is prevented or shows a conflict warning
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify empty iOBlocks prop renders the "no I/O blocks" message without crashing

## 8. Notes & Considerations
* Pin numbering for Daisy Seed: physical pin numbers differ from GPIO numbers; the PinDefinition should include both the human-readable name (D15, A0, etc.) and the DaisySP pin constant name
* For advanced users, an alternative "visual pinout diagram" view (showing the chip outline with pin labels) would be preferred over a dropdown list; this could be a future enhancement
* The mapper is only relevant for Seed; Pod and Field have fixed pin assignments that are handled automatically by the hardware abstraction layer
