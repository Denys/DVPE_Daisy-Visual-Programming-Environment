/**
 * DAFX Integration Phase 4 Block Validation Tests
 * Blocks: CompressorExpander, SOLATimeStretch, CrosstalkCanceller, Robotization, Whisperization, YinPitch, EnvelopeFollower
 */

import { describe, it, expect } from 'vitest';
import { SignalType, PortDirection, ParameterType, BlockCategory } from '@/types';
import {
    CompressorExpanderBlock,
    SolaTimeStretchBlock,
    CrosstalkCancellerBlock,
    RobotizationBlock,
    WhisperizationBlock,
    YinPitchBlock,
    EnvelopeFollowerBlock
} from '@/core/blocks/definitions';
import { BlockRegistry } from '@/core/blocks/BlockRegistry';

const dafxBlocks = [
    CompressorExpanderBlock,
    SolaTimeStretchBlock,
    CrosstalkCancellerBlock,
    RobotizationBlock,
    WhisperizationBlock,
    YinPitchBlock,
    EnvelopeFollowerBlock
];

describe('DAFX Phase 4 Block Validation', () => {
    describe('Block Registration', () => {
        it('all DAFX Phase 4 blocks should be registered in BlockRegistry', () => {
            dafxBlocks.forEach(block => {
                const registered = BlockRegistry.get(block.id);
                expect(registered,
                    `Block "${block.id}" is not registered in BlockRegistry`
                ).toBeDefined();
            });
        });
    });

    describe('Block Structure Validation', () => {
        it('all blocks should have required identity fields', () => {
            dafxBlocks.forEach(block => {
                expect(block.id).toBeDefined();
                expect(block.className).toBeDefined();
                expect(block.displayName).toBeDefined();
                expect(block.category).toBeDefined();
            });
        });

        it('all blocks should have at least one output port', () => {
            dafxBlocks.forEach(block => {
                // YinPitch and EnvelopeFollower output CV, so we check generally
                const ports = block.ports.filter(p => p.direction === PortDirection.OUTPUT);
                expect(ports.length,
                    `Block "${block.id}" has no output ports`
                ).toBeGreaterThan(0);
            });
        });
    });

    // Validating specific requirements for new blocks
    describe('Specific Block Requirements', () => {
        it('CompressorExpander should have threshold parameters', () => {
            const params = CompressorExpanderBlock.parameters.map(p => p.id);
            expect(params).toContain('comp_threshold');
            expect(params).toContain('exp_threshold');
        });

        it('YinPitch should have freq and midi CV outputs', () => {
            const cvOuts = YinPitchBlock.ports
                .filter(p => p.direction === PortDirection.OUTPUT && p.signalType === SignalType.CV)
                .map(p => p.id);
            expect(cvOuts).toContain('freq');
            expect(cvOuts).toContain('midi');
        });

        it('CrosstalkCanceller should have stereo I/O', () => {
            const inputs = CrosstalkCancellerBlock.ports.filter(p => p.direction === PortDirection.INPUT).map(p => p.id);
            const outputs = CrosstalkCancellerBlock.ports.filter(p => p.direction === PortDirection.OUTPUT).map(p => p.id);
            expect(inputs).toEqual(expect.arrayContaining(['left_in', 'right_in']));
            expect(outputs).toEqual(expect.arrayContaining(['left_out', 'right_out']));
        });
    });
});
