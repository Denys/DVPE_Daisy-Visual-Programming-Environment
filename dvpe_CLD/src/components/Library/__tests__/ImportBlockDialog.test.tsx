/**
 * Tests for ImportBlockDialog Component
 * Work Stream C - Phase 13.5 Block Library Manager
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImportBlockDialog } from '../ImportBlockDialog';

describe('ImportBlockDialog', () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        onImport: vi.fn(() => ({ success: true, blockId: 'imported-block' })),
        onImportWithNewId: vi.fn(() => ({ success: true, blockId: 'renamed-block' })),
    };

    it('should not render when closed', () => {
        const { container } = render(
            <ImportBlockDialog {...defaultProps} isOpen={false} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('should render when open', () => {
        render(<ImportBlockDialog {...defaultProps} />);

        expect(screen.getByText('Import Block')).toBeInTheDocument();
        expect(screen.getByText('Drop a .dvpe-block file here')).toBeInTheDocument();
    });

    it('should show reading state when file is selected', async () => {
        render(<ImportBlockDialog {...defaultProps} />);

        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        const file = new File(['{"version":"1.0","block":{"id":"test"}}'], 'test.dvpe-block', {
            type: 'application/json',
        });

        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText('Reading file...')).toBeInTheDocument();
        });
    });

    it('should show success state when import succeeds', async () => {
        render(<ImportBlockDialog {...defaultProps} />);

        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        const validBlock = {
            version: '1.0',
            block: {
                id: 'test-block',
                displayName: 'Test Block',
                className: 'TestClass',
                description: 'Test description',
                category: 'SOURCES',
                colorScheme: 'AUDIO',
                ports: [],
                parameters: [],
                isCustom: true,
                internalPatch: null,
                exposedPorts: {},
                exposedParameters: {},
            },
        };
        const file = new File([JSON.stringify(validBlock)], 'test.dvpe-block', {
            type: 'application/json',
        });

        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText('Import Successful')).toBeInTheDocument();
        });
    });

    it('should show error state when import fails', async () => {
        const failImport = vi.fn(() => ({ success: false, error: 'Invalid format' }));
        render(<ImportBlockDialog {...defaultProps} onImport={failImport} />);

        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        const invalidData = { invalid: true };
        const file = new File([JSON.stringify(invalidData)], 'test.dvpe-block', {
            type: 'application/json',
        });

        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText('Import Failed')).toBeInTheDocument();
        });
    });

    it('should show duplicate state when block ID already exists', async () => {
        const duplicateImport = vi.fn(() => ({
            success: false,
            error: 'Block with same ID already exists',
            duplicateId: 'existing-block',
        }));
        render(<ImportBlockDialog {...defaultProps} onImport={duplicateImport} />);

        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        const validBlock = {
            version: '1.0',
            block: {
                id: 'existing-block',
                displayName: 'Existing Block',
                className: 'ExistingClass',
                description: 'Test description',
                category: 'SOURCES',
                colorScheme: 'AUDIO',
                ports: [],
                parameters: [],
                isCustom: true,
                internalPatch: null,
                exposedPorts: {},
                exposedParameters: {},
            },
        };
        const file = new File([JSON.stringify(validBlock)], 'test.dvpe-block', {
            type: 'application/json',
        });

        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText('Duplicate Block ID')).toBeInTheDocument();
            expect(screen.getByText(/existing-block/)).toBeInTheDocument();
        });
    });

    it('should close when backdrop clicked', () => {
        render(<ImportBlockDialog {...defaultProps} />);

        const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/50');
        if (backdrop) {
            fireEvent.click(backdrop);
            expect(defaultProps.onClose).toHaveBeenCalled();
        }
    });

    it('should close when X button clicked', () => {
        render(<ImportBlockDialog {...defaultProps} />);

        const closeButton = screen.getByRole('button', { name: /close/i });
        fireEvent.click(closeButton);

        expect(defaultProps.onClose).toHaveBeenCalled();
    });
});
