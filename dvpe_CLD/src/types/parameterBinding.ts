/**
 * Parameter Binding Types for Phase 13.2 Visual UI Builder
 * 
 * Defines how UI elements connect to block parameters,
 * including value mapping and modulation configuration.
 */

/**
 * Supported mapping types for parameter bindings.
 */
export type MappingType = 'direct' | 'scaled' | 'log' | 'exp' | 'table';

/**
 * Configuration for value mapping between UI element and parameter.
 */
export interface MappingConfig {
    /** Type of mapping function */
    type: MappingType;

    /** Input value range from UI element (typically 0-1 for normalized) */
    inputRange?: [number, number];

    /** Output value range for the parameter */
    outputRange?: [number, number];

    /** Curve coefficient for exp mapping (y = x^n) */
    curveCoefficient?: number;

    /** Lookup table for 'table' mapping type */
    lookupTable?: Array<{ input: number; output: number }>;
}

/**
 * Target specification for a parameter binding.
 */
export interface BindingTarget {
    /** ID of the block instance */
    blockId: string;

    /** ID of the parameter within the block */
    parameterId: string;

    /** C++ setter method name (e.g., 'SetFreq', 'SetRes') */
    cppSetter: string;
}

/**
 * Modulation configuration for dynamic parameter control.
 */
export interface ModulationConfig {
    /** Whether modulation is enabled */
    enabled: boolean;

    /** Source of modulation (CV input, LFO, envelope) */
    source?: string;

    /** Modulation depth (0.0-1.0) */
    depth?: number;

    /** Modulation mode */
    mode?: 'bipolar' | 'unipolar';
}

/**
 * Complete parameter binding definition.
 * Connects a UI element property to a block parameter.
 */
export interface ParameterBinding {
    /** ID of the UI element this binding belongs to */
    elementId: string;

    /** Property of the element being bound (e.g., 'value', 'state', 'x', 'y') */
    elementProperty: string;

    /** Target block parameter */
    target: BindingTarget;

    /** Value mapping configuration */
    mapping: MappingConfig;

    /** Optional modulation settings */
    modulation?: ModulationConfig;

    /** Whether to clamp output to range */
    clamp?: boolean;

    /** Step size for quantization (for discrete parameters) */
    quantize?: number;
}

/**
 * Validation result for a parameter binding.
 */
export interface BindingValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

/**
 * Validates a parameter binding configuration.
 * @param binding The binding to validate
 * @returns Validation result with any errors or warnings
 */
export function validateBinding(binding: ParameterBinding): BindingValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (!binding.elementId) {
        errors.push('elementId is required');
    }
    if (!binding.target?.blockId) {
        errors.push('target.blockId is required');
    }
    if (!binding.target?.parameterId) {
        errors.push('target.parameterId is required');
    }
    if (!binding.mapping?.type) {
        errors.push('mapping.type is required');
    }

    // Validate ranges for scaled/log/exp mappings
    if (['scaled', 'log', 'exp'].includes(binding.mapping?.type)) {
        if (!binding.mapping.inputRange) {
            warnings.push('inputRange not specified, defaulting to [0, 1]');
        }
        if (!binding.mapping.outputRange) {
            errors.push('outputRange is required for scaled/log/exp mappings');
        }
    }

    // Validate lookup table for table mapping
    if (binding.mapping?.type === 'table') {
        if (!binding.mapping.lookupTable || binding.mapping.lookupTable.length < 2) {
            errors.push('lookupTable requires at least 2 entries for table mapping');
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}
