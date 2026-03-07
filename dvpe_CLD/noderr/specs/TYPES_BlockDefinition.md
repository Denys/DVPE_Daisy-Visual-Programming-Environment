# Node Specification: TYPES_BlockDefinition - Core Block Type System

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** The foundational TypeScript interface definitions for the entire DVPE block system. Defines all enums, interfaces, and types that every other module depends on. This is the contract that block definitions, stores, services, and UI components all program against. Breaking changes here cascade throughout the entire codebase.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** None (foundational — no upstream TypeScript dependencies)
* **Input Data/State:** N/A — this file defines the types, it does not consume them

## 3. Interfaces
* **Outputs / Results:** Exported TypeScript types and enums consumed by all block definitions, stores (STATE_PatchStore, STATE_BlockDesignerStore), services (SVC_BlockRegistry, SVC_CodeGenerator), and UI components
* **File Location:** src/types/blocks.ts (442 lines)

## 4. Core Logic & Processing Steps
1. Define `SignalType` enum: AUDIO, CV, TRIGGER (used for port type classification and connection validation)
2. Define `PortDirection` enum: INPUT, OUTPUT
3. Define `ParameterType` enum: FLOAT, INT, BOOL, ENUM (controls how the Inspector renders a parameter control)
4. Define `BlockCategory` enum: Sources, Filters, Effects, Modulators, Dynamics, UserIO, MathUtility, Mixing, PhysicalModeling, Drums, Custom
5. Define `BlockColorScheme` enum: ~10 color identifiers mapping to CSS color variables for block visual differentiation
6. Define `PortDefinition` interface: { id: string, name: string, direction: PortDirection, signalType: SignalType, optional?: boolean }
7. Define `ParameterDefinition` interface: { id: string, name: string, type: ParameterType, min?: number, max?: number, default: number | boolean | string, step?: number, enumValues?: string[], unit?: string }
8. Define `BlockDefinition` interface: { id, className, displayName, category, initMethod?, initParams?, processMethod?, parameters: ParameterDefinition[], ports: PortDefinition[], colorScheme, requiresLGPL?: boolean }
9. Define `BlockInstance` interface: { id: string, definitionId: string, position: {x, y}, parameterValues: Record<string, number | boolean | string> }
10. Define `Connection` interface: { id: string, sourceBlockId: string, sourcePortId: string, targetBlockId: string, targetPortId: string }
11. Define `ConnectionValidation` type: { valid: boolean, error?: string }
12. Define `ProjectMetadata` interface: { name, author, platform: PlatformType, createdAt, updatedAt, version }
13. Define `PatchGraph` interface: { blocks: BlockInstance[], connections: Connection[], comments: CommentNode[] }
14. Define `SerializedProject` interface: { metadata: ProjectMetadata, patch: PatchGraph, customBlocks?: CustomBlockDefinition[] }
15. Define `ViewportState` interface: { x, y, zoom }
16. Define `SelectionState` interface: { selectedBlockIds: string[], selectedConnectionIds: string[] }
17. Define `DragState` interface: { isDragging, dragType, sourceBlockId?, sourcePortId? }
18. Define `CommentNode` interface: { id, text, position, size, color }

## 5. Data Structures
* **Core enums**: SignalType, PortDirection, ParameterType, BlockCategory, BlockColorScheme
* **Core interfaces**: PortDefinition, ParameterDefinition, BlockDefinition, BlockInstance, Connection
* **State interfaces**: ViewportState, SelectionState, DragState
* **Project interfaces**: ProjectMetadata, PatchGraph, SerializedProject, CommentNode

## 6. Error Handling & Edge Cases
* No runtime logic in this file — it is purely type declarations
* All optional fields (initMethod, requiresLGPL, unit, step) must have sensible defaults when consumed downstream
* ParameterDefinition min/max should be consistently applied — absent min/max implies unbounded (consumers should handle this)

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify all block definition files (BLOCKS_Synthesis, BLOCKS_Filters, etc.) satisfy the BlockDefinition interface without TypeScript compilation errors
    * ARC_FUNC_02: Verify all 9+ BlockCategory enum values are defined and match the categories used in block definition files
    * ARC_FUNC_03: Verify Connection interface fields are sufficient for SVC_CodeGenerator to trace signal flow (sourceBlockId + sourcePortId → targetBlockId + targetPortId)
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify ParameterType enum covers all parameter control types needed by the Inspector
    * ARC_VAL_02: Verify SignalType enum values match those used in connection validation logic
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify TypeScript strict mode is enabled and this file compiles without errors or `any` types

## 8. Notes & Considerations
* The foundation all other modules depend on — any interface change requires audit of all consumers
* BlockColorScheme enum values should map to CSS custom properties defined in globals.css for consistent theming
* `CommentNode` is a first-class entity in the PatchGraph, not a special block, to avoid polluting block type logic
* `requiresLGPL` on BlockDefinition is a flag read by SVC_CodeGenerator — its type should be `boolean | undefined` with false as the implicit default
