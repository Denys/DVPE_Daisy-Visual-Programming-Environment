/**
 * ParameterSelect Component
 * Dropdown select control for enum parameters
 */

import React, { useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface Option {
  value: string;
  label: string;
}

interface ParameterSelectProps {
  id: string;
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

const ParameterSelect: React.FC<ParameterSelectProps> = ({
  id,
  label,
  value,
  options,
  onChange,
  disabled = false,
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label */}
      <label htmlFor={id} className="text-xs text-text-tertiary font-medium">
        {label}
      </label>

      {/* Select */}
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            'w-full appearance-none px-3 py-1.5 pr-8 rounded',
            'bg-surface-primary border border-border',
            'text-sm text-text-primary',
            'focus:outline-none focus:ring-2 focus:ring-audio-primary/50 focus:border-audio-primary',
            'cursor-pointer',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Dropdown Icon */}
        <ChevronDown
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4',
            'text-text-tertiary pointer-events-none'
          )}
        />
      </div>
    </div>
  );
};

export default ParameterSelect;
