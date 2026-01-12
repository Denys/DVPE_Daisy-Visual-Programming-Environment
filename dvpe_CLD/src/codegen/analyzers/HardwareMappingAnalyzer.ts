/**
 * Hardware Mapping Analyzer
 * Maps DVPE blocks to Daisy Field hardware I/O
 * Ported from dvpe with type adaptations for dvpe_CLD
 */

import { BlockInstance, BlockDefinition } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

export interface HardwareMapping {
    /** Maps knob channel numbers to block IDs */
    knobs: Map<number, string>;
    /** Maps key indices to block IDs */
    keys: Map<number, string>;
    /** Maps CV input channel numbers to block IDs */
    cvInputs: Map<number, string>;
    /** Maps gate input channel numbers to block IDs */
    gateInputs: Map<number, string>;
}

// ============================================================================
// HARDWARE MAPPING ANALYZER
// ============================================================================

export class HardwareMappingAnalyzer {
    /**
     * Analyze blocks to determine hardware I/O assignments
     */
    static analyze(
        blocks: BlockInstance[],
        blockDefs: Map<string, BlockDefinition>
    ): HardwareMapping {
        const mapping: HardwareMapping = {
            knobs: new Map(),
            keys: new Map(),
            cvInputs: new Map(),
            gateInputs: new Map(),
        };

        blocks.forEach(block => {
            const def = blockDefs.get(block.definitionId);
            if (!def) return;

            switch (def.id) {
                case 'knob': {
                    const channel = parseInt(block.parameterValues['channel'] as string) || 0;
                    mapping.knobs.set(channel, block.id);
                    break;
                }

                case 'key': {
                    const nextKeyIndex = mapping.keys.size;
                    if (nextKeyIndex < 16) {
                        mapping.keys.set(nextKeyIndex, block.id);
                    }
                    break;
                }

                case 'cv_input':
                case 'gate_trigger_in': {
                    const cvChannel = parseInt(block.parameterValues['channel'] as string) || 0;
                    mapping.cvInputs.set(cvChannel, block.id);
                    break;
                }

                case 'gate_input': {
                    const gateChannel = parseInt(block.parameterValues['channel'] as string) || 0;
                    mapping.gateInputs.set(gateChannel, block.id);
                    break;
                }
            }
        });

        return mapping;
    }

    /**
     * Get Daisy Field hardware limits
     */
    static getDaisyFieldLimits() {
        return {
            knobs: 8,
            keys: 16,
            cvInputs: 2,
            gateInputs: 2,
            cvOutputs: 2,
            audioInputs: 2,
            audioOutputs: 2,
        };
    }
}
