/**
 * PropertyEditor - Dynamic property fields based on element type
 * Phase 13.2: Visual UI Builder - Day 3
 */

import React from 'react';
import { UIElement, UIElementType } from '../../types/uiElement';
import { Sliders } from 'lucide-react';

interface PropertyEditorProps {
    element: UIElement;
    onUpdate: (updates: Partial<UIElement>) => void;
}

export const PropertyEditor: React.FC<PropertyEditorProps> = ({
    element,
    onUpdate,
}) => {
    const updateConfig = (key: string, value: unknown) => {
        onUpdate({
            config: { ...element.config, [key]: value }
        });
    };

    const renderKnobProperties = () => (
        <>
            <div className="property-row">
                <label>Min</label>
                <input
                    type="number"
                    value={(element.config.valueRange as [number, number])?.[0] ?? 0}
                    onChange={(e) => {
                        const range = (element.config.valueRange as [number, number]) ?? [0, 1];
                        updateConfig('valueRange', [Number(e.target.value), range[1]]);
                    }}
                />
            </div>
            <div className="property-row">
                <label>Max</label>
                <input
                    type="number"
                    value={(element.config.valueRange as [number, number])?.[1] ?? 1}
                    onChange={(e) => {
                        const range = (element.config.valueRange as [number, number]) ?? [0, 1];
                        updateConfig('valueRange', [range[0], Number(e.target.value)]);
                    }}
                />
            </div>
            <div className="property-row">
                <label>Default</label>
                <input
                    type="number"
                    value={(element.config.defaultValue as number) ?? 0.5}
                    onChange={(e) => updateConfig('defaultValue', Number(e.target.value))}
                />
            </div>
            <div className="property-row full-width">
                <label>Curve</label>
                <select
                    value={(element.config.curve as string) ?? 'linear'}
                    onChange={(e) => updateConfig('curve', e.target.value)}
                >
                    <option value="linear">Linear</option>
                    <option value="log">Logarithmic</option>
                    <option value="exp">Exponential</option>
                </select>
            </div>
            <div className="property-row full-width">
                <label>Units</label>
                <input
                    type="text"
                    value={(element.config.units as string) ?? ''}
                    placeholder="Hz, dB, %..."
                    onChange={(e) => updateConfig('units', e.target.value)}
                />
            </div>
        </>
    );

    const renderSliderProperties = () => (
        <>
            <div className="property-row full-width">
                <label>Orientation</label>
                <select
                    value={(element.config.orientation as string) ?? 'vertical'}
                    onChange={(e) => updateConfig('orientation', e.target.value)}
                >
                    <option value="vertical">Vertical</option>
                    <option value="horizontal">Horizontal</option>
                </select>
            </div>
            <div className="property-row">
                <label>Min</label>
                <input
                    type="number"
                    value={(element.config.valueRange as [number, number])?.[0] ?? 0}
                    onChange={(e) => {
                        const range = (element.config.valueRange as [number, number]) ?? [0, 1];
                        updateConfig('valueRange', [Number(e.target.value), range[1]]);
                    }}
                />
            </div>
            <div className="property-row">
                <label>Max</label>
                <input
                    type="number"
                    value={(element.config.valueRange as [number, number])?.[1] ?? 1}
                    onChange={(e) => {
                        const range = (element.config.valueRange as [number, number]) ?? [0, 1];
                        updateConfig('valueRange', [range[0], Number(e.target.value)]);
                    }}
                />
            </div>
            <div className="property-row full-width">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={(element.config.showFill as boolean) ?? true}
                        onChange={(e) => updateConfig('showFill', e.target.checked)}
                    />
                    Show fill
                </label>
            </div>
        </>
    );

    const renderToggleProperties = () => (
        <>
            <div className="property-row full-width">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={(element.config.defaultState as boolean) ?? false}
                        onChange={(e) => updateConfig('defaultState', e.target.checked)}
                    />
                    Default On
                </label>
            </div>
            <div className="property-row">
                <label>On Label</label>
                <input
                    type="text"
                    value={(element.config.onLabel as string) ?? 'ON'}
                    onChange={(e) => updateConfig('onLabel', e.target.value)}
                />
            </div>
            <div className="property-row">
                <label>Off Label</label>
                <input
                    type="text"
                    value={(element.config.offLabel as string) ?? 'OFF'}
                    onChange={(e) => updateConfig('offLabel', e.target.value)}
                />
            </div>
        </>
    );

    const renderLabelProperties = () => (
        <>
            <div className="property-row full-width">
                <label>Text</label>
                <input
                    type="text"
                    value={element.label ?? ''}
                    onChange={(e) => onUpdate({ label: e.target.value })}
                />
            </div>
        </>
    );

    const renderPropertiesForType = () => {
        switch (element.type) {
            case UIElementType.ROTARY_KNOB:
                return renderKnobProperties();
            case UIElementType.SLIDER:
                return renderSliderProperties();
            case UIElementType.TOGGLE:
                return renderToggleProperties();
            case UIElementType.TEXT_LABEL:
                return renderLabelProperties();
            default:
                return (
                    <div className="property-empty">
                        No configurable properties
                    </div>
                );
        }
    };

    return (
        <div className="inspector-section">
            <div className="section-header">
                <Sliders size={14} />
                <span className="section-title">Properties</span>
            </div>
            <div className="property-grid">
                {renderPropertiesForType()}
            </div>
        </div>
    );
};
