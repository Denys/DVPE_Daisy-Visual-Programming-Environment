# DVPE Tutorials

These tutorials use the current DVPE browser editor. Start with the first patch
if the interface is new to you; otherwise choose the workflow you need.

| Order | Tutorial | Best for | Result |
| ---: | --- | --- | --- |
| 1 | [Build your first patch](GETTING_STARTED_FIRST_PATCH.md) | First launch and basic graph editing | A saved oscillator-to-output `.dvpe` project. |
| 2 | [Inspect, map hardware, and export](INSPECTOR_HARDWARE_AND_EXPORT.md) | Verifying parameters, connectivity, platform, and generated files | A reviewed C++/Makefile package with a clear validation boundary. |
| 3 | [Daisy Field Mapping](../../dvpe_CLD/examples/field_mapping_subtractive_tutorial.md) | Assigning the fixed Field surface without adding control blocks | A layered K1–K8 and A1–B8 performance map. |
| 4 | [Create and reuse a custom block](CUSTOM_BLOCKS_AND_REUSE.md) | Packaging a useful subgraph for later patches | A library block that can be exported as `.dvpe-block`. |
| 5 | [Design modes and visual tuning](DESIGN_MODES_AND_VISUAL_TUNING.md) | Choosing a readable editing or presentation style | A saved Stitch Neon or Experimentator design preset. |

For complete GUI behavior, shortcuts, connectivity rules, persistence, and
export details, use the
[Block Diagram and Inspector guide](../user-guide/BLOCK_DIAGRAM_AND_INSPECTOR_GUIDE.md).
For every available runtime block and parameter, use the
[block catalog reference](../reference/DVPE_Diagram_Block_Reference.md).

DVPE generates Daisy-oriented source files. Compiling, flashing, listening,
and validating on the target hardware remain separate steps.
