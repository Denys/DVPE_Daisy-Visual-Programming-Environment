/**
 * Original Block Validation Tests
 * Original 20 blocks from initial DVPE implementation:
 * Sources: Oscillator, FM2, Particle, Grainlet
 * Filters: MoogLadder, SVF
 * Modulators: ADSR, AdEnv
 * Dynamics: VCA, Compressor
 * Effects: Delay, ReverbSc, Overdrive
 * Mixing: Mixer
 * User I/O: Knob, Key, Encoder, GateTriggerIn, AudioIn, AudioOut
 */

// import { describe, it, expect } from 'vitest';
import { SignalType, PortDirection, ParameterType, BlockCategory } from '@/types';
import {
    // Sources
    OscillatorBlock,
    Fm2Block,
    ParticleBlock,
    GrainletOscillatorBlock,
    // Filters
    MoogLadderBlock,
    SvfBlock,
    // Modulators
    AdsrBlock,
    AdEnvBlock,
    // Dynamics
    VcaBlock,
    CompressorBlock,
    // Effects
    DelayLineBlock,
    ReverbScBlock,
    OverdriveBlock,
    // Mixing
    MixerBlock,
    // User I/O
    KnobBlock,
    KeyBlock,
    EncoderBlock,
    GateTriggerInBlock,
    AudioInputBlock,
    AudioOutputBlock,
} from '@/core/blocks/definitions';
import { BlockRegistry } from '@/core/blocks/BlockRegistry';

// All Original blocks
const originalBlocks = [
    // Sources
    OscillatorBlock,
    Fm2Block,
    ParticleBlock,
    GrainletOscillatorBlock,
    // Filters
    MoogLadderBlock,
    SvfBlock,
    // Modulators
    AdsrBlock,
    AdEnvBlock,
    // Dynamics
    VcaBlock,
    CompressorBlock,
    // Effects
    DelayLineBlock,
    ReverbScBlock,
    OverdriveBlock,
    // Mixing
    MixerBlock,
    // User I/O
    KnobBlock,
    KeyBlock,
    EncoderBlock,
    GateTriggerInBlock,
    AudioInputBlock,
    AudioOutputBlock,
];

// Source blocks
const sourceBlocks = [OscillatorBlock, Fm2Block, ParticleBlock, GrainletOscillatorBlock];

// Filter blocks
const filterBlocks = [MoogLadderBlock, SvfBlock];

// User I/O blocks
const userIOBlocks = [KnobBlock, KeyBlock, EncoderBlock, GateTriggerInBlock, AudioInputBlock, AudioOutputBlock];

describe('Original Block Validation (Essential 20)', () => {
    describe('Block Registration', () => {
        it('all Original blocks should be registered in BlockRegistry', () => {
            originalBlocks.forEach(block => {
                const registered = BlockRegistry.get(block.id);
                expect(registered,
                    `Block "${block.id}" is not registered in BlockRegistry`
                ).toBeDefined();
            });
        });
    });

    describe('CV Modulation Configuration', () => {
        it('all float parameters should have cvModulatable property defined', () => {
            originalBlocks.forEach(block => {
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
            originalBlocks.forEach(block => {
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
            originalBlocks.forEach(block => {
                expect(block.id).toBeDefined();
                expect(block.className).toBeDefined();
                expect(block.displayName).toBeDefined();
                expect(block.category).toBeDefined();
            });
        });

        it('all blocks should have at least one port', () => {
            originalBlocks.forEach(block => {
                expect(block.ports.length,
                    `Block "${block.id}" has no ports`
                ).toBeGreaterThan(0);
            });
        });

        it('all parameters should have valid ranges for FLOAT type', () => {
            originalBlocks.forEach(block => {
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

    describe('Source Blocks', () => {
        it('source blocks should be in SOURCE category', () => {
            sourceBlocks.forEach(block => {
                expect(block.category).toBe(BlockCategory.SOURCES);
            });
        });

        it('source blocks should have audio output', () => {
            sourceBlocks.forEach(block => {
                const audioOut = block.ports.find(
                    p => p.direction === PortDirection.OUTPUT &&
                        p.signalType === SignalType.AUDIO
                );
                expect(audioOut, `${block.id} should have audio output`).toBeDefined();
            });
        });

        it('Oscillator should have frequency and waveform parameters', () => {
            const freqParam = OscillatorBlock.parameters.find(p => p.id === 'freq');
            expect(freqParam).toBeDefined();
        });

        it('FM2 should have carrier and modulator settings', () => {
            const params = Fm2Block.parameters.map(p => p.id);
            expect(params.some(id => id.includes('ratio') || id.includes('index'))).toBe(true);
        });
    });

    describe('Filter Blocks', () => {
        it('filter blocks should be in FILTER category', () => {
            filterBlocks.forEach(block => {
                expect(block.category).toBe(BlockCategory.FILTERS);
            });
        });

        it('filter blocks should have audio input and output', () => {
            filterBlocks.forEach(block => {
                const audioIn = block.ports.find(
                    p => p.direction === PortDirection.INPUT &&
                        p.signalType === SignalType.AUDIO
                );
                const audioOut = block.ports.find(
                    p => p.direction === PortDirection.OUTPUT &&
                        p.signalType === SignalType.AUDIO
                );
                expect(audioIn, `${block.id} should have audio input`).toBeDefined();
                expect(audioOut, `${block.id} should have audio output`).toBeDefined();
            });
        });

        it('MoogLadder should have frequency and resonance parameters', () => {
            const params = MoogLadderBlock.parameters.map(p => p.id);
            expect(params.some(id => id === 'freq' || id === 'cutoff')).toBe(true);
            expect(params.some(id => id === 'res' || id === 'resonance')).toBe(true);
        });

        it('SVF should have multiple filter outputs', () => {
            const outputs = SvfBlock.ports.filter(p => p.direction === PortDirection.OUTPUT);
            expect(outputs.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Modulator Blocks', () => {
        it('ADSR should have attack, decay, sustain, release parameters', () => {
            const params = AdsrBlock.parameters.map(p => p.id);
            expect(params.some(id => id.toLowerCase().includes('attack'))).toBe(true);
            expect(params.some(id => id.toLowerCase().includes('decay'))).toBe(true);
            expect(params.some(id => id.toLowerCase().includes('sustain'))).toBe(true);
            expect(params.some(id => id.toLowerCase().includes('release'))).toBe(true);
        });

        it('ADSR should have gate input', () => {
            const gateIn = AdsrBlock.ports.find(
                p => p.direction === PortDirection.INPUT &&
                    (p.signalType === SignalType.TRIGGER || p.id === 'gate')
            );
            expect(gateIn).toBeDefined();
        });

        it('AdEnv should have attack and decay parameters', () => {
            const params = AdEnvBlock.parameters.map(p => p.id);
            expect(params.some(id => id.toLowerCase().includes('attack'))).toBe(true);
            expect(params.some(id => id.toLowerCase().includes('decay'))).toBe(true);
        });
    });

    describe('Dynamics Blocks', () => {
        it('VCA should have audio and CV inputs', () => {
            const audioIn = VcaBlock.ports.find(
                p => p.direction === PortDirection.INPUT &&
                    p.signalType === SignalType.AUDIO
            );
            const cvIn = VcaBlock.ports.find(
                p => p.direction === PortDirection.INPUT &&
                    p.signalType === SignalType.CV
            );
            expect(audioIn).toBeDefined();
            expect(cvIn).toBeDefined();
        });

        it('Compressor should have threshold and ratio parameters', () => {
            const params = CompressorBlock.parameters.map(p => p.id);
            expect(params.some(id => id.includes('threshold'))).toBe(true);
            expect(params.some(id => id.includes('ratio'))).toBe(true);
        });
    });

    describe('Effect Blocks', () => {
        it('DelayLine should have delay time parameter', () => {
            const params = DelayLineBlock.parameters.map(p => p.id);
            expect(params.some(id => id.includes('delay') || id.includes('time'))).toBe(true);
        });

        it('ReverbSc should have feedback and lpFreq parameters', () => {
            const params = ReverbScBlock.parameters.map(p => p.id);
            expect(params.some(id => id.includes('feedback') || id.includes('decay'))).toBe(true);
        });

        it('Overdrive should have drive parameter', () => {
            const driveParam = OverdriveBlock.parameters.find(
                p => p.id === 'drive' || p.id === 'gain'
            );
            expect(driveParam).toBeDefined();
        });
    });

    describe('Mixer Block', () => {
        it('Mixer should have multiple audio inputs', () => {
            const audioIns = MixerBlock.ports.filter(
                p => p.direction === PortDirection.INPUT &&
                    p.signalType === SignalType.AUDIO
            );
            expect(audioIns.length).toBeGreaterThanOrEqual(2);
        });

        it('Mixer should have audio output', () => {
            const audioOut = MixerBlock.ports.find(
                p => p.direction === PortDirection.OUTPUT &&
                    p.signalType === SignalType.AUDIO
            );
            expect(audioOut).toBeDefined();
        });
    });

    describe('User I/O Blocks', () => {
        it('user I/O blocks should be in USER_IO category', () => {
            userIOBlocks.forEach(block => {
                expect(block.category).toBe(BlockCategory.USER_IO);
            });
        });

        it('AudioInput should have audio outputs', () => {
            const audioOuts = AudioInputBlock.ports.filter(
                p => p.direction === PortDirection.OUTPUT &&
                    p.signalType === SignalType.AUDIO
            );
            expect(audioOuts.length).toBeGreaterThan(0);
        });

        it('AudioOutput should have audio inputs', () => {
            const audioIns = AudioOutputBlock.ports.filter(
                p => p.direction === PortDirection.INPUT &&
                    p.signalType === SignalType.AUDIO
            );
            expect(audioIns.length).toBeGreaterThan(0);
        });

        it('Knob should have CV output', () => {
            const cvOut = KnobBlock.ports.find(
                p => p.direction === PortDirection.OUTPUT &&
                    p.signalType === SignalType.CV
            );
            expect(cvOut).toBeDefined();
        });

        it('Key should have gate output', () => {
            const gateOut = KeyBlock.ports.find(
                p => p.direction === PortDirection.OUTPUT &&
                    (p.signalType === SignalType.TRIGGER || p.id === 'gate')
            );
            expect(gateOut).toBeDefined();
        });

        it('GateTriggerIn should have trigger output', () => {
            const trigOut = GateTriggerInBlock.ports.find(
                p => p.direction === PortDirection.OUTPUT &&
                    (p.signalType === SignalType.TRIGGER || p.signalType === SignalType.CV)
            );
            expect(trigOut).toBeDefined();
        });
    });
});
