# Release Notes: DVPE v2.4.0-hotfix

**Release Date**: 2026-01-01  
**Codename**: ORION-HOTFIX  
**Status**: Baseline Established

---

## Overview

DVPE v2.4.0-hotfix establishes a stable baseline for continued development of the Daisy Visual Programming Environment. This release consolidates critical bug fixes from December 2025 and implements foundational improvements recommended in the system prompt review.

### Why "ORION"?

> **Orion** — Named after the constellation, representing:
> - **Navigation**: A guiding reference point for future development
> - **Stability**: A fixed constellation that sailors have used for centuries
> - **Foundation**: The baseline from which all future work will build

---

## Critical Fixes Included

### 1. Drag & Drop Event Handler Race Condition

**Severity**: Critical  
**Component**: `Canvas.tsx`  
**Symptoms**: 
- Window turns red during drag
- Block not added to canvas on drop
- "Portal Drop captured!" never logged

**Root Cause**: 
The Canvas wrapper div had `onDrop` and `onDragOver` handlers that intercepted events before the DragOverlay component could process them.

**Solution**:
Remove competing handlers from Canvas wrapper; let DragOverlay handle all drops.

**Verification**:
```
Expected log sequence after fix:
Drag start: oscillator
DragOverlay state: {draggingBlockId: 'oscillator'}
DragOverlay: Portal Drag Enter
DragOverlay: Portal Drag Over
DragOverlay: Portal Drop captured! [x, y]
DragOverlay: Adding block: oscillator at [x, y]
DragOverlay state: {draggingBlockId: null}
```

---

### 2. Premature Drag Termination

**Severity**: Critical  
**Component**: `DragOverlay.tsx`  
**Symptoms**:
- Drag starts correctly
- State immediately cleared
- "Window Drag End. Clearing state." appears prematurely
- No drop event fires

**Root Cause**:
Global window `dragend` listener cleared `draggingBlockId` state before/during drop handler execution.

**Solution**:
Remove the window `dragend` listener useEffect block entirely; the drop handler already manages state clearing.

**Verification**:
- No "Window Drag End" log should appear during normal operation
- Drop handler should be the only source of state clearing

---

## Dependency Baseline

### Production Dependencies (dvpe_CLD)

| Package | Version | Purpose |
|---------|---------|---------|
| @tauri-apps/api | ^1.6.0 | Tauri native API |
| @xyflow/react | ^12.3.6 | Node-based graph editor |
| react | ^18.3.1 | UI framework |
| zustand | ^5.0.2 | State management |
| framer-motion | ^11.15.0 | Animation |
| lucide-react | ^0.468.0 | Icons |
| immer | ^10.0.3 | Immutable state updates |

### Development Dependencies (dvpe_CLD)

| Package | Version | Purpose |
|---------|---------|---------|
| @tauri-apps/cli | ^1.5.11 | Tauri CLI |
| vite | ^6.0.3 | Build tool |
| typescript | ^5.7.2 | Type checking |
| tailwindcss | ^3.4.17 | Styling |
| vitest | ^4.0.15 | Testing |

### Production Dependencies (dvpe - Web)

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.2.0 | UI framework |
| reactflow | ^11.11.4 | Node-based graph editor |
| tailwindcss | ^4.1.18 | Styling |
| zustand | ^5.0.9 | State management |
| vite | ^7.2.4 | Build tool |

---

## Files Modified in This Release

### Core Components
- `dvpe_CLD/src/components/Canvas/Canvas.tsx` - Removed competing drop handlers
- `dvpe_CLD/src/components/Canvas/DragOverlay.tsx` - Removed window dragend listener

### Documentation
- `CHANGELOG.md` - Created with full version history
- `.agent/releases/v2.4.0-hotfix/RELEASE_NOTES.md` - This file
- `.agent/releases/v2.4.0-hotfix/VERSION_MANIFEST.json` - Machine-readable version info
- `.agent/releases/v2.4.0-hotfix/BASELINE_CHECKLIST.md` - Verification checklist

---

## Compatibility Notes

### Browser Support
- Chrome/Chromium: Full support (WebView2 on Windows)
- Firefox: Development testing only
- Safari: Not tested

### Platform Support
- Windows 10/11: Primary target (Tauri + WebView2)
- macOS: Supported via Tauri
- Linux: Supported via Tauri + WebKitGTK

### Node.js Requirements
- dvpe (Web): Node.js 18+ (for Vite 7.x)
- dvpe_CLD: Node.js 16+ (for Vite 6.x)

### Rust Requirements
- Rust 1.70+ for Tauri compilation
- Windows Build Tools (MSVC) on Windows

---

## Verification Checklist

Before building on this baseline:

- [ ] Run `npm install` in both `dvpe/` and `dvpe_CLD/`
- [ ] Verify drag & drop works: drag oscillator block, drop on canvas
- [ ] Confirm no console errors during drag operations
- [ ] Check that blocks render correctly after drop
- [ ] Test saving/loading patches
- [ ] Verify code generation produces valid C++ output

---

## Known Limitations

1. **React Version Mismatch**: `dvpe` uses React 19, `dvpe_CLD` uses React 18
   - This is intentional: Tauri ecosystem stability requires 18.x
   - Web-only version can leverage React 19 features

2. **Tailwind Version Mismatch**: `dvpe` uses 4.x, `dvpe_CLD` uses 3.x
   - Tailwind 4.x is still stabilizing
   - Tauri app uses proven 3.x configuration

---

## Future Roadmap

Based on the system prompt review recommendations, the following items are planned for future releases:

### v2.5 (Planned)
- Tool abstraction layer for platform portability
- Stage renumbering (1.5 → 2)
- Failure mode taxonomy
- Confidence calibration framework

### v3.0 (Planned)
- Multi-modal processing guidance
- Collaborative handoff protocol
- Long-running task continuation strategies

---

## Contact & Support

**Project**: Daisy Visual Programming Environment (DVPE)  
**Organization**: Electronic Systems Architects (ESA)  
**Contributors**: DK and Lumina

---

*This release establishes the baseline for the ORION development phase.*
