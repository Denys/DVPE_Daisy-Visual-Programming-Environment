/**
 * WaveformDisplay Component
 * Visual waveform display for audio signals and filter responses
 * Shows time-domain waveforms with grid and measurement capabilities
 */

import React, { useMemo, useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface WaveformData {
  samples: Float32Array | number[];
  sampleRate?: number;
  duration?: number;
  peaks?: { min: number; max: number }[];
}

export interface FilterResponseData {
  frequencies: number[];
  magnitude: number[];
  phase?: number[];
}

interface WaveformDisplayProps {
  id: string;
  label: string;
  data: WaveformData | FilterResponseData;
  type?: 'waveform' | 'spectrum' | 'filter-response';
  width?: number;
  height?: number;
  className?: string;
  showGrid?: boolean;
  showMeasurements?: boolean;
  color?: string;
  backgroundColor?: string;
  gridColor?: string;
  lineWidth?: number;
  // For waveform
  timeScale?: 'auto' | 'linear' | 'logarithmic';
  amplitudeScale?: 'auto' | 'linear' | 'dB';
  // For spectrum/filter response
  frequencyScale?: 'auto' | 'linear' | 'logarithmic';
  magnitudeScale?: 'auto' | 'linear' | 'dB';
  // Interaction
  onSampleHover?: (x: number, y: number, value: number, index: number) => void;
  onSelectionChange?: (start: number, end: number) => void;
  disabled?: boolean;
}

// ============================================================================
// WAVEFORM RENDERING HELPERS
// ============================================================================

const renderWaveformPath = (
  samples: Float32Array | number[],
  width: number,
  height: number,
  padding = 10
): string => {
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  const centerY = height / 2;

  let path = '';

  if (samples.length === 0) return path;

  // Calculate points
  for (let i = 0; i < samples.length; i++) {
    const x = padding + (i / (samples.length - 1)) * innerWidth;
    const sample = samples[i] as number;
    const y = centerY - (sample * innerHeight) / 2;

    if (i === 0) {
      path += `M ${x} ${y}`;
    } else {
      path += ` L ${x} ${y}`;
    }
  }

  return path;
};

const renderSpectrumPath = (
  frequencies: number[],
  magnitude: number[],
  width: number,
  height: number,
  scale: 'linear' | 'dB' = 'dB',
  padding = 10
): string => {
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  let path = '';

  if (frequencies.length === 0 || magnitude.length === 0) return path;

  const minFreq = Math.min(...frequencies);
  const maxFreq = Math.max(...frequencies);

  for (let i = 0; i < frequencies.length; i++) {
    const freq = frequencies[i];
    const mag = magnitude[i];

    const x = padding + ((Math.log10(freq) - Math.log10(minFreq)) / (Math.log10(maxFreq) - Math.log10(minFreq))) * innerWidth;

    let y: number;
    if (scale === 'dB') {
      // Convert to dB scale (assume 0dB is top, -60dB is bottom)
      const dbValue = 20 * Math.log10(Math.max(mag, 0.0001));
      y = padding + ((0 - dbValue) / 60) * innerHeight;
      y = Math.max(padding, Math.min(height - padding, y));
    } else {
      // Linear scale
      const maxMag = Math.max(...magnitude);
      y = padding + (1 - mag / maxMag) * innerHeight;
    }

    if (i === 0) {
      path += `M ${x} ${y}`;
    } else {
      path += ` L ${x} ${y}`;
    }
  }

  return path;
};

// ============================================================================
// GRID COMPONENT
// ============================================================================

interface GridProps {
  width: number;
  height: number;
  showGrid: boolean;
  gridColor: string;
  type: 'waveform' | 'spectrum' | 'filter-response';
  frequencyRange?: [number, number];
  timeRange?: [number, number];
}

const WaveformGrid: React.FC<GridProps> = ({
  width,
  height,
  showGrid,
  gridColor,
  type,
  frequencyRange,
  timeRange,
}) => {
  if (!showGrid) return null;

  const padding = 10;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const gridLines = [];

  if (type === 'waveform' && timeRange) {
    // Time grid lines
    const [startTime, endTime] = timeRange;
    const totalTime = endTime - startTime;

    // Major grid lines (every second)
    for (let t = Math.ceil(startTime); t <= endTime; t++) {
      const x = padding + ((t - startTime) / totalTime) * innerWidth;
      gridLines.push(
        <line
          key={`time-${t}`}
          x1={x}
          y1={padding}
          x2={x}
          y2={height - padding}
          stroke={gridColor}
          strokeWidth="0.5"
          opacity="0.3"
        />
      );
    }
  }

  if ((type === 'spectrum' || type === 'filter-response') && frequencyRange) {
    // Frequency grid lines
    const [minFreq, maxFreq] = frequencyRange;

    // Major frequency marks (decades)
    const minDecade = Math.floor(Math.log10(minFreq));
    const maxDecade = Math.ceil(Math.log10(maxFreq));

    for (let decade = minDecade; decade <= maxDecade; decade++) {
      const freq = Math.pow(10, decade);
      if (freq >= minFreq && freq <= maxFreq) {
        const x = padding + ((Math.log10(freq) - Math.log10(minFreq)) / (Math.log10(maxFreq) - Math.log10(minFreq))) * innerWidth;
        gridLines.push(
          <line
            key={`freq-${freq}`}
            x1={x}
            y1={padding}
            x2={x}
            y2={height - padding}
            stroke={gridColor}
            strokeWidth="0.5"
            opacity="0.3"
          />
        );
      }
    }
  }

  // Horizontal grid lines (amplitude)
  for (let i = 0; i <= 4; i++) {
    const y = padding + (i / 4) * innerHeight;
    gridLines.push(
      <line
        key={`amplitude-${i}`}
        x1={padding}
        y1={y}
        x2={width - padding}
        y2={y}
        stroke={gridColor}
        strokeWidth="0.5"
        opacity="0.2"
      />
    );
  }

  return <g>{gridLines}</g>;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const WaveformDisplay: React.FC<WaveformDisplayProps> = ({
  // id - unused, kept for future use
  label,
  data,
  type = 'waveform',
  width = 300,
  height = 120,
  className,
  showGrid = true,
  showMeasurements = false,
  color = '#22d3ee',
  backgroundColor = 'transparent',
  gridColor = 'rgba(255, 255, 255, 0.1)',
  lineWidth = 1.5,
  // timeScale, amplitudeScale, frequencyScale - unused, kept for future grid scaling
  magnitudeScale = 'auto',
  onSampleHover,
  // onSelectionChange - unused, kept for future selection feature
  disabled = false,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverData, setHoverData] = useState<{
    x: number;
    y: number;
    value: number;
    index: number;
  } | null>(null);

  // Generate SVG path based on data type
  const pathData = useMemo(() => {
    if (type === 'waveform' && 'samples' in data) {
      return renderWaveformPath(data.samples, width, height);
    } else if ((type === 'spectrum' || type === 'filter-response') && 'frequencies' in data) {
      return renderSpectrumPath(
        data.frequencies,
        data.magnitude,
        width,
        height,
        magnitudeScale === 'dB' ? 'dB' : 'linear'
      );
    }
    return '';
  }, [data, type, width, height, magnitudeScale]);

  // Calculate ranges for grid
  const ranges = useMemo(() => {
    if (type === 'waveform' && 'samples' in data) {
      const duration = data.duration || (data.samples.length / (data.sampleRate || 44100));
      return {
        timeRange: [0, duration] as [number, number],
        amplitudeRange: [-1, 1] as [number, number],
      };
    } else if ((type === 'spectrum' || type === 'filter-response') && 'frequencies' in data) {
      const minFreq = Math.min(...data.frequencies);
      const maxFreq = Math.max(...data.frequencies);
      return {
        frequencyRange: [minFreq, maxFreq] as [number, number],
        magnitudeRange: magnitudeScale === 'dB' ? [-60, 0] as [number, number] : [0, Math.max(...data.magnitude)] as [number, number],
      };
    }
    return {};
  }, [data, type, magnitudeScale]);

  // Handle mouse interaction
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current || !onSampleHover) return;

      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Calculate value and index based on position
      let value = 0;
      let index = 0;

      if (type === 'waveform' && 'samples' in data) {
        const sampleIndex = Math.floor(((x - 10) / (width - 20)) * (data.samples.length - 1));
        index = Math.max(0, Math.min(data.samples.length - 1, sampleIndex));
        value = data.samples[index] as number;
      } else if ((type === 'spectrum' || type === 'filter-response') && 'frequencies' in data) {
        const freqIndex = Math.floor(((x - 10) / (width - 20)) * (data.frequencies.length - 1));
        index = Math.max(0, Math.min(data.frequencies.length - 1, freqIndex));
        value = data.magnitude[index];
      }

      setHoverData({ x, y, value, index });
      onSampleHover(x, y, value, index);
    },
    [data, type, width, onSampleHover]
  );

  const handleMouseLeave = useCallback(() => {
    setHoverData(null);
  }, []);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Label */}
      <label className="text-xs text-text-tertiary font-medium">
        {label}
      </label>

      {/* Waveform Display */}
      <div
        className={cn(
          'relative rounded border border-border bg-surface-primary overflow-hidden',
          disabled && 'opacity-50'
        )}
        style={{ width, height }}
      >
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Background */}
          <rect
            width={width}
            height={height}
            fill={backgroundColor}
          />

          {/* Grid */}
          <WaveformGrid
            width={width}
            height={height}
            showGrid={showGrid}
            gridColor={gridColor}
            type={type}
            frequencyRange={ranges.frequencyRange}
            timeRange={ranges.timeRange}
          />

          {/* Waveform Path */}
          {pathData && (
            <path
              d={pathData}
              fill="none"
              stroke={color}
              strokeWidth={lineWidth}
              className="drop-shadow-sm"
            />
          )}

          {/* Hover indicator */}
          {hoverData && (
            <g>
              <line
                x1={hoverData.x}
                y1={0}
                x2={hoverData.x}
                y2={height}
                stroke={color}
                strokeWidth="1"
                opacity="0.5"
                strokeDasharray="2,2"
              />
              <circle
                cx={hoverData.x}
                cy={hoverData.y}
                r="3"
                fill={color}
                stroke="white"
                strokeWidth="1"
              />
            </g>
          )}
        </svg>

        {/* Hover tooltip */}
        {hoverData && showMeasurements && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-2 left-2 px-2 py-1 bg-surface-secondary border border-border rounded text-xs text-text-primary pointer-events-none"
            style={{
              left: Math.min(hoverData.x + 10, width - 60),
              top: Math.max(hoverData.y - 20, 10),
            }}
          >
            <div>Value: {hoverData.value.toFixed(3)}</div>
            <div>Index: {hoverData.index}</div>
          </motion.div>
        )}
      </div>

      {/* Measurement display */}
      {showMeasurements && hoverData && (
        <div className="flex justify-between text-xs text-text-tertiary">
          <span>X: {hoverData.x.toFixed(1)}</span>
          <span>Y: {hoverData.y.toFixed(1)}</span>
          <span>Value: {hoverData.value.toFixed(4)}</span>
        </div>
      )}
    </div>
  );
};

export default WaveformDisplay;