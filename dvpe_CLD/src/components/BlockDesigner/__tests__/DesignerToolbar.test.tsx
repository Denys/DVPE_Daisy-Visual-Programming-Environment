import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DesignerToolbar } from '../DesignerToolbar';

describe('DesignerToolbar', () => {
    const defaultProps = {
        zoom: 100,
        onZoomIn: vi.fn(),
        onZoomOut: vi.fn(),
        onZoomReset: vi.fn(),
        onToggleGrid: vi.fn(),
        onSelectAll: vi.fn(),
        onDelete: vi.fn(),
        onCopy: vi.fn(),
        onPaste: vi.fn(),
        onUndo: vi.fn(),
        onRedo: vi.fn(),
        onAlignLeft: vi.fn(),
        onAlignCenter: vi.fn(),
        onAlignRight: vi.fn(),
        hasSelection: false,
    };

    it('renders toolbar sections', () => {
        render(<DesignerToolbar {...defaultProps} />);
        // Check for general presence of buttons by title (tooltip)
        expect(screen.getByTitle('Select (V)')).toBeInTheDocument();
        expect(screen.getByTitle(/Pan/)).toBeInTheDocument();
        expect(screen.getByTitle(/Zoom In/)).toBeInTheDocument();
        expect(screen.getByTitle(/Undo/)).toBeInTheDocument();
    });

    it('calls zoom handlers', () => {
        render(<DesignerToolbar {...defaultProps} />);
        fireEvent.click(screen.getByTitle('Zoom In'));
        expect(defaultProps.onZoomIn).toHaveBeenCalled();

        fireEvent.click(screen.getByTitle('Zoom Out'));
        expect(defaultProps.onZoomOut).toHaveBeenCalled();
    });

    it('calls undo/redo handlers', () => {
        render(<DesignerToolbar {...defaultProps} />);
        fireEvent.click(screen.getByTitle(/Undo/));
        expect(defaultProps.onUndo).toHaveBeenCalled();

        fireEvent.click(screen.getByTitle(/Redo/));
        expect(defaultProps.onRedo).toHaveBeenCalled();
    });

    it('disables alignment tools when no selection', () => {
        render(<DesignerToolbar {...defaultProps} hasSelection={false} />);
        const alignLeftBtn = screen.getByTitle('Align Left');
        expect(alignLeftBtn).toBeDisabled();
    });

    it('enables alignment tools when has selection', () => {
        render(<DesignerToolbar {...defaultProps} hasSelection={true} />);
        const alignLeftBtn = screen.getByTitle('Align Left');
        expect(alignLeftBtn).not.toBeDisabled();

        fireEvent.click(alignLeftBtn);
        expect(defaultProps.onAlignLeft).toHaveBeenCalled();
    });

    it('calls Select All handler', () => {
        render(<DesignerToolbar {...defaultProps} />);
        const selectAllBtn = screen.getByTitle(/Select All/);
        fireEvent.click(selectAllBtn);
        expect(defaultProps.onSelectAll).toHaveBeenCalled();
    });
});
