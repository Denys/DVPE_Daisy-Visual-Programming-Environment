/**
 * ElementThumbnail - Draggable element card in the library
 * Phase 13.2: Visual UI Builder
 */

import React from 'react';
import { type ElementDefinition } from './ElementLibraryPanel';

interface ElementThumbnailProps {
    element: ElementDefinition;
    onDragStart?: () => void;
    onDragEnd?: () => void;
}

export const ElementThumbnail: React.FC<ElementThumbnailProps> = ({
    element,
    onDragStart,
    onDragEnd,
}) => {
    const handleDragStart = (e: React.DragEvent) => {
        // Set drag data
        e.dataTransfer.setData('application/dvpe-element', JSON.stringify({
            type: element.type,
            name: element.name,
            defaultSize: element.defaultSize,
        }));
        e.dataTransfer.effectAllowed = 'copy';

        // Create drag preview
        const preview = document.createElement('div');
        preview.className = 'drag-preview';
        preview.textContent = element.name;
        preview.style.cssText = `
      position: absolute;
      top: -1000px;
      left: -1000px;
      padding: 8px 16px;
      background: rgba(88, 166, 255, 0.9);
      color: white;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    `;
        document.body.appendChild(preview);
        e.dataTransfer.setDragImage(preview, 0, 0);

        setTimeout(() => preview.remove(), 0);
        onDragStart?.();
    };

    const handleDragEnd = () => {
        onDragEnd?.();
    };

    return (
        <div
            className="element-thumbnail"
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            title={`Drag to add ${element.name}`}
        >
            <div className="thumbnail-icon">
                {element.icon}
            </div>
            <span className="thumbnail-name">{element.name}</span>
        </div>
    );
};
