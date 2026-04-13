# Tool Detection Logic Test

**Date**: 2025-01-11
**Purpose**: Validate platform auto-detection works correctly

---

## Detection Logic (from AGENTS.md)

```python
# Pseudo-code for self-identification
if has_tools(['Bash', 'Read', 'Edit', 'Grep']) and context.includes('Claude Code'):
    load('CLAUDE.md')
elif has_capability('autonomy_levels') or context.includes('Kilo'):
    load('KILO.md')
elif has_capability('native_search') and context.includes('Gemini'):
    load('GEMINI.md')
elif context.includes('OpenCode') or is_self_hosted():
    load('OPENCODE.md')
else:
    # Fallback: Prompt user
    ask_user("Which tool are you using? Claude Code / OpenCode / Kilo Code / Gemini")
```

---

## Test Scenario 1: Claude Code (CURRENT SESSION)

### Detection Criteria
**Required Tools**:
- ✅ Bash
- ✅ Read
- ✅ Edit
- ✅ Write
- ✅ Grep
- ✅ Glob
- ✅ Task

**Context**: CLI environment, skill-based system

### Expected Result
- **Load**: AGENTS.md + CLAUDE.md
- **Behavior**:
  - Use Read/Edit/Write for file operations
  - Use Grep/Glob for searching
  - Use Bash ONLY for Python scripts and system commands
  - Avoid: cat, sed, awk, grep in Bash

### Validation
**Test 1**: File reading
```
❌ WRONG: Bash("cat CHECKPOINT.md")
✅ RIGHT: Read("CHECKPOINT.md")
```

**Test 2**: File searching
```
❌ WRONG: Bash("grep scrape directives/*.md")
✅ RIGHT: Grep(pattern="scrape", path="directives", output_mode="files_with_matches")
```

**Test 3**: Python execution
```
✅ RIGHT: Bash("python execution/script.py --arg value")
```

### Actual Behavior (This Session)
✅ **CONFIRMED**: Currently using Claude Code
- Has all required tools (Bash, Read, Edit, Write, Grep, Glob, Task)
- Should load AGENTS.md + CLAUDE.md
- Should follow Claude Code-specific optimizations

---

## Test Scenario 2: Kilo Code

### Detection Criteria
**Required Capabilities**:
- Autonomy level settings (1-5)
- Checkpoint system
- Behavior configuration options

**Context**: GUI or CLI with checkpoints

### Expected Result
- **Load**: AGENTS.md + KILO.md
- **Behavior**:
  - Set autonomy level 3 (recommended)
  - Checkpoint before: untested scripts, paid APIs, new files
  - NO checkpoint for: reading, searching, learning logs
  - Batch related changes into single checkpoint

### Validation
**Test 1**: Checkpoint strategy
```
✅ Before executing untested script: checkpoint()
❌ Before reading file: NO checkpoint needed
✅ Before paid API call: checkpoint()
```

**Test 2**: Autonomy level
```
Recommended: Level 3 (checkpoint-based)
- Execute autonomously
- Checkpoint at major steps
- Balance autonomy with safety
```

---

## Test Scenario 3: Gemini

### Detection Criteria
**Required Capabilities**:
- Native search integration
- Multimodal input (images, screenshots, diagrams)
- Google ecosystem tools

**Context**: Google AI environment

### Expected Result
- **Load**: AGENTS.md + GEMINI.md
- **Behavior**:
  - Search before creating/updating directives
  - Use multimodal input for screenshots/diagrams
  - Store deliverables in Google Workspace
  - Verify library versions via search

### Validation
**Test 1**: Research-first workflow
```
Task: Create scraping directive
✅ RIGHT:
  1. search("Python web scraping best practices 2025")
  2. search("BeautifulSoup latest version 2025")
  3. Create directive with current information

❌ WRONG:
  1. Create directive with assumptions
  2. Skip research step
```

**Test 2**: Deliverable location
```
❌ WRONG: Save to local file "results.xlsx"
✅ RIGHT: Transform .tmp/results.json → Google Sheets → Store URL in CHECKPOINT.md
```

---

## Test Scenario 4: OpenCode

### Detection Criteria
**Required Capabilities**:
- File operations
- Bash execution
- Self-hosted or open-source context

**Context**: Self-hosted, open-source environment

### Expected Result
- **Load**: AGENTS.md + OPENCODE.md
- **Behavior**:
  - Leverage self-hosted advantages
  - Apply security considerations
  - Use native file operations
  - Custom tool integrations

### Validation
**Test 1**: Self-hosted advantages
```
✅ Can access local databases directly
✅ Can use custom local tools
✅ Full file system access
✅ Data privacy (all local)
```

**Test 2**: Security awareness
```
✅ Verify file permissions before execution
✅ Never commit .env or credentials
✅ Audit command execution for security
```

---

## Fallback Scenario: Unknown Platform

### When Detection Fails
If agent cannot determine platform from capabilities:

**Action**: Prompt user
```
"Which tool are you using?
A) Claude Code (CLI, powerful file tools)
B) Kilo Code (GUI/CLI with checkpoints)
C) Gemini (Google AI with search)
D) OpenCode (self-hosted, open-source)

Your choice: _"
```

**Then**: Load AGENTS.md + corresponding tool file

---

## Integration Testing

### Test 1: Double Activation Pattern
**Scenario**: User manually loads AGENTS.md + CLAUDE.md

**Expected**:
1. Both files read successfully
2. Tool-specific (CLAUDE.md) overrides universal (AGENTS.md) on conflicts
3. Example conflict: "search for files"
   - AGENTS.md: "search for files"
   - CLAUDE.md: "use Glob tool, not Bash find"
   - Result: Use Glob tool

### Test 2: Auto-Detection Pattern
**Scenario**: User loads only AGENTS.md

**Expected**:
1. AGENTS.md read first
2. Platform detection runs (check tools/capabilities)
3. Corresponding tool file auto-loaded
4. Combined instructions active

---

## Validation Results

### Claude Code Detection (Current Session)
**Status**: ✅ PASS
- Has required tools: Bash, Read, Edit, Write, Grep, Glob, Task
- Context matches: CLI environment
- Should use: AGENTS.md + CLAUDE.md
- Correct behavior: Use Read (not cat), Edit (not sed), Grep (not Bash grep)

### Expected Behaviors for Other Tools
**Kilo Code**: ✅ Checkpoint strategy implemented
**Gemini**: ✅ Search-first workflow documented
**OpenCode**: ✅ Self-hosted optimizations documented

---

## Decision Matrix Summary

| Platform | Key Signature | Primary Optimization | File to Load |
|----------|---------------|---------------------|--------------|
| Claude Code | Bash+Read+Edit+Grep+Glob | Use built-in tools over Bash | CLAUDE.md |
| Kilo Code | autonomy_levels, checkpoints | Balance autonomy with checkpoints | KILO.md |
| Gemini | native_search, multimodal | Research-first, Google Workspace | GEMINI.md |
| OpenCode | self-hosted context | Security, custom integrations | OPENCODE.md |

---

## Recommendations

### For Current Session (Claude Code)
1. ✅ Confirmed detection criteria met
2. ✅ Should read AGENTS.md + CLAUDE.md
3. ✅ Follow Claude Code-specific patterns:
   - Use Read/Edit/Write for files
   - Use Grep/Glob for searching
   - Use Bash only for Python/system commands

### For Future Sessions
1. **Test with Kilo Code**: Verify checkpoint strategy works
2. **Test with Gemini**: Verify search integration works
3. **Test with OpenCode**: Verify self-hosted patterns work
4. **Measure effectiveness**: Compare task success rates

### For Improvements
1. Add fallback messaging if detection uncertain
2. Add capability probing (try tool, catch error)
3. Add user confirmation after auto-detection
4. Add detection log to CHECKPOINT.md for debugging

---

## Conclusion

✅ **Tool Detection Logic**: Implemented and documented
✅ **Current Session**: Claude Code detected correctly
✅ **Expected Behavior**: Use AGENTS.md + CLAUDE.md optimizations
✅ **Validation**: Ready for real-world testing

**Next Step**: Test with actual agent execution to verify behavior matches expected patterns.
