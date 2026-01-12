/**
 * MIDINoteSelector Component
 * Visual MIDI note selector with piano keyboard interface
 * Allows selecting notes by clicking on piano keys or using dropdown
 */

import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { midiToFreq } from '@/lib/utils';

interface MIDINoteSelectorProps {
  id: string;
  label: string;
  value: number; // MIDI note number (0-127)
  onChange: (value: number) => void;
  disabled?: boolean;
  showFrequency?: boolean;
  octaveOffset?: number; // Starting octave (default: 1)
  octaveRange?: number; // Number of octaves to show (default: 4)
}

// ============================================================================
// PIANO KEYBOARD COMPONENT
// ============================================================================

interface PianoKeyProps {
  note: number;
  isBlack: boolean;
  isPressed: boolean;
  label: string;
  frequency: number;
  onClick: () => void;
  disabled: boolean;
}

const PianoKey: React.FC<PianoKeyProps> = ({
  // note is passed but used in parent for key prop, not needed here
  isBlack,
  isPressed,
  label,
  frequency,
  onClick,
  disabled,
}) => {
  const handleClick = useCallback(() => {
    if (!disabled) {
      onClick();
    }
  }, [onClick, disabled]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  return (
    <button
      className={cn(
        'relative flex flex-col items-center justify-end pb-1 text-xs font-medium transition-all duration-75',
        'focus:outline-none focus:ring-2 focus:ring-audio-primary/50',
        isBlack
          ? cn(
            'w-4 h-20 -mx-0.5 z-10 bg-text-primary border border-text-primary/30',
            'text-text-primary hover:bg-text-secondary active:bg-text-tertiary',
            isPressed && 'bg-text-secondary scale-95',
            disabled && 'opacity-50 cursor-not-allowed hover:bg-text-primary'
          )
          : cn(
            'w-6 h-32 bg-surface-primary border border-border',
            'text-text-secondary hover:bg-surface-secondary active:bg-surface-tertiary',
            isPressed && 'bg-surface-secondary scale-95',
            disabled && 'opacity-50 cursor-not-allowed hover:bg-surface-primary'
          )
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      role="button"
      aria-label={`Note ${label} (${frequency.toFixed(1)} Hz)`}
      tabIndex={disabled ? -1 : 0}
    >
      {/* Note label for white keys */}
      {!isBlack && (
        <div className="text-center">
          <div className="text-[8px] leading-none">{label}</div>
          {frequency < 1000 && (
            <div className="text-[7px] text-text-tertiary leading-none">
              {frequency.toFixed(0)}Hz
            </div>
          )}
        </div>
      )}
    </button>
  );
};

// ============================================================================
// NOTE PATTERN GENERATOR
// ============================================================================

const generateNotePattern = (startOctave: number, octaveRange: number) => {
  const notes = [];

  // Note names for each octave
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  for (let octave = startOctave; octave < startOctave + octaveRange; octave++) {
    for (let noteIndex = 0; noteIndex < 12; noteIndex++) {
      const noteNumber = (octave + 1) * 12 + noteIndex; // MIDI note calculation
      const noteName = noteNames[noteIndex];
      const isBlack = [1, 3, 6, 8, 10].includes(noteIndex);

      if (noteNumber <= 127) {
        notes.push({
          number: noteNumber,
          name: `${noteName}${octave}`,
          isBlack,
          frequency: midiToFreq(noteNumber),
        });
      }
    }
  }

  return notes;
};

// ============================================================================
// COMPONENT
// ============================================================================

const MIDINoteSelector: React.FC<MIDINoteSelectorProps> = ({
  // id is available but not used currently
  label,
  value,
  onChange,
  disabled = false,
  // showFrequency is available but not used currently
  octaveOffset = 2, // Start from C2
  octaveRange = 3,  // Show 3 octaves
}) => {
  const [selectedOctave, setSelectedOctave] = useState(octaveOffset);
  const [showDropdown, setShowDropdown] = useState(false);

  // Generate note pattern for current octave range
  const notes = useMemo(
    () => generateNotePattern(selectedOctave, octaveRange),
    [selectedOctave, octaveRange]
  );

  // Current octave notes
  const currentOctaveNotes = useMemo(() => {
    const startNote = (selectedOctave + 1) * 12;
    const endNote = startNote + 12 * octaveRange;
    return notes.filter(note => note.number >= startNote && note.number < endNote);
  }, [notes, selectedOctave, octaveRange]);

  // Handle note selection
  const handleNoteSelect = useCallback(
    (noteNumber: number) => {
      if (!disabled) {
        onChange(noteNumber);
        setShowDropdown(false);
      }
    },
    [onChange, disabled]
  );

  // Handle octave change
  const handleOctaveChange = useCallback(
    (direction: 'prev' | 'next') => {
      if (!disabled) {
        setSelectedOctave(prev => {
          if (direction === 'prev') {
            return Math.max(0, prev - 1);
          } else {
            return Math.min(9, prev + 1); // Max octave 9 (C10)
          }
        });
      }
    },
    [disabled]
  );

  // notesByOctave - prepared for future dropdown feature
  // const notesByOctave = useMemo(() => {...}, [notes]);

  const currentNote = notes.find(note => note.number === value);
  const currentNoteLabel = currentNote ? `${currentNote.name} (${currentNote.frequency.toFixed(1)}Hz)` : 'No note';

  return (
    <div className="flex flex-col gap-3">
      {/* Label */}
      <label className="text-xs text-text-tertiary font-medium">
        {label}
      </label>

      {/* Current Selection Display */}
      <div className="flex items-center gap-2">
        <div className="flex-1 p-2 rounded bg-surface-primary border border-border">
          <div className="text-sm font-medium text-text-primary">
            {currentNoteLabel}
          </div>
        </div>

        {/* Dropdown Toggle */}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={disabled}
          className={cn(
            'px-3 py-2 text-sm rounded border border-border',
            'bg-surface-primary hover:bg-surface-secondary',
            'focus:outline-none focus:ring-2 focus:ring-audio-primary/50',
            disabled && 'opacity-50 cursor-not-allowed hover:bg-surface-primary'
          )}
        >
          Notes
        </button>
      </div>

      {/* Piano Keyboard */}
      <div className="bg-surface-primary border border-border rounded-lg p-3">
        {/* Octave Navigation */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => handleOctaveChange('prev')}
            disabled={disabled || selectedOctave <= 0}
            className="px-2 py-1 text-xs rounded bg-surface-tertiary hover:bg-surface-secondary disabled:opacity-50"
          >
            ◀
          </button>

          <div className="text-sm font-medium text-text-secondary">
            Octaves {selectedOctave} - {selectedOctave + octaveRange - 1}
          </div>

          <button
            onClick={() => handleOctaveChange('next')}
            disabled={disabled || selectedOctave >= 9}
            className="px-2 py-1 text-xs rounded bg-surface-tertiary hover:bg-surface-secondary disabled:opacity-50"
          >
            ▶
          </button>
        </div>

        {/* Piano Keys */}
        <div className="relative flex items-end justify-center">
          {/* White Keys */}
          <div className="flex">
            {currentOctaveNotes
              .filter(note => !note.isBlack)
              .map((note) => (
                <PianoKey
                  key={`white-${note.number}`}
                  note={note.number}
                  isBlack={false}
                  isPressed={value === note.number}
                  label={note.name}
                  frequency={note.frequency}
                  onClick={() => handleNoteSelect(note.number)}
                  disabled={disabled}
                />
              ))}
          </div>

          {/* Black Keys */}
          <div className="absolute flex">
            {currentOctaveNotes
              .filter(note => note.isBlack)
              .map((note, index) => {
                // Black keys positioned between white keys
                return (
                  <div
                    key={`black-${note.number}`}
                    className="relative"
                    style={{ marginLeft: index === 0 ? '-1rem' : '-0.5rem' }}
                  >
                    <PianoKey
                      note={note.number}
                      isBlack={true}
                      isPressed={value === note.number}
                      label={note.name}
                      frequency={note.frequency}
                      onClick={() => handleNoteSelect(note.number)}
                      disabled={disabled}
                    />
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Quick Octave Selector */}
      <div className="grid grid-cols-12 gap-1">
        {Array.from({ length: 12 }, (_, i) => {
          const noteNumber = (selectedOctave + 1) * 12 + i;
          const note = notes.find(n => n.number === noteNumber);
          if (!note) return null;

          const isBlack = [1, 3, 6, 8, 10].includes(i);

          return (
            <button
              key={noteNumber}
              onClick={() => handleNoteSelect(noteNumber)}
              disabled={disabled}
              className={cn(
                'text-xs py-1 px-1 rounded border transition-colors',
                isBlack
                  ? 'bg-text-primary text-text-primary border-text-primary/30 hover:bg-text-secondary'
                  : 'bg-surface-tertiary text-text-secondary border-border hover:bg-surface-secondary',
                value === noteNumber && (isBlack ? 'bg-text-secondary' : 'bg-audio-primary/20 border-audio-primary text-audio-primary'),
                disabled && 'opacity-50 cursor-not-allowed hover:bg-surface-tertiary'
              )}
            >
              {note.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MIDINoteSelector;