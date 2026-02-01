
import { SignalType, PortDirection, ParameterType, BlockCategory } from '@/types';
import {
    SelectBlock,
    ScaleBlock,
    OffsetBlock,
    RangeMapBlock,
    QuantizeBlock,
    SinBlock, CosBlock, TanBlock, Atan2Block, LerpBlock,
    DbToLinearBlock, LinearToDbBlock, FreqToMidiBlock, MidiToFreqBlock, CentsToRatioBlock,
    EnvelopeFollowerBlock,
} from '@/core/blocks/definitions';
import { BlockRegistry } from '@/core/blocks/BlockRegistry';

const phase13Blocks = [
    SelectBlock,
    ScaleBlock,
    OffsetBlock,
    RangeMapBlock,
    QuantizeBlock,
    SinBlock, CosBlock, TanBlock, Atan2Block, LerpBlock,
    DbToLinearBlock, LinearToDbBlock, FreqToMidiBlock, MidiToFreqBlock, CentsToRatioBlock,
    EnvelopeFollowerBlock,
];

describe('Phase 13 Block Validation (Routing, Transformations, Math, Audio)', () => {
    describe('Block Registration', () => {
        it('all Phase 13 blocks should be registered in BlockRegistry', () => {
            phase13Blocks.forEach(block => {
                const registered = BlockRegistry.get(block.id);
                expect(registered,
                    `Block "${block.id}" is not registered in BlockRegistry`
                ).toBeDefined();
            });
        });
    });

    describe('Block Structure Validation', () => {
        it('all blocks should have required identity fields', () => {
            phase13Blocks.forEach(block => {
                expect(block.id).toBeDefined();
                expect(block.className).toBeDefined();
                expect(block.displayName).toBeDefined();
                // Category validation is split because we have UTILITY, MATH, DYNAMICS
                expect(block.category).toBeDefined();

                // Most are inline, but EnvelopeFollower uses template
                if (block.id !== 'envelope_follower') {
                    expect(block.cppInlineProcess).toBeDefined();
                    expect(block.cppInlineProcess?.length).toBeGreaterThan(0);
                } else {
                    expect(block.cppProcessTemplate).toBeDefined();
                }
            });
        });
    });

    describe('Math & Audio Block Logic', () => {
        it('Trig blocks shoud exist', () => {
            expect(SinBlock).toBeDefined();
            expect(CosBlock).toBeDefined();
        });

        it('LerpBlock should have Mix parameter', () => {
            expect(LerpBlock.ports.find(p => p.id === 't')).toBeDefined();
        });

        it('Envelope Follower should have Attack/Release', () => {
            const env = EnvelopeFollowerBlock;
            expect(env).toBeDefined();
            expect(env.parameters.find(p => p.id === 'attack')).toBeDefined();
            expect(env.parameters.find(p => p.id === 'release')).toBeDefined();
            expect(env.cppStateVars).toBeDefined();
            expect(env.cppStateVars?.length).toBeGreaterThan(0);
        });
    });
});
