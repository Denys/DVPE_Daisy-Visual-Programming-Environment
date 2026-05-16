import { beforeEach, describe, expect, it } from 'vitest';
import { BlockCategory } from '@/types';
import { DEFAULT_STITCH_NEON_SETTINGS } from '@/lib/stitchNeonStyle';
import { useUIStore } from '../uiStore';

describe('uiStore Stitch Neon settings', () => {
  beforeEach(() => {
    useUIStore.setState({
      layoutStyle: 'original',
      designSettings: {
        glowIntensity: 0.4,
        glowSpread: 160,
        baseTransparency: 0.08,
        borderWidth: 1,
        borderRadius: 16,
        neonSaturation: 1,
        glassTint: 0.15,
      },
      stitchNeonSettings: { ...DEFAULT_STITCH_NEON_SETTINGS },
      stitchNeonPresets: [],
    });
  });

  it('updates Stitch Neon settings without switching to Experimentator', () => {
    useUIStore.getState().updateStitchNeonSettings({
      backgroundStartColor: '#b51646',
      blockOpacity: 0.82,
    });

    expect(useUIStore.getState().layoutStyle).toBe('glass');
    expect(useUIStore.getState().stitchNeonSettings.backgroundStartColor).toBe('#b51646');
    expect(useUIStore.getState().stitchNeonSettings.blockOpacity).toBe(0.82);
    expect(useUIStore.getState().designSettings.baseTransparency).toBe(0.08);
  });

  it('resets Stitch Neon settings without changing Experimentator settings', () => {
    useUIStore.getState().updateDesignSettings({ baseTransparency: 0.44 });
    useUIStore.getState().updateStitchNeonSettings({ blockOpacity: 0.5 });
    useUIStore.getState().resetStitchNeonSettings();

    expect(useUIStore.getState().stitchNeonSettings).toEqual(DEFAULT_STITCH_NEON_SETTINGS);
    expect(useUIStore.getState().designSettings.baseTransparency).toBe(0.44);
  });

  it('saves and loads Stitch Neon presets separately from Experimentator presets', () => {
    useUIStore.getState().updateStitchNeonSettings({
      blockCornerRadius: 24,
      blockTypeColors: {
        ...DEFAULT_STITCH_NEON_SETTINGS.blockTypeColors,
        [BlockCategory.MODULATORS]: '#fedcba',
      },
    });
    useUIStore.getState().saveStitchNeonPreset('Bright mod wires');
    useUIStore.getState().updateStitchNeonSettings({ blockCornerRadius: 6 });

    const presetId = useUIStore.getState().stitchNeonPresets[0].id;
    useUIStore.getState().loadStitchNeonPreset(presetId);

    expect(useUIStore.getState().stitchNeonSettings.blockCornerRadius).toBe(24);
    expect(useUIStore.getState().stitchNeonSettings.blockTypeColors[BlockCategory.MODULATORS]).toBe('#fedcba');
    expect(useUIStore.getState().customPresets).toEqual([]);
  });
});
