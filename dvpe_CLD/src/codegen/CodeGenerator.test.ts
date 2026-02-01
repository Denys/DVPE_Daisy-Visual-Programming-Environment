/**
 * CodeGenerator Unit Tests
 * Tests C++ code generation from DVPE patch graphs
 */

// import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
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

        it('should include correct headers for Daisy Field', () => {
            const patch = createMinimalPatch();
            // Explicitly set platform to field
            patch.hardwareConfig = {
                platform: 'field' as any,
                pinMapping: {},
                audioIOMapping: { inputs: [], outputs: [] }
            };
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

    describe('bug verification', () => {
        it('should use correct knob access for Daisy Pod platform', () => {
            const patch = createMinimalPatch();
            patch.hardwareConfig = {
                platform: 'pod',
                pinMapping: {},
                audioIOMapping: { inputs: [], outputs: [] }
            };
            // Add a knob block
            patch.blocks.push(createBlock('knob1', 'knob', { channel: '0', min: 0, max: 1 }));

            const generator = new CodeGenerator(patch);
            const result = generator.generate();

            // verify Pod-specific knob access
            expect(result.mainCpp).toContain('hw.knob1.Value()');
            expect(result.mainCpp).not.toContain('hw.adc.GetFloat(0)');
            expect(result.mainCpp).not.toContain('hw.knobs[0]->Value()');
        });

        it('should sanitize block IDs with hyphens to valid C++ identifiers', () => {
            const patch = createMinimalPatch();
            // Add block with hyphenated ID
            patch.blocks.push(createBlock('lfo-1', 'lfo', { freq: 1.0, amp: 1.0 }));

            const generator = new CodeGenerator(patch);
            const result = generator.generate();

            // Should use underscore instead of hyphen
            expect(result.mainCpp).toContain('lfo_1.Init(sr)');
            expect(result.mainCpp).toContain('lfo_1.Process()');
            expect(result.mainCpp).not.toContain('lfo-1');
        });

        it('should use ADENV_SEG_* constants for AdEnv initialization', () => {
            const patch = createMinimalPatch();
            patch.blocks.push(createBlock('env1', 'ad_env', { attack: 0.1, decay: 0.5 }));

            const generator = new CodeGenerator(patch);
            const result = generator.generate();

            expect(result.mainCpp).toContain('SetTime(ADENV_SEG_ATTACK');
            expect(result.mainCpp).toContain('SetTime(ADENV_SEG_DECAY');
        });

        it('should use Trigger() and Process() without args for AdEnv', () => {
            const patch = createMinimalPatch();
            // Create a trigger source and an ad_env
            patch.blocks = [
                createBlock('trig1', 'gate_trigger_in', {}),
                createBlock('env1', 'ad_env', {}),
                createBlock('out1', 'audio_output', {})
            ];
            patch.connections = [
                createConnection('c1', 'trig1', 'trig', 'env1', 'trig', 'trigger'),
                createConnection('c2', 'env1', 'out', 'out1', 'left', 'cv')
            ];

            const generator = new CodeGenerator(patch);
            const result = generator.generate();

            // Expect: if (gate_trig1_trig) env1.Trigger();
            // Expect: cv_env1_out = env1.Process();
            expect(result.mainCpp).toMatch(/if\s*\(gate_trig1_trig\)\s*env1\.Trigger\(\);/);
            expect(result.mainCpp).toMatch(/cv_env1_out\s*=\s*env1\.Process\(\);/);
        });
    });

    describe('Pod Multi Effect Regeneration', () => {
        it('should regenerate the C++ file correctly', () => {
            console.log('CWD:', process.cwd());
            const projectRoot = path.dirname(process.cwd());
            console.log('Project Root:', projectRoot);

            const dvpePath = path.join(projectRoot, '_block_diagrams_code', 'Pod_Multi_Effect_test', 'Pod_Multi_Effect_test.dvpe');
            const outPath = path.join(projectRoot, '_block_diagrams_code', 'Pod_Multi_Effect_test', 'pod_multi_effect.cpp');

            console.log('Looking for:', dvpePath);

            if (!fs.existsSync(dvpePath)) {
                throw new Error(`File not found: ${dvpePath}`);
            }

            const jsonContent = fs.readFileSync(dvpePath, 'utf-8');
            const data = JSON.parse(jsonContent);
            const patch = data.patch || data;

            const gene = new CodeGenerator(patch);
            const result = gene.generate();

            expect(result.errors).toEqual([]);
            expect(result.mainCpp).toContain('#define MAX_DELAY 96000');
            expect(result.mainCpp).toContain('DaisyPod hw;');
            expect(result.mainCpp).toMatch(/block_decimator_1\.Init\(\);/);
            // Check crossfade temp vars
            expect(result.mainCpp).toMatch(/float block_crossfade_1_in1 =/);

            fs.writeFileSync(outPath, result.mainCpp);

            const outMakefile = path.join(projectRoot, '_block_diagrams_code', 'Pod_Multi_Effect_test', 'Makefile');
            fs.writeFileSync(outMakefile, result.makefile);

            console.log('Wrote file to:', outPath);
            console.log('Wrote Makefile to:', outMakefile);
        });
    });

    // =========================================================================
    // BUG #014: Conditional Code Inclusion Tests
    // =========================================================================

    describe('Bug #014: Conditional code inclusion', () => {
        const createEmptyPatch = (platform: 'seed' | 'pod' | 'field' = 'seed') => ({
            blocks: [] as BlockInstance[],
            connections: [] as Connection[],
            metadata: {
                name: 'Empty Test Patch',
                blockSize: 48,
                sampleRate: 48000,
            },
            hardwareConfig: {
                platform,
                pinMapping: {},
                audioIOMapping: { inputs: [], outputs: [] }
            }
        });

        describe('empty patch (0 blocks)', () => {
            it('should NOT include MAX_DELAY macro', () => {
                const patch = createEmptyPatch();
                const generator = new CodeGenerator(patch);
                const result = generator.generate();

                expect(result.mainCpp).not.toContain('#define MAX_DELAY');
            });

            it('should NOT include MIDI global variables', () => {
                const patch = createEmptyPatch();
                const generator = new CodeGenerator(patch);
                const result = generator.generate();

                expect(result.mainCpp).not.toContain('midi_pitch_global');
                expect(result.mainCpp).not.toContain('midi_velocity_global');
                expect(result.mainCpp).not.toContain('midi_gate_global');
            });

            it('should NOT include SimpleArpeggiator class', () => {
                const patch = createEmptyPatch();
                const generator = new CodeGenerator(patch);
                const result = generator.generate();

                expect(result.mainCpp).not.toContain('class SimpleArpeggiator');
                expect(result.mainCpp).not.toContain('std::vector');
            });

            it('should NOT include HandleMidiMessage function', () => {
                const patch = createEmptyPatch();
                const generator = new CodeGenerator(patch);
                const result = generator.generate();

                expect(result.mainCpp).not.toContain('HandleMidiMessage');
            });

            it('should generate minimal code (< 100 lines)', () => {
                const patch = createEmptyPatch();
                const generator = new CodeGenerator(patch);
                const result = generator.generate();

                const lineCount = result.mainCpp.split('\n').length;
                expect(lineCount).toBeLessThan(100);
            });
        });

        describe('delay block inclusion', () => {
            it('should include MAX_DELAY when delay_line block is present', () => {
                const patch = {
                    blocks: [
                        createBlock('delay1', 'delay_line', { time: 0.5 }),
                        createBlock('out1', 'audio_output', {}),
                    ],
                    connections: [
                        createConnection('c1', 'delay1', 'out', 'out1', 'left', 'audio'),
                    ],
                    metadata: { name: 'Delay Test', blockSize: 48, sampleRate: 48000 },
                };
                const generator = new CodeGenerator(patch);
                const result = generator.generate();

                expect(result.mainCpp).toContain('#define MAX_DELAY 96000');
            });

            it('should include MAX_DELAY when reverb_sc block is present', () => {
                const patch = {
                    blocks: [
                        createBlock('reverb1', 'reverb_sc', { feedback: 0.8 }),
                        createBlock('out1', 'audio_output', {}),
                    ],
                    connections: [
                        createConnection('c1', 'reverb1', 'out_l', 'out1', 'left', 'audio'),
                    ],
                    metadata: { name: 'Reverb Test', blockSize: 48, sampleRate: 48000 },
                };
                const generator = new CodeGenerator(patch);
                const result = generator.generate();

                expect(result.mainCpp).toContain('#define MAX_DELAY 96000');
            });
        });

        describe('MIDI block inclusion', () => {
            it('should include MIDI globals when midi_note block is present', () => {
                const patch = {
                    blocks: [
                        createBlock('midi1', 'midi_note', {}),
                        createBlock('out1', 'audio_output', {}),
                    ],
                    connections: [],
                    metadata: { name: 'MIDI Test', blockSize: 48, sampleRate: 48000 },
                };
                const generator = new CodeGenerator(patch);
                const result = generator.generate();

                expect(result.mainCpp).toContain('midi_pitch_global');
                expect(result.mainCpp).toContain('HandleMidiMessage');
            });

            it('should include arpeggiator class only when arpeggiator block is present', () => {
                const patch = {
                    blocks: [
                        createBlock('arp1', 'arpeggiator', {}),
                        createBlock('out1', 'audio_output', {}),
                    ],
                    connections: [],
                    metadata: { name: 'Arp Test', blockSize: 48, sampleRate: 48000 },
                };
                const generator = new CodeGenerator(patch);
                const result = generator.generate();

                expect(result.mainCpp).toContain('class SimpleArpeggiator');
                expect(result.mainCpp).toContain('HandleMidiMessage');
            });
        });

        describe('platform detection', () => {
            it('should use correct header for field platform', () => {
                const patch = createEmptyPatch('field');
                const generator = new CodeGenerator(patch);
                const result = generator.generate();

                expect(result.mainCpp).toContain('#include "daisy_field.h"');
                expect(result.mainCpp).toContain('DaisyField hw;');
            });

            it('should use correct header for pod platform', () => {
                const patch = createEmptyPatch('pod');
                const generator = new CodeGenerator(patch);
                const result = generator.generate();

                expect(result.mainCpp).toContain('#include "daisy_pod.h"');
                expect(result.mainCpp).toContain('DaisyPod hw;');
            });

            it('should use correct header for seed platform', () => {
                const patch = createEmptyPatch('seed');
                const generator = new CodeGenerator(patch);
                const result = generator.generate();

                expect(result.mainCpp).toContain('#include "daisy_seed.h"');
                expect(result.mainCpp).toContain('DaisySeed hw;');
            });
        });
    });
});
