# DVPE Glassmorphism: Precision AI Communication Guide

## Your Visual Target (Decoded)

What you're asking for is a **specific layering architecture** that most AI tools get wrong because the instruction "make it glassy" is too vague. Here's the precise decomposition of what your four reference images demand:

### Z-Index Layer Stack (Bottom → Top)

```
Layer 0: Dark gradient background (Design_1_aiStudio style)
         ├─ Base: #0a0e1a → #0d1117 radial gradient
         ├─ Subtle grid overlay (rgba(0,229,255,0.03), 1px lines, 40px spacing)
         └─ Optional: aurora blobs (radial-gradient, animated, very low opacity 0.05-0.1)

Layer 1: Connection wires (SVG/Canvas paths)
         ├─ Wire stroke: 2px solid with color per signal type
         ├─ Wire glow: filter: drop-shadow(0 0 6px rgba(color, 0.6))
         ├─ CRITICAL: Wires must be BELOW blocks but ABOVE background
         └─ Wire glow bleeds THROUGH semi-transparent blocks above

Layer 2: Module blocks (the glass panels)
         ├─ background: rgba(10, 14, 26, 0.35-0.55)  ← NOT 0.8+
         ├─ backdrop-filter: blur(8px)                 ← LOW blur preserves wire glow visibility
         ├─ border: 1px solid rgba(CATEGORY_COLOR, 0.3)
         ├─ box-shadow: 0 0 15px rgba(CATEGORY_COLOR, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)
         └─ Category-colored glow on border (neon effect)

Layer 3: Block content (knobs, labels, ports, waveform displays)
         ├─ Knobs: radial-gradient with subtle metallic sheen
         ├─ Port circles: solid with glow matching wire color
         ├─ Labels: rgba(255,255,255,0.9) — high contrast on glass
         └─ Waveform/visualization SVGs: category accent color

Layer 4: Inspector panel, sidebar (higher-opacity glass)
         ├─ background: rgba(10, 14, 26, 0.75-0.85)  ← more opaque for text readability
         ├─ backdrop-filter: blur(16px)                ← heavier blur, these are UI chrome
         └─ These panels DON'T need wire glow visibility
```

### The Critical Insight AI Tools Miss

**The wire-glow-through-block effect requires specific opacity/blur tuning that AI defaults destroy:**

| Component | bg-opacity | blur | Why |
|-----------|-----------|------|-----|
| Module blocks (canvas) | 0.35–0.55 | 6–10px | LOW opacity + LOW blur = wire glow bleeds through |
| Sidebar/Inspector | 0.75–0.85 | 12–16px | HIGH opacity + HIGH blur = text readability |
| Header/toolbar | 0.60–0.70 | 10–12px | Medium — functional but still atmospheric |
| Port connection dots | 0.0 (none) | 0 | Solid color with outer glow, no glass effect |

**AI tools default to opacity 0.7+ and blur 12px+ everywhere**, which kills the wire-through-block effect entirely. You must override these explicitly.

---

## Part 1: CSS Token Vocabulary for Precise Communication

When instructing any AI tool, use these **exact property-value pairs** instead of vague descriptions. This is your translation dictionary from "what I see" to "what I tell the AI."

### Background Atmosphere

**What you want** (from Design_1_aiStudio): Deep space with subtle grid, slight color variation

```
INSTRUCTION TOKEN:
"Background: radial-gradient centered at 40% 30%, from #0f1923 to #0a0e1a.
Overlay: CSS grid pattern using repeating-linear-gradient, line color rgba(0,229,255,0.03),
spacing 40px, line width 1px. No aurora animation — static atmospheric depth only."
```

**CSS reference:**
```css
.canvas-background {
  background:
    /* Grid overlay */
    repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(0,229,255,0.03) 39px, rgba(0,229,255,0.03) 40px),
    repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(0,229,255,0.03) 39px, rgba(0,229,255,0.03) 40px),
    /* Base gradient */
    radial-gradient(ellipse at 40% 30%, #0f1923 0%, #0a0e1a 70%);
}
```

### Module Block Glass (The Core Effect)

**What you want** (from neon_transparent_synth_editor): Category-colored neon border, visible wire glow behind

```
INSTRUCTION TOKEN:
"Module block glass: background rgba(10,14,26,0.4), backdrop-filter blur(8px),
border 1px solid rgba(CATEGORY_COLOR, 0.3), border-radius 12px.
Outer glow: box-shadow 0 0 20px rgba(CATEGORY_COLOR, 0.12).
Inner rim light: inset box-shadow 0 1px 0 rgba(255,255,255,0.06).
CRITICAL: Keep background opacity at 0.4 maximum so connection wire glows
rendered BEHIND the block are visible through the glass surface."
```

**CSS reference (per category):**
```css
/* Sources (Oscillators, Noise) — Cyan */
.block-source {
  background: rgba(10, 14, 26, 0.40);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 229, 255, 0.30);
  border-radius: 12px;
  box-shadow:
    0 0 20px rgba(0, 229, 255, 0.12),     /* outer neon glow */
    0 4px 16px rgba(0, 0, 0, 0.30),        /* depth shadow */
    inset 0 1px 0 rgba(255, 255, 255, 0.06); /* top rim light */
}

/* Filters — Green */
.block-filter {
  /* Same structure, swap color: */
  border: 1px solid rgba(0, 255, 136, 0.30);
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.12), /* ... rest same */;
}

/* Effects — Purple/Magenta */
.block-effect {
  border: 1px solid rgba(180, 0, 255, 0.30);
  box-shadow: 0 0 20px rgba(180, 0, 255, 0.12), /* ... */;
}

/* Envelopes/Modulators — Orange */
.block-envelope {
  border: 1px solid rgba(255, 160, 0, 0.30);
  box-shadow: 0 0 20px rgba(255, 160, 0, 0.12), /* ... */;
}

/* I/O & Control — Yellow */
.block-io {
  border: 1px solid rgba(255, 230, 0, 0.30);
  box-shadow: 0 0 20px rgba(255, 230, 0, 0.12), /* ... */;
}
```

### Connection Wire Glow

**What you want**: Wires that glow and are visible through blocks

```
INSTRUCTION TOKEN:
"Connection wires: Render on SVG layer BELOW module blocks (z-index: 10, blocks at z-index: 20).
Wire stroke: 2px, color matches source port category color.
Wire glow: SVG filter with feGaussianBlur stdDeviation=4, flood-color matching wire color
at flood-opacity=0.6, composited behind the stroke.
Alternative CSS: filter: drop-shadow(0 0 6px rgba(WIRE_COLOR, 0.5)) on the path element.
The glow must be bright enough to remain visible through blocks at opacity 0.4."
```

**SVG filter reference:**
```svg
<defs>
  <filter id="wire-glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>
    <feFlood flood-color="rgba(0,229,255,0.6)" result="color"/>
    <feComposite in="color" in2="blur" operator="in" result="glow"/>
    <feMerge>
      <feMergeNode in="glow"/>
      <feMergeNode in="glow"/>  <!-- doubled for intensity -->
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>
</defs>
```

---

## Part 2: AI Tool Communication Templates

### Template A: Full Block Redesign Prompt (for Claude/GPT/Gemini)

```markdown
## Context
I'm building DVPE — a visual programming environment for audio DSP on Electrosmith Daisy.
The UI is a 3-panel layout: left sidebar (module library), center canvas (block diagram
with free-positioned, draggable blocks connected by curved wires), right panel (inspector).

## Current State
Blocks are currently opaque dark panels with solid borders. I want to transition to
glassmorphic blocks with category-colored neon borders where connection wire glows are
visible THROUGH the semi-transparent block surfaces.

## Exact Visual Specification

### Layer Architecture (z-index order):
1. Background (z:0): radial-gradient #0f1923 → #0a0e1a with subtle 40px grid at rgba(0,229,255,0.03)
2. Wires (z:10): SVG paths with drop-shadow glow, 2px stroke + 4px blur glow
3. Blocks (z:20): Glass panels — CRITICAL opacity 0.35-0.45, blur 8px max
4. Block content (z:30): Knobs, labels, ports on top of glass
5. UI chrome (z:40): Sidebar/inspector at opacity 0.8, blur 16px

### Block Glass CSS (apply to all module blocks):
- background: rgba(10, 14, 26, 0.40)
- backdrop-filter: blur(8px)
- border-radius: 12px
- border: 1px solid rgba(CATEGORY_COLOR, 0.30)
- box-shadow: 0 0 20px rgba(CATEGORY_COLOR, 0.12), 0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)

### Category Colors:
- Sources (Oscillator, Noise): #00E5FF (cyan)
- Filters (VCF, Moog): #00FF88 (green)
- Effects (Delay, Reverb): #B400FF (purple)
- Envelopes/Modulators (ADSR, LFO): #FFA000 (orange)
- I/O & Control (MIDI, Knob, LED): #FFE600 (yellow)

### Wire Rendering:
- Curved Bezier paths (cubic-bezier control points offset 40% of horizontal distance)
- Stroke: 2px solid, color = source port category color
- Glow: filter: drop-shadow(0 0 6px rgba(color, 0.5))
- Wires render BELOW blocks so glow bleeds through glass

### What NOT to do:
- Do NOT set block background opacity above 0.55 — kills wire-through visibility
- Do NOT set backdrop-filter blur above 10px on blocks — obscures wire glow
- Do NOT use the same opacity for blocks and sidebar/inspector panels
- Do NOT add border-radius above 16px — blocks are technical, not bubbly
```

### Template B: Incremental Refinement Prompt (for Cursor/inline edits)

```markdown
Adjust the .module-block class:
1. Reduce background opacity from 0.7 to 0.4 (wire glow must bleed through)
2. Reduce backdrop-filter blur from 16px to 8px (same reason)
3. Add outer glow: box-shadow 0 0 20px rgba(var(--category-color), 0.12)
4. Add inner rim: inset 0 1px 0 rgba(255,255,255,0.06)
5. Keep border at 1px solid rgba(var(--category-color), 0.3)
Do NOT change border-radius, padding, or content layout.
```

### Template C: v0.dev / Lovable Scaffold Prompt

```markdown
Create a React component for a visual programming node editor with glassmorphic design.

Tech: React 19, Tailwind CSS v4, no external node-editor libraries.

Layout: Dark background (#0a0e1a), center canvas area with:
- 4 draggable blocks positioned absolutely on canvas
- Blocks have glassmorphic styling: bg-[rgba(10,14,26,0.4)] backdrop-blur-[8px]
  border border-[rgba(0,229,255,0.3)] rounded-xl
  shadow-[0_0_20px_rgba(0,229,255,0.12),0_4px_16px_rgba(0,0,0,0.3)]
- SVG layer behind blocks with curved connection paths
- Connection paths: stroke-[#00E5FF] stroke-2 with CSS filter drop-shadow(0 0 6px rgba(0,229,255,0.5))
- Each block has: title bar with category icon, 2-3 knob controls (circular with label),
  input ports (left side, small circles), output ports (right side)

Critical: Block background opacity is 0.4, NOT higher. The SVG wire glow layer
must be visible THROUGH the glass block surfaces. This is the defining visual effect.

Category color mapping:
- "Oscillator" block: cyan border (#00E5FF)
- "Filter" block: green border (#00FF88)
- "Envelope" block: orange border (#FFA000)
- "Output" block: yellow border (#FFE600)
```

---

## Part 3: Debugging Common AI Output Failures

### Problem → Diagnosis → Fix Instruction

| What you see | Root cause | Tell the AI |
|---|---|---|
| Blocks are opaque, wires invisible behind them | bg opacity too high (0.7+) | "Reduce block background opacity to 0.4. Wire glow must be visible through the glass surface." |
| Blocks look milky/washed out | blur too high (16px+) | "Reduce backdrop-filter blur to 8px on canvas blocks. Reserve 16px blur for sidebar panels only." |
| No neon border glow | Missing outer box-shadow | "Add box-shadow: 0 0 20px rgba(CATEGORY_COLOR, 0.12) for neon border glow effect." |
| Wires render ON TOP of blocks | z-index wrong | "Wire SVG layer z-index: 10. Block layer z-index: 20. Wires must render BEHIND blocks." |
| All blocks same color | Category system not communicated | "Apply category-specific border and glow colors: Sources=cyan, Filters=green, Effects=purple, Envelopes=orange, I/O=yellow." |
| Flat looking despite transparency | Missing depth shadow | "Add depth shadow: 0 4px 16px rgba(0,0,0,0.3) alongside the neon glow shadow." |
| No visible grid on background | Grid opacity too low or missing | "Background grid: repeating-linear-gradient at rgba(0,229,255,0.03), 40px intervals, 1px lines." |
| Sidebar text hard to read | Same opacity as blocks | "Sidebar and inspector panels: background rgba(10,14,26,0.80), backdrop-filter blur(16px). Higher opacity than canvas blocks." |
| Border too subtle / invisible | Border opacity too low | "Border: 1px solid rgba(CATEGORY_COLOR, 0.35). If still too subtle, increase to 0.45." |
| Glow too aggressive / garish | Glow opacity too high | "Reduce outer glow to 0.08-0.10. Neon glow should be atmospheric, not spotlighting." |

---

## Part 4: Iteration Workflow

### Step-by-Step Process

```
PHASE 1: SCAFFOLD (v0.dev or Lovable)
├─ Use Template C to generate initial node editor layout
├─ Accept: layout structure, component hierarchy, drag logic
├─ Reject: default styling (will be wrong)
└─ Export to your repo

PHASE 2: GLASS LAYER (Cursor or Claude)
├─ Apply Template B for block glass styling
├─ Verify: can you see wire glow through blocks?
│   ├─ YES → proceed
│   └─ NO → reduce opacity by 0.05, reduce blur by 2px, retry
├─ Apply category colors per block type
└─ Add neon border glow per category

PHASE 3: WIRE RENDERING (manual or Claude)
├─ SVG wire layer with proper z-index (below blocks)
├─ Add glow filter to wire paths
├─ Verify: glow visible through glass blocks?
│   ├─ YES → proceed
│   └─ NO → increase wire glow intensity (stdDeviation +1, opacity +0.1)
└─ Adjust Bezier control points for clean curves

PHASE 4: CHROME PANELS (Cursor)
├─ Sidebar: higher opacity glass (0.8), heavier blur (16px)
├─ Inspector: same as sidebar
├─ Toolbar/header: medium opacity (0.65)
└─ Verify text readability in all panels

PHASE 5: POLISH (manual CSS tweaks)
├─ Hover states: increase border opacity to 0.5, glow to 0.2
├─ Selected state: border to 0.7, glow to 0.3
├─ Port hover: scale(1.2) with transition
├─ Knob interaction: subtle glow pulse
└─ Performance check: <5 simultaneous backdrop-filter elements visible
```

### The Opacity/Blur Tuning Matrix

Use this to dial in the exact look per element:

```
Wire glow barely visible through block:
  → Decrease block bg-opacity by 0.05
  → OR decrease block blur by 2px
  → OR increase wire glow intensity (stdDeviation +1)

Block feels too transparent (content floats):
  → Increase bg-opacity by 0.05 (stay below 0.55)
  → OR add subtle inner shadow: inset 0 0 30px rgba(0,0,0,0.2)

Neon border too bright:
  → Reduce border rgba alpha by 0.05
  → AND reduce glow box-shadow alpha by 0.03

Neon border invisible:
  → Increase border rgba alpha to 0.4+
  → Ensure parent background is dark enough (< #1a1a2e)
```

---

## Part 5: Design Token System (Copy-Paste Ready)

### CSS Custom Properties (put in your root stylesheet)

```css
:root {
  /* === BACKGROUND === */
  --bg-base: #0a0e1a;
  --bg-lighter: #0f1923;
  --bg-grid-color: rgba(0, 229, 255, 0.03);
  --bg-grid-size: 40px;

  /* === CATEGORY COLORS === */
  --cat-source: 0, 229, 255;      /* cyan — Oscillator, Noise */
  --cat-filter: 0, 255, 136;      /* green — VCF, Moog, SVF */
  --cat-effect: 180, 0, 255;      /* purple — Delay, Reverb, Chorus */
  --cat-envelope: 255, 160, 0;    /* orange — ADSR, LFO */
  --cat-io: 255, 230, 0;          /* yellow — MIDI, Knob, LED, Output */

  /* === GLASS: CANVAS BLOCKS === */
  --glass-block-bg: rgba(10, 14, 26, 0.40);
  --glass-block-blur: 8px;
  --glass-block-border-alpha: 0.30;
  --glass-block-glow-alpha: 0.12;
  --glass-block-shadow: 0 4px 16px rgba(0, 0, 0, 0.30);
  --glass-block-rim: inset 0 1px 0 rgba(255, 255, 255, 0.06);
  --glass-block-radius: 12px;

  /* === GLASS: UI CHROME (sidebar, inspector) === */
  --glass-chrome-bg: rgba(10, 14, 26, 0.80);
  --glass-chrome-blur: 16px;
  --glass-chrome-border: rgba(255, 255, 255, 0.08);

  /* === GLASS: TOOLBAR === */
  --glass-toolbar-bg: rgba(10, 14, 26, 0.65);
  --glass-toolbar-blur: 12px;

  /* === WIRES === */
  --wire-width: 2px;
  --wire-glow-blur: 6px;
  --wire-glow-alpha: 0.50;

  /* === INTERACTION STATES === */
  --hover-border-alpha: 0.50;
  --hover-glow-alpha: 0.20;
  --selected-border-alpha: 0.70;
  --selected-glow-alpha: 0.30;

  /* === TYPOGRAPHY === */
  --font-ui: 'Inter', 'SF Pro', -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --text-primary: rgba(255, 255, 255, 0.92);
  --text-secondary: rgba(255, 255, 255, 0.55);
  --text-label: rgba(255, 255, 255, 0.70);
}
```

### Usage Pattern (component-level)

```css
/* Block with category color variable */
.module-block {
  background: var(--glass-block-bg);
  backdrop-filter: blur(var(--glass-block-blur));
  -webkit-backdrop-filter: blur(var(--glass-block-blur));
  border: 1px solid rgba(var(--category-color), var(--glass-block-border-alpha));
  border-radius: var(--glass-block-radius);
  box-shadow:
    0 0 20px rgba(var(--category-color), var(--glass-block-glow-alpha)),
    var(--glass-block-shadow),
    var(--glass-block-rim);
}

.module-block:hover {
  border-color: rgba(var(--category-color), var(--hover-border-alpha));
  box-shadow:
    0 0 25px rgba(var(--category-color), var(--hover-glow-alpha)),
    var(--glass-block-shadow),
    var(--glass-block-rim);
}

.module-block.selected {
  border-color: rgba(var(--category-color), var(--selected-border-alpha));
  box-shadow:
    0 0 30px rgba(var(--category-color), var(--selected-glow-alpha)),
    var(--glass-block-shadow),
    var(--glass-block-rim);
}

/* Apply category via inline style or data attribute */
.module-block[data-category="source"]  { --category-color: var(--cat-source); }
.module-block[data-category="filter"]  { --category-color: var(--cat-filter); }
.module-block[data-category="effect"]  { --category-color: var(--cat-effect); }
.module-block[data-category="envelope"]{ --category-color: var(--cat-envelope); }
.module-block[data-category="io"]      { --category-color: var(--cat-io); }
```

---

## Quick Reference Card

### When Prompting AI, Always Specify:

1. **Opacity** — exact rgba alpha value (0.40 not "semi-transparent")
2. **Blur radius** — exact px value (8px not "blurry")
3. **Border color** — rgba with category color and alpha (not "subtle border")
4. **Glow** — box-shadow with exact spread, blur, color, alpha
5. **Z-index order** — which layer is above/below which
6. **What must be visible through what** — "wire glow visible through block glass"

### Never Say → Say Instead

| ❌ Vague | ✅ Precise |
|---|---|
| "Make it glassy" | "background rgba(10,14,26,0.4), backdrop-filter blur(8px)" |
| "Add a glow" | "box-shadow 0 0 20px rgba(0,229,255,0.12)" |
| "Make it transparent" | "background opacity 0.40, wire layer (z:10) visible through block (z:20)" |
| "Neon border" | "border 1px solid rgba(0,229,255,0.3) with outer box-shadow glow at 0.12 alpha" |
| "Dark background" | "radial-gradient from #0f1923 to #0a0e1a with grid overlay at rgba(0,229,255,0.03)" |
| "Make wires visible" | "SVG wire layer z-index 10, blocks z-index 20, wire glow stdDeviation 4 at opacity 0.6" |
| "Different colors for types" | "Category colors: Source=#00E5FF, Filter=#00FF88, Effect=#B400FF, Envelope=#FFA000, IO=#FFE600" |
