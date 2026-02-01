import { PatchGraph, BlockCategory, BlockColorScheme, PortDirection, PortDefinition, ParameterDefinition } from '@/types';
import { CustomBlockDefinition } from '@/types/customBlock';
import { BlockRegistry } from './BlockRegistry';

export interface CustomBlockMetadata {
    id: string;
    displayName: string;
    description: string;
    category: BlockCategory;
    author?: string;
    icon?: string;
}

export class CustomBlockManager {
    /**
     * Creates a new CustomBlockDefinition from a given patch graph.
     */
    static createCustomBlock(patch: PatchGraph, metadata: CustomBlockMetadata): CustomBlockDefinition {
        const exposedPorts: CustomBlockDefinition['exposedPorts'] = {};
        const exposedParameters: CustomBlockDefinition['exposedParameters'] = {};
        const ports: PortDefinition[] = [];
        const parameters: ParameterDefinition[] = [];

        // 1. Analyze Connections to find connected ports
        const inputConnections = new Set<string>(); // targetBlockId:targetPortId
        const outputConnections = new Set<string>(); // sourceBlockId:sourcePortId

        patch.connections.forEach(conn => {
            inputConnections.add(`${conn.targetBlockId}:${conn.targetPortId}`);
            outputConnections.add(`${conn.sourceBlockId}:${conn.sourcePortId}`);
        });

        // 2. Iterate Blocks to find unconnected ports -> Expose them
        patch.blocks.forEach(block => {
            const def = BlockRegistry.get(block.definitionId);
            if (!def) return;

            // Check Ports
            def.ports.forEach(port => {
                const portKey = `${block.id}:${port.id}`;

                if (port.direction === PortDirection.INPUT) {
                    // If input is NOT connected, expose it
                    if (!inputConnections.has(portKey)) {
                        const exposedId = `${block.id}_${port.id}`;
                        exposedPorts[exposedId] = { blockId: block.id, portId: port.id };
                        ports.push({
                            ...port,
                            id: exposedId,
                            displayName: `${block.id} ${port.displayName}`
                        });
                    }
                } else if (port.direction === PortDirection.OUTPUT) {
                    // If output is NOT connected, expose it
                    if (!outputConnections.has(portKey)) {
                        const exposedId = `${block.id}_${port.id}`;
                        exposedPorts[exposedId] = { blockId: block.id, portId: port.id };
                        ports.push({
                            ...port,
                            id: exposedId,
                            displayName: `${block.id} ${port.displayName}`
                        });
                    }
                }
            });

            // Check Parameters (Expose ALL for now)
            def.parameters.forEach(param => {
                const exposedId = `${block.id}_${param.id}`;
                exposedParameters[exposedId] = { blockId: block.id, parameterId: param.id };
                parameters.push({
                    ...param,
                    id: exposedId,
                    displayName: `${block.id} ${param.displayName}`
                });
            });
        });

        const customBlock: CustomBlockDefinition = {
            id: metadata.id,
            className: `Custom_${metadata.id}`, // Placeholder
            displayName: metadata.displayName,
            category: metadata.category,
            description: metadata.description,
            icon: metadata.icon || 'Box',
            colorScheme: BlockColorScheme.USER, // Default custom color

            // C++ Gen placeholders (can't generate yet)
            headerFile: '',
            initMethod: '',
            initParams: [],
            processMethod: '',

            parameters,
            ports,

            isCustom: true,
            internalPatch: patch,
            exposedPorts,
            exposedParameters
        };

        return customBlock;
    }
}
