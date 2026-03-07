# Node Specification: TYPES_HardwareConfig - Hardware Configuration Types

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** TypeScript types for hardware configuration of supported Daisy platforms (Seed, Pod, Field). Defines the structural shape of platform capability descriptions including available pins, standard controls, and peripheral limitations. Consumed by BLOCKS_UserIO, SVC_CodeGenerator, and any UI component that needs to know what hardware is available.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** None (foundational type file)
* **Input Data/State:** N/A — pure type declarations; static platform data defined alongside the types

## 3. Interfaces
* **Outputs / Results:** Exported TypeScript types and constants: PlatformType, PinDefinition, PlatformDefinition, HardwareConfiguration, DEFAULT_HARDWARE_CONFIG, PLATFORMS constant map
* **File Location:** src/types/hardware.ts

## 4. Core Logic & Processing Steps
1. Define `PlatformType` type alias: `'seed' | 'pod' | 'field'`
2. Define `PinCapability` enum or type: 'analog_in', 'analog_out', 'digital_in', 'digital_out', 'midi_in', 'midi_out', 'i2c', 'spi', 'audio'
3. Define `PinDefinition` interface: { pinNumber: number, name: string, capabilities: PinCapability[], hardwareLabel?: string }
4. Define `StandardControls` interface: { knobCount: number, buttonCount: number, encoderCount: number, keyCount: number, ledCount: number, cvInCount: number, cvOutCount: number, displayType?: 'oled_128x64' | 'none' }
5. Define `PlatformDefinition` interface: { type: PlatformType, displayName: string, pins: PinDefinition[], standardControls: StandardControls, audioBufferMode: 'interleaved' | 'non-interleaved', defaultBlockSize: number, sdramAvailable: boolean }
6. Define `HardwareConfiguration` interface: { platform: PlatformType, sampleRate: number, blockSize: number, pinMappings: Record<string, number>, peripheralSettings: Record<string, unknown> }
7. Define `DEFAULT_HARDWARE_CONFIG`: HardwareConfiguration using 'field' as default, 48000 Hz, blockSize 48
8. Define `PLATFORMS` constant: Record<PlatformType, PlatformDefinition> with full definitions for Seed, Pod, and Field

## 5. Data Structures
* `PLATFORMS.pod`:
  - audioBufferMode: 'interleaved'
  - defaultBlockSize: 4
  - standardControls: { knobCount: 2, buttonCount: 2, encoderCount: 1, keyCount: 0, ledCount: 2, cvInCount: 0, cvOutCount: 0, displayType: 'none' }
* `PLATFORMS.field`:
  - audioBufferMode: 'non-interleaved'
  - defaultBlockSize: 48
  - standardControls: { knobCount: 8, buttonCount: 0, encoderCount: 1, keyCount: 16, ledCount: 0, cvInCount: 4, cvOutCount: 2, displayType: 'oled_128x64' }
* `PLATFORMS.seed`:
  - audioBufferMode: 'interleaved'
  - defaultBlockSize: 4
  - standardControls: { knobCount: 0, buttonCount: 0, encoderCount: 0, keyCount: 0, ledCount: 1, cvInCount: 0, cvOutCount: 0, displayType: 'none' }

## 6. Error Handling & Edge Cases
* No runtime logic — purely type and constant definitions
* PLATFORMS constant should be `as const` (readonly) to prevent mutation
* If an unknown PlatformType is used, TypeScript exhaustive checks should catch it at compile time

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify `PLATFORMS.field.standardControls.knobCount === 8` and `keyCount === 16`
    * ARC_FUNC_02: Verify `PLATFORMS.pod.audioBufferMode === 'interleaved'` and `PLATFORMS.field.audioBufferMode === 'non-interleaved'`
    * ARC_FUNC_03: Verify BLOCKS_UserIO platform constraint validation uses PLATFORMS[platform].standardControls to enforce maximum instance counts
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify PlatformType is a discriminated union covering all 3 supported platforms
    * ARC_VAL_02: Verify HardwareConfiguration sampleRate field has a valid type (number) with no default enforcement at the type level (defaults live in DEFAULT_HARDWARE_CONFIG)
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify TypeScript compiler catches usage of an unsupported platform string as a PlatformType (e.g., 'daisy_patch' should be a type error)

## 8. Notes & Considerations
* SVC_CodeGenerator reads platform audio buffer mode from HardwareConfiguration to determine whether to emit interleaved (`out[i]`) or non-interleaved (`out[0][i]`) audio callback code
* Platform definitions are static — they model Daisy hardware as-shipped; custom pinout variants are out of scope for v1
* MEMORY.md notes that Pod uses `hw.SetAudioBlockSize(4)` while Field uses 48 — these should match `PLATFORMS.pod.defaultBlockSize` and `PLATFORMS.field.defaultBlockSize`
