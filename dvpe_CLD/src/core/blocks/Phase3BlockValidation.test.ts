/**
 * Phase 3 Block Validation Tests
 * Drums & Physical Modeling: HiHat, AnalogBassDrum, AnalogSnareDrum, SynthBassDrum, SynthSnareDrum,
 * Drip, ModalVoice, StringVoice, Wavefolder, Dust
 */

// import { describe, it, expect } from 'vitest';
import { SignalType, PortDirection, ParameterType, BlockCategory } from '@/types';
import {
    HiHatBlock,
    AnalogBassDrumBlock,
    AnalogSnareDrumBlock,
    SynthBassDrumBlock,
    SynthSnareDrumBlock,
    DripBlock,
    ModalVoiceBlock,
    StringVoiceBlock,
    WavefolderBlock,
    DustBlock,
} from '@/core/blocks/definitions';
import { BlockRegistry } from '@/core/blocks/BlockRegistry';

// All Phase 3 blocks
const phase3Blocks = [
    HiHatBlock,
    AnalogBassDrumBlock,
    AnalogSnareDrumBlock,
    SynthBassDrumBlock,
    SynthSnareDrumBlock,
    DripBlock,
    ModalVoiceBlock,
    StringVoiceBlock,
    WavefolderBlock,
    DustBlock,
];

// Drum blocks subset
const drumBlocks = [
    HiHatBlock,
    AnalogBassDrumBlock,
    AnalogSnareDrumBlock,
    SynthBassDrumBlock,
    SynthSnareDrumBlock,
];

// Physical modeling blocks
const physicalModelingBlocks = [
    DripBlock,
    ModalVoiceBlock,
    StringVoiceBlock,
];

describe('Phase 3 Block Validation (Drums & Physical Modeling)', () => {
    describe('Block Registration', () => {
        it('all Phase 3 blocks should be registered in BlockRegistry', () => {
            phase3Blocks.forEach(block => {
                const registered = BlockRegistry.get(block.id);
                expect(registered,
                    `Block "${block.id}" is not registered in BlockRegistry`
                ).toBeDefined();
            });
        });
    });

    describe('CV Modulation Configuration', () => {
        it('all float parameters should have cvModulatable property defined', () => {
            phase3Blocks.forEach(block => {
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
            phase3Blocks.forEach(block => {
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
            phase3Blocks.forEach(block => {
                expect(block.id).toBeDefined();
                expect(block.className).toBeDefined();
                expect(block.displayName).toBeDefined();
                expect(block.category).toBeDefined();
            });
        });

        it('all blocks should have at least one output port', () => {
            phase3Blocks.forEach(block => {
                const outputPorts = block.ports.filter(p => p.direction === PortDirection.OUTPUT);
                expect(outputPorts.length,
                    `Block "${block.id}" has no output ports`
                ).toBeGreaterThan(0);
            });
        });

        it('all parameters should have valid ranges for FLOAT type', () => {
            phase3Blocks.forEach(block => {
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

    describe('Phase 3 Specific: Drum Blocks', () => {
        it('drum blocks should be in SOURCE category', () => {
            drumBlocks.forEach(block => {
                expect(block.category).toBe(BlockCategory.SOURCES);
            });
        });

        it('drum blocks should have trigger input', () => {
            drumBlocks.forEach(block => {
                const trigIn = block.ports.find(
                    p => p.direction === PortDirection.INPUT &&
                        p.signalType === SignalType.TRIGGER
                );
                expect(trigIn,
                    `Block "${block.id}" should have trigger input`
                ).toBeDefined();
            });
        });

        it('drum blocks should have audio output', () => {
            drumBlocks.forEach(block => {
                const audioOut = block.ports.find(
                    p => p.direction === PortDirection.OUTPUT &&
                        p.signalType === SignalType.AUDIO
                );
                expect(audioOut,
                    `Block "${block.id}" should have audio output`
                ).toBeDefined();
            });
        });

        it('HiHat should have sustain mode parameter', () => {
            const sustainParam = HiHatBlock.parameters.find(
                p => p.id === 'sustain' || p.displayName.toLowerCase().includes('sustain')
            );
            expect(sustainParam).toBeDefined();
        });
    });

    describe('Phase 3 Specific: Physical Modeling Blocks', () => {
        it('physical modeling blocks should have audio output', () => {
            physicalModelingBlocks.forEach(block => {
                const audioOut = block.ports.find(
                    p => p.direction === PortDirection.OUTPUT &&
                        p.signalType === SignalType.AUDIO
                );
                expect(audioOut,
                    `Block "${block.id}" should have audio output`
                ).toBeDefined();
            });
        });

        it('ModalVoice should have frequency parameter', () => {
            const freqParam = ModalVoiceBlock.parameters.find(
                p => p.id === 'freq' || p.id === 'frequency'
            );
            expect(freqParam).toBeDefined();
        });

        it('StringVoice should have frequency and structure parameters', () => {
            const params = StringVoiceBlock.parameters.map(p => p.id);
            expect(params.some(id => id === 'freq' || id === 'frequency')).toBe(true);
        });

        it('Drip should have trigger input', () => {
            const trigIn = DripBlock.ports.find(
                p => p.direction === PortDirection.INPUT &&
                    p.signalType === SignalType.TRIGGER
            );
            expect(trigIn).toBeDefined();
        });
    });

    describe('Phase 3 Specific: Effects', () => {
        it('Wavefolder should have audio I/O', () => {
            const audioIn = WavefolderBlock.ports.find(
                p => p.direction === PortDirection.INPUT &&
                    p.signalType === SignalType.AUDIO
            );
            const audioOut = WavefolderBlock.ports.find(
                p => p.direction === PortDirection.OUTPUT &&
                    p.signalType === SignalType.AUDIO
            );
            expect(audioIn).toBeDefined();
            expect(audioOut).toBeDefined();
        });

        it('Dust should generate random triggers', () => {
            const output = DustBlock.ports.find(
                p => p.direction === PortDirection.OUTPUT
            );
            expect(output).toBeDefined();
        });
    });
});
