/**
 * CommentNode Component
 * A text comment node for annotating the canvas
 */

import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { NodeProps, NodeResizer, useReactFlow } from '@xyflow/react';
import { motion } from 'framer-motion';
import { X, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePatchStore } from '@/stores';
import { CommentNode as CommentNodeType } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

export interface CommentNodeData extends Record<string, unknown> {
    comment: CommentNodeType;
}

// ============================================================================
// COMMENT NODE COMPONENT
// ============================================================================

const CommentNode: React.FC<NodeProps> = ({
    id,
    data,
    selected,
}) => {
    const { setNodes } = useReactFlow();
    const updateComment = usePatchStore((state) => state.updateComment);
    const removeComment = usePatchStore((state) => state.removeComment);

    const commentData = (data as CommentNodeData)?.comment;
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(commentData?.text || '');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Focus textarea when editing starts
    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.select();
        }
    }, [isEditing]);

    // Handle save
    const handleSave = useCallback(() => {
        setIsEditing(false);
        if (commentData) {
            updateComment(id, { text });
        }
    }, [id, text, commentData, updateComment]);

    // Handle delete
    const handleDelete = useCallback(() => {
        removeComment(id);
        setNodes((nodes) => nodes.filter((n) => n.id !== id));
    }, [id, removeComment, setNodes]);

    // Handle double-click to edit
    const handleDoubleClick = useCallback(() => {
        setIsEditing(true);
    }, []);

    // Handle keydown
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsEditing(false);
            setText(commentData?.text || '');
        }
        // Allow Ctrl+Enter to save
        if (e.key === 'Enter' && e.ctrlKey) {
            handleSave();
        }
    }, [commentData?.text, handleSave]);

    const bgColor = commentData?.color || '#374151';

    return (
        <>
            {/* Node resizer when selected */}
            <NodeResizer
                minWidth={100}
                minHeight={50}
                isVisible={selected}
                lineClassName="border-accent-primary"
                handleClassName="w-2 h-2 bg-accent-primary rounded-sm"
            />

            <motion.div
                className={cn(
                    'rounded-lg shadow-lg overflow-hidden',
                    'border-2 transition-colors',
                    selected ? 'border-accent-primary' : 'border-transparent'
                )}
                style={{ backgroundColor: bgColor }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-2 py-1 bg-black/20">
                    <div className="flex items-center gap-1 text-white/70">
                        <MessageSquare className="w-3 h-3" />
                        <span className="text-[10px] font-medium uppercase">Comment</span>
                    </div>
                    {selected && (
                        <button
                            onClick={handleDelete}
                            className={cn(
                                'w-4 h-4 rounded flex items-center justify-center',
                                'bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors'
                            )}
                            aria-label="Delete comment"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div
                    className="p-2 min-w-[100px] min-h-[50px]"
                    onDoubleClick={handleDoubleClick}
                >
                    {isEditing ? (
                        <textarea
                            ref={textareaRef}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onBlur={handleSave}
                            onKeyDown={handleKeyDown}
                            className={cn(
                                'w-full h-full min-h-[40px] resize-none',
                                'bg-transparent text-white text-sm',
                                'focus:outline-none placeholder-white/40'
                            )}
                            placeholder="Enter comment..."
                        />
                    ) : (
                        <div
                            className={cn(
                                'text-sm text-white whitespace-pre-wrap cursor-text',
                                !text && 'text-white/40 italic'
                            )}
                        >
                            {text || 'Double-click to add text'}
                        </div>
                    )}
                </div>
            </motion.div>
        </>
    );
};

export default memo(CommentNode);
