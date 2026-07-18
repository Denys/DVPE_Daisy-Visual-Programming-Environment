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

describe('patchStore clipboard operations', () => {
  beforeEach(() => {
    usePatchStore.getState().newPatch();
  });

  it('copies and pastes selected blocks with remapped internal connections', () => {
    usePatchStore.setState({
      blocks: [block('source', 100, 120), block('target', 320, 120), block('outside', 600, 120)],
      connections: [
        {
          id: 'internal',
          sourceBlockId: 'source',
          sourcePortId: 'out',
          targetBlockId: 'target',
          targetPortId: 'in',
          type: 'audio',
        },
        {
          id: 'external',
          sourceBlockId: 'target',
          sourcePortId: 'out',
          targetBlockId: 'outside',
          targetPortId: 'in',
          type: 'audio',
        },
      ],
      selectedBlockIds: ['source', 'target'],
      selectedConnectionIds: [],
      selectedPolyVoiceBlanketIds: [],
    });

    expect(usePatchStore.getState().copySelection()).toBe(true);
    const pastedIds = usePatchStore.getState().pasteClipboard({ x: 40, y: 60 });

    expect(pastedIds).toHaveLength(2);
    const state = usePatchStore.getState();
    const pastedBlocks = state.blocks.filter((item) => pastedIds.includes(item.id));
    expect(pastedBlocks.map((item) => item.position)).toEqual([
      { x: 140, y: 180 },
      { x: 360, y: 180 },
    ]);

    const remappedConnection = state.connections.find(
      (connection) =>
        pastedIds.includes(connection.sourceBlockId) &&
        pastedIds.includes(connection.targetBlockId)
    );
    expect(remappedConnection).toBeDefined();
    expect(state.connections.some((connection) => connection.id === 'external')).toBe(true);
    expect(state.selectedBlockIds).toEqual(pastedIds);
    expect(state.selectedConnectionIds).toEqual([]);
  });

  it('cuts selected blocks as one clipboard operation', () => {
    usePatchStore.setState({
      blocks: [block('source', 100, 120), block('target', 320, 120)],
      connections: [],
      selectedBlockIds: ['source'],
      selectedConnectionIds: [],
      selectedPolyVoiceBlanketIds: [],
    });

    expect(usePatchStore.getState().cutSelection()).toBe(true);

    const afterCut = usePatchStore.getState();
    expect(afterCut.hasClipboard()).toBe(true);
    expect(afterCut.blocks.map((item) => item.id)).toEqual(['target']);

    const pastedIds = usePatchStore.getState().pasteClipboard({ x: 20, y: 20 });
    expect(pastedIds).toHaveLength(1);
    expect(usePatchStore.getState().blocks).toHaveLength(2);
  });
});

describe('patchStore drag transactions', () => {
  beforeEach(() => {
    usePatchStore.getState().newPatch();
  });

  it('restores block and blanket positions when a move transaction is canceled', () => {
    usePatchStore.setState({
      blocks: [block('source', 100, 120)],
      polyVoiceBlankets: [
        {
          id: 'blanket',
          label: 'Voice',
          position: { x: 80, y: 90 },
          size: { width: 240, height: 160 },
          voiceCount: 8,
          octave: 2,
          allocator: 'reuse_free_oldest',
          memberBlockIds: ['source'],
        },
      ],
    });

    usePatchStore.getState().beginMoveTransaction(['source', 'blanket']);
    usePatchStore.getState().updateBlockPositions([{ id: 'source', position: { x: 400, y: 440 } }]);
    usePatchStore.getState().updatePolyVoiceBlanket('blanket', { position: { x: 360, y: 380 } });

    expect(usePatchStore.getState().cancelMoveTransaction()).toBe(true);

    const state = usePatchStore.getState();
    expect(state.blocks[0].position).toEqual({ x: 100, y: 120 });
    expect(state.polyVoiceBlankets[0].position).toEqual({ x: 80, y: 90 });
  });

  it('marks the patch dirty when a changed move transaction is committed', () => {
    usePatchStore.setState({
      blocks: [block('source', 100, 120)],
      isDirty: false,
    });

    usePatchStore.getState().beginMoveTransaction(['source']);
    usePatchStore.getState().updateBlockPositions([{ id: 'source', position: { x: 180, y: 200 } }]);

    expect(usePatchStore.getState().commitMoveTransaction()).toBe(true);
    expect(usePatchStore.getState().isDirty).toBe(true);
    expect(usePatchStore.getState().history.at(-1)?.description).toBe('Move selection');
  });
});
