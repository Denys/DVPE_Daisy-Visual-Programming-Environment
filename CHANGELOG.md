# DVPE Changelog

All notable changes to the Daisy Visual Programming Environment (DVPE) project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Tracking modifications from v2.4 Hotfix baseline

### Changed
- (Future changes will be documented here)

### Fixed
- (Future fixes will be documented here)

---

## [2.4.0-hotfix] - 2026-01-01

### Summary
**Codename**: ORION-HOTFIX  
**Baseline Release**: Stability & Platform Foundation Update

This release establishes the v2.4 Hotfix baseline, incorporating critical bug fixes from late December 2025 and implementing system prompt review recommendations.

### Critical Bug Fixes (Must Preserve)

#### Drag & Drop Race Condition Fix
- **Issue**: Drag and drop operations failed due to competing event handlers
- **Root Cause**: Canvas wrapper div intercepted drop events before DragOverlay
- **Fix**: Removed competing drop handlers from Canvas wrapper
- **Files Modified**: 
  - `dvpe_CLD/src/components/Canvas/Canvas.tsx`
- **Reference**: `.agent/reports/drag_drop_root_cause_fix_2025-12-30.md`

#### Drag Termination Bug Fix
- **Issue**: Premature `dragend` events cleared state before drop completion
- **Root Cause**: Global window `dragend` listener race condition
- **Fix**: Removed window `dragend` listener; rely on drop handler state management
- **Files Modified**:
  - `dvpe_CLD/src/components/Canvas/DragOverlay.tsx`
- **Reference**: `.agent/reports/drag_termination_bug_analysis_2025-12-30.md`

### Platform Dependencies

#### dvpe (Web Frontend)
```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "reactflow": "^11.11.4",
  "tailwindcss": "^4.1.18",
  "zustand": "^5.0.9",
  "vite": "^7.2.4",
  "typescript": "~5.9.3"
}
```

#### dvpe_CLD (Tauri Desktop App)
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "@xyflow/react": "^12.3.6",
  "@tauri-apps/api": "^1.6.0",
  "zustand": "^5.0.2",
  "vite": "^6.0.3",
  "typescript": "^5.7.2"
}
```

### System Prompt Updates (from v2.3 Nova-Hotfix)
- File Operation Timeout Pathway for Windows environment handling
- Python Backend Domain with `uv` package manager integration
- Virtual environment protocol (always-on recommendation)
- Manual workaround suggestions for file operations

### Known Issues
- None critical at baseline

### Breaking Changes
- None (hotfix release)

---

## [2.3.0-nova-hotfix] - 2025-12-30

### Summary
**Codename**: NOVA-HOTFIX  
**Focus**: Stability & Tooling Release

### Added
- File Operation Timeout Pathway for Windows stalling issues
- Python Backend Domain with `uv` package manager integration
- Virtual environment protocol guidelines
- uv quick reference with installation and usage commands
- Manual workaround suggestions for file operation failures

### Changed
- System prompt version: v2.3 Nova-Hotfix

### Fixed
- Drag and drop functionality in Tauri application
- Event handler race conditions in Canvas component

---

## Version Lineage

| Version | Codename | Focus |
|---------|----------|-------|
| v1.0 | Genesis | Baseline 5-Stage Architecture |
| v2.0 | Nebula | Domain-specific expertise, artifact management |
| v2.1 | Pulsar | Enhanced Lumina persona with 11 traits |
| v2.2 | Nova | Opus 4.5 optimization + Vue/Nuxt domain |
| v2.3 | Nova-Hotfix | File operation handling + uv package manager |
| v2.4 | Orion-Hotfix | Platform foundation + critical bug fixes |

---

## Upgrade Guide

### From v2.3 to v2.4

**Dependencies to Verify**:
1. Node.js version compatible with Vite 7.x (for dvpe)
2. Rust toolchain for Tauri builds (for dvpe_CLD)
3. React Flow / XY Flow version alignment

**Files to Check**:
- Ensure drag/drop handlers are not duplicated in Canvas components
- Verify DragOverlay has no window dragend listener
- Check package.json versions match baseline

**No Breaking Changes**: This is a hotfix release with backward compatibility.

---

[Unreleased]: https://github.com/user/dvpe/compare/v2.4.0-hotfix...HEAD
[2.4.0-hotfix]: https://github.com/user/dvpe/compare/v2.3.0-nova-hotfix...v2.4.0-hotfix
[2.3.0-nova-hotfix]: https://github.com/user/dvpe/releases/tag/v2.3.0-nova-hotfix
