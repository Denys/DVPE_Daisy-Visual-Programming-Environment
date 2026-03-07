# Node Specification: UI_PlatformSelector - Platform Selector

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Provide a card-based UI for selecting the target Daisy hardware platform: Seed, Pod, or Field. Each card displays the platform name, key specifications, and I/O capabilities so the user can make an informed choice before configuring the patch.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** CONST_PlatformDefinitions
* **Input Data/State:** current selected platform from HardwareConfiguration (passed via props); CONST_PlatformDefinitions for platform specs; onChange callback to parent UI_ArchitectureWindow

## 3. Interfaces
* **Outputs / Results:** onChange(platformId: 'seed'|'pod'|'field') callback invoked on card click
* **File Location:** src/components/architecture/PlatformSelector.tsx

## 4. Core Logic & Processing Steps
1. Receive props: selectedPlatform ('seed'|'pod'|'field'), onChange
2. Load platform definitions from CONST_PlatformDefinitions
3. Render 3 platform cards (one per platform) in a horizontal row or grid
4. Each card renders: platform name (large), brief description, key specs (audio channels, controls, MIDI, OLED)
5. Highlight the currently selected platform card with an active border/glow
6. On card click: call onChange(platformId)

## 5. Data Structures
* Props: `{ selectedPlatform: string, onChange: (id: string) => void }`
* `PlatformDefinition` from CONST_PlatformDefinitions: { id, name, description, audioChannels, controls, hasMidi, hasOled }

## 6. Error Handling & Edge Cases
* CONST_PlatformDefinitions missing entries: render error state "Platform definitions unavailable"
* selectedPlatform does not match any definition ID: no card highlighted; not expected in normal operation

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify clicking a platform card calls onChange with the correct platformId
    * ARC_FUNC_02: Verify the currently selected platform card has a distinct active highlight
    * ARC_FUNC_03: Verify all three platforms (Seed, Pod, Field) are rendered as cards
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify unrecognized selectedPlatform prop renders no card highlighted without crashing
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify CONST_PlatformDefinitions load failure renders error state instead of blank

## 8. Notes & Considerations
* Platform cards should show visual differentiators: Seed (minimal, DIY), Pod (knobs+buttons), Field (keyboard+OLED); consider adding a small diagram or icon
* Each card could link to external Electro-Smith documentation for the platform (opens in new tab)
* This component is stateless; selected platform state lives in parent UI_ArchitectureWindow
