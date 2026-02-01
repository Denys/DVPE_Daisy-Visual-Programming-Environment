/**
 * DesignerToolbar - Toolbar for the Visual UI Builder
 * Contains selection, alignment, and zoom tools
 */

import React from 'react';
import {
    MousePointer2,
    Hand,
    AlignHorizontalJustifyStart,
    AlignHorizontalJustifyCenter,
    AlignHorizontalJustifyEnd,
    AlignVerticalJustifyStart,
    AlignVerticalJustifyCenter,
    AlignVerticalJustifyEnd,
    ZoomIn,
    ZoomOut,
    Trash2,
    Copy,
    Clipboard,
    Undo2,
    Redo2,
    Grid3X3,
    CheckSquare,
} from 'lucide-react';

interface DesignerToolbarProps {
    zoom: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onZoomReset?: () => void;
    hasSelection?: boolean;
    onDelete?: () => void;
    onCopy?: () => void;
    onPaste?: () => void;
    onUndo?: () => void;
    onRedo?: () => void;
    onSelectAll?: () => void;
    onAlignLeft?: () => void;
    onAlignCenter?: () => void;
    onAlignRight?: () => void;
    onAlignTop?: () => void;
    onAlignMiddle?: () => void;
    onAlignBottom?: () => void;
    onToggleGrid?: () => void;
    gridVisible?: boolean;
}

export const DesignerToolbar: React.FC<DesignerToolbarProps> = ({
    zoom,
    onZoomIn,
    onZoomOut,
    onZoomReset,
    hasSelection = false,
    onDelete,
    onCopy,
    onPaste,
    onUndo,
    onRedo,
    onSelectAll,
    onAlignLeft,
    onAlignCenter,
    onAlignRight,
    onAlignTop,
    onAlignMiddle,
    onAlignBottom,
    onToggleGrid,
    gridVisible = true,
}) => {
    return (
        <div className="designer-toolbar">
            {/* Selection Tools */}
            <div className="tool-group selection">
                <button className="tool-button active" title="Select (V)">
                    <MousePointer2 size={16} />
                </button>
                <button className="tool-button" title="Pan (H)">
                    <Hand size={16} />
                </button>
                <button className="tool-button" title="Select All (Ctrl+A)" onClick={onSelectAll}>
                    <CheckSquare size={16} />
                </button>
            </div>

            <div className="toolbar-separator" />

            {/* Edit Actions */}
            <div className="tool-group edit">
                <button
                    className="tool-button"
                    title="Undo (Ctrl+Z)"
                    onClick={onUndo}
                >
                    <Undo2 size={16} />
                </button>
                <button
                    className="tool-button"
                    title="Redo (Ctrl+Y)"
                    onClick={onRedo}
                >
                    <Redo2 size={16} />
                </button>
            </div>

            <div className="toolbar-separator" />

            {/* Clipboard */}
            <div className="tool-group clipboard">
                <button
                    className="tool-button"
                    title="Copy (Ctrl+C)"
                    onClick={onCopy}
                    disabled={!hasSelection}
                >
                    <Copy size={16} />
                </button>
                <button
                    className="tool-button"
                    title="Paste (Ctrl+V)"
                    onClick={onPaste}
                >
                    <Clipboard size={16} />
                </button>
                <button
                    className="tool-button danger"
                    title="Delete (Del)"
                    onClick={onDelete}
                    disabled={!hasSelection}
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="toolbar-separator" />

            {/* Alignment */}
            <div className="tool-group alignment">
                <button className="tool-button" title="Align Left" disabled={!hasSelection} onClick={onAlignLeft}>
                    <AlignHorizontalJustifyStart size={16} />
                </button>
                <button className="tool-button" title="Align Center H" disabled={!hasSelection} onClick={onAlignCenter}>
                    <AlignHorizontalJustifyCenter size={16} />
                </button>
                <button className="tool-button" title="Align Right" disabled={!hasSelection} onClick={onAlignRight}>
                    <AlignHorizontalJustifyEnd size={16} />
                </button>
                <button className="tool-button" title="Align Top" disabled={!hasSelection} onClick={onAlignTop}>
                    <AlignVerticalJustifyStart size={16} />
                </button>
                <button className="tool-button" title="Align Center V" disabled={!hasSelection} onClick={onAlignMiddle}>
                    <AlignVerticalJustifyCenter size={16} />
                </button>
                <button className="tool-button" title="Align Bottom" disabled={!hasSelection} onClick={onAlignBottom}>
                    <AlignVerticalJustifyEnd size={16} />
                </button>
            </div>

            <div className="toolbar-separator" />

            {/* View */}
            <div className="tool-group view">
                <button
                    className={`tool-button ${gridVisible ? 'active' : ''}`}
                    title="Toggle Grid (G)"
                    onClick={onToggleGrid}
                >
                    <Grid3X3 size={16} />
                </button>
            </div>

            {/* Spacer */}
            <div className="toolbar-spacer" />

            {/* Zoom */}
            <div className="tool-group zoom">
                <button className="tool-button" title="Zoom Out" onClick={onZoomOut}>
                    <ZoomOut size={16} />
                </button>
                <span
                    className="zoom-level"
                    onClick={onZoomReset}
                    title="Click to reset zoom"
                    style={{ cursor: 'pointer' }}
                >
                    {zoom}%
                </span>
                <button className="tool-button" title="Zoom In" onClick={onZoomIn}>
                    <ZoomIn size={16} />
                </button>
            </div>
        </div>
    );
};
