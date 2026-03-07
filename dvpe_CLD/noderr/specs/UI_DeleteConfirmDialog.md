# Node Specification: UI_DeleteConfirmDialog - Delete Confirmation Dialog

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** Provide a generic modal confirmation dialog shown before destructive operations. Present the user with a clear message describing what will be deleted or cleared, a Cancel button to abort, and a Confirm button to proceed with the provided callback.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** None
* **Input Data/State:** message string, confirmLabel string, onConfirm callback, onCancel callback; open/close state controlled by parent component

## 3. Interfaces
* **Outputs / Results:** Calls onConfirm() on Confirm click; calls onCancel() on Cancel click or Escape key; dialog has no internal state mutations
* **File Location:** src/components/Library/DeleteConfirmDialog.tsx

## 4. Core Logic & Processing Steps
1. Receive props: isOpen, message, confirmLabel (default "Delete"), cancelLabel (default "Cancel"), onConfirm, onCancel
2. When isOpen=true: render modal overlay with dialog box
3. Display message text prominently
4. Render Cancel button: calls onCancel(); closes dialog
5. Render Confirm button (styled in destructive red): calls onConfirm(); parent is responsible for closing dialog after
6. Pressing Escape key calls onCancel()
7. Clicking modal overlay backdrop calls onCancel()
8. Focus trap: focus should be on Cancel button by default (safer default for destructive dialogs)

## 5. Data Structures
* Props: `{ isOpen: boolean, message: string, confirmLabel?: string, cancelLabel?: string, onConfirm: () => void, onCancel: () => void }`

## 6. Error Handling & Edge Cases
* onConfirm throws: catch error and show error message in dialog rather than crashing
* Called without message: render generic "Are you sure?" message

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify "Cancel" button calls onCancel and the dialog is dismissed without calling onConfirm
    * ARC_FUNC_02: Verify "Confirm" button calls onConfirm
    * ARC_FUNC_03: Verify Escape key triggers onCancel
    * ARC_FUNC_04: Verify focus is placed on Cancel button when dialog opens
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify dialog renders with a default message when message prop is empty or undefined
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify onConfirm throwing an error does not close the dialog silently; error is shown to user

## 8. Notes & Considerations
* This is a generic reusable dialog; do not add domain-specific logic to this component
* Use aria-modal="true", role="alertdialog", and aria-labelledby/aria-describedby for accessibility
* The focus trap ensures keyboard users cannot tab to elements behind the modal
* The Confirm button should use a distinct danger color (e.g., red) to visually signal the destructive nature of the action; Cancel should be the visually dominant/safe option
