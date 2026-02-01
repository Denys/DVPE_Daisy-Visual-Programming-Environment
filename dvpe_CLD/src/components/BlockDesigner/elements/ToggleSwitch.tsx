/**
 * ToggleSwitch - On/off toggle control
 * Phase 13.2: Visual UI Builder - Day 4
 */

import React, { useState } from 'react';
import { UIElement } from '../../../types/uiElement';

interface ToggleSwitchProps {
    element: UIElement;
    interactive?: boolean;
    theme?: 'modern' | 'vintage' | 'minimal' | 'lcd';
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
    element,
    interactive = true,
    theme = 'modern',
}) => {
    const config = element.config;
    const defaultState = (config.defaultState as boolean) ?? false;
    const onLabel = (config.onLabel as string) ?? 'ON';
    const offLabel = (config.offLabel as string) ?? 'OFF';

    const [isOn, setIsOn] = useState(defaultState);

    const handleClick = () => {
        if (interactive) {
            setIsOn(prev => !prev);
        }
    };

    const width = element.size.width;
    const height = element.size.height;
    const isHorizontal = width > height;

    const trackWidth = isHorizontal ? width - 8 : width * 0.6;
    const trackHeight = isHorizontal ? height * 0.5 : height - 8;
    const thumbSize = Math.min(trackWidth * 0.45, trackHeight * 0.9);

    const getThemeColors = () => {
        switch (theme) {
            case 'vintage':
                return {
                    trackOff: '#3a332d', trackOn: '#4a6b3a',
                    thumb: '#d4c4a4', text: '#c9b896'
                };
            case 'minimal':
                return {
                    trackOff: '#333', trackOn: '#666',
                    thumb: '#fff', text: '#888'
                };
            case 'lcd':
                return {
                    trackOff: '#1a2a1a', trackOn: '#2a4a2a',
                    thumb: '#4ade80', text: '#22c55e'
                };
            default:
                return {
                    trackOff: '#30363d', trackOn: '#238636',
                    thumb: '#fff', text: '#8b949e'
                };
        }
    };

    const colors = getThemeColors();
    const trackColor = isOn ? colors.trackOn : colors.trackOff;

    if (isHorizontal) {
        const thumbX = isOn ? width - 4 - thumbSize / 2 - 4 : 4 + thumbSize / 2 + 4;
        return (
            <svg
                width={width}
                height={height}
                className="toggle-switch horizontal"
                onClick={handleClick}
                style={{ cursor: interactive ? 'pointer' : 'default' }}
            >
                {/* Track */}
                <rect
                    x={4}
                    y={(height - trackHeight) / 2}
                    width={trackWidth}
                    height={trackHeight}
                    rx={trackHeight / 2}
                    fill={trackColor}
                />

                {/* Thumb */}
                <circle
                    cx={thumbX}
                    cy={height / 2}
                    r={thumbSize / 2}
                    fill={colors.thumb}
                    style={{
                        transition: 'cx 0.15s ease',
                        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                    }}
                />

                {/* Label */}
                <text
                    x={width / 2}
                    y={height - 2}
                    textAnchor="middle"
                    fill={colors.text}
                    fontSize={10}
                >
                    {isOn ? onLabel : offLabel}
                </text>
            </svg>
        );
    }

    // Vertical toggle
    const thumbY = isOn ? 4 + thumbSize / 2 + 4 : height - 4 - thumbSize / 2 - 4;
    return (
        <svg
            width={width}
            height={height}
            className="toggle-switch vertical"
            onClick={handleClick}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
            {/* Track */}
            <rect
                x={(width - trackWidth) / 2}
                y={4}
                width={trackWidth}
                height={trackHeight}
                rx={trackWidth / 2}
                fill={trackColor}
            />

            {/* Thumb */}
            <circle
                cx={width / 2}
                cy={thumbY}
                r={thumbSize / 2}
                fill={colors.thumb}
                style={{
                    transition: 'cy 0.15s ease',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                }}
            />
        </svg>
    );
};
