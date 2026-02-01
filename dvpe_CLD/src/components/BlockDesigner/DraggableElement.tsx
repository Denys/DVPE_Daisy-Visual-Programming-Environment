/**
 * DraggableElement - Element wrapper on canvas with selection and drag
 * Phase 13.2: Visual UI Builder
 */

import React, { useState, useRef, useCallback } from 'react';
import { TransformHandles } from './TransformHandles';
import { type CanvasElement } from './DesignCanvas';
import { UIElementType } from '../../types/uiElement';
import {
    RotaryKnob,
    RotaryEncoder,
    HorizontalSlider,
    ToggleSwitch,
    TextLabel,
    LEDIndicator,
    NumericDisplay,
    GroupBox,
    Dropdown,
} from './elements';
import {
    CircleDot,
    Hand,
    Gauge,
    Activity,
    AudioWaveform,
} from 'lucide-react';

interface DraggableElementProps {
    element: CanvasElement;
    isSelected: boolean;
    onSelect: (addToSelection: boolean) => void;
    onMove: (delta: { x: number; y: number }) => void;
    onResize: (size: { width: number; height: number }) => void;
}

// Render element based on type - either custom component or fallback icon
const renderElementContent = (element: CanvasElement): React.ReactNode => {
    switch (element.type) {
        case UIElementType.ROTARY_KNOB:
            return <RotaryKnob element={element} interactive={false} />;

        case UIElementType.ROTARY_ENCODER:
            return <RotaryEncoder element={element} interactive={false} />;

        case UIElementType.SLIDER:
            return <HorizontalSlider element={element} interactive={false} />;

        case UIElementType.TOGGLE:
            return <ToggleSwitch element={element} interactive={false} />;

        case UIElementType.TEXT_LABEL:
            return <TextLabel element={element} />;

        case UIElementType.LED_INDICATOR:
            return <LEDIndicator element={element} interactive={false} />;

        case UIElementType.NUMERIC_DISPLAY:
            return <NumericDisplay element={element} interactive={false} />;

        case UIElementType.DROPDOWN:
            return <Dropdown element={element} interactive={false} />;

        case UIElementType.BUTTON_MOMENTARY:
            return (
                <div className="element-fallback element-button">
                    <Hand size={20} />
                    {element.label && <span>{element.label}</span>}
                </div>
            );

        case UIElementType.VU_METER:
            return (
                <div className="element-fallback">
                    <Gauge size={24} />
                    {element.label && <span>{element.label}</span>}
                </div>
            );

        case UIElementType.MINI_OSCILLOSCOPE:
            return (
                <div className="element-fallback">
                    <Activity size={24} />
                    {element.label && <span>{element.label}</span>}
                </div>
            );

        case UIElementType.ENVELOPE_DISPLAY:
            return (
                <div className="element-fallback">
                    <AudioWaveform size={24} />
                    {element.label && <span>{element.label}</span>}
                </div>
            );

        case UIElementType.GROUP_BOX:
            return <GroupBox element={element} />;

        default:
            return (
                <div className="element-fallback">
                    <CircleDot size={20} />
                    {element.label && <span>{element.label}</span>}
                </div>
            );
    }
};

export const DraggableElement: React.FC<DraggableElementProps> = ({
    element,
    isSelected,
    onSelect,
    onMove,
    onResize,
}) => {
    const elementRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef<{ x: number; y: number } | null>(null);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();

        // Handle selection
        onSelect(e.shiftKey || e.ctrlKey || e.metaKey);

        // Start drag
        setIsDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY };

        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (dragStart.current) {
                const delta = {
                    x: moveEvent.clientX - dragStart.current.x,
                    y: moveEvent.clientY - dragStart.current.y,
                };
                onMove(delta);
                dragStart.current = { x: moveEvent.clientX, y: moveEvent.clientY };
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            dragStart.current = null;
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }, [onSelect, onMove]);

    const handleResize = useCallback((newSize: { width: number; height: number }) => {
        onResize(newSize);
    }, [onResize]);

    return (
        <div
            ref={elementRef}
            className={`draggable-element ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
            style={{
                left: element.position.x,
                top: element.position.y,
                width: element.size.width,
                height: element.size.height,
                transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
            }}
            onMouseDown={handleMouseDown}
        >
            <div className="element-content">
                {renderElementContent(element)}
            </div>

            {isSelected && (
                <TransformHandles
                    size={element.size}
                    onResize={handleResize}
                />
            )}
        </div>
    );
};

