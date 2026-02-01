/**
 * Unit tests for UI Element types - Phase 13.2
 */
import {
    UIElement,
    UIElementType,
} from '../uiElement';
import {
    ParameterBinding,
    MappingConfig,
    validateBinding,
} from '../parameterBinding';

describe('UIElementType', () => {
    it('has all MVP values', () => {
        expect(UIElementType.ROTARY_KNOB).toBe('rotary_knob');
        expect(UIElementType.SLIDER).toBe('slider');
        expect(UIElementType.TEXT_LABEL).toBe('text_label');
        expect(UIElementType.GROUP_BOX).toBe('group_box');
        expect(UIElementType.TOGGLE).toBe('toggle');
        expect(UIElementType.DROPDOWN).toBe('dropdown');
    });

    it('has extended values', () => {
        expect(UIElementType.NUMERIC_DISPLAY).toBe('numeric_display');
        expect(UIElementType.LED_INDICATOR).toBe('led_indicator');
        expect(UIElementType.BUTTON_MOMENTARY).toBe('button_momentary');
    });
});

describe('UIElement', () => {
    it('can be constructed with required fields', () => {
        const element: UIElement = {
            id: 'test-knob-1',
            type: UIElementType.ROTARY_KNOB,
            position: { x: 100, y: 50 },
            size: { width: 60, height: 80 },
            rotation: 0,
            config: { valueRange: [0, 1] },
        };

        expect(element.id).toBe('test-knob-1');
        expect(element.type).toBe(UIElementType.ROTARY_KNOB);
    });

    it('can include parameter binding', () => {
        const binding: ParameterBinding = {
            elementId: 'freq-knob',
            elementProperty: 'value',
            target: {
                blockId: 'osc1',
                parameterId: 'frequency',
                cppSetter: 'SetFreq',
            },
            mapping: {
                type: 'log',
                inputRange: [0, 1],
                outputRange: [20, 20000],
            },
        };

        const element: UIElement = {
            id: 'freq-knob',
            type: UIElementType.ROTARY_KNOB,
            position: { x: 20, y: 40 },
            size: { width: 60, height: 60 },
            rotation: 0,
            config: {},
            binding,
        };

        expect(element.binding?.target.cppSetter).toBe('SetFreq');
    });
});

describe('MappingConfig', () => {
    it('supports log mapping for frequency', () => {
        const config: MappingConfig = {
            type: 'log',
            inputRange: [0, 1],
            outputRange: [20, 20000],
        };
        expect(config.type).toBe('log');
        expect(config.outputRange?.[1]).toBe(20000);
    });
});

describe('validateBinding', () => {
    it('valid binding passes', () => {
        const binding: ParameterBinding = {
            elementId: 'knob-1',
            elementProperty: 'value',
            target: {
                blockId: 'osc1',
                parameterId: 'freq',
                cppSetter: 'SetFreq',
            },
            mapping: {
                type: 'log',
                inputRange: [0, 1],
                outputRange: [20, 20000],
            },
        };

        const result = validateBinding(binding);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });
});
