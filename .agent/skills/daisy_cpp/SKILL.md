---
name: daisy_cpp
description: Expert C++ coding standards and patterns for Daisy Pod and Field platforms.
---

# Daisy C++ Coding Skill

This skill defines the coding standards, architectural patterns, and hardware assumptions for developing C++ firmware on Daisy Pod and Daisy Field platforms.

## 1. Hardware Assumptions

### MIDI Connectivity
*   **Primary Input**: Unless explicitly specified otherwise, assume an **external MIDI keyboard** is connected.
*   **Note Handling**: Do not rely on valid button/key combinations for musical note input unless requested. Use MIDI events for NoteOn/NoteOff.

### Daisy Field Specifics
*   **Keyboard Usage**: Since MIDI handles musical notes, the Field's onboard buttons (Keys A1-8 and B1-8) are reserved for **application control** (e.g., mode switching, octaves, presets, menu navigation) rather than acting as a piano keyboard.
*   **Knobs**: 8 knobs are available for parameters.
*   **OLED**: 128x64 monochrome display.

## 2. Mandatory Libraries (Field)

### FieldUX
*   **Requirement**: Every Daisy Field project **MUST** utilize the `FieldUX` library for consistent user interface behavior.
*   **Location**: `DaisyExamples/MyProjects/_projects/FieldArpeggiator/field_ux.h` (Copy this to your project if missing).
*   **Usage Pattern**:
    ```cpp
    #include "field_ux.h"
    
    // Global
    synth::FieldUX ux;
    
    // Setup
    void Setup() {
        // ... hardware init ...
        ux.Init(&hw);
    }
    
    // Audio Callback
    void AudioCallback(AudioHandle::InputBuffer in, AudioHandle::OutputBuffer out, size_t size) {
        hw.ProcessAllControls();
        
        // Process Knobs (Smooth)
        float knob_values[8];
        ux.ProcessKnobs(knob_values);
        
        // ... DSP processing ...
    }
    
    // Main Loop
    int main(void) {
        // ... setup ...
        while(1) {
            // Update LEDs and OLED
            ux.UpdateLeds(...);
            ux.DrawHeader(...);
            System::Delay(16);
        }
    }
    ```

## 3. Project Structure

For new C++ projects:
1.  **Directory**: `DaisyExamples/MyProjects/_projects/<project_name>`
2.  **Files**:
    *   `<project_name>.cpp`: Main source file
    *   `field_ux.h` / `field_ux.cpp`: UX Library (for Field)
    *   `Makefile`: Standard Daisy Makefile (refer to templates)
    *   `README.md`: Documentation including controls and build steps.

## 4. Code Generation Rules (DVPE)

When modifying the CodeGenerator for DVPE:
*   Ensure `field_ux` is integrated into the generated `main` loop for Field targets.
*   Map MIDI inputs to `MidiEvent` handlers.
*   Expose Key A1-A8/B1-B8 as generic logic gates/triggers if not assigned to specific app functions.
