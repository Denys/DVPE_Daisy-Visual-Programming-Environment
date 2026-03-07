# DVPE Noderr Loop

This file references the main Noderr operational protocol.

**Full loop documentation**: `../../noderr/noderr/noderr_loop.md`

---

## Quick Reference — Loop Steps

1. **Receive PrimaryGoal** → Identify Change Set (affected NodeIDs)
2. **Pause** → Get Orchestrator approval of Change Set
3. **Draft Specs** → `noderr/specs/[NodeID].md` for each node
4. **Pause** → Get spec approval
5. **Implement** → Write/modify code for all nodes in WorkGroupID
6. **Verify** → Run tests, check ARC criteria
7. **Finalize Specs** → Update to "as-built" state
8. **Log** → Prepend ARC-Completion entry to `noderr_log.md`
9. **Update Tracker** → Set nodes to `[VERIFIED]`, clear WorkGroupID
10. **Commit** → `feat: Implement and verify WorkGroupID <ID>`

## WorkGroupID Format

```
[type]-[YYYYMMDD]-[HHMMSS]
Types: feat, fix, refactor, issue
Example: feat-20260307-143022
```

## Pause Points

You MUST pause and await explicit approval at:
- After proposing Change Set (Step 1)
- After presenting specs for approval (Step 3)
- After reporting implementation complete (Step 6)

## Prompts Location

All Noderr prompts: `../../noderr/noderr/prompts/`

| Prompt | Purpose |
|--------|---------|
| `NDv1.9__Start_Work_Session.md` | Begin work session |
| `NDv1.9__[LOOP_1A]__Propose_Change_Set.md` | Start a feature |
| `NDv1.9__[LOOP_1B]__Draft_Specs.md` | Draft specifications |
| `NDv1.9__[LOOP_2A]__Implement_Change_Set.md` | Implement |
| `NDv1.9__[LOOP_2B]__Verify_Implementation.md` | Audit implementation |
| `NDv1.9__[LOOP_3]__Finalize_And_Commit.md` | Finalize and commit |
| `NDv1.9__Execute_Micro_Fix.md` | Single-file quick fix |
| `NDv1.9__Architecture_Health_Review.md` | Architecture audit |
