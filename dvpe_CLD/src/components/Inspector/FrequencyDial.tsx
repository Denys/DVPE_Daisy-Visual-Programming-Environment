/**
 * FrequencyDial Component
 * Specialized rotary dial for frequency parameters with logarithmic scaling
 * Shows frequency scale markings and note names for musical parameters
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ParameterCurve } from '@/types';
import { formatFrequency, midiToNoteName } from '@/lib/utils';

interface FrequencyDialProps {
  id: string;
  label: string;
  value: number; // Frequency in Hz
  min: number;
  max: number;
  step?: number;
  curve?: ParameterCurve;
  unit?: string;
  cvModulatable?: boolean;
  onChange: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showNoteNames?: boolean;
  musicalScale?: boolean;
}

// ============================================================================
// FREQUENCY SCALE MARKINGS
// ============================================================================

const generateFrequencyMarks = (min: number, max: number) => {
  const marks: Array<{ value: number; label: string; major: boolean }> = [];

  // Generate major marks (musical notes)
  if (min <= 440 && max >= 440) {
    marks.push({ value: 440, label: 'A4', major: true });
  }

  // Generate octave marks
  const minNote = Math.max(0, Math.floor(12 * Math.log2(min / 440)));
  const maxNote = Math.min(127, Math.ceil(12 * Math.log2(max / 440)));

  for (let note = minNote; note <= maxNote; note += 12) {
    const freq = 440 * Math.pow(2, (note - 69) / 12);
    if (freq >= min && freq <= max) {
      const noteName = midiToNoteName(note);
      marks.push({
        value: freq,
        label: noteName,
        major: note % 12 === 9 // A notes are major marks
      });
    }
  }

  // Add decade marks for non-musical ranges
  if (max / min > 100) {
    const decades = Math.log10(max / min);
    for (let i = 0; i <= Math.ceil(decades); i++) {
      const decadeValue = min * Math.pow(10, i);
      if (decadeValue >= min && decadeValue <= max && !marks.find(m => Math.abs(m.value - decadeValue) / decadeValue < 0.1)) {
        marks.push({
          value: decadeValue,
          label: `${decadeValue >= 1000 ? (decadeValue / 1000).toFixed(1) + 'k' : decadeValue.toFixed(0)}Hz`,
          major: i % 2 === 0
        });
      }
    }
  }

  return marks.sort((a, b) => a.value - b.value);
};

// ============================================================================
// COMPONENT
// ============================================================================

const FrequencyDial: React.FC<FrequencyDialProps> = ({
  id,
  label,
  value,
  min,
  max,
  step = 0.01,
  curve = ParameterCurve.LOGARITHMIC,
  // unit - unused, kept in props for future use
  cvModulatable = false,
  onChange,
  size = 'md',
  showNoteNames = false,
  musicalScale = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(value));
  const dialRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const startValue = useRef(0);

  // Size configurations
  const sizeConfig = useMemo(
    () => ({
      sm: { dial: 'w-12 h-12', stroke: 2, font: 'text-xs', marks: 4 },
      md: { dial: 'w-16 h-16', stroke: 3, font: 'text-sm', marks: 6 },
      lg: { dial: 'w-20 h-20', stroke: 4, font: 'text-base', marks: 8 },
    }),
    []
  );

  const config = sizeConfig[size];

  // Generate frequency marks
  const frequencyMarks = useMemo(() => {
    if (!musicalScale) return [];
    return generateFrequencyMarks(min, max);
  }, [min, max, musicalScale]);

  // Calculate rotation angle (270 degrees range, -135 to 135)
  const normalizedValue = useMemo(() => {
    if (curve === ParameterCurve.LOGARITHMIC) {
      const minLog = Math.log(Math.max(min, 0.0001));
      const maxLog = Math.log(max);
      return (Math.log(Math.max(value, 0.0001)) - minLog) / (maxLog - minLog);
    }
    return (value - min) / (max - min);
  }, [value, min, max, curve]);

  const rotation = -135 + Math.max(0, Math.min(1, normalizedValue)) * 270;

  // Handle mouse drag
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      startY.current = e.clientY;
      startValue.current = normalizedValue;

      const handleMouseMove = (e: MouseEvent) => {
        const deltaY = startY.current - e.clientY;
        const sensitivity = e.shiftKey ? 0.001 : 0.003;
        const newNormalized = Math.max(0, Math.min(1, startValue.current + deltaY * sensitivity));

        let newValue: number;
        if (curve === ParameterCurve.LOGARITHMIC) {
          const minLog = Math.log(Math.max(min, 0.0001));
          const maxLog = Math.log(max);
          newValue = Math.exp(minLog + newNormalized * (maxLog - minLog));
        } else {
          newValue = min + newNormalized * (max - min);
        }

        // Snap to step
        const steppedValue = Math.round(newValue / step) * step;
        onChange(Math.max(min, Math.min(max, steppedValue)));
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [normalizedValue, curve, min, max, step, onChange]
  );

  // Handle scroll wheel
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const multiplier = e.shiftKey ? 0.1 : 1;
      const factor = e.deltaY > 0 ? 0.95 : 1.05;
      const newValue = value * Math.pow(factor, multiplier * 10);
      onChange(Math.max(min, Math.min(max, newValue)));
    },
    [value, min, max, onChange]
  );

  // Handle double-click for text input
  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
    setInputValue(String(Math.round(value * 100) / 100));
  }, [value]);

  // Handle text input submit
  const handleInputSubmit = useCallback(() => {
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed)) {
      onChange(Math.max(min, Math.min(max, parsed)));
    }
    setIsEditing(false);
  }, [inputValue, min, max, onChange]);

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Label */}
      <label htmlFor={id} className="text-xs text-text-tertiary font-medium">
        {label}
      </label>

      {/* Dial Container */}
      <div className="relative">
        {/* Frequency Marks */}
        {musicalScale && frequencyMarks.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {frequencyMarks.map((mark, index) => {
                const markNormalized = (mark.value - min) / (max - min);
                if (markNormalized < 0 || markNormalized > 1) return null;

                const angle = -135 + markNormalized * 270;
                const radius = 45;
                const x1 = 50 + Math.cos((angle * Math.PI) / 180) * radius;
                const y1 = 50 + Math.sin((angle * Math.PI) / 180) * radius;
                const x2 = 50 + Math.cos((angle * Math.PI) / 180) * (radius + (mark.major ? 8 : 5));
                const y2 = 50 + Math.sin((angle * Math.PI) / 180) * (radius + (mark.major ? 8 : 5));

                return (
                  <g key={index}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={mark.major ? "#22d3ee" : "rgba(255,255,255,0.3)"}
                      strokeWidth={mark.major ? 1.5 : 1}
                    />
                    {mark.major && (
                      <text
                        x={50 + Math.cos((angle * Math.PI) / 180) * (radius + 12)}
                        y={50 + Math.sin((angle * Math.PI) / 180) * (radius + 12)}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="text-[6px] fill-text-tertiary"
                      >
                        {showNoteNames ? mark.label : mark.value >= 1000 ? `${(mark.value / 1000).toFixed(1)}k` : mark.value.toFixed(0)}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* Main Dial */}
        <div
          ref={dialRef}
          className={cn(
            config.dial,
            'relative cursor-ns-resize select-none',
            'rounded-full bg-surface-primary border-2 border-border',
            isDragging && 'border-audio-primary',
            cvModulatable && 'ring-2 ring-cv-primary/30'
          )}
          onMouseDown={handleMouseDown}
          onWheel={handleWheel}
          onDoubleClick={handleDoubleClick}
          role="slider"
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          tabIndex={0}
        >
          {/* SVG Arc */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
          >
            {/* Background arc */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={config.stroke}
              strokeLinecap="round"
              strokeDasharray="188.5 62.83"
              transform="rotate(-135 50 50)"
            />

            {/* Value arc */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={cvModulatable ? '#facc15' : '#22d3ee'}
              strokeWidth={config.stroke}
              strokeLinecap="round"
              strokeDasharray={`${Math.max(0, Math.min(1, normalizedValue)) * 188.5} 251.33`}
              transform="rotate(-135 50 50)"
              className="transition-all duration-75"
            />
          </svg>

          {/* Pointer */}
          <motion.div
            className="absolute top-1/2 left-1/2 w-0.5 h-2/5 -ml-px origin-bottom"
            style={{
              transform: `translateY(-100%) rotate(${rotation}deg)`,
            }}
          >
            <div className="w-full h-1/2 bg-text-primary rounded-full" />
          </motion.div>

          {/* CV indicator dot */}
          {cvModulatable && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-1.5 h-1.5 rounded-full bg-cv-primary" />
          )}
        </div>
      </div>

      {/* Value Display / Input */}
      {isEditing ? (
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleInputSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleInputSubmit();
            else if (e.key === 'Escape') setIsEditing(false);
          }}
          className={cn(
            config.font,
            'w-16 px-1 py-0.5 text-center rounded bg-surface-tertiary border border-audio-primary',
            'text-text-primary focus:outline-none'
          )}
          autoFocus
        />
      ) : (
        <span
          className={cn(config.font, 'text-text-secondary font-mono cursor-pointer hover:text-text-primary')}
          onDoubleClick={handleDoubleClick}
        >
          {formatFrequency(value)}
        </span>
      )}
    </div>
  );
};

export default FrequencyDial;