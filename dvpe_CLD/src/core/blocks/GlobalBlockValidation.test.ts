// import { describe, it, expect } from 'vitest';
import { getAllBlockDefinitions } from './BlockRegistry';
import { ParameterType, SignalType, PortDirection } from '@/types';

const allBlocks = getAllBlockDefinitions();

describe('Global Block Validation (Audit)', () => {

    it('should have blocks registered', () => {
        expect(allBlocks.length).toBeGreaterThan(0);
        console.log(`Auditing ${allBlocks.length} blocks`);
    });

    describe('CV Port Consistency', () => {
        allBlocks.forEach(block => {
            const cvParams = block.parameters.filter(p => p.cvModulatable === true);

            if (cvParams.length > 0) {
                it(`${block.id}: cvModulatable params should have corresponding CV ports`, () => {
                    cvParams.forEach(param => {
                        // Expected port ID: paramId + '_cv' (e.g. freq -> freq_cv)
                        const expectedPortId = `${param.id}_cv`;
                        const cvPort = block.ports.find(
                            p => p.id === expectedPortId &&
                                p.direction === PortDirection.INPUT &&
                                p.signalType === SignalType.CV
                        );

                        expect(cvPort,
                            `Block "${block.id}" parameter "${param.id}" is cvModulatable but missing port "${expectedPortId}"`
                        ).toBeDefined();
                    });
                });
            }
        });
    });

    describe('Parameter Types', () => {
        allBlocks.forEach(block => {
            it(`${block.id}: should use valid ParameterType enum values`, () => {
                block.parameters.forEach(param => {
                    expect(Object.values(ParameterType)).toContain(param.type);
                });
            });
        });
    });

    describe('Port Definitions', () => {
        allBlocks.forEach(block => {
            it(`${block.id}: ports should be valid`, () => {
                expect(block.ports.length).toBeGreaterThan(0);
                block.ports.forEach(port => {
                    expect(port.id).toBeDefined();
                    expect(port.displayName).toBeDefined();
                    expect(Object.values(SignalType)).toContain(port.signalType);
                    expect(Object.values(PortDirection)).toContain(port.direction);
                });
            });
        });
    });
});
