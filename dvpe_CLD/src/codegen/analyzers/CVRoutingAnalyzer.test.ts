/**
 * CVRoutingAnalyzer Unit Tests
 * Tests CV routing analysis and modulation code generation
 */

// import { describe, it, expect } from 'vitest';
import { CVRoutingAnalyzer } from '@/codegen/analyzers/CVRoutingAnalyzer';
import { Connection, BlockDefinition, ParameterType, BlockCategory, BlockColorScheme } from '@/types';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const createConnection = (
    id: string,
    sourceBlockId: string,
    sourcePortId: string,
    targetBlockId: string,
    targetPortId: string,
    type: 'audio' | 'cv' | 'trigger' = 'cv'
): Connection => ({
    id,
    sourceBlockId,
    sourcePortId,
    targetBlockId,
    targetPortId,
    type,
});

const createMockBlockDef = (id: string, params: string[] = []): BlockDefinition => ({
    id,
    className: 'MockClass',
    displayName: id.toUpperCase(),
    category: BlockCategory.SOURCES,
    headerFile: 'daisysp.h',
    initMethod: 'Init',
    initParams: ['sample_rate'],
    processMethod: 'Process',
    parameters: params.map(p => ({
        id: p,
        displayName: p,
        type: ParameterType.FLOAT,
        cppSetter: `Set${p.charAt(0).toUpperCase() + p.slice(1)}`,
        defaultValue: 0,
        cvModulatable: true,
    })),
    ports: [],
    colorScheme: BlockColorScheme.AUDIO,
    description: 'Mock block for testing',
});

const emptyBlockDefs = new Map<string, BlockDefinition>();

// ============================================================================
// ANALYSIS TESTS
// ============================================================================

describe('CVRoutingAnalyzer.analyze', () => {
    it('should return empty analysis for no connections', () => {
        const result = CVRoutingAnalyzer.analyze([], emptyBlockDefs);

        expect(result.routes).toHaveLength(0);
        expect(result.byTarget.size).toBe(0);
        expect(result.bySource.size).toBe(0);
    });

    it('should ignore audio connections', () => {
        const connections = [
            createConnection('c1', 'osc1', 'out', 'filter1', 'in', 'audio'),
        ];

        const result = CVRoutingAnalyzer.analyze(connections, emptyBlockDefs);

        expect(result.routes).toHaveLength(0);
    });

    it('should extract CV routes', () => {
        const connections = [
            createConnection('c1', 'adsr1', 'out', 'vca1', 'cv_in', 'cv'),
        ];

        const result = CVRoutingAnalyzer.analyze(connections, emptyBlockDefs);

        expect(result.routes).toHaveLength(1);
        expect(result.routes[0].sourceBlockId).toBe('adsr1');
        expect(result.routes[0].targetBlockId).toBe('vca1');
    });

    it('should group routes by target block', () => {
        const connections = [
            createConnection('c1', 'adsr1', 'out', 'vca1', 'cv_in', 'cv'),
            createConnection('c2', 'lfo1', 'out', 'vca1', 'cv_mod', 'cv'),
            createConnection('c3', 'adsr2', 'out', 'filter1', 'freq_cv', 'cv'),
        ];

        const result = CVRoutingAnalyzer.analyze(connections, emptyBlockDefs);

        expect(result.byTarget.get('vca1')).toHaveLength(2);
        expect(result.byTarget.get('filter1')).toHaveLength(1);
    });

    it('should group routes by source block', () => {
        const connections = [
            createConnection('c1', 'adsr1', 'out', 'vca1', 'cv_in', 'cv'),
            createConnection('c2', 'adsr1', 'out', 'filter1', 'freq_cv', 'cv'),
        ];

        const result = CVRoutingAnalyzer.analyze(connections, emptyBlockDefs);

        expect(result.bySource.get('adsr1')).toHaveLength(2);
    });

    it('should derive parameter names from port IDs', () => {
        const blockDefs = new Map<string, BlockDefinition>();
        blockDefs.set('filter1', createMockBlockDef('filter1', ['freq', 'res']));

        const connections = [
            createConnection('c1', 'lfo1', 'out', 'filter1', 'freq_cv', 'cv'),
        ];

        const result = CVRoutingAnalyzer.analyze(connections, blockDefs);

        expect(result.routes[0].targetParameter).toBe('freq');
    });
});

// ============================================================================
// HELPER METHOD TESTS
// ============================================================================

describe('CVRoutingAnalyzer.getRoutesForBlock', () => {
    it('should return routes for specific block', () => {
        const connections = [
            createConnection('c1', 'adsr1', 'out', 'vca1', 'cv_in', 'cv'),
            createConnection('c2', 'lfo1', 'out', 'filter1', 'freq_cv', 'cv'),
        ];

        const analysis = CVRoutingAnalyzer.analyze(connections, emptyBlockDefs);
        const routes = CVRoutingAnalyzer.getRoutesForBlock(analysis, 'vca1');

        expect(routes).toHaveLength(1);
        expect(routes[0].sourceBlockId).toBe('adsr1');
    });

    it('should return empty array for block with no CV inputs', () => {
        const connections = [
            createConnection('c1', 'adsr1', 'out', 'vca1', 'cv_in', 'cv'),
        ];

        const analysis = CVRoutingAnalyzer.analyze(connections, emptyBlockDefs);
        const routes = CVRoutingAnalyzer.getRoutesForBlock(analysis, 'osc1');

        expect(routes).toHaveLength(0);
    });
});

describe('CVRoutingAnalyzer.hasModulation', () => {
    it('should return true for modulated parameter', () => {
        const connections = [
            createConnection('c1', 'lfo1', 'out', 'filter1', 'freq_cv', 'cv'),
        ];

        const analysis = CVRoutingAnalyzer.analyze(connections, emptyBlockDefs);
        const hasFreqMod = CVRoutingAnalyzer.hasModulation(analysis, 'filter1', 'freq');

        expect(hasFreqMod).toBe(true);
    });

    it('should return false for non-modulated parameter', () => {
        const connections = [
            createConnection('c1', 'lfo1', 'out', 'filter1', 'freq_cv', 'cv'),
        ];

        const analysis = CVRoutingAnalyzer.analyze(connections, emptyBlockDefs);
        const hasResMod = CVRoutingAnalyzer.hasModulation(analysis, 'filter1', 'res');

        expect(hasResMod).toBe(false);
    });
});

// ============================================================================
// CODE GENERATION TESTS
// ============================================================================

describe('CVRoutingAnalyzer.generateModulationCode', () => {
    it('should generate multiplicative modulation code', () => {
        const code = CVRoutingAnalyzer.generateModulationCode(440, 'cv_lfo_out');

        expect(code).toBe('440 * (1.0f + cv_lfo_out)');
    });

    it('should include modulation depth when specified', () => {
        const code = CVRoutingAnalyzer.generateModulationCode(440, 'cv_lfo_out', 0.5);

        expect(code).toBe('440 * (1.0f + cv_lfo_out * 0.5f)');
    });

    it('should handle string base values', () => {
        const code = CVRoutingAnalyzer.generateModulationCode('base_freq', 'cv_mod');

        expect(code).toBe('base_freq * (1.0f + cv_mod)');
    });
});

describe('CVRoutingAnalyzer.generateAdditiveModulationCode', () => {
    it('should generate additive modulation code', () => {
        const code = CVRoutingAnalyzer.generateAdditiveModulationCode(440, 'cv_pitch', 1000);

        expect(code).toBe('440 + (cv_pitch * 1000f)');
    });

    it('should handle string base values', () => {
        const code = CVRoutingAnalyzer.generateAdditiveModulationCode('base_freq', 'cv_mod', 500);

        expect(code).toBe('base_freq + (cv_mod * 500f)');
    });
});
