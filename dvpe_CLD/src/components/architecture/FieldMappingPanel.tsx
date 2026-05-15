import React from 'react';
import {
    FIELD_KEY_IDS,
    FIELD_KNOB_IDS,
    FIELD_MAPPING_LAYERS,
    FIELD_SWITCH_IDS,
    buildFieldMappingConflictErrors,
    listFieldKeyToggleTargets,
    listFieldKeyTargets,
    listFieldKnobTargets,
} from '@/core/fieldMapping';
import { BlockDefinition, BlockInstance, Connection, FieldControlMapping, FieldKeyOutputType, FieldMappingLayer } from '@/types';

interface FieldMappingPanelProps {
    mappings: FieldControlMapping[];
    blocks: BlockInstance[];
    blockDefs: Map<string, BlockDefinition>;
    connections: Connection[];
    onChange: (mappings: FieldControlMapping[]) => void;
}

export const FieldMappingPanel: React.FC<FieldMappingPanelProps> = ({
    mappings,
    blocks,
    blockDefs,
    connections,
    onChange,
}) => {
    const [viewMode, setViewMode] = React.useState<'matrix' | 'surface'>('matrix');
    const [selectedControl, setSelectedControl] = React.useState('K1');
    const [selectedLayer, setSelectedLayer] = React.useState<FieldMappingLayer>('normal');
    const [draftKeyModes, setDraftKeyModes] = React.useState<Record<string, FieldKeyOutputType>>({});
    const knobTargets = React.useMemo(() => listFieldKnobTargets(blocks, blockDefs), [blocks, blockDefs]);
    const keyTargets = React.useMemo(() => listFieldKeyTargets(blocks, blockDefs), [blocks, blockDefs]);
    const keyToggleTargets = React.useMemo(() => listFieldKeyToggleTargets(blocks, blockDefs), [blocks, blockDefs]);
    const conflictErrors = React.useMemo(
        () => buildFieldMappingConflictErrors(mappings, connections),
        [mappings, connections]
    );
    const connectedInputs = React.useMemo(
        () => new Set(connections.map((connection) => `${connection.targetBlockId}:${connection.targetPortId}`)),
        [connections]
    );

    const isKnobTargetUnavailable = (target: { blockId: string; parameterId: string }) =>
        connectedInputs.has(`${target.blockId}:${target.parameterId}_cv`);

    const isKeyTargetUnavailable = (target: { blockId: string; portId: string }) =>
        connectedInputs.has(`${target.blockId}:${target.portId}`);

    const getMapping = (controlId: string, layer: FieldMappingLayer) =>
        mappings.find((mapping) => mapping.controlId === controlId && mapping.layer === layer);

    const replaceMapping = (nextMapping: FieldControlMapping | null, controlId: string, layer: FieldMappingLayer) => {
        const remaining = mappings.filter((mapping) => !(mapping.controlId === controlId && mapping.layer === layer));
        onChange(nextMapping ? [...remaining, nextMapping] : remaining);
    };

    const selectedType = FIELD_KNOB_IDS.includes(selectedControl)
        ? 'knob'
        : FIELD_KEY_IDS.includes(selectedControl)
            ? 'key'
            : 'switch';

    const renderControlButton = (controlId: string, className = '') => {
        const hasMapping = mappings.some((mapping) => mapping.controlId === controlId);
        const isSelected = selectedControl === controlId;
        return (
            <button
                key={controlId}
                type="button"
                onClick={() => setSelectedControl(controlId)}
                className={[
                    'min-h-10 rounded border px-2 text-xs font-bold transition-colors',
                    isSelected
                        ? 'border-yellow-400 bg-yellow-400 text-slate-950'
                        : hasMapping
                            ? 'border-cyan-400/70 bg-cyan-400/10 text-cyan-100'
                            : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500',
                    className,
                ].join(' ')}
            >
                {controlId}
            </button>
        );
    };

    const renderLayerSelect = () => (
        <label className="block text-xs font-semibold text-slate-300">
            Layer
            <select
                aria-label={`${selectedControl} layer`}
                value={selectedLayer}
                onChange={(event) => setSelectedLayer(event.target.value as FieldMappingLayer)}
                className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100"
            >
                <option value="normal">Normal</option>
                <option value="sw1">SW1 held</option>
                <option value="sw2">SW2 held</option>
                <option value="sw1_sw2">SW1+SW2 held</option>
            </select>
        </label>
    );

    const renderKnobInspector = () => (
        <div className="space-y-3">
            {renderLayerSelect()}
            <label className="block text-xs font-semibold text-slate-300">
                Parameter target
                <div className="mt-1">{renderKnobCell(selectedControl, selectedLayer)}</div>
            </label>
        </div>
    );

    const renderKeyInspector = () => {
        const mapping = getMapping(selectedControl, selectedLayer);
        const mode = mapping?.keyOutput ?? draftKeyModes[selectedControl] ?? 'trigger';

        const selectKeyTarget = (selected: string) => {
            if (!selected) {
                replaceMapping(null, selectedControl, selectedLayer);
                return;
            }

            const [blockId, portId] = selected.split(':');
            const target = keyTargets.find((candidate) =>
                candidate.blockId === blockId && candidate.portId === portId
            );
            if (!target || isKeyTargetUnavailable(target)) return;

            replaceMapping({
                controlType: 'key',
                controlId: selectedControl,
                layer: selectedLayer,
                targetBlockId: blockId,
                targetPortId: portId,
                keyOutput: mode === 'gate' ? 'gate' : 'trigger',
            }, selectedControl, selectedLayer);
        };

        const selectToggleTarget = (selected: string) => {
            if (!selected) {
                replaceMapping(null, selectedControl, selectedLayer);
                return;
            }

            const [blockId, parameterId] = selected.split(':');
            const target = keyToggleTargets.find((candidate) =>
                candidate.blockId === blockId && candidate.parameterId === parameterId
            );
            if (!target) return;

            replaceMapping({
                controlType: 'key',
                controlId: selectedControl,
                layer: selectedLayer,
                targetBlockId: blockId,
                targetParameterId: parameterId,
                keyOutput: 'toggle3',
                toggleStates: target.states,
            }, selectedControl, selectedLayer);
        };

        return (
            <div className="space-y-3">
                {renderLayerSelect()}
                <label className="block text-xs font-semibold text-slate-300">
                    Mode
                    <select
                        aria-label={`${selectedControl} mode`}
                        value={mode}
                        onChange={(event) => {
                            const nextMode = event.target.value as FieldKeyOutputType;
                            setDraftKeyModes((draft) => ({ ...draft, [selectedControl]: nextMode }));
                            replaceMapping(null, selectedControl, selectedLayer);
                        }}
                        className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100"
                    >
                        <option value="trigger">Trigger</option>
                        <option value="gate">Gate</option>
                        <option value="toggle3">3-state toggle</option>
                    </select>
                </label>

                {mode === 'toggle3' ? (
                    <>
                        <label className="block text-xs font-semibold text-slate-300">
                            Toggle target
                            <select
                                aria-label={`${selectedControl} toggle target`}
                                value={mapping?.targetParameterId ? `${mapping.targetBlockId}:${mapping.targetParameterId}` : ''}
                                onChange={(event) => selectToggleTarget(event.target.value)}
                                className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100"
                            >
                                <option value="">Unmapped</option>
                                {keyToggleTargets.map((target) => (
                                    <option
                                        key={`${target.blockId}:${target.parameterId}`}
                                        value={`${target.blockId}:${target.parameterId}`}
                                    >
                                        {target.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                            {(['Off', 'Blink', 'On'] as const).map((label) => (
                                <div key={label} className="rounded border border-slate-800 bg-slate-950 px-2 py-2 text-center text-slate-300">
                                    {label}
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <label className="block text-xs font-semibold text-slate-300">
                        Gate/trigger target
                        <select
                            aria-label={`${selectedControl} gate target`}
                            value={mapping?.targetPortId ? `${mapping.targetBlockId}:${mapping.targetPortId}` : ''}
                            onChange={(event) => selectKeyTarget(event.target.value)}
                            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100"
                        >
                            <option value="">Unmapped</option>
                            {keyTargets.map((target) => {
                                const unavailable = isKeyTargetUnavailable(target);
                                return (
                                    <option
                                        key={`${target.blockId}:${target.portId}`}
                                        value={`${target.blockId}:${target.portId}`}
                                        disabled={unavailable}
                                    >
                                        {unavailable ? `${target.label} (connected)` : target.label}
                                    </option>
                                );
                            })}
                        </select>
                    </label>
                )}
            </div>
        );
    };

    const renderSwitchInspector = () => {
        const mapping = getMapping(selectedControl, 'normal');

        return (
            <div className="space-y-3">
                <div className="rounded border border-slate-800 bg-slate-950 p-3 text-xs text-slate-300">
                    <div className="font-semibold text-slate-100">Hold behavior</div>
                    <div className="mt-1">{selectedControl} held selects its shift layer. Short press is mapped below.</div>
                </div>
                <label className="block text-xs font-semibold text-slate-300">
                    Short press target
                    <select
                        aria-label={`${selectedControl} short press target`}
                        value={mapping?.targetPortId ? `${mapping.targetBlockId}:${mapping.targetPortId}` : ''}
                        onChange={(event) => {
                            const selected = event.target.value;
                            if (!selected) {
                                replaceMapping(null, selectedControl, 'normal');
                                return;
                            }

                            const [blockId, portId] = selected.split(':');
                            const target = keyTargets.find((candidate) =>
                                candidate.blockId === blockId && candidate.portId === portId
                            );
                            if (!target || isKeyTargetUnavailable(target)) return;

                            replaceMapping({
                                controlType: 'switch',
                                controlId: selectedControl,
                                layer: 'normal',
                                interaction: 'shortPress',
                                targetBlockId: blockId,
                                targetPortId: portId,
                                keyOutput: 'trigger',
                            }, selectedControl, 'normal');
                        }}
                        className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100"
                    >
                        <option value="">Unmapped</option>
                        {keyTargets.map((target) => {
                            const unavailable = isKeyTargetUnavailable(target);
                            return (
                                <option
                                    key={`${target.blockId}:${target.portId}`}
                                    value={`${target.blockId}:${target.portId}`}
                                    disabled={unavailable}
                                >
                                    {unavailable ? `${target.label} (connected)` : target.label}
                                </option>
                            );
                        })}
                    </select>
                </label>
            </div>
        );
    };

    const renderSurface = () => (
        <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                <div className="mb-4 flex items-center justify-between text-xs text-slate-400">
                    <span>Daisy Field surface</span>
                    <span>K1-K8, SW1/SW2, A1-B8 editable</span>
                </div>

                <div className="grid gap-4">
                    <div className="grid grid-cols-[5rem_1fr_5rem] items-center gap-3">
                        {renderControlButton(FIELD_SWITCH_IDS[0])}
                        <div className="grid grid-cols-8 gap-2">
                            {FIELD_KNOB_IDS.map((controlId) => renderControlButton(controlId, 'aspect-square'))}
                        </div>
                        {renderControlButton(FIELD_SWITCH_IDS[1])}
                    </div>

                    <div className="grid gap-2">
                        <div className="grid grid-cols-8 gap-2">
                            {FIELD_KEY_IDS.slice(0, 8).map((controlId) => renderControlButton(controlId))}
                        </div>
                        <div className="grid grid-cols-8 gap-2">
                            {FIELD_KEY_IDS.slice(8).map((controlId) => renderControlButton(controlId))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 text-xs text-slate-300 md:grid-cols-3">
                        <div className="rounded border border-slate-800 bg-slate-950 p-3">CV 4 in / 2 out</div>
                        <div className="rounded border border-slate-800 bg-slate-950 p-3">Gate 1 in / 1 out</div>
                        <div className="rounded border border-slate-800 bg-slate-950 p-3">Audio 2 in / 2 out</div>
                    </div>
                </div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                <div className="mb-3">
                    <div className="text-sm font-bold text-slate-100">{selectedControl}</div>
                    <div className="text-xs text-slate-500">
                        {selectedType === 'knob' ? 'Continuous parameter' : selectedType === 'key' ? 'Key action or 3-state toggle' : 'Held layer + short press'}
                    </div>
                </div>
                {selectedType === 'knob' && renderKnobInspector()}
                {selectedType === 'key' && renderKeyInspector()}
                {selectedType === 'switch' && renderSwitchInspector()}
            </div>
        </div>
    );

    const renderKnobCell = (controlId: string, layer: FieldMappingLayer) => {
        const mapping = getMapping(controlId, layer);
        const value = mapping?.targetParameterId ? `${mapping.targetBlockId}:${mapping.targetParameterId}` : '';

        return (
            <select
                aria-label={`${controlId} ${layer} mapping`}
                value={value}
                onChange={(event) => {
                    const selected = event.target.value;
                    if (!selected) {
                        replaceMapping(null, controlId, layer);
                        return;
                    }

                    const [blockId, parameterId] = selected.split(':');
                    const target = knobTargets.find((candidate) =>
                        candidate.blockId === blockId && candidate.parameterId === parameterId
                    );
                    if (!target || isKnobTargetUnavailable(target)) return;

                    replaceMapping({
                        controlType: 'knob',
                        controlId,
                        layer,
                        targetBlockId: blockId,
                        targetParameterId: parameterId,
                        mappingType: 'direct',
                        outputRange: target.defaultRange,
                    }, controlId, layer);
                }}
                className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100"
            >
                <option value="">Unmapped</option>
                {knobTargets.map((target) => {
                    const unavailable = isKnobTargetUnavailable(target);
                    return (
                        <option
                            key={`${target.blockId}:${target.parameterId}`}
                            value={`${target.blockId}:${target.parameterId}`}
                            disabled={unavailable}
                        >
                            {unavailable ? `${target.label} (connected)` : target.label}
                        </option>
                    );
                })}
            </select>
        );
    };

    const renderKeyCell = (controlId: string, layer: FieldMappingLayer) => {
        const mapping = getMapping(controlId, layer);
        const value = mapping?.targetPortId ? `${mapping.targetBlockId}:${mapping.targetPortId}` : '';

        return (
            <select
                aria-label={`${controlId} ${layer} mapping`}
                value={value}
                onChange={(event) => {
                    const selected = event.target.value;
                    if (!selected) {
                        replaceMapping(null, controlId, layer);
                        return;
                    }

                    const [blockId, portId] = selected.split(':');
                    const target = keyTargets.find((candidate) =>
                        candidate.blockId === blockId && candidate.portId === portId
                    );
                    if (!target || isKeyTargetUnavailable(target)) return;

                    replaceMapping({
                        controlType: 'key',
                        controlId,
                        layer,
                        targetBlockId: blockId,
                        targetPortId: portId,
                        keyOutput: portId.toLowerCase().includes('gate') ? 'gate' : 'trigger',
                    }, controlId, layer);
                }}
                className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100"
            >
                <option value="">Unmapped</option>
                {keyTargets.map((target) => {
                    const unavailable = isKeyTargetUnavailable(target);
                    return (
                        <option
                            key={`${target.blockId}:${target.portId}`}
                            value={`${target.blockId}:${target.portId}`}
                            disabled={unavailable}
                        >
                            {unavailable ? `${target.label} (connected)` : target.label}
                        </option>
                    );
                })}
            </select>
        );
    };

    const renderRows = (controlIds: string[], type: 'knob' | 'key') => (
        controlIds.map((controlId) => (
            <tr key={controlId} className="border-t border-slate-800">
                <th className="sticky left-0 bg-slate-900 px-3 py-2 text-left text-xs font-bold text-yellow-400">
                    {controlId}
                </th>
                {FIELD_MAPPING_LAYERS.map((layer) => (
                    <td key={layer} className="min-w-44 px-2 py-2">
                        {type === 'knob' ? renderKnobCell(controlId, layer) : renderKeyCell(controlId, layer)}
                    </td>
                ))}
            </tr>
        ))
    );

    return (
        <div className="p-6">
            <div className="mb-5">
                <h2 className="text-xl font-bold text-slate-100">Field Mapping</h2>
                <p className="mt-1 max-w-3xl text-sm text-slate-400">
                    Map Daisy Field knobs and keys to patch controls. SW1 and SW2 act as held shift layers.
                </p>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-300 md:grid-cols-4">
                <div><span className="font-bold text-slate-100">Knobs:</span> K1-K8</div>
                <div><span className="font-bold text-slate-100">Keys:</span> A1-B8</div>
                <div><span className="font-bold text-slate-100">CV:</span> 4 in / 2 out</div>
                <div><span className="font-bold text-slate-100">Gate:</span> 1 in / 1 out</div>
            </div>

            <div className="mb-4 flex rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs">
                <button
                    type="button"
                    onClick={() => setViewMode('surface')}
                    className={`rounded px-3 py-2 font-semibold ${viewMode === 'surface' ? 'bg-yellow-400 text-slate-950' : 'text-slate-300 hover:bg-slate-800'}`}
                >
                    Surface
                </button>
                <button
                    type="button"
                    onClick={() => setViewMode('matrix')}
                    className={`rounded px-3 py-2 font-semibold ${viewMode === 'matrix' ? 'bg-yellow-400 text-slate-950' : 'text-slate-300 hover:bg-slate-800'}`}
                >
                    Matrix
                </button>
            </div>

            {conflictErrors.length > 0 && (
                <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    <div className="font-semibold">Graph connection wins</div>
                    {conflictErrors.map((error) => (
                        <div key={error} className="mt-1 text-xs">{error}</div>
                    ))}
                </div>
            )}

            {viewMode === 'surface' ? renderSurface() : (
            <div className="overflow-auto rounded-lg border border-slate-800">
                <table className="w-full border-collapse bg-slate-900">
                    <thead>
                        <tr className="bg-slate-950 text-xs uppercase tracking-wide text-slate-400">
                            <th className="sticky left-0 bg-slate-950 px-3 py-2 text-left">Control</th>
                            <th className="px-2 py-2 text-left">Normal</th>
                            <th className="px-2 py-2 text-left">SW1</th>
                            <th className="px-2 py-2 text-left">SW2</th>
                            <th className="px-2 py-2 text-left">SW1+SW2</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderRows(FIELD_KNOB_IDS, 'knob')}
                        <tr className="bg-slate-950/80">
                            <td colSpan={5} className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                                Keys
                            </td>
                        </tr>
                        {renderRows(FIELD_KEY_IDS, 'key')}
                    </tbody>
                </table>
            </div>
            )}
        </div>
    );
};
