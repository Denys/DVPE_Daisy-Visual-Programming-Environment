/**
 * Phase 6 UI/UX Enhancements Validation Tests
 * Tests for: Rectangle Selection, Connection Labels, Comments, Alignment Tools
 */

// import { describe, it, expect, beforeEach } from 'vitest';
import { usePatchStore } from '@/stores/patchStore';
import { Connection, CommentNode, BlockInstance } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Helper to create mock blocks directly in store
const createMockBlock = (position: { x: number; y: number }): BlockInstance => ({
    id: uuidv4(),
    definitionId: 'test-block',
    position,
    parameterValues: {},
});

// Reset store before each test
beforeEach(() => {
    usePatchStore.setState({
        blocks: [],
        connections: [],
        comments: [],
        selectedBlockIds: [],
        selectedConnectionIds: [],
        history: [],
        historyIndex: -1,
        isDirty: false,
    });
});

describe('Phase 6 UI/UX Enhancements', () => {
    // ========================================================================
    // TASK 6.1: Rectangle Selection
    // ========================================================================
    describe('6.1 Rectangle Selection', () => {
        it('selectBlocks should support selecting multiple blocks', () => {
            const store = usePatchStore.getState();

            // Add mock blocks directly to state
            const block1 = createMockBlock({ x: 100, y: 100 });
            const block2 = createMockBlock({ x: 200, y: 100 });
            const block3 = createMockBlock({ x: 300, y: 100 });

            usePatchStore.setState({ blocks: [block1, block2, block3] });

            // Select multiple blocks (simulating rectangle selection result)
            store.selectBlocks([block1.id, block2.id, block3.id]);

            const state = usePatchStore.getState();
            expect(state.selectedBlockIds).toHaveLength(3);
            expect(state.selectedBlockIds).toContain(block1.id);
            expect(state.selectedBlockIds).toContain(block2.id);
            expect(state.selectedBlockIds).toContain(block3.id);
        });
    });

    // ========================================================================
    // TASK 6.2: Connection Labels/Aliases
    // ========================================================================
    describe('6.2 Connection Labels/Aliases', () => {
        it('Connection interface should have optional label field', () => {
            const connection: Connection = {
                id: 'test-conn',
                sourceBlockId: 'block1',
                sourcePortId: 'out',
                targetBlockId: 'block2',
                targetPortId: 'in',
                type: 'audio',
                label: 'Test Label',
            };

            expect(connection.label).toBe('Test Label');
        });

        it('setConnectionLabel should update connection label', () => {
            const conn: Connection = {
                id: 'conn-1',
                sourceBlockId: 'block1',
                sourcePortId: 'out',
                targetBlockId: 'block2',
                targetPortId: 'in',
                type: 'audio',
            };

            usePatchStore.setState({ connections: [conn] });
            usePatchStore.getState().setConnectionLabel(conn.id, 'Audio Signal');

            const updatedConn = usePatchStore.getState().getConnectionById(conn.id);
            expect(updatedConn?.label).toBe('Audio Signal');
        });

        it('setConnectionLabel with empty string should clear label', () => {
            const conn: Connection = {
                id: 'conn-1',
                sourceBlockId: 'block1',
                sourcePortId: 'out',
                targetBlockId: 'block2',
                targetPortId: 'in',
                type: 'audio',
                label: 'Initial Label',
            };

            usePatchStore.setState({ connections: [conn] });
            usePatchStore.getState().setConnectionLabel(conn.id, '');

            const updatedConn = usePatchStore.getState().getConnectionById(conn.id);
            expect(updatedConn?.label).toBeUndefined();
        });
    });

    // ========================================================================
    // TASK 6.3: Block Comments
    // ========================================================================
    describe('6.3 Block Comments', () => {
        it('CommentNode interface should have required fields', () => {
            const comment: CommentNode = {
                id: 'comment-1',
                text: 'This is a test comment',
                position: { x: 100, y: 200 },
                size: { width: 200, height: 100 },
                color: '#374151',
            };

            expect(comment.id).toBe('comment-1');
            expect(comment.text).toBe('This is a test comment');
            expect(comment.position).toEqual({ x: 100, y: 200 });
            expect(comment.size).toEqual({ width: 200, height: 100 });
            expect(comment.color).toBe('#374151');
        });

        it('addComment should create a new comment', () => {
            const store = usePatchStore.getState();
            const comment = store.addComment({ x: 150, y: 250 }, 'Test comment');

            expect(comment).toBeDefined();
            expect(comment.id).toBeDefined();
            expect(comment.text).toBe('Test comment');
            expect(comment.position).toEqual({ x: 150, y: 250 });
            expect(usePatchStore.getState().comments).toHaveLength(1);
        });

        it('removeComment should delete a comment', () => {
            const store = usePatchStore.getState();
            const comment = store.addComment({ x: 100, y: 100 }, 'To be deleted');
            expect(usePatchStore.getState().comments).toHaveLength(1);

            store.removeComment(comment.id);
            expect(usePatchStore.getState().comments).toHaveLength(0);
        });

        it('updateComment should update comment properties', () => {
            const store = usePatchStore.getState();
            const comment = store.addComment({ x: 100, y: 100 }, 'Original');

            store.updateComment(comment.id, {
                text: 'Updated text',
                color: '#ef4444',
                position: { x: 200, y: 300 },
            });

            const updated = usePatchStore.getState().comments.find((c) => c.id === comment.id);
            expect(updated?.text).toBe('Updated text');
            expect(updated?.color).toBe('#ef4444');
            expect(updated?.position).toEqual({ x: 200, y: 300 });
        });
    });

    // ========================================================================
    // TASK 6.4: Block Alignment Tools
    // ========================================================================
    describe('6.4 Block Alignment Tools', () => {
        describe('Horizontal Alignment', () => {
            it('alignBlocksLeft should align all selected blocks to leftmost position', () => {
                const block1 = createMockBlock({ x: 100, y: 100 });
                const block2 = createMockBlock({ x: 200, y: 150 });
                const block3 = createMockBlock({ x: 300, y: 200 });

                usePatchStore.setState({
                    blocks: [block1, block2, block3],
                    selectedBlockIds: [block1.id, block2.id, block3.id],
                });

                usePatchStore.getState().alignBlocksLeft();

                const state = usePatchStore.getState();
                expect(state.blocks.find((b) => b.id === block1.id)?.position.x).toBe(100);
                expect(state.blocks.find((b) => b.id === block2.id)?.position.x).toBe(100);
                expect(state.blocks.find((b) => b.id === block3.id)?.position.x).toBe(100);
            });

            it('alignBlocksRight should align all selected blocks to rightmost position', () => {
                const block1 = createMockBlock({ x: 100, y: 100 });
                const block2 = createMockBlock({ x: 200, y: 150 });
                const block3 = createMockBlock({ x: 300, y: 200 });

                usePatchStore.setState({
                    blocks: [block1, block2, block3],
                    selectedBlockIds: [block1.id, block2.id, block3.id],
                });

                usePatchStore.getState().alignBlocksRight();

                const state = usePatchStore.getState();
                expect(state.blocks.find((b) => b.id === block1.id)?.position.x).toBe(300);
                expect(state.blocks.find((b) => b.id === block2.id)?.position.x).toBe(300);
                expect(state.blocks.find((b) => b.id === block3.id)?.position.x).toBe(300);
            });

            it('alignBlocksCenterH should align to average X position', () => {
                const block1 = createMockBlock({ x: 100, y: 100 });
                const block2 = createMockBlock({ x: 200, y: 150 });
                const block3 = createMockBlock({ x: 300, y: 200 });

                usePatchStore.setState({
                    blocks: [block1, block2, block3],
                    selectedBlockIds: [block1.id, block2.id, block3.id],
                });

                usePatchStore.getState().alignBlocksCenterH();

                const state = usePatchStore.getState();
                expect(state.blocks.find((b) => b.id === block1.id)?.position.x).toBe(200);
                expect(state.blocks.find((b) => b.id === block2.id)?.position.x).toBe(200);
                expect(state.blocks.find((b) => b.id === block3.id)?.position.x).toBe(200);
            });
        });

        describe('Vertical Alignment', () => {
            it('alignBlocksTop should align all selected blocks to topmost position', () => {
                const block1 = createMockBlock({ x: 100, y: 100 });
                const block2 = createMockBlock({ x: 150, y: 200 });
                const block3 = createMockBlock({ x: 200, y: 300 });

                usePatchStore.setState({
                    blocks: [block1, block2, block3],
                    selectedBlockIds: [block1.id, block2.id, block3.id],
                });

                usePatchStore.getState().alignBlocksTop();

                const state = usePatchStore.getState();
                expect(state.blocks.find((b) => b.id === block1.id)?.position.y).toBe(100);
                expect(state.blocks.find((b) => b.id === block2.id)?.position.y).toBe(100);
                expect(state.blocks.find((b) => b.id === block3.id)?.position.y).toBe(100);
            });

            it('alignBlocksBottom should align all selected blocks to bottommost position', () => {
                const block1 = createMockBlock({ x: 100, y: 100 });
                const block2 = createMockBlock({ x: 150, y: 200 });
                const block3 = createMockBlock({ x: 200, y: 300 });

                usePatchStore.setState({
                    blocks: [block1, block2, block3],
                    selectedBlockIds: [block1.id, block2.id, block3.id],
                });

                usePatchStore.getState().alignBlocksBottom();

                const state = usePatchStore.getState();
                expect(state.blocks.find((b) => b.id === block1.id)?.position.y).toBe(300);
                expect(state.blocks.find((b) => b.id === block2.id)?.position.y).toBe(300);
                expect(state.blocks.find((b) => b.id === block3.id)?.position.y).toBe(300);
            });
        });

        describe('Distribution', () => {
            it('distributeBlocksH should space blocks evenly horizontally', () => {
                const block1 = createMockBlock({ x: 0, y: 100 });
                const block2 = createMockBlock({ x: 50, y: 100 });
                const block3 = createMockBlock({ x: 300, y: 100 });

                usePatchStore.setState({
                    blocks: [block1, block2, block3],
                    selectedBlockIds: [block1.id, block2.id, block3.id],
                });

                usePatchStore.getState().distributeBlocksH();

                const state = usePatchStore.getState();
                const positions = state.blocks.map((b) => b.position.x).sort((a, b) => a - b);
                expect(positions[0]).toBe(0);
                expect(positions[1]).toBe(150);
                expect(positions[2]).toBe(300);
            });

            it('distributeBlocksV requires at least 3 blocks', () => {
                const block1 = createMockBlock({ x: 100, y: 100 });
                const block2 = createMockBlock({ x: 100, y: 200 });

                usePatchStore.setState({
                    blocks: [block1, block2],
                    selectedBlockIds: [block1.id, block2.id],
                });

                usePatchStore.getState().distributeBlocksV();

                const state = usePatchStore.getState();
                expect(state.blocks.find((b) => b.id === block1.id)?.position.y).toBe(100);
                expect(state.blocks.find((b) => b.id === block2.id)?.position.y).toBe(200);
            });
        });
    });
});
