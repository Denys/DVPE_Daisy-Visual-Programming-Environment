# Node Specification: UI_HelpMenu - Help Menu

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Dropdown menu in the application top bar providing user access to help resources: keyboard shortcuts modal, external documentation links, about/version information. Centralizes all discovery and support entry points in one accessible location.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** STATE_UIStore
* **Input Data/State:** Application version string (from package.json or build config), STATE_UIStore for controlling modal visibility (showShortcutsModal flag)

## 3. Interfaces
* **Outputs / Results:** Opens UI_ShortcutsModal by setting STATE_UIStore.showShortcutsModal = true; opens external documentation links in a new browser tab; displays version string inline
* **File Location:** src/components/TopBar/HelpMenu.tsx

## 4. Core Logic & Processing Steps
1. Render a "Help" button or "?" icon in the top bar that opens a dropdown menu on click
2. Dropdown menu items:
   - "Keyboard Shortcuts" (Ctrl+?) → dispatch STATE_UIStore action to open UI_ShortcutsModal
   - "Documentation" → open external docs URL in new tab (target="_blank" with rel="noopener noreferrer")
   - "DaisySP Reference" → open DaisySP GitHub/docs URL in new tab
   - Divider
   - "About DVPE" → show version string inline or open a minimal about dialog
3. Close dropdown on item selection or outside click
4. Keyboard navigation within the dropdown (arrow keys, Enter, Escape to close)

## 5. Data Structures
* `MenuItem` — label: string, action: () => void | string (URL), icon?: ReactNode, shortcut?: string
* STATE_UIStore.showShortcutsModal — boolean flag toggled by this component

## 6. Error Handling & Edge Cases
* External links should use rel="noopener noreferrer" to prevent tab-napping security issues
* If version string is undefined or unavailable, display "Version: unknown" rather than crashing
* Dropdown must close on Escape key press to support keyboard-only navigation

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify clicking "Keyboard Shortcuts" opens UI_ShortcutsModal
    * ARC_FUNC_02: Verify "Documentation" link opens the correct external URL in a new tab
    * ARC_FUNC_03: Verify the application version is displayed correctly in the About section
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify the dropdown closes when clicking outside its bounds
    * ARC_VAL_02: Verify Escape key closes the dropdown
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify missing version string displays "unknown" without a runtime error

## 8. Notes & Considerations
* Documentation URL should be configurable (environment variable or config constant) rather than hardcoded
* Consider adding a "Report a Bug" link that opens a GitHub issue template URL
* The "?" button in the top bar should have sufficient contrast against the dark canvas background per accessibility guidelines
