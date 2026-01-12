# DVPE Implementation Ideas (Archived)

*Merged from implementation_ideas.md and implementation_ideas_2.md*

---

## Architecture Window

**Description:** libDaisy and hardware related block diagram construction for default or custom hardware platform definition, like pin mapping, external components definition: like codec, display, io expander, adc expander.

**Contents:**
1. Hardware selection: field (default), pod, custom (save as)
2. Default mapping
3. Custom hardware definition

---

## Algorithm Window

*Currently main window with audio, control, math and user controls blocks*

**Desired improvements:**
1. Selection of multiple components - ctrl+hold left mouse click and drag rectangle area
2. Ability to modify shape of each block
3. Implement state machine block (see Analog Device block description)
4. Connection label / alias
5. Block alignment and equal distance indicator
6. Comments
7. Hierarchical diagram / sub diagram - create block from block diagram

**New feature ideas:**
1. Add slider (analog to KNOB, just different visual aspect)
2. Add SWITCH single pole single throw (analog to KEY, but with state memory)
   - For both KEY and SWITCH add memory state on rising edge, falling edge, both
3. Add to Oscillator: CV control of Waveform selector/change - editable with knob / slider and encoder
4. Add to Math Group:
   - ABS (absolute value of signal)
   - EXP (e^signal)
   - POW2
5. BYPASS should have CV input for switch on/off
6. Move DC BLOCK to Filters Group
7. Add to Sources: DC input (float DC signal)

---

## Bug Verification

1. ADSR, LFO bugs with CV tick boxes and CV controls of the block. Check all previously implemented blocks for bugs described in dvpe_bugs.md
2. For ADD, MUX, DEMUX, MIXER in Inspector panel -> Main -> Inputs/Outputs: modification of number of inputs/outputs must modify visual number of inputs/outputs in Canvas

---

## Block Diagram Designer

*Custom visual block designer (idea taken from SigmaStudio+, implemented in XAML)*

Addition of interactive elements like:
- checkbox
- combo boxes
- group boxes
- knob
- numeric textbox
- numeric up down
- tab panel
- radio button
- slider
- tab control
- table
- label
- toggle
