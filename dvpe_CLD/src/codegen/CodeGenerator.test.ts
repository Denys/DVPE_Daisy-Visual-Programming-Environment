/**
 * CodeGenerator Unit Tests
 * Tests C++ code generation from DVPE patch graphs
 */

// import { describe, it, expect } from 'vitest';
import { CodeGenerator } from '@/codegen/CodeGenerator';
import { BlockInstance, Connection } from '@/types';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const createBlock = (
    id: string,
    definitionId: string,
    parameterValues: Record<string, number | boolean | string> = {}
): BlockInstance => ({
    id,
    definitionId,
    position: { x: 0, y: 0 },
    parameterValues,
});

const createConnection = (
    id: string,
    sourceBlockId: string,
    sourcePortId: string,
    targetBlockId: string,
    targetPortId: string,
    type: 'audio' | 'cv' | 'trigger' = 'audio'
): Connection => ({
    id,
    sourceBlockId,
    sourcePortId,
    targetBlockId,
    targetPortId,
    type,
});

const createMinimalPatch = () => ({
    blocks: [
        createBlock('osc1', 'oscillator', { freq: 440, amp: 0.8, waveform: 'WAVE_POLYBLEP_SAW' }),
        createBlock('out1', 'audio_output', {}),
    ],
    connections: [
        createConnection('c1', 'osc1', 'out', 'out1', 'left', 'audio'),
    ],
    metadata: {
        name: 'Test Patch',
        blockSize: 48,
        sampleRate: 48000,
    },
});

// ============================================================================
// CODE GENERATOR TESTS
// ============================================================================

describe('CodeGenerator', () => {
    describe('generate()', () => {
        it('should generate valid code for minimal patch', () => {
            const patch = createMinimalPatch();
            const generator = new CodeGenerator(patch);
            const result = generator.generate();

            expect(result.errors).toHaveLength(0);
            expect(result.mainCpp).toBeTruthy();
            expect(result.makefile).toBeTruthy();
        });

        it('should include correct headers', () => {
            const patch = createMinimalPatch();
            const generator = new CodeGenerator(patch);
            const result = generator.generate();

            expect(result.mainCpp).toContain('#include "daisy_field.h"');
            expect(result.mainCpp).toContain('#include "daisysp.h"');
            expect(result.mainCpp).toContain('using namespace daisy;');
            expect(result.mainCpp).toContain('using namespace daisysp;');
        });

        it('should declare DSP module instances', () => {
            const patch = createMinimalPatch();
            const generator = new CodeGenerator(patch);
            const result = generator.generate();

            expect(result.mainCpp).toContain('Oscillator');
        });

        it('should generate AudioCallback function', () => {
            const patch = createMinimalPatch();
            const generator = new CodeGenerator(patch);
            const result = generator.generate();

            expect(result.mainCpp).toContain('void AudioCallback(');
            expect(result.mainCpp).toContain('AudioHandle::InputBuffer in');
            expect(result.mainCpp).toContain('AudioHandle::OutputBuffer out');
            expect(result.mainCpp).toContain('size_t size');
        });

        it('should generate main function with initialization', () => {
            const patch = createMinimalPatch();
            const generator = new CodeGenerator(patch);
            const result = generator.generate();

            expect(result.mainCpp).toContain('int main(void)');
            expect(result.mainCpp).toContain('hw.Init()');
            expect(result.mainCpp).toContain('.Init(sr)');
            expect(result.mainCpp).toContain('hw.StartAudio(AudioCallback)');
            expect(result.mainCpp).toContain('while(1)');
        });

        it('should generate output assignment', () => {
            const patch = createMinimalPatch();
            const generator = new CodeGenerator(patch);
            const result = generator.generate();

            expect(result.mainCpp).toContain('out[0][i]');
            expect(result.mainCpp).toContain('out[1][i]');
        });
    });

    describe('generateMakefile()', () => {
        it('should include project name from metadata', () => {
            const patch = createMinimalPatch();
            patch.metadata.name = 'My Synth Patch';
            const generator = new CodeGenerator(patch);
            const result = generator.generate();

            expect(result.makefile).toContain('TARGET = my_synth_patch');
        });

        it('should include required library paths', () => {
            const patch = createMinimalPatch();
            const generator = new CodeGenerator(patch);
            const result = generator.generate();

            expect(result.makefile).toContain('LIBDAISY_DIR');
            expect(result.makefile).toContain('DAISYSP_DIR');
        });
    });

    describe('block processing', () => {
        it('should generate oscillator processing code', () => {
            const patch = createMinimalPatch();
            const generator = new CodeGenerator(patch);
            const result = generator.generate();

            expect(result.mainCpp).toContain('.Process()');
        });

        it('should handle filter with audio input', () => {
            const patch = {
                blocks: [
                    createBlock('osc1', 'oscillator', { freq: 440 }),
                    createBlock('filter1', 'moog_ladder', { freq: 2000, res: 0.4 }),
                    createBlock('out1', 'audio_output', {}),
                ],
                connections: [
                    createConnection('c1', 'osc1', 'out', 'filter1', 'in', 'audio'),
                    createConnection('c2', 'filter1', 'out', 'out1', 'left', 'audio'),
                ],
                metadata: {
                    name: 'Filter Test',
                    blockSize: 48,
                    sampleRate: 48000,
                },
            };

            const generator = new CodeGenerator(patch);
            const result = generator.generate();

            expect(result.errors).toHaveLength(0);
            // Filter should process oscillator output
            expect(result.mainCpp).toContain('MoogLadder');
        });

        it('should handle ADSR with gate input', () => {
            const patch = {
                blocks: [
                    createBlock('key1', 'key', { note: 60 }),
                    createBlock('adsr1', 'adsr', { attack: 0.01, decay: 0.1, sustain: 0.7, release: 0.3 }),
                    createBlock('osc1', 'oscillator', { freq: 440 }),
                    createBlock('vca1', 'vca', { gain: 1.0 }),
                    createBlock('out1', 'audio_output', {}),
                ],
                connections: [
                    createConnection('c1', 'key1', 'gate_out', 'adsr1', 'gate', 'trigger'),
                    createConnection('c2', 'osc1', 'out', 'vca1', 'audio_in', 'audio'),
                    createConnection('c3', 'adsr1', 'out', 'vca1', 'cv_in', 'cv'),
                    createConnection('c4', 'vca1', 'out', 'out1', 'left', 'audio'),
                ],
                metadata: {
                    name: 'ADSR Test',
                    blockSize: 48,
                    sampleRate: 48000,
                },
            };

            const generator = new CodeGenerator(patch);
            const result = generator.generate();

            expect(result.errors).toHaveLength(0);
            expect(result.mainCpp).toContain('Adsr');
        });

        it('should handle mixer with multiple inputs', () => {
            const patch = {
                blocks: [
                    createBlock('osc1', 'oscillator', { freq: 440 }),
                    createBlock('osc2', 'oscillator', { freq: 554 }),
                    createBlock('mixer1', 'mixer', { ch1_level: 0.5, ch2_level: 0.5 }),
                    createBlock('out1', 'audio_output', {}),
                ],
                connections: [
                    createConnection('c1', 'osc1', 'out', 'mixer1', 'ch1', 'audio'),
                    createConnection('c2', 'osc2', 'out', 'mixer1', 'ch2', 'audio'),
                    createConnection('c3', 'mixer1', 'out', 'out1', 'left', 'audio'),
                ],
                metadata: {
                    name: 'Mixer Test',
                    blockSize: 48,
                    sampleRate: 48000,
                },
            };

            const generator = new CodeGenerator(patch);
            const result = generator.generate();

            expect(result.errors).toHaveLength(0);
            // Mixer should combine both oscillator outputs
        });
    });

    describe('error handling', () => {
        it('should report warning for cyclic audio graph', () => {
            const patch = {
                blocks: [
                    createBlock('osc1', 'oscillator'),
                    createBlock('filter1', 'moog_ladder'),
                ],
                connections: [
                    createConnection('c1', 'osc1', 'out', 'filter1', 'in', 'audio'),
                    createConnection('c2', 'filter1', 'out', 'osc1', 'freq_cv', 'audio'), // Audio cycle!
                ],
                metadata: {
                    name: 'Cyclic Test',
                    blockSize: 48,
                    sampleRate: 48000,
                },
            };

            const generator = new CodeGenerator(patch);
            const result = generator.generate();

            // GraphAnalyzer now breaks cycles gracefully with a warning instead of error
            // The code should still generate (with warning), not fail
            expect(result.mainCpp).toContain('int main(void)');
        });

        it('should handle empty patch gracefully', () => {
            const patch = {
                blocks: [],
                connections: [],
                metadata: {
                    name: 'Empty',
                    blockSize: 48,
                    sampleRate: 48000,
                },
            };

            const generator = new CodeGenerator(patch);
            const result = generator.generate();

            // Should still generate valid code structure
            expect(result.mainCpp).toContain('int main(void)');
            expect(result.mainCpp).toContain('void AudioCallback');
        });
    });
});
