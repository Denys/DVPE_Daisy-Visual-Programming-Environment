/**
 * Unit tests for Binding Mapper - Phase 13.2
 */
import {
    mapDirect,
    mapScaled,
    mapLog,
    mapExp,
    mapTable,
    applyMapping,
    generateBindingCode,
    suggestBinding,
} from '../bindingMapper';
import { UIElementType } from '@/types/uiElement';
import { ParameterBinding, MappingConfig } from '@/types/parameterBinding';

describe('Mapping Functions', () => {
    describe('mapDirect', () => {
        it('passes through value unchanged', () => {
            expect(mapDirect(0.5)).toBe(0.5);
            expect(mapDirect(0)).toBe(0);
            expect(mapDirect(1)).toBe(1);
        });
    });

    describe('mapScaled', () => {
        it('scales 0-1 to custom range', () => {
            expect(mapScaled(0, [0, 1], [0, 100])).toBe(0);
            expect(mapScaled(0.5, [0, 1], [0, 100])).toBe(50);
            expect(mapScaled(1, [0, 1], [0, 100])).toBe(100);
        });

        it('handles offset output range', () => {
            expect(mapScaled(0, [0, 1], [20, 20000])).toBe(20);
            expect(mapScaled(1, [0, 1], [20, 20000])).toBe(20000);
        });

        it('clamps input to range', () => {
            expect(mapScaled(-0.5, [0, 1], [0, 100])).toBe(0);
            expect(mapScaled(1.5, [0, 1], [0, 100])).toBe(100);
        });
    });

    describe('mapLog', () => {
        it('maps to logarithmic scale for frequency', () => {
            const low = mapLog(0, [0, 1], [20, 20000]);
            const mid = mapLog(0.5, [0, 1], [20, 20000]);
            const high = mapLog(1, [0, 1], [20, 20000]);

            expect(low).toBeCloseTo(20, 0);
            expect(high).toBeCloseTo(20000, 0);
            // Mid should be logarithmically closer to low end
            expect(mid).toBeLessThan((20 + 20000) / 2);
        });
    });

    describe('mapExp', () => {
        it('applies exponential curve', () => {
            const low = mapExp(0, [0, 1], [0.001, 10]);
            const high = mapExp(1, [0, 1], [0.001, 10]);

            expect(low).toBeCloseTo(0.001, 3);
            expect(high).toBeCloseTo(10, 0);
        });
    });

    describe('mapTable', () => {
        it('interpolates between table entries', () => {
            const table = [
                { input: 0, output: 0 },
                { input: 0.5, output: 100 },
                { input: 1, output: 50 },
            ];

            expect(mapTable(0, table)).toBe(0);
            expect(mapTable(0.25, table)).toBe(50);
            expect(mapTable(0.5, table)).toBe(100);
            expect(mapTable(0.75, table)).toBe(75);
            expect(mapTable(1, table)).toBe(50);
        });

        it('handles edge cases', () => {
            const table = [{ input: 0.5, output: 100 }];
            expect(mapTable(0.5, table)).toBe(100);
            expect(mapTable([], [])).toBeUndefined; // empty returns input
        });
    });
});

describe('applyMapping', () => {
    it('routes to correct mapping function', () => {
        const directConfig: MappingConfig = { type: 'direct' };
        expect(applyMapping(0.5, directConfig)).toBe(0.5);

        const scaledConfig: MappingConfig = {
            type: 'scaled',
            inputRange: [0, 1],
            outputRange: [0, 100],
        };
        expect(applyMapping(0.5, scaledConfig)).toBe(50);
    });
});

describe('generateBindingCode', () => {
    it('generates direct setter call', () => {
        const binding: ParameterBinding = {
            elementId: 'vol_knob',
            elementProperty: 'value',
            target: {
                blockId: 'vca1',
                parameterId: 'level',
                cppSetter: 'SetLevel',
            },
            mapping: { type: 'direct' },
        };

        const code = generateBindingCode(binding);
        expect(code).toContain('vca1.SetLevel');
        expect(code).toContain('vol_knob_value');
    });

    it('generates scaled mapping code', () => {
        const binding: ParameterBinding = {
            elementId: 'freq_knob',
            elementProperty: 'value',
            target: {
                blockId: 'osc1',
                parameterId: 'frequency',
                cppSetter: 'SetFreq',
            },
            mapping: {
                type: 'scaled',
                inputRange: [0, 1],
                outputRange: [20, 20000],
            },
        };

        const code = generateBindingCode(binding);
        expect(code).toContain('normalized');
        expect(code).toContain('osc1.SetFreq');
    });

    it('generates log mapping code', () => {
        const binding: ParameterBinding = {
            elementId: 'cutoff_knob',
            elementProperty: 'value',
            target: {
                blockId: 'filt1',
                parameterId: 'cutoff',
                cppSetter: 'SetCutoff',
            },
            mapping: {
                type: 'log',
                inputRange: [0, 1],
                outputRange: [20, 20000],
            },
        };

        const code = generateBindingCode(binding);
        expect(code).toContain('powf');
        expect(code).toContain('log10f');
        expect(code).toContain('filt1.SetCutoff');
    });
});

describe('suggestBinding', () => {
    it('suggests log mapping for frequency', () => {
        const suggestion = suggestBinding(UIElementType.ROTARY_KNOB, 'cutoff_freq');
        expect(suggestion.mappingType).toBe('log');
        expect(suggestion.outputRange[1]).toBe(20000);
        expect(suggestion.confidence).toBeGreaterThan(0.8);
    });

    it('suggests exp mapping for envelope times', () => {
        const suggestion = suggestBinding(UIElementType.SLIDER, 'attack_time');
        expect(suggestion.mappingType).toBe('exp');
        expect(suggestion.confidence).toBeGreaterThan(0.7);
    });

    it('suggests direct for mix parameters', () => {
        const suggestion = suggestBinding(UIElementType.ROTARY_KNOB, 'dry_wet_mix');
        expect(suggestion.mappingType).toBe('direct');
        expect(suggestion.confidence).toBeGreaterThan(0.9);
    });

    it('suggests direct for toggle elements', () => {
        const suggestion = suggestBinding(UIElementType.TOGGLE, 'enable_filter');
        expect(suggestion.mappingType).toBe('direct');
        expect(suggestion.confidence).toBeGreaterThan(0.95);
    });
});
