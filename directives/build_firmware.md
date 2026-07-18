# Build and Export Firmware

## Goal
Compile the generated C++ code into a Daisy firmware binary and export it for deployment.

## Inputs
- `graph.json` - The node graph from DVPE frontend
- Target platform: `DaisyField` | `DaisySeed` | `DaisyPod` | `DaisyPatch`

## Execution Tools
1. `py -3 execution\dvpe_cli.py patch validate <file.dvpe>` - Validate the `.dvpe` graph structure against live block and port IDs.
2. C++ generation remains handled by the DVPE app/codegen path in `dvpe_CLD/src/codegen/CodeGenerator.ts`.
3. Firmware compilation still runs from the generated Daisy project directory with `make clean && make`.

> Legacy script names `execution/validate_graph.py`, `execution/generate_cpp.py`,
> and `execution/build_firmware.py` are intentionally not part of the current
> v1 CLI spine. `py -3 execution\dvpe_cli.py doctor` reports these as missing
> legacy references rather than pretending they exist.

## Outputs
- `main.cpp` - Generated source code
- `Makefile` - Build configuration
- `build/project.bin` - Compiled firmware binary (if build succeeds)
- `.tmp/block_library.json` - Live block reference when `blocks export` is run

## Edge Cases
- **Cycle detected**: The graph analyzer will reject cyclic connections
- **Unsupported block type**: Code generator logs a warning and skips
- **Missing toolchain**: Must have ARM GCC toolchain in PATH

## Timing
- Graph validation: < 1 second
- Code generation: < 2 seconds
- Firmware build: ~10-30 seconds depending on complexity

## Learnings
_Updated as issues are discovered._
