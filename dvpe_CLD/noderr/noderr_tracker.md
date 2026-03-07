# DVPE — Noderr Tracker

**Last Updated**: 2026-03-07
**Total NodeIDs**: 67
**MVP Progress**: ~55% (37 VERIFIED / 30 TODO)

---

## Legend

| Symbol | Status | Meaning |
|--------|--------|---------|
| 🟢 `[VERIFIED]` | VERIFIED | Implemented, tested, spec complete |
| 🟡 `[TODO]` | TODO | Exists in codebase, needs spec + verification |
| 🔴 `[ISSUE]` | ISSUE | Has known problems or is broken |
| ⚪️ `[PLANNED]` | PLANNED | Not yet implemented — needed for MVP |
| 🔵 `[WIP]` | WIP | Currently being worked on |

---

## Application Core

| Status | WorkGroupID | Node ID | Label | File | Dependencies | Notes |
|:---|:---|:---|:---|:---|:---|:---|
| 🟢 `[VERIFIED]` | | `UI_App` | Main App Shell | `src/App.tsx` | All stores | Entry point, panel layout, file I/O |
| 🟢 `[VERIFIED]` | | `STATE_PatchStore` | Patch Graph State | `src/stores/patchStore.ts` | TYPES_BlockDefinition | Critical: undo/redo, all block/connection state |
| 🟢 `[VERIFIED]` | | `STATE_UIStore` | UI State | `src/stores/uiStore.ts` | — | Panels, viewport, modals, theme |
| 🟢 `[VERIFIED]` | | `STATE_CustomBlockStore` | Custom Block Defs | `src/stores/customBlockStore.ts` | TYPES_CustomBlock | User-created block definitions |
| 🟡 `[TODO]` | | `STATE_BlockDesignerStore` | Block Designer State | `src/stores/blockDesignerStore.ts` | TYPES_UILayout | Needs spec verification |

---

## Core Services

| Status | WorkGroupID | Node ID | Label | File | Dependencies | Notes |
|:---|:---|:---|:---|:---|:---|:---|
| 🟢 `[VERIFIED]` | | `SVC_BlockRegistry` | Block Definition Registry | `src/core/blocks/BlockRegistry.ts` | All BLOCKS_* | Central catalog; 200+ blocks registered |
| 🟡 `[TODO]` | | `SVC_CustomBlockManager` | Custom Block CRUD | `src/core/blocks/CustomBlockManager.ts` | SVC_BlockRegistry, STATE_CustomBlockStore | Custom block lifecycle management |
| 🟢 `[VERIFIED]` | | `SVC_GraphAnalyzer` | Graph Analyzer | `src/core/graph/GraphAnalyzer.ts` | TYPES_BlockDefinition | Topological sort, cycle detection |
| 🟢 `[VERIFIED]` | | `SVC_CodeGenerator` | C++ Code Generator | `src/codegen/CodeGenerator.ts` | SVC_GraphAnalyzer, SVC_BlockRegistry | Main export pipeline; Seed/Pod/Field |
| 🟢 `[VERIFIED]` | | `SVC_ExportService` | Export Service | `src/codegen/exportService.ts` | SVC_CodeGenerator | ZIP/JSON download, preview |
| 🟡 `[TODO]` | | `SVC_CVRoutingAnalyzer` | CV Routing Analyzer | `src/codegen/analyzers/CVRoutingAnalyzer.ts` | TYPES_BlockDefinition | CV modulation analysis for code gen |
| 🟡 `[TODO]` | | `SVC_HardwareMappingAnalyzer` | Hardware Mapping Analyzer | `src/codegen/analyzers/HardwareMappingAnalyzer.ts` | TYPES_HardwareConfig | Maps blocks to platform pins |

---

## Canvas Components

| Status | WorkGroupID | Node ID | Label | File | Dependencies | Notes |
|:---|:---|:---|:---|:---|:---|:---|
| 🟢 `[VERIFIED]` | | `UI_Canvas` | React Flow Canvas | `src/components/Canvas/Canvas.tsx` | @xyflow/react, STATE_PatchStore | Main workspace; drag-drop, pan/zoom |
| 🟢 `[VERIFIED]` | | `UI_BlockNode` | Block Node Renderer | `src/components/Canvas/BlockNode.tsx` | SVC_BlockRegistry, STATE_PatchStore | Renders blocks with ports; custom node |
| 🟢 `[VERIFIED]` | | `UI_ConnectionEdge` | Wire Renderer | `src/components/Canvas/ConnectionEdge.tsx` | — | Typed wire rendering (Audio/CV/Trigger) |
| 🟢 `[VERIFIED]` | | `UI_CommentNode` | Annotation Node | `src/components/Canvas/CommentNode.tsx` | STATE_PatchStore | Text comments on canvas |
| 🟢 `[VERIFIED]` | | `UI_AlignmentToolbar` | Alignment Toolbar | `src/components/Canvas/AlignmentToolbar.tsx` | STATE_PatchStore | Align/distribute selected blocks |
| 🟢 `[VERIFIED]` | | `UI_DragOverlay` | Drag Overlay | `src/components/Canvas/DragOverlay.tsx` | STATE_UIStore | Visual drag feedback |
| 🟡 `[TODO]` | | `UI_CustomBlockEditorModal` | Custom Block Editor | `src/components/Canvas/CustomBlockEditorModal.tsx` | SVC_CustomBlockManager | Edit custom block definition |
| 🟡 `[TODO]` | | `UI_CustomBlockInternalsModal` | Custom Block Internals | `src/components/Canvas/CustomBlockInternalsModal.tsx` | STATE_CustomBlockStore | View internal patch of custom block |

---

## Inspector Components

| Status | WorkGroupID | Node ID | Label | File | Dependencies | Notes |
|:---|:---|:---|:---|:---|:---|:---|
| 🟢 `[VERIFIED]` | | `UI_Inspector` | Parameter Inspector | `src/components/Inspector/Inspector.tsx` | STATE_PatchStore, STATE_UIStore | Right panel parameter editor |
| 🟢 `[VERIFIED]` | | `UI_ParameterSlider` | Float Slider | `src/components/Inspector/ParameterSlider.tsx` | STATE_PatchStore | Linear/log float parameter |
| 🟢 `[VERIFIED]` | | `UI_ParameterDial` | Rotary Knob | `src/components/Inspector/ParameterDial.tsx` | STATE_PatchStore | Knob-style float parameter |
| 🟢 `[VERIFIED]` | | `UI_ParameterSelect` | Enum Dropdown | `src/components/Inspector/ParameterSelect.tsx` | STATE_PatchStore | Select from enum options |
| 🟢 `[VERIFIED]` | | `UI_ParameterToggle` | Boolean Toggle | `src/components/Inspector/ParameterToggle.tsx` | STATE_PatchStore | On/off parameter |
| 🟢 `[VERIFIED]` | | `UI_FrequencyDial` | Frequency Knob | `src/components/Inspector/FrequencyDial.tsx` | STATE_PatchStore | Hz-display specialized dial |
| 🟢 `[VERIFIED]` | | `UI_ADSREnvelopeControl` | ADSR Editor | `src/components/Inspector/ADSREnvelopeControl.tsx` | STATE_PatchStore | Visual ADSR shape editor |
| 🟢 `[VERIFIED]` | | `UI_WaveformSelector` | Waveform Picker | `src/components/Inspector/WaveformSelector.tsx` | STATE_PatchStore | Oscillator waveform selector |
| 🟢 `[VERIFIED]` | | `UI_WaveformDisplay` | Waveform Display | `src/components/Inspector/WaveformDisplay.tsx` | — | Waveform preview visualization |
| 🟢 `[VERIFIED]` | | `UI_MIDINoteSelector` | MIDI Note Picker | `src/components/Inspector/MIDINoteSelector.tsx` | STATE_PatchStore | Pick MIDI note (C4, D#3, etc.) |

---

## Library Components

| Status | WorkGroupID | Node ID | Label | File | Dependencies | Notes |
|:---|:---|:---|:---|:---|:---|:---|
| 🟢 `[VERIFIED]` | | `UI_ModuleLibrary` | Block Library Panel | `src/components/Library/ModuleLibrary.tsx` | SVC_BlockRegistry, STATE_CustomBlockStore | Left panel, categorized block list |
| 🟢 `[VERIFIED]` | | `UI_BlockContextMenu` | Block Context Menu | `src/components/Library/BlockContextMenu.tsx` | STATE_PatchStore | Right-click: delete, duplicate, etc. |
| 🟢 `[VERIFIED]` | | `UI_ImportBlockDialog` | Import Custom Block | `src/components/Library/ImportBlockDialog.tsx` | STATE_CustomBlockStore | Import .dvpe block from JSON |
| 🟢 `[VERIFIED]` | | `UI_DeleteConfirmDialog` | Delete Confirm Dialog | `src/components/Library/DeleteConfirmDialog.tsx` | — | Confirmation before destructive action |

---

## Architecture / Hardware Components

| Status | WorkGroupID | Node ID | Label | File | Dependencies | Notes |
|:---|:---|:---|:---|:---|:---|:---|
| 🟡 `[TODO]` | | `UI_ArchitectureWindow` | Hardware Config Modal | `src/components/architecture/ArchitectureWindow.tsx` | STATE_PatchStore, TYPES_HardwareConfig | Platform selection + pin config |
| 🟡 `[TODO]` | | `UI_PlatformSelector` | Platform Selector | `src/components/architecture/PlatformSelector.tsx` | CONST_PlatformDefinitions | Card-based Seed/Pod/Field picker |
| 🟡 `[TODO]` | | `UI_PlatformCard` | Platform Info Card | `src/components/architecture/PlatformCard.tsx` | — | Platform specs display |
| 🟡 `[TODO]` | | `UI_PinMapper` | Pin Mapper | `src/components/architecture/PinMapper.tsx` | TYPES_HardwareConfig | Visual pin assignment |
| 🟡 `[TODO]` | | `UI_PeripheralConfig` | Peripheral Config | `src/components/architecture/PeripheralConfig.tsx` | TYPES_HardwareConfig | Codec/SDRAM toggles |
| 🟢 `[VERIFIED]` | | `CONST_PlatformDefinitions` | Platform Definitions | `src/types/hardware.ts` | — | Seed/Pod/Field pin specs |

---

## Block Designer Components

| Status | WorkGroupID | Node ID | Label | File | Dependencies | Notes |
|:---|:---|:---|:---|:---|:---|:---|
| 🟡 `[TODO]` | | `UI_BlockUIDesigner` | Designer Workspace | `src/components/BlockDesigner/BlockUIDesigner.tsx` | STATE_BlockDesignerStore, STATE_CustomBlockStore | Main block designer tool |
| 🟡 `[TODO]` | | `UI_DesignCanvas` | Design Canvas | `src/components/BlockDesigner/DesignCanvas.tsx` | STATE_BlockDesignerStore | Drag-drop layout canvas |
| 🟡 `[TODO]` | | `UI_ElementLibraryPanel` | Element Library | `src/components/BlockDesigner/ElementLibraryPanel.tsx` | TYPES_UILayout | UI element type picker |
| 🟡 `[TODO]` | | `UI_PropertyEditor` | Property Editor | `src/components/BlockDesigner/PropertyEditor.tsx` | STATE_BlockDesignerStore | Edit element properties |
| 🟡 `[TODO]` | | `UI_BindingEditor` | Parameter Binding | `src/components/BlockDesigner/BindingEditor.tsx` | UTIL_BindingMapper | Bind UI elements to parameters |
| 🟡 `[TODO]` | | `UI_PortBindingEditor` | Port Binding | `src/components/BlockDesigner/PortBindingEditor.tsx` | TYPES_CustomBlock | Bind UI elements to ports |
| 🟡 `[TODO]` | | `UI_CreateBlockDialog` | Create Block Dialog | `src/components/BlockDesigner/CreateBlockDialog.tsx` | SVC_CustomBlockManager | New custom block creation wizard |
| 🟡 `[TODO]` | | `UI_CodeModuleEditor` | C++ Code Editor | `src/components/BlockDesigner/CodeModuleEditor.tsx` | @monaco-editor/react | Inline C++ block editor |
| 🟡 `[TODO]` | | `UI_DesignerToolbar` | Designer Toolbar | `src/components/BlockDesigner/DesignerToolbar.tsx` | STATE_BlockDesignerStore | Tools for layout operations |
| 🟡 `[TODO]` | | `UI_DesignerStatusBar` | Designer Status Bar | `src/components/BlockDesigner/DesignerStatusBar.tsx` | STATE_BlockDesignerStore | Status / element count display |
| 🟡 `[TODO]` | | `UI_PresetBrowser` | Layout Preset Browser | `src/components/BlockDesigner/PresetBrowser.tsx` | TYPES_UILayout | Browse/apply layout presets |

---

## Help & Navigation

| Status | WorkGroupID | Node ID | Label | File | Dependencies | Notes |
|:---|:---|:---|:---|:---|:---|:---|
| 🟡 `[TODO]` | | `UI_HelpMenu` | Help Menu | `src/components/TopBar/HelpMenu.tsx` | STATE_UIStore | Help/docs dropdown |
| 🟡 `[TODO]` | | `UI_ShortcutsModal` | Keyboard Shortcuts | `src/components/Help/ShortcutsModal.tsx` | STATE_UIStore | Shortcuts reference modal |

---

## Block Definition Categories

| Status | WorkGroupID | Node ID | Label | Location | Count | Notes |
|:---|:---|:---|:---|:---|:---|:---|
| 🟢 `[VERIFIED]` | | `BLOCKS_Synthesis` | Synthesis Blocks | `src/core/blocks/definitions/` | 11 | oscillator, fm2, varisaw, particle, etc. |
| 🟢 `[VERIFIED]` | | `BLOCKS_Filters` | Filter Blocks | `src/core/blocks/definitions/` | 12 | svf, moogladder, onePole, tone, wahwah, etc. |
| 🟢 `[VERIFIED]` | | `BLOCKS_Effects` | Effects Blocks | `src/core/blocks/definitions/` | 25+ | reverb, delay, chorus, overdrive, bitcrush, etc. |
| 🟢 `[VERIFIED]` | | `BLOCKS_Drums` | Drum Blocks | `src/core/blocks/definitions/` | 5 | analogBassDrum, hihat, synthSnare, etc. |
| 🟢 `[VERIFIED]` | | `BLOCKS_Modulators` | Modulator Blocks | `src/core/blocks/definitions/` | 8 | adsr, adenv, lfo, phasor, slew, smooth, etc. |
| 🟢 `[VERIFIED]` | | `BLOCKS_UserIO` | User I/O Blocks | `src/core/blocks/definitions/` | 12 | knob, midiNote, audioInput, cvInput, etc. |
| 🟢 `[VERIFIED]` | | `BLOCKS_MathUtility` | Math/Utility Blocks | `src/core/blocks/definitions/utility/` | 80+ | add, multiply, sin, cos, logicAnd, db_to_linear, etc. |
| 🟢 `[VERIFIED]` | | `BLOCKS_Mixing` | Mixing Blocks | `src/core/blocks/definitions/` | 8 | mixer, vca, pan, crossfade, stereoMixer, etc. |
| 🟢 `[VERIFIED]` | | `BLOCKS_PhysicalModeling` | Physical Modeling (LGPL) | `src/core/blocks/definitions/` | 4 | stringVoice, modalVoice (USE_DAISYSP_LGPL=1) |

---

## Type Definitions

| Status | WorkGroupID | Node ID | Label | File | Notes |
|:---|:---|:---|:---|:---|:---|
| 🟢 `[VERIFIED]` | | `TYPES_BlockDefinition` | Core Block Types | `src/types/blocks.ts` | BlockDefinition, BlockInstance, Connection, SignalType, etc. |
| 🟢 `[VERIFIED]` | | `TYPES_HardwareConfig` | Hardware Types | `src/types/hardware.ts` | PlatformType, HardwareConfiguration, PinDefinition |
| 🟢 `[VERIFIED]` | | `TYPES_CustomBlock` | Custom Block Types | `src/types/customBlock.ts` | CustomBlockDefinition, CodeModuleDefinition |
| 🟡 `[TODO]` | | `TYPES_UILayout` | UI Layout Types | `src/types/blockUILayout.ts` | BlockUILayout, UIElement, LayoutPreset |

---

## Utilities & Hooks

| Status | WorkGroupID | Node ID | Label | File | Notes |
|:---|:---|:---|:---|:---|:---|
| 🟢 `[VERIFIED]` | | `UTIL_BindingMapper` | Binding Path Mapper | `src/core/bindingMapper.ts` | Resolves binding paths for UI ↔ parameter links |
| 🟢 `[VERIFIED]` | | `UTIL_LibUtils` | General Utilities | `src/lib/utils.ts` | cn() Tailwind merger, misc helpers |
| 🟢 `[VERIFIED]` | | `HOOK_ParameterShortcuts` | KB Shortcut Hook | `src/hooks/useParameterShortcuts.ts` | Keyboard shortcuts for inspector parameters |

---

## Technical Debt Register

| NodeID | Debt Description | Priority |
|--------|-----------------|---------|
| `SVC_CVRoutingAnalyzer` | Integration with `SVC_CodeGenerator` may be incomplete | High |
| `SVC_HardwareMappingAnalyzer` | Field OLED visualization not yet code-gen'd | High |
| `UI_BlockUIDesigner` | Preset browser not fully wired to `UI_PresetBrowser` | Medium |
| `STATE_BlockDesignerStore` | Complex state; needs full spec + test coverage | Medium |
| `UI_CustomBlockEditorModal` | Custom block editing workflow needs UX review | Medium |
| `BLOCKS_PhysicalModeling` | LGPL flag (USE_DAISYSP_LGPL=1) handling in codegen | Low |

---

## Refactor Tasks

| Task NodeID | Description |
|------------|-------------|
| `REFACTOR_SVC_CodeGenerator` | Add OLED visualization generation for Daisy Field |
| `REFACTOR_UI_ModuleLibrary` | Add search/filter to block catalog |
| `REFACTOR_SVC_CVRoutingAnalyzer` | Ensure full integration into code generation pipeline |
