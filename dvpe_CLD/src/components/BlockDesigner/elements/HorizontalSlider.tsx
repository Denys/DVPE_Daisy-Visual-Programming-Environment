/**
 * HorizontalSlider - Track + thumb slider
 * Phase 13.2: Visual UI Builder - Day 4
 */

import React, { useState, useRef, useCallback } from 'react';
import { UIElement } from '../../../types/uiElement';

interface HorizontalSliderProps {
    element: UIElement;
    interactive?: boolean;
    theme?: 'modern' | 'vintage' | 'minimal' | 'lcd';
}

export const HorizontalSlider: React.FC<HorizontalSliderProps> = ({
    element,
    interactive = true,
    theme = 'modern',
}) => {
    const config = element.config;
    const valueRange = (config.valueRange as [number, number]) ?? [0, 1];
    const defaultValue = (config.defaultValue as number) ?? 0.5;
    const showFill = (config.showFill as boolean) ?? true;

    const [value, setValue] = useState(defaultValue);
    const sliderRef = useRef<SVGSVGElement>(null);
    const isDragging = useRef(false);

    const normalized = (value - valueRange[0]) / (valueRange[1] - valueRange[0]);
    const padding = 8;
    const trackWidth = element.size.width - padding * 2;
    const thumbX = padding + normalized * trackWidth;

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!interactive) return;
        e.stopPropagation();

        isDragging.current = true;

        const updateValue = (clientX: number) => {
            const rect = sliderRef.current?.getBoundingClientRect();
            if (!rect) return;

            const relativeX = clientX - rect.left - padding;
            const newNormalized = Math.max(0, Math.min(1, relativeX / trackWidth));
            const newValue = valueRange[0] + newNormalized * (valueRange[1] - valueRange[0]);
            setValue(newValue);
        };

        updateValue(e.clientX);

        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (!isDragging.current) return;
            updateValue(moveEvent.clientX);
        };

        const handleMouseUp = () => {
            isDragging.current = false;
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }, [interactive, trackWidth, valueRange, padding]);

    const getThemeColors = () => {
        switch (theme) {
            case 'vintage':
                return { track: '#3a332d', fill: '#d4a855', thumb: '#c9b896' };
            case 'minimal':
                return { track: '#333', fill: '#888', thumb: '#fff' };
            case 'lcd':
                return { track: '#1a2a1a', fill: '#4ade80', thumb: '#22c55e' };
            default:
                return { track: '#30363d', fill: '#58a6ff', thumb: '#79c0ff' };
        }
    };

    const colors = getThemeColors();
    const trackY = element.size.height / 2;
    const thumbRadius = Math.min(10, element.size.height / 3);

    return (
        <svg
            ref={sliderRef}
            width={element.size.width}
            height={element.size.height}
            className="horizontal-slider"
            onMouseDown={handleMouseDown}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
            {/* Track background */}
            <rect
                x={padding}
                y={trackY - 3}
                width={trackWidth}
                height={6}
                rx={3}
                fill={colors.track}
            />

            {/* Fill */}
            {showFill && (
                <rect
                    x={padding}
                    y={trackY - 3}
                    width={normalized * trackWidth}
                    height={6}
                    rx={3}
                    fill={colors.fill}
                />
            )}

            {/* Thumb */}
            <circle
                cx={thumbX}
                cy={trackY}
                r={thumbRadius}
                fill={colors.thumb}
                stroke="#0d1117"
                strokeWidth={2}
                style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}
            />
        </svg>
    );
};
