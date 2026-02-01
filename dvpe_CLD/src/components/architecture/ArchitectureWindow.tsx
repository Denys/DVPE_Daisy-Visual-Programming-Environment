import React, { useState } from 'react';
import { X, Cpu, Settings, Grid } from 'lucide-react';
import { usePatchStore } from '@/stores/patchStore';
import { useUIStore } from '@/stores/uiStore';
import { PlatformSelector } from './PlatformSelector';
import { PinMapper } from './PinMapper';
import { PeripheralConfig } from './PeripheralConfig';
import { HardwareConfiguration } from '@/types/hardware';

type Tab = 'platform' | 'pins' | 'peripherals';

export const ArchitectureWindow: React.FC = () => {
    const { hardwareConfig, setHardwareConfig } = usePatchStore();
    const { closeModal } = useUIStore();
    const [activeTab, setActiveTab] = useState<Tab>('platform');

    const handleClose = () => {
        closeModal();
    };

    // We update the store directly. Undo is available if needed.
    const handleUpdateConfig = (updates: Partial<HardwareConfiguration>) => {
        setHardwareConfig(updates);
    };

    const handlePeripheralUpdate = (updates: Partial<HardwareConfiguration['peripherals']>) => {
        setHardwareConfig({
            peripherals: { ...hardwareConfig.peripherals, ...updates }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 w-[90vw] h-[85vh] max-w-5xl rounded-2xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/10 rounded-lg">
                            <Cpu className="text-yellow-500" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-100">Architecture Configuration</h1>
                            <p className="text-xs text-slate-500">Target Platform & Hardware Settings</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body - Sidebar + Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar / Tabs */}
                    <div className="w-64 bg-slate-850 p-4 border-r border-slate-800 flex flex-col gap-2">
                        <button
                            onClick={() => setActiveTab('platform')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'platform'
                                ? 'bg-yellow-500 text-slate-900'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                }`}
                        >
                            <Cpu size={18} />
                            Platform Selection
                        </button>
                        <button
                            onClick={() => setActiveTab('pins')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'pins'
                                ? 'bg-yellow-500 text-slate-900'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                }`}
                        >
                            <Grid size={18} />
                            Pin Mapping
                        </button>
                        <button
                            onClick={() => setActiveTab('peripherals')}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'peripherals'
                                ? 'bg-yellow-500 text-slate-900'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                }`}
                        >
                            <Settings size={18} />
                            Peripherals
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-auto bg-slate-900">
                        {activeTab === 'platform' && (
                            <PlatformSelector
                                selectedPlatform={hardwareConfig.platform}
                                onSelect={(platform) => handleUpdateConfig({ platform })}
                            />
                        )}
                        {activeTab === 'pins' && (
                            <PinMapper
                                config={hardwareConfig}
                                onUpdateMapping={(logicalPin, physicalPin) => {
                                    const newMapping = { ...hardwareConfig.pinMapping };
                                    if (physicalPin === '') {
                                        delete newMapping[logicalPin];
                                    } else {
                                        newMapping[logicalPin] = physicalPin;
                                    }
                                    setHardwareConfig({ pinMapping: newMapping });
                                }}
                            />
                        )}
                        {activeTab === 'peripherals' && (
                            <PeripheralConfig
                                config={hardwareConfig}
                                onUpdate={handlePeripheralUpdate}
                            />
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-850 flex justify-between items-center">
                    <div className="text-xs text-slate-500">
                        Changes are saved automatically.
                    </div>
                    <button
                        onClick={handleClose}
                        className="px-6 py-2 bg-slate-100 hover:bg-white text-slate-900 text-sm font-bold rounded-lg transition-colors shadow-lg shadow-slate-900/20"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};
