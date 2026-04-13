# AI Patcher Implementation Bug Log

A lessons-learned document for AI Patch Generator chatbot. Check this **before** modifying the chatbot.

---

## Implementation Checklist

Use this checklist when modifying the AI Patcher:

```
□ Schema Compliance
  □ Top-level "patch" wrapper object
  □ Complete "metadata" with all required fields
  □ Blocks use "definitionId" and "parameterValues"
  □ Connections use "sourceBlockId", "sourcePortId", etc.
  □ All connections have unique "id" property

□ File Handling
  □ Files written to disk before serving
  □ Absolute paths used for Chainlit file serving
  □ Files exist in expected directory

□ Chainlit Integration
  □ cl.File elements properly configured
  □ Display mode set correctly ("side", "inline", etc.)
  □ Message content includes file references
```

---

## Bug #001: Missing File Attachments in Chainlit UI

**Date**: 2026-01-14  
**Component**: AI Patch Generator (`prototypes/ai_patch_generator/app.py`)

**Symptom**: Chatbot sends messages with "Download the .dvpe file..." text, but no file attachments appear in the UI. The message appears with an empty attachment section.

**Evidence**: Files ARE being created successfully:
- `generated_patch.dvpe` (1822 bytes) exists on disk
- `generated_README.md` (533 bytes) exists on disk

**Root Cause**: Chainlit file serving configuration/pattern issue.

**Attempted Fixes**:
1. **Changed display mode** from `"side"` to `"inline"` (Chainlit documentation suggests this can resolve file visibility issues)
2. **Restructured file element creation**:
   - Created file elements as separate variables before message
   - Assigned elements to `msg.elements` property instead of inline array
   - Read file contents (although not used in final implementation)
3. **Verified file paths** are absolute and files exist before message is sent

**Current Status**: ✅ **RESOLVED** (2026-01-14)
- User confirmed files now appear as downloadable attachments
- Fix: Changed display mode to "inline" and restructured element creation

**Files Modified**:
- `app.py`: Changed file element creation pattern and display mode

---

## Bug #002: Hardcoded Patch Generation

**Date**: 2026-01-14  
**Component**: AI Patch Generator (`app.py`)
**Severity**: 🔴 **CRITICAL**

**Symptom**: Chatbot generates **identical patches** regardless of user prompt.

**Examples**:
- Prompt: "create multi-effect box with detune, overdrive, delay, reverb on pod"
  - Result: OSC → SVF → Output
- Prompt: "create additive synth for daisy field"  
  - Result: OSC → SVF → Output (identical)

**Root Cause**: `generate_patch_json()` returns hardcoded template - not AI-generated.

**Fix Required**: Integrate actual LLM (GPT-4/Claude/Gemini) to generate patches dynamically.

**Status**: ✅ **RESOLVED** (2026-01-14) via Agent Rerouting
- Solution: Requests are now handed off to the Antigravity Agent for generation instead of using local templates.

---

## Bug #003: Agent Handoff Timeout

**Date**: 2026-01-14
**Component**: AI Patch Generator (`app.py`)

**Symptom**: Chatbot falls back to the hardcoded template (OSC → Filter) even when the Agent is working on the request.

**Root Cause**: The default timeout for the file-based handoff loop was **30 seconds**. Manual agent processing (reading request, generating patch, writing response) often takes >60 seconds.

**Fix**: Increased timeout in `app.py` to **300 seconds (5 minutes)**.

**Status**: ✅ **RESOLVED**



## Prevention Strategy

### Testing Before Deployment

Before marking any chatbot changes as complete:
1. Restart the chatbot server (`chainlit run app.py`)
2. Send a test prompt
3. Verify both files appear as downloadable attachments
4. Download files and verify content

### Debugging Checklist

When file serving fails:
```
□ Check terminal output for Chainlit errors
□ Verify files exist: ls generated_*.* 
□ Check file paths in code match actual file locations
□ Restart Chainlit server to clear any caching issues
□ Check .chainlit/config.toml for file serving settings
```

---

## Archive Policy

When this file exceeds 20 bugs, archive resolved bugs to `ai_patcher_bugs_archive.md` and keep only:
- Latest 5 bugs
- All checklist items
- Prevention strategy section
