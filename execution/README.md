# Execution Scripts

This directory is the intended home for deterministic DVPE helper scripts.

## Current public state

The public branch currently tracks this README only. In particular,
`execution/dvpe_cli.py` is not present, so commands that reference it are not
available from a normal clone. Check the literal path before following an
older directive or local workspace note.

## Contract for future scripts

- Keep the same input/output behavior for the same repository state.
- Make each script independently testable and fail clearly on missing input.
- Keep credentials out of source and load secrets only from documented local
  environment configuration.
- Document the exact command, required working directory, inputs, outputs, and
  recovery behavior here when a script is added.

Use application scripts from `dvpe_CLD/package.json` for the current product
test, lint, build, and development-server workflows.
