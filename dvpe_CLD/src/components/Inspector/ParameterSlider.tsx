/**
 * ParameterSlider Component
 * Horizontal slider control for numeric parameters
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ParameterCurve } from '@/types';
import { formatNumber, clamp } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface ParameterSliderProps {
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
  showValue?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

const ParameterSlider: React.FC<ParameterSliderProps> = ({
  id,
  label,
  value,
  min,
  max,
  step = 0.01,
  // curve - unused, kept for future logarithmic scaling
  unit,
  cvModulatable = false,
  onChange,
  showValue = true,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Calculate normalized value (0-1)
  const normalizedValue = useMemo(() => {
    return (value - min) / (max - min);
  }, [value, min, max]);

  // Handle slider interaction
  const updateValue = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const normalized = clamp((clientX - rect.left) / rect.width, 0, 1);
      const newValue = min + normalized * (max - min);

      // Snap to step
      const steppedValue = Math.round(newValue / step) * step;
      onChange(clamp(steppedValue, min, max));
    },
    [min, max, step, onChange]
  );

  // Mouse handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      updateValue(e.clientX);

      const handleMouseMove = (e: MouseEvent) => {
        updateValue(e.clientX);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [updateValue]
  );

  // Format display value
  const displayValue = useMemo(() => {
    const formatted = formatNumber(value, step < 1 ? 2 : 0);
    return unit ? `${formatted}${unit}` : formatted;
  }, [value, step, unit]);

  return (
    <div className="flex flex-col gap-1.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs text-text-tertiary font-medium">
          {label}
          {cvModulatable && (
            <span className="ml-1 text-cv-primary text-[10px]">●</span>
          )}
        </label>
        {showValue && (
          <span className="text-xs text-text-secondary font-mono">
            {displayValue}
          </span>
        )}
      </div>

      {/* Slider Track */}
      <div
        ref={sliderRef}
        className={cn(
          'relative h-2 rounded-full bg-surface-primary border border-border cursor-pointer',
          isDragging && 'border-audio-primary'
        )}
        onMouseDown={handleMouseDown}
        role="slider"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        tabIndex={0}
      >
        {/* Fill */}
        <motion.div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full',
            cvModulatable ? 'bg-cv-primary' : 'bg-audio-primary'
          )}
          style={{ width: `${normalizedValue * 100}%` }}
          layoutId={`slider-fill-${id}`}
        />

        {/* Thumb */}
        <motion.div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full',
            'bg-text-primary border-2 border-surface-secondary',
            'shadow-md cursor-grab',
            isDragging && 'cursor-grabbing scale-110'
          )}
          style={{
            left: `calc(${normalizedValue * 100}% - 8px)`,
          }}
        />
      </div>
    </div>
  );
};

export default ParameterSlider;
