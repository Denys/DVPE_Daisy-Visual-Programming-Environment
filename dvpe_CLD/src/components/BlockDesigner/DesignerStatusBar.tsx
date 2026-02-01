/**
 * DesignerStatusBar - Status bar for the Visual UI Builder
 * Shows zoom level, cursor position, and selection info
 */

import React from 'react';

interface DesignerStatusBarProps {
    zoom: number;
    cursorX: number;
    cursorY: number;
    selectedCount: number;
    elementCount: number;
}

export const DesignerStatusBar: React.FC<DesignerStatusBarProps> = ({
    zoom,
    cursorX,
    cursorY,
    selectedCount,
    elementCount,
}) => {
    const selectionText = selectedCount === 0
        ? 'No selection'
        : selectedCount === 1
            ? '1 element selected'
            : `${selectedCount} elements selected`;

    return (
        <div className="designer-status-bar">
            <div className="status-section">
                <span className="status-label">Zoom:</span>
                <span className="status-value">{zoom}%</span>
            </div>

            <span className="status-separator">|</span>

            <div className="status-section">
                <span className="status-label">Cursor:</span>
                <span className="status-value">{cursorX}, {cursorY}</span>
            </div>

            <span className="status-separator">|</span>

            <div className="status-section">
                <span className="status-value">{selectionText}</span>
            </div>

            <div className="status-spacer" />

            <div className="status-section">
                <span className="status-label">Elements:</span>
                <span className="status-value">{elementCount}</span>
            </div>
        </div>
    );
};
