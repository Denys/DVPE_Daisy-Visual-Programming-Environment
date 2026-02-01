import React from 'react';
import { HardwareConfiguration } from '@/types/hardware';

interface PeripheralConfigProps {
    config: HardwareConfiguration;
    onUpdate: (updates: Partial<HardwareConfiguration['peripherals']>) => void;
}

export const PeripheralConfig: React.FC<PeripheralConfigProps> = ({ config, onUpdate }) => {
    return (
        <div className="p-6">
            <h2 className="text-xl font-bold text-slate-100 mb-4">Peripheral Configuration</h2>
            <div className="space-y-4 max-w-lg">

                {/* External Codec */}
                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700">
                    <div>
                        <div className="font-medium text-slate-200">External Codec</div>
                        <div className="text-xs text-slate-400">Use external audio codec (e.g. PCM3060 on Patch)</div>
                    </div>
                    <input
                        type="checkbox"
                        checked={config.peripherals.useExternalCodec}
                        onChange={(e) => onUpdate({ useExternalCodec: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-yellow-500 focus:ring-yellow-500/50"
                    />
                </div>

                {/* SDRAM */}
                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700">
                    <div>
                        <div className="font-medium text-slate-200">SDRAM</div>
                        <div className="text-xs text-slate-400">Enable 64MB SDRAM (Required for large delays/loopers)</div>
                    </div>
                    <input
                        type="checkbox"
                        checked={config.peripherals.useSdram}
                        onChange={(e) => onUpdate({ useSdram: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-yellow-500 focus:ring-yellow-500/50"
                    />
                </div>

                {/* Block Size */}
                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700">
                    <div>
                        <div className="font-medium text-slate-200">Block Size</div>
                        <div className="text-xs text-slate-400">Audio buffer size (32-256 samples)</div>
                    </div>
                    <select
                        value={config.peripherals.audioBlockSize}
                        onChange={(e) => onUpdate({ audioBlockSize: parseInt(e.target.value) })}
                        className="bg-slate-900 border-slate-600 text-slate-200 text-sm rounded-md focus:ring-yellow-500 focus:border-yellow-500 block p-1.5"
                    >
                        <option value="4">4 (Ultra Low Latency)</option>
                        <option value="32">32 (Low Latency)</option>
                        <option value="48">48 (Standard)</option>
                        <option value="256">256 (Efficient)</option>
                    </select>
                </div>
            </div>
        </div>
    );
};
