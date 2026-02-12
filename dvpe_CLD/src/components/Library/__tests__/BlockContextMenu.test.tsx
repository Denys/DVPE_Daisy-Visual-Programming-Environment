/**
 * Tests for BlockContextMenu Component
 * Work Stream C - Phase 13.5 Block Library Manager
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BlockContextMenu, ContextMenuAction } from '../BlockContextMenu';

describe('BlockContextMenu', () => {
    const defaultProps = {
        isOpen: true,
        position: { x: 100, y: 100 },
        blockId: 'test-block',
        blockName: 'Test Block',
        onAction: vi.fn(),
        onClose: vi.fn(),
    };

    it('should not render when closed', () => {
        const { container } = render(
            <BlockContextMenu {...defaultProps} isOpen={false} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('should render when open', () => {
        render(<BlockContextMenu {...defaultProps} />);

        expect(screen.getByText('Custom Block')).toBeInTheDocument();
        expect(screen.getByText('Test Block')).toBeInTheDocument();
    });

    it('should render all menu items', () => {
        render(<BlockContextMenu {...defaultProps} />);

        expect(screen.getByText('Edit')).toBeInTheDocument();
        expect(screen.getByText('Duplicate')).toBeInTheDocument();
        expect(screen.getByText('Export as .dvpe-block')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should call onAction with "edit" when Edit clicked', () => {
        render(<BlockContextMenu {...defaultProps} />);

        fireEvent.click(screen.getByText('Edit'));

        expect(defaultProps.onAction).toHaveBeenCalledWith('edit');
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should call onAction with "duplicate" when Duplicate clicked', () => {
        render(<BlockContextMenu {...defaultProps} />);

        fireEvent.click(screen.getByText('Duplicate'));

        expect(defaultProps.onAction).toHaveBeenCalledWith('duplicate');
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should call onAction with "export" when Export clicked', () => {
        render(<BlockContextMenu {...defaultProps} />);

        fireEvent.click(screen.getByText('Export as .dvpe-block'));

        expect(defaultProps.onAction).toHaveBeenCalledWith('export');
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should call onAction with "delete" when Delete clicked', () => {
        render(<BlockContextMenu {...defaultProps} />);

        fireEvent.click(screen.getByText('Delete'));

        expect(defaultProps.onAction).toHaveBeenCalledWith('delete');
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should close on backdrop click', () => {
        render(<BlockContextMenu {...defaultProps} />);

        const backdrop = document.querySelector('.fixed.inset-0.z-40');
        if (backdrop) {
            fireEvent.click(backdrop);
            expect(defaultProps.onClose).toHaveBeenCalled();
        }
    });

    it('should close on Escape key', () => {
        render(<BlockContextMenu {...defaultProps} />);

        fireEvent.keyDown(document, { key: 'Escape' });

        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should have correct styling for danger action', () => {
        render(<BlockContextMenu {...defaultProps} />);

        const deleteButton = screen.getByText('Delete').closest('button');
        expect(deleteButton).toHaveClass('text-red-400');
    });
});
