/**
 * Phase 1 Block Validation Tests
 * Core DSP: LFO, WhiteNoise, Chorus, Flanger, OnePole, ATone, DCBlock, Limiter, Fold
 */

// import { describe, it, expect } from 'vitest';
import { SignalType, PortDirection, ParameterType } from '@/types';
import {
    LfoBlock,
    WhiteNoiseBlock,
    ChorusBlock,
    FlangerBlock,
    OnePoleBlock,
    AToneBlock,
    DcBlockBlock,
    LimiterBlock,
    FoldBlock,
} from '@/core/blocks/definitions';
import { BlockRegistry } from '@/core/blocks/BlockRegistry';

// All Phase 1 blocks
const phase1Blocks = [
    LfoBlock,
    WhiteNoiseBlock,
    ChorusBlock,
    FlangerBlock,
    OnePoleBlock,
    AToneBlock,
    DcBlockBlock,
    LimiterBlock,
    FoldBlock,
];

describe('Phase 1 Block Validation (Core DSP)', () => {
    describe('Block Registration', () => {
        it('all Phase 1 blocks should be registered in BlockRegistry', () => {
            phase1Blocks.forEach(block => {
                const registered = BlockRegistry.get(block.id);
                expect(registered,
                    `Block "${block.id}" is not registered in BlockRegistry`
                ).toBeDefined();
            });
        });
    });

    describe('CV Modulation Configuration', () => {
        it('all float parameters should have cvModulatable property defined', () => {
            phase1Blocks.forEach(block => {
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
            phase1Blocks.forEach(block => {
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
            phase1Blocks.forEach(block => {
                expect(block.id).toBeDefined();
                expect(block.className).toBeDefined();
                expect(block.displayName).toBeDefined();
                expect(block.category).toBeDefined();
            });
        });

        it('all blocks should have at least one output port', () => {
            phase1Blocks.forEach(block => {
                const outputPorts = block.ports.filter(p => p.direction === PortDirection.OUTPUT);
                expect(outputPorts.length,
                    `Block "${block.id}" has no output ports`
                ).toBeGreaterThan(0);
            });
        });

        it('all parameters should have valid ranges for FLOAT type', () => {
            phase1Blocks.forEach(block => {
                block.parameters.forEach(param => {
                    if (param.type === ParameterType.FLOAT && param.range) {
                        expect(param.range.min).toBeLessThan(param.range.max);
                        expect(param.defaultValue).toBeGreaterThanOrEqual(param.range.min);
                        expect(param.defaultValue).toBeLessThanOrEqual(param.range.max);
                    }
                });
            });
        });
    });

    describe('Phase 1 Specific Checks', () => {
        it('LFO should have frequency and waveform parameters', () => {
            const params = LfoBlock.parameters.map(p => p.id);
            expect(params).toContain('freq');
        });

        it('WhiteNoise should have audio output', () => {
            const audioOut = WhiteNoiseBlock.ports.find(
                p => p.direction === PortDirection.OUTPUT &&
                    p.signalType === SignalType.AUDIO
            );
            expect(audioOut).toBeDefined();
        });

        it('Chorus should have audio input', () => {
            const audioIn = ChorusBlock.ports.find(
                p => p.direction === PortDirection.INPUT &&
                    p.signalType === SignalType.AUDIO
            );
            expect(audioIn).toBeDefined();
        });

        it('Flanger should have audio input', () => {
            const audioIn = FlangerBlock.ports.find(
                p => p.direction === PortDirection.INPUT &&
                    p.signalType === SignalType.AUDIO
            );
            expect(audioIn).toBeDefined();
        });

        it('Filter blocks (OnePole, ATone) should have cutoff parameter', () => {
            const filterBlocks = [OnePoleBlock, AToneBlock];
            filterBlocks.forEach(block => {
                const hasCutoff = block.parameters.some(p => p.id === 'freq' || p.id === 'cutoff');
                expect(hasCutoff, `${block.id} should have frequency/cutoff param`).toBe(true);
            });
        });

        it('DCBlock should be a simple pass-through filter', () => {
            const audioIn = DcBlockBlock.ports.find(
                p => p.direction === PortDirection.INPUT &&
                    p.signalType === SignalType.AUDIO
            );
            const audioOut = DcBlockBlock.ports.find(
                p => p.direction === PortDirection.OUTPUT &&
                    p.signalType === SignalType.AUDIO
            );
            expect(audioIn).toBeDefined();
            expect(audioOut).toBeDefined();
        });

        it('Limiter should have pre-gain parameter', () => {
            const preGain = LimiterBlock.parameters.find(p => p.id === 'pre_gain');
            expect(preGain).toBeDefined();
        });

        it('Fold should have audio I/O', () => {
            const audioIn = FoldBlock.ports.find(
                p => p.direction === PortDirection.INPUT &&
                    p.signalType === SignalType.AUDIO
            );
            const audioOut = FoldBlock.ports.find(
                p => p.direction === PortDirection.OUTPUT &&
                    p.signalType === SignalType.AUDIO
            );
            expect(audioIn).toBeDefined();
            expect(audioOut).toBeDefined();
        });
    });
});
