---
name: session-handoff
description: |
  Structured session start and end with state file management.
  Updates: CHECKPOINT.md, *_bugs.md, project_definition.md, completion_monitor.md.
  Use when starting a session, ending a session, or saving progress.
  Trigger keywords: session end, end session, save session, start session, handoff
---

# Session Handoff Skill

## Overview

Manages session state transitions for DVPE development. Ensures all state files are synchronized and ready for agent continuity.

## State Files

| File | Purpose | Update Frequency |
|------|---------|------------------|
| `CHECKPOINT.md` | Project snapshot | Every session |
| `dvpe_bugs.md` | Lessons learned | After bug fixes |
| `project_definition.md` | Project scope | Major changes only |
| `completion_monitor.md` | Plan tracking | After milestones |

## Session Start Workflow

### Step 1: Load State Files
```
□ Read CHECKPOINT.md → Current version, recent changes
□ Read dvpe_bugs.md → Active bugs, prevention strategies
□ Read project_definition.md → Project scope, end criteria
□ Scan directives/ → Available SOPs
□ Scan execution/ → Available tools
```

### Step 2: Context Summary
Generate brief summary:
- Current version: `v3.9-Field-Arpeggiator`
- Last session: `2026-01-19` - CV Port Auto-Enable, 10 Field Synth projects
- Active bugs: 0 (all resolved)
- Next phase: Phase 11 Block Diagram Designer

### Step 3: Ready Confirmation
```
✅ Agent context loaded
- Project: DVPE
- Version: v3.9
- Blocks: 100
- Tests: 475 passing
```

## Session End Workflow

### Step 1: Gather Changes
Collect all modifications from session:
- New files created
- Files modified
- Bugs fixed
- Features implemented

### Step 2: Update CHECKPOINT.md

```markdown
## Session Summary (YYYY-MM-DD)
- **[Feature Name]**: Brief description
- **[Bug Fix]**: What was fixed
- **[New Files]**: List of new files
```

Update:
- Version string if milestone reached
- Recent Changes section
- Component status table
- Test results if changed

### Step 3: Update dvpe_bugs.md (if applicable)

For each bug fixed:
```markdown
## Bug #NNN: [Description] (RESOLVED)

**Date**: YYYY-MM-DD
**Status**: ✅ RESOLVED
...
```

### Step 4: Update completion_monitor.md (if plans changed)

Update completion percentages:
```markdown
### Phase 12: New Features
- [x] Switch block (100%)
- [x] Slider block (100%)
- [ ] Arpeggiator refinement (75%)
```

### Step 5: Verification Checklist
```
□ CHECKPOINT.md updated with session summary
□ All resolved bugs marked ✅ RESOLVED
□ New files listed in appropriate sections
□ Version bumped if breaking changes
□ Quick commands still accurate
```

## Handoff Format

When ending session, output:

```markdown
## Session Handoff: YYYY-MM-DD

### Completed This Session
- [x] Item 1
- [x] Item 2

### State Files Updated
- ✅ CHECKPOINT.md (version: v3.X)
- ✅ dvpe_bugs.md (bugs resolved: N)

### Ready for Next Session
- Next task: [Description]
- Blocked on: [Nothing / Item X]
```

## Quick Commands

```bash
# Start session
/agent  # Loads all state files

# End session
"save session" or "session end"  # Triggers this workflow
```

## Integration with AGENTS.md

This skill implements Section "Session State Files" from AGENTS.md:
- Update Triggers Table compliance
- First Run Routine for session start
- Core Loop step 6: "On 'session end' prompt"
