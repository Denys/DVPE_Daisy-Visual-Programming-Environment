/**
 * ConnectionEdge Component
 * Custom React Flow edge with signal-type color coding and animated flow
 */

import React, { memo, useMemo, useState, useRef, useCallback } from 'react';
import {
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  useReactFlow,
  Edge,
} from '@xyflow/react';
import { motion } from 'framer-motion';
import { X, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConnectionType } from '@/types';
import { usePatchStore } from '@/stores';

// ============================================================================
// TYPES
// ============================================================================

export interface ConnectionEdgeData extends Record<string, unknown> {
  type: ConnectionType;
  animated?: boolean;
  label?: string;
}

// ============================================================================
// COLOR CONFIGURATION
// ============================================================================

const getConnectionColors = (type: ConnectionType) => {
  switch (type) {
    case 'audio':
      return {
        stroke: '#22d3ee', // cyan
        glow: 'rgba(34, 211, 238, 0.4)',
        gradient: ['#22d3ee', '#06b6d4'],
      };
    case 'cv':
      return {
        stroke: '#facc15', // yellow
        glow: 'rgba(250, 204, 21, 0.4)',
        gradient: ['#facc15', '#eab308'],
      };
    case 'trigger':
      return {
        stroke: '#fb923c', // orange
        glow: 'rgba(251, 146, 60, 0.4)',
        gradient: ['#fb923c', '#f97316'],
      };
    default:
      return {
        stroke: '#6b7280', // gray
        glow: 'rgba(107, 114, 128, 0.4)',
        gradient: ['#6b7280', '#4b5563'],
      };
  }
};

// ============================================================================
// ANIMATED DOT SVG PATTERN
// ============================================================================

const FlowingDots: React.FC<{
  id: string;
  color: string;
  animate: boolean;
}> = memo(({ id, color, animate }) => (
  <defs>
    <marker
      id={`dot-${id}`}
      viewBox="0 0 10 10"
      refX="5"
      refY="5"
      markerWidth="4"
      markerHeight="4"
    >
      <circle cx="5" cy="5" r="3" fill={color} />
    </marker>
    {animate && (
      <pattern
        id={`flow-${id}`}
        patternUnits="userSpaceOnUse"
        width="20"
        height="20"
      >
        <circle r="2" fill={color}>
          <animateMotion dur="1s" repeatCount="indefinite">
            <mpath href={`#path-${id}`} />
          </animateMotion>
        </circle>
      </pattern>
    )}
  </defs>
));

FlowingDots.displayName = 'FlowingDots';

// ============================================================================
// CONNECTION EDGE COMPONENT
// ============================================================================

// Type for React Flow edge with our data
type ConnectionEdgeType = Edge<ConnectionEdgeData>;

const ConnectionEdge: React.FC<EdgeProps<ConnectionEdgeType>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data = { type: 'audio' }, // Provide default
  selected,
}) => {
  const { setEdges } = useReactFlow();
  const setConnectionLabel = usePatchStore((state) => state.setConnectionLabel);

  // Type-safe data access
  const edgeData = (data || { type: 'audio' }) as ConnectionEdgeData;

  // Label editing state
  const [isEditing, setIsEditing] = useState(false);
  const [labelValue, setLabelValue] = useState(edgeData.label || '');
  const inputRef = useRef<HTMLInputElement>(null);

  // Get colors for this connection type
  const colors = useMemo(
    () => getConnectionColors(edgeData.type || 'audio'),
    [edgeData.type]
  );

  // Calculate bezier path
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Handle delete
  const handleDelete = useCallback(() => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  }, [setEdges, id]);

  // Handle label edit start
  const handleLabelEdit = useCallback(() => {
    setLabelValue(edgeData.label || '');
    setIsEditing(true);
  }, [edgeData.label]);

  // Handle label save
  const handleLabelSave = useCallback(() => {
    setIsEditing(false);
    if (id) {
      setConnectionLabel(id as string, labelValue.trim());
    }
  }, [id, labelValue, setConnectionLabel]);

  // Handle label keydown
  const handleLabelKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLabelSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setLabelValue(edgeData.label || '');
    }
  }, [handleLabelSave, edgeData.label]);

  return (
    <>
      {/* Glow effect layer */}
      <path
        d={edgePath}
        fill="none"
        stroke={colors.glow}
        strokeWidth={selected ? 12 : 8}
        strokeLinecap="round"
        className="transition-all duration-200"
        style={{ filter: 'blur(4px)' }}
      />

      {/* Main wire */}
      <motion.path
        id={`path-${id}`}
        d={edgePath}
        fill="none"
        stroke={colors.stroke}
        strokeWidth={selected ? 3 : 2}
        strokeLinecap="round"
        className={cn(
          'transition-all duration-200',
          (selected as boolean) && 'stroke-[3px]'
        )}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />

      {/* Animated flow indicator (for audio signals) */}
      {edgeData.animated && (
        <motion.circle
          r="3"
          fill={colors.stroke}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <animateMotion dur="1.5s" repeatCount="indefinite">
            <mpath href={`#path-${id}`} />
          </animateMotion>
        </motion.circle>
      )}

      {/* Label and Delete controls */}
      <EdgeLabelRenderer>
        <motion.div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="flex flex-col items-center gap-1"
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ opacity: 1, scale: 1 }}
          animate={{ opacity: selected || edgeData.label ? 1 : 0 }}
        >
          {/* Connection Label */}
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={labelValue}
              onChange={(e) => setLabelValue(e.target.value)}
              onBlur={handleLabelSave}
              onKeyDown={handleLabelKeyDown}
              className={cn(
                'px-2 py-0.5 text-xs rounded border',
                'bg-surface-primary border-border text-text-primary',
                'focus:outline-none focus:ring-1 focus:ring-accent-primary',
                'min-w-[60px] max-w-[120px]'
              )}
              placeholder="Label..."
              autoFocus
            />
          ) : (
            edgeData.label && (
              <div
                onDoubleClick={handleLabelEdit}
                className={cn(
                  'px-2 py-0.5 text-xs rounded',
                  'bg-surface-secondary/90 text-text-primary backdrop-blur-sm',
                  'border border-border cursor-pointer hover:bg-surface-tertiary',
                  'max-w-[120px] truncate'
                )}
                title="Double-click to edit"
              >
                {edgeData.label}
              </div>
            )
          )}

          {/* Action buttons when selected */}
          {selected && (
            <div className="flex gap-1">
              {!edgeData.label && !isEditing && (
                <button
                  onClick={handleLabelEdit}
                  className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center',
                    'bg-surface-primary border border-border text-text-secondary',
                    'hover:bg-surface-tertiary hover:text-text-primary transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-accent-primary/50'
                  )}
                  aria-label="Add label"
                  title="Add label"
                >
                  <Tag className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={handleDelete}
                className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center',
                  'bg-surface-primary border border-red-500/50 text-red-400',
                  'hover:bg-red-500/20 hover:text-red-300 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-red-500/50'
                )}
                aria-label="Delete connection"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </motion.div>
      </EdgeLabelRenderer>

      {/* SVG defs for this edge */}
      <FlowingDots
        id={id as string}
        color={colors.stroke}
        animate={edgeData.animated || false}
      />
    </>
  );
};

export default memo(ConnectionEdge);
