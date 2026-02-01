/**
 * Block Registry
 * Central registry for all available block definitions
 * Provides lookup, categorization, and instantiation utilities
 */

import { v4 as uuidv4 } from 'uuid';
import {
  BlockDefinition,
  BlockInstance,
  BlockCategory,
  PortDefinition,
  PortDirection,
  Connection,
  ConnectionValidation,
  SignalType,
} from '@/types';
import {
  // Essential 8
  OscillatorBlock,
  MoogLadderBlock,
  AdsrBlock,
  VcaBlock,
  MixerBlock,
  DelayLineBlock,
  ReverbScBlock,
  CompressorBlock,
  // Ported from dvpe: Sources
  Fm2Block,
  ParticleBlock,
  GrainletOscillatorBlock,
  // Ported from dvpe: Filters
  SvfBlock,
  // Ported from dvpe: Modulators
  AdEnvBlock,
  // Ported from dvpe: Effects
  OverdriveBlock,
  // Ported from dvpe: User I/O
  AudioInputBlock,
  AudioOutputBlock,
  GateTriggerInBlock,
  KnobBlock,
  EncoderBlock,
  KeyBlock,
  // Phase 1: Core DSP
  LfoBlock,
  WhiteNoiseBlock,
  ChorusBlock,
  FlangerBlock,
  OnePoleBlock,
  AToneBlock,
  DcBlockBlock,
  LimiterBlock,
  FoldBlock,
  // Phase 2: Math & Utility
  AddBlock,
  MultiplyBlock,
  SubtractBlock,
  DivideBlock,
  GainBlock,
  BypassBlock,
  SampleDelayBlock,
  CvToFreqBlock,
  MuxBlock,
  DemuxBlock,
  LinearVcaBlock,
  // Phase 3: Drums
  HiHatBlock,
  AnalogBassDrumBlock,
  AnalogSnareDrumBlock,
  SynthBassDrumBlock,
  SynthSnareDrumBlock,
  // Phase 3: Physical Modeling & Effects
  DripBlock,
  ModalVoiceBlock,
  StringVoiceBlock,
  WavefolderBlock,
  DustBlock,
  // Phase 4A: Advanced Effects
  DecimatorBlock,
  PhaserBlock,
  TremoloBlock,
  AutowahBlock,
  ResonatorBlock,
  PluckBlock,
  CrossFadeBlock,
  SampleRateReducerBlock,
  // Phase 4B: Inline Utilities
  PanBlock,
  BalanceBlock,
  SoftClipBlock,
  HardClipBlock,
  RectifierBlock,
  SlewBlock,
  SmoothBlock,
  GateBlock,
  // Phase 4C: Complex Blocks
  BitcrushBlock,
  DistortionBlock,
  StereoMixerBlock,
  PitchShifterBlock,
  // Phase 5: Hardware I/O
  MidiNoteBlock,
  MidiCCBlock,
  CVInputBlock,
  CVOutputBlock,
  GateOutputBlock,
  LEDOutputBlock,
  // Phase 12: New Features
  SliderBlock,
  SwitchBlock,
  AbsBlock,
  ExpBlock,
  Pow2Block,
  DcSourceBlock,
  MetroBlock,
  StepSequencerBlock,
  // DAFX Integration: Phase 1
  TubeBlock,
  WahWahBlock,
  ToneStackBlock,
  LowShelvingBlock,
  HighShelvingBlock,
  PeakFilterBlock,
  NoiseGateBlock,
  // DAFX Integration: Phase 2
  VibratoBlock,
  RingModulatorBlock,
  FdnReverbBlock,
  StereoPanBlock,
  // DAFX Integration: Phase 3
  UniversalCombBlock,
  LpIirCombBlock,
  PhaseVocoderPitchBlock,
  // DAFX Integration: Phase 4
  CompressorExpanderBlock,
  SolaTimeStretchBlock,
  CrosstalkCancellerBlock,
  RobotizationBlock,
  WhisperizationBlock,
  YinPitchBlock,
  // Phase 12+: Arpeggiator
  ArpeggiatorBlock,
  // Synthesis Blocks (DaisySP Gap Fill)
  FormantOscillatorBlock,
  VosimOscillatorBlock,
  VariableShapeOscillatorBlock,
  HarmonicOscillatorBlock,
  OscillatorBankBlock,
  VariableSawOscillatorBlock,
  ZOscillatorBlock,
  // Remaining DaisySP Blocks
  PhasorBlock,
  SampleHoldBlock,
  ClockedNoiseBlock,
  LooperBlock,

  // Phase 13.1: Utility Blocks
  ModuloBlock, SignBlock, MinBlock, MaxBlock, ClampBlock, NegateBlock,
  PowBlock, SqrtBlock, ReciprocalBlock, LogBlock,
  EqualsBlock, NotEqualsBlock, GreaterBlock, LessBlock,
  LogicAndBlock, LogicOrBlock, LogicNotBlock, LogicXorBlock, SelectBlock,
  ScaleBlock, OffsetBlock, RangeMapBlock, QuantizeBlock,
  DerivativeBlock, IntegralBlock, ToggleBlock, CounterBlock,
  SRLatchBlock, DLatchBlock, EdgeRiseBlock, EdgeFallBlock, SchmittTriggerBlock, RingBufferBlock,
  SinBlock, CosBlock, TanBlock, Atan2Block, LerpBlock,
  DbToLinearBlock, LinearToDbBlock, FreqToMidiBlock, MidiToFreqBlock, CentsToRatioBlock,
  EnvelopeFollowerBlock,
  ZeroCrossingBlock, WavetableReadBlock, WavetableWriteBlock,
  MidSideEncodeBlock, MidSideDecodeBlock, GateLengthBlock,
  SplitterBlock, MergerBlock,
  WindowHannBlock, WindowHammingBlock, WindowBlackmanBlock, OverlapAddBlock,

} from './definitions';

// ============================================================================
// REGISTRY STORAGE
// ============================================================================

/**
 * Map of block definition ID to definition
 */
const blockDefinitions = new Map<string, BlockDefinition>();

/**
 * Register all blocks (Essential 8 + 12 ported + 9 Phase 1 + 11 Phase 2 + 10 Phase 3 + 20 Phase 4 + 6 Phase 5 + 7 Synthesis + 4 Remaining = 99 total)
 */
function registerAllBlocks(): void {
  const allBlocks: BlockDefinition[] = [
    // Essential 8
    OscillatorBlock,
    MoogLadderBlock,
    AdsrBlock,
    VcaBlock,
    MixerBlock,
    DelayLineBlock,
    ReverbScBlock,
    CompressorBlock,
    // Ported Sources
    Fm2Block,
    ParticleBlock,
    GrainletOscillatorBlock,
    // Ported Filters
    SvfBlock,
    // Ported Modulators
    AdEnvBlock,
    // Ported Effects
    OverdriveBlock,
    // Ported User I/O
    AudioInputBlock,
    AudioOutputBlock,
    GateTriggerInBlock,
    KnobBlock,
    EncoderBlock,
    KeyBlock,
    // Phase 1: Core DSP
    LfoBlock,
    WhiteNoiseBlock,
    ChorusBlock,
    FlangerBlock,
    OnePoleBlock,
    AToneBlock,
    DcBlockBlock,
    LimiterBlock,
    FoldBlock,
    // Phase 2: Math & Utility
    AddBlock,
    MultiplyBlock,
    SubtractBlock,
    DivideBlock,
    GainBlock,
    BypassBlock,
    SampleDelayBlock,
    CvToFreqBlock,
    MuxBlock,
    DemuxBlock,
    LinearVcaBlock,
    // Phase 3: Drums
    HiHatBlock,
    AnalogBassDrumBlock,
    AnalogSnareDrumBlock,
    SynthBassDrumBlock,
    SynthSnareDrumBlock,
    // Phase 3: Physical Modeling & Effects
    DripBlock,
    ModalVoiceBlock,
    StringVoiceBlock,
    WavefolderBlock,
    DustBlock,
    // Phase 4A: Advanced Effects
    DecimatorBlock,
    PhaserBlock,
    TremoloBlock,
    AutowahBlock,
    ResonatorBlock,
    PluckBlock,
    CrossFadeBlock,
    SampleRateReducerBlock,
    // Phase 4B: Inline Utilities
    PanBlock,
    BalanceBlock,
    SoftClipBlock,
    HardClipBlock,
    RectifierBlock,
    SlewBlock,
    SmoothBlock,
    GateBlock,
    // Phase 4C: Complex Blocks
    BitcrushBlock,
    DistortionBlock,
    StereoMixerBlock,
    PitchShifterBlock,
    // Phase 5: Hardware I/O
    MidiNoteBlock,
    MidiCCBlock,
    CVInputBlock,
    CVOutputBlock,
    GateOutputBlock,
    LEDOutputBlock,
    // Phase 12: New Features
    SliderBlock,
    SwitchBlock,
    AbsBlock,
    ExpBlock,
    Pow2Block,
    Pow2Block,
    DcSourceBlock,
    MetroBlock,
    StepSequencerBlock,
    // DAFX Integration: Phase 1
    TubeBlock,
    WahWahBlock,
    ToneStackBlock,
    LowShelvingBlock,
    HighShelvingBlock,
    PeakFilterBlock,
    NoiseGateBlock,
    // DAFX Integration: Phase 2
    VibratoBlock,
    RingModulatorBlock,
    FdnReverbBlock,
    StereoPanBlock,
    // DAFX Integration: Phase 3
    UniversalCombBlock,
    LpIirCombBlock,
    PhaseVocoderPitchBlock,
    // DAFX Integration: Phase 4
    CompressorExpanderBlock,
    SolaTimeStretchBlock,
    CrosstalkCancellerBlock,
    RobotizationBlock,
    WhisperizationBlock,
    YinPitchBlock,
    EnvelopeFollowerBlock,
    // Phase 12+: Arpeggiator
    ArpeggiatorBlock,
    // Synthesis Blocks (DaisySP Gap Fill)
    FormantOscillatorBlock,
    VosimOscillatorBlock,
    VariableShapeOscillatorBlock,
    HarmonicOscillatorBlock,
    OscillatorBankBlock,
    VariableSawOscillatorBlock,
    ZOscillatorBlock,
    // Remaining DaisySP Blocks
    PhasorBlock,
    SampleHoldBlock,
    ClockedNoiseBlock,
    LooperBlock,

    // Phase 13.1: Utility Blocks
    ModuloBlock, SignBlock, MinBlock, MaxBlock, ClampBlock, NegateBlock,
    PowBlock, SqrtBlock, ReciprocalBlock, LogBlock,
    EqualsBlock, NotEqualsBlock, GreaterBlock, LessBlock,
    LogicAndBlock, LogicOrBlock, LogicNotBlock, LogicXorBlock, SelectBlock,
    ScaleBlock, OffsetBlock, RangeMapBlock, QuantizeBlock,
    DerivativeBlock, IntegralBlock, ToggleBlock, CounterBlock,
    SRLatchBlock, DLatchBlock, EdgeRiseBlock, EdgeFallBlock, SchmittTriggerBlock, RingBufferBlock,
    SinBlock, CosBlock, TanBlock, Atan2Block, LerpBlock,
    DbToLinearBlock, LinearToDbBlock, FreqToMidiBlock, MidiToFreqBlock, CentsToRatioBlock,
    EnvelopeFollowerBlock,
    ZeroCrossingBlock, WavetableReadBlock, WavetableWriteBlock,
    MidSideEncodeBlock, MidSideDecodeBlock, GateLengthBlock,
    SplitterBlock, MergerBlock,
    WindowHannBlock, WindowHammingBlock, WindowBlackmanBlock, OverlapAddBlock,
  ];

  for (const block of allBlocks) {
    blockDefinitions.set(block.id, block);
  }
}

// Initialize on module load
registerAllBlocks();

// ============================================================================
// REGISTRY API
// ============================================================================

/**
 * Get a block definition by ID
 */
export function getBlockDefinition(id: string): BlockDefinition | undefined {
  return blockDefinitions.get(id);
}

/**
 * Get all registered block definitions
 */
export function getAllBlockDefinitions(): BlockDefinition[] {
  return Array.from(blockDefinitions.values());
}

/**
 * Get block definitions by category
 */
export function getBlocksByCategory(category: BlockCategory): BlockDefinition[] {
  return getAllBlockDefinitions().filter((block) => block.category === category);
}

/**
 * Get all unique categories that have blocks
 */
export function getAvailableCategories(): BlockCategory[] {
  const categories = new Set<BlockCategory>();
  for (const block of blockDefinitions.values()) {
    categories.add(block.category);
  }
  return Array.from(categories);
}

/**
 * Register a custom block definition
 */
export function registerBlock(definition: BlockDefinition): void {
  if (blockDefinitions.has(definition.id)) {
    console.warn(`Block definition '${definition.id}' already exists. Overwriting.`);
  }
  blockDefinitions.set(definition.id, definition);
}

/**
 * Unregister a block definition
 */
export function unregisterBlock(id: string): boolean {
  return blockDefinitions.delete(id);
}

// ============================================================================
// INSTANCE CREATION
// ============================================================================

/**
 * Create a new block instance from a definition
 */
export function createBlockInstance(
  definitionId: string,
  position: { x: number; y: number } = { x: 0, y: 0 },
  label?: string
): BlockInstance | null {
  const definition = getBlockDefinition(definitionId);
  if (!definition) {
    console.error(`Block definition '${definitionId}' not found`);
    return null;
  }

  // Initialize parameter values from defaults
  const parameterValues: Record<string, number | boolean | string> = {};
  for (const param of definition.parameters) {
    parameterValues[param.id] = param.defaultValue;
  }

  return {
    id: uuidv4(),
    definitionId,
    position,
    parameterValues,
    label,
    selected: false,
  };
}

// ============================================================================
// PORT UTILITIES
// ============================================================================

/**
 * Get a port definition from a block definition
 */
export function getPortDefinition(
  definitionId: string,
  portId: string
): PortDefinition | undefined {
  const definition = getBlockDefinition(definitionId);
  if (!definition) return undefined;
  return definition.ports.find((p) => p.id === portId);
}

/**
 * Get all input ports for a block definition
 */
export function getInputPorts(definitionId: string): PortDefinition[] {
  const definition = getBlockDefinition(definitionId);
  if (!definition) return [];
  return definition.ports.filter((p) => p.direction === PortDirection.INPUT);
}

/**
 * Get all output ports for a block definition
 */
export function getOutputPorts(definitionId: string): PortDefinition[] {
  const definition = getBlockDefinition(definitionId);
  if (!definition) return [];
  return definition.ports.filter((p) => p.direction === PortDirection.OUTPUT);
}

// ============================================================================
// CONNECTION VALIDATION
// ============================================================================

/**
 * Validate a potential connection between two ports
 */
export function validateConnection(
  sourceBlockDefId: string,
  sourcePortId: string,
  targetBlockDefId: string,
  targetPortId: string
): ConnectionValidation {
  const sourcePort = getPortDefinition(sourceBlockDefId, sourcePortId);
  const targetPort = getPortDefinition(targetBlockDefId, targetPortId);

  // Check ports exist
  if (!sourcePort) {
    return { valid: false, error: `Source port '${sourcePortId}' not found` };
  }
  if (!targetPort) {
    return { valid: false, error: `Target port '${targetPortId}' not found` };
  }

  // Check directions
  if (sourcePort.direction !== PortDirection.OUTPUT) {
    return { valid: false, error: 'Source must be an output port' };
  }
  if (targetPort.direction !== PortDirection.INPUT) {
    return { valid: false, error: 'Target must be an input port' };
  }

  // Check signal type compatibility
  const sourceType = sourcePort.signalType;
  const targetType = targetPort.signalType;

  // Exact match is always valid
  if (sourceType === targetType) {
    return { valid: true };
  }

  // Audio → CV is valid but suboptimal (might clip)
  if (sourceType === SignalType.AUDIO && targetType === SignalType.CV) {
    return {
      valid: true,
      warning: 'Audio signal may need attenuation for CV input',
    };
  }

  // CV → Audio is valid but suboptimal (DC offset)
  if (sourceType === SignalType.CV && targetType === SignalType.AUDIO) {
    return {
      valid: true,
      warning: 'CV signal may introduce DC offset in audio path',
    };
  }

  // Trigger → CV is valid
  if (sourceType === SignalType.TRIGGER && targetType === SignalType.CV) {
    return { valid: true };
  }

  // Audio/CV → Trigger is not valid
  if (targetType === SignalType.TRIGGER) {
    return {
      valid: false,
      error: 'Cannot connect audio/CV signals to trigger inputs',
    };
  }

  // Trigger → Audio is unusual but allowed
  if (sourceType === SignalType.TRIGGER && targetType === SignalType.AUDIO) {
    return {
      valid: true,
      warning: 'Trigger signal as audio will produce clicks',
    };
  }

  return { valid: true };
}

/**
 * Check if a connection would create a cycle in the graph
 */
export function wouldCreateCycle(
  connections: Connection[],
  blocks: BlockInstance[],
  newSourceBlockId: string,
  newTargetBlockId: string
): boolean {
  // Build adjacency list
  const graph = new Map<string, Set<string>>();

  // Initialize all blocks
  for (const block of blocks) {
    graph.set(block.id, new Set());
  }

  // Add existing edges
  for (const conn of connections) {
    const neighbors = graph.get(conn.sourceBlockId);
    if (neighbors) {
      neighbors.add(conn.targetBlockId);
    }
  }

  // Add proposed edge
  const sourceNeighbors = graph.get(newSourceBlockId);
  if (sourceNeighbors) {
    sourceNeighbors.add(newTargetBlockId);
  }

  // DFS to detect cycle
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycle(node: string): boolean {
    visited.add(node);
    recursionStack.add(node);

    const neighbors = graph.get(node) || new Set();
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycle(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }

    recursionStack.delete(node);
    return false;
  }

  for (const block of blocks) {
    if (!visited.has(block.id)) {
      if (hasCycle(block.id)) return true;
    }
  }

  return false;
}

// ============================================================================
// SEARCH
// ============================================================================

/**
 * Search for blocks by name or description
 */
export function searchBlocks(query: string): BlockDefinition[] {
  const lowerQuery = query.toLowerCase();
  return getAllBlockDefinitions().filter(
    (block) =>
      block.displayName.toLowerCase().includes(lowerQuery) ||
      block.description.toLowerCase().includes(lowerQuery) ||
      block.className.toLowerCase().includes(lowerQuery)
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export const BlockRegistry = {
  get: getBlockDefinition,
  getAll: getAllBlockDefinitions,
  getByCategory: getBlocksByCategory,
  getCategories: getAvailableCategories,
  register: registerBlock,
  unregister: unregisterBlock,
  has: (id: string) => blockDefinitions.has(id),
  createInstance: createBlockInstance,
  getPort: getPortDefinition,
  getInputPorts,
  getOutputPorts,
  validateConnection,
  wouldCreateCycle,
  search: searchBlocks,
};

export default BlockRegistry;
