/**
 * ParameterDial Component
 * Rotary dial control for numeric parameters with CV modulation indicator
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ParameterCurve } from '@/types';
import { formatNumber, clamp } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface ParameterDialProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  curve?: ParameterCurve;
  unit?: string;
  cvModulatable?: boolean;
  onChange: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

// ============================================================================
// HELPERS
// ============================================================================

const applyParameterCurve = (
  normalizedValue: number,
  curve: ParameterCurve,
  min: number,
  max: number
): number => {
  switch (curve) {
    case ParameterCurve.LOGARITHMIC:
      // Logarithmic scaling (good for frequency)
      const minLog = Math.log(Math.max(min, 0.0001));
      const maxLog = Math.log(max);
      return Math.exp(minLog + normalizedValue * (maxLog - minLog));

    case ParameterCurve.EXPONENTIAL:
      // Exponential scaling (good for amplitude)
      return min + Math.pow(normalizedValue, 2) * (max - min);

    case ParameterCurve.LINEAR:
    default:
      return min + normalizedValue * (max - min);
  }
};

const invertParameterCurve = (
  value: number,
  curve: ParameterCurve,
  min: number,
  max: number
): number => {
  switch (curve) {
    case ParameterCurve.LOGARITHMIC:
      const minLog = Math.log(Math.max(min, 0.0001));
      const maxLog = Math.log(max);
      return (Math.log(Math.max(value, 0.0001)) - minLog) / (maxLog - minLog);

    case ParameterCurve.EXPONENTIAL:
      return Math.sqrt((value - min) / (max - min));

    case ParameterCurve.LINEAR:
    default:
      return (value - min) / (max - min);
  }
};

// ============================================================================
// COMPONENT
// ============================================================================

const ParameterDial: React.FC<ParameterDialProps> = ({
  id,
  label,
  value,
  min,
  max,
  step = 0.01,
  curve = ParameterCurve.LINEAR,
  unit,
  cvModulatable = false,
  onChange,
  size = 'md',
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
      sm: { dial: 'w-10 h-10', stroke: 3, font: 'text-xs' },
      md: { dial: 'w-14 h-14', stroke: 4, font: 'text-sm' },
      lg: { dial: 'w-20 h-20', stroke: 5, font: 'text-base' },
    }),
    []
  );

  const config = sizeConfig[size];

  // Calculate rotation angle (270 degrees range, -135 to 135)
  const normalizedValue = invertParameterCurve(value, curve, min, max);
  const rotation = -135 + normalizedValue * 270;

  // Handle mouse drag
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      startY.current = e.clientY;
      startValue.current = normalizedValue;

      const handleMouseMove = (e: MouseEvent) => {
        const deltaY = startY.current - e.clientY;
        const sensitivity = e.shiftKey ? 0.001 : 0.005;
        const newNormalized = clamp(startValue.current + deltaY * sensitivity, 0, 1);
        const newValue = applyParameterCurve(newNormalized, curve, min, max);

        // Snap to step
        const steppedValue = Math.round(newValue / step) * step;
        onChange(clamp(steppedValue, min, max));
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
      const delta = e.deltaY > 0 ? -step : step;
      const multiplier = e.shiftKey ? 0.1 : 1;
      onChange(clamp(value + delta * multiplier * 10, min, max));
    },
    [value, step, min, max, onChange]
  );

  // Handle double-click for text input
  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
    setInputValue(String(value));
  }, [value]);

  // Handle text input submit
  const handleInputSubmit = useCallback(() => {
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed)) {
      onChange(clamp(parsed, min, max));
    }
    setIsEditing(false);
  }, [inputValue, min, max, onChange]);

  // Handle input key down
  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleInputSubmit();
      } else if (e.key === 'Escape') {
        setIsEditing(false);
      }
    },
    [handleInputSubmit]
  );

  // Format display value
  const displayValue = useMemo(() => {
    const formatted = formatNumber(value, step < 1 ? 2 : 0);
    return unit ? `${formatted}${unit}` : formatted;
  }, [value, step, unit]);

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Label */}
      <label htmlFor={id} className="text-xs text-text-tertiary font-medium">
        {label}
      </label>

      {/* Dial */}
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
            strokeDasharray="188.5 62.83" // 270 degree arc
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
            strokeDasharray={`${normalizedValue * 188.5} 251.33`}
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

      {/* Value Display / Input */}
      {isEditing ? (
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleInputSubmit}
          onKeyDown={handleInputKeyDown}
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
          {displayValue}
        </span>
      )}
    </div>
  );
};

export default ParameterDial;
