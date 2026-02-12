import { BlockDefinition, PatchGraph, SignalType, PortDirection } from './blocks';

/**
 * Port binding for code module blocks.
 * Defines an input or output port that connects user C++ code to the external world.
 */
export interface PortBinding {
    /** Unique identifier for the port (used in C++ code) */
    id: string;
    /** Display name shown in UI */
    displayName: string;
    /** Signal type determines wire color and connection validation */
    signalType: SignalType;
    /** Port direction (input/output) */
    direction: PortDirection;
    /** Optional description/tooltip */
    description?: string;
}

/**
 * Definition for a code module block (hybrid custom code).
 * Contains user-written C++ code with declared input/output ports.
 */
export interface CodeModuleDefinition {
    /** User-written C++ code that runs in the audio callback */
    cppCode: string;
    /** Declared input/output ports for the module */
    portBindings: PortBinding[];
    /** Optional state variable declarations */
    stateVariables?: Array<{
        type: string;
        name: string;
        init: string;
    }>;
}

/**
 * Definition for a user-created block that encapsulates a subgraph or custom code.
 */
export interface CustomBlockDefinition extends BlockDefinition {
    /** Flag to identify custom blocks */
    isCustom: true;

    /** The internal patch graph encapsulated by this block (null for code modules) */
    internalPatch: PatchGraph;

    /** Mapping of external port IDs to internal block/port endpoints */
    exposedPorts: Record<string, {
        blockId: string;
        portId: string;
    }>;

    /** Mapping of external parameter IDs to internal block parameters */
    exposedParameters: Record<string, {
        blockId: string;
        parameterId: string;
    }>;

    /** 
     * Code module definition (for hybrid code blocks).
     * When present, this block uses custom C++ code instead of an internal patch graph.
     */
    codeModule?: CodeModuleDefinition;
}
