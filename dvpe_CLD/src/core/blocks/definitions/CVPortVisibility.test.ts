import { describe, it, expect } from 'vitest';
import { HiHatBlock } from '../definitions/hihat';
import { AnalogBassDrumBlock } from '../definitions/analogBassDrum';
import { SignalType, PortDirection, BlockDefinition } from '@/types';

// Replicate BlockNode.tsx logic
const getVisibleInputPorts = (definition: BlockDefinition, enabledCvPorts: string[] = []) => {
    return definition.ports.filter((p) => {
        if (p.direction !== PortDirection.INPUT) return false;

        // 1. Check CV modulation ports
        if (p.id.endsWith('_cv') && p.signalType === SignalType.CV) {
            // Exception for MUX sel_cv which is static
            if (p.id === 'sel_cv') return true;

            // Extract the parameter ID (e.g., 'frequency_cv' -> 'frequency')
            const paramId = p.id.replace(/_cv$/, '');
            // Only show if explicitly enabled
            return enabledCvPorts?.includes(paramId) ?? false;
        }

        return true;
    });
};

describe('CV Port Visibility Logic', () => {

    describe('HiHat Block', () => {
        it('should show freq_cv when freq is enabled', () => {
            const ports = getVisibleInputPorts(HiHatBlock, ['freq']);
            const freqCv = ports.find(p => p.id === 'freq_cv');
            expect(freqCv).toBeDefined();
        });

        it('should NOT show freq_cv when freq is NOT enabled', () => {
            const ports = getVisibleInputPorts(HiHatBlock, []);
            const freqCv = ports.find(p => p.id === 'freq_cv');
            expect(freqCv).toBeUndefined();
        });
    });

    describe('AnalogBassDrum Block', () => {
        it('should show decay_cv when decay is enabled', () => {
            const ports = getVisibleInputPorts(AnalogBassDrumBlock, ['decay']);
            const decayCv = ports.find(p => p.id === 'decay_cv');
            expect(decayCv).toBeDefined();
        });
    });
});
