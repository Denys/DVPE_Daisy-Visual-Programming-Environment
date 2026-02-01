/**
 * Unit tests for Block Designer Store - Phase 13.2
 */
import { useBlockDesignerStore } from '../blockDesignerStore';
import { UIElementType } from '@/types/uiElement';

describe('BlockDesignerStore', () => {
    beforeEach(() => {
        // Reset store before each test
        useBlockDesignerStore.getState().clearDesigner();
    });

    describe('Element CRUD', () => {
        it('adds an element and returns its ID', () => {
            const store = useBlockDesignerStore.getState();

            const id = store.addElement({
                type: UIElementType.ROTARY_KNOB,
                position: { x: 50, y: 50 },
                size: { width: 60, height: 60 },
                rotation: 0,
                config: {},
            });

            const state = useBlockDesignerStore.getState();
            expect(id).toBeDefined();
            expect(state.elements).toHaveLength(1);
            expect(state.elements[0].id).toBe(id);
        });

        it('removes an element by ID', () => {
            const store = useBlockDesignerStore.getState();

            const id = store.addElement({
                type: UIElementType.SLIDER,
                position: { x: 0, y: 0 },
                size: { width: 30, height: 100 },
                rotation: 0,
                config: {},
            });

            store.removeElement(id);

            expect(useBlockDesignerStore.getState().elements).toHaveLength(0);
        });

        it('updates an element', () => {
            const store = useBlockDesignerStore.getState();

            const id = store.addElement({
                type: UIElementType.TEXT_LABEL,
                position: { x: 10, y: 10 },
                size: { width: 80, height: 20 },
                rotation: 0,
                config: { text: 'Old' },
            });

            store.updateElement(id, { config: { text: 'Updated' } });

            const updated = useBlockDesignerStore.getState().elements[0];
            expect(updated.config.text).toBe('Updated');
        });
    });

    describe('Selection', () => {
        it('selects a single element', () => {
            const store = useBlockDesignerStore.getState();

            const id = store.addElement({
                type: UIElementType.TOGGLE,
                position: { x: 0, y: 0 },
                size: { width: 40, height: 20 },
                rotation: 0,
                config: {},
            });

            store.selectElement(id);

            expect(useBlockDesignerStore.getState().selectedIds).toEqual([id]);
        });

        it('adds to selection with addToSelection flag', () => {
            const store = useBlockDesignerStore.getState();

            const id1 = store.addElement({
                type: UIElementType.ROTARY_KNOB,
                position: { x: 0, y: 0 },
                size: { width: 60, height: 60 },
                rotation: 0,
                config: {},
            });

            const id2 = store.addElement({
                type: UIElementType.SLIDER,
                position: { x: 100, y: 0 },
                size: { width: 30, height: 100 },
                rotation: 0,
                config: {},
            });

            store.selectElement(id1);
            store.selectElement(id2, true); // Add to selection

            expect(useBlockDesignerStore.getState().selectedIds).toContain(id1);
            expect(useBlockDesignerStore.getState().selectedIds).toContain(id2);
        });

        it('clears selection', () => {
            const store = useBlockDesignerStore.getState();

            const id = store.addElement({
                type: UIElementType.DROPDOWN,
                position: { x: 0, y: 0 },
                size: { width: 100, height: 30 },
                rotation: 0,
                config: {},
            });

            store.selectElement(id);
            store.clearSelection();

            expect(useBlockDesignerStore.getState().selectedIds).toHaveLength(0);
        });
    });

    describe('History', () => {
        it('supports undo', () => {
            const store = useBlockDesignerStore.getState();

            store.addElement({
                type: UIElementType.ROTARY_KNOB,
                position: { x: 50, y: 50 },
                size: { width: 60, height: 60 },
                rotation: 0,
                config: {},
            });

            expect(useBlockDesignerStore.getState().elements).toHaveLength(1);

            store.undo();

            expect(useBlockDesignerStore.getState().elements).toHaveLength(0);
        });

        it('supports redo after undo', () => {
            const store = useBlockDesignerStore.getState();

            store.addElement({
                type: UIElementType.SLIDER,
                position: { x: 0, y: 0 },
                size: { width: 30, height: 100 },
                rotation: 0,
                config: {},
            });

            store.undo();
            expect(useBlockDesignerStore.getState().elements).toHaveLength(0);

            store.redo();
            expect(useBlockDesignerStore.getState().elements).toHaveLength(1);
        });
    });

    describe('Clipboard', () => {
        it('copies and pastes elements', () => {
            const store = useBlockDesignerStore.getState();

            const id = store.addElement({
                type: UIElementType.GROUP_BOX,
                position: { x: 0, y: 0 },
                size: { width: 150, height: 100 },
                rotation: 0,
                config: {},
            });

            store.selectElement(id);
            store.copy();
            store.paste();

            expect(useBlockDesignerStore.getState().elements).toHaveLength(2);
        });
    });

    describe('View', () => {
        it('zooms in', () => {
            const store = useBlockDesignerStore.getState();
            const initialZoom = store.view.zoom;

            store.zoomIn();

            expect(useBlockDesignerStore.getState().view.zoom).toBeGreaterThan(initialZoom);
        });

        it('toggles grid visibility', () => {
            const store = useBlockDesignerStore.getState();
            const initialVisible = store.view.gridVisible;

            store.toggleGrid();

            expect(useBlockDesignerStore.getState().view.gridVisible).toBe(!initialVisible);
        });
    });
});
