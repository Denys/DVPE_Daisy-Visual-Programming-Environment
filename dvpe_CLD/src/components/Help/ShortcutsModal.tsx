import React from 'react';
import { Keyboard, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutEntry {
  key: string;
  description: string;
}

const shortcutEntries: ShortcutEntry[] = [
  { key: 'Ctrl/Cmd + N', description: 'New patch' },
  { key: 'Ctrl/Cmd + O', description: 'Open patch' },
  { key: 'Ctrl/Cmd + S', description: 'Save patch' },
  { key: 'Ctrl/Cmd + U', description: 'Toggle block UI designer' },
  { key: 'Double-click', description: 'Inspect selected block' },
  { key: 'Ctrl/Cmd + Double-click', description: 'Inspect custom block internals' },
  { key: 'Delete / Backspace', description: 'Delete selection' },
  { key: 'Ctrl/Cmd + Z', description: 'Undo' },
  { key: 'Ctrl/Cmd + Shift + Z / Ctrl/Cmd + Y', description: 'Redo' },
  { key: 'Ctrl + Drag', description: 'Box select in canvas' },
  { key: 'Escape', description: 'Clear selection and inspector focus' },
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div
        className={cn(
          'bg-surface-secondary rounded-lg border border-border',
          'w-[92vw] max-w-3xl max-h-[82vh] flex flex-col'
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-text-secondary" />
            <h3 className="text-lg font-semibold text-text-primary">Keyboard & Mouse Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-surface-tertiary text-text-tertiary hover:text-text-primary"
            aria-label="Close shortcuts"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-[minmax(180px,260px)_1fr] gap-x-4 gap-y-2">
            {shortcutEntries.map((entry) => (
              <React.Fragment key={`${entry.key}-${entry.description}`}>
                <div className="text-xs md:text-sm">
                  <kbd className="inline-block rounded bg-surface-primary border border-border px-2 py-1 text-text-primary font-mono">
                    {entry.key}
                  </kbd>
                </div>
                <div className="text-xs md:text-sm text-text-secondary py-1">{entry.description}</div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

