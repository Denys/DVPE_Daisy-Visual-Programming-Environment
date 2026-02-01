/**
 * BlockUIDesigner Integration Tests
 * Phase 13.2 - Day 5: End-to-end wiring validation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBlockDesignerStore } from '../../../stores/blockDesignerStore';
import { UIElementType } from '../../../types/uiElement';
import { generateBindingCode, suggestBinding } from '../../../core/bindingMapper';
import { ParameterBinding } from '../../../types/parameterBinding';

describe('BlockUIDesigner Integration', () => {
    beforeEach(() => {
        // Reset store before each test
        useBlockDesignerStore.getState().clearDesigner();
    });

    describe('Element → Store → Canvas flow', () => {
        it('adds element to store and retrieves it', () => {
            const { result } = renderHook(() => useBlockDesignerStore());

            let elementId: string;
            act(() => {
                elementId = result.current.addElement({
                    type: UIElementType.ROTARY_KNOB,
                    position: { x: 50, y: 50 },
                    size: { width: 60, height: 60 },
                    rotation: 0,
                });
            });

            expect(result.current.elements).toHaveLength(1);
            expect(result.current.elements[0].id).toBe(elementId!);
            expect(result.current.elements[0].type).toBe(UIElementType.ROTARY_KNOB);
        });

        it('updates element position via store', () => {
            const { result } = renderHook(() => useBlockDesignerStore());

            let elementId: string;
            act(() => {
                elementId = result.current.addElement({
                    type: UIElementType.SLIDER,
                    position: { x: 0, y: 0 },
                    size: { width: 30, height: 100 },
                    rotation: 0,
                });
            });

            act(() => {
                result.current.updateElement(elementId!, {
                    position: { x: 100, y: 200 },
                });
            });

            expect(result.current.elements[0].position.x).toBe(100);
            expect(result.current.elements[0].position.y).toBe(200);
        });
    });

    describe('Binding flow', () => {
        it('sets binding on element via store', () => {
            const { result } = renderHook(() => useBlockDesignerStore());

            let elementId: string;
            act(() => {
                elementId = result.current.addElement({
                    type: UIElementType.ROTARY_KNOB,
                    position: { x: 0, y: 0 },
                    size: { width: 60, height: 60 },
                    rotation: 0,
                    label: 'Cutoff',
                });
            });

            const binding: ParameterBinding = {
                elementId: elementId!,
                elementProperty: 'value',
                target: {
                    blockId: 'filter1',
                    parameterId: 'cutoff',
                    cppSetter: 'SetCutoff',
                },
                mapping: {
                    type: 'log',
                    inputRange: [0, 1],
                    outputRange: [20, 20000],
                },
            };

            act(() => {
                result.current.setElementBinding(elementId!, binding);
            });

            const element = result.current.elements[0];
            expect(element.binding).toBeDefined();
            expect(element.binding?.target.blockId).toBe('filter1');
            expect(element.binding?.mapping.type).toBe('log');
        });

        it('generates C++ binding code from stored binding', () => {
            const { result } = renderHook(() => useBlockDesignerStore());

            let elementId: string;
            act(() => {
                elementId = result.current.addElement({
                    type: UIElementType.ROTARY_KNOB,
                    position: { x: 0, y: 0 },
                    size: { width: 60, height: 60 },
                    rotation: 0,
                    label: 'Volume',
                });
            });

            const binding: ParameterBinding = {
                elementId: elementId!,
                elementProperty: 'value',
                target: {
                    blockId: 'vca1',
                    parameterId: 'level',
                    cppSetter: 'SetLevel',
                },
                mapping: { type: 'direct' },
            };

            act(() => {
                result.current.setElementBinding(elementId!, binding);
            });

            const element = result.current.elements[0];
            const code = generateBindingCode(element.binding!);

            expect(code).toContain('vca1.SetLevel');
        });
    });

    describe('Auto-binding suggestions', () => {
        it('suggests log mapping for frequency-related parameters', () => {
            const suggestion = suggestBinding(UIElementType.ROTARY_KNOB, 'cutoff_freq');
            expect(suggestion.mappingType).toBe('log');
            expect(suggestion.outputRange[1]).toBe(20000);
        });

        it('suggests exponential mapping for time parameters', () => {
            const suggestion = suggestBinding(UIElementType.SLIDER, 'attack_time');
            expect(suggestion.mappingType).toBe('exp');
        });

        it('suggests direct mapping for toggle elements', () => {
            const suggestion = suggestBinding(UIElementType.TOGGLE, 'enable_filter');
            expect(suggestion.mappingType).toBe('direct');
            expect(suggestion.confidence).toBeGreaterThan(0.9);
        });
    });

    describe('Undo/Redo', () => {
        it('undoes element addition', () => {
            const { result } = renderHook(() => useBlockDesignerStore());

            act(() => {
                result.current.addElement({
                    type: UIElementType.TEXT_LABEL,
                    position: { x: 0, y: 0 },
                    size: { width: 100, height: 20 },
                    rotation: 0,
                });
            });

            expect(result.current.elements).toHaveLength(1);

            act(() => {
                result.current.undo();
            });

            expect(result.current.elements).toHaveLength(0);
        });

        it('redoes undone element addition', () => {
            const { result } = renderHook(() => useBlockDesignerStore());

            act(() => {
                result.current.addElement({
                    type: UIElementType.TEXT_LABEL,
                    position: { x: 0, y: 0 },
                    size: { width: 100, height: 20 },
                    rotation: 0,
                });
            });

            act(() => {
                result.current.undo();
            });

            expect(result.current.elements).toHaveLength(0);

            act(() => {
                result.current.redo();
            });

            expect(result.current.elements).toHaveLength(1);
        });
    });

    describe('Selection', () => {
        it('selects multiple elements', () => {
            const { result } = renderHook(() => useBlockDesignerStore());

            let id1: string, id2: string;
            act(() => {
                id1 = result.current.addElement({
                    type: UIElementType.ROTARY_KNOB,
                    position: { x: 0, y: 0 },
                    size: { width: 60, height: 60 },
                    rotation: 0,
                });
                id2 = result.current.addElement({
                    type: UIElementType.ROTARY_KNOB,
                    position: { x: 100, y: 0 },
                    size: { width: 60, height: 60 },
                    rotation: 0,
                });
            });

            act(() => {
                result.current.selectElements([id1!, id2!]);
            });

            expect(result.current.selectedIds).toEqual([id1!, id2!]);
        });

        it('removes selected elements', () => {
            const { result } = renderHook(() => useBlockDesignerStore());

            let id1: string, id2: string;
            act(() => {
                id1 = result.current.addElement({
                    type: UIElementType.TEXT_LABEL,
                    position: { x: 0, y: 0 },
                    size: { width: 100, height: 20 },
                    rotation: 0,
                });
                id2 = result.current.addElement({
                    type: UIElementType.TEXT_LABEL,
                    position: { x: 0, y: 50 },
                    size: { width: 100, height: 20 },
                    rotation: 0,
                });
            });

            act(() => {
                result.current.selectElements([id1!]);
                result.current.removeElements([id1!]);
            });

            expect(result.current.elements).toHaveLength(1);
            expect(result.current.elements[0].id).toBe(id2!);
            expect(result.current.selectedIds).not.toContain(id1!);
        });
    });
});
