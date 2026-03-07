# Node Specification: HOOK_ParameterShortcuts - Parameter Keyboard Shortcuts Hook

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** React custom hook providing keyboard shortcuts for parameter editing in the Inspector. When a parameter control (dial, slider) is focused, arrow keys nudge its value by a configurable step amount. Number keys can jump to specific values or percentages. Enables fast, keyboard-driven parameter editing without requiring mouse interaction. Uses `react-hotkeys-hook` for reliable cross-browser key binding.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** STATE_PatchStore (via props/callbacks passed into the hook)
* **Input Data/State:** Currently focused parameter ID and its ParameterDefinition (min, max, step, current value); shortcut configuration (step sizes for different arrow key modifiers); `react-hotkeys-hook` library

## 3. Interfaces
* **Outputs / Results:** Calls provided `onValueChange(parameterId: string, newValue: number)` callback when a shortcut fires; returns cleanup function to unregister shortcuts on component unmount
* **File Location:** src/hooks/useParameterShortcuts.ts

## 4. Core Logic & Processing Steps
1. Accept hook arguments: `{ parameterId: string | null, currentValue: number, parameterDef: ParameterDefinition | null, onValueChange: (id: string, value: number) => void }`
2. Derive step sizes from ParameterDefinition: fine step (paramDef.step || (max-min)/100), coarse step (fine * 10)
3. Use `useHotkeys` from react-hotkeys-hook to register:
   - **ArrowUp** → increment by fine step
   - **ArrowDown** → decrement by fine step
   - **Shift+ArrowUp** → increment by coarse step
   - **Shift+ArrowDown** → decrement by coarse step
   - **Ctrl+ArrowUp** → set to max value
   - **Ctrl+ArrowDown** → set to min value
   - **Home** → set to min value
   - **End** → set to max value
   - **Escape** → blur current control (deselect without value change)
4. For each shortcut: compute new value = clamp(currentValue + delta, min, max)
5. Call `onValueChange(parameterId, newValue)` with the computed value
6. Shortcuts should only fire when a parameter control is focused — use the `enabled` option in useHotkeys or a focus guard
7. Prevent default browser behavior for arrow keys (page scrolling) when the hook is active

## 5. Data Structures
* Hook signature: `useParameterShortcuts(options: ParameterShortcutOptions): void`
* `ParameterShortcutOptions`:
  ```typescript
  interface ParameterShortcutOptions {
    parameterId: string | null;
    currentValue: number;
    parameterDef: ParameterDefinition | null;
    onValueChange: (id: string, value: number) => void;
    enabled?: boolean;
  }
  ```
* No return value (void hook — side effects only via callback)

## 6. Error Handling & Edge Cases
* If parameterId is null or parameterDef is null, shortcuts are registered but onValueChange is never called (guard at the top of each handler)
* Clamping ensures values never exceed parameterDef.min or parameterDef.max
* The `enabled` option from react-hotkeys-hook allows conditional activation based on Inspector focus state
* Duplicate shortcut registration (multiple Inspector instances) must be handled by `useHotkeys` scope scoping — ensure only the currently focused parameter responds

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify pressing ArrowUp when a parameter dial is focused increments the parameter value by the fine step amount and calls onValueChange
    * ARC_FUNC_02: Verify pressing Shift+ArrowUp increments by coarse step (10x fine step)
    * ARC_FUNC_03: Verify pressing Ctrl+ArrowUp sets the value to parameterDef.max
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify value is clamped to [min, max] and does not exceed bounds on any shortcut action
    * ARC_VAL_02: Verify shortcuts do not fire when parameterId is null (no focused parameter)
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify ArrowUp/Down key events have preventDefault() called to prevent Inspector panel scrolling during parameter nudge
    * ARC_ERR_02: Verify the hook cleans up all registered shortcuts on component unmount (no memory leaks)

## 8. Notes & Considerations
* react-hotkeys-hook v4+ supports `scopes` for limiting shortcut activation to specific component trees — use this to prevent Inspector shortcuts from firing when canvas shortcuts should take priority
* The shortcut definitions used by this hook should be exported as constants and imported by UI_ShortcutsModal to keep the displayed shortcuts list in sync with actual registered bindings
* Fine step calculation from ParameterDefinition.step is preferred; falling back to (max-min)/100 provides sensible defaults for parameters without explicit step values
