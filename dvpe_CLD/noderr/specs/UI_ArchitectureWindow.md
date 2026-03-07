# Node Specification: UI_ArchitectureWindow - Hardware Config Modal

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Complex

## 1. Purpose
* **Goal:** Provide a modal for configuring the target Daisy hardware platform and its peripherals. Allow selection of Seed/Pod/Field platform, pin mapping of patch I/O blocks to physical hardware pins, and peripheral configuration (codec, SDRAM, sample rate, block size). All settings are stored in HardwareConfiguration within STATE_PatchStore metadata.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** STATE_PatchStore, TYPES_HardwareConfig, UI_PlatformSelector, UI_PinMapper, UI_PeripheralConfig
* **Input Data/State:** HardwareConfiguration from STATE_PatchStore.metadata.hardwareConfig; opened from toolbar action; CONST_PlatformDefinitions for available platform specs

## 3. Interfaces
* **Outputs / Results:** Updated HardwareConfiguration persisted to STATE_PatchStore.metadata.hardwareConfig; modal close event; downstream SVC_CodeGenerator reads this configuration during code generation
* **File Location:** src/components/architecture/ArchitectureWindow.tsx

## 4. Core Logic & Processing Steps
1. Open modal; load current HardwareConfiguration from STATE_PatchStore.metadata.hardwareConfig
2. Render tabbed or sectioned layout:
   - Section 1: Platform Selection (UI_PlatformSelector)
   - Section 2: Pin Mapping (UI_PinMapper) — shown only for Seed (configurable pins); hidden for Pod/Field (fixed hardware)
   - Section 3: Peripheral Configuration (UI_PeripheralConfig)
3. On platform change: reload pin mapper with the selected platform's available pins; reset pin assignments that are incompatible with the new platform
4. On Save: validate all required I/O blocks have pin assignments (for Seed); call STATE_PatchStore.updateHardwareConfig(newConfig)
5. On Cancel: discard changes; restore previous HardwareConfiguration
6. Warning: if user changes platform, warn that existing pin assignments will be reset

## 5. Data Structures
* `HardwareConfiguration`: { platform: 'seed'|'pod'|'field', pinAssignments: Record<string, string>, sampleRate: number, blockSize: number, useSDRAM: boolean, useExternalCodec: boolean }
* `PlatformDefinition`: { id: string, name: string, availablePins: PinSpec[], fixedControls?: ControlSpec[] }

## 6. Error Handling & Edge Cases
* Patch has audio I/O blocks but no pin assignments on Seed: show warning before save but allow saving (code generator will fail with meaningful error later)
* Switching from Field to Seed: Field has fixed controls (knobs, keyboard); those control mappings become invalid on Seed; warn and reset
* Invalid sample rate value: validate against supported rates [8000, 16000, 32000, 48000, 96000] Hz
* Modal opened when no patch is loaded: show disabled state or prompt to create a patch first

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify selecting Field platform sets platform='field' in STATE_PatchStore.metadata.hardwareConfig
    * ARC_FUNC_02: Verify pin mapper panel is hidden when Pod or Field is selected (fixed hardware)
    * ARC_FUNC_03: Verify sample rate and block size values from UI_PeripheralConfig are saved to HardwareConfiguration on save
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify invalid sample rate (e.g., 44100 if unsupported) shows validation error
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify STATE_PatchStore.updateHardwareConfig() failure shows error toast and keeps modal open

## 8. Notes & Considerations
* Pod and Field have fixed hardware controls (knobs, buttons, keyboard); the pin mapper is only relevant for Seed where the user connects their own hardware
* The architecture configuration is critical input for SVC_CodeGenerator; incorrect configuration will produce non-functional code; consider adding a "Validate Configuration" step before code generation
* Block size on Daisy: recommended values are 4 (Pod), 48 (Field), or 4 (Seed) per DVPE memory docs; UI should offer these as preset options in addition to manual entry
