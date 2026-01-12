/**
 * ParameterToggle Component
 * Boolean toggle switch for on/off parameters
 */

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface ParameterToggleProps {
  id: string;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

const ParameterToggle: React.FC<ParameterToggleProps> = ({
  id,
  label,
  value,
  onChange,
  disabled = false,
}) => {
  const handleToggle = useCallback(() => {
    if (!disabled) {
      onChange(!value);
    }
  }, [value, onChange, disabled]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleToggle();
      }
    },
    [handleToggle]
  );

  return (
    <div className="flex items-center justify-between">
      {/* Label */}
      <label htmlFor={id} className="text-xs text-text-tertiary font-medium">
        {label}
      </label>

      {/* Toggle Switch */}
      <button
        id={id}
        role="switch"
        aria-checked={value}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          'relative w-10 h-5 rounded-full transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-audio-primary/50',
          value ? 'bg-audio-primary' : 'bg-surface-tertiary',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <motion.div
          className={cn(
            'absolute top-0.5 w-4 h-4 rounded-full',
            'bg-text-primary shadow-md'
          )}
          initial={false}
          animate={{
            left: value ? '22px' : '2px',
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
        />
      </button>
    </div>
  );
};

export default ParameterToggle;
