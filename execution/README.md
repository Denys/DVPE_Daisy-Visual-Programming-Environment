# Execution Scripts

This folder contains deterministic Python scripts for the DVPE project.

## Purpose
Execution scripts handle the **actual work**:
- API calls
- Data processing
- File operations
- Database interactions
- Build automation

## Principles
- **Deterministic**: Same input → same output
- **Testable**: Each script should be independently testable
- **Well-commented**: Clear documentation of purpose and usage
- **Fast**: Optimize for performance

## Usage
Scripts are called by the AI orchestration layer based on directives.
Environment variables are loaded from `.env` in the project root.

## Naming Convention
`<action>_<subject>.py` — e.g., `build_firmware.py`, `validate_graph.py`
