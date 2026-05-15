/**
 * PolyVoiceBlanketNode Component
 * A canvas directive that scopes visible blocks as a polyphonic voice template.
 */

import React, { memo, useCallback } from 'react';
import { NodeProps, NodeResizer } from '@xyflow/react';
import { Boxes, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePatchStore } from '@/stores';
import { PolyVoiceBlanket } from '@/types';

export interface PolyVoiceBlanketNodeData extends Record<string, unknown> {
    blanket: PolyVoiceBlanket;
}

const PolyVoiceBlanketNode: React.FC<NodeProps> = ({ id, data, selected }) => {
    const removePolyVoiceBlanket = usePatchStore((state) => state.removePolyVoiceBlanket);
    const refreshPolyVoiceBlanketMembers = usePatchStore((state) => state.refreshPolyVoiceBlanketMembers);
    const blanket = (data as PolyVoiceBlanketNodeData)?.blanket;

    const handleDelete = useCallback((event: React.MouseEvent) => {
        event.stopPropagation();
        removePolyVoiceBlanket(id);
    }, [id, removePolyVoiceBlanket]);

    const handleRefresh = useCallback((event: React.MouseEvent) => {
        event.stopPropagation();
        refreshPolyVoiceBlanketMembers(id);
    }, [id, refreshPolyVoiceBlanketMembers]);

    return (
        <>
            <NodeResizer
                minWidth={180}
                minHeight={120}
                isVisible={selected}
                lineClassName="border-amber-400"
                handleClassName="w-2 h-2 bg-amber-400 rounded-sm"
            />

            <div
                className={cn(
                    'w-full h-full rounded-md border-2 border-dashed',
                    'bg-amber-500/5 backdrop-blur-[1px]',
                    selected ? 'border-amber-300 shadow-[0_0_0_1px_rgba(251,191,36,0.45)]' : 'border-amber-400/55'
                )}
            >
                <div className="flex items-center justify-between gap-2 px-2 py-1 bg-black/35 rounded-t-[4px]">
                    <div className="flex items-center gap-1.5 min-w-0 text-amber-200">
                        <Boxes className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[10px] font-semibold uppercase truncate">
                            {blanket?.label || 'Poly Voice'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            onClick={handleRefresh}
                            className="px-1.5 py-0.5 rounded bg-amber-400/15 text-[10px] text-amber-100 hover:bg-amber-400/25"
                            title="Refresh blanket members"
                            aria-label="Refresh blanket members"
                        >
                            {blanket?.memberBlockIds.length ?? 0}
                        </button>
                        <span className="px-1.5 py-0.5 rounded bg-amber-400/15 text-[10px] text-amber-100">
                            {blanket?.voiceCount ?? 8}V
                        </span>
                        {selected && (
                            <button
                                onClick={handleDelete}
                                className="w-4 h-4 rounded flex items-center justify-center bg-red-500/20 text-red-300 hover:bg-red-500/35"
                                aria-label="Delete poly voice blanket"
                                title="Delete poly voice blanket"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default memo(PolyVoiceBlanketNode);
