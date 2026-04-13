---
description: Start the DVPE AI Patch Designer chatbot interface
---

# Launch AI Patch Designer Chatbot

This workflow starts the Chainlit-based AI chatbot that generates `.dvpe` block diagrams from natural language descriptions.

## Prerequisites
- Python 3.8+ installed
- First-time setup completed (see step 1)

## Steps

### 1. Install Dependencies (First Time Only)
If you haven't installed the chatbot dependencies yet:
```bash
cd prototypes/ai_patch_generator
pip install -r requirements.txt
```

### 2. Launch the Chatbot Server
// turbo
```bash
cd prototypes/ai_patch_generator
chainlit run app.py
```

**Expected Output**: Server starts on `http://localhost:8000`

### 3. Access the Interface
Open your browser to: `http://localhost:8000`

## Usage Tips
1. Describe your desired patch in natural language (e.g., "spacey ambient pad with slow filter sweep")
2. Watch the AI reasoning steps in the UI
3. Download the generated `.dvpe` file
4. Save it to `_block_diagrams_code/prompt_generated/` with a descriptive name
5. **Important**: Validate the file with `/validate-dvpe` before opening in DVPE (chatbot may produce invalid schema)

## Known Issues
- Chatbot-generated files may fail schema validation
- Use `/validate-dvpe` workflow to check generated files
- Manually-created diagrams are more reliable
