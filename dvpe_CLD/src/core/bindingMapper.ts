/**
 * Binding Mapper - Mapping functions for parameter bindings
 * Phase 13.2 - Agent A Day 3
 * 
 * Provides transformation functions between UI element values ([0,1] normalized)
 * and DaisySP parameter values (actual ranges)
 */

import { MappingConfig, MappingType, ParameterBinding } from '@/types/parameterBinding';

// ============================================================================
// MAPPING FUNCTIONS
// ============================================================================

/**
 * Direct pass-through mapping (no transformation)
 */
export function mapDirect(input: number): number {
    return input;
}

/**
 * Linear scaled mapping between input and output ranges
 */
export function mapScaled(
    input: number,
    inputRange: [number, number] = [0, 1],
    outputRange: [number, number] = [0, 1]
): number {
    const [inMin, inMax] = inputRange;
    const [outMin, outMax] = outputRange;

    // Clamp input to range
    const clamped = Math.max(inMin, Math.min(inMax, input));

    // Normalize to 0-1
    const normalized = (clamped - inMin) / (inMax - inMin);

    // Scale to output range
    return outMin + normalized * (outMax - outMin);
}

/**
 * Logarithmic mapping - good for frequency, perceived loudness
 * Maps linear input to logarithmic output (e.g., 20Hz-20kHz)
 */
export function mapLog(
    input: number,
    inputRange: [number, number] = [0, 1],
    outputRange: [number, number] = [20, 20000],
    curveCoefficient: number = 2
): number {
    const [inMin, inMax] = inputRange;
    const [outMin, outMax] = outputRange;

    // Clamp and normalize
    const clamped = Math.max(inMin, Math.min(inMax, input));
    const normalized = (clamped - inMin) / (inMax - inMin);

    // Apply logarithmic curve
    // Use pow for controllable curve steepness
    const curved = Math.pow(normalized, curveCoefficient);

    // Map to output range with log scale
    const logMin = Math.log10(Math.max(outMin, 1));
    const logMax = Math.log10(outMax);
    const logOutput = logMin + curved * (logMax - logMin);

    return Math.pow(10, logOutput);
}

/**
 * Exponential mapping - inverse of log, good for decay times
 */
export function mapExp(
    input: number,
    inputRange: [number, number] = [0, 1],
    outputRange: [number, number] = [0.001, 10],
    curveCoefficient: number = 2
): number {
    const [inMin, inMax] = inputRange;
    const [outMin, outMax] = outputRange;

    // Clamp and normalize
    const clamped = Math.max(inMin, Math.min(inMax, input));
    const normalized = (clamped - inMin) / (inMax - inMin);

    // Apply exponential curve (inverse of log)
    const curved = 1 - Math.pow(1 - normalized, curveCoefficient);

    // Scale to output range
    return outMin + curved * (outMax - outMin);
}

/**
 * Lookup table mapping - for discrete or custom curves
 */
export function mapTable(
    input: number,
    lookupTable: Array<{ input: number; output: number }>
): number {
    if (lookupTable.length === 0) return input;
    if (lookupTable.length === 1) return lookupTable[0].output;

    // Sort by input value
    const sorted = [...lookupTable].sort((a, b) => a.input - b.input);

    // Find bracketing entries
    if (input <= sorted[0].input) return sorted[0].output;
    if (input >= sorted[sorted.length - 1].input) return sorted[sorted.length - 1].output;

    // Linear interpolation between entries
    for (let i = 0; i < sorted.length - 1; i++) {
        if (input >= sorted[i].input && input <= sorted[i + 1].input) {
            const t = (input - sorted[i].input) / (sorted[i + 1].input - sorted[i].input);
            return sorted[i].output + t * (sorted[i + 1].output - sorted[i].output);
        }
    }

    return input;
}

/**
 * Apply mapping based on config
 */
export function applyMapping(input: number, config: MappingConfig): number {
    switch (config.type) {
        case 'direct':
            return mapDirect(input);

        case 'scaled':
            return mapScaled(input, config.inputRange, config.outputRange);

        case 'log':
            return mapLog(input, config.inputRange, config.outputRange, config.curveCoefficient);

        case 'exp':
            return mapExp(input, config.inputRange, config.outputRange, config.curveCoefficient);

        case 'table':
            return mapTable(input, config.lookupTable ?? []);

        default:
            return input;
    }
}

// ============================================================================
// CODE GENERATION
// ============================================================================

/**
 * Generate C++ code for a parameter binding
 * Returns inline C++ that applies the mapping and calls the setter
 */
export function generateBindingCode(binding: ParameterBinding): string {
    const { target, mapping } = binding;

    if (!target.cppSetter) {
        return `// No C++ setter defined for ${target.parameterId}`;
    }

    const inputVar = `${binding.elementId}_value`;

    switch (mapping.type) {
        case 'direct':
            return `${target.blockId}.${target.cppSetter}(${inputVar});`;

        case 'scaled': {
            const [inMin, inMax] = mapping.inputRange ?? [0, 1];
            const [outMin, outMax] = mapping.outputRange ?? [0, 1];
            return `{
  float normalized = (${inputVar} - ${inMin}f) / ${inMax - inMin}f;
  float scaled = ${outMin}f + normalized * ${outMax - outMin}f;
  ${target.blockId}.${target.cppSetter}(scaled);
}`;
        }

        case 'log': {
            const [outMin, outMax] = mapping.outputRange ?? [20, 20000];
            const coeff = mapping.curveCoefficient ?? 2;
            return `{
  float curved = powf(${inputVar}, ${coeff}f);
  float logMin = log10f(${Math.max(outMin, 1)}f);
  float logMax = log10f(${outMax}f);
  float logOutput = logMin + curved * (logMax - logMin);
  ${target.blockId}.${target.cppSetter}(powf(10.0f, logOutput));
}`;
        }

        case 'exp': {
            const [outMin, outMax] = mapping.outputRange ?? [0.001, 10];
            const coeff = mapping.curveCoefficient ?? 2;
            return `{
  float curved = 1.0f - powf(1.0f - ${inputVar}, ${coeff}f);
  float scaled = ${outMin}f + curved * ${outMax - outMin}f;
  ${target.blockId}.${target.cppSetter}(scaled);
}`;
        }

        case 'table':
            // For table mappings, generate a lookup function call
            return `${target.blockId}.${target.cppSetter}(LookupTable_${binding.elementId}(${inputVar}));`;

        default:
            return `${target.blockId}.${target.cppSetter}(${inputVar});`;
    }
}

/**
 * Generate C++ lookup table definition for table mappings
 */
export function generateLookupTableCode(
    tableName: string,
    lookupTable: Array<{ input: number; output: number }>
): string {
    if (lookupTable.length === 0) {
        return `// Empty lookup table: ${tableName}`;
    }

    const sorted = [...lookupTable].sort((a, b) => a.input - b.input);

    const entries = sorted
        .map(e => `  {${e.input}f, ${e.output}f}`)
        .join(',\n');

    return `// Lookup table: ${tableName}
const float ${tableName}_data[][2] = {
${entries}
};
const int ${tableName}_size = ${sorted.length};

float ${tableName}(float input) {
  if (input <= ${tableName}_data[0][0]) return ${tableName}_data[0][1];
  if (input >= ${tableName}_data[${tableName}_size - 1][0]) return ${tableName}_data[${tableName}_size - 1][1];
  
  for (int i = 0; i < ${tableName}_size - 1; i++) {
    if (input >= ${tableName}_data[i][0] && input <= ${tableName}_data[i + 1][0]) {
      float t = (input - ${tableName}_data[i][0]) / (${tableName}_data[i + 1][0] - ${tableName}_data[i][0]);
      return ${tableName}_data[i][1] + t * (${tableName}_data[i + 1][1] - ${tableName}_data[i][1]);
    }
  }
  return input;
}`;
}

// ============================================================================
// AUTO-BINDING SUGGESTIONS
// ============================================================================

import { UIElementType } from '@/types/uiElement';

interface BindingSuggestion {
    mappingType: MappingType;
    inputRange: [number, number];
    outputRange: [number, number];
    curveCoefficient?: number;
    confidence: number; // 0-1
    reason: string;
}

/**
 * Suggest optimal binding configuration based on element and parameter types
 */
export function suggestBinding(
    elementType: UIElementType,
    parameterHint: string
): BindingSuggestion {
    const hint = parameterHint.toLowerCase();

    // Frequency parameters (Hz)
    if (hint.includes('freq') || hint.includes('hz') || hint.includes('pitch')) {
        return {
            mappingType: 'log',
            inputRange: [0, 1],
            outputRange: [20, 20000],
            curveCoefficient: 2,
            confidence: 0.9,
            reason: 'Frequency perception is logarithmic',
        };
    }

    // Time parameters (decay, attack, release)
    if (hint.includes('attack') || hint.includes('decay') || hint.includes('release') || hint.includes('time')) {
        return {
            mappingType: 'exp',
            inputRange: [0, 1],
            outputRange: [0.001, 5],
            curveCoefficient: 2.5,
            confidence: 0.85,
            reason: 'Envelope times feel more natural with exponential response',
        };
    }

    // Volume/gain parameters (dB perception)
    if (hint.includes('volume') || hint.includes('gain') || hint.includes('level') || hint.includes('amplitude')) {
        return {
            mappingType: 'log',
            inputRange: [0, 1],
            outputRange: [0, 1],
            curveCoefficient: 2,
            confidence: 0.8,
            reason: 'Volume perception is approximately logarithmic',
        };
    }

    // Filter Q/resonance
    if (hint.includes('resonance') || hint.includes('q') || hint.includes('res')) {
        return {
            mappingType: 'scaled',
            inputRange: [0, 1],
            outputRange: [0.5, 20],
            confidence: 0.75,
            reason: 'Resonance typically uses linear scaling with moderate Q range',
        };
    }

    // Mix/blend parameters
    if (hint.includes('mix') || hint.includes('blend') || hint.includes('dry') || hint.includes('wet')) {
        return {
            mappingType: 'direct',
            inputRange: [0, 1],
            outputRange: [0, 1],
            confidence: 0.95,
            reason: 'Mix parameters are naturally 0-1 linear',
        };
    }

    // Toggle elements default to direct
    if (elementType === UIElementType.TOGGLE) {
        return {
            mappingType: 'direct',
            inputRange: [0, 1],
            outputRange: [0, 1],
            confidence: 0.99,
            reason: 'Toggle switches use direct on/off mapping',
        };
    }

    // Default: scaled linear
    return {
        mappingType: 'scaled',
        inputRange: [0, 1],
        outputRange: [0, 1],
        confidence: 0.5,
        reason: 'Default linear scaling - adjust ranges as needed',
    };
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Check if binding creates circular dependency
 */
export function hasCircularDependency(
    // bindings: ParameterBinding[],
    // newBinding: ParameterBinding
): boolean {
    // In UI builder context, circular deps are when:
    // - Element A's output feeds to parameter that controls Element A
    // For Phase 13.2 MVP, we don't support parameter-to-parameter routing
    // so circular deps are not possible. This is a placeholder for future.
    return false;
}

/**
 * Check if binding target exists in the block
 */
export function isValidBindingTarget(
    blockParameters: string[],
    binding: ParameterBinding
): boolean {
    return blockParameters.includes(binding.target.parameterId);
}
