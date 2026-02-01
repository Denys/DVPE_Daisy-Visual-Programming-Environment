import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BlockUIDesigner } from '../BlockUIDesigner';
import * as storeModule from '@/stores/blockDesignerStore';

// Mock the store hook
vi.mock('@/stores/blockDesignerStore', () => ({
    useBlockDesignerStore: vi.fn(),
    selectElements: (state: any) => state.elements,
    selectSelectedIds: (state: any) => state.selectedIds,
    selectSelectedElements: (state: any) => [], // Return empty for test unless needed
    selectView: (state: any) => state.view,
    selectMode: (state: any) => state.mode,
    selectPlacingElementType: (state: any) => state.placingElementType,
    selectCanUndo: (state: any) => false,
    selectCanRedo: (state: any) => false,
    selectClipboard: (state: any) => null,
}));

describe('BlockUIDesigner Layout', () => {
    const mockState = {
        elements: [],
        selectedIds: [],
        view: { zoom: 100, panOffset: { x: 0, y: 0 }, gridVisible: true },
        mode: 'select',
        placingElementType: null,
        history: { past: [], future: [] },
        // Actions
        addElement: vi.fn(),
        removeElement: vi.fn(),
        updateElement: vi.fn(),
        selectElements: vi.fn(),
        selectAll: vi.fn(),
        setZoom: vi.fn(),
        zoomIn: vi.fn(),
        zoomOut: vi.fn(),
        resetView: vi.fn(),
        setMode: vi.fn(),
        startPlacing: vi.fn(),
        cancelPlacing: vi.fn(),
        undo: vi.fn(),
        redo: vi.fn(),
        copy: vi.fn(),
        paste: vi.fn(),
        bringToFront: vi.fn(),
        sendToBack: vi.fn(),
        togleGrid: vi.fn(),
        loadElements: vi.fn(), // If called on mount
        setActiveBlock: vi.fn(),
        setCanvasDimensions: vi.fn(),
    };

    beforeEach(() => {
        // @ts-ignore
        storeModule.useBlockDesignerStore.mockImplementation((selector) => {
            // If a selector is passed, apply it to mockState
            if (selector) return selector(mockState);
            // Otherwise return the whole state/actions (for the destructured calls)
            return mockState;
        });
    });

    const defaultProps = {
        blockId: 'test-block',
        blockName: 'Test Block',
        onSave: vi.fn(),
        onCancel: vi.fn(),
    };

    it('renders the main layout areas', () => {
        const { container } = render(<BlockUIDesigner {...defaultProps} />);

        // Toolbar
        expect(container.querySelector('.designer-toolbar')).toBeInTheDocument();

        // Library Panel (Left)
        expect(screen.getByText('Elements')).toBeInTheDocument(); // Title of library

        // Canvas (Center)
        expect(container.querySelector('.design-canvas')).toBeInTheDocument();

        // Inspector Panel (Right)
        expect(screen.getByText('Inspector')).toBeInTheDocument(); // Title of inspector

        // Status Bar (Bottom)
        expect(container.querySelector('.designer-status-bar')).toBeInTheDocument();
    });
});
