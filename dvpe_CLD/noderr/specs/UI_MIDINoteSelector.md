# Node Specification: UI_MIDINoteSelector - MIDI Note Picker

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Provide a MIDI note selection control that shows a small piano keyboard or note selector. Allow users to pick a MIDI note number (0–127) by clicking a key or selecting from a note name list. Display both the note name (e.g., C4, D#3) and the MIDI number.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** STATE_PatchStore
* **Input Data/State:** current MIDI note number (0–127), onChange callback from parent UI_Inspector

## 3. Interfaces
* **Outputs / Results:** onChange(newNote: number) invoked on note selection; displays note name and MIDI number
* **File Location:** src/components/Inspector/MIDINoteSelector.tsx

## 4. Core Logic & Processing Steps
1. Receive props: value (MIDI number 0–127), onChange
2. Convert MIDI number to note name using standard mapping: note name = noteNames[value % 12] + octave where octave = floor(value/12) - 1 (so MIDI 60 = C4)
3. Render a mini piano keyboard spanning 2 octaves around the current note
4. Highlight the currently selected key on the keyboard
5. On key click: determine the MIDI note number from the clicked key, call onChange(noteNumber)
6. Also render a numeric input or up/down arrows for direct MIDI number entry
7. Show note name string alongside MIDI number (e.g., "C4 (60)")

## 5. Data Structures
* Props: `{ value: number, onChange: (v: number) => void }`
* Note name array: `['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']` (12 chromatic pitches)
* MIDI number range: 0–127

## 6. Error Handling & Edge Cases
* Value out of range (< 0 or > 127): clamp to [0, 127] before display
* Value = NaN: default to 60 (middle C)

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify MIDI number 60 displays as "C4 (60)"
    * ARC_FUNC_02: Verify clicking a piano key calls onChange with the correct MIDI number
    * ARC_FUNC_03: Verify the currently selected note is highlighted on the keyboard
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify value 128 is clamped to 127 before rendering
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify NaN value defaults to 60 (C4) without crashing

## 8. Notes & Considerations
* The piano keyboard is a compact 2-octave strip; it scrolls or recenters around the selected note so the selected key is always visible
* Black keys (sharps/flats) are rendered as narrower overlapping keys using absolute positioning within the keyboard SVG or CSS
* Consider supporting MIDI learn: a "Learn" button that listens for the next incoming MIDI note and sets it as the value; requires connection to the MIDI input system
