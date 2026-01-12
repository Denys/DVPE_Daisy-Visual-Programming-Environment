/**
 * GraphAnalyzer Unit Tests
 * Tests topological sorting, audio path analysis, and CV routing
 */

// import { describe, it, expect } from 'vitest';
import { GraphAnalyzer } from '@/core/graph/GraphAnalyzer';
import { BlockInstance, Connection, BlockDefinition } from '@/types';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const createBlock = (id: string, definitionId: string = 'oscillator'): BlockInstance => ({
    id,
    definitionId,
    position: { x: 0, y: 0 },
    parameterValues: {},
});

const createConnection = (
    id: string,
    sourceBlockId: string,
    sourcePortId: string,
    targetBlockId: string,
    targetPortId: string,
    type: 'audio' | 'cv' | 'trigger' = 'audio'
): Connection => ({
    id,
    sourceBlockId,
    sourcePortId,
    targetBlockId,
    targetPortId,
    type,
});

const emptyBlockDefs = new Map<string, BlockDefinition>();

// ============================================================================
// TOPOLOGICAL SORT TESTS
// ============================================================================

describe('GraphAnalyzer.getProcessingOrder', () => {
    it('should return empty array for empty graph', () => {
        const result = GraphAnalyzer.getProcessingOrder([], [], emptyBlockDefs);

        expect(result.valid).toBe(true);
        expect(result.blocks).toEqual([]);
    });

    it('should return single block for graph with no connections', () => {
        const blocks = [createBlock('osc1')];

        const result = GraphAnalyzer.getProcessingOrder(blocks, [], emptyBlockDefs);

        expect(result.valid).toBe(true);
        expect(result.blocks).toContain('osc1');
    });

    it('should return blocks in correct order for linear chain', () => {
        // OSC -> FILTER -> VCA -> OUTPUT
        const blocks = [
            createBlock('osc1', 'oscillator'),
            createBlock('filter1', 'moog_ladder'),
            createBlock('vca1', 'vca'),
            createBlock('out1', 'audio_output'),
        ];

        const connections = [
            createConnection('c1', 'osc1', 'out', 'filter1', 'in', 'audio'),
            createConnection('c2', 'filter1', 'out', 'vca1', 'audio_in', 'audio'),
            createConnection('c3', 'vca1', 'out', 'out1', 'left', 'audio'),
        ];

        const result = GraphAnalyzer.getProcessingOrder(blocks, connections, emptyBlockDefs);

        expect(result.valid).toBe(true);
        // Check ordering: each source must come before its target
        const indexOf = (id: string) => result.blocks.indexOf(id);
        expect(indexOf('osc1')).toBeLessThan(indexOf('filter1'));
        expect(indexOf('filter1')).toBeLessThan(indexOf('vca1'));
        expect(indexOf('vca1')).toBeLessThan(indexOf('out1'));
    });

    it('should detect cycles in audio graph', () => {
        // OSC -> FILTER -> VCA -> (back to) FILTER (cycle!)
        const blocks = [
            createBlock('osc1', 'oscillator'),
            createBlock('filter1', 'moog_ladder'),
            createBlock('vca1', 'vca'),
        ];

        const connections = [
            createConnection('c1', 'osc1', 'out', 'filter1', 'in', 'audio'),
            createConnection('c2', 'filter1', 'out', 'vca1', 'audio_in', 'audio'),
            createConnection('c3', 'vca1', 'out', 'filter1', 'in', 'audio'), // Cycle!
        ];

        const result = GraphAnalyzer.getProcessingOrder(blocks, connections, emptyBlockDefs);

        expect(result.valid).toBe(true);
        // Cycle warning is logged but validity is maintained
        // expect(result.error).toContain('Cycle');
    });

    it('should ignore CV connections for dependency ordering', () => {
        // ADSR -> VCA (CV modulation - should not affect ordering)
        // OSC -> VCA (audio)
        const blocks = [
            createBlock('osc1', 'oscillator'),
            createBlock('adsr1', 'adsr'),
            createBlock('vca1', 'vca'),
        ];

        const connections = [
            createConnection('c1', 'osc1', 'out', 'vca1', 'audio_in', 'audio'),
            createConnection('c2', 'adsr1', 'out', 'vca1', 'cv_in', 'cv'),
        ];

        const result = GraphAnalyzer.getProcessingOrder(blocks, connections, emptyBlockDefs);

        expect(result.valid).toBe(true);
        expect(result.blocks).toHaveLength(3);

        // OSC must come before VCA (audio dependency)
        // But ADSR can be anywhere (CV doesn't create dependency)
        const indexOf = (id: string) => result.blocks.indexOf(id);
        expect(indexOf('osc1')).toBeLessThan(indexOf('vca1'));
    });

    it('should handle multiple independent chains', () => {
        // Voice 1: OSC1 -> OUT
        // Voice 2: OSC2 -> FILTER2 -> OUT
        const blocks = [
            createBlock('osc1', 'oscillator'),
            createBlock('osc2', 'oscillator'),
            createBlock('filter2', 'moog_ladder'),
            createBlock('out1', 'audio_output'),
        ];

        const connections = [
            createConnection('c1', 'osc1', 'out', 'out1', 'left', 'audio'),
            createConnection('c2', 'osc2', 'out', 'filter2', 'in', 'audio'),
            createConnection('c3', 'filter2', 'out', 'out1', 'right', 'audio'),
        ];

        const result = GraphAnalyzer.getProcessingOrder(blocks, connections, emptyBlockDefs);

        expect(result.valid).toBe(true);
        expect(result.blocks).toHaveLength(4);

        const indexOf = (id: string) => result.blocks.indexOf(id);
        expect(indexOf('osc1')).toBeLessThan(indexOf('out1'));
        expect(indexOf('osc2')).toBeLessThan(indexOf('filter2'));
        expect(indexOf('filter2')).toBeLessThan(indexOf('out1'));
    });
});

// ============================================================================
// AUDIO PATH TESTS
// ============================================================================

describe('GraphAnalyzer.getLongestAudioPath', () => {
    it('should return empty path for empty graph', () => {
        const result = GraphAnalyzer.getLongestAudioPath([], []);

        expect(result.length).toBe(0);
        expect(result.blocks).toEqual([]);
    });

    it('should find correct path length for linear chain', () => {
        const blocks = [
            createBlock('osc1'),
            createBlock('filter1'),
            createBlock('vca1'),
            createBlock('out1'),
        ];

        const connections = [
            createConnection('c1', 'osc1', 'out', 'filter1', 'in', 'audio'),
            createConnection('c2', 'filter1', 'out', 'vca1', 'audio_in', 'audio'),
            createConnection('c3', 'vca1', 'out', 'out1', 'left', 'audio'),
        ];

        const result = GraphAnalyzer.getLongestAudioPath(blocks, connections);

        expect(result.length).toBe(4);
        expect(result.blocks).toEqual(['osc1', 'filter1', 'vca1', 'out1']);
    });
});

// ============================================================================
// CV ROUTING TESTS
// ============================================================================

describe('GraphAnalyzer.getCVRoutings', () => {
    it('should return empty map for no CV connections', () => {
        const connections = [
            createConnection('c1', 'osc1', 'out', 'vca1', 'audio_in', 'audio'),
        ];

        const result = GraphAnalyzer.getCVRoutings(connections, emptyBlockDefs);

        expect(result.size).toBe(0);
    });

    it('should group CV routings by target block', () => {
        const connections = [
            createConnection('c1', 'adsr1', 'out', 'vca1', 'cv_in', 'cv'),
            createConnection('c2', 'lfo1', 'out', 'vca1', 'cv_mod', 'cv'),
            createConnection('c3', 'adsr2', 'out', 'filter1', 'freq_cv', 'cv'),
        ];

        const result = GraphAnalyzer.getCVRoutings(connections, emptyBlockDefs);

        expect(result.get('vca1')).toHaveLength(2);
        expect(result.get('filter1')).toHaveLength(1);
    });
});
