import { BlockDefinition, PatchGraph } from './blocks';

/**
 * Definition for a user-created block that encapsulates a subgraph.
 */
export interface CustomBlockDefinition extends BlockDefinition {
    /** Flag to identify custom blocks */
    isCustom: true;

    /** The internal patch graph encapsulated by this block */
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
}
