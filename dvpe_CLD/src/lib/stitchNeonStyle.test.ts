import { describe, expect, it } from 'vitest';
import { ReverbScBlock } from '@/core/blocks/definitions/reverbSc';
import { BlockCategory, PortDirection, SignalType } from '@/types';
import {
  DEFAULT_STITCH_NEON_SETTINGS,
  getStitchNeonBlockStyle,
  getStitchNeonCanvasStyle,
  getStitchNeonCategoryColor,
  normalizeStitchNeonSettings,
  shouldShowInputPortInLayout,
} from './stitchNeonStyle';

describe('Stitch Neon style helpers', () => {
  it('keeps connected Effects CV handles visible in Stitch Neon', () => {
    const feedbackCv = ReverbScBlock.ports.find((port) => port.id === 'feedback_cv');

    expect(feedbackCv).toBeDefined();
    expect(
      shouldShowInputPortInLayout({
        port: feedbackCv!,
        definition: ReverbScBlock,
        layoutStyle: 'glass',
        enabledCvPorts: [],
        connectedPorts: new Set(['feedback_cv']),
      })
    ).toBe(true);
  });

  it('keeps enabled Effects CV handles visible in Stitch Neon', () => {
    const wetDryCv = ReverbScBlock.ports.find((port) => port.id === 'wet_dry_cv');

    expect(wetDryCv?.direction).toBe(PortDirection.INPUT);
    expect(wetDryCv?.signalType).toBe(SignalType.CV);
    expect(
      shouldShowInputPortInLayout({
        port: wetDryCv!,
        definition: ReverbScBlock,
        layoutStyle: 'glass',
        enabledCvPorts: ['wet_dry'],
        connectedPorts: new Set(),
      })
    ).toBe(true);
  });

  it('builds a bordeaux to blue Stitch Neon background style from settings', () => {
    const style = getStitchNeonCanvasStyle({
      ...DEFAULT_STITCH_NEON_SETTINGS,
      backgroundStartColor: '#b51646',
      backgroundEndColor: '#09265f',
      gradientMidpoint: 42,
    });

    expect(style.background).toContain('#b51646');
    expect(style.background).toContain('#09265f');
    expect(style.background).toContain('42%');
  });

  it('normalizes partial persisted settings with safe defaults', () => {
    const normalized = normalizeStitchNeonSettings({
      backgroundStartColor: '#ff0044',
      blockTypeColors: {
        [BlockCategory.FILTERS]: '#112233',
      },
    });

    expect(normalized.backgroundStartColor).toBe('#ff0044');
    expect(normalized.blockCornerRadius).toBe(DEFAULT_STITCH_NEON_SETTINGS.blockCornerRadius);
    expect(normalized.blockTypeColors[BlockCategory.FILTERS]).toBe('#112233');
    expect(normalized.blockTypeColors[BlockCategory.SOURCES]).toBe(DEFAULT_STITCH_NEON_SETTINGS.blockTypeColors[BlockCategory.SOURCES]);
  });

  it('applies block corner radius and category color overrides', () => {
    const settings = normalizeStitchNeonSettings({
      blockCornerRadius: 22,
      blockTypeColors: {
        [BlockCategory.EFFECTS]: '#123456',
      },
    });

    const style = getStitchNeonBlockStyle(settings, '#00e5ff', false);

    expect(style.borderRadius).toBe(22);
    expect(getStitchNeonCategoryColor(settings, '#00e5ff', BlockCategory.EFFECTS)).toBe('#123456');
  });
});
