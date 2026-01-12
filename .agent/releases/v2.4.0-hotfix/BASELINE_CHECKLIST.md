# DVPE v2.4.0-hotfix Baseline Verification Checklist

**Date**: 2026-01-01  
**Purpose**: Ensure development environment is properly configured for v2.4 Hotfix baseline

---

## Pre-Implementation Verification

### Environment Setup

- [ ] **Node.js Version**
  - dvpe (web): Node.js 18.0.0+
  - dvpe_CLD (Tauri): Node.js 16.0.0+
  - Command: `node --version`

- [ ] **npm/pnpm Available**
  - Command: `npm --version` or `pnpm --version`

- [ ] **Rust Toolchain** (for dvpe_CLD only)
  - Rust 1.70.0+
  - Command: `rustc --version`
  - Windows: MSVC Build Tools installed

### Dependency Installation

- [ ] **dvpe (Web Frontend)**
  ```bash
  cd dvpe
  npm install
  ```
  Expected: No errors, node_modules created

- [ ] **dvpe_CLD (Tauri Desktop)**
  ```bash
  cd dvpe_CLD
  npm install
  ```
  Expected: No errors, node_modules created

### Critical Fix Verification

#### FIX-001: Drag & Drop Race Condition

- [ ] **File Check**: `dvpe_CLD/src/components/Canvas/Canvas.tsx`
  - Wrapper div should NOT have `onDrop` attribute
  - Wrapper div should NOT have `onDragOver` attribute
  
  ```tsx
  // CORRECT (v2.4 baseline):
  <div
    ref={reactFlowWrapper}
    className="w-full h-full bg-surface-primary"
  >
  
  // INCORRECT (pre-v2.4 - DO NOT USE):
  <div
    ref={reactFlowWrapper}
    className="w-full h-full bg-surface-primary"
    onDragOver={onDragOver}   // ❌ REMOVE
    onDrop={onDrop}           // ❌ REMOVE
  >
  ```

#### FIX-002: Drag Termination Bug

- [ ] **File Check**: `dvpe_CLD/src/components/Canvas/DragOverlay.tsx`
  - Should NOT contain window `dragend` listener useEffect
  
  ```tsx
  // This block should NOT exist in DragOverlay.tsx:
  // ❌ DO NOT INCLUDE:
  // React.useEffect(() => {
  //     if (!draggingBlockId) return;
  //     const handleWindowDragEnd = (e: DragEvent) => {
  //         console.log('DragOverlay: Window Drag End. Clearing state.');
  //         setDraggingBlock(null);
  //     };
  //     window.addEventListener('dragend', handleWindowDragEnd);
  //     return () => window.removeEventListener('dragend', handleWindowDragEnd);
  // }, [draggingBlockId, setDraggingBlock]);
  ```

---

## Functional Testing

### Drag & Drop Functionality

- [ ] **Basic Drag Test**
  1. Start the app: `cd dvpe_CLD && npm run tauri:dev`
  2. Open browser console (F12)
  3. Drag an "Oscillator" block from the library
  4. Drop it on the canvas
  
  **Expected Console Output**:
  ```
  Drag start: oscillator
  DragOverlay state: {draggingBlockId: 'oscillator'}
  DragOverlay: Portal Drag Enter
  DragOverlay: Portal Drag Over
  DragOverlay: Portal Drop captured! [x, y]
  DragOverlay: Adding block: oscillator at [x, y]
  DragOverlay state: {draggingBlockId: null}
  ```
  
  **Expected Visual Result**:
  - Block appears on canvas at drop location
  - No red overlay lingering
  - No console errors

- [ ] **Multi-Block Test**
  1. Drag and drop 3 different block types
  2. Verify all render correctly
  3. Verify all can be connected

- [ ] **Connection Test**
  1. Add an Oscillator block
  2. Add a VCA block
  3. Connect Oscillator output to VCA input
  4. Verify connection line renders

### Code Generation Test

- [ ] **Generate C++ Code**
  1. Create a simple patch (1 oscillator connected to output)
  2. Use export function to generate code
  3. Verify generated code compiles conceptually
  4. Check for correct DaisySP includes

### Patch Save/Load Test

- [ ] **Save Patch**
  1. Create a patch with multiple blocks
  2. Save patch to file
  3. Verify JSON structure is valid

- [ ] **Load Patch**
  1. Close and reopen application
  2. Load the saved patch
  3. Verify all blocks and connections restore correctly

---

## Build Verification

### Development Build

- [ ] **dvpe (Web)**
  ```bash
  cd dvpe
  npm run dev
  ```
  Expected: Vite dev server starts on localhost

- [ ] **dvpe_CLD (Tauri)**
  ```bash
  cd dvpe_CLD
  npm run tauri:dev
  ```
  Expected: Tauri app launches with hot-reload

### Production Build

- [ ] **dvpe (Web)**
  ```bash
  cd dvpe
  npm run build
  ```
  Expected: `dist/` folder created with optimized assets

- [ ] **dvpe_CLD (Tauri)**
  ```bash
  cd dvpe_CLD
  npm run tauri:build
  ```
  Expected: Platform-specific executable created

---

## Documentation Verification

- [ ] **CHANGELOG.md exists** at project root
- [ ] **Release notes exist** at `.agent/releases/v2.4.0-hotfix/RELEASE_NOTES.md`
- [ ] **Version manifest exists** at `.agent/releases/v2.4.0-hotfix/VERSION_MANIFEST.json`
- [ ] **Bug fix reports exist**:
  - `.agent/reports/drag_drop_root_cause_fix_2025-12-30.md`
  - `.agent/reports/drag_termination_bug_analysis_2025-12-30.md`

---

## Regression Prevention

### Code Review Checklist

When modifying Canvas or DragOverlay components, verify:

- [ ] No new `onDrop` handlers added to Canvas wrapper
- [ ] No new `onDragOver` handlers added to Canvas wrapper  
- [ ] No window-level drag event listeners in DragOverlay
- [ ] Drop handling remains solely in DragOverlay component
- [ ] State management flows through Zustand store correctly

### Test Coverage

- [ ] Unit tests pass: `npm run test`
- [ ] No new test failures introduced
- [ ] Drag/drop integration test exists (if applicable)

---

## Sign-Off

| Verification | Status | Date | Notes |
|--------------|--------|------|-------|
| Environment Setup | ☐ | | |
| Dependency Installation | ☐ | | |
| Critical Fix Verification | ☐ | | |
| Functional Testing | ☐ | | |
| Build Verification | ☐ | | |
| Documentation Verification | ☐ | | |
| Regression Prevention | ☐ | | |

**Verified By**: _________________  
**Date**: _________________

---

## Troubleshooting

### Common Issues

**Issue**: Drag and drop still failing after baseline verification  
**Solution**: Check if any custom modifications re-introduced the removed handlers

**Issue**: Tauri build fails  
**Solution**: Ensure Rust toolchain and Windows Build Tools are installed

**Issue**: npm install fails  
**Solution**: Delete `node_modules` and `package-lock.json`, then retry

**Issue**: Type errors in TypeScript  
**Solution**: Verify TypeScript version matches baseline (5.7.x for dvpe_CLD)

---

*This checklist ensures the v2.4.0-hotfix baseline is correctly established.*
