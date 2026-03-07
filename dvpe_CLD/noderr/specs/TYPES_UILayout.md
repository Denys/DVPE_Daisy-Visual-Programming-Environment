# Node Specification: TYPES_UILayout - UI Layout Type Definitions

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** TypeScript types for the Block UI Designer system. Defines the shape of UI elements that can be placed on the design canvas, the complete layout structure for a custom block's Inspector panel, and the preset system for reusable layout templates. These types bridge the visual design tool and the Inspector rendering system.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** None (foundational type file; no imports from DVPE-specific modules)
* **Input Data/State:** N/A — pure type declarations

## 3. Interfaces
* **Outputs / Results:** Exported TypeScript types: UIElementType, UIElementBase, specific element interfaces (RotaryKnobElement, etc.), UIElement union type, BlockUILayout, LayoutPreset; consumed by STATE_BlockDesignerStore, UI_DesignCanvas, UI_ElementLibraryPanel, UI_PropertyEditor, UI_BindingEditor, TYPES_CustomBlock
* **File Location:** src/types/blockUILayout.ts + src/types/uiElement.ts + src/types/layoutPreset.ts

## 4. Core Logic & Processing Steps
1. Define `UIElementType` enum or union: 'RotaryKnob' | 'HorizontalSlider' | 'RotaryEncoder' | 'LEDIndicator' | 'NumericDisplay' | 'TextLabel' | 'ToggleSwitch' | 'Dropdown' | 'GroupBox'
2. Define `Position` interface: { x: number, y: number }
3. Define `Size` interface: { width: number, height: number }
4. Define `UIElementBase` interface: { id: string, type: UIElementType, position: Position, size: Size, label?: string, binding?: string, portBinding?: string }
5. Define specific element interfaces extending UIElementBase:
   - `RotaryKnobElement` — adds: min, max, defaultValue, showLabel, showValue, color?
   - `HorizontalSliderElement` — adds: min, max, defaultValue, showLabel, showValue, orientation?: 'horizontal' | 'vertical'
   - `RotaryEncoderElement` — adds: min, max, step, showLabel
   - `LEDIndicatorElement` — adds: color, shape?: 'circle' | 'square', activeColor, inactiveColor
   - `NumericDisplayElement` — adds: decimals, unit?, min, max, color?
   - `TextLabelElement` — adds: text, fontSize, fontWeight?, color?, alignment?
   - `ToggleSwitchElement` — adds: onLabel?, offLabel?, defaultValue: boolean
   - `DropdownElement` — adds: options: string[], defaultIndex: number
   - `GroupBoxElement` — adds: title?, borderColor?
6. Define `UIElement` as discriminated union of all specific element types
7. Define `BlockUILayout` interface: { canvasWidth: number, canvasHeight: number, elements: UIElement[], backgroundColor?: string }
8. Define `LayoutPreset` interface: { id: string, name: string, description?: string, thumbnail?: string, layout: BlockUILayout, tags?: string[] }

## 5. Data Structures
* `UIElement` is the primary discriminated union — type field acts as discriminant for narrowing
* `BlockUILayout.elements` is the serialized state persisted in CustomBlockDefinition.uiLayout
* `LayoutPreset` wraps a BlockUILayout with metadata for the preset browser

## 6. Error Handling & Edge Cases
* All UIElement position and size values must be numbers; string values (e.g., CSS "auto") are not valid in this type system
* The `binding` and `portBinding` fields are optional — an element without a binding is purely decorative (e.g., TextLabel, GroupBox)
* GroupBox has no binding and no portBinding — it is a visual container only
* Discriminated union requires `type` field to be a string literal on every element for TypeScript narrowing to work

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify UIElement union covers all 9 element types from the UIElementType enum
    * ARC_FUNC_02: Verify BlockUILayout serializes and deserializes correctly via JSON.stringify / JSON.parse without data loss
    * ARC_FUNC_03: Verify TypeScript exhaustive switch on UIElement.type covers all 9 variants without requiring a default case
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify RotaryKnobElement and HorizontalSliderElement enforce min < max at the type level where possible (runtime validation in PropertyEditor)
    * ARC_VAL_02: Verify UIElementBase.id is required (not optional) to ensure all elements have unique identifiers
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify UI_DesignCanvas handles an unknown UIElementType gracefully (shows a placeholder) in case of version mismatch in serialized data

## 8. Notes & Considerations
* TODO status: this spec needs verification against the actual implementation in blockUILayout.ts, uiElement.ts, and layoutPreset.ts — these files may not exist yet or may differ from this spec
* Split across multiple files (blockUILayout.ts, uiElement.ts, layoutPreset.ts) for organization; consider a barrel export (index.ts) in the types/ directory
* LayoutPreset thumbnail can be a base64-encoded data URL for self-contained preset files
