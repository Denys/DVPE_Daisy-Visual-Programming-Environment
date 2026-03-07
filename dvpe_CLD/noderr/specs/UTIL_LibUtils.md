# Node Specification: UTIL_LibUtils - General Utility Functions

**Version:** 1.0
**Date:** 2026-03-07
**Author:** AI-Agent (Install Reconcile)
**Classification:** Standard

## 1. Purpose
* **Goal:** General-purpose utility functions used throughout the DVPE application. The primary and most critical export is `cn()` — a Tailwind CSS class name merger that combines `clsx` (conditional class logic) and `tailwind-merge` (conflict resolution). Additional helpers can be added as the codebase grows.

## 2. Dependencies & Triggers
* **Prerequisite NodeIDs:** None (utility module, no DVPE-specific imports)
* **Input Data/State:** `clsx` npm package, `tailwind-merge` npm package

## 3. Interfaces
* **Outputs / Results:** Exported utility functions: `cn(...inputs: ClassValue[]): string` — the primary export; any additional general helper functions
* **File Location:** src/lib/utils.ts

## 4. Core Logic & Processing Steps
1. Import `clsx` and `type ClassValue` from 'clsx'
2. Import `twMerge` from 'tailwind-merge'
3. Define and export `cn`:
   ```typescript
   import { clsx, type ClassValue } from 'clsx';
   import { twMerge } from 'tailwind-merge';

   export function cn(...inputs: ClassValue[]): string {
     return twMerge(clsx(inputs));
   }
   ```
4. `clsx` handles: conditional classes (objects), array classes, falsy values
5. `twMerge` handles: Tailwind class conflict resolution — last conflicting class wins (e.g., `p-2 p-4` → `p-4`)
6. The combined result is a clean, deduplicated, correctly-ordered className string safe for use in JSX

## 5. Data Structures
* `ClassValue` from clsx — accepts: string, undefined, null, boolean, string[], object (key: boolean)
* Return type: string — a space-separated class name string
* No stateful data structures

## 6. Error Handling & Edge Cases
* Falsy inputs (undefined, null, false) are safely ignored by clsx — no guard needed
* Empty input produces an empty string — valid and expected behavior
* Conflicting Tailwind utilities: twMerge correctly resolves them (last wins per Tailwind specificity rules)
* Non-Tailwind classes are passed through unmodified by twMerge

## 7. ARC Verification Criteria
* **Functional Criteria:**
    * ARC_FUNC_01: Verify `cn("p-2", "p-4")` returns `"p-4"` (twMerge conflict resolution — last wins)
    * ARC_FUNC_02: Verify `cn("text-red-500", condition && "text-blue-500")` returns `"text-blue-500"` when condition is true, `"text-red-500"` when false
    * ARC_FUNC_03: Verify `cn(undefined, null, false, "flex")` returns `"flex"` (falsy values ignored)
* **Input Validation Criteria:**
    * ARC_VAL_01: Verify `cn()` with no arguments returns an empty string without throwing
    * ARC_VAL_02: Verify passing an object `{ "bg-blue-500": true, "bg-red-500": false }` correctly includes only "bg-blue-500"
* **Error Handling Criteria:**
    * ARC_ERR_01: Verify `cn()` does not throw for any input type that ClassValue accepts (exhaustive — never throws)

## 8. Notes & Considerations
* This is a standard shadcn/ui pattern — the implementation is idiomatic and well-established in the React ecosystem
* `tailwind-merge` v2+ has improved performance and better class group definitions; ensure version compatibility with the Tailwind v4 setup in vite.config.ts
* If additional utility functions are needed (e.g., `formatHz()`, `clampValue()`), add them to this file as named exports to avoid utility sprawl across many small files
* Keep this file lean — DVPE-specific helpers belong in domain-specific utility modules, not here
