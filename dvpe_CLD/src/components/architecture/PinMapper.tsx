import React from 'react';
import { HardwareConfiguration, PLATFORMS, PinDefinition } from '@/types/hardware';
import { AlertCircle, ArrowRight } from 'lucide-react';

interface PinMapperProps {
    config: HardwareConfiguration;
    onUpdateMapping: (logical: string, physical: string) => void;
}

// Helper to get available pins for a capability, excluding those already mapped to OTHER controls
const getAvailablePins = (
    allPins: PinDefinition[],
    capability: PinDefinition['capabilities'][0]
) => {
    // Pins that have the required capability
    return allPins.filter(p => p.capabilities.includes(capability));
};

export const PinMapper: React.FC<PinMapperProps> = ({ config, onUpdateMapping }) => {
    const platform = PLATFORMS[config.platform];

    // Logic to determine what controls to show
    // For Seed, we present a standardized list of potential controls
    const controls = React.useMemo(() => {
        if (platform.isFixed) return [];

        // Define standard set of mapable controls for Seed
        // In a real app, user might add/remove these dynamically. 
        // For MVP/Phase 10: We provide fixed slots.
        return [
            { id: 'knob_1', label: 'Knob 1', type: 'adc' },
            { id: 'knob_2', label: 'Knob 2', type: 'adc' },
            { id: 'knob_3', label: 'Knob 3', type: 'adc' },
            { id: 'knob_4', label: 'Knob 4', type: 'adc' },
            { id: 'gate_in_1', label: 'Gate In 1', type: 'gpio' },
            { id: 'gate_in_2', label: 'Gate In 2', type: 'gpio' },
            { id: 'led_1', label: 'LED 1', type: 'gpio' },
            { id: 'led_2', label: 'LED 2', type: 'gpio' },
            { id: 'switch_1', label: 'Switch 1', type: 'gpio' },
            { id: 'switch_2', label: 'Switch 2', type: 'gpio' },
            // Add more as needed
        ] as const;
    }, [platform]);

    if (platform.isFixed) {
        return (
            <div className="p-8 text-center text-slate-400">
                <p className="mb-4 text-lg">
                    The <strong className="text-white">{platform.name}</strong> has a fixed pinout.
                </p>
                <p className="max-w-md mx-auto">
                    All physical controls (Knobs, Buttons, LEDs) are automatically mapped to their standard resources. You don't need to configure pins manually.
                </p>

                {/* Visual aid/diagram could go here */}
                <div className="mt-8 p-4 bg-slate-800/50 rounded-lg inline-block text-left">
                    <h4 className="text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">Standard mapping</h4>
                    <ul className="text-sm space-y-1 text-slate-400">
                        {platform.standardControls.knobs > 0 && <li>• {platform.standardControls.knobs} Knobs</li>}
                        {platform.standardControls.switches > 0 && <li>• {platform.standardControls.switches} Switches/Buttons</li>}
                        {platform.standardControls.leds > 0 && <li>• {platform.standardControls.leds} LEDs</li>}
                        {platform.standardControls.cvIns > 0 && <li>• {platform.standardControls.cvIns} CV Inputs</li>}
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-100 mb-2">Pin Mapping</h2>
                <p className="text-slate-400">
                    Map logical controls to physical pins on the Daisy Seed.
                    Only mapped controls will generate hardware initialization code.
                </p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-1 gap-4 max-w-3xl">
                    {/* Group by type using simple filtering for now */}

                    {/* KNOBS */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider sticky top-0 bg-slate-900 py-2">Analog Controls (Knobs/CV)</h3>
                        {controls.filter(c => c.type === 'adc').map(ctrl => (
                            <MappingRow
                                key={ctrl.id}
                                control={ctrl}
                                config={config}
                                platformData={platform}
                                onUpdate={onUpdateMapping}
                            />
                        ))}
                    </div>

                    {/* DIGITAL */}
                    <div className="space-y-3 mt-6">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider sticky top-0 bg-slate-900 py-2">Digital Controls (Gates/Switches/LEDs)</h3>
                        {controls.filter(c => c.type === 'gpio').map(ctrl => (
                            <MappingRow
                                key={ctrl.id}
                                control={ctrl}
                                config={config}
                                platformData={platform}
                                onUpdate={onUpdateMapping}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-component for a single row
const MappingRow: React.FC<{
    control: { id: string, label: string, type: 'adc' | 'gpio' };
    config: HardwareConfiguration;
    platformData: any; // typed loosely for internal usage
    onUpdate: (log: string, phys: string) => void;
}> = ({ control, config, platformData, onUpdate }) => {

    const assignedPin = config.pinMapping[control.id] || '';
    const availablePins = getAvailablePins(platformData.pins, control.type);

    // Check if assigned pin is used elsewhere (conflict)
    const conflict = Object.entries(config.pinMapping).find(([k, v]) => k !== control.id && v === assignedPin && v !== '');

    return (
        <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
            <div className="flex items-center gap-3 w-1/3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs
                    ${control.type === 'adc' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}
                `}>
                    {control.type === 'adc' ? 'A' : 'D'}
                </div>
                <span className="font-medium text-slate-200">{control.label}</span>
            </div>

            <ArrowRight size={16} className="text-slate-600" />

            <div className="w-1/2 relative">
                <select
                    value={assignedPin}
                    onChange={(e) => onUpdate(control.id, e.target.value)}
                    className={`
                        w-full bg-slate-900 border text-sm rounded-lg block p-2.5
                        focus:ring-yellow-500 focus:border-yellow-500
                        ${conflict ? 'border-red-500 text-red-400' : 'border-slate-600 text-slate-200'}
                    `}
                >
                    <option value="">Unmapped</option>
                    {availablePins.map(pin => {
                        // Check if used elsewhere
                        const isUsed = Object.values(config.pinMapping).includes(pin.name) && config.pinMapping[control.id] !== pin.name;
                        return (
                            <option key={pin.pinNumber} value={pin.name} disabled={false}>
                                {pin.name} {isUsed ? '(Used)' : ''}
                            </option>
                        );
                    })}
                </select>

                {conflict && (
                    <div className="absolute top-1/2 -right-8 -translate-y-1/2 text-red-500" title={`Conflict with ${conflict[0]}`}>
                        <AlertCircle size={20} />
                    </div>
                )}
            </div>
        </div>
    );
}
