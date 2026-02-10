import React from 'react';
import { CircleHelp, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HelpMenuProps {
  onOpenShortcuts: () => void;
}

export const HelpMenu: React.FC<HelpMenuProps> = ({ onOpenShortcuts }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, []);

  return (
    <div ref={menuRef} className="relative mr-2">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'px-3 py-1.5 rounded-md text-sm font-medium',
          'bg-surface-tertiary text-text-secondary',
          'hover:bg-surface-tertiary/80 transition-colors',
          'flex items-center gap-2'
        )}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Help"
      >
        <CircleHelp className="w-4 h-4" />
        Help
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute right-0 mt-1 min-w-44 z-30',
            'rounded-md border border-border bg-surface-secondary shadow-xl'
          )}
          role="menu"
          aria-label="Help menu"
        >
          <button
            onClick={() => {
              onOpenShortcuts();
              setIsOpen(false);
            }}
            className={cn(
              'w-full px-3 py-2 text-left text-sm',
              'text-text-secondary hover:text-text-primary',
              'hover:bg-surface-tertiary transition-colors',
              'flex items-center gap-2'
            )}
            role="menuitem"
          >
            <Keyboard className="w-4 h-4" />
            Shortcuts
          </button>
        </div>
      )}
    </div>
  );
};

