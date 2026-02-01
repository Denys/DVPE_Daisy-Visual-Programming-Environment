/**
 * Unit tests for Block UI Layout - Phase 13.2
 */
import {
    BlockUILayout,
    DVPEBlockFile,
    serializeBlockLayout,
    parseBlockLayout,
    serializeDVPEBlock,
    parseDVPEBlock,
    createEmptyBlockLayout,
    createDVPEBlock,
} from '../blockUILayout';
import { UIElementType } from '../uiElement';

describe('BlockUILayout Serialization', () => {
    describe('createEmptyBlockLayout', () => {
        it('creates valid empty layout', () => {
            const layout = createEmptyBlockLayout('test-block-1');

            expect(layout.version).toBe('1.0');
            expect(layout.blockDefinitionId).toBe('test-block-1');
            expect(layout.elements).toHaveLength(0);
            expect(layout.bindings).toHaveLength(0);
            expect(layout.dimensions.width).toBe(240);
            expect(layout.dimensions.height).toBe(160);
        });

        it('accepts custom dimensions', () => {
            const layout = createEmptyBlockLayout('block-2', { width: 300, height: 200 });

            expect(layout.dimensions.width).toBe(300);
            expect(layout.dimensions.height).toBe(200);
        });
    });

    describe('serializeBlockLayout / parseBlockLayout', () => {
        it('round-trips layout data', () => {
            const layout: BlockUILayout = createEmptyBlockLayout('round-trip-test');
            layout.elements.push({
                id: 'knob-1',
                type: UIElementType.ROTARY_KNOB,
                position: { x: 50, y: 50 },
                size: { width: 60, height: 60 },
                rotation: 0,
                config: { minValue: 0, maxValue: 1 },
            });

            const json = serializeBlockLayout(layout);
            const parsed = parseBlockLayout(json);

            expect(parsed.blockDefinitionId).toBe('round-trip-test');
            expect(parsed.elements).toHaveLength(1);
            expect(parsed.elements[0].id).toBe('knob-1');
        });

        it('rejects invalid version', () => {
            const badJson = JSON.stringify({ version: '2.0', blockDefinitionId: 'x', elements: [] });
            expect(() => parseBlockLayout(badJson)).toThrow('Unsupported layout version');
        });

        it('rejects missing fields', () => {
            const badJson = JSON.stringify({ version: '1.0' });
            expect(() => parseBlockLayout(badJson)).toThrow('missing required fields');
        });
    });

    describe('DVPEBlockFile', () => {
        it('creates valid .dvpe-block file', () => {
            const layout = createEmptyBlockLayout('synth-block');
            const block = createDVPEBlock('synth-block', 'Synth Block', layout);

            expect(block.format).toBe('dvpe-block');
            expect(block.version).toBe('1.0');
            expect(block.blockId).toBe('synth-block');
            expect(block.displayName).toBe('Synth Block');
            expect(block.layout).toBe(layout);
        });

        it('round-trips .dvpe-block file', () => {
            const layout = createEmptyBlockLayout('filter-block');
            layout.elements.push({
                id: 'cutoff',
                type: UIElementType.SLIDER,
                position: { x: 10, y: 20 },
                size: { width: 30, height: 100 },
                rotation: 0,
                config: {},
            });

            const block = createDVPEBlock('filter-block', 'Filter', layout);
            const json = serializeDVPEBlock(block);
            const parsed = parseDVPEBlock(json);

            expect(parsed.blockId).toBe('filter-block');
            expect(parsed.layout.elements).toHaveLength(1);
            expect(parsed.codeGeneration?.generateBindingHandlers).toBe(true);
        });

        it('rejects invalid format', () => {
            const badJson = JSON.stringify({ format: 'wrong', version: '1.0' });
            expect(() => parseDVPEBlock(badJson)).toThrow('Invalid file format');
        });

        it('rejects missing layout', () => {
            const badJson = JSON.stringify({ format: 'dvpe-block', version: '1.0', blockId: 'x' });
            expect(() => parseDVPEBlock(badJson)).toThrow('missing required fields');
        });
    });
});
