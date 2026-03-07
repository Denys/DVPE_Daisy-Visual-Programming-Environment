# Project Overview: DVPE — Daisy Visual Programming Environment

## Project Goal & Core Problem

**Goal**: Provide a visual, node-based programming environment for creating DSP audio patches targeting the Electro-Smith Daisy audio platform (Seed, Pod, Field).

**Core Problem**: Writing Daisy/DaisySP firmware in C++ requires deep embedded systems knowledge. DVPE bridges the gap by letting musicians and designers assemble audio signal flows visually, then auto-generating correct, compilable C++ code.

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| UI Framework | React | 18.3.1 |
| Language | TypeScript | 5.7.2 |
| Build Tool | Vite | 6.0.3 |
| Canvas | @xyflow/react (React Flow) | 12.3.6 |
| State Management | Zustand + Immer | 5.0.2 / 10.0.3 |
| Desktop Runtime | Tauri | 1.x |
| Code Editor | @monaco-editor/react | 4.7.0 |
| Styling | Tailwind CSS | 3.4.17 |
| Animation | Framer Motion | 11.15.0 |
| Icons | Lucide React | 0.468.0 |
| File Export | JSZip | 3.10.1 |
| Testing | Vitest + React Testing Library | 4.0.16 |
| Routing | N/A (single-page app) | — |
| Database | N/A (file-based JSON persistence) | — |

---

## Architecture Decisions

### 1. Visual-First with Code Generation (Not Interpretation)
- Patches are compiled to C++ and flashed to hardware — no runtime interpreter
- Code generation via `SVC_CodeGenerator` targets Daisy platforms specifically
- Topological sort (`SVC_GraphAnalyzer`) determines audio callback processing order

### 2. Block Registry as Single Source of Truth
- All block definitions registered in `SVC_BlockRegistry`
- 200+ built-in blocks across 9 categories (Synthesis, Filters, Effects, Drums, Modulators, UserIO, Math, Mixing, PhysicalModeling)
- Custom blocks extend the same `BlockDefinition` interface

### 3. Zustand with Immer for State
- `STATE_PatchStore` holds entire patch graph (blocks + connections + comments)
- `STATE_UIStore` holds transient UI state (panel sizes, viewport, active modal)
- Immer enables direct-mutation syntax while preserving immutability
- 50-entry undo/redo history built into patchStore

### 4. Tauri for Desktop File I/O
- Native file open/save dialogs via Tauri plugins
- Fallback to browser download for web preview mode
- Patches serialized as `.dvpe` JSON files

### 5. Custom Block System
- Users can wrap subgraphs or write inline C++ as custom blocks
- `STATE_CustomBlockStore` persists user-defined blocks
- Custom blocks embedded in exported `.dvpe` files for portability

### 6. Signal Type System
- Three wire types: AUDIO, CV, TRIGGER (enforced at connection time)
- Port compatibility validated before connections are made
- CV ports optionally toggleable for modulation routing

---

## Key Features (Implemented)

1. **Visual Block Canvas** — Drag-and-drop DSP blocks, connect with typed wires
2. **200+ Built-in Blocks** — Full DaisySP library coverage including LGPL modules
3. **C++ Code Generation** — Generates platform-specific main.cpp + Makefile
4. **Multi-Platform Support** — Daisy Seed, Pod, Field (different audio buffer modes)
5. **Hardware Architecture Modal** — Platform selection, pin mapping, peripheral config
6. **Parameter Inspector** — Rich controls: dials, sliders, ADSR editor, waveform selector
7. **Custom Block Designer** — Visual UI layout designer for custom blocks
8. **Custom Code Modules** — Inline C++ blocks with Monaco editor
9. **Patch Serialization** — Save/load `.dvpe` JSON with embedded custom blocks
10. **Undo/Redo** — 50-entry history
11. **Alignment Tools** — Grid snap, alignment toolbar, distribute
12. **Block Comments** — Canvas annotation nodes
13. **Export** — ZIP with generated C++ files

---

## Key Features (MVP Gaps — Needed for Completion)

1. **CV Routing**: `SVC_CVRoutingAnalyzer` exists but integration with code gen may be incomplete
2. **Block UI Designer Polish**: `UI_BlockUIDesigner` exists but presets/templates not fully wired
3. **OLED Visualization Support**: Field-platform OLED parameter display not code-gen'd
4. **Patch Templates/Presets**: No built-in starter patches
5. **Block Search in Library**: Filtering/search in `UI_ModuleLibrary` may be incomplete
6. **Code Preview Modal**: Preview generated C++ before export

---

## Scope & Key Features

**In Scope for MVP**:
- Full visual patch editing (all block categories)
- C++ code generation for Seed, Pod, Field
- Custom block creation (subgraph + code module)
- Patch file save/load
- Hardware platform configuration

**Out of Scope (v1)**:
- Real-time audio simulation/preview
- OTA firmware flashing from within DVPE
- Collaboration/cloud sync
- Non-Daisy targets

---

## Project Structure

```
dvpe_CLD/
├── src/
│   ├── App.tsx                   → UI_App
│   ├── components/
│   │   ├── Canvas/               → UI_Canvas, UI_BlockNode, UI_ConnectionEdge...
│   │   ├── Inspector/            → UI_Inspector, UI_ParameterSlider...
│   │   ├── Library/              → UI_ModuleLibrary, UI_BlockContextMenu...
│   │   ├── BlockDesigner/        → UI_BlockUIDesigner, UI_DesignCanvas...
│   │   ├── architecture/         → UI_ArchitectureWindow, UI_PlatformSelector...
│   │   ├── TopBar/               → UI_HelpMenu
│   │   └── Help/                 → UI_ShortcutsModal
│   ├── core/
│   │   ├── blocks/               → SVC_BlockRegistry, BLOCKS_* categories
│   │   ├── graph/                → SVC_GraphAnalyzer
│   │   └── bindingMapper.ts      → UTIL_BindingMapper
│   ├── stores/                   → STATE_PatchStore, STATE_UIStore...
│   ├── types/                    → TYPES_BlockDefinition, TYPES_Hardware...
│   ├── codegen/                  → SVC_CodeGenerator, SVC_ExportService...
│   ├── hooks/                    → HOOK_ParameterShortcuts
│   └── lib/utils.ts              → UTIL_LibUtils
└── noderr/                       ← THIS DIRECTORY
    ├── specs/                    ← One spec per NodeID
    ├── planning/
    └── prompts/ → ../../noderr/noderr/prompts/
```

---

## Environment Focus

Development environment documented in `noderr/environment_context.md`.

**Development**: Local Vite dev server (localhost:1420)
**Production**: Tauri desktop app (no public URL — local binary)
