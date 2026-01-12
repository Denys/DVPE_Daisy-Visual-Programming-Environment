/**
 * WaveformSelector Component
 * Visual waveform selector for oscillator parameters
 * Shows actual waveform shapes for better user experience
 */

import React, { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export enum WaveformType {
  SINE = 'sine',
  SQUARE = 'square',
  SAWTOOTH = 'sawtooth',
  TRIANGLE = 'triangle',
  NOISE = 'noise',
  USER = 'user',
}

interface WaveformOption {
  value: WaveformType;
  label: string;
  svg: React.ReactNode;
}

interface WaveformSelectorProps {
  id: string;
  label: string;
  value: WaveformType;
  onChange: (value: WaveformType) => void;
  disabled?: boolean;
}

// ============================================================================
// WAVEFORM SVG GENERATORS
// ============================================================================

const WaveformSVG: React.FC<{ type: WaveformType; size?: number }> = ({
  type,
  size = 24
}) => {
  const strokeWidth = 1.5;
  const viewBox = '0 0 32 16';

  const getPath = () => {
    switch (type) {
      case WaveformType.SINE:
        return 'M2,8 Q8,2 16,8 T30,8';
      case WaveformType.SQUARE:
        return 'M2,2 L12,2 L12,14 L20,14 L20,2 L30,2 L30,14';
      case WaveformType.SAWTOOTH:
        return 'M2,2 L12,14 L22,2 L30,14';
      case WaveformType.TRIANGLE:
        return 'M2,14 L12,2 L22,14';
      case WaveformType.NOISE:
        // Generate random-looking noise path
        return 'M2,8 L6,12 L10,4 L14,10 L18,6 L22,14 L26,8 L30,11';
      case WaveformType.USER:
        return 'M2,12 L6,8 L10,10 L14,6 L18,9 L22,5 L26,7 L30,4';
      default:
        return 'M2,8 L30,8';
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      className="flex-shrink-0"
    >
      <path
        d={getPath()}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// ============================================================================
// WAVEFORM OPTIONS
// ============================================================================

const WAVEFORM_OPTIONS: WaveformOption[] = [
  {
    value: WaveformType.SINE,
    label: 'Sine',
    svg: <WaveformSVG type={WaveformType.SINE} />,
  },
  {
    value: WaveformType.SQUARE,
    label: 'Square',
    svg: <WaveformSVG type={WaveformType.SQUARE} />,
  },
  {
    value: WaveformType.SAWTOOTH,
    label: 'Sawtooth',
    svg: <WaveformSVG type={WaveformType.SAWTOOTH} />,
  },
  {
    value: WaveformType.TRIANGLE,
    label: 'Triangle',
    svg: <WaveformSVG type={WaveformType.TRIANGLE} />,
  },
  {
    value: WaveformType.NOISE,
    label: 'Noise',
    svg: <WaveformSVG type={WaveformType.NOISE} />,
  },
  {
    value: WaveformType.USER,
    label: 'Custom',
    svg: <WaveformSVG type={WaveformType.USER} />,
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

const WaveformSelector: React.FC<WaveformSelectorProps> = ({
  // id - unused, kept for accessibility future use
  label,
  value,
  onChange,
  disabled = false,
}) => {
  const selectedOption = useMemo(
    () => WAVEFORM_OPTIONS.find((option) => option.value === value) || WAVEFORM_OPTIONS[0],
    [value]
  );

  const handleSelect = useCallback(
    (waveform: WaveformType) => {
      if (!disabled) {
        onChange(waveform);
      }
    },
    [onChange, disabled]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, waveform: WaveformType) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSelect(waveform);
      }
    },
    [handleSelect]
  );

  return (
    <div className="flex flex-col gap-2">
      {/* Label */}
      <label className="text-xs text-text-tertiary font-medium">
        {label}
      </label>

      {/* Selected Waveform Display */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-primary border border-border">
        <WaveformSVG type={value} size={32} />
        <div className="flex-1">
          <div className="text-sm font-medium text-text-primary">
            {selectedOption.label}
          </div>
          <div className="text-xs text-text-tertiary">
            Current waveform
          </div>
        </div>
      </div>

      {/* Waveform Grid */}
      <div className="grid grid-cols-3 gap-2">
        {WAVEFORM_OPTIONS.map((option) => {
          const isSelected = option.value === value;

          return (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              onKeyDown={(e) => handleKeyDown(e, option.value)}
              disabled={disabled}
              className={cn(
                'flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all',
                'hover:bg-surface-tertiary focus:outline-none focus:ring-2 focus:ring-audio-primary/50',
                isSelected
                  ? 'border-audio-primary bg-audio-primary/10 text-audio-primary'
                  : 'border-border text-text-secondary hover:border-border/80',
                disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent'
              )}
              whileHover={{ scale: disabled ? 1 : 1.02 }}
              whileTap={{ scale: disabled ? 1 : 0.98 }}
              role="option"
              aria-selected={isSelected}
              tabIndex={0}
            >
              {option.svg}
              <span className="text-xs font-medium">
                {option.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default WaveformSelector;