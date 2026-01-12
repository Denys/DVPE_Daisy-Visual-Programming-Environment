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
import Canvas from '@/components/Canvas/Canvas';
import ModuleLibrary from '@/components/Library/ModuleLibrary';
import Inspector from '@/components/Inspector/Inspector';

// ============================================================================
// TITLEBAR COMPONENT (for Tauri frameless window)
// ============================================================================

const TitleBar: React.FC = () => {
  const isDirty = usePatchStore((state) => state.isDirty);
  const metadata = usePatchStore((state) => state.metadata);
  const blocks = usePatchStore((state) => state.blocks);
  const connections = usePatchStore((state) => state.connections);
  const [showCodePreview, setShowCodePreview] = React.useState(false);
  const [generatedCode, setGeneratedCode] = React.useState<{ mainCpp: string; makefile: string; errors: string[] } | null>(null);

  const handleExport = async () => {
    // Dynamic import to avoid circular dependencies
    const { previewCode } = await import('@/codegen');

    // Build patch graph from current state
    const patchGraph = {
      blocks,
      connections,
      metadata: {
        name: metadata.name,
        blockSize: 48,
        sampleRate: 48000,
      },
    };

    const result = previewCode(patchGraph);
    setGeneratedCode(result);
    setShowCodePreview(true);
  };

  const handleDownload = async () => {
    if (!generatedCode) return;

    // Check if running in Tauri
    const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

    if (isTauri) {
      try {
        // Dynamic import Tauri APIs
        const { save } = await import('@tauri-apps/api/dialog');
        const { writeTextFile } = await import('@tauri-apps/api/fs');

        // Save main.cpp with native dialog
        const cppPath = await save({
          title: 'Save C++ Code',
          defaultPath: 'main.cpp',
          filters: [{ name: 'C++ Source', extensions: ['cpp'] }],
        });

        if (cppPath) {
          await writeTextFile(cppPath, generatedCode.mainCpp);

          // Also save Makefile in same directory
          const dir = cppPath.substring(0, cppPath.lastIndexOf('\\') || cppPath.lastIndexOf('/'));
          const makefilePath = `${dir}/Makefile`;
          await writeTextFile(makefilePath, generatedCode.makefile);

          // Could show success toast here
          console.log('Files saved to:', dir);
        }
      } catch (err) {
        console.error('Tauri save error:', err);
        // Fallback to browser download
        downloadViaBrowser();
      }
    } else {
      downloadViaBrowser();
    }
  };

  const downloadViaBrowser = async () => {
    if (!generatedCode) return;

    try {
      const zip = new JSZip();
      zip.file("main.cpp", generatedCode.mainCpp);
      zip.file("Makefile", generatedCode.makefile);

      const content = await zip.generateAsync({
        type: "blob",
        mimeType: "application/zip"
      });

      // Create safe filename
      const safeName = (metadata.name || 'Untitled_Patch').replace(/[^a-z0-9]/gi, '_');

      // Use file-saver for reliable cross-browser downloads
      saveAs(content, `${safeName}.zip`);

      toast.success(`Exported ${safeName}.zip`);
    } catch (err) {
      console.error('Zip generation failed:', err);
      toast.error('Failed to generate zip file');
    }
  };

  return (
    <>
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
                    {generatedCode.errors.map((err, i) => (
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
    </>
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
      if ((e.ctrlKey || e.metaKey) && ['s', 'o', 'n', 'z', 'y'].includes(e.key)) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-surface-primary text-text-primary overflow-hidden">
      {/* Title Bar */}
      <TitleBar />

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
