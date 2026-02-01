/**
 * RotaryKnob - Interactive dial with value arc
 * Phase 13.2: Visual UI Builder - Day 4
 * 
 * Features:
 * - SVG-based rendering
 * - Interactive rotation on drag
 * - Value arc visualization
 * - Theming support (modern/vintage/minimal)
 */

import React, { useState, useRef, useCallback } from 'react';
import { UIElement } from '../../../types/uiElement';

interface RotaryKnobProps {
    element: UIElement;
    interactive?: boolean;
    theme?: 'modern' | 'vintage' | 'minimal' | 'lcd';
}

export const RotaryKnob: React.FC<RotaryKnobProps> = ({
    element,
    interactive = true,
    theme = 'modern',
}) => {
    const config = element.config;
    const valueRange = (config.valueRange as [number, number]) ?? [0, 1];
    const defaultValue = (config.defaultValue as number) ?? 0.5;

    const [value, setValue] = useState(defaultValue);
    const knobRef = useRef<SVGSVGElement>(null);
    const isDragging = useRef(false);
    const startAngle = useRef(0);
    const startValue = useRef(0);

    // Convert value (0-1) to angle (radians)
    const valueToAngle = (v: number) => {
        const startAngle = -135; // Corresponds to valueRange[0]
        const endAngle = 135;    // Corresponds to valueRange[1]
        const normalized = (v - valueRange[0]) / (valueRange[1] - valueRange[0]);
        return startAngle + normalized * (endAngle - startAngle);
    };



    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!interactive) return;
        e.stopPropagation();

        isDragging.current = true;
        const rect = knobRef.current?.getBoundingClientRect();
        if (rect) {
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            startAngle.current = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
            startValue.current = value;
        }

        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (!isDragging.current || !knobRef.current) return;

            const rect = knobRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const currentAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) * 180 / Math.PI;

            let angleDelta = currentAngle - startAngle.current;
            if (angleDelta > 180) angleDelta -= 360;
            if (angleDelta < -180) angleDelta += 360;

            const valueDelta = angleDelta / 270 * (valueRange[1] - valueRange[0]);
            const newValue = Math.max(valueRange[0], Math.min(valueRange[1], startValue.current + valueDelta));
            setValue(newValue);
        };

        const handleMouseUp = () => {
            isDragging.current = false;
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }, [interactive, value, valueRange]);

    const angle = valueToAngle(value);
    const size = Math.min(element.size.width, element.size.height);
    const radius = size / 2 - 4;
    const arcRadius = radius - 6;

    // Create arc path for value
    const createArc = (startDeg: number, endDeg: number, r: number) => {
        const startRad = (startDeg - 90) * Math.PI / 180;
        const endRad = (endDeg - 90) * Math.PI / 180;
        const x1 = size / 2 + r * Math.cos(startRad);
        const y1 = size / 2 + r * Math.sin(startRad);
        const x2 = size / 2 + r * Math.cos(endRad);
        const y2 = size / 2 + r * Math.sin(endRad);
        const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
        return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
    };

    const getThemeColors = () => {
        switch (theme) {
            case 'vintage':
                return { bg: '#2a2520', knob: '#4a433d', arc: '#d4a855', pointer: '#c9b896' };
            case 'minimal':
                return { bg: 'transparent', knob: '#333', arc: '#888', pointer: '#fff' };
            case 'lcd':
                return { bg: '#1a2a1a', knob: '#0f1a0f', arc: '#4ade80', pointer: '#22c55e' };
            default: // modern
                return { bg: '#161b22', knob: '#21262d', arc: '#58a6ff', pointer: '#79c0ff' };
        }
    };

    const colors = getThemeColors();

    return (
        <svg
            ref={knobRef}
            width={element.size.width}
            height={element.size.height}
            className="rotary-knob"
            onMouseDown={handleMouseDown}
            style={{ cursor: interactive ? 'grab' : 'default' }}
        >
            {/* Background */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill={colors.bg}
                stroke="#30363d"
                strokeWidth={1}
            />

            {/* Track arc (full range) */}
            <path
                d={createArc(-135, 135, arcRadius)}
                fill="none"
                stroke="#30363d"
                strokeWidth={3}
                strokeLinecap="round"
            />

            {/* Value arc */}
            <path
                d={createArc(-135, angle, arcRadius)}
                fill="none"
                stroke={colors.arc}
                strokeWidth={3}
                strokeLinecap="round"
            />

            {/* Knob face */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius * 0.65}
                fill={colors.knob}
                stroke="#484f58"
                strokeWidth={1}
            />

            {/* Pointer */}
            <line
                x1={size / 2}
                y1={size / 2}
                x2={size / 2 + (radius * 0.5) * Math.cos((angle - 90) * Math.PI / 180)}
                y2={size / 2 + (radius * 0.5) * Math.sin((angle - 90) * Math.PI / 180)}
                stroke={colors.pointer}
                strokeWidth={2}
                strokeLinecap="round"
            />

            {/* Center dot */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={3}
                fill={colors.pointer}
            />
        </svg>
    );
};
