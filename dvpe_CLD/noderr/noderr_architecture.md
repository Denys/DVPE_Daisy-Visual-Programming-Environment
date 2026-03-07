# DVPE Architecture — Noderr Architecture Map

## Unified System Architecture

```mermaid
graph TD
    %% ====================================================================
    %%  LEGEND — NodeID Convention: TYPE_DescriptiveName
    %% ====================================================================
    subgraph Legend
        direction TB
        L_IDConv[NodeID Convention: TYPE_DescriptiveName]
        L_UI[/UI Component/] --- L_UIDesc(React Component)
        L_STATE[[State Store]] --- L_STATEDesc(Zustand Store)
        L_SVC([Service/Core Logic]) --- L_SVCDesc(Business Logic)
        L_BLOCKS[(Block Category)] --- L_BLOCKSDesc(DaisySP Block Group)
        L_TYPES{Types/Interfaces} --- L_TYPESDesc(TypeScript Types)
        L_UTIL[Utility/Hook] --- L_UTILDesc(Helper/Hook)
    end

    %% ====================================================================
    %%  APPLICATION ENTRY
    %% ====================================================================
    APP_ENTRY((User Opens DVPE)):::standard --> UI_App

    %% ====================================================================
    %%  APP SHELL
    %% ====================================================================
    UI_App[/App — Main Shell/]:::standard

    UI_App --> UI_ModuleLibrary
    UI_App --> UI_Canvas
    UI_App --> UI_Inspector
    UI_App --> UI_HelpMenu
    UI_App --> UI_ArchitectureWindow
    UI_App --> UI_BlockUIDesigner

    %% ====================================================================
    %%  STATE MANAGEMENT LAYER
    %% ====================================================================
    subgraph "State Management"
        direction TB
        STATE_PatchStore[["PatchStore — Blocks, Connections, History"]]:::critical
        STATE_UIStore[["UIStore — Panels, Viewport, Modals"]]:::standard
        STATE_CustomBlockStore[["CustomBlockStore — User Block Defs"]]:::standard
        STATE_BlockDesignerStore[["BlockDesignerStore — Designer State"]]:::complex
    end

    UI_App --> STATE_PatchStore
    UI_App --> STATE_UIStore

    %% ====================================================================
    %%  MODULE LIBRARY PANEL
    %% ====================================================================
    subgraph "Library Panel"
        direction TB
        UI_ModuleLibrary[/ModuleLibrary — Block Catalog/]:::standard
        UI_BlockContextMenu[/BlockContextMenu — Right-click Menu/]:::standard
        UI_ImportBlockDialog[/ImportBlockDialog — Import Custom Block/]:::standard
        UI_DeleteConfirmDialog[/DeleteConfirmDialog — Confirm Delete/]:::standard
    end

    UI_ModuleLibrary --> SVC_BlockRegistry
    UI_ModuleLibrary --> STATE_CustomBlockStore
    UI_ModuleLibrary --> UI_BlockContextMenu
    UI_ModuleLibrary --> UI_ImportBlockDialog
    UI_ModuleLibrary --> UI_DeleteConfirmDialog

    %% ====================================================================
    %%  CANVAS SYSTEM
    %% ====================================================================
    subgraph "Canvas System"
        direction TB
        UI_Canvas[/Canvas — React Flow Workspace/]:::critical
        UI_BlockNode[/BlockNode — Block Renderer/]:::complex
        UI_ConnectionEdge[/ConnectionEdge — Wire Renderer/]:::standard
        UI_CommentNode[/CommentNode — Annotation/]:::standard
        UI_AlignmentToolbar[/AlignmentToolbar — Align/Distribute/]:::standard
        UI_DragOverlay[/DragOverlay — Drag Feedback/]:::standard
        UI_CustomBlockEditorModal[/CustomBlockEditorModal — Edit Custom Block/]:::complex
        UI_CustomBlockInternalsModal[/CustomBlockInternalsModal — View Internals/]:::standard
    end

    UI_Canvas --> UI_BlockNode
    UI_Canvas --> UI_ConnectionEdge
    UI_Canvas --> UI_CommentNode
    UI_Canvas --> UI_AlignmentToolbar
    UI_Canvas --> UI_DragOverlay
    UI_Canvas --> UI_CustomBlockEditorModal
    UI_Canvas --> UI_CustomBlockInternalsModal
    UI_Canvas --> STATE_PatchStore
    UI_Canvas --> STATE_UIStore
    UI_BlockNode --> SVC_BlockRegistry
    UI_BlockNode --> STATE_PatchStore

    %% ====================================================================
    %%  INSPECTOR PANEL
    %% ====================================================================
    subgraph "Inspector Panel"
        direction TB
        UI_Inspector[/Inspector — Parameter Editor/]:::complex
        UI_ParameterSlider[/ParameterSlider — Float Slider/]:::standard
        UI_ParameterDial[/ParameterDial — Rotary Knob/]:::standard
        UI_ParameterSelect[/ParameterSelect — Enum Dropdown/]:::standard
        UI_ParameterToggle[/ParameterToggle — Boolean Toggle/]:::standard
        UI_FrequencyDial[/FrequencyDial — Hz Knob/]:::standard
        UI_ADSREnvelopeControl[/ADSREnvelopeControl — Envelope Editor/]:::complex
        UI_WaveformSelector[/WaveformSelector — Waveform Picker/]:::standard
        UI_WaveformDisplay[/WaveformDisplay — Waveform Visual/]:::standard
        UI_MIDINoteSelector[/MIDINoteSelector — MIDI Note Picker/]:::standard
    end

    UI_Inspector --> UI_ParameterSlider
    UI_Inspector --> UI_ParameterDial
    UI_Inspector --> UI_ParameterSelect
    UI_Inspector --> UI_ParameterToggle
    UI_Inspector --> UI_FrequencyDial
    UI_Inspector --> UI_ADSREnvelopeControl
    UI_Inspector --> UI_WaveformSelector
    UI_Inspector --> UI_WaveformDisplay
    UI_Inspector --> UI_MIDINoteSelector
    UI_Inspector --> STATE_PatchStore
    UI_Inspector --> STATE_UIStore

    %% ====================================================================
    %%  HARDWARE ARCHITECTURE SYSTEM
    %% ====================================================================
    subgraph "Architecture / Hardware Config"
        direction TB
        UI_ArchitectureWindow[/ArchitectureWindow — Hardware Config Modal/]:::complex
        UI_PlatformSelector[/PlatformSelector — Seed/Pod/Field Selector/]:::standard
        UI_PlatformCard[/PlatformCard — Platform Info Card/]:::standard
        UI_PinMapper[/PinMapper — Pin Assignment UI/]:::complex
        UI_PeripheralConfig[/PeripheralConfig — Codec/SDRAM Config/]:::standard
        CONST_PlatformDefinitions{PlatformDefinitions — Platform Constants}:::standard
    end

    UI_ArchitectureWindow --> UI_PlatformSelector
    UI_ArchitectureWindow --> UI_PinMapper
    UI_ArchitectureWindow --> UI_PeripheralConfig
    UI_PlatformSelector --> UI_PlatformCard
    UI_PlatformSelector --> CONST_PlatformDefinitions
    UI_ArchitectureWindow --> STATE_PatchStore

    %% ====================================================================
    %%  BLOCK DESIGNER SYSTEM
    %% ====================================================================
    subgraph "Block UI Designer"
        direction TB
        UI_BlockUIDesigner[/BlockUIDesigner — Designer Workspace/]:::complex
        UI_DesignCanvas[/DesignCanvas — Layout Canvas/]:::complex
        UI_ElementLibraryPanel[/ElementLibraryPanel — UI Elements/]:::standard
        UI_PropertyEditor[/PropertyEditor — Element Properties/]:::standard
        UI_BindingEditor[/BindingEditor — Parameter Binding/]:::complex
        UI_PortBindingEditor[/PortBindingEditor — Port Binding/]:::standard
        UI_CreateBlockDialog[/CreateBlockDialog — New Custom Block/]:::standard
        UI_CodeModuleEditor[/CodeModuleEditor — C++ Inline Editor/]:::complex
        UI_DesignerToolbar[/DesignerToolbar — Designer Tools/]:::standard
        UI_DesignerStatusBar[/DesignerStatusBar — Designer Status/]:::standard
        UI_PresetBrowser[/PresetBrowser — Layout Presets/]:::standard
    end

    UI_BlockUIDesigner --> UI_DesignCanvas
    UI_BlockUIDesigner --> UI_ElementLibraryPanel
    UI_BlockUIDesigner --> UI_PropertyEditor
    UI_BlockUIDesigner --> UI_BindingEditor
    UI_BlockUIDesigner --> UI_PortBindingEditor
    UI_BlockUIDesigner --> UI_CreateBlockDialog
    UI_BlockUIDesigner --> UI_CodeModuleEditor
    UI_BlockUIDesigner --> UI_DesignerToolbar
    UI_BlockUIDesigner --> UI_DesignerStatusBar
    UI_BlockUIDesigner --> UI_PresetBrowser
    UI_BlockUIDesigner --> STATE_BlockDesignerStore
    UI_BlockUIDesigner --> STATE_CustomBlockStore

    %% ====================================================================
    %%  HELP / NAVIGATION
    %% ====================================================================
    subgraph "Help & Navigation"
        UI_HelpMenu[/HelpMenu — Help Dropdown/]:::standard
        UI_ShortcutsModal[/ShortcutsModal — Keyboard Shortcuts/]:::standard
    end
    UI_HelpMenu --> UI_ShortcutsModal

    %% ====================================================================
    %%  CORE SERVICES
    %% ====================================================================
    subgraph "Core Services"
        direction TB
        SVC_BlockRegistry([BlockRegistry — Block Definition Catalog]):::critical
        SVC_CustomBlockManager([CustomBlockManager — Custom Block CRUD]):::complex
        SVC_GraphAnalyzer([GraphAnalyzer — Topological Sort / Cycle Detection]):::critical
        SVC_CodeGenerator([CodeGenerator — C++ + Makefile Generation]):::critical
        SVC_ExportService([ExportService — ZIP / JSON / Download]):::standard
        SVC_CVRoutingAnalyzer([CVRoutingAnalyzer — CV Modulation Analysis]):::complex
        SVC_HardwareMappingAnalyzer([HardwareMappingAnalyzer — Pin / Port Mapping]):::complex
    end

    SVC_CustomBlockManager --> SVC_BlockRegistry
    SVC_CustomBlockManager --> STATE_CustomBlockStore
    SVC_CodeGenerator --> SVC_GraphAnalyzer
    SVC_CodeGenerator --> SVC_BlockRegistry
    SVC_CodeGenerator --> SVC_CVRoutingAnalyzer
    SVC_CodeGenerator --> SVC_HardwareMappingAnalyzer
    SVC_ExportService --> SVC_CodeGenerator

    %% Export triggers
    UI_App -->|Export| SVC_ExportService
    UI_Canvas -->|Request Code Gen| SVC_CodeGenerator

    %% ====================================================================
    %%  BLOCK CATEGORY GROUPS
    %% ====================================================================
    subgraph "Block Definitions (DaisySP)"
        direction TB
        BLOCKS_Synthesis[(Synthesis — 11 blocks)]:::standard
        BLOCKS_Filters[(Filters — 12 blocks)]:::standard
        BLOCKS_Effects[(Effects — 25+ blocks)]:::standard
        BLOCKS_Drums[(Drums — 5 blocks)]:::standard
        BLOCKS_Modulators[(Modulators — 8 blocks)]:::standard
        BLOCKS_UserIO[(User I/O — 12 blocks)]:::standard
        BLOCKS_MathUtility[(Math/Utility — 80+ blocks)]:::standard
        BLOCKS_Mixing[(Mixing — 8 blocks)]:::standard
        BLOCKS_PhysicalModeling[(Physical Modeling — 4 LGPL blocks)]:::standard
    end

    SVC_BlockRegistry --> BLOCKS_Synthesis
    SVC_BlockRegistry --> BLOCKS_Filters
    SVC_BlockRegistry --> BLOCKS_Effects
    SVC_BlockRegistry --> BLOCKS_Drums
    SVC_BlockRegistry --> BLOCKS_Modulators
    SVC_BlockRegistry --> BLOCKS_UserIO
    SVC_BlockRegistry --> BLOCKS_MathUtility
    SVC_BlockRegistry --> BLOCKS_Mixing
    SVC_BlockRegistry --> BLOCKS_PhysicalModeling

    %% ====================================================================
    %%  TYPES / INTERFACES
    %% ====================================================================
    subgraph "Type Definitions"
        direction TB
        TYPES_BlockDefinition{BlockDefinition / BlockInstance / Connection}:::standard
        TYPES_HardwareConfig{HardwareConfig / PlatformDefinition}:::standard
        TYPES_CustomBlock{CustomBlockDefinition / CodeModuleDefinition}:::standard
        TYPES_UILayout{BlockUILayout / UIElement / LayoutPreset}:::standard
    end

    SVC_BlockRegistry --> TYPES_BlockDefinition
    STATE_PatchStore --> TYPES_BlockDefinition
    UI_ArchitectureWindow --> TYPES_HardwareConfig
    STATE_CustomBlockStore --> TYPES_CustomBlock
    UI_BlockUIDesigner --> TYPES_UILayout

    %% ====================================================================
    %%  UTILITIES
    %% ====================================================================
    subgraph "Utilities & Hooks"
        UTIL_BindingMapper[BindingMapper — Binding Path Resolution]:::standard
        UTIL_LibUtils[lib/utils — cn() + Helpers]:::standard
        HOOK_ParameterShortcuts[useParameterShortcuts — KB Shortcut Hook]:::standard
    end

    UI_Inspector --> UTIL_BindingMapper
    UI_BlockUIDesigner --> UTIL_BindingMapper
    UI_Inspector --> HOOK_ParameterShortcuts

    %% ====================================================================
    %%  CLASSIFICATION STYLES
    %% ====================================================================
    classDef critical fill:#ff6b6b,color:#fff,stroke:#cc0000
    classDef complex fill:#4ecdc4,color:#fff,stroke:#2a9d8f
    classDef standard fill:#45b7d1,color:#fff,stroke:#2176ae
```

---

## NodeID Reference Table

| NodeID | Type | File Location | Status |
|--------|------|---------------|--------|
| `UI_App` | UI | `src/App.tsx` | VERIFIED |
| `STATE_PatchStore` | State | `src/stores/patchStore.ts` | VERIFIED |
| `STATE_UIStore` | State | `src/stores/uiStore.ts` | VERIFIED |
| `STATE_CustomBlockStore` | State | `src/stores/customBlockStore.ts` | VERIFIED |
| `STATE_BlockDesignerStore` | State | `src/stores/blockDesignerStore.ts` | VERIFIED |
| `SVC_BlockRegistry` | Service | `src/core/blocks/BlockRegistry.ts` | VERIFIED |
| `SVC_CustomBlockManager` | Service | `src/core/blocks/CustomBlockManager.ts` | TODO |
| `SVC_GraphAnalyzer` | Service | `src/core/graph/GraphAnalyzer.ts` | VERIFIED |
| `SVC_CodeGenerator` | Service | `src/codegen/CodeGenerator.ts` | VERIFIED |
| `SVC_ExportService` | Service | `src/codegen/exportService.ts` | VERIFIED |
| `SVC_CVRoutingAnalyzer` | Service | `src/codegen/analyzers/CVRoutingAnalyzer.ts` | TODO |
| `SVC_HardwareMappingAnalyzer` | Service | `src/codegen/analyzers/HardwareMappingAnalyzer.ts` | TODO |
| `UI_Canvas` | UI | `src/components/Canvas/Canvas.tsx` | VERIFIED |
| `UI_BlockNode` | UI | `src/components/Canvas/BlockNode.tsx` | VERIFIED |
| `UI_ConnectionEdge` | UI | `src/components/Canvas/ConnectionEdge.tsx` | VERIFIED |
| `UI_CommentNode` | UI | `src/components/Canvas/CommentNode.tsx` | VERIFIED |
| `UI_AlignmentToolbar` | UI | `src/components/Canvas/AlignmentToolbar.tsx` | VERIFIED |
| `UI_DragOverlay` | UI | `src/components/Canvas/DragOverlay.tsx` | VERIFIED |
| `UI_CustomBlockEditorModal` | UI | `src/components/Canvas/CustomBlockEditorModal.tsx` | TODO |
| `UI_CustomBlockInternalsModal` | UI | `src/components/Canvas/CustomBlockInternalsModal.tsx` | TODO |
| `UI_Inspector` | UI | `src/components/Inspector/Inspector.tsx` | VERIFIED |
| `UI_ParameterSlider` | UI | `src/components/Inspector/ParameterSlider.tsx` | VERIFIED |
| `UI_ParameterDial` | UI | `src/components/Inspector/ParameterDial.tsx` | VERIFIED |
| `UI_ParameterSelect` | UI | `src/components/Inspector/ParameterSelect.tsx` | VERIFIED |
| `UI_ParameterToggle` | UI | `src/components/Inspector/ParameterToggle.tsx` | VERIFIED |
| `UI_FrequencyDial` | UI | `src/components/Inspector/FrequencyDial.tsx` | VERIFIED |
| `UI_ADSREnvelopeControl` | UI | `src/components/Inspector/ADSREnvelopeControl.tsx` | VERIFIED |
| `UI_WaveformSelector` | UI | `src/components/Inspector/WaveformSelector.tsx` | VERIFIED |
| `UI_WaveformDisplay` | UI | `src/components/Inspector/WaveformDisplay.tsx` | VERIFIED |
| `UI_MIDINoteSelector` | UI | `src/components/Inspector/MIDINoteSelector.tsx` | VERIFIED |
| `UI_ModuleLibrary` | UI | `src/components/Library/ModuleLibrary.tsx` | VERIFIED |
| `UI_BlockContextMenu` | UI | `src/components/Library/BlockContextMenu.tsx` | VERIFIED |
| `UI_ImportBlockDialog` | UI | `src/components/Library/ImportBlockDialog.tsx` | VERIFIED |
| `UI_DeleteConfirmDialog` | UI | `src/components/Library/DeleteConfirmDialog.tsx` | VERIFIED |
| `UI_ArchitectureWindow` | UI | `src/components/architecture/ArchitectureWindow.tsx` | TODO |
| `UI_PlatformSelector` | UI | `src/components/architecture/PlatformSelector.tsx` | TODO |
| `UI_PlatformCard` | UI | `src/components/architecture/PlatformCard.tsx` | TODO |
| `UI_PinMapper` | UI | `src/components/architecture/PinMapper.tsx` | TODO |
| `UI_PeripheralConfig` | UI | `src/components/architecture/PeripheralConfig.tsx` | TODO |
| `CONST_PlatformDefinitions` | Const | `src/types/hardware.ts` | VERIFIED |
| `UI_BlockUIDesigner` | UI | `src/components/BlockDesigner/BlockUIDesigner.tsx` | TODO |
| `UI_DesignCanvas` | UI | `src/components/BlockDesigner/DesignCanvas.tsx` | TODO |
| `UI_ElementLibraryPanel` | UI | `src/components/BlockDesigner/ElementLibraryPanel.tsx` | TODO |
| `UI_PropertyEditor` | UI | `src/components/BlockDesigner/PropertyEditor.tsx` | TODO |
| `UI_BindingEditor` | UI | `src/components/BlockDesigner/BindingEditor.tsx` | TODO |
| `UI_PortBindingEditor` | UI | `src/components/BlockDesigner/PortBindingEditor.tsx` | TODO |
| `UI_CreateBlockDialog` | UI | `src/components/BlockDesigner/CreateBlockDialog.tsx` | TODO |
| `UI_CodeModuleEditor` | UI | `src/components/BlockDesigner/CodeModuleEditor.tsx` | TODO |
| `UI_DesignerToolbar` | UI | `src/components/BlockDesigner/DesignerToolbar.tsx` | TODO |
| `UI_DesignerStatusBar` | UI | `src/components/BlockDesigner/DesignerStatusBar.tsx` | TODO |
| `UI_PresetBrowser` | UI | `src/components/BlockDesigner/PresetBrowser.tsx` | TODO |
| `UI_HelpMenu` | UI | `src/components/TopBar/HelpMenu.tsx` | TODO |
| `UI_ShortcutsModal` | UI | `src/components/Help/ShortcutsModal.tsx` | TODO |
| `BLOCKS_Synthesis` | BlockGroup | `src/core/blocks/definitions/` | VERIFIED |
| `BLOCKS_Filters` | BlockGroup | `src/core/blocks/definitions/` | VERIFIED |
| `BLOCKS_Effects` | BlockGroup | `src/core/blocks/definitions/` | VERIFIED |
| `BLOCKS_Drums` | BlockGroup | `src/core/blocks/definitions/` | VERIFIED |
| `BLOCKS_Modulators` | BlockGroup | `src/core/blocks/definitions/` | VERIFIED |
| `BLOCKS_UserIO` | BlockGroup | `src/core/blocks/definitions/` | VERIFIED |
| `BLOCKS_MathUtility` | BlockGroup | `src/core/blocks/definitions/utility/` | VERIFIED |
| `BLOCKS_Mixing` | BlockGroup | `src/core/blocks/definitions/` | VERIFIED |
| `BLOCKS_PhysicalModeling` | BlockGroup | `src/core/blocks/definitions/` | VERIFIED |
| `TYPES_BlockDefinition` | Types | `src/types/blocks.ts` | VERIFIED |
| `TYPES_HardwareConfig` | Types | `src/types/hardware.ts` | VERIFIED |
| `TYPES_CustomBlock` | Types | `src/types/customBlock.ts` | VERIFIED |
| `TYPES_UILayout` | Types | `src/types/blockUILayout.ts` | TODO |
| `UTIL_BindingMapper` | Util | `src/core/bindingMapper.ts` | VERIFIED |
| `UTIL_LibUtils` | Util | `src/lib/utils.ts` | VERIFIED |
| `HOOK_ParameterShortcuts` | Hook | `src/hooks/useParameterShortcuts.ts` | VERIFIED |
