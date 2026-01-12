/**
 * Inspector Panel Component
 * Displays and edits parameters for selected DSP blocks
 * Implements the comprehensive inspector view from the design grammar
 */

import React, { useMemo, useCallback, Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, Plug, Settings2, Activity, Zap, AlertTriangle } from 'lucide-react';
import * as Icons from 'lucide-react';

import { cn } from '@/lib/utils';
import { usePatchStore, useUIStore } from '@/stores';
import { BlockRegistry } from '@/core/blocks/BlockRegistry';
import {
  ParameterType,
  ParameterCurve,
  PortDirection,
  SignalType,
} from '@/types';
import ParameterDial from './ParameterDial';
import ParameterSelect from './ParameterSelect';
import ParameterToggle from './ParameterToggle';

// ============================================================================
// ERROR BOUNDARY
// ============================================================================

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class InspectorErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Inspector render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
          <h3 className="text-lg font-medium text-text-secondary mb-2">
            Render Error
          </h3>
          <p className="text-sm text-text-tertiary mb-4">
            Unable to display block details.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-3 py-1.5 rounded bg-surface-tertiary text-text-primary text-sm hover:bg-surface-tertiary/80"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// SECTION COMPONENTS
// ============================================================================

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

const Section: React.FC<SectionProps> = ({
  title,
  icon,
  children,
  collapsible = false,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => collapsible && setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 w-full px-4 py-3',
          'text-sm font-medium text-text-primary',
          'hover:bg-surface-tertiary/50 transition-colors',
          !collapsible && 'cursor-default hover:bg-transparent'
        )}
      >
        <span className="text-text-secondary">{icon}</span>
        <span className="flex-1 text-left">{title}</span>
        {collapsible && (
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Icons.ChevronDown className="w-4 h-4 text-text-tertiary" />
          </motion.span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// PORT STATUS DISPLAY
// ============================================================================

interface PortStatusProps {
  displayName: string;
  signalType: SignalType;
  isConnected: boolean;
  connectionTarget?: string;
}

const PortStatus: React.FC<PortStatusProps> = ({
  displayName,
  signalType,
  isConnected,
  connectionTarget,
}) => {
  const signalColors = {
    [SignalType.AUDIO]: 'bg-audio-primary',
    [SignalType.CV]: 'bg-cv-primary',
    [SignalType.TRIGGER]: 'bg-trigger-primary',
  };

  const signalLabels = {
    [SignalType.AUDIO]: 'Audio',
    [SignalType.CV]: 'CV',
    [SignalType.TRIGGER]: 'Trigger',
  };

  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'w-2 h-2 rounded-full',
            signalColors[signalType],
            isConnected && 'ring-2 ring-white/30'
          )}
        />
        <span className="text-sm text-text-primary">{displayName}</span>
        <span className="text-xs text-text-tertiary">({signalLabels[signalType]})</span>
      </div>
      <div className="flex items-center gap-1">
        {isConnected ? (
          <span className="text-xs text-text-secondary truncate max-w-24">
            → {connectionTarget || 'Connected'}
          </span>
        ) : (
          <span className="text-xs text-text-tertiary">—</span>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// INSPECTOR COMPONENT
// ============================================================================

const Inspector: React.FC = () => {
  // Store state
  const inspectedBlockId = useUIStore((state) => state.inspectedBlockId);
  const inspectBlock = useUIStore((state) => state.inspectBlock);
  const panels = useUIStore((state) => state.panels);

  const blocks = usePatchStore((state) => state.blocks);
  const connections = usePatchStore((state) => state.connections);
  const updateBlockParameter = usePatchStore((state) => state.updateBlockParameter);
  const setBlockLabel = usePatchStore((state) => state.setBlockLabel);

  // Get inspected block
  const block = useMemo(
    () => blocks.find((b) => b.id === inspectedBlockId),
    [blocks, inspectedBlockId]
  );

  // Get block definition
  const definition = useMemo(
    () => (block ? BlockRegistry.get(block.definitionId) : null),
    [block]
  );

  // Get connections for this block
  const blockConnections = useMemo(() => {
    if (!block) return { inputs: [], outputs: [] };

    const inputs = connections.filter((c) => c.targetBlockId === block.id);
    const outputs = connections.filter((c) => c.sourceBlockId === block.id);

    return { inputs, outputs };
  }, [block, connections]);

  // Handle parameter change
  const handleParameterChange = useCallback(
    (parameterId: string, value: number | boolean | string) => {
      if (!inspectedBlockId) return;
      updateBlockParameter(inspectedBlockId, parameterId, value);
    },
    [inspectedBlockId, updateBlockParameter]
  );

  // Handle close
  const handleClose = useCallback(() => {
    inspectBlock(null);
  }, [inspectBlock]);

  // Get icon component
  const IconComponent = useMemo(() => {
    if (!definition?.icon) return Activity;
    // Type assertion for lucide-react icon lookup
    return (Icons as any)[definition.icon] || Activity;
  }, [definition?.icon]);

  // Group parameters by group
  const parameterGroups = useMemo(() => {
    if (!definition?.parameters) return new Map();

    const groups = new Map<string, typeof definition.parameters>();

    for (const param of definition.parameters) {
      const group = param.group || 'Main';
      const existing = groups.get(group) || [];
      groups.set(group, [...existing, param]);
    }

    return groups;
  }, [definition]);

  if (!panels.inspector?.visible) return null;

  return (
    <div
      className={cn(
        'w-full h-full border-l border-border bg-surface-secondary',
        'flex flex-col overflow-hidden'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-primary">
        <h2 className="font-semibold text-text-primary">Inspector</h2>
        <button
          onClick={handleClose}
          className="p-1 rounded hover:bg-surface-tertiary text-text-tertiary hover:text-text-primary transition-colors"
          aria-label="Close inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {block && definition ? (
          <>
            {/* Module Identity */}
            <Section
              title="Module"
              icon={<IconComponent className="w-4 h-4" />}
            >
              <div className="space-y-3">
                {/* Name/Label Input */}
                <div>
                  <label className="text-xs text-text-tertiary mb-1 block">Label</label>
                  <input
                    type="text"
                    value={block.label || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBlockLabel(block.id, e.target.value)}
                    placeholder={definition.displayName}
                    className={cn(
                      'w-full px-3 py-1.5 rounded bg-surface-primary border border-border',
                      'text-sm text-text-primary placeholder-text-tertiary',
                      'focus:outline-none focus:ring-2 focus:ring-audio-primary/50'
                    )}
                  />
                </div>

                {/* Class Reference */}
                <div>
                  <label className="text-xs text-text-tertiary mb-1 block">DaisySP Class</label>
                  <code className="text-xs font-mono text-audio-primary bg-surface-primary px-2 py-1 rounded block">
                    {definition.className}
                  </code>
                </div>

                {/* Category */}
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <span className="px-2 py-0.5 rounded bg-surface-tertiary">
                    {definition.category}
                  </span>
                </div>
              </div>
            </Section>

            {/* Parameters */}
            {Array.from(parameterGroups.entries()).map(([group, params]) => (
              <Section
                key={group}
                title={group}
                icon={<Settings2 className="w-4 h-4" />}
                collapsible
              >
                <div className="space-y-4">
                  {params.map((param: typeof params[0]) => {
                    // Get value, defaulting to parameter's default if not set
                    const value = block.parameterValues[param.id] ?? param.defaultValue;

                    // Render appropriate control based on type
                    switch (param.type) {
                      case ParameterType.FLOAT:
                      case ParameterType.INT:
                        return (
                          <div key={param.id}>
                            <div className="flex items-start gap-2">
                              <div className="flex-1">
                                <ParameterDial
                                  id={param.id}
                                  label={param.displayName}
                                  value={value as number}
                                  min={param.range?.min ?? 0}
                                  max={param.range?.max ?? 1}
                                  step={param.range?.step ?? 0.01}
                                  curve={param.range?.curve ?? ParameterCurve.LINEAR}
                                  unit={param.unit}
                                  cvModulatable={param.cvModulatable}
                                  onChange={(v) => handleParameterChange(param.id, v)}
                                />
                              </div>
                              {param.cvModulatable && (
                                <label
                                  className="flex items-center gap-1.5 mt-1 cursor-pointer group"
                                  title="Enable CV modulation input"
                                >
                                  <input
                                    type="checkbox"
                                    checked={block.enabledCvPorts?.includes(param.id) ?? false}
                                    onChange={(e) => {
                                      const toggleCvPort = usePatchStore.getState().toggleCvPort;
                                      toggleCvPort(block.id, param.id, e.target.checked);
                                    }}
                                    className="w-3.5 h-3.5 rounded border-border bg-surface-primary accent-cv-primary cursor-pointer"
                                  />
                                  <span className="text-[10px] text-text-tertiary group-hover:text-cv-primary transition-colors">
                                    CV
                                  </span>
                                </label>
                              )}
                            </div>
                            {param.description && (
                              <p className="text-xs text-text-tertiary mt-1">
                                {param.description}
                              </p>
                            )}
                          </div>
                        );

                      case ParameterType.BOOL:
                        return (
                          <div key={param.id}>
                            <ParameterToggle
                              id={param.id}
                              label={param.displayName}
                              value={value as boolean}
                              onChange={(v) => handleParameterChange(param.id, v)}
                            />
                          </div>
                        );

                      case ParameterType.ENUM:
                        return (
                          <div key={param.id}>
                            <ParameterSelect
                              id={param.id}
                              label={param.displayName}
                              value={value as string}
                              options={
                                param.enumValues?.map((e: typeof param.enumValues[0]) => ({
                                  value: String(e.value),
                                  label: e.label,
                                })) || []
                              }
                              onChange={(v: string) => handleParameterChange(param.id, v)}
                            />
                          </div>
                        );

                      default:
                        return null;
                    }
                  })}
                </div>
              </Section>
            ))}

            {/* Ports / Connectivity */}
            <Section
              title="Connectivity"
              icon={<Plug className="w-4 h-4" />}
              collapsible
            >
              {/* Inputs */}
              {definition.ports.some((p) => p.direction === PortDirection.INPUT) && (
                <div className="mb-3">
                  <h4 className="text-xs font-medium text-text-tertiary mb-2 uppercase tracking-wide">
                    Inputs
                  </h4>
                  <div className="space-y-1">
                    {definition.ports
                      .filter((p) => p.direction === PortDirection.INPUT)
                      .map((port) => {
                        const conn = blockConnections.inputs.find(
                          (c) => c.targetPortId === port.id
                        );
                        const sourceBlock = conn
                          ? blocks.find((b) => b.id === conn.sourceBlockId)
                          : null;
                        const sourceDef = sourceBlock
                          ? BlockRegistry.get(sourceBlock.definitionId)
                          : null;

                        return (
                          <PortStatus
                            key={port.id}
                            displayName={port.displayName}
                            signalType={port.signalType}
                            isConnected={!!conn}
                            connectionTarget={
                              sourceDef
                                ? `${sourceBlock?.label || sourceDef.displayName}`
                                : undefined
                            }
                          />
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Outputs */}
              {definition.ports.some((p) => p.direction === PortDirection.OUTPUT) && (
                <div>
                  <h4 className="text-xs font-medium text-text-tertiary mb-2 uppercase tracking-wide">
                    Outputs
                  </h4>
                  <div className="space-y-1">
                    {definition.ports
                      .filter((p) => p.direction === PortDirection.OUTPUT)
                      .map((port) => {
                        const conns = blockConnections.outputs.filter(
                          (c) => c.sourcePortId === port.id
                        );

                        return (
                          <PortStatus
                            key={port.id}
                            displayName={port.displayName}
                            signalType={port.signalType}
                            isConnected={conns.length > 0}
                            connectionTarget={
                              conns.length > 0
                                ? `${conns.length} connection${conns.length > 1 ? 's' : ''}`
                                : undefined
                            }
                          />
                        );
                      })}
                  </div>
                </div>
              )}
            </Section>

            {/* Documentation */}
            {definition.documentation && (
              <Section
                title="Documentation"
                icon={<Info className="w-4 h-4" />}
                collapsible
                defaultOpen={false}
              >
                <div className="text-sm text-text-secondary whitespace-pre-wrap">
                  {definition.documentation}
                </div>
              </Section>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Zap className="w-12 h-12 text-text-tertiary mb-4" />
            <h3 className="text-lg font-medium text-text-secondary mb-2">
              No Block Selected
            </h3>
            <p className="text-sm text-text-tertiary">
              Double-click a block on the canvas to inspect and edit its parameters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Wrap with error boundary
const InspectorWithErrorBoundary: React.FC = () => (
  <InspectorErrorBoundary>
    <Inspector />
  </InspectorErrorBoundary>
);

export default InspectorWithErrorBoundary;
