DVPE GUI Implementation Plan
Exhaustive Frontend Specification for Daisy Visual Programming Environment
Version: 1.0
Date: 2025-12-13
Based on: DVPE-EXHAUSTIVE-TURNKEY-IMPLEMENTATION-PLAN-v3.1-FROZEN.md, DaisySP Reference, Visual Design Guidelines

1. Component Architecture & Hierarchical Structure
1.1 Application Shell Hierarchy
App (Root)
├── AppShell
│   ├── Toolbar (top bar)
│   │   ├── ProjectControls (new, save, load)
│   │   ├── ExportControls (export C++, compile)
│   │   ├── ViewControls (zoom, minimap toggle)
│   │   └── ExampleSelector (load example patches)
│   ├── MainLayout (flex container)
│   │   ├── BlockPalette (left panel, 200px)
│   │   │   ├── SearchBar
│   │   │   ├── CategoryList
│   │   │   │   └── CategoryItem (collapsible)
│   │   │   │       └── BlockCard (draggable)
│   │   │   └── UserExamplesSection
│   │   ├── CanvasWorkspace (center, flex-1)
│   │   │   ├── ReactFlowProvider
│   │   │   │   ├── Canvas (ReactFlow)
│   │   │   │   │   ├── BlockNode (custom node)
│   │   │   │   │   ├── ConnectionEdge (custom edge)
│   │   │   │   │   ├── MiniMap
│   │   │   │   │   ├── Controls
│   │   │   │   │   └── Background (grid)
│   │   │   │   └── ConnectionValidator
│   │   │   └── CanvasOverlay (selection box, tooltips)
│   │   └── InspectorPanel (right panel, 280px)
│   │       ├── BlockHeader (module name, class)
│   │       ├── ParameterSection
│   │       │   ├── DialControl
│   │       │   ├── SliderControl
│   │       │   ├── DropdownControl
│   │       │   └── ToggleControl
│   │       ├── PortsSection
│   │       │   ├── InputPortList
│   │       │   └── OutputPortList
│   │       └── DescriptionSection
│   └── StatusBar (bottom)
│       ├── ValidationStatus
│       ├── BlockCount
│       └── ZoomLevel
└── Modals
    ├── ExampleBrowserModal
    ├── ExportModal
    └── ConfirmationModal
1.2 Component Prop Interfaces
// Core component interfaces
interface BlockNodeProps {
  id: string;
  data: {
    block: BlockInstance;
    definition: BlockDefinition;
    selected: boolean;
  };
  selected: boolean;
}
interface ConnectionEdgeProps {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
  data: { type: ConnectionType };
}
interface InspectorPanelProps {
  selectedBlockId: string | null;
  onParameterChange: (blockId: string, paramId: string, value: any) => void;
}
interface BlockCardProps {
  definition: BlockDefinition;
  onDragStart: (e: DragEvent, defId: string) => void;
}
2. Diagram Block Implementation by Category
2.1 Block Categories & Module Mapping
Category	Blocks	DaisySP Class	Color Token
Sources	Oscillator, BlOsc, Fm2, WhiteNoise	daisysp::Oscillator etc.	audio-primary
Filters	MoogLadder, Svf, Tone, ATone	daisysp::MoogLadder etc.	audio-primary
Effects	Chorus, Reverb, Delay, Phaser	daisysp::Chorus etc.	audio-primary
Control	ADSR, LFO, Metro, Line	daisysp::Adsr etc.	control-primary
I/O	AudioIn, AudioOut, Knob, Key, Gate	daisy::AnalogControl	audio-primary
User	Potentiometer, Button, LED	daisy::Switch etc.	accent-green
Utility	Mixer, VCA, CrossFade	Custom	text-secondary
2.2 Block Definition Schema
interface BlockDefinition {
  id: string;                    // 'oscillator'
  className: string;             // 'daisysp::Oscillator'
  displayName: string;           // 'OSCILLATOR'
  category: BlockCategory;
  headerFile: string;            // 'daisysp.h'
  initMethod: string;            // 'Init'
  initParams: string[];          // ['sample_rate']
  processMethod: string;         // 'Process'
  processReturnType: string;     // 'float'
  parameters: ParameterDefinition[];
  ports: PortDefinition[];
  color: 'audio' | 'control' | 'user' | 'utility';
  icon: string;                  // Lucide icon name
  description: string;
  requiresSdram?: boolean;
}
2.3 Essential Block Implementations
Oscillator Block
{
  id: 'oscillator',
  className: 'Oscillator',
  displayName: 'OSCILLATOR',
  category: BlockCategory.SOURCES,
  parameters: [
    { id: 'freq', displayName: 'Frequency', type: 'float', 
      cppSetter: 'SetFreq', default: 440, range: [20, 20000], 
      curve: 'logarithmic', unit: 'Hz', cvDestination: true },
    { id: 'amp', displayName: 'Amplitude', type: 'float',
      cppSetter: 'SetAmp', default: 0.5, range: [0, 1], cvDestination: true },
    { id: 'waveform', displayName: 'Waveform', type: 'enum',
      cppSetter: 'SetWaveform', default: 'WAVE_POLYBLEP_SAW',
      enumValues: ['WAVE_SIN', 'WAVE_TRI', 'WAVE_POLYBLEP_SAW', 'WAVE_POLYBLEP_SQUARE'] },
    { id: 'pw', displayName: 'Pulse Width', type: 'float',
      cppSetter: 'SetPw', default: 0.5, range: [0, 1], cvDestination: true }
  ],
  ports: [
    { id: 'out', displayName: 'Out', type: PortType.AUDIO_OUT, position: 'right' }
  ],
  color: 'audio',
  icon: 'Waveform'
}
Filter Block (MoogLadder)
{
  id: 'moog_ladder',
  className: 'MoogLadder',
  displayName: 'MOOG LADDER',
  category: BlockCategory.FILTERS,
  parameters: [
    { id: 'freq', displayName: 'Cutoff', type: 'float',
      cppSetter: 'SetFreq', default: 1000, range: [20, 20000],
      curve: 'logarithmic', unit: 'Hz', cvDestination: true },
    { id: 'res', displayName: 'Resonance', type: 'float',
      cppSetter: 'SetRes', default: 0.4, range: [0, 1], cvDestination: true }
  ],
  ports: [
    { id: 'in', displayName: 'In', type: PortType.AUDIO_IN, position: 'left' },
    { id: 'out', displayName: 'Out', type: PortType.AUDIO_OUT, position: 'right' }
  ],
  color: 'audio',
  icon: 'Filter'
}
3. Canvas Workspace Functionality
3.1 Block Operations
Operation	Trigger	Behavior
Add Block	Drag from palette OR double-click palette	Drop at cursor, snap to 16px grid
Select Single	Click block	Deselect others, show in inspector
Select Multiple	Shift+click OR marquee drag	Add to selection set
Move Block	Drag selected	Move all selected, snap to grid
Delete Block	Delete/Backspace key	Remove block + connections, add to undo
Duplicate	Ctrl+D	Clone selected at offset (+20, +20)
3.2 Connection Operations
Operation	Trigger	Behavior
Create	Drag from port to port	Validate types, show preview line
Delete	Click edge + Delete OR right-click	Remove connection
Reroute	Drag edge endpoint	Disconnect and reconnect
3.3 Connection Validation Rules
const connectionRules = {
  AUDIO_OUT: ['AUDIO_IN'],           // Audio → Audio only
  CV_OUT: ['CV_IN', 'AUDIO_IN'],     // CV → CV or CV modulating Audio
  GATE_OUT: ['GATE_IN'],             // Gate → Gate only
};
// Validation logic
function validateConnection(source: PortType, target: PortType): boolean {
  return connectionRules[source]?.includes(target) ?? false;
}
3.4 Canvas Navigation
Action	Trigger	Behavior
Pan	Middle-mouse drag OR Space+drag	Move viewport
Zoom	Scroll wheel OR +/- keys	Scale 25%-400%, centered on cursor
Fit View	F key OR toolbar button	Fit all blocks with 50px padding
Minimap	Always visible (bottom-right)	Click to navigate, drag viewport
4. Inspector Panel Implementation
4.1 Panel Structure
┌─────────────────────────────────┐
│ ■ MODULE NAME           daisysp │  ← Header with class reference
├─────────────────────────────────┤
│ CONTROLS                        │
│ ┌─────┐ ┌─────┐ ┌─────┐        │
│ │ ◯── │ │ ◯── │ │ ◯── │        │  ← Green: User controls (dials)
│ │Freq │ │ Amp │ │ PW  │        │
│ └─────┘ └─────┘ └─────┘        │
├─────────────────────────────────┤
│ CV INPUTS                       │
│ ○ FREQ_CV  ○ AMP_CV            │  ← Orange: CV modulation targets
├─────────────────────────────────┤
│ PORTS                           │
│ ● IN   Audio input              │
│ ● OUT  Audio output             │
├─────────────────────────────────┤
│ DESCRIPTION                     │
│ Band-limited oscillator with    │
│ multiple waveforms...           │
└─────────────────────────────────┘
4.2 Control Components
// DialControl - for continuous parameters
interface DialControlProps {
  value: number;
  min: number;
  max: number;
  curve: 'linear' | 'logarithmic' | 'exponential';
  unit: string;
  label: string;
  color: string;
  onChange: (value: number) => void;
}
// DropdownControl - for enum parameters
interface DropdownControlProps {
  value: string;
  options: { label: string; value: string }[];
  label: string;
  onChange: (value: string) => void;
}
5. Canvas Mode Block Distillation
5.1 Condensed vs Expanded View
Element	Canvas (Condensed)	Inspector (Expanded)
Name	Header bar only	Full header + class name
Parameters	Top 2 values inline	All controls with dials
Ports	Circles on edges	List with descriptions
CV Inputs	Hidden	Separate section
Description	Tooltip on hover	Full text section
5.2 Canvas Block Visual Structure
┌────────────────────────────┐
│ OSCILLATOR          [icon] │  ← 24px header, category color
├────────────────────────────┤
│ daisysp::Oscillator        │  ← 9px monospace, muted
│ Freq: 440.0 Hz             │  ← Inline param values
│ Amp:  0.50                 │
○────────────────────────────●  ← Ports: left=in, right=out
└────────────────────────────┘
   140px width, variable height
6. Styling Specifications
6.1 Color Palette (Exact Values)
/* Background Layers */
--bg-deep:           #0a0e14;  /* Deepest background */
--bg-primary:        #0d1117;  /* Main canvas */
--bg-elevated:       #161b22;  /* Panels, cards */
--bg-surface:        #1a2028;  /* Interactive surfaces */
/* Audio Signal (Blue) */
--audio-primary:     #58a6ff;  /* Primary accent */
--audio-secondary:   #388bfd;  /* Secondary */
--audio-block-bg:    #1a3a5c;  /* Block background */
--audio-block-border:#264b6e;  /* Block border */
/* Control Signal (Orange) */
--control-primary:   #f0883e;  /* Primary */
--control-secondary: #d18616;  /* Secondary */
--control-block-bg:  #3d2a1a;  /* Block background */
--control-block-border:#5c3d1f;/* Block border */
/* User Controls (Green) */
--user-primary:      #3fb950;  /* Accent green */
--user-block-bg:     #1a3d2a;
--user-block-border: #2a5c3d;
/* Text */
--text-primary:      #f0f6fc;  /* Primary text */
--text-secondary:    #8b949e;  /* Secondary */
--text-muted:        #484f58;  /* Muted/disabled */
/* Status */
--status-error:      #f85149;
--status-warning:    #d29922;
--status-success:    #3fb950;
6.2 Typography
/* Font Stack */
--font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'SF Mono', 'Fira Code', 'Consolas', monospace;
/* Scale */
--text-xs:   10px;  /* Labels, muted text */
--text-sm:   11px;  /* Secondary content */
--text-base: 12px;  /* Body text */
--text-md:   13px;  /* Emphasis */
--text-lg:   14px;  /* Headers */
--text-xl:   16px;  /* Titles */
/* Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
6.3 Spacing System
/* Base unit: 4px */
--space-1:  4px;
--space-2:  8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
/* Component-specific */
--panel-padding: 16px;
--block-padding: 8px;
--grid-snap: 16px;
--port-spacing: 16px;
6.4 Connection Wire Styles
/* Audio connections */
.connection-audio {
  stroke: var(--audio-primary);
  stroke-width: 2px;
  stroke-dasharray: none;
}
/* CV connections */
.connection-cv {
  stroke: var(--control-primary);
  stroke-width: 2px;
  stroke-dasharray: 6, 3;
}
/* Gate connections */
.connection-gate {
  stroke: var(--control-primary);
  stroke-width: 1.5px;
  stroke-dasharray: 2, 2;
}
7. State Management Architecture
7.1 Store Structure (Zustand)
// src/stores/patchStore.ts
interface PatchState {
  // Canvas State
  blocks: BlockInstance[];
  connections: Connection[];
  selectedIds: Set<string>;
  
  // Metadata
  metadata: PatchMetadata;
  
  // History
  past: PatchState[];
  future: PatchState[];
  
  // Actions
  addBlock: (defId: string, position: Position) => string;
  removeBlocks: (ids: string[]) => void;
  updateBlockPosition: (id: string, position: Position) => void;
  updateParameter: (blockId: string, paramId: string, value: any) => void;
  addConnection: (conn: Omit<Connection, 'id'>) => void;
  removeConnection: (id: string) => void;
  setSelection: (ids: string[]) => void;
  
  // History
  undo: () => void;
  redo: () => void;
  
  // Persistence
  loadPatch: (patch: PatchGraph) => void;
  exportPatch: () => PatchGraph;
  clearPatch: () => void;
}
// src/stores/uiStore.ts
interface UIState {
  // Panel visibility
  showMinimap: boolean;
  showInspector: boolean;
  showPalette: boolean;
  
  // Canvas
  zoom: number;
  panOffset: Position;
  
  // Modals
  activeModal: 'export' | 'examples' | 'confirm' | null;
  
  // Actions
  togglePanel: (panel: 'minimap' | 'inspector' | 'palette') => void;
  setZoom: (zoom: number) => void;
  setPan: (offset: Position) => void;
  openModal: (modal: string) => void;
  closeModal: () => void;
}
7.2 Undo/Redo Middleware
const undoMiddleware = (config) => (set, get, api) =>
  config(
    (args) => {
      const currentState = get();
      set({
        ...args,
        past: [...currentState.past, currentState],
        future: [],
      });
    },
    get,
    api
  );
8. Accessibility Compliance (WCAG 2.1 AA)
8.1 Keyboard Navigation
Context	Key	Action
Canvas	Tab	Cycle through blocks
Canvas	Arrow keys	Move selection 16px
Canvas	Delete	Delete selected
Canvas	Ctrl+A	Select all
Canvas	Ctrl+Z/Y	Undo/Redo
Inspector	Tab	Cycle controls
Inspector	Arrow Up/Down	Adjust dial ±1%
Global	Escape	Deselect / Close modal
8.2 Screen Reader Support
// Block announcements
<div role="application" aria-label="Canvas with 5 blocks and 4 connections">
  <div role="group" aria-label="OSCILLATOR block, selected">
    <span aria-live="polite">Frequency: 440 Hz</span>
  </div>
</div>
8.3 Color Contrast
All text meets WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large text).

9. Animation Specifications
9.1 Timing Functions
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
--spring: cubic-bezier(0.34, 1.56, 0.64, 1);
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 400ms;
9.2 Animation Catalog
Element	Trigger	Animation
Block add	Drop on canvas	Scale 0→1, 150ms spring
Block delete	Delete key	Fade + scale out, 150ms
Selection	Click	Border color transition, 100ms
Connection	Drag complete	Draw along path, 200ms
Panel toggle	Button click	Slide + fade, 250ms ease-out
Dial change	User input	Value indicator, 100ms
10. Testing Strategy
10.1 Existing Test Infrastructure
From dvpe/tests/:

unit/ - Vitest unit tests
integration/ - Integration tests
e2e/ - End-to-end tests
10.2 Test Commands
# Unit tests
npm run test
# With coverage
npm run test -- --coverage
# E2E tests (if configured)
npm run test:e2e
10.3 Test Coverage Requirements
Area	Coverage Target	Test Type
Block definitions	100%	Unit
Graph analyzer	100%	Unit
Connection validation	100%	Unit
Store actions	90%	Unit
Canvas operations	80%	Integration
Full workflow	Key paths	E2E
10.4 Visual Regression
# Snapshot tests for components
npm run test -- --update-snapshots
11. Implementation Phases
Phase 1: Foundation (Exists - Enhance)
 Project setup with Vite + React + TypeScript
 Tailwind CSS configuration
 Basic type system
 Complete color palette implementation
 Typography system refinement
Phase 2: Core Components
 BlockNode component with all visual states
 ConnectionEdge with type differentiation
 InspectorPanel with all control types
 BlockPalette with search and categories
Phase 3: Canvas Functionality
 Block drag-drop from palette
 Multi-selection (shift-click, marquee)
 Connection creation with validation
 Undo/redo with history
Phase 4: Polish & Accessibility
 Keyboard navigation
 Screen reader support
 Animation implementation
 Responsive breakpoints
Phase 5: Integration
 Example patch loading
 Export C++ generation
 State persistence
Verification Plan
Automated Tests
Unit Tests (existing infrastructure):

cd c:\Users\denko\Gemini\Antigravity\DVPE_Daisy-Visual-Programming-Environment\dvpe
npm test
Build Verification:

npm run build
# Expect: No TypeScript errors, successful bundle
Lint Check:

npm run lint
Manual Verification
Visual Review: Run npm run dev, verify color palette matches specification
Canvas Operations: Test drag-drop, connections, selection
Inspector Sync: Verify parameter changes reflect on canvas blocks
Keyboard Navigation: Tab through blocks, use arrow keys
User Review Required
IMPORTANT

This plan documents the GUI architecture and specifications. Please review:

Component hierarchy matches your vision
Color palette values are correct
Block categories and definitions are complete
Testing approach is acceptable
Proceed to EXECUTION mode upon approval.