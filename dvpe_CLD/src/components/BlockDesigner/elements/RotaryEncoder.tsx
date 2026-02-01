/**
 * RotaryEncoder - Endless encoder with increment/decrement
 * Phase 13.2: Visual UI Builder - Day 4
 * 
 * Unlike RotaryKnob, encoders are endless (no min/max arc)
 * Click to reset value, drag to increment/decrement
 */

import React, { useState, useRef, useCallback } from 'react';
import { UIElement } from '../../../types/uiElement';

interface RotaryEncoderProps {
    element: UIElement;
    interactive?: boolean;
    theme?: 'modern' | 'vintage' | 'minimal' | 'lcd';
}

export const RotaryEncoder: React.FC<RotaryEncoderProps> = ({
    element,
    interactive = true,
    theme = 'modern',
}) => {
    const config = element.config;
    const step = (config.step as number) ?? 1;
    const defaultValue = (config.defaultValue as number) ?? 0;

    const [value, setValue] = useState(defaultValue);
    const [rotation, setRotation] = useState(0);
    const encoderRef = useRef<SVGSVGElement>(null);
    const isDragging = useRef(false);
    const lastY = useRef(0);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!interactive) return;
        e.stopPropagation();

        // Double-click to reset
        if (e.detail === 2) {
            setValue(defaultValue);
            setRotation(0);
            return;
        }

        isDragging.current = true;
        lastY.current = e.clientY;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (!isDragging.current) return;

            const deltaY = lastY.current - moveEvent.clientY;
            lastY.current = moveEvent.clientY;

            // 10 pixels = 1 step = 15 degrees rotation
            const steps = Math.round(deltaY / 10);
            if (steps !== 0) {
                setValue(prev => prev + steps * step);
                setRotation(prev => prev + steps * 15);
            }
        };

        const handleMouseUp = () => {
            isDragging.current = false;
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }, [interactive, step, defaultValue]);

    const size = Math.min(element.size.width, element.size.height);
    const radius = size / 2 - 4;

    const getThemeColors = () => {
        switch (theme) {
            case 'vintage':
                return { bg: '#2a2520', ring: '#4a433d', indicator: '#d4a855', notches: '#6b5c4d' };
            case 'minimal':
                return { bg: '#222', ring: '#444', indicator: '#fff', notches: '#555' };
            case 'lcd':
                return { bg: '#1a2a1a', ring: '#0f1a0f', indicator: '#4ade80', notches: '#2a4a2a' };
            default:
                return { bg: '#161b22', ring: '#21262d', indicator: '#58a6ff', notches: '#30363d' };
        }
    };

    const colors = getThemeColors();

    // Create notch marks around the encoder
    const notches = [];
    for (let i = 0; i < 12; i++) {
        const angle = (i * 30 - 90) * Math.PI / 180;
        const x1 = size / 2 + (radius - 4) * Math.cos(angle);
        const y1 = size / 2 + (radius - 4) * Math.sin(angle);
        const x2 = size / 2 + (radius - 8) * Math.cos(angle);
        const y2 = size / 2 + (radius - 8) * Math.sin(angle);
        notches.push(
            <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={colors.notches}
                strokeWidth={1}
            />
        );
    }

    return (
        <svg
            ref={encoderRef}
            width={element.size.width}
            height={element.size.height}
            className="rotary-encoder"
            onMouseDown={handleMouseDown}
            style={{ cursor: interactive ? 'ns-resize' : 'default' }}
        >
            {/* Background ring */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill={colors.bg}
                stroke={colors.ring}
                strokeWidth={2}
            />

            {/* Notch marks */}
            {notches}

            {/* Encoder cap */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius * 0.7}
                fill={colors.ring}
                stroke="#484f58"
                strokeWidth={1}
            />

            {/* Indicator line (rotates) */}
            <line
                x1={size / 2}
                y1={size / 2 - radius * 0.3}
                x2={size / 2}
                y2={size / 2 - radius * 0.6}
                stroke={colors.indicator}
                strokeWidth={3}
                strokeLinecap="round"
                transform={`rotate(${rotation}, ${size / 2}, ${size / 2})`}
            />

            {/* Value display */}
            <text
                x={size / 2}
                y={size / 2 + 4}
                textAnchor="middle"
                fill={colors.indicator}
                fontSize={Math.max(10, size / 5)}
                fontFamily="monospace"
            >
                {value}
            </text>
        </svg>
    );
};
