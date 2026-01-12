/**
 * Graph Analyzer
 * Topological sort and graph analysis utilities for DVPE
 * Ported from dvpe with type adaptations for dvpe_CLD
 */

import { BlockInstance, Connection, BlockDefinition, SignalType } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

export interface ProcessingOrder {
    /** Block IDs in topological order */
    blocks: string[];
    /** Whether the graph is valid (no cycles) */
    valid: boolean;
    /** Error message if invalid */
    error?: string;
}

export interface AudioPath {
    /** Block IDs in the path */
    blocks: string[];
    /** Path length */
    length: number;
}

// ============================================================================
// GRAPH ANALYZER
// ============================================================================

export class GraphAnalyzer {
    /**
     * Perform topological sort to determine processing order
     * Only considers audio connections for dependencies - control/gate are modulation sources
     */
    static getProcessingOrder(
        blocks: BlockInstance[],
        connections: Connection[],
        _blockDefs: Map<string, BlockDefinition>
    ): ProcessingOrder {
        // Build adjacency list - ONLY from audio connections
        const adjacency = new Map<string, Set<string>>();
        const inDegree = new Map<string, number>();

        // Initialize
        blocks.forEach(block => {
            adjacency.set(block.id, new Set());
            inDegree.set(block.id, 0);
        });

        // Build graph from AUDIO connections only
        // Control and gate connections are modulation inputs, not data dependencies
        connections
            .filter(conn => conn.type === SignalType.AUDIO)
            .forEach(conn => {
                adjacency.get(conn.sourceBlockId)?.add(conn.targetBlockId);
                inDegree.set(
                    conn.targetBlockId,
                    (inDegree.get(conn.targetBlockId) || 0) + 1
                );
            });

        // Helper to find nodes with 0 in-degree
        const getZeroInDegreeNodes = () => {
            const nodes: string[] = [];
            inDegree.forEach((degree, blockId) => {
                if (degree === 0) nodes.push(blockId);
            });
            return nodes;
        };

        // Kahn's algorithm with cycle breaking strategy
        const result: string[] = [];
        let remainingBlocks = new Set(blocks.map(b => b.id));

        while (remainingBlocks.size > 0) {
            let zeroInDegree = getZeroInDegreeNodes().filter(id => remainingBlocks.has(id));

            if (zeroInDegree.length === 0) {
                // Cycle detected!
                console.warn('Cycle detected in audio graph. Breaking cycle arbitrarily to proceed.');
                // Strategy: Pick the remaining node with the highest out-degree (most dependencies) 
                // or just the first one, and pretend its dependencies are satisfied.
                // This effectively treats the back-edge as a 1-sample delay.
                const firstRemaining = Array.from(remainingBlocks)[0];
                zeroInDegree = [firstRemaining];
            }

            // Process nodes
            for (const current of zeroInDegree) {
                result.push(current);
                remainingBlocks.delete(current);

                // Reduce in-degree of neighbors
                adjacency.get(current)?.forEach(neighbor => {
                    const newDegree = (inDegree.get(neighbor) || 0) - 1;
                    inDegree.set(neighbor, newDegree);
                });
            }
        }

        return { blocks: result, valid: true }; // Always return valid now
    }

    /**
     * Find longest audio path for latency estimation
     */
    static getLongestAudioPath(
        blocks: BlockInstance[],
        connections: Connection[]
    ): AudioPath {
        // Build adjacency list of audio connections only
        const adjacency = new Map<string, Set<string>>();

        blocks.forEach(block => adjacency.set(block.id, new Set()));

        connections
            .filter(conn => conn.type === SignalType.AUDIO)
            .forEach(conn => {
                adjacency.get(conn.sourceBlockId)?.add(conn.targetBlockId);
            });

        // DFS to find longest path
        let longestPath: string[] = [];

        const dfs = (nodeId: string, currentPath: string[]) => {
            currentPath.push(nodeId);

            const neighbors = adjacency.get(nodeId);
            if (!neighbors || neighbors.size === 0) {
                // Leaf node
                if (currentPath.length > longestPath.length) {
                    longestPath = [...currentPath];
                }
            } else {
                neighbors.forEach(neighbor => dfs(neighbor, currentPath));
            }

            currentPath.pop();
        };

        // Start DFS from all source nodes (no incoming audio)
        const hasIncoming = new Set<string>();
        connections
            .filter(c => c.type === SignalType.AUDIO)
            .forEach(c => hasIncoming.add(c.targetBlockId));

        blocks.forEach(block => {
            if (!hasIncoming.has(block.id)) {
                dfs(block.id, []);
            }
        });

        return { blocks: longestPath, length: longestPath.length };
    }

    /**
     * Analyze CV routing to determine parameter modulation
     */
    static getCVRoutings(
        connections: Connection[],
        _blockDefs: Map<string, BlockDefinition>
    ): Map<string, Array<{ source: string; target: string; parameter: string }>> {
        const routings = new Map<string, Array<{ source: string; target: string; parameter: string }>>();

        connections
            .filter(conn => conn.type === SignalType.CV)
            .forEach(conn => {
                const blockId = conn.targetBlockId;
                if (!routings.has(blockId)) {
                    routings.set(blockId, []);
                }

                routings.get(blockId)!.push({
                    source: conn.sourceBlockId,
                    target: conn.targetBlockId,
                    parameter: conn.targetPortId, // Port ID maps to parameter
                });
            });

        return routings;
    }
}
