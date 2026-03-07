# Node Specification: SVC_CVRoutingAnalyzer - CV Routing Analyzer

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Complex

## 1. Purpose
* **Goal:** Analyzes CV (control voltage) connections in the patch to determine modulation routing for C++ code generation. Identifies which block parameters receive CV modulation, maps them to the appropriate C++ parameter setter methods, and generates per-sample parameter update calls that are placed in the audio callback before each block's `Process()` call.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** TYPES_BlockDefinition
* **Input Data/State:** `Connection[]` array from `STATE_PatchStore` (filtered to CV signal type); `BlockInstance[]` for parameter values and CV port visibility flags; `BlockDefinition` port and parameter metadata from `SVC_BlockRegistry`

## 3. Interfaces
* **Outputs / Results:** `CVRoutingResult` object containing per-block CV update code fragments, consumed by `SVC_CodeGenerator` for injection into the audio callback
* **File Location:** `src/codegen/analyzers/CVRoutingAnalyzer.ts`

## 4. Core Logic & Processing Steps
1. `analyze(blocks: BlockInstance[], connections: Connection[]): CVRoutingResult`:
   - Filter `connections` to those with `signalType === "CV"` (or equivalent enum value)
   - Exclude connections to ports on blocks where `BlockInstance.cvPortsVisible === false`
   - For each remaining CV connection: identify source block (CV output) and target block + target port (the modulated parameter port)
2. `resolveParameterSetter(targetBlock: BlockInstance, targetPortId: string): ParameterSetterInfo | null`:
   - Fetch `BlockDefinition` for `targetBlock.definitionId` from `SVC_BlockRegistry`
   - Find the `PortDefinition` matching `targetPortId`
   - From the port definition, retrieve the associated `parameterSetter` (e.g., `"SetFreq"`, `"SetRes"`, `"SetDecay"`) and any scaling info (range, scaling curve)
   - Return `null` if the port has no parameter setter mapping
3. `generateUpdateCode(cvConnection: CvConnection, setterInfo: ParameterSetterInfo, sourceVarName: string): string`:
   - Emit a C++ statement that reads the CV source value and calls the parameter setter on the target block
   - Apply scaling: CV signals are 0.0–1.0; map to parameter range (e.g., `SetFreq(20.f + cvVal * 19980.f)` for frequency)
   - Optionally wrap in `fonepole()` for smoothing if the parameter benefits from it
4. `buildRoutingTable(blocks: BlockInstance[], connections: Connection[]): CVRoutingMap`:
   - Return a `Map<string, string[]>` keyed by target block instance ID, where values are arrays of generated C++ update statements to emit before that block's `Process()` call
5. Handle multiple CV signals modulating the same parameter:
   - Default semantics: last-write wins (ordered by connection array order)
   - Future: summing semantics configurable per port

## 5. Data Structures
* `CvConnection { connectionId: string, sourceBlockId: string, sourcePortId: string, targetBlockId: string, targetPortId: string }` — CV-filtered connection
* `ParameterSetterInfo { setterMethod: string, paramMin: number, paramMax: number, scalingCurve: "linear" | "exponential" }` — how to call the setter with correct range
* `CVRoutingMap = Map<string, string[]>` — target block ID → array of C++ update lines to emit before Process()
* `CVRoutingResult { routingMap: CVRoutingMap, warnings: string[] }` — warnings for unresolvable mappings

## 6. Error Handling & Edge Cases
* **CV connection to port with no setter mapping:** Add warning to `CVRoutingResult.warnings`, skip code generation for that connection — do not fail entire analysis
* **Disabled CV ports (`cvPortsVisible === false`):** Exclude from analysis — the user has toggled the port off, so no modulation code should be generated for it
* **CV signal value out of 0.0–1.0 range:** Generated code should include a `fclamp(cvVal, 0.f, 1.f)` guard before scaling to prevent parameter range violations
* **Multiple CV modulating same parameter:** Last-write semantics; emit a comment `// CV OVERRIDE: [source]` so the user can see in generated code that multiple sources competed

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: A CV connection from a `phasor` output to an `oscillator` frequency port generates a `osc.SetFreq(...)` call in the `CVRoutingMap` for the oscillator block, placed before its `Process()` call in the audio callback
* **Input Validation Criteria:**
    * ARC_VAL_01: A CV connection targeting a block where `cvPortsVisible === false` produces no entry in the `CVRoutingMap` — the disabled port is correctly excluded
* **Error Handling Criteria:**
    * (Covered by Edge Cases — unresolvable setter produces warning, not error)

## 8. Notes & Considerations
* TECH DEBT: Integration with `SVC_CodeGenerator` may be incomplete — needs audit to confirm `CVRoutingMap` entries are correctly injected at the right point in the audio callback loop (before each block's `Process()` call, not at the top or bottom of the callback)
* Exponential scaling is important for frequency parameters (human perception of pitch is logarithmic) — the `ParameterSetterInfo.scalingCurve` field enables this but may not be populated for all block definitions yet
* `fonepole()` smoothing for CV-modulated parameters prevents zipper noise when CV values change between audio blocks; should be applied to any parameter that changes faster than ~10ms
