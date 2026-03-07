# Node Specification: UI_PlatformCard - Platform Info Card

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Render an individual platform display card within UI_PlatformSelector. Show the platform name, available I/O (audio channels, controls, MIDI capability), form factor description, and selected/unselected visual state.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** None
* **Input Data/State:** PlatformDefinition data passed as props; isSelected boolean; onClick callback

## 3. Interfaces
* **Outputs / Results:** onClick(platformId) invoked on card click
* **File Location:** src/components/architecture/PlatformCard.tsx

## 4. Core Logic & Processing Steps
1. Receive props: platformId, name, description, specs (audioChannels, knobs, buttons, hasMidi, hasOled, hasKeyboard), isSelected, onClick
2. Render card container with click handler
3. Apply active border/glow styling when isSelected=true
4. Render platform name as heading
5. Render spec badges or bullet list: audio channels, knob count, button count, MIDI badge, OLED badge, keyboard badge (if applicable)
6. Render description text

## 5. Data Structures
* Props: `{ platformId: string, name: string, description: string, specs: PlatformSpecs, isSelected: boolean, onClick: (id: string) => void }`
* `PlatformSpecs`: `{ audioChannels: number, knobs: number, buttons: number, hasMidi: boolean, hasOled: boolean, hasKeyboard: boolean, keyCount?: number }`

## 6. Error Handling & Edge Cases
* Missing optional spec fields: render "-" or omit that spec row
* Very long description text: truncate with ellipsis; show full text on tooltip hover

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify clicking the card calls onClick with the correct platformId
    * ARC_FUNC_02: Verify isSelected=true applies a visually distinct active style
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify missing spec fields render gracefully without showing "undefined"
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify null/undefined props for name or specs show placeholder text without crashing

## 8. Notes & Considerations
* This is a purely presentational component; no internal state, no side effects
* For the Neon Glass visual theme, selected state should show a neon color border glow (matching the platform's signal type color or a consistent accent color)
* Spec badges should use consistent iconography: audio note icon, knob icon, MIDI plug icon, screen icon
