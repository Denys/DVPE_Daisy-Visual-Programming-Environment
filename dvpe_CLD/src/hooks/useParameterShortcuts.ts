/**
 * useParameterShortcuts Hook
 * Provides keyboard shortcuts for parameter controls
 * Ensures consistent keyboard interaction across all parameter controls
 */

import { useCallback } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface UseParameterShortcutsProps {
  onIncrement?: (step?: number) => void;
  onDecrement?: (step?: number) => void;
  onReset?: () => void;
  onFineIncrement?: () => void;
  onFineDecrement?: () => void;
  onToggle?: () => void;
  onEdit?: () => void;
  onSubmit?: () => void;
  onCancel?: () => void;
  disabled?: boolean;
  stepSize?: number;
  fineStepSize?: number;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * Hook for parameter control keyboard shortcuts
 * Provides consistent keyboard navigation for all parameter controls
 */
export const useParameterShortcuts = ({
  onIncrement,
  onDecrement,
  onReset,
  onFineIncrement,
  onFineDecrement,
  onToggle,
  onEdit,
  onSubmit,
  onCancel,
  disabled = false,
  stepSize = 0.01,
  fineStepSize = 0.001,
}: UseParameterShortcutsProps) => {
  
  // Handle keyboard events
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (disabled) return;
    
    const { key, shiftKey, ctrlKey, metaKey, altKey } = e;
    const isModifierPressed = ctrlKey || metaKey || altKey;
    
    // Prevent default for our shortcuts
    const preventDefault = () => {
      if (!isModifierPressed) {
        e.preventDefault();
      }
    };
    
    switch (key) {
      case 'ArrowUp':
        preventDefault();
        if (shiftKey && onFineIncrement) {
          onFineIncrement();
        } else if (onIncrement) {
          onIncrement();
        }
        break;
        
      case 'ArrowDown':
        preventDefault();
        if (shiftKey && onFineDecrement) {
          onFineDecrement();
        } else if (onDecrement) {
          onDecrement();
        }
        break;
        
      case 'PageUp':
        preventDefault();
        if (onIncrement) onIncrement(stepSize * 10);
        break;
        
      case 'PageDown':
        preventDefault();
        if (onDecrement) onDecrement(stepSize * 10);
        break;
        
      case 'Home':
        preventDefault();
        if (onDecrement) onDecrement(Number.MAX_SAFE_INTEGER);
        break;
        
      case 'End':
        preventDefault();
        if (onIncrement) onIncrement(Number.MAX_SAFE_INTEGER);
        break;
        
      case ' ':
      case 'Enter':
        preventDefault();
        if (onToggle) {
          onToggle();
        } else if (onEdit) {
          onEdit();
        }
        break;
        
      case 'Escape':
        if (onCancel) onCancel();
        break;
        
      case 'r':
      case 'R':
        if (!isModifierPressed && onReset) {
          preventDefault();
          onReset();
        }
        break;
        
      default:
        break;
    }
  }, [
    disabled,
    onIncrement,
    onDecrement,
    onReset,
    onFineIncrement,
    onFineDecrement,
    onToggle,
    onEdit,
    onSubmit,
    onCancel,
    stepSize,
    fineStepSize,
  ]);
  
  // Attach/detach event listener
  // This would typically be done in useEffect, but we'll expose the handler
  // for components to use as needed
  
  return {
    handleKeyDown,
  };
};

// ============================================================================
// SHORTCUT DESCRIPTIONS
// ============================================================================

export const PARAMETER_SHORTCUTS = {
  increment: '↑ / PageUp',
  decrement: '↓ / PageDown',
  fineIncrement: 'Shift + ↑',
  fineDecrement: 'Shift + ↓',
  reset: 'R',
  toggle: 'Space / Enter',
  edit: 'Enter',
  cancel: 'Esc',
  min: 'Home',
  max: 'End',
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format shortcut key for display
 */
export const formatShortcutKey = (key: string): string => {
  return key
    .replace('mod', 'Cmd')
    .replace('shift', 'Shift')
    .replace('alt', 'Alt')
    .replace('ctrl', 'Ctrl')
    .replace('+', ' + ');
};

/**
 * Check if current platform uses Cmd instead of Ctrl
 */
export const isMac = (): boolean => {
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
};

/**
 * Get platform-appropriate modifier key
 */
export const getModifierKey = (): string => {
  return isMac() ? 'Cmd' : 'Ctrl';
};

/**
 * Get default shortcuts for parameter controls
 */
export const getDefaultParameterShortcuts = () => [
  { key: '↑/↓', description: 'Adjust value' },
  { key: 'Shift+↑/↓', description: 'Fine adjust' },
  { key: 'PageUp/PageDown', description: 'Large step' },
  { key: 'Home/End', description: 'Min/Max' },
  { key: 'R', description: 'Reset' },
  { key: 'Enter/Space', description: 'Toggle/Edit' },
  { key: 'Esc', description: 'Cancel' },
];

// ============================================================================
// PARAMETER CONTROL UTILITIES
// ============================================================================

/**
 * Apply parameter curve to value
 */
export const applyParameterCurve = (
  value: number,
  min: number,
  max: number,
  curve: 'linear' | 'logarithmic' | 'exponential' = 'linear'
): number => {
  const normalizedValue = (value - min) / (max - min);
  
  switch (curve) {
    case 'logarithmic':
      const minLog = Math.log(Math.max(min, 0.0001));
      const maxLog = Math.log(max);
      return Math.exp(minLog + normalizedValue * (maxLog - minLog));
      
    case 'exponential':
      return min + Math.pow(normalizedValue, 2) * (max - min);
      
    case 'linear':
    default:
      return min + normalizedValue * (max - min);
  }
};

/**
 * Clamp value to range
 */
export const clampParameter = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Snap value to step
 */
export const snapToStep = (value: number, step: number): number => {
  return Math.round(value / step) * step;
};

/**
 * Get step size based on modifier keys
 */
export const getStepSize = (
  baseStep: number,
  fineStep: number,
  shiftKey: boolean,
  ctrlKey: boolean,
  metaKey: boolean,
  altKey: boolean
): number => {
  if (shiftKey) {
    return fineStep;
  } else if (ctrlKey || metaKey || altKey) {
    return baseStep * 10;
  }
  return baseStep;
};