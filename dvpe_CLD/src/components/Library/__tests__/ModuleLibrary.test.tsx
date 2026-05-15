import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ModuleLibrary from '../ModuleLibrary';
import { useUIStore } from '@/stores';

describe('ModuleLibrary', () => {
  beforeEach(() => {
    useUIStore.setState({
      panels: {
        ...useUIStore.getState().panels,
        library: { visible: true, width: 240 },
      },
    });
  });

  it('shows the poly voice blanket canvas directive in the library', () => {
    render(<ModuleLibrary />);

    expect(screen.getByText('Canvas Directives')).toBeInTheDocument();
    expect(screen.getByText('POLY VOICE BLANKET')).toBeInTheDocument();
  });

  it('starts a poly voice blanket drag from the library directive', () => {
    render(<ModuleLibrary />);

    const item = screen.getByText('POLY VOICE BLANKET').closest('[draggable="true"]');
    const dataTransfer = {
      setData: vi.fn(),
      effectAllowed: '',
    };

    fireEvent.dragStart(item!, { dataTransfer });

    expect(dataTransfer.setData).toHaveBeenCalledWith(
      'application/dvpe-poly-voice-blanket',
      'poly_voice_blanket'
    );
    expect(dataTransfer.setData).toHaveBeenCalledWith('text/plain', 'poly_voice_blanket');
  });
});
