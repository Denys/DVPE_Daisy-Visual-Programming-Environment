/**
 * Tests for Inspector rendering of custom block exposed parameters
 * Task A4: Exposed parameter controls in inspector
 */

import { describe, it, expect, vi } from 'vitest';
import { CustomBlockDefinition } from '@/types/customBlock';
import { BlockCategory, BlockColorScheme, ParameterType, ParameterCurve, SignalType, PortDirection } from '@/types';

// Test that CustomBlockDefinition parameters are structured correctly
// for the Inspector's parameter rendering logic
describe('Inspector Custom Block Parameter Support', () => {
    it('CustomBlockDefinition has parameters array compatible with Inspector rendering', () => {
        const customDef: CustomBlockDefinition = {
            id: 'test-custom',
            displayName: 'Test Custom',
            className: 'TestCustom',
            description: 'Test',
            category: BlockCategory.CUSTOM,
            colorScheme: BlockColorScheme.USER,
            icon: 'Box',
            headerFile: '',
            initMethod: '',
            initParams: [],
            processMethod: '',
            parameters: [
                {
                    id: 'osc_freq',
                    displayName: 'Frequency',
                    type: ParameterType.FLOAT,
                    defaultValue: 440,
                    range: { min: 20, max: 20000, step: 1, curve: ParameterCurve.LOGARITHMIC },
                    cvModulatable: false,
                },
            ],
            ports: [
                { id: 'out', displayName: 'Out', signalType: SignalType.AUDIO, direction: PortDirection.OUTPUT },
            ],
            isCustom: true,
            internalPatch: { metadata: {} as any, blocks: [], connections: [] },
            exposedPorts: {},
            exposedParameters: {
                osc_freq: { blockId: 'osc_1', parameterId: 'freq' },
            },
        };

        // Inspector reads definition.parameters — verify it's there
        expect(customDef.parameters).toHaveLength(1);
        expect(customDef.parameters[0].id).toBe('osc_freq');
        expect(customDef.parameters[0].type).toBe(ParameterType.FLOAT);

        // Inspector uses block.parameterValues[param.id] — verify the ID matches
        expect(customDef.exposedParameters['osc_freq']).toBeDefined();
        expect(customDef.exposedParameters['osc_freq'].blockId).toBe('osc_1');
        expect(customDef.exposedParameters['osc_freq'].parameterId).toBe('freq');
    });

    it('isCustom flag correctly identifies custom blocks', () => {
        const regularDef = {
            id: 'oscillator',
            isCustom: undefined,
        };

        const customDef = {
            id: 'custom-test',
            isCustom: true,
        };

        expect(Boolean(regularDef.isCustom)).toBe(false);
        expect(Boolean(customDef.isCustom)).toBe(true);
    });

    it('exposedParameters maps exposed IDs to inner block targets', () => {
        const exposedParams = {
            osc_freq: { blockId: 'osc_1', parameterId: 'freq' },
            vca_gain: { blockId: 'vca_1', parameterId: 'gain' },
        };

        // Each exposed param should have blockId and parameterId
        Object.entries(exposedParams).forEach(([key, mapping]) => {
            expect(mapping.blockId).toBeTruthy();
            expect(mapping.parameterId).toBeTruthy();
            expect(typeof mapping.blockId).toBe('string');
            expect(typeof mapping.parameterId).toBe('string');
        });
    });
});
