// import { describe, it, expect } from 'vitest';
import {
    MidiNoteBlock, MidiCCBlock, CVInputBlock,
    CVOutputBlock, GateOutputBlock, LEDOutputBlock
} from './definitions';
import { getBlockDefinition } from './BlockRegistry';
import {
    BlockCategory, BlockColorScheme,
    ParameterType, SignalType, PortDirection
} from '@/types';

// Array of all Phase 5 blocks for iteration
const phase5Blocks = [
    MidiNoteBlock,
    MidiCCBlock,
    CVInputBlock,
    CVOutputBlock,
    GateOutputBlock,
    LEDOutputBlock
];

describe('Phase 5 Block Validation (Hardware I/O)', () => {

    describe('Block Registration', () => {
        it('all Phase 5 blocks should be registered in BlockRegistry', () => {
            phase5Blocks.forEach(block => {
                const registered = getBlockDefinition(block.id);
                expect(registered, `Block ${block.id} not registered`).toBeDefined();
                expect(registered?.id).toBe(block.id);
            });
        });
    });

    describe('Category & Color', () => {
        it('all Phase 5 blocks should be in USER_IO category', () => {
            phase5Blocks.forEach(block => {
                expect(block.category).toBe(BlockCategory.USER_IO);
            });
        });

        it('all Phase 5 blocks should use USER color scheme', () => {
            phase5Blocks.forEach(block => {
                expect(block.colorScheme).toBe(BlockColorScheme.USER);
            });
        });
    });

    describe('Parameter Types', () => {
        it('should use ParameterType.INT/BOOL instead of INTEGER/BOOLEAN', () => {
            phase5Blocks.forEach(block => {
                block.parameters.forEach(param => {
                    // Check against the valid enum values
                    expect(Object.values(ParameterType)).toContain(param.type);

                    // Specific check for common mistakes (although TS compiler catches this, runtime check ensures value matches)
                    if (['channel', 'pin', 'cc_number'].includes(param.id)) {
                        expect(param.type).toBe(ParameterType.INT);
                    }
                    if (['bipolar', 'pwm'].includes(param.id)) {
                        expect(param.type).toBe(ParameterType.BOOL);
                    }
                });
            });
        });
    });

    describe('Port Configuration', () => {
        it('MidiNote should have pitch, velocity, gate outputs', () => {
            const ports = MidiNoteBlock.ports;
            expect(ports.some(p => p.id === 'pitch' && p.direction === PortDirection.OUTPUT)).toBe(true);
            expect(ports.some(p => p.id === 'velocity' && p.direction === PortDirection.OUTPUT)).toBe(true);
            expect(ports.some(p => p.id === 'gate' && p.direction === PortDirection.OUTPUT)).toBe(true);
        });

        it('MidiCC should have value output', () => {
            const ports = MidiCCBlock.ports;
            expect(ports.some(p => p.id === 'value' && p.direction === PortDirection.OUTPUT)).toBe(true);
        });

        it('CVInput should have OUT output', () => {
            const ports = CVInputBlock.ports;
            expect(ports.some(p => p.id === 'out' && p.direction === PortDirection.OUTPUT)).toBe(true);
        });

        it('CVOutput should have IN input', () => {
            const ports = CVOutputBlock.ports;
            expect(ports.some(p => p.id === 'in' && p.direction === PortDirection.INPUT)).toBe(true);
        });

        it('GateOutput should have GATE input', () => {
            const ports = GateOutputBlock.ports;
            expect(ports.some(p => p.id === 'gate' && p.direction === PortDirection.INPUT)).toBe(true);
        });

        it('LEDOutput should have BRIGHTNESS input', () => {
            const ports = LEDOutputBlock.ports;
            expect(ports.some(p => p.id === 'brightness' && p.direction === PortDirection.INPUT)).toBe(true);
        });
    });
});
