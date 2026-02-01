/**
 * GroupBox - Section container with optional label
 * Phase 13.2: Visual UI Builder - Day 4
 */

import React from 'react';
import { UIElement } from '../../../types/uiElement';

interface GroupBoxProps {
    element: UIElement;
    theme?: 'modern' | 'vintage' | 'minimal' | 'lcd';
    children?: React.ReactNode;
}

export const GroupBox: React.FC<GroupBoxProps> = ({
    element,
    theme = 'modern',
    children,
}) => {
    const label = element.label ?? '';
    const config = element.config;
    const borderStyle = (config.borderStyle as string) ?? 'solid';
    const collapsed = (config.collapsed as boolean) ?? false;

    const getThemeStyles = () => {
        switch (theme) {
            case 'vintage':
                return {
                    border: '#4a433d',
                    bg: 'rgba(42, 37, 32, 0.3)',
                    labelBg: '#2a2520',
                    labelColor: '#c9b896',
                };
            case 'minimal':
                return {
                    border: '#444',
                    bg: 'transparent',
                    labelBg: 'transparent',
                    labelColor: '#888',
                };
            case 'lcd':
                return {
                    border: '#2a4a2a',
                    bg: 'rgba(15, 26, 15, 0.5)',
                    labelBg: '#0f1a0f',
                    labelColor: '#4ade80',
                };
            default:
                return {
                    border: '#30363d',
                    bg: 'rgba(22, 27, 34, 0.5)',
                    labelBg: '#0d1117',
                    labelColor: '#8b949e',
                };
        }
    };

    const styles = getThemeStyles();

    return (
        <div
            className="group-box"
            style={{
                width: element.size.width,
                height: collapsed ? 32 : element.size.height,
                position: 'relative',
                border: `1px ${borderStyle} ${styles.border}`,
                borderRadius: '6px',
                backgroundColor: styles.bg,
                overflow: 'hidden',
                boxSizing: 'border-box',
            }}
        >
            {/* Label */}
            {label && (
                <div
                    className="group-box-label"
                    style={{
                        position: 'absolute',
                        top: -1,
                        left: 8,
                        padding: '0 6px',
                        backgroundColor: styles.labelBg,
                        color: styles.labelColor,
                        fontSize: '11px',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                    }}
                >
                    {label}
                </div>
            )}

            {/* Content area */}
            {!collapsed && (
                <div
                    className="group-box-content"
                    style={{
                        padding: label ? '16px 8px 8px' : '8px',
                        width: '100%',
                        height: '100%',
                        boxSizing: 'border-box',
                    }}
                >
                    {children}
                </div>
            )}
        </div>
    );
};
