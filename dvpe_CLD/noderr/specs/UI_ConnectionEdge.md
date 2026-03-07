# Node Specification: UI_ConnectionEdge - Wire Renderer

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Render a signal connection between two block ports as a custom React Flow edge. Apply visual styling that varies by signal type so users can immediately identify audio, CV, trigger, and logic wires by color. Optionally animate the wire to indicate live signal flow.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** TYPES_BlockDefinition (SignalType enum)
* **Input Data/State:** Edge props from React Flow: id, source, target, sourceX, sourceY, targetX, targetY, data (including signalType); selected state from React Flow

## 3. Interfaces
* **Outputs / Results:** Rendered SVG path element forming a wire between two ports; click events for edge selection
* **File Location:** src/components/Canvas/ConnectionEdge.tsx

## 4. Core Logic & Processing Steps
1. Receive edge props from React Flow (sourceX, sourceY, targetX, targetY, data, selected)
2. Extract signalType from edge data
3. Resolve color from SignalType: AUDIO → #00F0FF, CV → #FFD600, TRIGGER → #FF5200, LOGIC → #B800FF
4. Compute bezier path using React Flow's getBezierPath() or getSmoothStepPath() utility
5. Render SVG <path> with computed path string and resolved stroke color
6. Apply selection highlight (thicker stroke or glow) when selected=true
7. Apply animated stroke-dashoffset CSS animation when wire is in active/animated state (optional runtime feature)
8. Render an invisible wider click-target path on top for easier edge selection interaction

## 5. Data Structures
* `SignalType` enum: AUDIO = 'audio', CV = 'cv', TRIGGER = 'trigger', LOGIC = 'logic'
* Edge data: `{ signalType: SignalType, animated?: boolean }`
* SVG path attributes: stroke (color), strokeWidth (1.5 default, 2.5 selected), strokeDasharray (for animation)

## 6. Error Handling & Edge Cases
* Unknown signal type: fall back to white (#FFFFFF) stroke with console warning
* Very short edges (source and target nearly overlapping): ensure bezier curve still renders without degenerate visual
* Self-loop edges (same block source and target): render as arc offset from block; prevent if not allowed at canvas level

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify audio connections render in cyan (#00F0FF) and CV connections render in yellow (#FFD600)
    * ARC_FUNC_02: Verify trigger connections render in orange (#FF5200) and logic connections render in purple (#B800FF)
    * ARC_FUNC_03: Verify selected edge receives a visually distinct highlight (increased stroke width or glow effect)
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify edges with no signalType in data default to a visible fallback color rather than invisible
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify undefined signalType does not throw; edge renders with fallback color

## 8. Notes & Considerations
* Use React Flow's built-in path utility functions (getBezierPath) rather than custom SVG math to stay compatible with React Flow's edge rendering lifecycle
* The click-target invisible path trick (wider transparent stroke overlaid on the visible path) significantly improves edge selection UX, especially for thin wires
* CSS animation for active wires should be opt-in via a feature flag or real-time simulation mode toggle to avoid performance impact on large patches
* Stroke glow effect (drop-shadow filter) can be applied via SVG filter element to achieve the Neon Glass aesthetic without heavy GPU cost
