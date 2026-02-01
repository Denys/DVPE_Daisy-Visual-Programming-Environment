/**
 * TextLabel - Static text display
 * Phase 13.2: Visual UI Builder - Day 4
 */

import React from 'react';
import { UIElement } from '../../../types/uiElement';

interface TextLabelProps {
    element: UIElement;
    theme?: 'modern' | 'vintage' | 'minimal' | 'lcd';
}

export const TextLabel: React.FC<TextLabelProps> = ({
    element,
    theme = 'modern',
}) => {
    const text = element.label ?? 'Label';
    const config = element.config;
    const fontSize = (config.fontSize as number) ?? 14;
    const fontWeight = (config.fontWeight as string) ?? 'normal';
    const textAlign = (config.textAlign as string) ?? 'center';

    const getThemeColors = () => {
        switch (theme) {
            case 'vintage':
                return { text: '#c9b896', bg: 'transparent' };
            case 'minimal':
                return { text: '#888', bg: 'transparent' };
            case 'lcd':
                return { text: '#4ade80', bg: '#0f1a0f' };
            default:
                return { text: '#c9d1d9', bg: 'transparent' };
        }
    };

    const colors = getThemeColors();

    return (
        <div
            className="text-label"
            style={{
                width: element.size.width,
                height: element.size.height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center',
                padding: '4px 8px',
                backgroundColor: colors.bg,
                color: colors.text,
                fontSize: `${fontSize}px`,
                fontWeight: fontWeight as 'normal' | 'bold',
                fontFamily: theme === 'lcd' ? 'monospace' : 'inherit',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                boxSizing: 'border-box',
            }}
        >
            {text}
        </div>
    );
};
