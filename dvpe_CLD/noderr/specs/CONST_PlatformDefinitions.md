# Node Specification: CONST_PlatformDefinitions - Platform Definitions Constant

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Define the static hardware specifications for Daisy Seed, Pod, and Field platforms. Provide constants covering available pins, default controls, I/O capabilities, and whether the platform has fixed (Pod/Field) or configurable (Seed) pin assignments. These constants are the authoritative source of platform hardware knowledge used by UI_PlatformSelector, UI_PinMapper, and SVC_CodeGenerator.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** None
* **Input Data/State:** No runtime input; purely static constants defined at compile time

## 3. Interfaces
* **Outputs / Results:** Exported TypeScript constants `PLATFORM_DEFINITIONS: Record<string, PlatformDefinition>` and type `PlatformDefinition`
* **File Location:** src/types/hardware.ts

## 4. Core Logic & Processing Steps
1. Define `PlatformDefinition` interface: { id, name, description, audioChannels, availablePins, fixedControls, hasMidi, hasOled, hasKeyboard, keyCount, defaultBlockSize, defaultSampleRate }
2. Define Seed entry: configurable pins (GPIO, ADC, DAC, SPI, I2C, USART, USB); no fixed controls; no OLED; no keyboard; 2 audio channels
3. Define Pod entry: 2 knobs, 2 buttons, 2 RGB LEDs, 1 MIDI TRS in/out, 2 audio channels; fixed controls (no pin mapper needed); block size default 4
4. Define Field entry: 8 knobs, 16 keyboard keys (chromatic + modifier), OLED 128x64, MIDI TRS, 4 CV inputs, 2 CV outputs, 2 gate inputs; 2 audio channels; fixed controls; block size default 48
5. Export `PLATFORM_DEFINITIONS` map and individual `DAISY_SEED`, `DAISY_POD`, `DAISY_FIELD` exports

## 5. Data Structures
```typescript
interface PlatformDefinition {
  id: 'seed' | 'pod' | 'field';
  name: string;
  description: string;
  audioChannels: number;
  availablePins?: PinDefinition[];      // Seed only
  fixedControls?: ControlDefinition[];  // Pod/Field
  hasMidi: boolean;
  hasOled: boolean;
  hasKeyboard: boolean;
  keyCount?: number;
  knobCount?: number;
  buttonCount?: number;
  defaultBlockSize: number;
  defaultSampleRate: number;
}
interface PinDefinition {
  id: string;         // e.g., 'D0', 'A0'
  name: string;       // human-readable
  capabilities: ('audio' | 'cv' | 'gate' | 'gpio' | 'i2c' | 'spi')[];
  physicalNumber: number;
}
interface ControlDefinition {
  id: string;
  type: 'knob' | 'button' | 'keyboard_key' | 'cv_input' | 'cv_output' | 'gate_input' | 'gate_output' | 'led';
  label: string;
  index: number;
}
```

## 6. Error Handling & Edge Cases
* These are compile-time constants; no runtime error handling required
* If a consumer requests a platform ID not in PLATFORM_DEFINITIONS: return undefined; consumer is responsible for null check

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify Field definition has keyCount=16 and knobCount=8
    * ARC_FUNC_02: Verify Pod definition has knobCount=2 and buttonCount=2
    * ARC_FUNC_03: Verify Seed definition has availablePins array and no fixedControls
    * ARC_FUNC_04: Verify all three platforms have hasMidi=true
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify TypeScript type system enforces required fields at compile time (no optional id or name)
* **Error Handling Criteria:**
    * ARC_ERR_01: Not applicable (static constants)

## 8. Notes & Considerations
* Daisy Field knob indices 0–7 correspond to `hw.knob[0]` through `hw.knob[7]` in libDaisy
* Daisy Field keyboard key indices 0–15 correspond to the 16-key chromatic keyboard (A-side: indices 0–7, B-side: indices 8–15)
* Pod knobs are `hw.knob1` and `hw.knob2` (named, not indexed)
* Pin definitions for Seed should match the official Daisy Seed pinout documentation; keep synchronized with libDaisy updates
* SVC_CodeGenerator uses these definitions to generate correct `hw.Init()` and control initialization code
