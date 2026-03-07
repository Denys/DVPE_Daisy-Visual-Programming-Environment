# Node Specification: UI_PeripheralConfig - Peripheral Configuration

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Provide toggle switches and settings controls for optional Daisy hardware peripherals and audio configuration: external audio codec, SDRAM enable, custom sample rate, and audio block size. Settings are passed via onChange to parent UI_ArchitectureWindow for inclusion in HardwareConfiguration.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** TYPES_HardwareConfig
* **Input Data/State:** Current peripheral settings from HardwareConfiguration (useExternalCodec, useSDRAM, sampleRate, blockSize); onChange callback to parent

## 3. Interfaces
* **Outputs / Results:** onChange(partialConfig: Partial<HardwareConfiguration>) invoked when any setting changes
* **File Location:** src/components/architecture/PeripheralConfig.tsx

## 4. Core Logic & Processing Steps
1. Receive props: config (HardwareConfiguration subset), onChange
2. Render "External Audio Codec" toggle: enable/disable external I2S codec
3. Render "SDRAM" toggle: enable use of external SDRAM for large buffers (required for reverb, long delays)
4. Render "Sample Rate" selector: dropdown with supported rates [8000, 16000, 32000, 48000, 96000] Hz; default 48000
5. Render "Block Size" input: numeric input with presets (4, 8, 16, 32, 48, 96, 128); default platform-specific
6. On each change: call onChange({ fieldName: newValue })
7. Show helpful hints/tooltips: SDRAM hint "Enable for delays > 100ms or reverb", blockSize hint "Lower = less latency, higher = better performance"

## 5. Data Structures
* Props: `{ config: { useExternalCodec: boolean, useSDRAM: boolean, sampleRate: number, blockSize: number }, onChange: (updates: Partial<HardwareConfiguration>) => void }`
* Supported sample rates: [8000, 16000, 32000, 48000, 96000]
* Recommended block sizes: [4, 8, 16, 32, 48, 96, 128]

## 6. Error Handling & Edge Cases
* Invalid manual block size entry (non-power-of-2 or out of range): clamp to nearest valid value on blur
* Sample rate not in supported list: display warning but allow (user may know what they're doing with custom hardware)

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify toggling SDRAM calls onChange with { useSDRAM: true/false }
    * ARC_FUNC_02: Verify selecting sample rate 96000 calls onChange with { sampleRate: 96000 }
    * ARC_FUNC_03: Verify changing block size calls onChange with { blockSize: newValue }
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify manual block size 0 is rejected and clamped to minimum valid value (e.g., 4)
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify NaN block size input is handled gracefully (reverts to previous valid value)

## 8. Notes & Considerations
* SDRAM is required for DSP blocks with large internal buffers (ReverbSc, long delay lines); if the patch contains such blocks, consider auto-suggesting SDRAM enable
* Sample rate of 48000 Hz is standard for Daisy; 96000 Hz is available for high-quality processing but halves DSP time budget
* Block size tradeoff: Pod default is 4 (low latency priority), Field default is 48 (efficiency priority) per project memory standards
* Codec and SDRAM options are primarily relevant for advanced Seed configurations with custom hardware; Pod and Field have these fixed
