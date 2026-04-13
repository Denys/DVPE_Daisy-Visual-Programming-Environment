---
description: Handle AI Patcher Requests
---

# AI Patcher Request Handoff

This workflow instructs the Antigravity Agent on how to process pending requests from the AI Patcher chatbot.

## Trigger
Run this workflow when the user notifies you that a request is pending, or periodically checks.

## Steps

1. **Check for Request**
   - Read content of `prototypes/ai_patch_generator/chatbot_requests/pending_request.json`
   - If file does not exist or matches previous processed request, stop.

2. **Process Request**
   - Extract the `prompt` and `hardware` from the JSON.
   - **EXECUTE**: Follow `directives/ai_patch_generation.md` to design the patch.
   - **GENERATE**: Create the full `.dvpe` JSON content.

3. **Deliver Response**
   - Write the generated JSON to `prototypes/ai_patch_generator/chatbot_requests/response.json`
   - Ensure the file encoding is UTF-8.

4. **Cleanup**
   - (Optional) Delete `pending_request.json` to acknowledge receipt, or log it.

## Example Request Format
```json
{
  "id": "req_12345",
  "prompt": "Create a dub techno chord generator for Daisy Field",
  "timestamp": "2026-01-14T12:00:00Z"
}
```

## Example Response Format
```json
{
  "id": "req_12345",
  "status": "success",
  "dvpe_content": { ... valid dvpe json ... }
}
```
