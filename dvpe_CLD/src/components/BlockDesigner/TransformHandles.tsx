/**
 * TransformHandles - Resize and rotate handles for selected elements
 * Phase 13.2: Visual UI Builder
 */

import React, { useRef, useCallback } from 'react';

interface TransformHandlesProps {
    size: { width: number; height: number };
    onResize: (size: { width: number; height: number }) => void;
    onRotate?: (angle: number) => void;
    minSize?: { width: number; height: number };
}

type HandlePosition = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

const handlePositions: HandlePosition[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

export const TransformHandles: React.FC<TransformHandlesProps> = ({
    size,
    onResize,
    onRotate,
    minSize = { width: 20, height: 20 },
}) => {
    const startSize = useRef(size);
    const startPos = useRef({ x: 0, y: 0 });

    const handleMouseDown = useCallback((e: React.MouseEvent, position: HandlePosition) => {
        e.stopPropagation();
        e.preventDefault();

        startSize.current = { ...size };
        startPos.current = { x: e.clientX, y: e.clientY };

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startPos.current.x;
            const deltaY = moveEvent.clientY - startPos.current.y;

            let newWidth = startSize.current.width;
            let newHeight = startSize.current.height;

            // Calculate new dimensions based on handle position
            switch (position) {
                case 'e':
                    newWidth = startSize.current.width + deltaX;
                    break;
                case 'w':
                    newWidth = startSize.current.width - deltaX;
                    break;
                case 's':
                    newHeight = startSize.current.height + deltaY;
                    break;
                case 'n':
                    newHeight = startSize.current.height - deltaY;
                    break;
                case 'se':
                    newWidth = startSize.current.width + deltaX;
                    newHeight = startSize.current.height + deltaY;
                    break;
                case 'sw':
                    newWidth = startSize.current.width - deltaX;
                    newHeight = startSize.current.height + deltaY;
                    break;
                case 'ne':
                    newWidth = startSize.current.width + deltaX;
                    newHeight = startSize.current.height - deltaY;
                    break;
                case 'nw':
                    newWidth = startSize.current.width - deltaX;
                    newHeight = startSize.current.height - deltaY;
                    break;
            }

            // Enforce minimum size
            newWidth = Math.max(minSize.width, newWidth);
            newHeight = Math.max(minSize.height, newHeight);

            onResize({ width: newWidth, height: newHeight });
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }, [size, minSize, onResize]);

    return (
        <div className="transform-handles">
            {handlePositions.map(pos => (
                <div
                    key={pos}
                    className={`handle handle-${pos}`}
                    onMouseDown={(e) => handleMouseDown(e, pos)}
                />
            ))}

            {/* Rotate handle (future) */}
            {onRotate && (
                <div className="handle handle-rotate" title="Rotate" />
            )}
        </div>
    );
};
