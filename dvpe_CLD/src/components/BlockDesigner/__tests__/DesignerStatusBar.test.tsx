import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DesignerStatusBar } from '../DesignerStatusBar';

describe('DesignerStatusBar', () => {
    const defaultProps = {
        zoom: 100,
        cursorX: 0,
        cursorY: 0,
        selectedCount: 0,
        elementCount: 0,
    };

    it('renders all status sections', () => {
        render(<DesignerStatusBar {...defaultProps} />);
        expect(screen.getByText('Zoom:')).toBeInTheDocument();
        expect(screen.getByText('Cursor:')).toBeInTheDocument();
        expect(screen.getByText('Elements:')).toBeInTheDocument();
    });

    it('displays correct zoom level', () => {
        render(<DesignerStatusBar {...defaultProps} zoom={150} />);
        expect(screen.getByText('150%')).toBeInTheDocument();
    });

    it('displays cursor coordinates', () => {
        render(<DesignerStatusBar {...defaultProps} cursorX={123} cursorY={456} />);
        expect(screen.getByText('123, 456')).toBeInTheDocument();
    });

    it('displays correct selection text', () => {
        const { rerender } = render(<DesignerStatusBar {...defaultProps} selectedCount={0} />);
        expect(screen.getByText('No selection')).toBeInTheDocument();

        rerender(<DesignerStatusBar {...defaultProps} selectedCount={1} />);
        expect(screen.getByText('1 element selected')).toBeInTheDocument();

        rerender(<DesignerStatusBar {...defaultProps} selectedCount={5} />);
        expect(screen.getByText('5 elements selected')).toBeInTheDocument();
    });

    it('displays total element count', () => {
        render(<DesignerStatusBar {...defaultProps} elementCount={10} />);
        expect(screen.getByText('10')).toBeInTheDocument();
    });
});
