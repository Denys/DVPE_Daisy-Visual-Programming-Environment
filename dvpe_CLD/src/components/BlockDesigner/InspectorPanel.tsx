/**
 * InspectorPanel - Right sidebar for element property editing
 * Phase 13.2: Visual UI Builder - Day 3
 * 
 * Features:
 * - Display selected element properties
 * - Edit position, size, rotation
 * - Configure element-specific settings
 * - Manage parameter bindings
 */

import React from 'react';
import { PropertyEditor } from './PropertyEditor';
import { BindingEditor } from './BindingEditor';
import { UIElement } from '../../types/uiElement';
import { Settings, Link2, Layers } from 'lucide-react';

interface InspectorPanelProps {
    selectedElements: UIElement[];
    onElementUpdate: (id: string, updates: Partial<UIElement>) => void;
    availableParameters?: Array<{
        blockId: string;
        blockName: string;
        parameterId: string;
        parameterName: string;
        cppSetter: string;
    }>;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
    selectedElements,
    onElementUpdate,
    availableParameters = [],
}) => {
    const selectedElement = selectedElements.length === 1 ? selectedElements[0] : null;
    const multipleSelected = selectedElements.length > 1;

    return (
        <div className="inspector-panel">
            <div className="panel-header">
                <span className="panel-title">Inspector</span>
            </div>

            {!selectedElement && !multipleSelected && (
                <div className="inspector-empty">
                    Select an element to edit its properties
                </div>
            )}

            {multipleSelected && (
                <div className="inspector-multi-select">
                    <div className="multi-select-badge">
                        <Layers size={16} />
                        <span>{selectedElements.length} elements selected</span>
                    </div>
                    <p className="multi-select-hint">
                        Multi-element editing coming soon
                    </p>
                </div>
            )}

            {selectedElement && (
                <div className="inspector-content">
                    {/* Element Type Header */}
                    <div className="inspector-type-header">
                        <span className="type-badge">{selectedElement.type}</span>
                        {selectedElement.label && (
                            <span className="element-name">{selectedElement.label}</span>
                        )}
                    </div>

                    {/* Transform Section */}
                    <div className="inspector-section">
                        <div className="section-header">
                            <Settings size={14} />
                            <span className="section-title">Transform</span>
                        </div>

                        <div className="property-grid">
                            <div className="property-row">
                                <label>X</label>
                                <input
                                    type="number"
                                    value={selectedElement.position.x}
                                    onChange={(e) => onElementUpdate(selectedElement.id, {
                                        position: { ...selectedElement.position, x: Number(e.target.value) }
                                    })}
                                />
                            </div>
                            <div className="property-row">
                                <label>Y</label>
                                <input
                                    type="number"
                                    value={selectedElement.position.y}
                                    onChange={(e) => onElementUpdate(selectedElement.id, {
                                        position: { ...selectedElement.position, y: Number(e.target.value) }
                                    })}
                                />
                            </div>
                            <div className="property-row">
                                <label>W</label>
                                <input
                                    type="number"
                                    value={selectedElement.size.width}
                                    onChange={(e) => onElementUpdate(selectedElement.id, {
                                        size: { ...selectedElement.size, width: Number(e.target.value) }
                                    })}
                                />
                            </div>
                            <div className="property-row">
                                <label>H</label>
                                <input
                                    type="number"
                                    value={selectedElement.size.height}
                                    onChange={(e) => onElementUpdate(selectedElement.id, {
                                        size: { ...selectedElement.size, height: Number(e.target.value) }
                                    })}
                                />
                            </div>
                            <div className="property-row full-width">
                                <label>Rotation</label>
                                <input
                                    type="number"
                                    value={selectedElement.rotation}
                                    min={0}
                                    max={359}
                                    onChange={(e) => onElementUpdate(selectedElement.id, {
                                        rotation: Number(e.target.value)
                                    })}
                                />
                                <span className="unit">°</span>
                            </div>
                        </div>
                    </div>

                    {/* Properties Section */}
                    <PropertyEditor
                        element={selectedElement}
                        onUpdate={(updates) => onElementUpdate(selectedElement.id, updates)}
                    />

                    {/* Binding Section */}
                    <div className="inspector-section">
                        <div className="section-header">
                            <Link2 size={14} />
                            <span className="section-title">Parameter Binding</span>
                        </div>

                        <BindingEditor
                            element={selectedElement}
                            availableParameters={availableParameters}
                            onBindingChange={(binding) => onElementUpdate(selectedElement.id, { binding })}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
