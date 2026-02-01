/**
 * Layout Preset Types for Phase 13.2 Visual UI Builder
 * 
 * Defines templates for common block UI configurations
 * that can be applied to quickly set up block interfaces.
 */

import { UIElement } from './uiElement';


/**
 * Categories for layout presets.
 */
export type PresetCategory = 'synth' | 'fx' | 'sequencer' | 'utility' | 'custom';

/**
 * Metadata for a layout preset.
 */
export interface PresetMetadata {
    /** Author of the preset */
    author: string;

    /** Version string */
    version: string;

    /** Compatible block types this preset works with */
    compatibleBlocks?: string[];

    /** Creation date (ISO string) */
    dateCreated?: string;

    /** Last modified date (ISO string) */
    dateModified?: string;
}

/**
 * Block dimensions for the preset canvas.
 */
export interface BlockDimensions {
    width: number;
    height: number;
}

/**
 * Layout preset definition.
 * A reusable template for block UI configurations.
 */
export interface LayoutPreset {
    /** Unique identifier for the preset */
    id: string;

    /** Display name */
    name: string;

    /** Category for organization */
    category: PresetCategory;

    /** Description of the preset */
    description?: string;

    /** Searchable tags */
    tags?: string[];

    /** Base64-encoded PNG thumbnail preview */
    thumbnail?: string;

    /** Canvas dimensions */
    blockDimensions: BlockDimensions;

    /** UI elements in this preset */
    elements: UIElement[];

    /** Element z-order (element IDs from bottom to top) */
    zOrder?: string[];

    /** Preset metadata */
    metadata?: PresetMetadata;
}

/**
 * Result of applying a preset to a block.
 */
export interface PresetApplicationResult {
    success: boolean;
    elementsCreated: number;
    bindingsCreated: number;
    warnings: string[];
}

/**
 * Built-in preset IDs.
 */
export const BuiltInPresetIds = {
    SUBTRACTIVE_VOICE: 'subtractive-voice',
    FM_OPERATOR: 'fm-operator',
    STEREO_DELAY: 'stereo-delay',
    PARAMETRIC_EQ: 'parametric-eq',
    LFO: 'lfo',
    STEP_SEQUENCER_8: 'step-sequencer-8',
    COMPRESSOR: 'compressor',
    REVERB: 'reverb',
} as const;

export type BuiltInPresetId = typeof BuiltInPresetIds[keyof typeof BuiltInPresetIds];
