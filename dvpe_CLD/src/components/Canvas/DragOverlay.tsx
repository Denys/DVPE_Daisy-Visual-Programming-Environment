import React from 'react';
import { useUIStore } from '@/stores';

export const DragOverlay: React.FC = () => {
    const draggingBlockId = useUIStore((state) => state.draggingBlockId);
    const setDraggingBlock = useUIStore((state) => state.setDraggingBlock);

    // Debug logging
    React.useEffect(() => {
        console.log('DragOverlay state:', { draggingBlockId });
    }, [draggingBlockId]);

    // Global dragend listener to catch drag limits/cancellation and clear state
    React.useEffect(() => {
        if (!draggingBlockId) return;

        const handleDragEnd = (_e: DragEvent) => {
            // Always clear state on drag end
            console.log('DragOverlay: DragEnd detected - clearing state');
            // Small timeout to ensure drop handler in Canvas has priority if needed
            // (though Canvas handler is synchronous so it should run first anyway)
            setTimeout(() => {
                setDraggingBlock(null);
            }, 50);
        };

        window.addEventListener('dragend', handleDragEnd, false);
        return () => {
            window.removeEventListener('dragend', handleDragEnd, false);
        };
    }, [draggingBlockId, setDraggingBlock]);


    // Scoped Overlay (No Portal)
    // We use pointer-events-none to let the event fall through to the Canvas below
    return (
        <div
            className={`absolute inset-0 z-50 transition-all duration-200 pointer-events-none
                ${draggingBlockId ? 'visible opacity-100' : 'invisible opacity-0'}
            `}
        >
            <div className="absolute inset-0 bg-primary/5 backdrop-blur-[1px] border-2 border-primary/20 m-2 rounded-xl flex items-center justify-center">
                <div className="bg-background/90 backdrop-blur-md px-6 py-3 rounded-full border border-primary/30 shadow-2xl flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <p className="text-sm font-medium text-primary">Drop to Add Block</p>
                </div>
            </div>
        </div>
    );
};
