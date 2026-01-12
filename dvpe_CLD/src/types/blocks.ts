/**
 * DVPE Block Type Definitions
 * Comprehensive TypeScript interfaces for the DaisySP visual programming environment
 */

// ============================================================================
// ENUMERATIONS
// ============================================================================

/**
 * Signal types for ports - determines wire color and connection validation
 */
export enum SignalType {
  /** Audio signal path (cyan) - processed at sample rate */
  AUDIO = 'audio',
  /** Control voltage (yellow) - modulation signals, typically at control rate */
  CV = 'cv',
  /** Trigger/Gate signals (orange) - boolean/impulse signals */
  TRIGGER = 'trigger',
}

/**
 * Port direction - determines which side of the block the port appears
 */
export enum PortDirection {
  INPUT = 'input',
  OUTPUT = 'output',
}

/**
 * Parameter types for block controls
 */
export enum ParameterType {
  /** Floating point value with range */
  FLOAT = 'float',
  /** Integer value with range */
  INT = 'int',
  /** Boolean toggle */
  BOOL = 'bool',
  /** Enumerated selection (dropdown) */
  ENUM = 'enum',
}

/**
 * Parameter mapping curve for UI controls
 */
export enum ParameterCurve {
  LINEAR = 'linear',
  LOGARITHMIC = 'logarithmic',
  EXPONENTIAL = 'exponential',
}

/**
 * Block categories for library organization
 */
export enum BlockCategory {
  SOURCES = 'Sources',
  FILTERS = 'Filters',
  EFFECTS = 'Effects',
  MODULATORS = 'Modulators',
  DYNAMICS = 'Dynamics',
  USER_IO = 'User I/O',
  UTILITY = 'Utility',
  PHYSICAL_MODELING = 'Physical Modeling',
  DRUMS = 'Drums',
  MATH = 'Math',
}

/**
 * Block color scheme - determines visual appearance
 */
export enum BlockColorScheme {
  /** Audio processing blocks (cyan/blue) */
  AUDIO = 'audio',
  /** Control/modulation blocks (yellow/orange) */
  CONTROL = 'control',
  /** User interaction blocks (green) */
  USER = 'user',
  /** Signal logic/utility blocks (violet) */
  LOGIC = 'logic',
  /** Effects blocks (purple) */
  FX = 'fx',
  /** Filter blocks (blue-green) */
  FILTER = 'filter',
  /** Modulation blocks (orange) */
  MODULATION = 'modulation',
  /** Dynamics blocks (red) */
  DYNAMICS = 'dynamics',
  /** Utility blocks (gray) */
  UTILITY = 'utility',
}

// ============================================================================
// PORT DEFINITIONS
// ============================================================================

/**
 * Definition of a port on a block
 */
export interface PortDefinition {
  /** Unique identifier within the block */
  id: string;
  /** Display name shown in UI */
  displayName: string;
  /** Signal type for connection validation and wire styling */
  signalType: SignalType;
  /** Port direction (input/output) */
  direction: PortDirection;
  /** C++ method name for code generation (e.g., 'Process', 'SetFreq') */
  cppMethod?: string;
  /** C++ parameter name if this is an input to Process() */
  cppParam?: string;
  /** For multi-output blocks (e.g., SVF), the specific output method */
  outputMethod?: string;
  /** Tooltip/description text */
  description?: string;
}

// ============================================================================
// PARAMETER DEFINITIONS
// ============================================================================

/**
 * Definition of a parameter (control) on a block
 */
export interface ParameterDefinition {
  /** Unique identifier within the block */
  id: string;
  /** Display name shown in UI */
  displayName: string;
  /** Parameter data type */
  type: ParameterType;
  /** C++ setter method name (e.g., 'SetFreq') */
  cppSetter: string;
  /** C++ getter method name (optional) */
  cppGetter?: string;
  /** Default value */
  defaultValue: number | boolean | string;
  /** Range for numeric parameters */
  range?: {
    min: number;
    max: number;
    step?: number;
    curve?: ParameterCurve;
  };
  /** Unit label (e.g., 'Hz', 'ms', 'dB') */
  unit?: string;
  /** Enum options for ENUM type parameters */
  enumValues?: Array<{
    label: string;
    value: string | number;
    cppValue?: string;
  }>;
  /** Can this parameter be modulated via CV input? */
  cvModulatable?: boolean;
  /** UI grouping label */
  group?: string;
  /** Tooltip/description text */
  description?: string;
}

// ============================================================================
// BLOCK DEFINITION
// ============================================================================

/**
 * Complete definition of a block type
 * This is the "template" from which block instances are created
 */
export interface BlockDefinition {
  // === Identity ===
  /** Unique identifier for this block type */
  id: string;
  /** DaisySP class name (e.g., 'daisysp::Oscillator') */
  className: string;
  /** Display name shown in UI */
  displayName: string;
  /** Category for library organization */
  category: BlockCategory;

  // === C++ Code Generation ===
  /** Header file to include (e.g., 'daisysp.h') */
  headerFile: string;
  /** C++ namespace (e.g., 'daisysp') */
  namespace?: string;
  /** Initialization method name (e.g., 'Init') */
  initMethod: string;
  /** Parameters for Init() (e.g., ['sample_rate']) */
  initParams: string[];
  /** Main processing method name (e.g., 'Process') */
  processMethod: string;
  /** Return type of Process() */
  processReturnType?: 'float' | 'void' | 'bool';

  // === Configuration ===
  /** Parameter definitions */
  parameters: ParameterDefinition[];
  /** Port definitions */
  ports: PortDefinition[];

  // === Visual ===
  /** Color scheme for block appearance */
  colorScheme: BlockColorScheme;
  /** Lucide icon name */
  icon?: string;

  // === Documentation ===
  /** Short description */
  description: string;
  /** Extended documentation/usage notes */
  documentation?: string;

  // === Code Generation Hints ===
  /** Requires SDRAM allocation (DSY_SDRAM_BSS) */
  requiresSdram?: boolean;
  /** Maximum instance count (for polyphony) */
  maxInstanceCount?: number;
}

// ============================================================================
// BLOCK INSTANCE
// ============================================================================

/**
 * Instance of a block in a patch
 * Contains positional data and current parameter values
 */
export interface BlockInstance {
  /** Unique instance identifier (UUID) */
  id: string;
  /** Reference to the block definition */
  definitionId: string;
  /** Position on canvas */
  position: {
    x: number;
    y: number;
  };
  /** Current parameter values */
  parameterValues: Record<string, number | boolean | string>;
  /** Which CV modulation ports are enabled (parameter IDs) */
  enabledCvPorts?: string[];
  /** User-defined label (optional) */
  label?: string;
  /** Whether this instance is selected */
  selected?: boolean;
}

// ============================================================================
// CONNECTION
// ============================================================================

/**
 * Connection type determines wire appearance and validation
 */
export type ConnectionType = 'audio' | 'cv' | 'trigger';

/**
 * A connection between two ports
 */
export interface Connection {
  /** Unique connection identifier (UUID) */
  id: string;
  /** Source block ID */
  sourceBlockId: string;
  /** Source port ID */
  sourcePortId: string;
  /** Target block ID */
  targetBlockId: string;
  /** Target port ID */
  targetPortId: string;
  /** Connection type (determined from port signal types) */
  type: ConnectionType;
  /** User-defined label/alias for the connection */
  label?: string;
}

/**
 * Validation result for a connection attempt
 */
export interface ConnectionValidation {
  /** Whether the connection is valid */
  valid: boolean;
  /** Error message if invalid */
  error?: string;
  /** Warning message if valid but suboptimal */
  warning?: string;
}

// ============================================================================
// PATCH / PROJECT
// ============================================================================

/**
 * Project metadata
 */
export interface ProjectMetadata {
  /** Project name */
  name: string;
  /** Author name */
  author: string;
  /** Description */
  description?: string;
  /** Creation timestamp (ISO 8601) */
  created: string;
  /** Last modified timestamp (ISO 8601) */
  modified: string;
  /** Schema version */
  version: string;
  /** Target hardware platform */
  targetHardware: 'seed' | 'patch' | 'pod' | 'field' | 'petal' | 'versio';
  /** Audio sample rate */
  sampleRate: number;
  /** Audio block size */
  blockSize: number;
}

/**
 * Complete patch graph
 */
export interface PatchGraph {
  /** Project metadata */
  metadata: ProjectMetadata;
  /** All block instances */
  blocks: BlockInstance[];
  /** All connections */
  connections: Connection[];
}

/**
 * Serialized project format
 */
export interface SerializedProject {
  /** Schema version for migration */
  version: string;
  /** The patch data */
  patch: PatchGraph;
}

// ============================================================================
// UI STATE
// ============================================================================

/**
 * Canvas viewport state
 */
export interface ViewportState {
  /** X offset (pan) */
  x: number;
  /** Y offset (pan) */
  y: number;
  /** Zoom level (1.0 = 100%) */
  zoom: number;
}

/**
 * Selection state
 */
export interface SelectionState {
  /** Selected block IDs */
  blocks: string[];
  /** Selected connection IDs */
  connections: string[];
}

/**
 * Drag state for block movement
 */
export interface DragState {
  /** Is dragging active */
  isDragging: boolean;
  /** Starting positions of dragged blocks */
  startPositions: Record<string, { x: number; y: number }>;
  /** Current mouse position */
  currentPosition: { x: number; y: number };
}

/**
 * Connection creation state (when dragging a wire)
 */
export interface ConnectionDragState {
  /** Is connection creation active */
  isActive: boolean;
  /** Source block ID */
  sourceBlockId: string | null;
  /** Source port ID */
  sourcePortId: string | null;
  /** Current endpoint position */
  endPosition: { x: number; y: number } | null;
}

// ============================================================================
// COMMENT NODE
// ============================================================================

/**
 * Comment node for canvas annotations
 */
export interface CommentNode {
  /** Unique identifier (UUID) */
  id: string;
  /** Comment text content */
  text: string;
  /** Position on canvas */
  position: {
    x: number;
    y: number;
  };
  /** Size of the comment box */
  size: {
    width: number;
    height: number;
  };
  /** Background color (CSS color string) */
  color: string;
}

