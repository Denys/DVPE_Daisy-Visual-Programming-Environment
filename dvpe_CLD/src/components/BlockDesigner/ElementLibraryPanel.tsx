/**
 * ElementLibraryPanel - Left sidebar with draggable UI elements
 * Phase 13.2: Visual UI Builder
 * 
 * Categories:
 * - Controls: Knob, Slider, Toggle, Dropdown, Button
 * - Display: Label, LED, Meter, Waveform
 * - Layout: Group, Separator
 */

import React, { useState } from 'react';
import {
    CircleDot,
    SlidersHorizontal,
    ToggleLeft,
    ChevronDown,
    Type,
    Lightbulb,
    Activity,
    AudioWaveform,
    LayoutGrid,
    Minus,
    Hand,
    ChevronRight,
} from 'lucide-react';
import { ElementThumbnail } from './ElementThumbnail';
import { UIElementType } from '../../types/uiElement';

// Re-export for backward compatibility
export { UIElementType };


interface ElementDefinition {
    type: UIElementType;
    name: string;
    icon: React.ReactNode;
    defaultSize: { width: number; height: number };
}

interface ElementCategory {
    id: string;
    name: string;
    elements: ElementDefinition[];
}

const elementCategories: ElementCategory[] = [
    {
        id: 'controls',
        name: 'Controls',
        elements: [
            { type: UIElementType.ROTARY_KNOB, name: 'Knob', icon: <CircleDot size={16} />, defaultSize: { width: 60, height: 80 } },
            { type: UIElementType.SLIDER, name: 'Slider', icon: <SlidersHorizontal size={16} />, defaultSize: { width: 40, height: 120 } },
            { type: UIElementType.TOGGLE, name: 'Toggle', icon: <ToggleLeft size={16} />, defaultSize: { width: 50, height: 30 } },
            { type: UIElementType.DROPDOWN, name: 'Dropdown', icon: <ChevronDown size={16} />, defaultSize: { width: 120, height: 30 } },
            { type: UIElementType.BUTTON_MOMENTARY, name: 'Button', icon: <Hand size={16} />, defaultSize: { width: 60, height: 30 } },
        ],
    },
    {
        id: 'display',
        name: 'Display',
        elements: [
            { type: UIElementType.TEXT_LABEL, name: 'Label', icon: <Type size={16} />, defaultSize: { width: 80, height: 20 } },
            { type: UIElementType.LED_INDICATOR, name: 'LED', icon: <Lightbulb size={16} />, defaultSize: { width: 16, height: 16 } },
            { type: UIElementType.VU_METER, name: 'Meter', icon: <Activity size={16} />, defaultSize: { width: 30, height: 100 } },
            { type: UIElementType.MINI_OSCILLOSCOPE, name: 'Scope', icon: <AudioWaveform size={16} />, defaultSize: { width: 200, height: 60 } },
        ],
    },
    {
        id: 'layout',
        name: 'Layout',
        elements: [
            { type: UIElementType.GROUP_BOX, name: 'Group', icon: <LayoutGrid size={16} />, defaultSize: { width: 200, height: 150 } },
            { type: UIElementType.NUMERIC_DISPLAY, name: 'Numeric', icon: <Minus size={16} />, defaultSize: { width: 60, height: 24 } },
        ],
    },
];

interface ElementLibraryPanelProps {
    onElementDragStart?: (elementDef: ElementDefinition) => void;
    onElementDragEnd?: () => void;
}

export const ElementLibraryPanel: React.FC<ElementLibraryPanelProps> = ({
    onElementDragStart,
    onElementDragEnd,
}) => {
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
        new Set(elementCategories.map(c => c.id))
    );
    const [searchQuery, setSearchQuery] = useState('');

    const toggleCategory = (categoryId: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(categoryId)) {
                next.delete(categoryId);
            } else {
                next.add(categoryId);
            }
            return next;
        });
    };

    const filteredCategories = elementCategories.map(category => ({
        ...category,
        elements: category.elements.filter(el =>
            el.name.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    })).filter(category => category.elements.length > 0);

    return (
        <div className="element-library-panel">
            <div className="panel-header">
                <span className="panel-title">Elements</span>
            </div>

            <div className="library-search">
                <input
                    type="text"
                    placeholder="Search elements..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="element-categories">
                {filteredCategories.map(category => (
                    <div key={category.id} className="element-category">
                        <button
                            className="category-header"
                            onClick={() => toggleCategory(category.id)}
                        >
                            <ChevronRight
                                size={14}
                                className={`category-chevron ${expandedCategories.has(category.id) ? 'expanded' : ''}`}
                            />
                            <span className="category-name">{category.name}</span>
                            <span className="category-count">{category.elements.length}</span>
                        </button>

                        {expandedCategories.has(category.id) && (
                            <div className="element-list">
                                {category.elements.map(element => (
                                    <ElementThumbnail
                                        key={element.type}
                                        element={element}
                                        onDragStart={() => onElementDragStart?.(element)}
                                        onDragEnd={onElementDragEnd}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export { elementCategories, type ElementDefinition, type ElementCategory };
