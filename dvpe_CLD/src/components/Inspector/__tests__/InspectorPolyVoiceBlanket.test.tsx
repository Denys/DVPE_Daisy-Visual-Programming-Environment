import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import Inspector from '../Inspector';
import { usePatchStore, useUIStore } from '@/stores';

describe('Inspector poly voice blanket support', () => {
  beforeEach(() => {
    usePatchStore.getState().newPatch();
    usePatchStore.setState({
      blocks: [],
      connections: [],
      polyVoiceBlankets: [
        {
          id: 'blanket_1',
          label: 'Voice Template',
          position: { x: 100, y: 120 },
          size: { width: 560, height: 340 },
          voiceCount: 8,
          octave: 2,
          allocator: 'reuse_free_oldest',
          memberBlockIds: ['grainlet_1', 'env_1'],
        },
      ],
      selectedPolyVoiceBlanketIds: ['blanket_1'],
      selectedBlockIds: [],
      selectedConnectionIds: [],
    });
    useUIStore.setState({
      inspectedBlockId: null,
      panels: {
        ...useUIStore.getState().panels,
        inspector: { visible: true, width: 320 },
      },
    });
  });

  it('renders and edits selected blanket parameters', () => {
    render(<Inspector />);

    expect(screen.getByText('Poly Voice Blanket')).toBeInTheDocument();
    expect(screen.getByLabelText('Voice Count')).toHaveValue(8);

    fireEvent.change(screen.getByLabelText('Voice Count'), { target: { value: '6' } });

    expect(usePatchStore.getState().polyVoiceBlankets[0].voiceCount).toBe(6);
  });
});
