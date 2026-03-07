# Node Specification: UI_ShortcutsModal - Keyboard Shortcuts Modal

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Modal dialog that lists all keyboard shortcuts available in DVPE. Shortcuts are organized by category for easy scanning. Opened from UI_HelpMenu or via the Ctrl+? shortcut. Provides users with a discoverable reference for all keyboard interactions without leaving the application.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** STATE_UIStore
* **Input Data/State:** STATE_UIStore.showShortcutsModal (boolean) controls visibility; shortcut definitions are a static data structure defined within this component or imported from a constants file

## 3. Interfaces
* **Outputs / Results:** On close (Escape, close button, backdrop click): dispatches STATE_UIStore action to set showShortcutsModal = false
* **File Location:** src/components/Help/ShortcutsModal.tsx

## 4. Core Logic & Processing Steps
1. Subscribe to STATE_UIStore.showShortcutsModal; render null (or unmount) when false
2. When true, render a modal overlay with a centered dialog panel
3. Dialog structure: title "Keyboard Shortcuts", close button (×), scrollable content area, close footer button
4. Content: render shortcut categories as sections with headers and two-column rows (key combination | action description)
5. Categories and shortcuts:
   - **Canvas**: Ctrl+Z (Undo), Ctrl+Shift+Z (Redo), Ctrl+S (Save), Ctrl+A (Select All), Delete/Backspace (Delete Selected), Ctrl+D (Duplicate), Space+Drag (Pan Canvas), Scroll (Zoom), Ctrl+0 (Fit to Screen)
   - **Selection**: Click (Select), Shift+Click (Add to Selection), Drag (Marquee Select), Escape (Deselect All)
   - **Block Operations**: Ctrl+C (Copy), Ctrl+V (Paste), Ctrl+X (Cut), Enter (Open Inspector), Ctrl+G (Group)
   - **Application**: Ctrl+N (New Project), Ctrl+O (Open Project), Ctrl+E (Export Code), Ctrl+? (Open This Modal)
6. Trap focus within the modal while open
7. Close on Escape key, backdrop click, or explicit close button

## 5. Data Structures
* `ShortcutCategory` — name: string, shortcuts: ShortcutEntry[]
* `ShortcutEntry` — keys: string[] (e.g., ['Ctrl', 'Z']), description: string
* Static data; no runtime computation required

## 6. Error Handling & Edge Cases
* Modal must be accessible: role="dialog", aria-modal="true", aria-labelledby pointing to title
* Focus must return to the triggering element (e.g., Help menu button) when the modal is closed
* Shortcut list should be maintainable in a single constants file to avoid drift between this modal and actual registered shortcuts

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify modal opens when STATE_UIStore.showShortcutsModal is set to true
    * ARC_FUNC_02: Verify pressing Escape while the modal is open sets STATE_UIStore.showShortcutsModal to false and closes the modal
    * ARC_FUNC_03: Verify all defined shortcut categories and entries are rendered
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify focus is trapped within the modal (Tab key cycles through focusable elements inside, not behind)
    * ARC_VAL_02: Verify backdrop click closes the modal
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify modal renders correctly even if the shortcuts constant list is empty (shows empty sections, not crash)

## 8. Notes & Considerations
* Key combination display should use platform-appropriate labels (e.g., Cmd on macOS, Ctrl on Windows/Linux) — detect via navigator.platform or a utility
* Consider a search/filter input at the top of the modal for large shortcut lists
* The shortcut definitions in this modal should be the single source of truth; actual hotkey registrations in HOOK_ParameterShortcuts and other hooks should import from the same constants
