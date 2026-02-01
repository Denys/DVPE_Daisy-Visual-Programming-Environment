/**
 * LEDIndicator - On/off light indicator
 * Phase 13.2: Visual UI Builder - Day 4
 */

import React, { useState } from 'react';
import { UIElement } from '../../../types/uiElement';

interface LEDIndicatorProps {
    element: UIElement;
    interactive?: boolean;
    theme?: 'modern' | 'vintage' | 'minimal' | 'lcd';
}

export const LEDIndicator: React.FC<LEDIndicatorProps> = ({
    element,
    interactive = true,
}) => {
    const config = element.config;
    const defaultState = (config.defaultState as boolean) ?? false;
    const ledColor = (config.color as string) ?? 'green';

    const [isOn, setIsOn] = useState(defaultState);

    const handleClick = () => {
        if (interactive) {
            setIsOn(prev => !prev);
        }
    };

    const size = Math.min(element.size.width, element.size.height);
    const radius = size / 2 - 2;

    const getLEDColor = () => {
        const colorMap: Record<string, { on: string; off: string; glow: string }> = {
            red: { on: '#f85149', off: '#4a2020', glow: 'rgba(248,81,73,0.6)' },
            green: { on: '#3fb950', off: '#1a4a20', glow: 'rgba(63,185,80,0.6)' },
            blue: { on: '#58a6ff', off: '#1a3050', glow: 'rgba(88,166,255,0.6)' },
            yellow: { on: '#f0c000', off: '#4a4020', glow: 'rgba(240,192,0,0.6)' },
            orange: { on: '#f0883e', off: '#4a3020', glow: 'rgba(240,136,62,0.6)' },
            purple: { on: '#a371f7', off: '#302040', glow: 'rgba(163,113,247,0.6)' },
            white: { on: '#f0f0f0', off: '#404040', glow: 'rgba(240,240,240,0.5)' },
        };
        return colorMap[ledColor] ?? colorMap.green;
    };

    const colors = getLEDColor();
    const fillColor = isOn ? colors.on : colors.off;
    const glowFilter = isOn ? `drop-shadow(0 0 ${radius / 2}px ${colors.glow})` : 'none';

    return (
        <svg
            width={element.size.width}
            height={element.size.height}
            className="led-indicator"
            onClick={handleClick}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
            {/* Bezel */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="#21262d"
                stroke="#30363d"
                strokeWidth={1}
            />

            {/* LED surface */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius * 0.8}
                fill={fillColor}
                style={{
                    filter: glowFilter,
                    transition: 'fill 0.1s ease'
                }}
            />

            {/* Highlight */}
            <ellipse
                cx={size / 2 - radius * 0.2}
                cy={size / 2 - radius * 0.2}
                rx={radius * 0.25}
                ry={radius * 0.15}
                fill="rgba(255,255,255,0.3)"
                transform={`rotate(-45, ${size / 2}, ${size / 2})`}
            />
        </svg>
    );
};
