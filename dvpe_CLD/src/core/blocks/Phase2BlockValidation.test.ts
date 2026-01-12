/**
 * Phase 2 Block Validation Tests
 * Math & Utility: Add, Multiply, Subtract, Divide, Gain, Bypass, SampleDelay, CvToFreq, Mux, Demux, LinearVCA
 */

// import { describe, it, expect } from 'vitest';
import { SignalType, PortDirection, ParameterType, BlockCategory } from '@/types';
import {
    AddBlock,
    MultiplyBlock,
    SubtractBlock,
    DivideBlock,
    GainBlock,
    BypassBlock,
    SampleDelayBlock,
    CvToFreqBlock,
    MuxBlock,
    DemuxBlock,
    LinearVcaBlock,
} from '@/core/blocks/definitions';
import { BlockRegistry } from '@/core/blocks/BlockRegistry';

// All Phase 2 blocks
const phase2Blocks = [
    AddBlock,
    MultiplyBlock,
    SubtractBlock,
    DivideBlock,
    GainBlock,
    BypassBlock,
    SampleDelayBlock,
    CvToFreqBlock,
    MuxBlock,
    DemuxBlock,
    LinearVcaBlock,
];

// Math operation blocks subset
const mathBlocks = [AddBlock, MultiplyBlock, SubtractBlock, DivideBlock];

describe('Phase 2 Block Validation (Math & Utility)', () => {
    describe('Block Registration', () => {
        it('all Phase 2 blocks should be registered in BlockRegistry', () => {
            phase2Blocks.forEach(block => {
                const registered = BlockRegistry.get(block.id);
                expect(registered,
                    `Block "${block.id}" is not registered in BlockRegistry`
                ).toBeDefined();
            });
        });
    });

    describe('CV Modulation Configuration', () => {
        it('all float parameters should have cvModulatable property defined', () => {
            phase2Blocks.forEach(block => {
                block.parameters.forEach(param => {
                    if (param.type === ParameterType.FLOAT) {
                        expect(param).toHaveProperty('cvModulatable');
                    }
                });
            });
        });
    });

    describe('CV Port/Parameter Alignment', () => {
        it('cvModulatable parameters should have corresponding CV input ports', () => {
            phase2Blocks.forEach(block => {
                const cvModulatableParams = block.parameters.filter(p => p.cvModulatable === true);

                cvModulatableParams.forEach(param => {
                    const expectedPortId = `${param.id}_cv`;
                    const cvPort = block.ports.find(
                        p => p.id === expectedPortId &&
                            p.direction === PortDirection.INPUT &&
                            p.signalType === SignalType.CV
                    );

                    expect(cvPort,
                        `Block "${block.id}" param "${param.id}" is cvModulatable but missing CV port "${expectedPortId}"`
                    ).toBeDefined();
                });
            });
        });
    });

    describe('Block Structure Validation', () => {
        it('all blocks should have required identity fields', () => {
            phase2Blocks.forEach(block => {
                expect(block.id).toBeDefined();
                expect(block.className).toBeDefined();
                expect(block.displayName).toBeDefined();
                expect(block.category).toBeDefined();
            });
        });

        it('all blocks should have at least one output port', () => {
            phase2Blocks.forEach(block => {
                const outputPorts = block.ports.filter(p => p.direction === PortDirection.OUTPUT);
                expect(outputPorts.length,
                    `Block "${block.id}" has no output ports`
                ).toBeGreaterThan(0);
            });
        });
    });

    describe('Phase 2 Specific: Math Blocks', () => {
        it('math blocks should be in EFFECTS or UTILITY category', () => {
            mathBlocks.forEach(block => {
                expect([BlockCategory.EFFECTS, BlockCategory.UTILITY]).toContain(block.category);
            });
        });

        it('math blocks should have two inputs', () => {
            mathBlocks.forEach(block => {
                const inputs = block.ports.filter(p => p.direction === PortDirection.INPUT);
                expect(inputs.length,
                    `Block "${block.id}" should have 2 inputs`
                ).toBeGreaterThanOrEqual(2);
            });
        });

        it('math blocks should have one output', () => {
            mathBlocks.forEach(block => {
                const outputs = block.ports.filter(
                    p => p.direction === PortDirection.OUTPUT &&
                        (p.signalType === SignalType.AUDIO || p.signalType === SignalType.CV)
                );
                expect(outputs.length,
                    `Block "${block.id}" should have 1 output`
                ).toBeGreaterThanOrEqual(1);
            });
        });
    });

    describe('Phase 2 Specific: Utility Blocks', () => {
        it('Gain block should have gain parameter', () => {
            const gainParam = GainBlock.parameters.find(p => p.id === 'gain');
            expect(gainParam).toBeDefined();
        });

        it('Bypass block should pass audio through', () => {
            const audioIn = BypassBlock.ports.find(
                p => p.direction === PortDirection.INPUT &&
                    p.signalType === SignalType.AUDIO
            );
            const audioOut = BypassBlock.ports.find(
                p => p.direction === PortDirection.OUTPUT &&
                    p.signalType === SignalType.AUDIO
            );
            expect(audioIn).toBeDefined();
            expect(audioOut).toBeDefined();
        });

        it('SampleDelay should have delay samples parameter', () => {
            const params = SampleDelayBlock.parameters.map(p => p.id);
            expect(params.some(id => id.includes('delay') || id.includes('samples'))).toBe(true);
        });

        it('CvToFreq should output frequency', () => {
            const outputs = CvToFreqBlock.ports.filter(p => p.direction === PortDirection.OUTPUT);
            expect(outputs.length).toBeGreaterThan(0);
        });
    });

    describe('Phase 2 Specific: Mux/Demux', () => {
        it('Mux should have multiple inputs and selector', () => {
            const inputs = MuxBlock.ports.filter(
                p => p.direction === PortDirection.INPUT
            );
            // At least 2 signal inputs + selector
            expect(inputs.length).toBeGreaterThanOrEqual(2);
        });

        it('Demux should have input and multiple outputs', () => {
            const outputs = DemuxBlock.ports.filter(
                p => p.direction === PortDirection.OUTPUT
            );
            expect(outputs.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('Phase 2 Specific: LinearVCA', () => {
        it('LinearVCA should have audio and CV inputs', () => {
            const audioIn = LinearVcaBlock.ports.find(
                p => p.direction === PortDirection.INPUT &&
                    p.signalType === SignalType.AUDIO
            );
            const cvIn = LinearVcaBlock.ports.find(
                p => p.direction === PortDirection.INPUT &&
                    p.signalType === SignalType.CV
            );
            expect(audioIn, 'LinearVCA should have audio input').toBeDefined();
            expect(cvIn, 'LinearVCA should have CV input').toBeDefined();
        });
    });
});
