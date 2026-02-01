/**
 * Remaining Blocks Validation Tests
 * Phasor, SampleHold, ClockedNoise, Looper
 */

import { SignalType, PortDirection, ParameterType, BlockCategory } from '../../types';
import {
    PhasorBlock,
    SampleHoldBlock,
    ClockedNoiseBlock,
    LooperBlock,
} from './definitions';
import { BlockRegistry } from './BlockRegistry';

const remainingBlocks = [
    PhasorBlock,
    SampleHoldBlock,
    ClockedNoiseBlock,
    LooperBlock,
];

describe('Remaining DaisySP Blocks Validation', () => {
    describe('Block Registration', () => {
        it('all remaining blocks should be registered in BlockRegistry', () => {
            remainingBlocks.forEach(block => {
                const registered = BlockRegistry.get(block.id);
                expect(registered).toBeDefined();
            });
        });
    });

    describe('Block Specific Checks', () => {
        it('SampleHold should check out', () => {
            const b = SampleHoldBlock;
            expect(b.category).toBe(BlockCategory.UTILITY);
            const trig = b.ports.find(p => p.id === 'trigger');
            expect(trig).toBeDefined();
            // Use string literal to avoid Enum import ambiguity
            expect(trig?.signalType).toBe('trigger');
        });

        it('ClockedNoise should check out', () => {
            const b = ClockedNoiseBlock;
            const sync = b.ports.find(p => p.id === 'sync');
            expect(sync).toBeDefined();
            expect(sync?.signalType).toBe('trigger');
        });

        it('Looper should check out', () => {
            const b = LooperBlock;
            const rec = b.ports.find(p => p.id === 'rec_trig');
            expect(rec).toBeDefined();
            expect(rec?.signalType).toBe('trigger');

            const clr = b.ports.find(p => p.id === 'clear_trig');
            expect(clr).toBeDefined();
            expect(clr?.signalType).toBe('trigger');
        });
    });
});
