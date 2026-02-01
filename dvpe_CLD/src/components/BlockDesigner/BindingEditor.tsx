/**
 * BindingEditor - Parameter binding configuration
 * Phase 13.2: Visual UI Builder - Day 3
 */

import React, { useState } from 'react';
import { UIElement } from '../../types/uiElement';
import { ParameterBinding, MappingType } from '../../types/parameterBinding';
import { Link2, Unlink, ChevronDown } from 'lucide-react';

interface AvailableParameter {
    blockId: string;
    blockName: string;
    parameterId: string;
    parameterName: string;
    cppSetter: string;
}

interface BindingEditorProps {
    element: UIElement;
    availableParameters: AvailableParameter[];
    onBindingChange: (binding: ParameterBinding | undefined) => void;
}

export const BindingEditor: React.FC<BindingEditorProps> = ({
    element,
    availableParameters,
    onBindingChange,
}) => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const binding = element.binding;

    const handleCreateBinding = (param: AvailableParameter) => {
        const newBinding: ParameterBinding = {
            elementId: element.id,
            elementProperty: 'value',
            target: {
                blockId: param.blockId,
                parameterId: param.parameterId,
                cppSetter: param.cppSetter,
            },
            mapping: {
                type: 'direct',
                inputRange: [0, 1],
                outputRange: [0, 1],
            },
        };
        onBindingChange(newBinding);
    };

    const handleClearBinding = () => {
        onBindingChange(undefined);
    };

    const handleMappingChange = (updates: Partial<ParameterBinding['mapping']>) => {
        if (!binding) return;
        onBindingChange({
            ...binding,
            mapping: { ...binding.mapping, ...updates },
        });
    };

    // No binding yet - show parameter selector
    if (!binding) {
        return (
            <div className="binding-unbound">
                {availableParameters.length === 0 ? (
                    <div className="binding-empty">
                        <Link2 size={16} className="empty-icon" />
                        <span>No parameters available</span>
                        <span className="empty-hint">Add blocks with parameters to create bindings</span>
                    </div>
                ) : (
                    <div className="binding-selector">
                        <span className="selector-label">Bind to parameter:</span>
                        <div className="parameter-list">
                            {availableParameters.map((param) => (
                                <button
                                    key={`${param.blockId}-${param.parameterId}`}
                                    className="parameter-option"
                                    onClick={() => handleCreateBinding(param)}
                                >
                                    <span className="param-block">{param.blockName}</span>
                                    <span className="param-name">{param.parameterName}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Has binding - show binding info and options
    const boundParam = availableParameters.find(
        p => p.blockId === binding.target.blockId && p.parameterId === binding.target.parameterId
    );

    return (
        <div className="binding-bound">
            <div className="binding-target">
                <div className="target-info">
                    <span className="target-block">{boundParam?.blockName ?? binding.target.blockId}</span>
                    <span className="target-param">{boundParam?.parameterName ?? binding.target.parameterId}</span>
                </div>
                <button
                    className="unbind-button"
                    onClick={handleClearBinding}
                    title="Remove binding"
                >
                    <Unlink size={14} />
                </button>
            </div>

            <div className="binding-mapping">
                <div className="property-row full-width">
                    <label>Mapping</label>
                    <select
                        value={binding.mapping.type}
                        onChange={(e) => handleMappingChange({ type: e.target.value as MappingType })}
                    >
                        <option value="direct">Direct</option>
                        <option value="scaled">Scaled</option>
                        <option value="log">Logarithmic</option>
                        <option value="exp">Exponential</option>
                    </select>
                </div>
            </div>

            <button
                className="advanced-toggle"
                onClick={() => setShowAdvanced(!showAdvanced)}
            >
                <ChevronDown size={14} className={showAdvanced ? 'expanded' : ''} />
                Advanced
            </button>

            {showAdvanced && (
                <div className="binding-advanced">
                    <div className="property-row">
                        <label>In Min</label>
                        <input
                            type="number"
                            step="0.01"
                            value={binding.mapping.inputRange?.[0] ?? 0}
                            onChange={(e) => handleMappingChange({
                                inputRange: [Number(e.target.value), binding.mapping.inputRange?.[1] ?? 1]
                            })}
                        />
                    </div>
                    <div className="property-row">
                        <label>In Max</label>
                        <input
                            type="number"
                            step="0.01"
                            value={binding.mapping.inputRange?.[1] ?? 1}
                            onChange={(e) => handleMappingChange({
                                inputRange: [binding.mapping.inputRange?.[0] ?? 0, Number(e.target.value)]
                            })}
                        />
                    </div>
                    <div className="property-row">
                        <label>Out Min</label>
                        <input
                            type="number"
                            step="0.01"
                            value={binding.mapping.outputRange?.[0] ?? 0}
                            onChange={(e) => handleMappingChange({
                                outputRange: [Number(e.target.value), binding.mapping.outputRange?.[1] ?? 1]
                            })}
                        />
                    </div>
                    <div className="property-row">
                        <label>Out Max</label>
                        <input
                            type="number"
                            step="0.01"
                            value={binding.mapping.outputRange?.[1] ?? 1}
                            onChange={(e) => handleMappingChange({
                                outputRange: [binding.mapping.outputRange?.[0] ?? 0, Number(e.target.value)]
                            })}
                        />
                    </div>
                    <div className="property-row full-width">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={binding.clamp ?? true}
                                onChange={(e) => onBindingChange({ ...binding, clamp: e.target.checked })}
                            />
                            Clamp output
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
};
