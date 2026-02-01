/**
 * BlockDesigner Components
 * Phase 13.2: Visual UI Builder
 */

// Day 1: Shell
export { BlockUIDesigner } from './BlockUIDesigner';
export { DesignerToolbar } from './DesignerToolbar';
export { DesignerStatusBar } from './DesignerStatusBar';

// Day 2: Library & Canvas
export { ElementLibraryPanel, type ElementDefinition, type ElementCategory } from './ElementLibraryPanel';
export { ElementThumbnail } from './ElementThumbnail';
export { DesignCanvas, type CanvasElement } from './DesignCanvas';
export { DraggableElement } from './DraggableElement';
export { TransformHandles } from './TransformHandles';

// Day 3: Inspector & Properties
export { InspectorPanel } from './InspectorPanel';
export { PropertyEditor } from './PropertyEditor';
export { BindingEditor } from './BindingEditor';

// Day 4: Element Renderers
export * from './elements';

// Day 5: Integration & Code Gen
export { useBlockDesigner } from './hooks';
export { PresetBrowser, createBuiltInPresets } from './PresetBrowser';
export { generateUICode, generateCompleteUIFunction } from './UICodeGenerator';

