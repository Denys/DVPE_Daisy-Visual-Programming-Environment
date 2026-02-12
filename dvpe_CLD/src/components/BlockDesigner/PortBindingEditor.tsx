/**
 * Port Binding Editor
 * UI for declaring inputs/outputs for code module blocks
 */

import React, { useState, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { PortBinding } from '@/types/customBlock';
import { SignalType, PortDirection } from '@/types/blocks';

interface PortBindingEditorProps {
    bindings: PortBinding[];
    onChange: (bindings: PortBinding[]) => void;
    errors?: Record<string, string>;
}

interface ValidationError {
    field: string;
    message: string;
}

// Valid C++ identifier regex
const VALID_CPP_IDENTIFIER = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

// C++ reserved keywords
const CPP_KEYWORDS = new Set([
    'alignas', 'alignof', 'and', 'and_eq', 'asm', 'auto', 'bitand', 'bitor',
    'bool', 'break', 'case', 'catch', 'char', 'char8_t', 'char16_t', 'char32_t',
    'class', 'compl', 'concept', 'const', 'consteval', 'constexpr', 'constinit',
    'const_cast', 'continue', 'co_await', 'co_return', 'co_yield', 'decltype',
    'default', 'delete', 'do', 'double', 'dynamic_cast', 'else', 'enum',
    'explicit', 'export', 'extern', 'false', 'float', 'for', 'friend', 'goto',
    'if', 'inline', 'int', 'long', 'mutable', 'namespace', 'new', 'noexcept',
    'not', 'not_eq', 'nullptr', 'operator', 'or', 'or_eq', 'private', 'protected',
    'public', 'register', 'reinterpret_cast', 'requires', 'return', 'short',
    'signed', 'sizeof', 'static', 'static_assert', 'static_cast', 'struct',
    'switch', 'template', 'this', 'thread_local', 'throw', 'true', 'try',
    'typedef', 'typeid', 'typename', 'union', 'unsigned', 'using', 'virtual',
    'void', 'volatile', 'wchar_t', 'while', 'xor', 'xor_eq'
]);

export function validatePortBinding(binding: PortBinding): ValidationError | null {
    // Validate port ID (must be valid C++ identifier)
    if (!binding.id || binding.id.trim() === '') {
        return { field: 'id', message: 'Port ID is required' };
    }

    if (!VALID_CPP_IDENTIFIER.test(binding.id)) {
        return { field: 'id', message: 'Port ID must be a valid C++ identifier (start with letter/underscore, alphanumeric only)' };
    }

    if (CPP_KEYWORDS.has(binding.id)) {
        return { field: 'id', message: `Port ID cannot be a C++ reserved keyword: ${binding.id}` };
    }

    // Validate display name
    if (!binding.displayName || binding.displayName.trim() === '') {
        return { field: 'displayName', message: 'Display name is required' };
    }

    // Validate signal type
    if (!Object.values(SignalType).includes(binding.signalType)) {
        return { field: 'signalType', message: `Invalid signal type: ${binding.signalType}` };
    }

    // Validate direction
    if (!Object.values(PortDirection).includes(binding.direction)) {
        return { field: 'direction', message: `Invalid direction: ${binding.direction}` };
    }

    return null;
}

export function validateAllBindings(bindings: PortBinding[]): Record<string, string> {
    const errors: Record<string, string> = {};
    const usedIds = new Set<string>();

    bindings.forEach((binding, index) => {
        const error = validatePortBinding(binding);
        if (error) {
            errors[`${index}.${error.field}`] = error.message;
        }

        // Check for duplicate IDs
        if (usedIds.has(binding.id)) {
            errors[`${index}.id`] = `Duplicate port ID: ${binding.id}`;
        }
        usedIds.add(binding.id);
    });

    return errors;
}

export const PortBindingEditor: React.FC<PortBindingEditorProps> = ({
    bindings,
    onChange,
    errors = {}
}) => {
    const [newBinding, setNewBinding] = useState<Partial<PortBinding>>({
        direction: PortDirection.INPUT,
        signalType: SignalType.AUDIO
    });

    const addBinding = useCallback(() => {
        if (!newBinding.id || !newBinding.displayName) return;

        const binding: PortBinding = {
            id: newBinding.id.trim(),
            displayName: newBinding.displayName.trim(),
            signalType: newBinding.signalType || SignalType.AUDIO,
            direction: newBinding.direction || PortDirection.INPUT,
            description: newBinding.description?.trim()
        };

        // Validate before adding
        const validationError = validatePortBinding(binding);
        if (validationError) return;

        onChange([...bindings, binding]);
        setNewBinding({
            direction: PortDirection.INPUT,
            signalType: SignalType.AUDIO
        });
    }, [newBinding, bindings, onChange]);

    const removeBinding = useCallback((index: number) => {
        const newBindings = [...bindings];
        newBindings.splice(index, 1);
        onChange(newBindings);
    }, [bindings, onChange]);

    const updateBinding = useCallback((index: number, updates: Partial<PortBinding>) => {
        const newBindings = bindings.map((b, i) =>
            i === index ? { ...b, ...updates } : b
        );
        onChange(newBindings);
    }, [bindings, onChange]);

    // const getSignalTypeColor = (type: SignalType): string => {
    //     switch (type) {
    //         case SignalType.AUDIO: return 'bg-cyan-500';
    //         case SignalType.CV: return 'bg-yellow-500';
    //         case SignalType.TRIGGER: return 'bg-orange-500';
    //         default: return 'bg-gray-500';
    //     }
    // };

    const getSignalTypeLabel = (type: SignalType): string => {
        switch (type) {
            case SignalType.AUDIO: return 'Audio';
            case SignalType.CV: return 'CV';
            case SignalType.TRIGGER: return 'Trigger';
            default: return type;
        }
    };

    const isValidNewBinding = newBinding.id && newBinding.displayName &&
        !validatePortBinding({
            id: newBinding.id,
            displayName: newBinding.displayName,
            signalType: newBinding.signalType || SignalType.AUDIO,
            direction: newBinding.direction || PortDirection.INPUT
        });

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-300">Port Bindings</h3>
                <span className="text-xs text-gray-500">
                    {bindings.length} port{bindings.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Existing Bindings */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
                {bindings.map((binding, index) => {
                    const idError = errors[`${index}.id`];
                    const nameError = errors[`${index}.displayName`];
                    const hasError = idError || nameError;

                    return (
                        <div
                            key={index}
                            className={`p-3 rounded-lg border ${
                                hasError
                                    ? 'border-red-500/50 bg-red-500/10'
                                    : 'border-gray-700 bg-gray-800/50'
                            }`}
                        >
                            <div className="flex items-start gap-2">
                                {/* Direction Badge */}
                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={() => updateBinding(index, {
                                            direction: binding.direction === PortDirection.INPUT
                                                ? PortDirection.OUTPUT
                                                : PortDirection.INPUT
                                        })}
                                        className={`px-2 py-1 text-xs font-medium rounded ${
                                            binding.direction === PortDirection.INPUT
                                                ? 'bg-blue-500/20 text-blue-400'
                                                : 'bg-green-500/20 text-green-400'
                                        }`}
                                    >
                                        {binding.direction === PortDirection.INPUT ? 'IN' : 'OUT'}
                                    </button>

                                    {/* Signal Type */}
                                    <select
                                        value={binding.signalType}
                                        onChange={(e) => updateBinding(index, {
                                            signalType: e.target.value as SignalType
                                        })}
                                        className="text-xs bg-gray-900 border border-gray-700 rounded px-1 py-1 text-gray-300"
                                    >
                                        {Object.values(SignalType).map(type => (
                                            <option key={type} value={type}>
                                                {getSignalTypeLabel(type)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Input Fields */}
                                <div className="flex-1 space-y-2">
                                    <div>
                                        <input
                                            type="text"
                                            value={binding.id}
                                            onChange={(e) => updateBinding(index, { id: e.target.value })}
                                            placeholder="Port ID (C++ variable)"
                                            className={`w-full text-sm bg-gray-900 border rounded px-2 py-1 text-gray-200 placeholder-gray-600 ${
                                                idError
                                                    ? 'border-red-500 focus:border-red-400'
                                                    : 'border-gray-700 focus:border-blue-500'
                                            }`}
                                        />
                                        {idError && (
                                            <p className="text-xs text-red-400 mt-1">{idError}</p>
                                        )}
                                    </div>

                                    <div>
                                        <input
                                            type="text"
                                            value={binding.displayName}
                                            onChange={(e) => updateBinding(index, { displayName: e.target.value })}
                                            placeholder="Display name"
                                            className={`w-full text-sm bg-gray-900 border rounded px-2 py-1 text-gray-200 placeholder-gray-600 ${
                                                nameError
                                                    ? 'border-red-500 focus:border-red-400'
                                                    : 'border-gray-700 focus:border-blue-500'
                                            }`}
                                        />
                                        {nameError && (
                                            <p className="text-xs text-red-400 mt-1">{nameError}</p>
                                        )}
                                    </div>

                                    <input
                                        type="text"
                                        value={binding.description || ''}
                                        onChange={(e) => updateBinding(index, { description: e.target.value })}
                                        placeholder="Description (optional)"
                                        className="w-full text-xs bg-gray-900 border border-gray-700 rounded px-2 py-1 text-gray-300 placeholder-gray-600"
                                    />
                                </div>

                                {/* Delete Button */}
                                <button
                                    onClick={() => removeBinding(index)}
                                    className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                                    title="Remove port"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {bindings.length === 0 && (
                    <div className="text-center py-6 text-gray-500 text-sm">
                        No ports defined. Add ports to expose inputs and outputs.
                    </div>
                )}
            </div>

            {/* Add New Binding */}
            <div className="border-t border-gray-700 pt-4">
                <h4 className="text-xs font-medium text-gray-400 mb-3">Add New Port</h4>
                <div className="flex gap-2 items-start">
                    <div className="flex flex-col gap-2">
                        <select
                            value={newBinding.direction}
                            onChange={(e) => setNewBinding(prev => ({
                                ...prev,
                                direction: e.target.value as PortDirection
                            }))}
                            className="text-sm bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-gray-300"
                        >
                            <option value={PortDirection.INPUT}>Input</option>
                            <option value={PortDirection.OUTPUT}>Output</option>
                        </select>

                        <select
                            value={newBinding.signalType}
                            onChange={(e) => setNewBinding(prev => ({
                                ...prev,
                                signalType: e.target.value as SignalType
                            }))}
                            className="text-sm bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-gray-300"
                        >
                            {Object.values(SignalType).map(type => (
                                <option key={type} value={type}>
                                    {getSignalTypeLabel(type)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1 space-y-2">
                        <input
                            type="text"
                            value={newBinding.id || ''}
                            onChange={(e) => setNewBinding(prev => ({
                                ...prev,
                                id: e.target.value
                            }))}
                            placeholder="Port ID (C++ identifier)"
                            className="w-full text-sm bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-gray-200 placeholder-gray-600 focus:border-blue-500"
                        />
                        <input
                            type="text"
                            value={newBinding.displayName || ''}
                            onChange={(e) => setNewBinding(prev => ({
                                ...prev,
                                displayName: e.target.value
                            }))}
                            placeholder="Display name"
                            className="w-full text-sm bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-gray-200 placeholder-gray-600 focus:border-blue-500"
                        />
                    </div>

                    <button
                        onClick={addBinding}
                        disabled={!isValidNewBinding}
                        className={`px-3 py-2 rounded flex items-center gap-1 text-sm font-medium transition-colors ${
                            isValidNewBinding
                                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        <Plus size={16} />
                        Add
                    </button>
                </div>

                {/* Help text */}
                <p className="text-xs text-gray-500 mt-2">
                    Port IDs must be valid C++ identifiers (no spaces, start with letter/underscore).
                    These become variable names in your code.
                </p>
            </div>
        </div>
    );
};

export default PortBindingEditor;