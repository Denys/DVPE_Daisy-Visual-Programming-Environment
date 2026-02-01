/**
 * UI Element Types for Phase 13.2 Visual UI Builder
 * 
 * Defines the core types for UI elements that can be placed
 * on the block designer canvas and bound to block parameters.
 */

import { ParameterBinding } from './parameterBinding';

/**
 * Enum of supported UI element types for the block designer.
 * MVP elements (Priority 1) are listed first.
 */
export enum UIElementType {
    // MVP Elements (Priority 1)
    ROTARY_KNOB = 'rotary_knob',
    ROTARY_ENCODER = 'rotary_encoder',
    SLIDER = 'slider',
    TEXT_LABEL = 'text_label',
    GROUP_BOX = 'group_box',
    TOGGLE = 'toggle',
    DROPDOWN = 'dropdown',

    // Extended Elements (Priority 2)
    NUMERIC_DISPLAY = 'numeric_display',
    LED_INDICATOR = 'led_indicator',
    BUTTON_MOMENTARY = 'button_momentary',

    // Audio Elements (Priority 3 - Design-time mockups)
    MINI_OSCILLOSCOPE = 'mini_oscilloscope',
    ENVELOPE_DISPLAY = 'envelope_display',
    VU_METER = 'vu_meter',
}

/**
 * Style configuration for UI elements.
 */
export interface UIElementStyle {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    fontFamily?: string;
    fontSize?: number;
    fontColor?: string;
    opacity?: number;
}

/**
 * Position in 2D space (pixels from top-left of canvas).
 */
export interface Position {
    x: number;
    y: number;
}

/**
 * Size dimensions in pixels.
 */
export interface Size {
    width: number;
    height: number;
}

/**
 * Core UI Element interface.
 * Represents any placeable element on the block designer canvas.
 */
export interface UIElement {
    /** Unique identifier for this element instance */
    id: string;

    /** Type of UI element */
    type: UIElementType;

    /** Position on canvas (pixels from top-left) */
    position: Position;

    /** Element dimensions in pixels */
    size: Size;

    /** Rotation in degrees (0-359) */
    rotation: number;

    /** Element-specific configuration */
    config: Record<string, unknown>;

    /** Visual styling overrides */
    style?: UIElementStyle;

    /** Parameter binding (if element is connected to a block parameter) */
    binding?: ParameterBinding;

    /** Display label for the element */
    label?: string;

    /** Whether element is locked from editing */
    locked?: boolean;

    /** Whether element is visible */
    visible?: boolean;

    /** Z-index for layering (higher = on top) */
    zIndex?: number;
}

/**
 * Configuration specific to rotary knob elements.
 */
export interface RotaryKnobConfig {
    valueRange: [number, number];
    defaultValue: number;
    curve: 'linear' | 'log' | 'exp';
    units?: string;
    detents?: number[];
    needleStyle?: 'line' | 'dot' | 'arc';
    showValueArc?: boolean;
    diameter?: number;
}

/**
 * Configuration specific to slider elements.
 */
export interface SliderConfig {
    orientation: 'vertical' | 'horizontal';
    valueRange: [number, number];
    defaultValue: number;
    showFill?: boolean;
    centerDetent?: boolean;
}

/**
 * Configuration specific to dropdown elements.
 */
export interface DropdownConfig {
    options: Array<{ value: string | number; label: string }>;
    defaultValue: string | number;
}

/**
 * Configuration specific to toggle elements.
 */
export interface ToggleConfig {
    defaultState: boolean;
    onLabel?: string;
    offLabel?: string;
}
