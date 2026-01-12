/**
 * CV Routing Analyzer
 * Analyzes CV (Control Voltage) connections to determine parameter modulation routing
 * Part of Phase 3: Code Generation Engine
 */

import { Connection, BlockDefinition, SignalType } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

export interface CVRoute {
    /** Source block ID providing the CV signal */
    sourceBlockId: string;
    /** Source port ID on the source block */
    sourcePortId: string;
    /** Target block ID receiving the modulation */
    targetBlockId: string;
    /** Target port ID on the target block */
    targetPortId: string;
    /** The parameter being modulated (derived from port ID) */
    targetParameter: string;
}

export interface CVRoutingAnalysis {
    /** All CV routes in the patch */
    routes: CVRoute[];
    /** CV routes grouped by target block ID */
    byTarget: Map<string, CVRoute[]>;
    /** CV routes grouped by source block ID */
    bySource: Map<string, CVRoute[]>;
}

// ============================================================================
// CV ROUTING ANALYZER
// ============================================================================

export class CVRoutingAnalyzer {
    /**
     * Analyze all CV connections in the patch
     * Returns structured routing information for code generation
     */
    static analyze(
        connections: Connection[],
        blockDefs: Map<string, BlockDefinition>
    ): CVRoutingAnalysis {
        const routes: CVRoute[] = [];
        const byTarget = new Map<string, CVRoute[]>();
        const bySource = new Map<string, CVRoute[]>();

        // Filter to CV connections only
        connections
            .filter(conn => conn.type === SignalType.CV)
            .forEach(conn => {
                // Derive the target parameter from port ID
                // Convention: 'freq_cv' -> 'freq', 'cutoff_cv' -> 'cutoff'
                const targetParameter = this.deriveParameterFromPort(
                    conn.targetPortId,
                    conn.targetBlockId,
                    blockDefs
                );

                const route: CVRoute = {
                    sourceBlockId: conn.sourceBlockId,
                    sourcePortId: conn.sourcePortId,
                    targetBlockId: conn.targetBlockId,
                    targetPortId: conn.targetPortId,
                    targetParameter,
                };

                routes.push(route);

                // Group by target
                if (!byTarget.has(conn.targetBlockId)) {
                    byTarget.set(conn.targetBlockId, []);
                }
                byTarget.get(conn.targetBlockId)!.push(route);

                // Group by source
                if (!bySource.has(conn.sourceBlockId)) {
                    bySource.set(conn.sourceBlockId, []);
                }
                bySource.get(conn.sourceBlockId)!.push(route);
            });

        return { routes, byTarget, bySource };
    }

    /**
     * Derive the parameter name from a CV port ID
     * Handles common conventions like 'freq_cv' -> 'freq'
     */
    private static deriveParameterFromPort(
        portId: string,
        blockId: string,
        blockDefs: Map<string, BlockDefinition>
    ): string {
        // Remove common CV suffixes
        let paramId = portId
            .replace(/_cv$/i, '')
            .replace(/_mod$/i, '')
            .replace(/_in$/i, '');

        // Verify the parameter exists in the block definition
        const blockDef = blockDefs.get(blockId);
        if (blockDef) {
            const param = blockDef.parameters.find(p =>
                p.id === paramId ||
                p.id === portId ||
                (p.cvModulatable && p.id === paramId)
            );
            if (param) {
                return param.id;
            }
        }

        // Default: return the derived ID
        return paramId;
    }

    /**
     * Get all CV routes targeting a specific block
     */
    static getRoutesForBlock(
        analysis: CVRoutingAnalysis,
        blockId: string
    ): CVRoute[] {
        return analysis.byTarget.get(blockId) || [];
    }

    /**
     * Check if a parameter on a block has CV modulation
     */
    static hasModulation(
        analysis: CVRoutingAnalysis,
        blockId: string,
        parameterId: string
    ): boolean {
        const routes = analysis.byTarget.get(blockId) || [];
        return routes.some(r => r.targetParameter === parameterId);
    }

    /**
     * Generate C++ modulation code for a parameter
     * Returns code like: baseValue * (1.0f + cvValue * modDepth)
     */
    static generateModulationCode(
        baseValue: number | string,
        cvVariableName: string,
        modulationDepth: number = 1.0
    ): string {
        if (modulationDepth === 1.0) {
            return `${baseValue} * (1.0f + ${cvVariableName})`;
        }
        return `${baseValue} * (1.0f + ${cvVariableName} * ${modulationDepth}f)`;
    }

    /**
     * Generate additive modulation code (for parameters like frequency)
     * Returns code like: baseValue + (cvValue * range)
     */
    static generateAdditiveModulationCode(
        baseValue: number | string,
        cvVariableName: string,
        modulationRange: number
    ): string {
        return `${baseValue} + (${cvVariableName} * ${modulationRange}f)`;
    }
}
