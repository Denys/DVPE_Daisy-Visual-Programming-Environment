# Total Code Dependencies

This document tracks the main code dependencies across the entire repository.

Scope:
- This is a repo-wide architectural dependency map for the code-bearing areas of the project.
- It covers the main application, code generation pipeline, firmware workspace, shared firmware helpers, support scripts, and prototype/design code.
- It is not a literal per-file include graph for every source file in the tree.
- For deeper project-specific detail, use local dependency docs such as [DaisyExamples/MyProjects/_projects/Field_MI_Plaits/Dependencies.md](DaisyExamples/MyProjects/_projects/Field_MI_Plaits/Dependencies.md).

## 1. Repository Domain Graph

```mermaid
flowchart TD
    ROOT[DVPE Repository]

    CLD[dvpe_CLD<br/>React + TypeScript app]
    DEX[DaisyExamples<br/>Firmware workspace + vendor stacks]
    SCR[scripts<br/>Support tooling]
    DSG[dvpe_DESIGN<br/>Prototype / design code]
    DOC[docs<br/>Reference documentation]

    ROOT --> CLD
    ROOT --> DEX
    ROOT --> SCR
    ROOT --> DSG
    ROOT --> DOC

    CLD --> DEX
    SCR --> CLD
    DOC --> CLD
    DOC --> DEX
    DSG -. reference / concept input .-> CLD
```

## 2. DVPE Frontend Architecture

```mermaid
flowchart TD
    MAIN[dvpe_CLD/src/main.tsx]
    APP[dvpe_CLD/src/App.tsx]

    UISTORE[dvpe_CLD/src/stores/uiStore.ts]
    PATCHSTORE[dvpe_CLD/src/stores/patchStore.ts]
    DESIGNSTORE[Block designer + custom block stores]

    CANVAS[Canvas / graph editing UI]
    LIBRARY[ModuleLibrary]
    INSPECTOR[Inspector]
    HELP[Help / Architecture windows]
    MODALS[Custom block / shortcuts modals]

    REG[dvpe_CLD/src/core/blocks/BlockRegistry.ts]
    DEF[Block definitions under src/core/blocks/definitions]

    MAIN --> APP

    APP --> UISTORE
    APP --> PATCHSTORE
    APP --> DESIGNSTORE

    APP --> CANVAS
    APP --> LIBRARY
    APP --> INSPECTOR
    APP --> HELP
    APP --> MODALS

    PATCHSTORE --> REG
    REG --> DEF

    CANVAS --> PATCHSTORE
    LIBRARY --> REG
    INSPECTOR --> PATCHSTORE
    INSPECTOR --> UISTORE
    MODALS --> DESIGNSTORE
```

## 3. Code Generation And Export Flow

```mermaid
flowchart LR
    REG2[BlockRegistry]
    PATCH[Patch graph in patchStore]
    GEN[dvpe_CLD/src/codegen/CodeGenerator.ts]
    EXPORT[dvpe_CLD/src/codegen/exportService.ts]
    ADV[dvpe_CLD/src/codegen/advancedExportService.ts]
    OUT[Generated main.cpp + Makefile]
    FW[DaisyExamples/MyProjects/_projects/*]
    CLI[scripts/compile_patch.ts]

    REG2 --> PATCH
    PATCH --> GEN
    GEN --> EXPORT
    GEN --> CLI
    EXPORT --> OUT
    ADV --> OUT
    OUT --> FW
```

## 4. Frontend Runtime + AI Export Dependencies

```mermaid
flowchart TD
    APP2[App.tsx]
    UI2[uiStore]
    PATCH2[patchStore]
    GEN2[CodeGenerator]
    ADV2[advancedExportService]

    TAURI[Tauri runtime]
    BROWSER[Browser fetch / localStorage]
    OPENAI[OpenAI API]
    GEMINI[Gemini API]
    ANTH[Anthropic API]

    APP2 --> UI2
    APP2 --> PATCH2
    APP2 --> GEN2
    APP2 --> ADV2

    ADV2 --> BROWSER
    ADV2 --> TAURI
    ADV2 --> OPENAI
    ADV2 --> GEMINI
    ADV2 --> ANTH
```

## 5. Firmware Workspace Graph

```mermaid
flowchart TD
    DEX2[DaisyExamples]

    OFFICIAL[Official Daisy example folders<br/>field / patch / pod / seed / etc.]
    MY[DaisyExamples/MyProjects]
    LIBD[libDaisy]
    DSP[DaisySP]
    STML[stmlib]

    FOUNDATION[DaisyExamples/MyProjects/foundation_examples]
    PROJ[DaisyExamples/MyProjects/_projects]
    PLAITSINIT[DaisyExamples/MyProjects/_projects/PlaitsPatchInit]

    DEX2 --> OFFICIAL
    DEX2 --> MY
    DEX2 --> LIBD
    DEX2 --> DSP
    DEX2 --> STML

    MY --> FOUNDATION
    MY --> PROJ

    PROJ --> FOUNDATION
    PROJ --> LIBD
    PROJ --> DSP
    PROJ --> STML
    PROJ --> PLAITSINIT
```

## 6. MyProjects Dependency Graph

```mermaid
flowchart TD
    FOUNDATION2[foundation_examples<br/>shared headers / helpers]
    TEMPLATE1[Field_Template_Std<br/>legacy template]
    TEMPLATE2[Field_Template_Std_2<br/>new synth/drum starter]
    PLAITSAPP[Field_MI_Plaits]
    OTHER[Other custom projects under _projects]
    PLAITSCORE[PlaitsPatchInit<br/>Mutable Plaits DSP port]

    TEMPLATE1 --> FOUNDATION2
    TEMPLATE2 --> FOUNDATION2
    PLAITSAPP --> FOUNDATION2
    OTHER --> FOUNDATION2

    PLAITSAPP --> PLAITSCORE
    PLAITSAPP --> LIBD2[libDaisy]
    PLAITSAPP --> DSP2[DaisySP]
    PLAITSAPP --> STML2[stmlib]

    TEMPLATE2 --> LIBD2
    TEMPLATE2 --> DSP2
    OTHER --> LIBD2
    OTHER --> DSP2
```

## 7. Field_MI_Plaits Deep Dependency Position

```mermaid
flowchart LR
    FIELD[Field_MI_Plaits.cpp]
    FINSTR[field_instrument_ui.h]
    FDEF[field_defaults.h]
    VOICE[plaits::Voice]
    PATCH3[plaits::Patch]
    MODS[plaits::Modulations]
    RES[plaits/resources.cc]
    ENGINES[Selected Plaits engines]
    HW[daisy_field.h / libDaisy]
    DSP3[daisysp.h / DaisySP]
    STML3[stmlib]

    FIELD --> FINSTR
    FIELD --> FDEF
    FIELD --> VOICE
    FIELD --> PATCH3
    FIELD --> MODS
    FIELD --> HW
    FIELD --> DSP3

    VOICE --> ENGINES
    VOICE --> RES
    VOICE --> STML3
```

## 8. Script And Tooling Dependencies

```mermaid
flowchart TD
    SCR2[scripts/*]
    COMPILE[scripts/compile_patch.ts]
    CLEAN[scripts/cleanup_root.ps1]
    CLD2[dvpe_CLD codegen modules]
    PATCHFILES[.dvpe patch files]
    GENOUT[Generated firmware output folders]

    SCR2 --> COMPILE
    SCR2 --> CLEAN

    COMPILE --> CLD2
    COMPILE --> PATCHFILES
    COMPILE --> GENOUT
```

## 9. Design / Prototype Code Dependencies

```mermaid
flowchart TD
    DSG2[dvpe_DESIGN]
    MORPH[dvpe_DESIGN/morphism_sources.jsx]
    REACT[React-style component logic]
    REF[Reference / concept exploration]
    APP3[dvpe_CLD application ideas]

    DSG2 --> MORPH
    MORPH --> REACT
    MORPH --> REF
    REF -. influences .-> APP3
```

## 10. Dependency Layers

```mermaid
flowchart TB
    L1[Authoring Layer<br/>dvpe_CLD UI + stores + block registry]
    L2[Generation Layer<br/>CodeGenerator + export services + scripts]
    L3[Firmware Project Layer<br/>MyProjects/_projects]
    L4[Shared Embedded Layer<br/>foundation_examples]
    L5[Vendor Embedded Layer<br/>libDaisy + DaisySP + stmlib + PlaitsPatchInit]
    L6[Hardware Layer<br/>Daisy Field / Seed family hardware]

    L1 --> L2
    L2 --> L3
    L3 --> L4
    L3 --> L5
    L4 --> L5
    L5 --> L6
```

## 11. Notes

- `dvpe_CLD` is the primary authoring environment. Its key internal dependency spine is `App.tsx -> stores -> BlockRegistry -> CodeGenerator`.
- `patchStore` is the main ownership point for patch graph state, and `BlockRegistry` is the canonical registry for block definitions used by both editing and generation flows.
- `scripts/compile_patch.ts` is an important cross-boundary dependency: it uses frontend codegen logic without running the browser UI.
- `DaisyExamples/MyProjects` is the main custom firmware workspace. Shared helpers live in `foundation_examples`, while actual firmware targets live in `_projects`.
- `Field_MI_Plaits` is the deepest dependency node currently in `MyProjects` because it layers Field UI helpers, libDaisy, DaisySP, stmlib, and the vendored Mutable Plaits port together.
- `dvpe_DESIGN` appears to be adjacent prototype/reference code rather than the main runtime path for the app.
- `docs` influences implementation choices and onboarding, but it is not a runtime dependency domain by itself.

## 12. Update Triggers

Update this document when:
- a new top-level code domain is added to the repository
- the frontend state/codegen architecture changes materially
- new scripts start importing app modules directly
- new shared firmware helper layers are introduced
- the vendor stack changes, especially `libDaisy`, `DaisySP`, `stmlib`, or `PlaitsPatchInit`
- a project-specific dependency doc is added that should be linked from here
