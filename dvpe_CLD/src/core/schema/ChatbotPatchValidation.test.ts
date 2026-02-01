import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { SerializedProject } from '@/types';
import { BlockRegistry } from '@/core/blocks/BlockRegistry';

// Define paths to the generated files
// Note: We are running from dvpe_CLD, so we need to go up to _block_diagrams_code
const PROMPT_GENERATED_DIR = path.resolve(__dirname, '../../../../_block_diagrams_code/prompt_generated');

const FILES_TO_TEST = [
    'pod_drum_machine__chat-gen_FIXED.dvpe',
    'seed_drum_machine__chat-gen_FIXED.dvpe',
    'seed_physical_string__chat-gen_FIXED.dvpe'
];

describe('Chatbot Generated Patch Validation', () => {

    FILES_TO_TEST.forEach(filename => {
        const filePath = path.join(PROMPT_GENERATED_DIR, filename);

        describe(`File: ${filename}`, () => {
            let fileContent: string;
            let project: SerializedProject;

            it('should exist and be readable', () => {
                expect(fs.existsSync(filePath)).toBe(true);
                fileContent = fs.readFileSync(filePath, 'utf-8');
                expect(fileContent).toBeDefined();
            });

            it('should be valid JSON', () => {
                expect(() => {
                    project = JSON.parse(fileContent);
                }).not.toThrow();
            });

            it('should have correct top-level structure (version, patch)', () => {
                expect(project).toHaveProperty('version');
                expect(project).toHaveProperty('patch');
                expect(project.patch).toHaveProperty('metadata');
                expect(project.patch).toHaveProperty('blocks');
                expect(project.patch).toHaveProperty('connections');
            });

            it('should have valid metadata', () => {
                const { metadata } = project.patch;
                expect(metadata.name).toBeDefined();
                expect(metadata.targetHardware).toBeDefined();
                // Ensure targetHardware is one of the valid types
                const validHardware = ['seed', 'patch', 'pod', 'field', 'petal', 'versio'];
                expect(validHardware).toContain(metadata.targetHardware);
            });

            it('should contain blocks with valid definitions', () => {
                const { blocks } = project.patch;
                expect(blocks.length).toBeGreaterThan(0);

                blocks.forEach(block => {
                    expect(block.id).toBeDefined();
                    expect(block.definitionId).toBeDefined();

                    // Verify that the definition exists in the registry
                    const def = BlockRegistry.get(block.definitionId);
                    expect(def, `Block definition "${block.definitionId}" not found in registry`).toBeDefined();
                });
            });

            it('should contain valid connections', () => {
                const { connections, blocks } = project.patch;
                const blockIds = new Set(blocks.map(b => b.id));

                connections.forEach(conn => {
                    expect(conn.id).toBeDefined();
                    expect(conn.sourceBlockId).toBeDefined();
                    expect(conn.targetBlockId).toBeDefined();

                    // Verify source/target blocks exist in the patch
                    expect(blockIds.has(conn.sourceBlockId), `Source block "${conn.sourceBlockId}" not found`).toBe(true);
                    expect(blockIds.has(conn.targetBlockId), `Target block "${conn.targetBlockId}" not found`).toBe(true);
                });
            });
        });
    });
});
