/**
 * Block UI Layout Types
 * Phase 13.2 - Extends BlockDefinition with custom UI layouts
 * 
 * Defines the structure for block visual customization that can be
 * serialized in .dvpe-block files and generated into C++ handling code.
 */

import { UIElement } from './uiElement';
import { ParameterBinding } from './parameterBinding';
import { LayoutPreset } from './layoutPreset';

// ============================================================================
// BLOCK UI LAYOUT
// ============================================================================

/**
 * Complete custom UI layout for a block
 * This is the main structure that extends BlockDefinition
 */
export interface BlockUILayout {
    /** Version for format compatibility */
    version: '1.0';

    /** Reference to base block definition ID */
    blockDefinitionId: string;

    /** UI elements placed on the block face */
    elements: UIElement[];

    /** Parameter bindings connecting elements to DSP parameters */
    bindings: ParameterBinding[];

    /** Block face dimensions */
    dimensions: {
        width: number;
        height: number;
    };

    /** Background styling */
    background?: {
        color?: string;
        gradient?: string;
        imageUrl?: string;
    };

    /** Grid/alignment settings used during design */
    designGrid?: {
        size: number;
        visible: boolean;
        snapEnabled: boolean;
    };

    /** Layout preset this was based on (if any) */
    basePreset?: string;

    /** Metadata */
    metadata?: {
        author?: string;
        createdAt?: string;
        modifiedAt?: string;
        description?: string;
        tags?: string[];
    };
}

// ============================================================================
// SERIALIZATION FORMAT (.dvpe-block)
// ============================================================================

/**
 * Complete .dvpe-block file format
 * Contains both the block definition extension and UI layout
 */
export interface DVPEBlockFile {
    /** File format identifier */
    format: 'dvpe-block';

    /** Format version */
    version: '1.0';

    /** The block's unique identifier */
    blockId: string;

    /** Display name for the block */
    displayName: string;

    /** UI layout configuration */
    layout: BlockUILayout;

    /** Optional: bundled preset definitions */
    bundledPresets?: LayoutPreset[];

    /** Export settings for C++ code generation */
    codeGeneration?: {
        /** Generate parameter binding handlers */
        generateBindingHandlers: boolean;
        /** Include mapping functions inline or reference library */
        inlineMappingFunctions: boolean;
        /** Naming prefix for generated functions */
        functionPrefix?: string;
    };
}

// ============================================================================
// EXTENSION FOR BlockDefinition
// ============================================================================

/**
 * Extension interface to add to existing BlockDefinition
 * Use: BlockDefinition & BlockDefinitionUIExtension
 */
export interface BlockDefinitionUIExtension {
    /** Custom UI layout (optional - blocks can use default renderer) */
    customUI?: BlockUILayout;

    /** Preferred layout presets for this block type */
    suggestedPresets?: string[];

    /** Whether this block supports custom UI editing */
    allowCustomUI?: boolean;
}

// ============================================================================
// SERIALIZATION HELPERS
// ============================================================================

/**
 * Serialize a block UI layout to JSON string
 */
export function serializeBlockLayout(layout: BlockUILayout): string {
    return JSON.stringify(layout, null, 2);
}

/**
 * Parse a block UI layout from JSON string
 */
export function parseBlockLayout(json: string): BlockUILayout {
    const parsed = JSON.parse(json);

    // Validate version
    if (parsed.version !== '1.0') {
        throw new Error(`Unsupported layout version: ${parsed.version}`);
    }

    // Validate required fields
    if (!parsed.blockDefinitionId || !Array.isArray(parsed.elements)) {
        throw new Error('Invalid layout: missing required fields');
    }

    return parsed as BlockUILayout;
}

/**
 * Serialize a complete .dvpe-block file
 */
export function serializeDVPEBlock(block: DVPEBlockFile): string {
    return JSON.stringify(block, null, 2);
}

/**
 * Parse a .dvpe-block file
 */
export function parseDVPEBlock(json: string): DVPEBlockFile {
    const parsed = JSON.parse(json);

    // Validate format
    if (parsed.format !== 'dvpe-block') {
        throw new Error(`Invalid file format: ${parsed.format}`);
    }

    if (parsed.version !== '1.0') {
        throw new Error(`Unsupported file version: ${parsed.version}`);
    }

    // Validate layout
    if (!parsed.layout || !parsed.blockId) {
        throw new Error('Invalid .dvpe-block: missing required fields');
    }

    return parsed as DVPEBlockFile;
}

/**
 * Create a new empty block layout
 */
export function createEmptyBlockLayout(
    blockDefinitionId: string,
    dimensions = { width: 240, height: 160 }
): BlockUILayout {
    return {
        version: '1.0',
        blockDefinitionId,
        elements: [],
        bindings: [],
        dimensions,
        designGrid: {
            size: 10,
            visible: true,
            snapEnabled: true,
        },
        metadata: {
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
        },
    };
}

/**
 * Create a .dvpe-block file from layout
 */
export function createDVPEBlock(
    blockId: string,
    displayName: string,
    layout: BlockUILayout
): DVPEBlockFile {
    return {
        format: 'dvpe-block',
        version: '1.0',
        blockId,
        displayName,
        layout,
        codeGeneration: {
            generateBindingHandlers: true,
            inlineMappingFunctions: false,
        },
    };
}
