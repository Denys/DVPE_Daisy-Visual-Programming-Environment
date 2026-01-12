/**
 * Phase 4 Block Validation Tests
 * Based on dvpe_bugs.md checklist - validates blocks follow best practices
 */

// import { describe, it, expect } from 'vitest';
import { SignalType, PortDirection, ParameterType } from '@/types';
import {
    // Phase 4A: DaisySP Effects
    DecimatorBlock,
    PhaserBlock,
    TremoloBlock,
    AutowahBlock,
    ResonatorBlock,
    PluckBlock,
    CrossFadeBlock,
    SampleRateReducerBlock,
    // Phase 4B: Inline Utilities
    PanBlock,
    BalanceBlock,
    SoftClipBlock,
    HardClipBlock,
    RectifierBlock,
    SlewBlock,
    SmoothBlock,
    GateBlock,
    // Phase 4C: Complex
    BitcrushBlock,
    DistortionBlock,
    StereoMixerBlock,
    PitchShifterBlock,
} from '@/core/blocks/definitions';
import { BlockRegistry } from '@/core/blocks/BlockRegistry';

// All Phase 4 blocks for iteration
const phase4Blocks = [
    // Phase 4A
    DecimatorBlock,
    PhaserBlock,
    TremoloBlock,
    AutowahBlock,
    ResonatorBlock,
    PluckBlock,
    CrossFadeBlock,
    SampleRateReducerBlock,
    // Phase 4B
    PanBlock,
    BalanceBlock,
    SoftClipBlock,
    HardClipBlock,
    RectifierBlock,
    SlewBlock,
    SmoothBlock,
    GateBlock,
    // Phase 4C
    BitcrushBlock,
    DistortionBlock,
    StereoMixerBlock,
    PitchShifterBlock,
];

describe('Phase 4 Block Validation (dvpe_bugs.md)', () => {
    // Bug #001: Missing CV Toggle - cvModulatable check
    describe('Bug #001: CV Modulation Configuration', () => {
        it('all float parameters should have cvModulatable property defined', () => {
            phase4Blocks.forEach(block => {
                block.parameters.forEach(param => {
                    if (param.type === ParameterType.FLOAT) {
                        expect(param).toHaveProperty('cvModulatable');
                    }
                });
            });
        });
    });

    // Bug #002: Missing CV Ports - port/parameter alignment
    describe('Bug #002: CV Port/Parameter Alignment', () => {
        it('cvModulatable parameters should have corresponding CV input ports', () => {
            phase4Blocks.forEach(block => {
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

    // Bug #003: Block Registration
    describe('Bug #003: Block Registration', () => {
        it('all Phase 4 blocks should be registered in BlockRegistry', () => {
            phase4Blocks.forEach(block => {
                const registered = BlockRegistry.get(block.id);
                expect(registered,
                    `Block "${block.id}" is not registered in BlockRegistry`
                ).toBeDefined();
            });
        });
    });

    // Basic block structure validation
    describe('Block Structure Validation', () => {
        it('all blocks should have required identity fields', () => {
            phase4Blocks.forEach(block => {
                expect(block.id).toBeDefined();
                expect(block.className).toBeDefined();
                expect(block.displayName).toBeDefined();
                expect(block.category).toBeDefined();
            });
        });

        it('all blocks should have at least one output port', () => {
            phase4Blocks.forEach(block => {
                const outputPorts = block.ports.filter(p => p.direction === PortDirection.OUTPUT);
                expect(outputPorts.length,
                    `Block "${block.id}" has no output ports`
                ).toBeGreaterThan(0);
            });
        });

        it('all blocks should have description and documentation', () => {
            phase4Blocks.forEach(block => {
                expect(block.description,
                    `Block "${block.id}" missing description`
                ).toBeDefined();
                expect(block.documentation,
                    `Block "${block.id}" missing documentation`
                ).toBeDefined();
            });
        });

        it('all parameters should have valid ranges for FLOAT type', () => {
            phase4Blocks.forEach(block => {
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

    // Phase 4 specific checks
    describe('Phase 4A: DaisySP Effects', () => {
        const phase4ABlocks = [
            DecimatorBlock, PhaserBlock, TremoloBlock, AutowahBlock,
            ResonatorBlock, PluckBlock, CrossFadeBlock, SampleRateReducerBlock
        ];

        it('DaisySP effect blocks should have audio input port', () => {
            // Exclude Pluck which uses trigger
            const effectsWithAudioIn = phase4ABlocks.filter(b => b.id !== 'pluck');

            effectsWithAudioIn.forEach(block => {
                const audioIn = block.ports.find(
                    p => p.direction === PortDirection.INPUT &&
                        p.signalType === SignalType.AUDIO
                );
                expect(audioIn,
                    `Block "${block.id}" should have audio input`
                ).toBeDefined();
            });
        });

        it('Pluck block should have trigger input', () => {
            const trigPort = PluckBlock.ports.find(
                p => p.id === 'trig' && p.signalType === SignalType.TRIGGER
            );
            expect(trigPort).toBeDefined();
        });

        it('CrossFade should have two audio inputs', () => {
            const audioIns = CrossFadeBlock.ports.filter(
                p => p.direction === PortDirection.INPUT &&
                    p.signalType === SignalType.AUDIO
            );
            expect(audioIns.length).toBe(2);
        });
    });

    describe('Phase 4B: Inline Utilities', () => {
        const phase4BBlocks = [
            PanBlock, BalanceBlock, SoftClipBlock, HardClipBlock,
            RectifierBlock, SlewBlock, SmoothBlock, GateBlock
        ];

        it('inline blocks should have inline className prefix', () => {
            phase4BBlocks.forEach(block => {
                expect(block.className.startsWith('inline::'),
                    `Block "${block.id}" className should start with "inline::"`
                ).toBe(true);
            });
        });

        it('Pan block should have stereo outputs', () => {
            const leftOut = PanBlock.ports.find(p => p.id === 'left');
            const rightOut = PanBlock.ports.find(p => p.id === 'right');
            expect(leftOut).toBeDefined();
            expect(rightOut).toBeDefined();
        });

        it('Balance block should have stereo I/O', () => {
            const stereoInputs = BalanceBlock.ports.filter(
                p => p.direction === PortDirection.INPUT &&
                    p.signalType === SignalType.AUDIO
            );
            const stereoOutputs = BalanceBlock.ports.filter(
                p => p.direction === PortDirection.OUTPUT &&
                    p.signalType === SignalType.AUDIO
            );
            expect(stereoInputs.length).toBe(2);
            expect(stereoOutputs.length).toBe(2);
        });
    });

    describe('Phase 4C: Complex Blocks', () => {
        it('StereoMixer should have 4 channel inputs', () => {
            const channelInputs = StereoMixerBlock.ports.filter(
                p => p.direction === PortDirection.INPUT &&
                    p.signalType === SignalType.AUDIO
            );
            expect(channelInputs.length).toBe(4);
        });

        it('StereoMixer should have stereo output', () => {
            const leftOut = StereoMixerBlock.ports.find(p => p.id === 'left');
            const rightOut = StereoMixerBlock.ports.find(p => p.id === 'right');
            expect(leftOut).toBeDefined();
            expect(rightOut).toBeDefined();
        });

        it('Distortion block should have drive, tone, and level parameters', () => {
            const params = DistortionBlock.parameters.map(p => p.id);
            expect(params).toContain('drive');
            expect(params).toContain('tone');
            expect(params).toContain('level');
        });
    });
});
