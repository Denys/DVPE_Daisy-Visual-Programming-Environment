# Block Diagram and Inspector Guide

This guide covers the complete day-to-day workflow in the DVPE web editor.
The interface is optimized for a desktop browser.

## 1. Interface map

The workspace has four main areas:

1. **Top bar** — project name, New, Open, Save, recent projects, Help, design
   mode, Hardware, Export C++, and Advanced Export.
2. **Modules panel** — searchable block catalog grouped by category, plus the
   Import control for reusable custom blocks.
3. **Canvas** — the block diagram, connections, selection tools, alignment
   toolbar, zoom controls, minimap, and status counts.
4. **Inspector** — parameters and connectivity for the selected item, plus the
   Design tab.

The bottom status area reports block and connection counts and the current
selection. The minimap and zoom controls help navigate large patches.

## 2. Create, open, and save a patch

- Select **New** or press `Ctrl/Cmd + N` to clear the current patch. Save first
  if you need to keep unsaved changes.
- Select **Open** or press `Ctrl/Cmd + O` to load a `.dvpe` project.
- Select **Save** or press `Ctrl/Cmd + S` to download the current project.
- Use the clock menu to reopen a recent browser snapshot or select a recent
  project folder where the browser supports directory access.

DVPE maintains an autosave snapshot in browser storage. This is recovery help,
not a replacement for regularly downloading named `.dvpe` project files.

## 3. Build a block diagram

### Find and add blocks

1. Search by block name or description in **Modules**, or expand a category.
2. Drag a module card to an empty position on the Canvas.
3. Repeat for sources, processors, modulation, routing, and outputs.

The catalog contains audio, CV, trigger, control, synthesis, physical
modelling, effects, filters, dynamics, mixing, and math/utility functions. The
exact catalog is documented in the [block reference](../reference/DVPE_Diagram_Block_Reference.md).

### Connect blocks

1. Start at an output port on the source block.
2. Drag to a compatible input port on the destination block.
3. Release when the input highlights.

Port color and labels distinguish signal roles. DVPE checks compatibility and
rejects invalid source/destination combinations. A visible connection means
the graph has accepted that route; it does not by itself prove that generated
firmware compiles or sounds correct.

To change a route, select the connection and delete it, then draw the new one.
Use the Inspector's Connectivity section to verify both the source and the
destination when a large graph is difficult to trace visually.

### Select, move, copy, and delete

- Click a block or connection to select it.
- Hold `Ctrl` or `Shift` while dragging on empty canvas to box-select.
- Drag selected blocks to move them as a group.
- Use `Ctrl/Cmd + C`, `Ctrl/Cmd + X`, and `Ctrl/Cmd + V` for copy, cut, and
  paste.
- Press `Delete` or `Backspace` to remove the selection.
- Press `Escape` to cancel an active drag, or clear selection and Inspector
  focus.
- Use the top-center alignment toolbar to align or distribute a multi-selection.
- Use the Canvas zoom controls and fit-view control to frame a large patch.

Undo with `Ctrl/Cmd + Z`. Redo with `Ctrl/Cmd + Shift + Z` or `Ctrl/Cmd + Y`.

### Comments, custom blocks, and polyphony

- Add comments to label signal-flow sections and assumptions.
- Import a custom block from the Modules panel, or use the custom-block tools
  to create a reusable block with code modules and bound ports.
- Double-click a block to focus it in the Inspector.
- `Ctrl/Cmd + Double-click` a custom block to open its nested internals.
- Use the **Poly Voice Blanket** canvas directive to group a supported voice
  graph for polyphonic generation. Select the blanket to edit its voice
  controls in the Inspector.
- Press `Ctrl/Cmd + U` to toggle the block UI designer for supported custom
  block work.

## 4. Use Inspector → Parameters

Select a block to populate the Inspector. The exact controls depend on the
block definition.

### Identity

The upper section shows the editable label, DaisySP class or implementation
identity, and category. Use a clear label when the same processor appears more
than once in a patch.

### Main parameter groups

Parameters are grouped by function. Depending on the definition, DVPE renders
knobs, sliders, switches, waveform controls, note selectors, envelopes, or
drop-down selections. Values shown in the Inspector are the patch values used
by persistence and code generation.

Some parameters have a **CV** checkbox:

1. Enable **CV** beside the parameter.
2. A modulation input becomes available on the block.
3. Connect a compatible CV/control source to that input.
4. Recheck the connection and its range before export.

If a CV port appears to be missing, confirm that the corresponding parameter's
CV checkbox is enabled. Disabling CV removes that modulation route from the
active block interface.

### Connectivity

Expand **Connectivity** to inspect inputs and outputs. Each connected port
identifies the linked block where available. Use this section to answer three
questions before export:

- Does every required input have a source?
- Does every output reach the intended processor or hardware output?
- Are audio, CV, trigger, and control routes connected to compatible ports?

Custom blocks expose their configured public parameters and ports here. A Poly
Voice Blanket exposes its group and voice settings rather than ordinary DSP
parameters.

## 5. Use Inspector → Design

DVPE has exactly three interface designs. Cycle through them with the design
button in the top bar.

| Mode | Recommended use | Fine controls |
| --- | --- | --- |
| **Original Style** | Dense construction, long editing sessions, and debugging with the least visual decoration. | Uses the stable default appearance. |
| **Stitch Neon** | Demonstrations and visually tracing a signal route through brighter wires and block-type color coding. | Background colors/brightness/depth/transition/glow; block opacity/glow/color coding/border/corners; block-type colors; wire width/glow/opacity; named presets and reset. |
| **Experimentator** | Exploring a personal visual system or more dramatic presentation styling. | Neon intensity/spread/saturation, safety lock, glass opacity/tint, border weight, corner radius, saved presets, and reset. |

To fine-tune a design:

1. Select **Stitch Neon** or **Experimentator** from the top-bar design cycle.
2. Open the Inspector's **Design** tab.
3. Move one control at a time while watching block text, ports, and wires.
4. Save a named preset when the result remains readable at normal zoom.
5. Use the mode's Reset control if contrast or geometry becomes impractical.

Design changes affect the editor appearance, not the DSP graph or generated
audio algorithm. Experimentator includes a lock that limits extreme glow
ranges; keep it enabled for normal use.

![Stitch Neon design with Inspector](../images/DVPE_Stitch_Neon_GUI.png)

The retained earlier screenshot shows the calmer Original Style on a large
Field Additive Synth graph:
[open Original Style screenshot](../images/DVPE_Original_Field_Additive_Synth.png).

## 6. Hardware mapping

Select **Hardware** in the top bar to configure the target and map patch
controls to the available hardware surface. Review pin and peripheral conflicts
reported by the mapping tools. A valid editor mapping is still only a design
input: confirm the target board, pin definitions, electrical connections, and
firmware behavior in the external Daisy project.

## 7. Export

### Standard Export C++

1. Save the `.dvpe` project with a meaningful name.
2. Select **Export C++**.
3. Review the generated preview and selected target information.
4. Download the ZIP containing Daisy-oriented C++, headers, and Makefile
   content.
5. Move the exported project into a compatible Daisy development environment.
6. Compile, inspect warnings, run target tests, and validate audio and hardware.

The repository does not include a complete firmware compiler/flasher workflow.

### Advanced Export

Advanced Export sends generated content to the configured external AI provider
for an experimental correction pass. Configure the provider, model, and key in
**Inspector → Design**. Keys are stored in browser storage, so use this only in
a trusted local browser profile. Treat the returned files as proposed changes:
diff them against standard export and validate them with the same compiler and
hardware checks.

## 8. Keyboard shortcut reference

| Shortcut | Action |
| --- | --- |
| `Ctrl/Cmd + N` | New patch |
| `Ctrl/Cmd + O` | Open patch |
| `Ctrl/Cmd + S` | Save patch |
| `Ctrl/Cmd + U` | Toggle block UI designer |
| `Ctrl/Cmd + C` | Copy selection |
| `Ctrl/Cmd + X` | Cut selection |
| `Ctrl/Cmd + V` | Paste selection |
| `Double-click` | Inspect selected block |
| `Ctrl/Cmd + Double-click` | Inspect custom block internals |
| `Delete / Backspace` | Delete selection |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` or `Ctrl/Cmd + Y` | Redo |
| `Ctrl/Shift + Drag` | Box-select on Canvas |
| `Escape` | Cancel drag or clear selection/Inspector focus |

The same list is available from **Help → Keyboard Shortcuts**.

## 9. Troubleshooting

### The one-click launcher says Node.js is missing or too old

Install Node.js 20 or newer, close the launcher, and double-click
`START_DVPE.cmd` again. The launcher uses npm from that Node.js installation.

### Port 1420 is already in use

DVPE intentionally uses a fixed URL. Stop the other process on port 1420, then
restart DVPE. If DVPE is already running there, the launcher reuses it.

### A connection is rejected

Check the source and destination port types and direction. Audio, CV, trigger,
and control paths are not interchangeable unless the target block definition
explicitly supports that route.

### A parameter has no CV input

Select the block, find the parameter in Inspector → Parameters, and enable its
CV checkbox. Only parameters declared CV-controllable expose that option.

### The graph opens but a custom block is incomplete

The `.dvpe` file must contain the required embedded custom-block definitions.
Reimport the original custom block if the project predates embedded custom
block persistence.

### Generated code does not compile or run correctly

Confirm the target hardware, inspect missing library/toolchain dependencies,
and review all generated files. The editor and tests validate generation logic;
they do not certify a particular compiler, board, audio path, or wiring setup.

### Tauri or desktop commands do not work

This sharing edition supports the browser application. It does not include a
Tauri project or a packaged desktop installer.
