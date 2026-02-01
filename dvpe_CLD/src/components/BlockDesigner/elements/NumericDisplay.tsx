/**
 * NumericDisplay - Value readout display
 * Phase 13.2: Visual UI Builder - Day 4
 */

import React, { useState } from 'react';
import { UIElement } from '../../../types/uiElement';

interface NumericDisplayProps {
    element: UIElement;
    interactive?: boolean;
    theme?: 'modern' | 'vintage' | 'minimal' | 'lcd';
}

export const NumericDisplay: React.FC<NumericDisplayProps> = ({
    element,
    interactive = true,
    theme = 'modern',
}) => {
    const config = element.config;
    const defaultValue = (config.defaultValue as number) ?? 0;
    const decimals = (config.decimals as number) ?? 2;
    const units = (config.units as string) ?? '';
    const valueRange = (config.valueRange as [number, number]) ?? [0, 100];

    const [value, setValue] = useState(defaultValue);

    const handleWheel = (e: React.WheelEvent) => {
        if (!interactive) return;
        e.preventDefault();

        const step = (valueRange[1] - valueRange[0]) / 100;
        const delta = e.deltaY > 0 ? -step : step;
        setValue(prev => Math.max(valueRange[0], Math.min(valueRange[1], prev + delta)));
    };

    const formattedValue = value.toFixed(decimals);

    const getThemeStyles = () => {
        switch (theme) {
            case 'vintage':
                return {
                    bg: '#2a2520',
                    border: '#4a433d',
                    text: '#d4a855',
                    font: 'serif',
                };
            case 'minimal':
                return {
                    bg: 'transparent',
                    border: '#333',
                    text: '#fff',
                    font: 'sans-serif',
                };
            case 'lcd':
                return {
                    bg: '#0f1a0f',
                    border: '#1a2a1a',
                    text: '#4ade80',
                    font: 'monospace',
                };
            default:
                return {
                    bg: '#0d1117',
                    border: '#30363d',
                    text: '#58a6ff',
                    font: 'monospace',
                };
        }
    };

    const styles = getThemeStyles();
    const fontSize = Math.min(element.size.height * 0.5, element.size.width / (formattedValue.length + units.length + 1) * 1.5);

    return (
        <div
            className="numeric-display"
            onWheel={handleWheel}
            style={{
                width: element.size.width,
                height: element.size.height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                backgroundColor: styles.bg,
                border: `1px solid ${styles.border}`,
                borderRadius: '4px',
                color: styles.text,
                fontSize: `${fontSize}px`,
                fontFamily: styles.font,
                cursor: interactive ? 'ns-resize' : 'default',
                userSelect: 'none',
                boxSizing: 'border-box',
                padding: '0 8px',
            }}
        >
            <span className="value">{formattedValue}</span>
            {units && <span className="units" style={{ fontSize: '0.7em', opacity: 0.7 }}>{units}</span>}
        </div>
    );
};
