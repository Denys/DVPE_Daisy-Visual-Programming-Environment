import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { BlockCategory, BlockColorScheme, BlockDefinition } from '../types/blocks';
import { resolveNodeDoubleClickAction } from '../components/Canvas/doubleClickActions';
import { HelpMenu } from '../components/TopBar/HelpMenu';
import { ShortcutsModal } from '../components/Help/ShortcutsModal';

describe('Simple Test', () => {
  it('should pass', () => {
    expect(1 + 1).toBe(2);
  });
});

describe('resolveNodeDoubleClickAction', () => {
  const baseDefinition: BlockDefinition = {
    id: 'test-block',
    className: 'TestClass',
    displayName: 'Test',
    category: BlockCategory.UTILITY,
    parameters: [],
    ports: [],
    colorScheme: BlockColorScheme.UTILITY,
    description: 'test',
  };

  it('keeps default inspect action without modifier', () => {
    const action = resolveNodeDoubleClickAction({
      ctrlKey: false,
      metaKey: false,
      definition: { ...baseDefinition, isCustom: true } as any,
    });

    expect(action).toBe('inspect');
  });

  it('returns custom internals action for Ctrl/Cmd + double-click on custom block', () => {
    const actionCtrl = resolveNodeDoubleClickAction({
      ctrlKey: true,
      metaKey: false,
      definition: { ...baseDefinition, isCustom: true } as any,
    });

    const actionMeta = resolveNodeDoubleClickAction({
      ctrlKey: false,
      metaKey: true,
      definition: { ...baseDefinition, isCustom: true } as any,
    });

    expect(actionCtrl).toBe('inspect-custom-internals');
    expect(actionMeta).toBe('inspect-custom-internals');
  });

  it('does not trigger custom internals for non-custom blocks', () => {
    const action = resolveNodeDoubleClickAction({
      ctrlKey: true,
      metaKey: false,
      definition: baseDefinition,
    });

    expect(action).toBe('inspect');
  });
});

describe('Help menu and shortcuts modal', () => {
  it('opens shortcuts entry and triggers callback', () => {
    const onOpenShortcuts = vi.fn();

    render(React.createElement(HelpMenu, { onOpenShortcuts }));

    fireEvent.click(screen.getByRole('button', { name: /help/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /shortcuts/i }));

    expect(onOpenShortcuts).toHaveBeenCalledTimes(1);
  });

  it('renders Ctrl/Cmd + Double-click shortcut entry and closes', () => {
    const onClose = vi.fn();

    render(React.createElement(ShortcutsModal, { isOpen: true, onClose }));

    expect(screen.getByText('Ctrl/Cmd + Double-click')).toBeInTheDocument();
    expect(screen.getByText('Inspect custom block internals')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /close shortcuts/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
