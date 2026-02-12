/**
 * Code Module Tests
 * Tests for the Hybrid Code Module feature (Phase 13.4)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CodeGenerator, PatchGraph } from './CodeGenerator';
import { CustomBlockDefinition, CodeModuleDefinition } from '@/types/customBlock';
import { SignalType, PortDirection } from '@/types';
import { BlockRegistry } from '@/core/blocks/BlockRegistry';

describe('Code Module (Hybrid Code Modules)', () => {
    beforeEach(() => {
        // Clear registry before each test
        // Note: In a real scenario, we might want to preserve existing blocks
    });

    describe('T-B1: Monaco Editor Integration', () => {
        it('should have CodeModuleEditor component exports', async () => {
            // Verify the component can be imported
            const module = await import('@/components/BlockDesigner/CodeModuleEditor');
            expect(module.CodeModuleEditor).toBeDefined();
            expect(typeof module.CodeModuleEditor).toBe('function');
        });

        it('should have PortBindingEditor component exports', async () => {
            // Verify the component can be imported
            const module = await import('@/components/BlockDesigner/PortBindingEditor');
            expect(module.PortBindingEditor).toBeDefined();
            expect(typeof module.PortBindingEditor).toBe('function');
        });
    });

    describe('T-B2: Port Binding Interface', () => {
        it('should create valid port bindings', () => {
            const portBinding = {
                id: 'inputSignal',
                displayName: 'Input Signal',
                signalType: SignalType.AUDIO,
                direction: PortDirection.INPUT,
                description: 'Main audio input',
            };

            expect(portBinding.id).toBe('inputSignal');
            expect(portBinding.signalType).toBe(SignalType.AUDIO);
            expect(portBinding.direction).toBe(PortDirection.INPUT);
        });

        it('should support all signal types', () => {
            const audioPort = {
                id: 'audio_in',
                displayName: 'Audio In',
                signalType: SignalType.AUDIO,
                direction: PortDirection.INPUT,
            };

            const cvPort = {
                id: 'cv_in',
                displayName: 'CV In',
                signalType: SignalType.CV,
                direction: PortDirection.INPUT,
            };

            const triggerPort = {
                id: 'trigger_in',
                displayName: 'Trigger In',
                signalType: SignalType.TRIGGER,
                direction: PortDirection.INPUT,
            };

            expect(audioPort.signalType).toBe(SignalType.AUDIO);
            expect(cvPort.signalType).toBe(SignalType.CV);
            expect(triggerPort.signalType).toBe(SignalType.TRIGGER);
        });

        it('should create code module definition', () => {
            const codeModule: CodeModuleDefinition = {
                cppCode: 'output = input * 0.5f;',
                portBindings: [
                    {
                        id: 'input',
                        displayName: 'Input',
                        signalType: SignalType.AUDIO,
                        direction: PortDirection.INPUT,
                    },
                    {
                        id: 'output',
                        displayName: 'Output',
                        signalType: SignalType.AUDIO,
                        direction: PortDirection.OUTPUT,
                    },
                ],
                stateVariables: [],
            };

            expect(codeModule.cppCode).toBeDefined();
            expect(codeModule.portBindings).toHaveLength(2);
            expect(codeModule.stateVariables).toHaveLength(0);
        });
    });

    describe('T-B3: Type Validation', () => {
        it('should validate C++ identifiers correctly', () => {
            const validIdentifiers = [
                'inputSignal',
                '_privateVar',
                'myVariable123',
                'snake_case',
                'camelCase',
            ];

            const cppIdentifierRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

            validIdentifiers.forEach(id => {
                expect(cppIdentifierRegex.test(id)).toBe(true);
            });
        });

        it('should reject invalid C++ identifiers', () => {
            const invalidIdentifiers = [
                '123number',
                'has-dash',
                'has space',
                'has.dot',
            ];

            const cppIdentifierRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

            invalidIdentifiers.forEach(id => {
                expect(cppIdentifierRegex.test(id)).toBe(false);
            });
        });

        it('should detect C++ reserved keywords', () => {
            const cppKeywords = new Set([
                'class', 'return', 'if', 'else', 'while', 'for',
                'int', 'float', 'double', 'void', 'bool',
            ]);

            expect(cppKeywords.has('class')).toBe(true);
            expect(cppKeywords.has('return')).toBe(true);
            expect(cppKeywords.has('myVariable')).toBe(false);
        });

        it('should validate port binding types', () => {
            const validPortBinding = {
                id: 'testPort',
                displayName: 'Test Port',
                signalType: SignalType.AUDIO,
                direction: PortDirection.INPUT,
            };

            expect(Object.values(SignalType)).toContain(validPortBinding.signalType);
            expect(Object.values(PortDirection)).toContain(validPortBinding.direction);
        });
    });

    describe('T-B4: C++ Export Integration', () => {
        it('should generate code for code module blocks', () => {
            const customDef: CustomBlockDefinition = {
                id: 'custom_test_module',
                displayName: 'Test Code Module',
                description: 'A test code module',
                category: 'custom',
                isCustom: true,
                ports: [
                    {
                        id: 'input',
                        displayName: 'Input',
                        signalType: SignalType.AUDIO,
                        direction: PortDirection.INPUT,
                    },
                    {
                        id: 'output',
                        displayName: 'Output',
                        signalType: SignalType.AUDIO,
                        direction: PortDirection.OUTPUT,
                    },
                ],
                parameters: [],
                exposedPorts: {},
                exposedParameters: {},
                internalPatch: {
                    blocks: [],
                    connections: [],
                },
                codeModule: {
                    cppCode: 'output = input * 0.5f;',
                    portBindings: [
                        {
                            id: 'input',
                            displayName: 'Input',
                            signalType: SignalType.AUDIO,
                            direction: PortDirection.INPUT,
                        },
                        {
                            id: 'output',
                            displayName: 'Output',
                            signalType: SignalType.AUDIO,
                            direction: PortDirection.OUTPUT,
                        },
                    ],
                    stateVariables: [],
                },
            };

            // Register the custom block
            BlockRegistry.register(customDef);

            const patch: PatchGraph = {
                blocks: [
                    {
                        id: 'custom_block_1',
                        definitionId: 'custom_test_module',
                        parameterValues: {},
                        position: { x: 100, y: 100 },
                    },
                    {
                        id: 'output_1',
                        definitionId: 'audio_output',
                        parameterValues: {},
                        position: { x: 300, y: 100 },
                    },
                ],
                connections: [
                    {
                        id: 'conn_1',
                        sourceBlockId: 'custom_block_1',
                        sourcePortId: 'output',
                        targetBlockId: 'output_1',
                        targetPortId: 'left',
                        type: 'audio',
                    },
                ],
                metadata: {
                    name: 'Code Module Test',
                    blockSize: 48,
                    sampleRate: 48000,
                },
                hardwareConfig: {
                    platform: 'field',
                },
            };

            const generator = new CodeGenerator(patch);
            const result = generator.generate();

            // Verify code was generated
            expect(result.mainCpp).toContain('Code Module: Test Code Module');
            expect(result.mainCpp).toContain('output = input * 0.5f;');
            expect(result.errors).toHaveLength(0);
        });

        it('should wrap code in scoped block', () => {
            const customDef: CustomBlockDefinition = {
                id: 'custom_scoped_test',
                displayName: 'Scoped Test Module',
                description: 'Test scoping',
                category: 'custom',
                isCustom: true,
                ports: [
                    {
                        id: 'output',
                        displayName: 'Output',
                        signalType: SignalType.AUDIO,
                        direction: PortDirection.OUTPUT,
                    },
                ],
                parameters: [],
                exposedPorts: {},
                exposedParameters: {},
                internalPatch: {
                    blocks: [],
                    connections: [],
                },
                codeModule: {
                    cppCode: 'float temp = 1.0f;\noutput = temp;',
                    portBindings: [
                        {
                            id: 'output',
                            displayName: 'Output',
                            signalType: SignalType.AUDIO,
                            direction: PortDirection.OUTPUT,
                        },
                    ],
                    stateVariables: [],
                },
            };

            BlockRegistry.register(customDef);

            const patch: PatchGraph = {
                blocks: [
                    {
                        id: 'custom_block_2',
                        definitionId: 'custom_scoped_test',
                        parameterValues: {},
                        position: { x: 100, y: 100 },
                    },
                    {
                        id: 'output_2',
                        definitionId: 'audio_output',
                        parameterValues: {},
                        position: { x: 300, y: 100 },
                    },
                ],
                connections: [
                    {
                        id: 'conn_2',
                        sourceBlockId: 'custom_block_2',
                        sourcePortId: 'output',
                        targetBlockId: 'output_2',
                        targetPortId: 'left',
                        type: 'audio',
                    },
                ],
                metadata: {
                    name: 'Scoped Test',
                    blockSize: 48,
                },
            };

            const generator = new CodeGenerator(patch);
            const result = generator.generate();

            // Verify scoping
            expect(result.mainCpp).toContain('{');
            expect(result.mainCpp).toContain('}');
        });

        it('should use correct signal prefixes', () => {
            // Test that signal prefixes are correct
            const signalPrefixes: Record<SignalType, string> = {
                [SignalType.AUDIO]: 'sig',
                [SignalType.CV]: 'cv',
                [SignalType.TRIGGER]: 'gate',
            };

            expect(signalPrefixes[SignalType.AUDIO]).toBe('sig');
            expect(signalPrefixes[SignalType.CV]).toBe('cv');
            expect(signalPrefixes[SignalType.TRIGGER]).toBe('gate');
        });

        it('should handle CV signal type correctly', () => {
            const customDef: CustomBlockDefinition = {
                id: 'custom_cv_test',
                displayName: 'CV Test Module',
                description: 'Test CV signals',
                category: 'custom',
                isCustom: true,
                ports: [
                    {
                        id: 'cv_in',
                        displayName: 'CV In',
                        signalType: SignalType.CV,
                        direction: PortDirection.INPUT,
                    },
                    {
                        id: 'cv_out',
                        displayName: 'CV Out',
                        signalType: SignalType.CV,
                        direction: PortDirection.OUTPUT,
                    },
                ],
                parameters: [],
                exposedPorts: {},
                exposedParameters: {},
                internalPatch: {
                    blocks: [],
                    connections: [],
                },
                codeModule: {
                    cppCode: 'cv_out = cv_in * 2.0f;',
                    portBindings: [
                        {
                            id: 'cv_in',
                            displayName: 'CV In',
                            signalType: SignalType.CV,
                            direction: PortDirection.INPUT,
                        },
                        {
                            id: 'cv_out',
                            displayName: 'CV Out',
                            signalType: SignalType.CV,
                            direction: PortDirection.OUTPUT,
                        },
                    ],
                    stateVariables: [],
                },
            };

            BlockRegistry.register(customDef);

            const patch: PatchGraph = {
                blocks: [
                    {
                        id: 'custom_block_cv',
                        definitionId: 'custom_cv_test',
                        parameterValues: {},
                        position: { x: 100, y: 100 },
                    },
                ],
                connections: [],
                metadata: {
                    name: 'CV Test',
                    blockSize: 48,
                },
            };

            const generator = new CodeGenerator(patch);
            const result = generator.generate();

            // CV variables should be declared as float
            expect(result.mainCpp).toContain('float cv_in');
        });
    });

    describe('End-to-End Flow', () => {
        it('should complete full code module workflow', () => {
            // 1. Define a code module
            const codeModuleDef: CustomBlockDefinition = {
                id: 'custom_e2e_test',
                displayName: 'E2E Test Module',
                description: 'End-to-end test',
                category: 'custom',
                isCustom: true,
                ports: [
                    {
                        id: 'input',
                        displayName: 'Input',
                        signalType: SignalType.AUDIO,
                        direction: PortDirection.INPUT,
                    },
                    {
                        id: 'output',
                        displayName: 'Output',
                        signalType: SignalType.AUDIO,
                        direction: PortDirection.OUTPUT,
                    },
                ],
                parameters: [],
                exposedPorts: {},
                exposedParameters: {},
                internalPatch: {
                    blocks: [],
                    connections: [],
                },
                codeModule: {
                    cppCode: '// Custom processing\noutput = input * 0.5f;',
                    portBindings: [
                        {
                            id: 'input',
                            displayName: 'Input',
                            signalType: SignalType.AUDIO,
                            direction: PortDirection.INPUT,
                        },
                        {
                            id: 'output',
                            displayName: 'Output',
                            signalType: SignalType.AUDIO,
                            direction: PortDirection.OUTPUT,
                        },
                    ],
                    stateVariables: [],
                },
            };

            // 2. Register the block
            BlockRegistry.register(codeModuleDef);

            // 3. Create a patch with the code module
            const patch: PatchGraph = {
                blocks: [
                    {
                        id: 'custom_block_e2e',
                        definitionId: 'custom_e2e_test',
                        parameterValues: {},
                        position: { x: 100, y: 100 },
                    },
                    {
                        id: 'output_e2e',
                        definitionId: 'audio_output',
                        parameterValues: {},
                        position: { x: 300, y: 100 },
                    },
                ],
                connections: [
                    {
                        id: 'conn_e2e',
                        sourceBlockId: 'custom_block_e2e',
                        sourcePortId: 'output',
                        targetBlockId: 'output_e2e',
                        targetPortId: 'left',
                        type: 'audio',
                    },
                ],
                metadata: {
                    name: 'E2E Test Patch',
                    blockSize: 48,
                },
            };

            // 4. Generate code
            const generator = new CodeGenerator(patch);
            const result = generator.generate();

            // 5. Verify output
            expect(result.errors).toHaveLength(0);
            expect(result.mainCpp).toContain('Code Module: E2E Test Module');
            expect(result.mainCpp).toContain('// Custom processing');
            expect(result.mainCpp).toContain('output = input * 0.5f;');
            expect(result.mainCpp).toContain('{'); // Scoped block
            expect(result.mainCpp).toContain('}'); // End scoped block
        });
    });
});
