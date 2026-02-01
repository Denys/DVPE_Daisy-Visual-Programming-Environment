import React from 'react';
import { PLATFORMS, PlatformType } from '@/types/hardware';
import { PlatformCard } from './PlatformCard';

interface PlatformSelectorProps {
    selectedPlatform: PlatformType;
    onSelect: (platform: PlatformType) => void;
}

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({
    selectedPlatform,
    onSelect,
}) => {
    const platforms = Object.values(PLATFORMS);

    return (
        <div className="w-full h-full overflow-y-auto custom-scrollbar p-6">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-100 mb-2">Select Target Platform</h2>
                <p className="text-slate-400">
                    Choose the Electrosmith Daisy hardware platform for your project. This determines the available inputs, outputs, and pinning configuration.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {platforms.map((platform) => (
                    <PlatformCard
                        key={platform.id}
                        platform={platform}
                        isSelected={selectedPlatform === platform.id}
                        onSelect={onSelect}
                    />
                ))}
            </div>
        </div>
    );
};
