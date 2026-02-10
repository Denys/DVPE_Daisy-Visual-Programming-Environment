import React from 'react';
import { useUIStore, usePatchStore } from '@/stores';
import { BlockRegistry } from '@/core/blocks/BlockRegistry';
import { cn } from '@/lib/utils';
import { CustomBlockDefinition } from '@/types/customBlock';

const isCustomBlockDefinition = (
  definition: unknown
): definition is CustomBlockDefinition => {
  return Boolean(
    definition &&
      typeof definition === 'object' &&
      (definition as Partial<CustomBlockDefinition>).isCustom === true
  );
};

export const CustomBlockInternalsModal: React.FC = () => {
  const activeModal = useUIStore((state) => state.activeModal);
  const modalData = useUIStore((state) => state.modalData);
  const closeModal = useUIStore((state) => state.closeModal);

  const blocks = usePatchStore((state) => state.blocks);

  if (activeModal !== 'custom-block-internals') {
    return null;
  }

  const blockId =
    modalData && typeof modalData === 'object' && modalData !== null
      ? (modalData as { blockId?: string }).blockId
      : undefined;

  const blockInstance = blockId ? blocks.find((block) => block.id === blockId) : undefined;
  const definition = blockInstance ? BlockRegistry.get(blockInstance.definitionId) : undefined;
  const customDefinition = isCustomBlockDefinition(definition) ? definition : undefined;

  const title = blockInstance
    ? blockInstance.label || definition?.displayName || 'Custom Block'
    : 'Custom Block';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div
        className={cn(
          'bg-surface-secondary rounded-lg border border-border',
          'w-[88vw] max-w-4xl max-h-[82vh] flex flex-col'
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Custom Block Internals</h3>
            <p className="text-xs text-text-tertiary mt-0.5">{title}</p>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded hover:bg-surface-tertiary text-text-tertiary hover:text-text-primary"
            aria-label="Close custom block internals"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3">
          {customDefinition ? (
            <>
              <div className="text-sm text-text-secondary">
                Ctrl/Cmd + Double-click opened this inspector view while preserving the existing double-click-to-inspect behavior.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-surface-primary border border-border rounded p-3">
                  <h4 className="text-sm font-semibold text-text-primary mb-2">Internal Patch Summary</h4>
                  <div className="text-xs text-text-secondary space-y-1">
                    <div>Blocks: {customDefinition.internalPatch.blocks.length}</div>
                    <div>Connections: {customDefinition.internalPatch.connections.length}</div>
                  </div>
                </div>
                <div className="bg-surface-primary border border-border rounded p-3">
                  <h4 className="text-sm font-semibold text-text-primary mb-2">Exposed Interface</h4>
                  <div className="text-xs text-text-secondary space-y-1">
                    <div>Exposed ports: {Object.keys(customDefinition.exposedPorts).length}</div>
                    <div>Exposed params: {Object.keys(customDefinition.exposedParameters).length}</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-sm text-red-400">
              This block is not a custom block or is unavailable. Select a custom block and use Ctrl/Cmd + Double-click.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

