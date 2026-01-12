/**
 * ADSREnvelopeControl Component
 * Visual ADSR (Attack, Decay, Sustain, Release) envelope control
 * Shows envelope shape with interactive handles for each parameter
 */

import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import ParameterSlider from './ParameterSlider';

export interface ADSRParameters {
  attack: number;    // 0.001 to 10 seconds
  decay: number;     // 0.001 to 10 seconds
  sustain: number;   // 0 to 1 (level)
  release: number;   // 0.001 to 10 seconds
}

interface ADSREnvelopeControlProps {
  id: string;
  label: string;
  value: ADSRParameters;
  onChange: (value: ADSRParameters) => void;
  disabled?: boolean;
}

// ============================================================================
// ENVELOPE VISUALIZATION
// ============================================================================

interface EnvelopeVisualizationProps {
  parameters: ADSRParameters;
  width?: number;
  height?: number;
  className?: string;
}

const EnvelopeVisualization: React.FC<EnvelopeVisualizationProps> = ({
  parameters,
  width = 200,
  height = 80,
  className,
}) => {
  const { attack, decay, sustain, release } = parameters;

  // Calculate envelope path
  const envelopePath = useMemo(() => {
    const padding = 10;
    const innerWidth = width - padding * 2;
    const innerHeight = height - padding * 2;

    // Normalize times to fit in width (assuming max 4 seconds total)
    const totalTime = attack + decay + release;
    const timeScale = totalTime > 0 ? Math.min(innerWidth / (totalTime + 1), innerWidth / 4) : innerWidth / 4;

    // Calculate points
    const startX = padding;
    const attackEndX = startX + attack * timeScale;
    const decayEndX = attackEndX + decay * timeScale;
    const releaseStartX = decayEndX + 20; // sustain phase
    const releaseEndX = releaseStartX + release * timeScale;

    const bottomY = padding + innerHeight;
    const peakY = padding;
    const sustainY = bottomY - (sustain * innerHeight);

    // Build path
    let path = `M ${startX} ${bottomY}`;
    path += ` L ${attackEndX} ${peakY}`;  // Attack
    path += ` L ${decayEndX} ${sustainY}`; // Decay
    path += ` L ${releaseStartX} ${sustainY}`; // Sustain (flat)
    path += ` L ${releaseEndX} ${bottomY}`; // Release
    path += ` L ${startX} ${bottomY}`; // Close to bottom

    return path;
  }, [parameters, width, height]);

  return (
    <div className={cn('relative', className)}>
      <svg width={width} height={height} className="overflow-visible">
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="20" height="10" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Envelope shape */}
        <path
          d={envelopePath}
          fill="rgba(34, 211, 238, 0.2)"
          stroke="#22d3ee"
          strokeWidth="2"
          className="drop-shadow-sm"
        />

        {/* Attack point */}
        <circle
          cx={useMemo(() => {
            const padding = 10;
            const innerWidth = width - padding * 2;
            const timeScale = Math.min(innerWidth / (attack + decay + release + 1), innerWidth / 4);
            return padding + attack * timeScale;
          }, [attack, decay, release, width])}
          cy={10}
          r="3"
          fill="#22d3ee"
          className="drop-shadow-sm"
        />

        {/* Decay/Sustain point */}
        <circle
          cx={useMemo(() => {
            const padding = 10;
            const innerWidth = width - padding * 2;
            const timeScale = Math.min(innerWidth / (attack + decay + release + 1), innerWidth / 4);
            return padding + (attack + decay) * timeScale;
          }, [attack, decay, release, width])}
          cy={useMemo(() => {
            const padding = 10;
            const innerHeight = height - padding * 2;
            return padding + innerHeight - (sustain * innerHeight);
          }, [sustain, height])}
          r="3"
          fill="#22d3ee"
          className="drop-shadow-sm"
        />

        {/* Release point */}
        <circle
          cx={useMemo(() => {
            const padding = 10;
            const innerWidth = width - padding * 2;
            const timeScale = Math.min(innerWidth / (attack + decay + release + 1), innerWidth / 4);
            return padding + (attack + decay + release) * timeScale + 20;
          }, [attack, decay, release, width])}
          cy={height - 10}
          r="3"
          fill="#22d3ee"
          className="drop-shadow-sm"
        />
      </svg>
    </div>
  );
};

// ============================================================================
// COMPONENT
// ============================================================================

const ADSREnvelopeControl: React.FC<ADSREnvelopeControlProps> = ({
  id,
  label,
  value,
  onChange,
  disabled = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleParameterChange = useCallback(
    (parameter: keyof ADSRParameters, newValue: number) => {
      if (!disabled) {
        onChange({
          ...value,
          [parameter]: newValue,
        });
      }
    },
    [value, onChange, disabled]
  );

  const handlePlayDemo = useCallback(() => {
    if (disabled) return;
    setIsPlaying(true);
    // Simulate envelope playback
    setTimeout(() => setIsPlaying(false), (value.attack + value.decay + 0.5 + value.release) * 1000);
  }, [disabled, value]);

  return (
    <div className="flex flex-col gap-4">
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="text-xs text-text-tertiary font-medium">
          {label}
        </label>
        <button
          onClick={handlePlayDemo}
          disabled={disabled}
          className={cn(
            'px-2 py-1 text-xs rounded',
            'bg-audio-primary/20 text-audio-primary border border-audio-primary/30',
            'hover:bg-audio-primary/30 transition-colors',
            disabled && 'opacity-50 cursor-not-allowed hover:bg-audio-primary/20'
          )}
        >
          {isPlaying ? 'Playing...' : 'Demo'}
        </button>
      </div>

      {/* Envelope Visualization */}
      <div className="flex justify-center">
        <EnvelopeVisualization
          parameters={value}
          width={220}
          height={100}
          className="bg-surface-primary rounded-lg border border-border p-2"
        />
      </div>

      {/* Parameter Controls */}
      <div className="grid grid-cols-2 gap-3">
        <ParameterSlider
          id={`${id}-attack`}
          label="Attack"
          value={value.attack}
          min={0.001}
          max={10}
          step={0.001}
          unit="s"
          onChange={(v) => handleParameterChange('attack', v)}
        />

        <ParameterSlider
          id={`${id}-decay`}
          label="Decay"
          value={value.decay}
          min={0.001}
          max={10}
          step={0.001}
          unit="s"
          onChange={(v) => handleParameterChange('decay', v)}
        />

        <ParameterSlider
          id={`${id}-sustain`}
          label="Sustain"
          value={value.sustain}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => handleParameterChange('sustain', v)}
        />

        <ParameterSlider
          id={`${id}-release`}
          label="Release"
          value={value.release}
          min={0.001}
          max={10}
          step={0.001}
          unit="s"
          onChange={(v) => handleParameterChange('release', v)}
        />
      </div>
    </div>
  );
};

export default ADSREnvelopeControl;