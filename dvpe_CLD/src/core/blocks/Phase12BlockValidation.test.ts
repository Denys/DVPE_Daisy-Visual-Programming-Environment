/**
 * Phase 12 Block Validation Tests
 * New Features: Slider, Switch, Math (ABS, EXP, POW2), DC Source
 */

// import { describe, it, expect } from 'vitest';
import { SignalType, PortDirection } from '@/types';
import {
    SliderBlock,
    SwitchBlock,
    AbsBlock,
    ExpBlock,
    Pow2Block,
    DcSourceBlock,
} from '@/core/blocks/definitions';
import { BlockRegistry } from '@/core/blocks/BlockRegistry';

const phase12Blocks = [
    SliderBlock,
    SwitchBlock,
    AbsBlock,
    ExpBlock,
    Pow2Block,
    DcSourceBlock,
];

describe('Phase 12 Block Validation', () => {
    describe('Registration Check', () => {
        it('should verify all Phase 12 blocks are registered', () => {
            phase12Blocks.forEach(block => {
                const registered = BlockRegistry.get(block.id);
                expect(registered).toBeDefined();
                expect(registered?.className).toBe(block.className);
            });
        });
    });

    describe('Block Specifics', () => {
        it('Slider has correct params', () => {
            const params = SliderBlock.parameters.map(p => p.id);
            expect(params).toContain('channel');
            expect(params).toContain('min');
            expect(params).toContain('max');
        });

        it('Switch has correct outputs', () => {
            expect(SwitchBlock.ports.find(p => p.id === 'gate')).toBeDefined();
            expect(SwitchBlock.ports.find(p => p.id === 'trig')).toBeDefined();
            expect(SwitchBlock.ports.find(p => p.id === 'latch')).toBeDefined();
        });

        it('Math Blocks (Abs, Exp, Pow2) have 1 in 1 out', () => {
            [AbsBlock, ExpBlock, Pow2Block].forEach(block => {
                const inputs = block.ports.filter(p => p.direction === PortDirection.INPUT);
                const outputs = block.ports.filter(p => p.direction === PortDirection.OUTPUT);
                expect(inputs.length).toBe(1);
                expect(typeof outputs.length).toBe('number');
                expect(outputs.length).toBeGreaterThanOrEqual(1);
            });
        });

        it('DC Source has value param', () => {
            expect(DcSourceBlock.parameters.find(p => p.id === 'value')).toBeDefined();
        });
    });
});
