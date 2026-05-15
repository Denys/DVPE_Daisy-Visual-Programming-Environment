import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FieldMappingPanel } from '../FieldMappingPanel';
import { BlockCategory, BlockColorScheme, ParameterType, SignalType, PortDirection } from '@/types';
import type { BlockDefinition, BlockInstance, Connection, FieldControlMapping } from '@/types';

const blocks: BlockInstance[] = [
    { id: 'filter1', definitionId: 'svf', position: { x: 0, y: 0 }, parameterValues: {} },
    { id: 'env1', definitionId: 'ad_env', position: { x: 0, y: 0 }, parameterValues: {} },
];

const blockDefs = new Map<string, BlockDefinition>([
    [
        'svf',
        {
            id: 'svf',
            className: 'Svf',
            displayName: 'SVF',
            description: 'State variable filter',
            category: BlockCategory.FILTERS,
            colorScheme: BlockColorScheme.FILTER,
            headerFile: '',
            initMethod: '',
            initParams: [],
            processMethod: '',
            parameters: [
                {
                    id: 'freq',
                    displayName: 'Cutoff',
                    type: ParameterType.FLOAT,
                    defaultValue: 1000,
                    cppSetter: 'SetFreq',
                    cvModulatable: true,
                    range: { min: 20, max: 20000 },
                },
                {
                    id: 'waveform',
                    displayName: 'Waveform',
                    type: ParameterType.ENUM,
                    defaultValue: 'sine',
                    enumValues: [
                        { label: 'Sine', value: 'sine', cppValue: 'Oscillator::WAVE_SIN' },
                        { label: 'Saw', value: 'saw', cppValue: 'Oscillator::WAVE_SAW' },
                        { label: 'Square', value: 'square', cppValue: 'Oscillator::WAVE_SQUARE' },
                    ],
                    cppSetter: 'SetWaveform',
                    cvModulatable: true,
                },
            ],
            ports: [
                { id: 'freq_cv', displayName: 'FREQ CV', signalType: SignalType.CV, direction: PortDirection.INPUT },
            ],
        },
    ],
    [
        'ad_env',
        {
            id: 'ad_env',
            className: 'AdEnv',
            displayName: 'AD ENV',
            description: 'Attack decay envelope',
            category: BlockCategory.MODULATORS,
            colorScheme: BlockColorScheme.CONTROL,
            headerFile: '',
            initMethod: '',
            initParams: [],
            processMethod: '',
            parameters: [],
            ports: [
                { id: 'trig', displayName: 'TRIG', signalType: SignalType.TRIGGER, direction: PortDirection.INPUT },
                { id: 'out', displayName: 'OUT', signalType: SignalType.CV, direction: PortDirection.OUTPUT },
            ],
        },
    ],
]);

describe('FieldMappingPanel', () => {
    it('renders the Field matrix and filters safe targets', () => {
        const onChange = vi.fn();

        render(
            <FieldMappingPanel
                mappings={[]}
                blocks={blocks}
                blockDefs={blockDefs}
                connections={[]}
                onChange={onChange}
            />
        );

        expect(screen.getByRole('heading', { name: 'Field Mapping' })).toBeInTheDocument();
        expect(screen.getByText('K1')).toBeInTheDocument();
        expect(screen.getByText('A1')).toBeInTheDocument();
        expect(screen.getByText('SW1+SW2')).toBeInTheDocument();
        expect(screen.getAllByRole('option', { name: 'SVF - Cutoff' }).length).toBeGreaterThan(0);
        expect(screen.queryByRole('option', { name: 'SVF - Waveform' })).not.toBeInTheDocument();

        fireEvent.change(screen.getAllByLabelText('K1 normal mapping')[0], { target: { value: 'filter1:freq' } });
        expect(onChange).toHaveBeenCalledWith([
            expect.objectContaining({
                controlType: 'knob',
                controlId: 'K1',
                layer: 'normal',
                targetBlockId: 'filter1',
                targetParameterId: 'freq',
                mappingType: 'direct',
            }),
        ]);
    });

    it('marks conflicting key targets as unavailable', () => {
        const mappings: FieldControlMapping[] = [
            {
                controlType: 'key',
                controlId: 'A1',
                layer: 'normal',
                targetBlockId: 'env1',
                targetPortId: 'trig',
                keyOutput: 'trigger',
            },
        ];
        const connections: Connection[] = [
            {
                id: 'c1',
                sourceBlockId: 'clock1',
                sourcePortId: 'trig',
                targetBlockId: 'env1',
                targetPortId: 'trig',
                type: 'trigger',
            },
        ];

        render(
            <FieldMappingPanel
                mappings={mappings}
                blocks={blocks}
                blockDefs={blockDefs}
                connections={connections}
                onChange={vi.fn()}
            />
        );

        expect(screen.getByText('Graph connection wins')).toBeInTheDocument();
        expect(screen.getAllByRole('option', { name: 'AD ENV - TRIG (connected)' })[0]).toBeDisabled();
    });

    it('renders a visual Field surface and maps SW short press actions', () => {
        const onChange = vi.fn();

        render(
            <FieldMappingPanel
                mappings={[]}
                blocks={blocks}
                blockDefs={blockDefs}
                connections={[]}
                onChange={onChange}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: 'Surface' }));
        expect(screen.getByRole('button', { name: 'K1' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'A1' })).toBeInTheDocument();
        expect(screen.getByText('CV 4 in / 2 out')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'SW1' }));
        fireEvent.change(screen.getByLabelText('SW1 short press target'), { target: { value: 'env1:trig' } });

        expect(onChange).toHaveBeenCalledWith([
            expect.objectContaining({
                controlType: 'switch',
                controlId: 'SW1',
                interaction: 'shortPress',
                targetBlockId: 'env1',
                targetPortId: 'trig',
                keyOutput: 'trigger',
            }),
        ]);
    });

    it('configures A1-B8 keys as three-state parameter toggles with LED states', () => {
        const onChange = vi.fn();

        render(
            <FieldMappingPanel
                mappings={[]}
                blocks={blocks}
                blockDefs={blockDefs}
                connections={[]}
                onChange={onChange}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: 'Surface' }));
        fireEvent.click(screen.getByRole('button', { name: 'A1' }));
        fireEvent.change(screen.getByLabelText('A1 mode'), { target: { value: 'toggle3' } });
        fireEvent.change(screen.getByLabelText('A1 toggle target'), { target: { value: 'filter1:waveform' } });

        expect(onChange).toHaveBeenLastCalledWith([
            expect.objectContaining({
                controlType: 'key',
                controlId: 'A1',
                keyOutput: 'toggle3',
                targetBlockId: 'filter1',
                targetParameterId: 'waveform',
                toggleStates: [
                    { label: 'Sine', value: 'sine', cppValue: 'Oscillator::WAVE_SIN', led: 'off' },
                    { label: 'Saw', value: 'saw', cppValue: 'Oscillator::WAVE_SAW', led: 'blink' },
                    { label: 'Square', value: 'square', cppValue: 'Oscillator::WAVE_SQUARE', led: 'on' },
                ],
            }),
        ]);
    });
});
