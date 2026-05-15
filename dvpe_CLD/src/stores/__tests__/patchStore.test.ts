import { beforeEach, describe, expect, it } from 'vitest';
import { usePatchStore } from '../patchStore';
import { BlockInstance, PatchGraph } from '@/types';

const block = (id: string, x: number, y: number): BlockInstance => ({
  id,
  definitionId: 'vca',
  position: { x, y },
  parameterValues: {},
});

describe('patchStore poly voice blankets', () => {
  beforeEach(() => {
    usePatchStore.getState().newPatch();
  });

  it('loads and saves optional poly voice blankets with existing patch graphs', () => {
    const patch: PatchGraph = {
      metadata: {
        name: 'Blanket Store Test',
        author: 'test',
        created: '2026-05-15T00:00:00.000Z',
        modified: '2026-05-15T00:00:00.000Z',
        version: '1.0.0',
        targetHardware: 'field',
        sampleRate: 48000,
        blockSize: 48,
      },
      blocks: [block('voice_grain', 100, 100)],
      connections: [],
      polyVoiceBlankets: [
        {
          id: 'voice_blanket',
          label: 'Poly Voice',
          position: { x: 80, y: 80 },
          size: { width: 240, height: 160 },
          voiceCount: 8,
          octave: 2,
          allocator: 'reuse_free_oldest',
          memberBlockIds: ['voice_grain'],
        },
      ],
    };

    usePatchStore.getState().loadPatch(patch);

    expect(usePatchStore.getState().polyVoiceBlankets).toHaveLength(1);
    expect(usePatchStore.getState().getPatch().polyVoiceBlankets).toEqual(patch.polyVoiceBlankets);
  });

  it('creates a poly voice blanket from selected block bounds and stores explicit member ids', () => {
    usePatchStore.setState({
      blocks: [
        block('voice_grain', 100, 100),
        block('voice_env', 340, 140),
        block('shared_filter', 760, 120),
      ],
      selectedBlockIds: ['voice_grain', 'voice_env'],
    });

    const created = usePatchStore.getState().createPolyVoiceBlanketFromSelection();

    expect(created).not.toBeNull();
    expect(created?.voiceCount).toBe(8);
    expect(created?.octave).toBe(2);
    expect(created?.allocator).toBe('reuse_free_oldest');
    expect(created?.memberBlockIds).toEqual(['voice_grain', 'voice_env']);
    expect(created?.position.x).toBeLessThan(100);
    expect(created?.size.width).toBeGreaterThan(300);
    expect(usePatchStore.getState().getPatch().polyVoiceBlankets?.[0].memberBlockIds).toEqual(['voice_grain', 'voice_env']);
  });

  it('refreshes blanket membership deterministically after geometry changes', () => {
    usePatchStore.setState({
      blocks: [
        block('voice_grain', 100, 100),
        block('voice_env', 340, 140),
        block('shared_filter', 760, 120),
      ],
      polyVoiceBlankets: [
        {
          id: 'voice_blanket',
          label: 'Poly Voice',
          position: { x: 80, y: 80 },
          size: { width: 360, height: 180 },
          voiceCount: 8,
          octave: 2,
          allocator: 'reuse_free_oldest',
          memberBlockIds: ['voice_grain', 'voice_env'],
        },
      ],
    });

    usePatchStore.getState().updatePolyVoiceBlanket('voice_blanket', {
      position: { x: 700, y: 80 },
      size: { width: 180, height: 160 },
    });
    usePatchStore.getState().refreshPolyVoiceBlanketMembers('voice_blanket');

    expect(usePatchStore.getState().polyVoiceBlankets[0].memberBlockIds).toEqual(['shared_filter']);
  });
});
