/**
 * BlockNode Component
 * Custom React Flow node for DSP blocks
 * Implements color-coded port system and visual design grammar
 */

import React, { memo, useMemo, useCallback, useRef } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore, usePatchStore } from '@/stores';
import { BlockRegistry } from '@/core/blocks/BlockRegistry';
import {
  getStitchNeonBlockStyle,
  getStitchNeonCategoryColor,
  shouldShowInputPortInLayout,
} from '@/lib/stitchNeonStyle';
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

export const getGlassNeonColor = (_scheme: BlockColorScheme, category: BlockCategory, defId?: string) => {
  switch (category) {
    case BlockCategory.SOURCES:
    case BlockCategory.PHYSICAL_MODELING:
    case BlockCategory.DRUMS:
      return '#4361ee'; // Deep Indigo/Blue

    case BlockCategory.FILTERS:
      return '#4cc9f0'; // Light Blue

    case BlockCategory.EFFECTS: {
      if (!defId) return '#06d6a0'; // Default Green/Teal
      const id = defId.toLowerCase();
      if (id.includes('reverb') || id.includes('delay') || id.includes('echo')) {
        return '#00e5ff'; // Cyan
      }
      if (id.includes('chorus') || id.includes('flanger') || id.includes('phaser') || id.includes('tremolo') || id.includes('vibrato')) {
        return '#00ffcc'; // Turquoise
      }
      // Drive, dist, crush
      return '#00ff88'; // Green
    }

    case BlockCategory.DYNAMICS: return '#00ff88'; // Green
    case BlockCategory.UTILITY: return '#b44aff'; // Purple (Mixers, VCA, Mux)
    case BlockCategory.MODULATORS: return '#ffab00'; // Amber/Yellow
    case BlockCategory.MATH: return '#ffe800'; // Yellow
    case BlockCategory.USER_IO: return '#ffffff'; // White
    case BlockCategory.CUSTOM: return '#888888'; // Gray
    default: return '#39ff14'; // Green fallback
  }
};

const getBlockSchemeStyles = (scheme: BlockColorScheme, selected: boolean, layoutStyle: string, category?: BlockCategory, defId?: string) => {
  const isGlass = layoutStyle === 'glass';
  const isExperiment = layoutStyle === 'experiment';
  const base = selected
    ? isGlass || isExperiment
      ? 'ring-2 ring-white shadow-[0_0_0_2px_rgba(255,255,255,0.82),0_0_32px_rgba(250,204,21,0.38)]'
      : 'ring-2 ring-white/80'
    : '';

  if (isGlass || isExperiment) {

    // In experiment mode, we'll override visual classes but the bg gradients
    // are still keyed to categories. We'll use the base styles from UI store if it's 'experiment'
    if (isExperiment) {
        // settings kept for logic flow, but purely handled by dynamicStyle now
    }

    const glassBase = cn('border-white/10 backdrop-blur-[9px] border');
    
    switch (category) {
      case BlockCategory.SOURCES:
      case BlockCategory.PHYSICAL_MODELING:
      case BlockCategory.DRUMS:
          return cn(base, glassBase, isExperiment ? "" : 'bg-gradient-to-br from-[#4361ee15] to-[#12163bb3]');
      case BlockCategory.FILTERS:
          return cn(base, glassBase, isExperiment ? "" : 'bg-gradient-to-br from-[#4cc9f015] to-[#132a40b3]');
      case BlockCategory.EFFECTS: {
          const id = (defId || '').toLowerCase();
          if (!isExperiment) {
            if (id.includes('reverb') || id.includes('delay') || id.includes('echo')) {
                return cn(base, glassBase, 'bg-gradient-to-br from-[#00e5ff15] to-[#00333bb3]');
            }
            if (id.includes('chorus') || id.includes('flanger') || id.includes('phaser') || id.includes('tremolo') || id.includes('vibrato')) {
                return cn(base, glassBase, 'bg-gradient-to-br from-[#00ffcc15] to-[#00332bb3]');
            }
          }
          return cn(base, glassBase, isExperiment ? "" : 'bg-gradient-to-br from-[#00ff8815] to-[#00331cb3]');
      }
      case BlockCategory.DYNAMICS:
          return cn(base, glassBase, isExperiment ? "" : 'bg-gradient-to-br from-[#00ff8815] to-[#00331cb3]');
      case BlockCategory.UTILITY:
          return cn(base, glassBase, isExperiment ? "" : 'bg-gradient-to-br from-[#b44aff15] to-[#240e33b3]');
      case BlockCategory.MODULATORS:
          return cn(base, glassBase, isExperiment ? "" : 'bg-gradient-to-br from-[#ffab0015] to-[#332200b3]');
      case BlockCategory.MATH:
          return cn(base, glassBase, isExperiment ? "" : 'bg-gradient-to-br from-[#ffe80015] to-[#332d00b3]');
      case BlockCategory.USER_IO:
          return cn(base, glassBase, isExperiment ? "" : 'bg-gradient-to-br from-[#ffffff15] to-[#222222b3]');
      case BlockCategory.CUSTOM:
          return cn(base, glassBase, isExperiment ? "" : 'bg-gradient-to-br from-[#88888815] to-[#1a1a1ab3]');
      default:
          return cn(base, glassBase, isExperiment ? "" : 'bg-gradient-to-br from-[#cdb38a15] to-[#221b15b3]');
    }
  }

  // Original style
  switch (scheme) {
    case BlockColorScheme.AUDIO:
      return cn(base, 'bg-[#0a2a3a] border-audio-primary/50 shadow-[0_0_15px_rgba(34,211,238,0.3)] min-w-[140px] rounded-lg border backdrop-blur-sm');
    case BlockColorScheme.CONTROL:
      return cn(base, 'bg-cv-block-bg border-cv-primary/50 shadow-[0_0_15px_rgba(250,204,21,0.25)] min-w-[140px] rounded-lg border backdrop-blur-sm');
    case BlockColorScheme.USER:
      return cn(base, 'bg-user-block-bg border-user-primary/50 shadow-[0_0_15px_rgba(74,222,128,0.25)] min-w-[140px] rounded-lg border backdrop-blur-sm');
    case BlockColorScheme.LOGIC:
      return cn(base, 'bg-logic-block-bg border-logic-primary/50 shadow-[0_0_15px_rgba(167,139,250,0.25)] min-w-[140px] rounded-lg border backdrop-blur-sm');
    default:
      return cn(base, 'bg-surface-secondary border-border min-w-[140px] rounded-lg border backdrop-blur-sm');
  }
};

const getHeaderSchemeStyles = (scheme: BlockColorScheme, layoutStyle: string): string => {
  if (layoutStyle === 'glass') {
    return 'px-4 py-3 pb-1 border-0 transparent';
  }

  switch (scheme) {
    case BlockColorScheme.AUDIO:
      return 'bg-audio-primary/20 text-audio-primary px-3 py-2 rounded-t-lg border-b border-inherit';
    case BlockColorScheme.CONTROL:
      return 'bg-cv-primary/20 text-cv-primary px-3 py-2 rounded-t-lg border-b border-inherit';
    case BlockColorScheme.USER:
      return 'bg-user-primary/20 text-user-primary px-3 py-2 rounded-t-lg border-b border-inherit';
    case BlockColorScheme.LOGIC:
      return 'bg-logic-primary/20 text-logic-primary px-3 py-2 rounded-t-lg border-b border-inherit';
    default:
      return 'bg-surface-tertiary text-text-primary px-3 py-2 rounded-t-lg border-b border-inherit';
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
  hideText?: boolean;
}

const PortHandle: React.FC<PortHandleProps> = memo(
  ({ portId, displayName, signalType, direction, isConnected, hideText }) => {
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
        {!hideText && (
          <span
            className={cn(
              'text-xs font-mono text-text-secondary',
              direction === PortDirection.OUTPUT && 'text-right'
            )}
          >
            {displayName}
          </span>
        )}
      </div>
    );
  }
);

PortHandle.displayName = 'PortHandle';

// ============================================================================
// GLASS COMPONENT UTILS
// ============================================================================

const GlassKnob = ({
  label, value, min, max, step = 0.01, onChange, color = "#00e5ff"
}: {
  label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; color?: string;
}) => {
  const percentage = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const angle = -120 + (percentage * 240);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    const startValue = value;

    const onPointerMove = (ev: PointerEvent) => {
      const deltaY = startY - ev.clientY;
      const range = max - min;
      let newValue = startValue + (deltaY / 100) * range;
      newValue = Math.max(min, Math.min(max, newValue));
      if (step) {
        newValue = Math.round(newValue / step) * step;
      }
      onChange(newValue);
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  return (
    <div className="flex flex-col items-center gap-1.5 cursor-ns-resize" onPointerDown={handlePointerDown}>
      <div className="w-9 h-9 rounded-full bg-[#111827] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_1px_2px_rgba(255,255,255,0.05)] relative flex flex-col items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 36 36">
          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ffffff10" strokeWidth="2.5" strokeDasharray="100, 100" />
          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={color} strokeWidth="2.5" strokeDasharray={`${percentage * 75}, 100`} />
        </svg>
        <div className="w-6 h-6 rounded-full bg-[#1f2937] shadow-md relative" style={{ transform: `rotate(${angle}deg)` }}>
          <div className="absolute top-1 left-1/2 -ml-[1px] w-[2px] h-2 bg-white rounded-full"></div>
        </div>
      </div>
      <span className="text-[9px] font-semibold text-[#8f9ba8] uppercase tracking-wider">{label}</span>
    </div>
  );
};

const GlassSlider = ({
  label, value, min, max, step = 0.01, valueDisplay, onChange, color = "#00e5ff"
}: {
  label: string; value: number; min: number; max: number; step?: number; valueDisplay: string; onChange: (v: number) => void; color?: string;
}) => {
  const percentage = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const trackRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const updateValue = (ev: PointerEvent | React.PointerEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, ev.clientX - rect.left));
      const targetPercent = x / rect.width;
      let newValue = min + targetPercent * (max - min);
      if (step) {
        newValue = Math.round(newValue / step) * step;
      }
      onChange(Math.max(min, Math.min(max, newValue)));
    };

    updateValue(e);

    const onPointerMove = (ev: PointerEvent) => updateValue(ev);
    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  return (
    <div className="flex items-center gap-3 w-full py-1.5" onPointerDown={e => e.stopPropagation()}>
      <span className="text-[10px] font-medium tracking-wider text-[#8f9ba8] uppercase w-12">{label}</span>
      <div
        ref={trackRef}
        className="flex-1 h-1.5 bg-[rgba(255,255,255,0.06)] rounded-[3px] relative overflow-hidden cursor-ew-resize border border-white/5"
        onPointerDown={handlePointerDown}
      >
        <div
          className="absolute top-0 left-0 bottom-0 rounded-[3px] shadow-[0_0_8px_rgba(255,255,255,0.2)]"
          style={{ width: `${percentage * 100}%`, background: `linear-gradient(90deg, color-mix(in srgb, ${color} 60%, transparent), ${color})`, boxShadow: `0 0 6px color-mix(in srgb, ${color} 40%, transparent)` }}
        ></div>
      </div>
      <span className="text-[10px] w-12 text-right text-text-tertiary font-mono">{valueDisplay}</span>
    </div>
  );
};

const GlassSwitch = ({ label, active, onChange, color = "#00e5ff" }: { label: string, active: boolean, onChange: (v: boolean) => void, color?: string }) => {
  return (
    <div className="flex flex-col items-center gap-1.5 cursor-pointer" onPointerDown={(e) => { e.stopPropagation(); onChange(!active); }}>
      <div className={cn("w-8 h-4 rounded-full relative transition-colors duration-200 border shadow-inner", active ? "border-transparent" : "border-white/5 bg-black/50")} style={active ? { backgroundColor: `${color}40` } : {}}>
        <div
          className={cn("absolute top-0.5 w-3 h-3 rounded-full transition-transform duration-200 shadow-sm", active ? "left-[18px] border-transparent" : "left-[2px] bg-[#1f2937] border border-white/20")}
          style={active ? { backgroundColor: color, boxShadow: `0 0 8px ${color}` } : {}}
        ></div>
      </div>
      {label && <span className="text-[9px] font-semibold text-[#8f9ba8] uppercase tracking-wider">{label}</span>}
    </div>
  );
};

const WaveformIcon = ({ type, color = "currentColor" }: { type: string, color?: string }) => {
  const t = type.toLowerCase();

  if (t.includes('sin')) {
    return (
      <svg viewBox="0 0 24 14" className="w-[18px] h-[10px] overflow-visible" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2,7 C5,2 8,2 12,7 C16,12 19,12 22,7" stroke={color} />
      </svg>
    );
  } else if (t.includes('tri') || t.includes('ramp')) {
    return (
      <svg viewBox="0 0 24 14" className="w-[18px] h-[10px] overflow-visible" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="2,12 7,2 12,12 17,2 22,12" stroke={color} />
      </svg>
    );
  } else if (t.includes('ramp') || t.includes('pwm')) {
    return (
      <svg viewBox="0 0 24 14" className="w-[18px] h-[10px] overflow-visible" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="2,12 2,2 5,2 5,12 14,12 14,2 17,2 17,12 22,12" stroke={color} />
      </svg>
    );
  } else if (t.includes('saw') && !t.includes('poly')) {
    return (
      <svg viewBox="0 0 24 14" className="w-[18px] h-[10px] overflow-visible" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="2,12 12,2 12,12 22,2" stroke={color} />
      </svg>
    );
  } else if (t.includes('saw') && t.includes('poly')) {
    return (
      <svg viewBox="0 0 24 14" className="w-[18px] h-[10px] overflow-visible" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="2,12 12,2 12,12 22,2" stroke={color} />
      </svg>
    );
  } else if (t.includes('squ') || t.includes('pulse')) {
    return (
      <svg viewBox="0 0 24 14" className="w-[18px] h-[10px] overflow-visible" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="2,12 2,2 8,2 8,12 14,12 14,2 20,2 20,12 22,12" stroke={color} />
      </svg>
    );
  }

  return <span className="text-[10px]" style={{ color }}>{type.substring(0, 3)}</span>;
};

const GlassSegmentedControl = ({ value, options, onChange, color = "#00e5ff" }: { value: string | number, options: { label: string, value: string | number }[], onChange: (v: string | number) => void, color?: string }) => {
  return (
    <div className="flex flex-wrap items-center bg-transparent rounded p-0.5 gap-1 justify-start w-full" onPointerDown={e => e.stopPropagation()}>
      {options.map((opt, i) => {
        const isIcon = ['sine', 'triangle', 'saw', 'square', 'ramp', 'pwm'].some(w => opt.label.toLowerCase().includes(w));
        const isActive = value === opt.value;
        return (
          <button
            key={i}
            title={opt.label}
            className={cn(
              "p-1 text-[10px] rounded transition-all font-medium flex items-center justify-center min-w-[30px] h-[22px]",
              isActive
                ? "border ring-1"
                : "border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/25"
            )}
            style={isActive ? { borderColor: color, backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`, boxShadow: `0 0 3px ${color}` } : {}}
            onClick={(e) => { e.stopPropagation(); onChange(opt.value); }}
          >
            {isIcon ? <WaveformIcon type={opt.label} color={isActive ? color : "rgba(255,255,255,0.4)"} /> : <span style={{ color: isActive ? color : 'rgba(255,255,255,0.4)' }}>{opt.label}</span>}
          </button>
        )
      })}
    </div>
  );
};

const GlassParameterControlsList = ({
  definition,
  parameterValues,
  onChange,
  color = "#00e5ff",
  cvPorts = [],
  connectedPorts
}: {
  definition: any;
  parameterValues: Record<string, any>;
  onChange: (paramId: string, val: any) => void;
  color?: string;
  cvPorts?: any[];
  connectedPorts?: Set<string>;
}) => {
  if (definition.parameters.length === 0) return null;

  const isEnv = definition.id === 'adsr' || definition.id === 'envelope';
  const isFilter = definition.category === BlockCategory.FILTERS || definition.id === 'svf' || definition.id === 'moog_filter';
  const isOscillator = definition.id.includes('oscillator') || definition.id === 'lfo';
  const isSequencer = definition.id.includes('seq');
  const isEffect = definition.category === BlockCategory.EFFECTS;

  if (isEnv) {
    const pA = definition.parameters.find((p: any) => p.id === 'attack');
    const pD = definition.parameters.find((p: any) => p.id === 'decay');
    const pS = definition.parameters.find((p: any) => p.id === 'sustain');
    const pR = definition.parameters.find((p: any) => p.id === 'release');

    return (
      <div className="px-4 py-2 flex flex-col gap-3 relative">
        {/* PCB Traces for ADSR Envelope CV -> Knobs */}
        <div className="absolute inset-0 pointer-events-none overflow-visible z-[-1]">
          <svg className="absolute w-full h-[150px] top-[40px] left-[-20px] overflow-visible">
            <path d="M 0,35 Q 15,35 25,15" fill="none" stroke={color} strokeWidth="1.5" className="opacity-40" strokeLinecap="round" />
            <path d="M 0,55 Q 50,55 60,15" fill="none" stroke={color} strokeWidth="1.5" className="opacity-30" strokeLinecap="round" />
            <path d="M 0,75 Q 85,75 95,15" fill="none" stroke={color} strokeWidth="1.5" className="opacity-20" strokeLinecap="round" />
            <path d="M 0,95 Q 120,95 130,15" fill="none" stroke={color} strokeWidth="1.5" className="opacity-20" strokeLinecap="round" />
          </svg>
        </div>
        <div className="h-10 w-full border border-white/5 bg-[rgba(0,0,0,0.25)] rounded-md relative overflow-hidden">
          <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 40">
            <path d="M0,40 L15,5 L40,25 L80,25 L100,40" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
            <path d="M0,40 L15,5 L40,25 L80,25 L100,40 L100,40 L0,40 Z" fill={color} className="opacity-10" />
          </svg>
        </div>
        <div className="flex justify-between items-center px-1 py-1">
          {pA && <GlassKnob color={color} label="A" value={parameterValues[pA.id] as number} min={pA.range?.min || 0} max={pA.range?.max || 1} onChange={v => onChange(pA.id, v)} />}
          {pD && <GlassKnob color={color} label="D" value={parameterValues[pD.id] as number} min={pD.range?.min || 0} max={pD.range?.max || 1} onChange={v => onChange(pD.id, v)} />}
          {pS && <GlassKnob color={color} label="S" value={parameterValues[pS.id] as number} min={pS.range?.min || 0} max={pS.range?.max || 1} onChange={v => onChange(pS.id, v)} />}
          {pR && <GlassKnob color={color} label="R" value={parameterValues[pR.id] as number} min={pR.range?.min || 0} max={pR.range?.max || 1} onChange={v => onChange(pR.id, v)} />}
        </div>
      </div>
    );
  }

  if (isFilter) {
    const pC = definition.parameters.find((p: any) => p.id === 'cutoff' || p.id === 'frequency');
    const pR = definition.parameters.find((p: any) => p.id === 'res' || p.id === 'resonance');
    const pT = definition.parameters.find((p: any) => p.type === 'enum' || p.id === 'type' || p.id === 'mode');

    return (
      <div className="px-4 py-3 flex flex-col gap-4 items-center bg-transparent mx-1 rounded-md mb-2 relative">
        {/* PCB Traces for SVF Filter CV -> Knobs */}
        <div className="absolute inset-0 pointer-events-none overflow-visible z-[-1]">
          <svg className="absolute w-full h-[150px] top-[60px] left-[-20px] overflow-visible">
            <path d="M 0,20 Q 20,20 40,10" fill="none" stroke={color} strokeWidth="1.5" className="opacity-40" strokeLinecap="round" />
            <path d="M 0,40 Q 60,40 90,10" fill="none" stroke={color} strokeWidth="1.5" className="opacity-30" strokeLinecap="round" />
          </svg>
        </div>
        {pT && pT.enumValues && (
          <GlassSegmentedControl color={color} value={parameterValues[pT.id] as string} options={pT.enumValues} onChange={v => onChange(pT.id, v)} />
        )}
        <div className="flex justify-center flex-wrap gap-4 w-full mt-1">
          {pC && <GlassKnob color={color} label="CUTOFF" value={parameterValues[pC.id] as number} min={pC.range?.min || 20} max={pC.range?.max || 20000} onChange={v => onChange(pC.id, v)} />}
          {pR && <GlassKnob color={color} label="RES" value={parameterValues[pR.id] as number} min={pR.range?.min || 0} max={pR.range?.max || 1} onChange={v => onChange(pR.id, v)} />}
        </div>
      </div>
    );
  }

  if (isOscillator) {
    const pW = definition.parameters.find((p: any) => p.type === 'enum' || p.id === 'waveform' || p.id === 'wave');
    const sliders = definition.parameters.filter((p: any) => (p.type === 'float' || p.type === 'int') && p.id !== 'waveform' && p.id !== 'wave');

    // Resolve current waveform for oscilloscope rendering
    let currentWaveLabel = 'unknown';
    if (pW && pW.enumValues) {
      const selectedEnum = pW.enumValues.find((e: any) => e.value === parameterValues[pW.id]);
      if (selectedEnum) currentWaveLabel = selectedEnum.label.toLowerCase();
    }

    return (
      <div className="px-4 py-3 flex flex-col gap-2 mx-1 rounded-md mb-2 bg-transparent">
        {pW && pW.enumValues && (
          <div className="flex items-center gap-3 w-full py-1.5 mb-1">
            <span className="text-[10px] font-medium tracking-wider text-[#8f9ba8] uppercase w-12">Wave</span>
            <GlassSegmentedControl color={color} value={parameterValues[pW.id] as string} options={pW.enumValues} onChange={v => onChange(pW.id, v)} />
          </div>
        )}

        {sliders.map((p: any) => {
          const v = parameterValues[p.id] as number;
          const valDisplay = typeof v === 'number' ? v.toFixed(p.range?.step && p.range.step < 1 ? 2 : 0) + (p.unit ? ` ${p.unit}` : '') : '';
          const cvPort = cvPorts?.find(port => port.id === `${p.id}_cv`);
          return (
            <div key={p.id} className="relative w-full -mx-4 px-4 py-0.5">
              {cvPort && (
                <div className="absolute left-[3px] top-1/2 -translate-y-1/2 z-10 w-4">
                  <PortHandle portId={cvPort.id} displayName="" signalType={cvPort.signalType} direction={PortDirection.INPUT} isConnected={connectedPorts?.has(cvPort.id) || false} hideText={true} />
                </div>
              )}
              <GlassSlider
                color={color}
                label={p.displayName.slice(0, 6)} value={v || 0}
                min={p.range?.min || 0} max={p.range?.max || 1} step={p.range?.step}
                valueDisplay={valDisplay} onChange={v => onChange(p.id, v)}
              />
            </div>
          );
        })}

        {/* Faux Oscilloscope */}
        <div className="w-full h-10 mt-1 bg-[#0f172a] rounded shadow-inner border border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] bg-[size:10px_10px]"></div>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
            {currentWaveLabel.includes('sin') && <path d="M0,20 Q 25,-5 50,20 T 100,20 T 150,20 T 200,20" fill="none" strokeWidth="2" className="opacity-80 drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]" stroke={color} strokeLinecap="round" />}
            {currentWaveLabel.includes('tri') && <polyline points="0,20 25,5 75,35 125,5 175,35 200,20" fill="none" strokeWidth="2" className="opacity-80 drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]" stroke={color} strokeLinejoin="round" />}
            {currentWaveLabel.includes('saw') && <polyline points="0,35 50,5 50,35 100,5 100,35 150,5 150,35 200,5 200,35" fill="none" strokeWidth="2" className="opacity-80 drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]" stroke={color} strokeLinejoin="round" />}
            {(currentWaveLabel.includes('ramp') || currentWaveLabel.includes('pwm')) && <polyline points="0,35 0,5 15,5 15,35 50,35 50,5 65,5 65,35 100,35 100,5 115,5 115,35 150,35 150,5 165,5 165,35 200,35 200,5" fill="none" strokeWidth="2" className="opacity-80 drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]" stroke={color} strokeLinejoin="round" />}
            {currentWaveLabel.includes('squ') && <polyline points="0,35 0,5 25,5 25,35 50,35 50,5 75,5 75,35 100,35 100,5 125,5 125,35 150,35 150,5 175,5 175,35 200,35 200,5" fill="none" strokeWidth="2" className="opacity-80 drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]" stroke={color} strokeLinejoin="round" />}
            {!['sin', 'tri', 'saw', 'ramp', 'pwm', 'squ'].some(w => currentWaveLabel.includes(w)) && <polyline points="0,35 50,5 50,35 100,5 100,35 150,5 150,35 200,5 200,35" fill="none" strokeWidth="2" className="opacity-80 drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]" stroke={color} strokeLinejoin="round" />}
          </svg>
        </div>
      </div>
    );
  }

  if (isSequencer) {
    // Sequencer specific view: render a row of step "LEDs"
    const pTempo = definition.parameters.find((p: any) => p.id === 'tempo');
    const pSteps = definition.parameters.find((p: any) => p.id === 'steps' || p.id === 'length');
    const sliders = definition.parameters.filter((p: any) => (p.type === 'float' || p.type === 'int') && p.id !== 'tempo' && p.id !== 'steps' && p.id !== 'length');

    return (
      <div className="px-3 py-2 flex flex-col gap-3 mx-1 bg-transparent rounded-md mb-2">
        {/* Step graphic */}
        <div className="flex gap-1 justify-center bg-[rgba(0,0,0,0.25)] p-2 rounded-md border border-white/5 shadow-inner">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={cn("flex-1 h-6 rounded-sm border", i % 4 === 0 ? "bg-[#facc15] border-[#facc15]/50 shadow-[0_0_8px_rgba(250,204,21,0.6)]" : "bg-white/10 border-white/5")} style={i % 4 === 0 ? { backgroundColor: color, borderColor: `${color}80`, boxShadow: `0 0 8px ${color}99` } : {}}></div>
          ))}
        </div>

        <div className="flex justify-between w-full">
          {pTempo && <GlassKnob color={color} label="TEMPO" value={parameterValues[pTempo.id] as number} min={pTempo.range?.min || 20} max={pTempo.range?.max || 300} onChange={v => onChange(pTempo.id, v)} />}
          {pSteps && <GlassKnob color={color} label="STEPS" value={parameterValues[pSteps.id] as number} min={pSteps.range?.min || 1} max={pSteps.range?.max || 16} onChange={v => onChange(pSteps.id, v)} step={1} />}
        </div>

        <div className="flex flex-col gap-1 w-full mt-1">
          {sliders.map((p: any) => {
            const v = parameterValues[p.id] as number;
            const valDisplay = typeof v === 'number' ? v.toFixed(p.range?.step && p.range.step < 1 ? 2 : 0) + (p.unit ? ` ${p.unit}` : '') : '';
            const cvPort = cvPorts?.find(port => port.id === `${p.id}_cv`);
            return (
              <div key={p.id} className="relative w-full -mx-4 px-4 py-0.5">
                {cvPort && (
                  <div className="absolute left-[3px] top-1/2 -translate-y-1/2 z-10 w-4">
                    <PortHandle portId={cvPort.id} displayName="" signalType={cvPort.signalType} direction={PortDirection.INPUT} isConnected={connectedPorts?.has(cvPort.id) || false} hideText={true} />
                  </div>
                )}
                <GlassSlider
                  color={color}
                  label={p.displayName.slice(0, 6)} value={v || 0}
                  min={p.range?.min || 0} max={p.range?.max || 1} step={p.range?.step}
                  valueDisplay={valDisplay} onChange={v => onChange(p.id, v)}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Fallback / Defaults
  const visibleParams = definition.parameters.filter((p: any) => {
    if (['adc', 'mode', 'pin', 'channel'].includes(p.id)) return false;
    if (definition.category === BlockCategory.USER_IO && ['min', 'max', 'offset'].includes(p.id)) return false;
    return true;
  });
  const bools = visibleParams.filter((p: any) => p.type === 'bool');
  const enums = visibleParams.filter((p: any) => p.type === 'enum');
  const numbers = visibleParams.filter((p: any) => p.type === 'float' || p.type === 'int');

  // For effects, if they have few numeric params (e.g. 1 to 4) and no enums, use knobs grid
  if (isEffect && numbers.length > 0 && numbers.length <= 4 && enums.length === 0) {
    return (
      <div className="px-4 py-3 flex flex-col items-center mx-1 rounded-md mt-1 mb-2 shadow-inner border border-white/5">
        {(bools.length > 0) && (
          <div className="flex flex-wrap items-center gap-3 justify-center mb-3">
            {bools.map((p: any) => (
              <GlassSwitch color={color} key={p.id} label={p.displayName} active={parameterValues[p.id] as boolean} onChange={v => onChange(p.id, v)} />
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-4 items-center justify-center w-full">
          {numbers.map((p: any) => (
            <GlassKnob
              color={color}
              key={p.id}
              label={p.displayName.slice(0, 6)} value={parameterValues[p.id] as number}
              min={p.range?.min || 0} max={p.range?.max || 1} step={p.range?.step}
              onChange={v => onChange(p.id, v)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 flex flex-col gap-2.5 mx-1 rounded-md mt-1 mb-2 bg-transparent">
      {(bools.length > 0 || enums.length > 0) && (
        <div className="flex flex-wrap items-center gap-3 justify-between mb-1">
          {enums.map((p: any) => (
            p.enumValues ? <GlassSegmentedControl color={color} key={p.id} value={parameterValues[p.id] as string} options={p.enumValues} onChange={v => onChange(p.id, v)} /> : null
          ))}
          {bools.map((p: any) => (
            <GlassSwitch color={color} key={p.id} label={p.displayName} active={parameterValues[p.id] as boolean} onChange={v => onChange(p.id, v)} />
          ))}
        </div>
      )}

      {numbers.map((p: any) => {
        let valDisplay = '';
        const v = parameterValues[p.id] as number;
        if (typeof v === 'number') {
          valDisplay = v.toFixed(p.range?.step && p.range.step < 1 ? 2 : 0) + (p.unit ? ` ${p.unit}` : '');
        }
        const cvPort = cvPorts?.find(port => port.id === `${p.id}_cv`);
        return (
          <div key={p.id} className="relative w-full -mx-4 px-4 py-0.5">
            {cvPort && (
              <div className="absolute left-[3px] top-1/2 -translate-y-1/2 z-10 w-4">
                <PortHandle portId={cvPort.id} displayName="" signalType={cvPort.signalType} direction={PortDirection.INPUT} isConnected={connectedPorts?.has(cvPort.id) || false} hideText={true} />
              </div>
            )}
            <GlassSlider
              color={color}
              label={p.displayName.slice(0, 6)}
              value={v || 0}
              min={p.range?.min || 0}
              max={p.range?.max || 1}
              step={p.range?.step}
              valueDisplay={valDisplay}
              onChange={v => onChange(p.id, v)}
            />
          </div>
        )
      })}
    </div>
  );
};

// ============================================================================
// BLOCK NODE COMPONENT
// ============================================================================

const BlockNode: React.FC<BlockNodeProps> = ({ id, data, selected }) => {
  const nodeData = data as BlockNodeData;
  const { instance } = nodeData;
  const inspectBlock = useUIStore((state) => state.inspectBlock);
  const layoutStyle = useUIStore((state) => state.layoutStyle);
  const stitchNeonSettings = useUIStore((state) => state.stitchNeonSettings);
  const connections = usePatchStore((state) => state.connections);
  const updateBlockParameter = usePatchStore((state) => state.updateBlockParameter);

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
      if (!shouldShowInputPortInLayout({
        port: p,
        definition,
        layoutStyle,
        enabledCvPorts: instance.enabledCvPorts,
        connectedPorts,
      })) return false;

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
  }, [connectedPorts, definition, instance.enabledCvPorts, instance.parameterValues, layoutStyle]);

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
  const designSettings = useUIStore((state) => state.designSettings);
  const baseNeonColor = definition ? getGlassNeonColor(definition.colorScheme, definition.category, definition.id) : "#00e5ff";
  const neonColor = layoutStyle === 'glass'
    ? getStitchNeonCategoryColor(stitchNeonSettings, baseNeonColor, definition.category)
    : baseNeonColor;

  // Dynamic glass background based on experiment settings
  const dynamicStyle = useMemo<React.CSSProperties>(() => {
    if (layoutStyle !== 'experiment' && layoutStyle !== 'glass') return {};

    if (layoutStyle === 'glass') {
      return getStitchNeonBlockStyle(stitchNeonSettings, neonColor, Boolean(selected));
    }
    
    const s = designSettings;

    const tintHex = Math.round(s.glassTint * 255).toString(16).padStart(2, '0');
    const bgHex = Math.round(s.baseTransparency * 255).toString(16).padStart(2, '0');
    const isSelected = Boolean(selected);
    const selectedShadow = `0 0 0 2px rgba(255,255,255,0.9), 0 0 38px ${neonColor}99, 0 0 70px rgba(250,204,21,0.28)`;
    const normalShadow = `0 0 ${s.glowSpread}px -${s.glowSpread / 4}px ${neonColor}${Math.round(s.glowIntensity * 255).toString(16).padStart(2, '0')}, 0 0 40px -10px ${neonColor}33, inset 0 0 0 1px ${neonColor}1a`;
    
    return {
      borderRadius: s.borderRadius,
      borderWidth: isSelected ? Math.max(2, s.borderWidth) : s.borderWidth,
      borderColor: isSelected ? 'rgba(255,255,255,0.95)' : undefined,
      background: `linear-gradient(135deg, ${neonColor}${tintHex}, #111111${bgHex})`,
      boxShadow: isSelected ? selectedShadow : normalShadow,
    };
  }, [layoutStyle, designSettings, neonColor, selected, stitchNeonSettings]);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'min-w-[140px]',
        getBlockSchemeStyles(definition.colorScheme, Boolean(selected), layoutStyle, definition.category, definition.id)
      )}
      style={dynamicStyle}
      onDoubleClick={handleDoubleClick}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center gap-2',
          getHeaderSchemeStyles(definition.colorScheme, layoutStyle)
        )}
      >
        {IconComponent && <IconComponent className="w-4 h-4" />}
        <span className={cn(
          "flex-1",
          layoutStyle === 'glass'
            ? "font-serif text-lg font-semibold tracking-wide text-[#fff4e4]"
            : "font-semibold text-sm tracking-wide"
        )}>
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

      {layoutStyle === 'glass' && (
        <GlassParameterControlsList
          definition={definition}
          parameterValues={instance.parameterValues}
          color={neonColor}
          cvPorts={inputPorts.filter(p => p.id.endsWith('_cv') && definition.parameters.some((param: any) => p.id === `${param.id}_cv`))}
          connectedPorts={connectedPorts}
          onChange={(paramId, value) => {
            updateBlockParameter(id, paramId, value);
          }}
        />
      )}

      {/* Ports Container */}
      <div className={cn("flex justify-between gap-4", layoutStyle === 'glass' ? "px-3 pb-3 pt-1" : "p-2")}>
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

      {/* Mini parameter display for key parameters (Original) */}
      {layoutStyle !== 'glass' && definition.parameters.length > 0 && (
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
