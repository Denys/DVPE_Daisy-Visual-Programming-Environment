/**
 * Dropdown - Select menu for discrete options
 * Phase 13.2: Visual UI Builder - Day 4
 */

import React, { useState, useRef, useEffect } from 'react';
import { UIElement } from '../../../types/uiElement';
import { ChevronDown } from 'lucide-react';

interface DropdownProps {
    element: UIElement;
    interactive?: boolean;
    theme?: 'modern' | 'vintage' | 'minimal' | 'lcd';
}

export const Dropdown: React.FC<DropdownProps> = ({
    element,
    interactive = true,
    theme = 'modern',
}) => {
    const config = element.config;
    const options = (config.options as string[]) ?? ['Option 1', 'Option 2', 'Option 3'];
    const defaultIndex = (config.defaultIndex as number) ?? 0;

    const [selectedIndex, setSelectedIndex] = useState(defaultIndex);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    const handleSelect = (index: number) => {
        setSelectedIndex(index);
        setIsOpen(false);
    };

    const getThemeStyles = () => {
        switch (theme) {
            case 'vintage':
                return {
                    bg: '#2a2520',
                    border: '#4a433d',
                    text: '#c9b896',
                    hover: '#3a332d',
                    selected: '#4a433d',
                };
            case 'minimal':
                return {
                    bg: '#222',
                    border: '#444',
                    text: '#fff',
                    hover: '#333',
                    selected: '#444',
                };
            case 'lcd':
                return {
                    bg: '#0f1a0f',
                    border: '#2a4a2a',
                    text: '#4ade80',
                    hover: '#1a2a1a',
                    selected: '#2a4a2a',
                };
            default:
                return {
                    bg: '#21262d',
                    border: '#30363d',
                    text: '#c9d1d9',
                    hover: '#30363d',
                    selected: '#388bfd33',
                };
        }
    };

    const styles = getThemeStyles();
    const selectedValue = options[selectedIndex] ?? 'Select...';

    return (
        <div
            ref={dropdownRef}
            className="dropdown-container"
            style={{
                width: element.size.width,
                height: element.size.height,
                position: 'relative',
                fontFamily: theme === 'lcd' ? 'monospace' : 'inherit',
            }}
        >
            {/* Trigger button */}
            <button
                className="dropdown-trigger"
                onClick={() => interactive && setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 8px',
                    backgroundColor: styles.bg,
                    border: `1px solid ${styles.border}`,
                    borderRadius: '4px',
                    color: styles.text,
                    fontSize: '13px',
                    cursor: interactive ? 'pointer' : 'default',
                    boxSizing: 'border-box',
                }}
            >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedValue}
                </span>
                <ChevronDown
                    size={14}
                    style={{
                        transform: isOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.15s ease',
                        flexShrink: 0,
                        marginLeft: 4,
                    }}
                />
            </button>

            {/* Options menu */}
            {isOpen && (
                <div
                    className="dropdown-menu"
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: 2,
                        backgroundColor: styles.bg,
                        border: `1px solid ${styles.border}`,
                        borderRadius: '4px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                        zIndex: 1000,
                        maxHeight: 150,
                        overflowY: 'auto',
                    }}
                >
                    {options.map((option, index) => (
                        <div
                            key={index}
                            className="dropdown-option"
                            onClick={() => handleSelect(index)}
                            style={{
                                padding: '6px 8px',
                                color: styles.text,
                                cursor: 'pointer',
                                backgroundColor: index === selectedIndex ? styles.selected : 'transparent',
                                fontSize: '13px',
                            }}
                            onMouseEnter={(e) => {
                                if (index !== selectedIndex) {
                                    (e.target as HTMLDivElement).style.backgroundColor = styles.hover;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (index !== selectedIndex) {
                                    (e.target as HTMLDivElement).style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
