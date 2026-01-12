/**
 * Phase 8.2 Dynamic Inputs Visual Update Validation Tests
 * Tests for: Dynamic port count based on inputCount/outputCount parameters
 * 
 * Bug from implementation_ideas_2.md (line 37):
 * "for ADD, MUX, DEMUX, MIXER in Inspector panel -> Main -> Inputs/Outputs: 
 *  modification of number of inputs/outputs must modify visual number of inputs/outputs in Canvas"
 */

// import { describe, it, expect, beforeEach } from 'vitest';
import { usePatchStore } from '@/stores/patchStore';
import { BlockRegistry } from '@/core/blocks/BlockRegistry';
import { ParameterType, PortDirection } from '@/types';

// Helper to get input ports from a block definition
const getInputPorts = (definitionId: string) => {
    const definition = BlockRegistry.get(definitionId);
    if (!definition) return [];
    return definition.ports.filter(p => p.direction === PortDirection.INPUT);
};

// Helper to get output ports from a block definition
const getOutputPorts = (definitionId: string) => {
    const definition = BlockRegistry.get(definitionId);
    if (!definition) return [];
    return definition.ports.filter(p => p.direction === PortDirection.OUTPUT);
};

// Helper to filter visible ports based on inputCount parameter
const getVisibleInputPorts = (definitionId: string, inputCount: number) => {
    const definition = BlockRegistry.get(definitionId);
    if (!definition) return [];

    const inputPorts = definition.ports.filter(p => p.direction === PortDirection.INPUT);

    // For ADD: in1, in2, in3, in4 (numbered 1-4)
    // For MUX: in0, in1, in2, in3, sel_cv (numbered 0-3, plus sel_cv)
    // For MIXER: in_1, in_2, in_3, in_4 (numbered 1-4)

    return inputPorts.filter(port => {
        // Keep CV ports always visible
        if (port.id.endsWith('_cv')) return true;

        // Extract port number
        const match = port.id.match(/(\d+)$/);
        if (!match) return true; // No number = keep visible

        const portNum = parseInt(match[1], 10);

        // For ADD (in1-in4): show if portNum <= inputCount
        if (definitionId === 'add') {
            return portNum <= inputCount;
        }

        // For MUX (in0-in3): show if portNum < inputCount
        if (definitionId === 'mux') {
            return portNum < inputCount;
        }

        // For MIXER (in_1-in_4): show if portNum <= inputCount
        if (definitionId === 'mixer') {
            return portNum <= inputCount;
        }

        return true;
    });
};

// Helper to filter visible output ports based on outputCount parameter
const getVisibleOutputPorts = (definitionId: string, outputCount: number) => {
    const definition = BlockRegistry.get(definitionId);
    if (!definition) return [];

    const outputPorts = definition.ports.filter(p => p.direction === PortDirection.OUTPUT);

    // For DEMUX: out0, out1, out2, out3 (numbered 0-3)
    return outputPorts.filter(port => {
        const match = port.id.match(/(\d+)$/);
        if (!match) return true; // No number = keep visible

        const portNum = parseInt(match[1], 10);
        return portNum < outputCount;
    });
};

// Reset store before each test
beforeEach(() => {
    usePatchStore.setState({
        blocks: [],
        connections: [],
        comments: [],
        selectedBlockIds: [],
        selectedConnectionIds: [],
        history: [],
        historyIndex: -1,
        isDirty: false,
    });
});

describe('Phase 8.2 Dynamic Inputs Visual Update', () => {
    // ========================================================================
    // TASK 8.2.1: ADD Block Dynamic Inputs
    // ========================================================================
    describe('8.2.1 ADD Block Dynamic Inputs', () => {
        it('ADD block should have inputCount ENUM parameter', () => {
            const definition = BlockRegistry.get('add');
            expect(definition).toBeDefined();

            const inputCountParam = definition?.parameters.find(p => p.id === 'inputCount');
            expect(inputCountParam).toBeDefined();
            expect(inputCountParam?.type).toBe(ParameterType.ENUM);
            expect(inputCountParam?.enumValues).toHaveLength(3);
            expect(inputCountParam?.enumValues?.map(e => e.value)).toEqual(['2', '3', '4']);
        });

        it('ADD block should have 4 input ports defined', () => {
            const inputPorts = getInputPorts('add');
            expect(inputPorts).toHaveLength(4);
            expect(inputPorts.map(p => p.id)).toEqual(['in1', 'in2', 'in3', 'in4']);
        });

        it('ADD block with inputCount=2 should show only 2 input ports', () => {
            const visiblePorts = getVisibleInputPorts('add', 2);
            expect(visiblePorts).toHaveLength(2);
            expect(visiblePorts.map(p => p.id)).toEqual(['in1', 'in2']);
        });

        it('ADD block with inputCount=3 should show only 3 input ports', () => {
            const visiblePorts = getVisibleInputPorts('add', 3);
            expect(visiblePorts).toHaveLength(3);
            expect(visiblePorts.map(p => p.id)).toEqual(['in1', 'in2', 'in3']);
        });

        it('ADD block with inputCount=4 should show all 4 input ports', () => {
            const visiblePorts = getVisibleInputPorts('add', 4);
            expect(visiblePorts).toHaveLength(4);
            expect(visiblePorts.map(p => p.id)).toEqual(['in1', 'in2', 'in3', 'in4']);
        });
    });

    // ========================================================================
    // TASK 8.2.2: MUX Block Dynamic Inputs
    // ========================================================================
    describe('8.2.2 MUX Block Dynamic Inputs', () => {
        it('MUX block should have inputCount ENUM parameter', () => {
            const definition = BlockRegistry.get('mux');
            expect(definition).toBeDefined();

            const inputCountParam = definition?.parameters.find(p => p.id === 'inputCount');
            expect(inputCountParam).toBeDefined();
            expect(inputCountParam?.type).toBe(ParameterType.ENUM);
            expect(inputCountParam?.enumValues).toHaveLength(3);
        });

        it('MUX block should have 4 signal input ports plus select_cv', () => {
            const inputPorts = getInputPorts('mux');
            // in0, in1, in2, in3, select_cv = 5 input ports
            expect(inputPorts).toHaveLength(5);
        });

        it('MUX block with inputCount=2 should show 2 signal inputs plus select_cv', () => {
            const visiblePorts = getVisibleInputPorts('mux', 2);
            expect(visiblePorts).toHaveLength(3); // in0, in1, select_cv
            expect(visiblePorts.map(p => p.id)).toContain('in0');
            expect(visiblePorts.map(p => p.id)).toContain('in1');
            expect(visiblePorts.map(p => p.id)).toContain('select_cv');
        });

        it('MUX block with inputCount=4 should show all 4 signal inputs plus select_cv', () => {
            const visiblePorts = getVisibleInputPorts('mux', 4);
            expect(visiblePorts).toHaveLength(5); // in0, in1, in2, in3, select_cv
        });
    });

    // ... DEMUX section skipped (unchanged) ...

    // ========================================================================
    // TASK 8.2.4: MIXER Block Dynamic Inputs
    // ========================================================================
    describe('8.2.4 MIXER Block Dynamic Inputs', () => {
        it('MIXER block should have inputCount ENUM parameter', () => {
            const definition = BlockRegistry.get('mixer');
            expect(definition).toBeDefined();

            const inputCountParam = definition?.parameters.find(p => p.id === 'inputCount');
            expect(inputCountParam).toBeDefined();
            expect(inputCountParam?.type).toBe(ParameterType.ENUM);
        });

        it('MIXER block should have 4 AUDIO input ports defined', () => {
            const inputPorts = getInputPorts('mixer').filter(p => !p.id.endsWith('_cv'));
            expect(inputPorts).toHaveLength(4);
            expect(inputPorts.map(p => p.id)).toEqual(['in_1', 'in_2', 'in_3', 'in_4']);
        });

        it('MIXER block with inputCount=2 should show only 2 AUDIO input ports', () => {
            const visiblePorts = getVisibleInputPorts('mixer', 2).filter(p => !p.id.endsWith('_cv'));
            expect(visiblePorts).toHaveLength(2);
            expect(visiblePorts.map(p => p.id)).toEqual(['in_1', 'in_2']);
        });

        it('MIXER block with inputCount=4 should show all 4 AUDIO input ports', () => {
            const visiblePorts = getVisibleInputPorts('mixer', 4).filter(p => !p.id.endsWith('_cv'));
            expect(visiblePorts).toHaveLength(4);
        });
    });

    // ========================================================================
    // TASK 8.2.5: Store Integration - Parameter Updates
    // ========================================================================
    describe('8.2.5 Store Integration - Parameter Updates', () => {
        it('updateBlockParameter should correctly update inputCount', () => {
            const store = usePatchStore.getState();

            // Create an ADD block
            const block = store.addBlock('add', { x: 100, y: 100 });
            expect(block).toBeDefined();
            expect(block?.parameterValues['inputCount']).toBe('4'); // Default

            // Update inputCount to 2
            store.updateBlockParameter(block!.id, 'inputCount', '2');

            const updatedBlock = usePatchStore.getState().getBlockById(block!.id);
            expect(updatedBlock?.parameterValues['inputCount']).toBe('2');
        });

        it('updateBlockParameter should correctly update outputCount for DEMUX', () => {
            const store = usePatchStore.getState();

            // Create a DEMUX block
            const block = store.addBlock('demux', { x: 100, y: 100 });
            expect(block).toBeDefined();
            expect(block?.parameterValues['outputCount']).toBe('4'); // Default

            // Update outputCount to 3
            store.updateBlockParameter(block!.id, 'outputCount', '3');

            const updatedBlock = usePatchStore.getState().getBlockById(block!.id);
            expect(updatedBlock?.parameterValues['outputCount']).toBe('3');
        });

        it('changing inputCount should mark store as dirty', () => {
            const store = usePatchStore.getState();

            const block = store.addBlock('mixer', { x: 100, y: 100 });

            // Reset dirty flag
            usePatchStore.getState().markClean();
            expect(usePatchStore.getState().isDirty).toBe(false);

            // Update parameter
            store.updateBlockParameter(block!.id, 'inputCount', '2');

            expect(usePatchStore.getState().isDirty).toBe(true);
        });

        it('changing inputCount should add to undo history', () => {
            const store = usePatchStore.getState();

            const block = store.addBlock('mux', { x: 100, y: 100 });
            const historyLengthBefore = usePatchStore.getState().history.length;

            store.updateBlockParameter(block!.id, 'inputCount', '2');

            const historyLengthAfter = usePatchStore.getState().history.length;
            expect(historyLengthAfter).toBeGreaterThan(historyLengthBefore);
        });
    });
});
