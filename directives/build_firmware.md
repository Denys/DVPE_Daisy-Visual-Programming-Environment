# Build and Export Firmware

## Goal
Compile the generated C++ code into a Daisy firmware binary and export it for deployment.

## Inputs
- `graph.json` - The node graph from DVPE frontend
- Target platform: `DaisyField` | `DaisySeed` | `DaisyPod` | `DaisyPatch`

## Execution Tools
1. `execution/validate_graph.py` - Validate the graph structure
2. `execution/generate_cpp.py` - Convert graph to C++ code
3. `execution/build_firmware.py` - Compile using arm-none-eabi-gcc

## Outputs
- `main.cpp` - Generated source code
- `Makefile` - Build configuration
- `build/project.bin` - Compiled firmware binary (if build succeeds)

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
