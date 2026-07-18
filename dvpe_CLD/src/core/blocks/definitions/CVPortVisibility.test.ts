import { describe, it, expect } from 'vitest';
import { HiHatBlock } from '../definitions/hihat';
import { AnalogBassDrumBlock } from '../definitions/analogBassDrum';
import { BlockDefinition } from '@/types';
import { shouldShowInputPortInLayout } from '@/lib/stitchNeonStyle';

const getVisibleInputPorts = (definition: BlockDefinition, enabledCvPorts: string[] = []) => {
    return definition.ports.filter((port) => shouldShowInputPortInLayout({
        port,
        definition,
        layoutStyle: 'original',
        enabledCvPorts,
    }));
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
