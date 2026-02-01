/**
 * DVPE App Component
 * Main application shell with resizable panel layout
 */

import React, { useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Toaster, toast } from 'sonner';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import { cn } from '@/lib/utils';
import { useUIStore, usePatchStore } from '@/stores';
import { useBlockDesignerStore } from '@/stores/blockDesignerStore';
import Canvas from '@/components/Canvas/Canvas';
import ModuleLibrary from '@/components/Library/ModuleLibrary';
import Inspector from '@/components/Inspector/Inspector';
import { ArchitectureWindow } from '@/components/architecture/ArchitectureWindow';
import { BlockUIDesigner } from '@/components/BlockDesigner/BlockUIDesigner';

// ============================================================================
// TITLEBAR COMPONENT
// ============================================================================

interface TitleBarProps {
  isDirty: boolean;
  metadata: any;
  handleNew: () => void;
  handleOpen: () => void;
  handleSave: () => void;
  handleExport: () => void;
}

const TitleBar: React.FC<TitleBarProps> = ({
  isDirty,
  metadata,
  handleNew,
  handleOpen,
  handleSave,
  handleExport,
}) => {
  const openModal = useUIStore((state) => state.openModal);

  return (
    <div
      data-tauri-drag-region
      className={cn(
        'h-10 flex items-center justify-between px-3',
        'bg-surface-primary border-b border-border',
        'select-none'
      )}
    >
      {/* App title */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-text-primary">
          DVPE
        </span>
        <span className="text-xs text-text-tertiary">•</span>
        <span className="text-sm text-text-secondary truncate max-w-64">
          {metadata.name}
          {isDirty && <span className="text-cv-primary ml-1">●</span>}
        </span>
      </div>

      {/* File operations */}
      <div className="flex items-center gap-1.5 mr-auto ml-4">
        <button
          onClick={handleNew}
          title="New (Ctrl+N)"
          className={cn(
            'p-1.5 rounded hover:bg-surface-tertiary text-text-secondary transition-colors',
            'flex items-center gap-1'
          )}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          onClick={handleOpen}
          title="Open (Ctrl+O)"
          className={cn(
            'p-1.5 rounded hover:bg-surface-tertiary text-text-secondary transition-colors',
            'flex items-center gap-1'
          )}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9" />
          </svg>
        </button>
        <button
          onClick={handleSave}
          title="Save (Ctrl+S)"
          className={cn(
            'p-1.5 rounded hover:bg-surface-tertiary text-text-secondary transition-colors',
            'flex items-center gap-1'
          )}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
        </button>
        {/* Input handled by parent App component */}
      </div>

      {/* Hardware button */}
      <button
        onClick={() => openModal('architecture')}
        className={cn(
          'mr-2 px-3 py-1.5 rounded-md text-sm font-medium',
          'bg-surface-tertiary text-text-secondary',
          'hover:bg-surface-tertiary/80 transition-colors',
          'flex items-center gap-2'
        )}
      >
        Hardware
      </button>

      {/* Export button */}
      <button
        onClick={handleExport}
        className={cn(
          'px-3 py-1.5 rounded-md text-sm font-medium',
          'bg-audio-primary/20 text-audio-primary',
          'hover:bg-audio-primary/30 transition-colors',
          'flex items-center gap-2'
        )}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Export C++
      </button>
    </div>
  );
};

// ============================================================================
// STATUS BAR COMPONENT
// ============================================================================

const StatusBar: React.FC = () => {
  const blocks = usePatchStore((state) => state.blocks);
  const connections = usePatchStore((state) => state.connections);
  const selectedBlockIds = usePatchStore((state) => state.selectedBlockIds);
  const viewport = useUIStore((state) => state.viewport);

  return (
    <div
      className={cn(
        'h-6 flex items-center justify-between px-3',
        'bg-surface-primary border-t border-border',
        'text-xs text-text-tertiary'
      )}
    >
      {/* Left side - stats */}
      <div className="flex items-center gap-4">
        <span>
          {blocks.length} blocks
        </span>
        <span>
          {connections.length} connections
        </span>
        {selectedBlockIds.length > 0 && (
          <span className="text-audio-primary">
            {selectedBlockIds.length} selected
          </span>
        )}
      </div>

      {/* Right side - zoom */}
      <div className="flex items-center gap-4">
        <span>
          Zoom: {Math.round(viewport.zoom * 100)}%
        </span>
      </div>
    </div>
  );
};

// ============================================================================
// APP COMPONENT
// ============================================================================

const App: React.FC = () => {
  const theme = useUIStore((state) => state.theme);
  const panels = useUIStore((state) => state.panels);
  const activeModal = useUIStore((state) => state.activeModal);

  // Patch Store state
  const isDirty = usePatchStore((state) => state.isDirty);
  const metadata = usePatchStore((state) => state.metadata);
  const blocks = usePatchStore((state) => state.blocks);
  const connections = usePatchStore((state) => state.connections);
  const { newPatch, loadPatch, getPatch, markClean } = usePatchStore();

  // App-level state for file handling and exports
  const [showCodePreview, setShowCodePreview] = React.useState(false);
  const [showUIDesigner, setShowUIDesigner] = React.useState(false);
  const [generatedCode, setGeneratedCode] = React.useState<{ mainCpp: string; makefile: string; errors: string[] } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // File Handlers
  const handleNew = () => {
    if (isDirty) {
      if (!confirm('You have unsaved changes. Create a new patch anyway?')) {
        return;
      }
    }
    newPatch();
    toast.success('Created new patch');
  };

  const handleSave = async () => {
    const patch = getPatch();
    const project = { version: '1.0.0', patch };
    const json = JSON.stringify(project, null, 2);
    const fileName = `${(metadata.name || 'Untitled_Patch').replace(/[^a-z0-9]/gi, '_')}.dvpe`;

    const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

    if (isTauri) {
      try {
        const { save } = await import('@tauri-apps/api/dialog');
        const { writeTextFile } = await import('@tauri-apps/api/fs');
        const filePath = await save({
          title: 'Save Project',
          defaultPath: fileName,
          filters: [{ name: 'DVPE Project', extensions: ['dvpe'] }],
        });
        if (filePath) {
          await writeTextFile(filePath, json);
          markClean();
          toast.success('Project saved successfully');
        }
      } catch (err) {
        console.error('Tauri save error:', err);
        fallbackSave(json, fileName);
      }
    } else {
      fallbackSave(json, fileName);
    }
  };

  const fallbackSave = (json: string, fileName: string) => {
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, fileName);
    markClean();
    toast.success(`Project saved as ${fileName}`);
  };

  const handleOpen = async () => {
    const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;
    if (isTauri) {
      try {
        const { open } = await import('@tauri-apps/api/dialog');
        const { readTextFile } = await import('@tauri-apps/api/fs');
        const selected = await open({
          multiple: false,
          filters: [{ name: 'DVPE Project', extensions: ['dvpe', 'json'] }],
        });
        if (selected && typeof selected === 'string') {
          const contents = await readTextFile(selected);
          processLoadedPatch(contents);
        }
      } catch (err) {
        console.error('Tauri open error:', err);
        fileInputRef.current?.click();
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const processLoadedPatch = (json: string) => {
    try {
      const data = JSON.parse(json);
      if (!data.patch || !data.patch.blocks) {
        throw new Error('Invalid project file format');
      }
      loadPatch(data.patch);
      toast.success('Project loaded successfully');
    } catch (err) {
      console.error('Failed to parse project file:', err);
      toast.error('Failed to load project: Invalid file format');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const contents = event.target?.result;
      if (typeof contents === 'string') {
        processLoadedPatch(contents);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Export Handlers
  const handleExport = async () => {
    const { previewCode } = await import('@/codegen');
    const patchGraph = {
      blocks,
      connections,
      metadata: {
        name: metadata.name,
        blockSize: metadata.blockSize || 48,
        sampleRate: metadata.sampleRate || 48000,
      },
    };
    const result = previewCode(patchGraph);
    setGeneratedCode(result);
    setShowCodePreview(true);
  };

  const handleDownload = async () => {
    if (!generatedCode) return;

    //Ask user if they want to save the diagram first
    const shouldSaveDiagram = window.confirm(
      'Do you want to save the block diagram?\n\n' +
      'YES: Save diagram and use its name for C++ project\n' +
      'NO: Use "default_project" as project name'
    );

    let projectName = 'default_project';

    if (shouldSaveDiagram) {
      // Trigger save dialog and wait for user to complete it
      await handleSave();
      // Use the metadata name (sanitized for filesystem)
      projectName = (metadata.name || 'Untitled_Patch').replace(/[^a-z0-9]/gi, '_');
    }

    const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;
    if (isTauri) {
      try {
        const { save } = await import('@tauri-apps/api/dialog');
        const { writeTextFile } = await import('@tauri-apps/api/fs');
        const cppPath = await save({
          title: 'Save C++ Code',
          defaultPath: `${projectName}.cpp`,
          filters: [{ name: 'C++ Source', extensions: ['cpp'] }],
        });
        if (cppPath) {
          await writeTextFile(cppPath, generatedCode.mainCpp);
          const dir = cppPath.substring(0, cppPath.lastIndexOf('\\') || cppPath.lastIndexOf('/'));
          const makefilePath = `${dir}/Makefile`;
          await writeTextFile(makefilePath, generatedCode.makefile);
          toast.success('C++ project saved');
        }
      } catch (err) {
        console.error('Tauri save error:', err);
        downloadViaBrowser(projectName);
      }
    } else {
      downloadViaBrowser(projectName);
    }
  };

  const downloadViaBrowser = async (projectName: string = 'default_project') => {
    if (!generatedCode) return;
    try {
      // Update code with project name
      const updatedCpp = generatedCode.mainCpp.replace(/\/\/ main\.cpp/, `// ${projectName}.cpp`);
      const updatedMakefile = generatedCode.makefile
        .replace(/TARGET = [^\s]+/, `TARGET = ${projectName}`)
        .replace(/CPP_SOURCES = [^\s]+/, `CPP_SOURCES = ${projectName}.cpp`);

      const zip = new JSZip();
      zip.file(`${projectName}.cpp`, updatedCpp);
      zip.file("Makefile", updatedMakefile);
      const content = await zip.generateAsync({ type: "blob", mimeType: "application/zip" });
      saveAs(content, `${projectName}.zip`);
      toast.success(`Exported ${projectName}.zip`);
    } catch (err) {
      console.error('Zip generation failed:', err);
      toast.error('Failed to generate zip file');
    }
  };

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  // Handle Tauri menu events
  useEffect(() => {
    // Check if running in Tauri
    const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;
    if (!isTauri) return;

    let unlisten: (() => void) | undefined;

    const setupMenuListener = async () => {
      try {
        const { listen } = await import('@tauri-apps/api/event');
        const { invoke } = await import('@tauri-apps/api/tauri');
        const { loadPatch, newPatch } = usePatchStore.getState();

        unlisten = await listen<string>('menu-event', async (event) => {
          const menuId = event.payload;
          console.log('Menu event:', menuId);

          switch (menuId) {
            case 'new':
              newPatch();
              break;
            case 'open':
              // We'll handle 'open' similar to handleOpen
              try {
                const { open } = await import('@tauri-apps/api/dialog');
                const { readTextFile } = await import('@tauri-apps/api/fs');
                const selected = await open({
                  multiple: false,
                  filters: [{ name: 'DVPE Project', extensions: ['dvpe', 'json'] }],
                });
                if (selected && typeof selected === 'string') {
                  const contents = await readTextFile(selected);
                  processLoadedPatch(contents);
                }
              } catch (err) {
                console.error('Tauri menu open error:', err);
              }
              break;
            case 'save':
              // Direct save logic here or call handleSave (but handleSave is inside TitleBar)
              // For robustness, we might want to expose save/load globally or put them in store
              // For now, let's replicate the logic or move it to store later if needed
              try {
                const { save } = await import('@tauri-apps/api/dialog');
                const { writeTextFile } = await import('@tauri-apps/api/fs');
                const patch = usePatchStore.getState().getPatch();
                const metadata = usePatchStore.getState().metadata;
                const project = { version: '1.0.0', patch };
                const fileName = `${(metadata.name || 'Untitled_Patch').replace(/[^a-z0-9]/gi, '_')}.dvpe`;

                const filePath = await save({
                  title: 'Save Project',
                  defaultPath: fileName,
                  filters: [{ name: 'DVPE Project', extensions: ['dvpe'] }],
                });
                if (filePath) {
                  await writeTextFile(filePath, JSON.stringify(project, null, 2));
                  usePatchStore.getState().markClean();
                  toast.success('Project saved');
                }
              } catch (err) {
                console.error('Tauri menu save error:', err);
              }
              break;
            case 'example_basic_osc':
              try {
                const project = await invoke<{
                  version: string;
                  patch: {
                    metadata: any;
                    blocks: any[];
                    connections: any[];
                  };
                }>('load_example', { exampleName: 'basic_oscillator' });
                loadPatch({
                  metadata: {
                    name: project.patch.metadata.name || 'Basic Oscillator',
                    author: project.patch.metadata.author || '',
                    description: project.patch.metadata.description || '',
                    created: project.patch.metadata.created || new Date().toISOString(),
                    modified: project.patch.metadata.modified || new Date().toISOString(),
                    version: project.patch.metadata.version || '1.0.0',
                    targetHardware: project.patch.metadata.target_hardware || 'seed',
                    sampleRate: project.patch.metadata.sample_rate || 48000,
                    blockSize: project.patch.metadata.block_size || 48,
                  },
                  blocks: project.patch.blocks.map((b: any) => ({
                    id: b.id,
                    definitionId: b.definition_id,
                    position: b.position,
                    parameterValues: b.parameter_values || {},
                    label: b.label,
                  })),
                  connections: project.patch.connections.map((c: any) => ({
                    id: c.id,
                    sourceBlockId: c.source_block_id,
                    sourcePortId: c.source_port_id,
                    targetBlockId: c.target_block_id,
                    targetPortId: c.target_port_id,
                    type: c.connection_type as 'audio' | 'cv' | 'trigger',
                  })),
                });
              } catch (err) {
                console.error('Failed to load example:', err);
              }
              break;
            case 'example_subtractive':
              try {
                const project = await invoke<any>('load_example', { exampleName: 'subtractive_synth' });
                loadPatch({
                  metadata: {
                    name: project.patch.metadata.name || 'Subtractive Synth',
                    author: project.patch.metadata.author || '',
                    description: project.patch.metadata.description || '',
                    created: project.patch.metadata.created || new Date().toISOString(),
                    modified: project.patch.metadata.modified || new Date().toISOString(),
                    version: project.patch.metadata.version || '1.0.0',
                    targetHardware: project.patch.metadata.target_hardware || 'seed',
                    sampleRate: project.patch.metadata.sample_rate || 48000,
                    blockSize: project.patch.metadata.block_size || 48,
                  },
                  blocks: project.patch.blocks.map((b: any) => ({
                    id: b.id,
                    definitionId: b.definition_id,
                    position: b.position,
                    parameterValues: b.parameter_values || {},
                    label: b.label,
                  })),
                  connections: project.patch.connections.map((c: any) => ({
                    id: c.id,
                    sourceBlockId: c.source_block_id,
                    sourcePortId: c.source_port_id,
                    targetBlockId: c.target_block_id,
                    targetPortId: c.target_port_id,
                    type: c.connection_type as 'audio' | 'cv' | 'trigger',
                  })),
                });
              } catch (err) {
                console.error('Failed to load example:', err);
              }
              break;
            case 'example_dual_voice':
              try {
                const project = await invoke<any>('load_example', { exampleName: 'dual_voice_synth' });
                loadPatch({
                  metadata: {
                    name: project.patch.metadata.name || 'Dual Voice Synth',
                    author: project.patch.metadata.author || '',
                    description: project.patch.metadata.description || '',
                    created: project.patch.metadata.created || new Date().toISOString(),
                    modified: project.patch.metadata.modified || new Date().toISOString(),
                    version: project.patch.metadata.version || '1.0.0',
                    targetHardware: project.patch.metadata.target_hardware || 'seed',
                    sampleRate: project.patch.metadata.sample_rate || 48000,
                    blockSize: project.patch.metadata.block_size || 48,
                  },
                  blocks: project.patch.blocks.map((b: any) => ({
                    id: b.id,
                    definitionId: b.definition_id,
                    position: b.position,
                    parameterValues: b.parameter_values || {},
                    label: b.label,
                  })),
                  connections: project.patch.connections.map((c: any) => ({
                    id: c.id,
                    sourceBlockId: c.source_block_id,
                    sourcePortId: c.source_port_id,
                    targetBlockId: c.target_block_id,
                    targetPortId: c.target_port_id,
                    type: c.connection_type as 'audio' | 'cv' | 'trigger',
                  })),
                });
              } catch (err) {
                console.error('Failed to load example:', err);
              }
              break;
            case 'example_effects':
              try {
                const project = await invoke<any>('load_example', { exampleName: 'effects_chain' });
                loadPatch({
                  metadata: {
                    name: project.patch.metadata.name || 'Effects Chain',
                    author: project.patch.metadata.author || '',
                    description: project.patch.metadata.description || '',
                    created: project.patch.metadata.created || new Date().toISOString(),
                    modified: project.patch.metadata.modified || new Date().toISOString(),
                    version: project.patch.metadata.version || '1.0.0',
                    targetHardware: project.patch.metadata.target_hardware || 'seed',
                    sampleRate: project.patch.metadata.sample_rate || 48000,
                    blockSize: project.patch.metadata.block_size || 48,
                  },
                  blocks: project.patch.blocks.map((b: any) => ({
                    id: b.id,
                    definitionId: b.definition_id,
                    position: b.position,
                    parameterValues: b.parameter_values || {},
                    label: b.label,
                  })),
                  connections: project.patch.connections.map((c: any) => ({
                    id: c.id,
                    sourceBlockId: c.source_block_id,
                    sourcePortId: c.source_port_id,
                    targetBlockId: c.target_block_id,
                    targetPortId: c.target_port_id,
                    type: c.connection_type as 'audio' | 'cv' | 'trigger',
                  })),
                });
              } catch (err) {
                console.error('Failed to load example:', err);
              }
              break;
          }
        });
      } catch (err) {
        console.error('Failed to setup menu listener:', err);
      }
    };

    setupMenuListener();

    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  // Handle keyboard shortcuts globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser defaults for our shortcuts
      if ((e.ctrlKey || e.metaKey)) {
        if (e.key.toLowerCase() === 's') {
          e.preventDefault();
          handleSave();
        } else if (e.key.toLowerCase() === 'o') {
          e.preventDefault();
          handleOpen();
        } else if (e.key.toLowerCase() === 'n') {
          e.preventDefault();
          handleNew();
        } else if (e.key.toLowerCase() === 'u') {
          e.preventDefault();
          setShowUIDesigner(prev => !prev);
        }
      }

      if ((e.ctrlKey || e.metaKey) && ['z', 'y'].includes(e.key.toLowerCase())) {
        // These are likely handled by the store or canvas, 
        // but we prevent default just in case
        // e.preventDefault(); 
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDirty, metadata, handleSave, handleOpen, handleNew]);

  return (
    <div className="h-screen w-screen flex flex-col bg-surface-primary text-text-primary overflow-hidden">
      {/* Title Bar */}
      <TitleBar
        isDirty={isDirty}
        metadata={metadata}
        handleNew={handleNew}
        handleOpen={handleOpen}
        handleSave={handleSave}
        handleExport={handleExport}
      />

      {/* Main Content with Resizable Panels */}
      <PanelGroup direction="horizontal" className="flex-1">
        {/* Module Library (Left Panel) */}
        {panels.library?.visible && (
          <>
            <Panel defaultSize={15} minSize={10} maxSize={30} className="relative">
              <ModuleLibrary />
            </Panel>
            <PanelResizeHandle className="w-1 bg-border hover:bg-audio-primary/50 transition-colors cursor-col-resize" />
          </>
        )}

        {/* Canvas (Center) */}
        <Panel defaultSize={55} minSize={30}>
          <main className="w-full h-full relative overflow-hidden">
            <Canvas />
          </main>
        </Panel>

        {/* Inspector (Right Panel) */}
        {panels.inspector?.visible && (
          <>
            <PanelResizeHandle className="w-1 bg-border hover:bg-audio-primary/50 transition-colors cursor-col-resize" />
            <Panel defaultSize={20} minSize={15} maxSize={40} className="relative">
              <Inspector />
            </Panel>
          </>
        )}
      </PanelGroup>

      {/* Status Bar */}
      <StatusBar />

      {/* Hidden file input for browser-based loading */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".dvpe,application/json"
        className="hidden"
      />

      {/* Modals */}
      {activeModal === 'architecture' && <ArchitectureWindow />}

      {/* UI Designer Modal */}
      {showUIDesigner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-surface-secondary rounded-lg border border-border w-[95vw] h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border">
              <h3 className="text-lg font-semibold text-text-primary">Block UI Designer (Ctrl+U to close)</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // Access store directly to get current layout
                    const layout = useBlockDesignerStore.getState().elements;
                    const bindingCount = layout.filter(e => e.binding).length;
                    console.log('Saving UI Layout:', layout);
                    toast.success(`Layout saved with ${layout.length} elements (${bindingCount} bound)`);
                    setShowUIDesigner(false);
                  }}
                  className="px-3 py-1.5 rounded-md text-sm font-medium bg-audio-primary text-surface-primary hover:bg-audio-primary/80"
                >
                  Save & Close
                </button>
                <button
                  onClick={() => setShowUIDesigner(false)}
                  className="p-1.5 rounded hover:bg-surface-tertiary text-text-tertiary hover:text-text-primary"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <BlockUIDesigner
                blockId="test-block-1"
                blockName="Test Block"
                availableParameters={[
                  { blockId: 'osc1', blockName: 'Oscillator', parameterId: 'freq', parameterName: 'Frequency', cppSetter: 'SetFreq' },
                  { blockId: 'filter1', blockName: 'Filter', parameterId: 'cutoff', parameterName: 'Cutoff', cppSetter: 'SetCutoff' },
                  { blockId: 'vca1', blockName: 'VCA', parameterId: 'level', parameterName: 'Level', cppSetter: 'SetLevel' },
                ]}
                onSave={(layout) => {
                  console.log('UI Layout saved:', layout);
                  setShowUIDesigner(false);
                }}
                onCancel={() => setShowUIDesigner(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Code Preview Modal */}
      {showCodePreview && generatedCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-surface-secondary rounded-lg border border-border w-[80vw] max-w-4xl max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-lg font-semibold text-text-primary">Generated C++ Code</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 rounded-md text-sm font-medium bg-audio-primary text-surface-primary hover:bg-audio-primary/80"
                >
                  Download Files
                </button>
                <button
                  onClick={() => setShowCodePreview(false)}
                  className="p-1.5 rounded hover:bg-surface-tertiary text-text-tertiary hover:text-text-primary"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-4">
              {generatedCode.errors.length > 0 ? (
                <div className="bg-red-500/20 text-red-400 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Errors:</h4>
                  <ul className="list-disc list-inside">
                    {generatedCode.errors.map((err: any, i: number) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <pre className="bg-surface-primary rounded-lg p-4 text-sm font-mono text-text-secondary overflow-x-auto whitespace-pre">
                  {generatedCode.mainCpp}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <Toaster
        position="bottom-right"
        theme="dark"
        richColors
        closeButton
        toastOptions={{
          className: 'bg-surface-secondary border border-border',
        }}
      />
    </div>
  );
};

export default App;
