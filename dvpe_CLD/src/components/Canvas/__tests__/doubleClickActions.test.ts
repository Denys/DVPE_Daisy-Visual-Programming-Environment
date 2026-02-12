import { describe, it, expect } from 'vitest';
import { resolveNodeDoubleClickAction } from '../doubleClickActions';
import { BlockDefinition } from '@/types';
import { CustomBlockDefinition } from '@/types/customBlock';

describe('resolveNodeDoubleClickAction', () => {
    const normalBlock: BlockDefinition = {
        id: 'osc',
        displayName: 'Oscillator',
        className: 'Oscillator',
        processMethod: '',
        headerFile: '',
        parameters: [],
        ports: [],
        category: 'Synthesis',
        isCustom: false,
    } as null as any; // Type casting to satisfy minimal mock

    const customBlock: CustomBlockDefinition = {
        ...normalBlock,
        id: 'custom-osc',
        isCustom: true,
        internalPatch: { blocks: [], connections: [], metadata: {} as any },
        exposedParameters: {},
        exposedPorts: {},
    };

    it('returns "inspect" for normal block without modifiers', () => {
        const action = resolveNodeDoubleClickAction({
            ctrlKey: false,
            metaKey: false,
            definition: normalBlock,
        });
        expect(action).toBe('inspect');
    });

    it('returns "inspect" for custom block without modifiers', () => {
        const action = resolveNodeDoubleClickAction({
            ctrlKey: false,
            metaKey: false,
            definition: customBlock,
        });
        expect(action).toBe('inspect');
    });

    it('returns "inspect" for normal block WITH modifiers', () => {
        const action = resolveNodeDoubleClickAction({
            ctrlKey: true,
            metaKey: false,
            definition: normalBlock,
        });
        expect(action).toBe('inspect');
    });

    it('returns "inspect-custom-internals" for custom block WITH Ctrl key', () => {
        const action = resolveNodeDoubleClickAction({
            ctrlKey: true,
            metaKey: false,
            definition: customBlock,
        });
        expect(action).toBe('inspect-custom-internals');
    });

    it('returns "inspect-custom-internals" for custom block WITH Meta key', () => {
        const action = resolveNodeDoubleClickAction({
            ctrlKey: false,
            metaKey: true,
            definition: customBlock,
        });
        expect(action).toBe('inspect-custom-internals');
    });

    it('handles null/undefined definition gracefully', () => {
        const action = resolveNodeDoubleClickAction({
            ctrlKey: true,
            metaKey: false,
            definition: null,
        });
        expect(action).toBe('inspect');
    });
});
