/**
 * Synthesis Blocks Validation Tests
 * FormantOscillator, Vosim, VariableShapeOscillator, HarmonicOscillator,
 * OscillatorBank, VariableSawOscillator, ZOscillator
 */

import { SignalType, PortDirection, ParameterType, BlockCategory } from '@/types';
import {
    FormantOscillatorBlock,
    VosimOscillatorBlock,
    VariableShapeOscillatorBlock,
    HarmonicOscillatorBlock,
    OscillatorBankBlock,
    VariableSawOscillatorBlock,
    ZOscillatorBlock,
} from '@/core/blocks/definitions';
import { BlockRegistry } from '@/core/blocks/BlockRegistry';

// All new synthesis blocks
const synthesisBlocks = [
    FormantOscillatorBlock,
    VosimOscillatorBlock,
    VariableShapeOscillatorBlock,
    HarmonicOscillatorBlock,
    OscillatorBankBlock,
    VariableSawOscillatorBlock,
    ZOscillatorBlock,
];

describe('Synthesis Blocks Validation (DaisySP Gap Fill)', () => {
    describe('Block Registration', () => {
        it('all synthesis blocks should be registered in BlockRegistry', () => {
            synthesisBlocks.forEach(block => {
                const registered = BlockRegistry.get(block.id);
                expect(registered,
                    `Block "${block.id}" is not registered in BlockRegistry`
                ).toBeDefined();
            });
        });
    });

    describe('CV Modulation Configuration', () => {
        it('all float parameters should have cvModulatable property defined', () => {
            synthesisBlocks.forEach(block => {
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
            synthesisBlocks.forEach(block => {
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
            synthesisBlocks.forEach(block => {
                expect(block.id).toBeDefined();
                expect(block.className).toBeDefined();
                expect(block.displayName).toBeDefined();
                expect(block.category).toBeDefined();
            });
        });

        it('all blocks should have at least one output port', () => {
            synthesisBlocks.forEach(block => {
                const outputPorts = block.ports.filter(p => p.direction === PortDirection.OUTPUT);
                expect(outputPorts.length,
                    `Block "${block.id}" has no output ports`
                ).toBeGreaterThan(0);
            });
        });

        it('all parameters should have valid ranges for FLOAT type', () => {
            synthesisBlocks.forEach(block => {
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

    describe('Synthesis Block Specific Checks', () => {
        it('FormantOscillator should have carrier_freq and formant_freq', () => {
            const params = FormantOscillatorBlock.parameters.map(p => p.id);
            expect(params).toContain('carrier_freq');
            expect(params).toContain('formant_freq');
        });

        it('VosimOscillator should have freq, form1_freq, form2_freq', () => {
            const params = VosimOscillatorBlock.parameters.map(p => p.id);
            expect(params).toContain('freq');
            expect(params).toContain('form1_freq');
            expect(params).toContain('form2_freq');
        });

        it('VariableShapeOscillator should have freq, waveshape, sync_enable', () => {
            const params = VariableShapeOscillatorBlock.parameters.map(p => p.id);
            expect(params).toContain('freq');
            expect(params).toContain('waveshape');
            expect(params).toContain('sync_enable');
        });

        it('HarmonicOscillator should have freq and first_harm_idx', () => {
            const params = HarmonicOscillatorBlock.parameters.map(p => p.id);
            expect(params).toContain('freq');
            expect(params).toContain('first_harm_idx');
            // Check it has amplitude controls
            const ampParams = params.filter(p => p.startsWith('amp_'));
            expect(ampParams.length).toBe(8);
        });

        it('OscillatorBank should have freq and gain', () => {
            const params = OscillatorBankBlock.parameters.map(p => p.id);
            expect(params).toContain('freq');
            expect(params).toContain('gain');
        });

        it('VariableSawOscillator should have freq, pw, waveshape', () => {
            const params = VariableSawOscillatorBlock.parameters.map(p => p.id);
            expect(params).toContain('freq');
            expect(params).toContain('pw');
            expect(params).toContain('waveshape');
        });

        it('ZOscillator should have freq, formant_freq, shape, mode', () => {
            const params = ZOscillatorBlock.parameters.map(p => p.id);
            expect(params).toContain('freq');
            expect(params).toContain('formant_freq');
            expect(params).toContain('shape');
            expect(params).toContain('mode');
        });

        it('all oscillators should have audio output', () => {
            synthesisBlocks.forEach(block => {
                const audioOut = block.ports.find(
                    p => p.direction === PortDirection.OUTPUT &&
                        p.signalType === SignalType.AUDIO
                );
                expect(audioOut, `${block.id} should have audio output`).toBeDefined();
            });
        });

        it('all blocks should be in SOURCES category', () => {
            synthesisBlocks.forEach(block => {
                expect(block.category).toBe(BlockCategory.SOURCES);
            });
        });
    });
});
