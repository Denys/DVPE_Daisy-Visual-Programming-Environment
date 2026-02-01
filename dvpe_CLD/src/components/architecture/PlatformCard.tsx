import React from 'react';
import { PlatformDefinition } from '@/types/hardware';
import { Check } from 'lucide-react';

interface PlatformCardProps {
    platform: PlatformDefinition;
    isSelected: boolean;
    onSelect: (id: PlatformDefinition['id']) => void;
}

export const PlatformCard: React.FC<PlatformCardProps> = ({
    platform,
    isSelected,
    onSelect,
}) => {
    return (
        <div
            onClick={() => onSelect(platform.id)}
            className={`
        relative flex flex-col items-center p-4 rounded-xl border-2 transition-all cursor-pointer group
        ${isSelected
                    ? 'border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/10'
                    : 'border-slate-700 bg-slate-800 hover:border-slate-500 hover:bg-slate-750'
                }
      `}
        >
            {/* Selection Indicator */}
            <div
                className={`
          absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center
          transition-colors duration-200
          ${isSelected ? 'bg-yellow-500 text-slate-900' : 'bg-slate-700 text-transparent'}
        `}
            >
                <Check size={14} strokeWidth={3} />
            </div>

            {/* Image Placeholder */}
            <div className="w-full aspect-video mb-4 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center border border-slate-700">
                <div className="text-slate-600 text-sm font-medium">
                    {/* We'll swap this for real images later */}
                    [Image: {platform.name}]
                </div>
            </div>

            {/* Info */}
            <div className="text-center">
                <h3 className="text-lg font-bold text-slate-100 mb-1">{platform.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-[200px]">
                    {platform.description}
                </p>
            </div>

            {/* Specs Badge */}
            <div className="mt-4 flex gap-2">
                {platform.standardControls.knobs > 0 && (
                    <span className="px-2 py-1 rounded bg-slate-700 text-xs text-slate-300">
                        {platform.standardControls.knobs} Knobs
                    </span>
                )}
                {platform.standardControls.audioIns > 0 && (
                    <span className="px-2 py-1 rounded bg-slate-700 text-xs text-slate-300">
                        {platform.standardControls.audioIns} In / {platform.standardControls.audioOuts} Out
                    </span>
                )}
            </div>
        </div>
    );
};
