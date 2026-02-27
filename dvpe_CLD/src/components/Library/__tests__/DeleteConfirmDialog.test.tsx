/**
 * Tests for DeleteConfirmDialog Component
 * Work Stream C - Phase 13.5 Block Library Manager
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteConfirmDialog } from '../DeleteConfirmDialog';

describe('DeleteConfirmDialog', () => {
    const defaultProps = {
        isOpen: true,
        blockName: 'Test Block',
        blockId: 'test-block-id',
        onConfirm: vi.fn(),
        onCancel: vi.fn(),
    };

    it('should not render when closed', () => {
        const { container } = render(
            <DeleteConfirmDialog {...defaultProps} isOpen={false} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('should render when open', () => {
        render(<DeleteConfirmDialog {...defaultProps} />);

        expect(screen.getByRole('heading', { name: 'Delete Block' })).toBeInTheDocument();
        expect(screen.getByText('Test Block')).toBeInTheDocument();
        expect(screen.getByText('(test-block-id)')).toBeInTheDocument();
    });

    it('should display warning message', () => {
        render(<DeleteConfirmDialog {...defaultProps} />);

        expect(screen.getByText(/Are you sure you want to delete this block/i)).toBeInTheDocument();
        expect(screen.getByText(/This action cannot be undone/i)).toBeInTheDocument();
    });

    it('should call onConfirm when Delete Block clicked', () => {
        render(<DeleteConfirmDialog {...defaultProps} />);

        const deleteButton = screen.getByRole('button', { name: 'Delete Block' });
        fireEvent.click(deleteButton);

        expect(defaultProps.onConfirm).toHaveBeenCalled();
    });

    it('should call onCancel when Cancel clicked', () => {
        render(<DeleteConfirmDialog {...defaultProps} />);

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(defaultProps.onCancel).toHaveBeenCalled();
    });

    it('should call onCancel when backdrop clicked', () => {
        render(<DeleteConfirmDialog {...defaultProps} />);

        const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/50');
        if (backdrop) {
            fireEvent.click(backdrop);
            expect(defaultProps.onCancel).toHaveBeenCalled();
        }
    });

    it('should call onCancel when X button clicked', () => {
        render(<DeleteConfirmDialog {...defaultProps} />);

        const closeButton = screen.getByRole('button', { name: /close/i });
        fireEvent.click(closeButton);

        expect(defaultProps.onCancel).toHaveBeenCalled();
    });

    it('should have danger styling on delete button', () => {
        render(<DeleteConfirmDialog {...defaultProps} />);

        const deleteButton = screen.getByRole('button', { name: 'Delete Block' });
        expect(deleteButton).toHaveClass('bg-red-500');
    });
});
