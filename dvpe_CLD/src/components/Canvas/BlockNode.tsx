/**
 * BlockNode Component
 * Custom React Flow node for DSP blocks
 * Implements color-coded port system and visual design grammar
 */

import React, { memo, useMemo, useCallback } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore, usePatchStore } from '@/stores';
import { BlockRegistry } from '@/core/blocks/BlockRegistry';
import {
  BlockInstance,
  PortDirection,
  SignalType,
  BlockColorScheme,
  BlockCategory,
} from '@/types';

// ============================================================================
// TYPES
// ============================================================================

export interface BlockNodeData extends Record<string, unknown> {
  instance: BlockInstance;
}

// Type for React Flow node with our data
type BlockNode = Node<BlockNodeData>;
type BlockNodeProps = NodeProps<BlockNode>;

// ============================================================================
// COLOR UTILITIES
// ============================================================================

const getSignalTypeColor = (signalType: SignalType): string => {
  switch (signalType) {
    case SignalType.AUDIO:
      return 'bg-audio-primary'; // cyan
    case SignalType.CV:
      return 'bg-cv-primary'; // yellow
    case SignalType.TRIGGER:
      return 'bg-trigger-primary'; // orange
    default:
      return 'bg-gray-400';
  }
};

const getSignalTypeRing = (signalType: SignalType): string => {
  switch (signalType) {
    case SignalType.AUDIO:
      return 'ring-audio-primary/50';
    case SignalType.CV:
      return 'ring-cv-primary/50';
    case SignalType.TRIGGER:
      return 'ring-trigger-primary/50';
    default:
      return 'ring-gray-400/50';
  }
};

const getBlockSchemeStyles = (scheme: BlockColorScheme, selected: boolean) => {
  const base = selected ? 'ring-2 ring-white/80' : '';

  switch (scheme) {
    case BlockColorScheme.AUDIO:
      // Deeper blue-cyan with neon glow
      return cn(base, 'bg-[#0a2a3a] border-audio-primary/50 shadow-[0_0_15px_rgba(34,211,238,0.3)]');
    case BlockColorScheme.CONTROL:
      // CV yellow with subtle glow
      return cn(base, 'bg-cv-block-bg border-cv-primary/50 shadow-[0_0_15px_rgba(250,204,21,0.25)]');
    case BlockColorScheme.USER:
      // User green with glow
      return cn(base, 'bg-user-block-bg border-user-primary/50 shadow-[0_0_15px_rgba(74,222,128,0.25)]');
    case BlockColorScheme.LOGIC:
      // Logic violet with glow
      return cn(base, 'bg-logic-block-bg border-logic-primary/50 shadow-[0_0_15px_rgba(167,139,250,0.25)]');
    default:
      return cn(base, 'bg-surface-secondary border-border');
  }
};

const getHeaderSchemeStyles = (scheme: BlockColorScheme): string => {
  switch (scheme) {
    case BlockColorScheme.AUDIO:
      return 'bg-audio-primary/20 text-audio-primary';
    case BlockColorScheme.CONTROL:
      return 'bg-cv-primary/20 text-cv-primary';
    case BlockColorScheme.USER:
      return 'bg-user-primary/20 text-user-primary';
    case BlockColorScheme.LOGIC:
      return 'bg-logic-primary/20 text-logic-primary';
    default:
      return 'bg-surface-tertiary text-text-primary';
  }
};

// ============================================================================
// PORT COMPONENT
// ============================================================================

interface PortHandleProps {
  portId: string;
  displayName: string;
  signalType: SignalType;
  direction: PortDirection;
  isConnected: boolean;
}

const PortHandle: React.FC<PortHandleProps> = memo(
  ({ portId, displayName, signalType, direction, isConnected }) => {
    const position = direction === PortDirection.INPUT ? Position.Left : Position.Right;
    const handleType = direction === PortDirection.INPUT ? 'target' : 'source';

    return (
      <div
        className={cn(
          'relative flex items-center gap-1.5 py-1',
          direction === PortDirection.INPUT ? 'flex-row' : 'flex-row-reverse'
        )}
      >
        <Handle
          type={handleType}
          position={position}
          id={portId}
          className={cn(
            'w-3 h-3 rounded-full border-2 border-surface-primary',
            getSignalTypeColor(signalType),
            isConnected && 'ring-2',
            isConnected && getSignalTypeRing(signalType),
            '!transform-none', // Override React Flow's default transform
            direction === PortDirection.INPUT ? '-left-1.5' : '-right-1.5'
          )}
          style={{
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        />
        <span
          className={cn(
            'text-xs font-mono text-text-secondary',
            direction === PortDirection.OUTPUT && 'text-right'
          )}
        >
          {displayName}
        </span>
      </div>
    );
  }
);

PortHandle.displayName = 'PortHandle';

// ============================================================================
// BLOCK NODE COMPONENT
// ============================================================================

const BlockNode: React.FC<BlockNodeProps> = ({ id, data, selected }) => {
  // Type-safe data access
  const nodeData = data as BlockNodeData;
  const { instance } = nodeData;
  const inspectBlock = useUIStore((state) => state.inspectBlock);
  const connections = usePatchStore((state) => state.connections);

  // Get block definition
  const definition = useMemo(
    () => BlockRegistry.get(instance.definitionId),
    [instance.definitionId]
  );

  // Get connected port IDs for this block
  const connectedPorts = useMemo(() => {
    const ports = new Set<string>();
    for (const conn of connections) {
      if (conn.sourceBlockId === id) {
        ports.add(conn.sourcePortId);
      }
      if (conn.targetBlockId === id) {
        ports.add(conn.targetPortId);
      }
    }
    return ports;
  }, [connections, id]);

  // Separate input and output ports, filtering CV ports based on enabledCvPorts
  // AND filtering dynamic ports based on inputCount/outputCount
  const { inputPorts, outputPorts } = useMemo(() => {
    if (!definition) return { inputPorts: [], outputPorts: [] };

    // Get dynamic counts if they exist
    const inputCountParam = instance.parameterValues['inputCount'];
    const outputCountParam = instance.parameterValues['outputCount'];

    const inputCount = inputCountParam ? Number(inputCountParam) : undefined;
    const outputCount = outputCountParam ? Number(outputCountParam) : undefined;

    // Filter input ports
    const inputs = definition.ports.filter((p) => {
      if (p.direction !== PortDirection.INPUT) return false;

      // 1. Check CV modulation ports
      if (p.id.endsWith('_cv') && p.signalType === SignalType.CV) {
        // Exception for MUX sel_cv which is static
        if (p.id === 'sel_cv') return true;

        // Extract the parameter ID (e.g., 'frequency_cv' -> 'frequency')
        const paramId = p.id.replace(/_cv$/, '');
        // Only show if explicitly enabled
        return instance.enabledCvPorts?.includes(paramId) ?? false;
      }

      // 2. Check dynamic input count (ADD, MIXER, MUX)
      if (inputCount !== undefined) {
        // Keep special ports (like sel_cv, or non-numbered inputs)
        // MUX: sel_cv is already handled or falls through
        if (p.id === 'sel_cv') return true;

        // Try to extract number from port ID
        const match = p.id.match(/(\d+)$/);
        if (match) {
          const portNum = parseInt(match[1], 10);

          // MUX uses 0-based indexing (in0, in1...) -> show if portNum < inputCount
          if (definition.id === 'mux') {
            return portNum < inputCount;
          }

          // ADD and MIXER use 1-based indexing (in1, in2... or in_1, in_2...) -> show if portNum <= inputCount
          // ADD: in1..in4
          // MIXER: in_1..in_4
          return portNum <= inputCount;
        }
      }

      return true;
    });

    // Filter output ports
    const outputs = definition.ports.filter((p) => {
      if (p.direction !== PortDirection.OUTPUT) return false;

      // Check dynamic output count (DEMUX)
      if (outputCount !== undefined) {
        // Demo uses 0-based indexing (out0, out1...) -> show if portNum < outputCount
        const match = p.id.match(/(\d+)$/);
        if (match) {
          const portNum = parseInt(match[1], 10);
          return portNum < outputCount;
        }
      }

      return true;
    });

    return {
      inputPorts: inputs,
      outputPorts: outputs,
    };
  }, [definition, instance.enabledCvPorts, instance.parameterValues]);

  // Get icon component
  const IconComponent = useMemo(() => {
    if (!definition?.icon) return null;
    // Type assertion for lucide-react icon lookup
    return (Icons as any)[definition.icon] as React.ComponentType<{ className?: string }> | undefined;
  }, [definition?.icon]);

  // Handle double-click to inspect
  const handleDoubleClick = useCallback(() => {
    inspectBlock(id as string);
  }, [id, inspectBlock]);

  if (!definition) {
    return (
      <div className="bg-red-500/20 border border-red-500 rounded p-2 text-red-400 text-sm">
        Unknown block: {instance.definitionId}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'min-w-[140px] rounded-lg border shadow-lg backdrop-blur-sm',
        getBlockSchemeStyles(definition.colorScheme, Boolean(selected))
      )}
      onDoubleClick={handleDoubleClick}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-t-lg border-b border-inherit',
          getHeaderSchemeStyles(definition.colorScheme)
        )}
      >
        {IconComponent && <IconComponent className="w-4 h-4" />}
        <span className="font-semibold text-sm tracking-wide flex-1">
          {instance.label || definition.displayName}
        </span>
        {/* Hardware mapping badge for User I/O blocks */}
        {definition.category === BlockCategory.USER_IO && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/30 text-text-secondary">
            {definition.id === 'knob' && `K${instance.parameterValues['channel'] || 0}`}
            {definition.id === 'encoder' && `ENC`}
            {definition.id === 'key' && `KEY ${instance.parameterValues['note'] || 60}`}
            {definition.id === 'gate_trigger_in' && `GATE`}
            {definition.id === 'audio_input' && `IN`}
            {definition.id === 'audio_output' && `OUT`}
          </span>
        )}
      </div>

      {/* Ports Container */}
      <div className="flex justify-between p-2 gap-4">
        {/* Input Ports (Left) */}
        <div className="flex flex-col gap-0.5">
          {inputPorts.map((port) => (
            <PortHandle
              key={port.id}
              portId={port.id}
              displayName={port.displayName}
              signalType={port.signalType}
              direction={PortDirection.INPUT}
              isConnected={connectedPorts.has(port.id)}
            />
          ))}
        </div>

        {/* Output Ports (Right) */}
        <div className="flex flex-col gap-0.5">
          {outputPorts.map((port) => (
            <PortHandle
              key={port.id}
              portId={port.id}
              displayName={port.displayName}
              signalType={port.signalType}
              direction={PortDirection.OUTPUT}
              isConnected={connectedPorts.has(port.id)}
            />
          ))}
        </div>
      </div>

      {/* Mini parameter display for key parameters */}
      {definition.parameters.length > 0 && (
        <div className="px-3 py-1.5 border-t border-inherit bg-black/20 rounded-b-lg">
          <div className="flex items-center gap-2 text-xs text-text-tertiary font-mono">
            {definition.parameters.slice(0, 2).map((param) => {
              const value = instance.parameterValues[param.id];
              const displayValue =
                typeof value === 'number'
                  ? value.toFixed(param.range?.step && param.range.step < 1 ? 2 : 0)
                  : String(value);

              return (
                <span key={param.id} className="truncate">
                  {param.displayName.slice(0, 4)}: {displayValue}
                  {param.unit ? param.unit : ''}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default memo(BlockNode);
