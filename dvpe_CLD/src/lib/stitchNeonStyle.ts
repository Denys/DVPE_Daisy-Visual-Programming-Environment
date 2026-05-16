import type { CSSProperties } from 'react';
import {
  BlockCategory,
  PortDirection,
  SignalType,
  type BlockDefinition,
  type PortDefinition,
} from '@/types';

export type StitchNeonBlockTypeColors = Record<string, string>;

export const DEFAULT_STITCH_NEON_BLOCK_TYPE_COLORS: StitchNeonBlockTypeColors = {
  [BlockCategory.SOURCES]: '#4361ee',
  [BlockCategory.PHYSICAL_MODELING]: '#4361ee',
  [BlockCategory.DRUMS]: '#4361ee',
  [BlockCategory.FILTERS]: '#4cc9f0',
  [BlockCategory.EFFECTS]: '#00e5ff',
  [BlockCategory.DYNAMICS]: '#00ff88',
  [BlockCategory.UTILITY]: '#b44aff',
  [BlockCategory.MODULATORS]: '#ffab00',
  [BlockCategory.MATH]: '#ffe800',
  [BlockCategory.USER_IO]: '#ffffff',
  [BlockCategory.CUSTOM]: '#888888',
};

export const STITCH_NEON_BLOCK_TYPE_LABELS: Array<{ key: string; label: string }> = [
  { key: BlockCategory.SOURCES, label: 'Sources' },
  { key: BlockCategory.FILTERS, label: 'Filters' },
  { key: BlockCategory.EFFECTS, label: 'Effects' },
  { key: BlockCategory.MODULATORS, label: 'Modulators' },
  { key: BlockCategory.DYNAMICS, label: 'Dynamics' },
  { key: BlockCategory.UTILITY, label: 'Utility' },
  { key: BlockCategory.MATH, label: 'Math' },
  { key: BlockCategory.USER_IO, label: 'User I/O' },
  { key: BlockCategory.PHYSICAL_MODELING, label: 'Physical Modeling' },
  { key: BlockCategory.DRUMS, label: 'Drums' },
  { key: BlockCategory.CUSTOM, label: 'Custom' },
];

export interface StitchNeonSettings {
  backgroundStartColor: string;
  backgroundEndColor: string;
  backgroundBrightness: number;
  backgroundDepth: number;
  gradientMidpoint: number;
  backgroundGlow: number;
  blockOpacity: number;
  blockGlow: number;
  blockTintStrength: number;
  blockBorderStrength: number;
  blockCornerRadius: number;
  blockTypeColors: StitchNeonBlockTypeColors;
  wireOpacity: number;
  wireGlow: number;
  wireWidth: number;
}

export const DEFAULT_STITCH_NEON_SETTINGS: StitchNeonSettings = {
  backgroundStartColor: '#b51646',
  backgroundEndColor: '#09265f',
  backgroundBrightness: 0.88,
  backgroundDepth: 0.72,
  gradientMidpoint: 42,
  backgroundGlow: 0.34,
  blockOpacity: 0.76,
  blockGlow: 0.42,
  blockTintStrength: 0.2,
  blockBorderStrength: 0.58,
  blockCornerRadius: 16,
  blockTypeColors: { ...DEFAULT_STITCH_NEON_BLOCK_TYPE_COLORS },
  wireOpacity: 1,
  wireGlow: 0.58,
  wireWidth: 1,
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const normalizeHex = (hex: string | undefined): string => {
  const trimmed = typeof hex === 'string' ? hex.trim() : '';
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed;
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`;
  }
  return '#000000';
};

export const hexToRgba = (hex: string, alpha: number): string => {
  const normalized = normalizeHex(hex);
  const value = Number.parseInt(normalized.slice(1), 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1).toFixed(3)})`;
};

export const normalizeStitchNeonSettings = (
  settings?: Partial<StitchNeonSettings> | null
): StitchNeonSettings => ({
  ...DEFAULT_STITCH_NEON_SETTINGS,
  ...(settings || {}),
  blockTypeColors: {
    ...DEFAULT_STITCH_NEON_BLOCK_TYPE_COLORS,
    ...(settings?.blockTypeColors || {}),
  },
});

export const getStitchNeonCategoryColor = (
  settings: Partial<StitchNeonSettings> | null | undefined,
  fallbackColor: string,
  category?: string
): string => {
  const normalized = normalizeStitchNeonSettings(settings);
  const color = category ? normalized.blockTypeColors[category] : undefined;
  return normalizeHex(color || fallbackColor);
};

export const getStitchNeonCanvasStyle = (settings: Partial<StitchNeonSettings> | null | undefined): CSSProperties => {
  const normalized = normalizeStitchNeonSettings(settings);
  const midpoint = clamp(normalized.gradientMidpoint, 5, 95);
  const brightness = clamp(normalized.backgroundBrightness, 0, 1.5);
  const depth = clamp(normalized.backgroundDepth, 0, 1.5);
  const glow = clamp(normalized.backgroundGlow, 0, 1);

  return {
    backgroundColor: normalized.backgroundEndColor,
    background: [
      `radial-gradient(circle at 18% 42%, ${hexToRgba(normalized.backgroundStartColor, glow * brightness)} 0%, transparent 36%)`,
      `radial-gradient(circle at 62% 24%, ${hexToRgba(normalized.backgroundEndColor, glow * 0.55)} 0%, transparent 42%)`,
      `linear-gradient(90deg, ${normalized.backgroundStartColor} 0%, ${hexToRgba(normalized.backgroundStartColor, brightness * 0.72)} ${midpoint}%, ${normalized.backgroundEndColor} 100%)`,
      `linear-gradient(90deg, rgba(255,255,255,${clamp((brightness - 0.5) * 0.08, 0, 0.08)}) 0%, rgba(0,0,0,${clamp(1 - depth, 0, 0.58)}) 100%)`,
    ].join(', '),
  };
};

export const getStitchNeonBlockStyle = (
  settings: Partial<StitchNeonSettings> | null | undefined,
  neonColor: string,
  selected: boolean
): CSSProperties => {
  const normalized = normalizeStitchNeonSettings(settings);
  const opacity = clamp(normalized.blockOpacity, 0.2, 1);
  const tint = clamp(normalized.blockTintStrength, 0, 1);
  const glow = clamp(normalized.blockGlow, 0, 1);
  const border = clamp(normalized.blockBorderStrength, 0, 1);

  return {
    borderRadius: clamp(normalized.blockCornerRadius, 0, 40),
    borderWidth: selected ? 2 : 1,
    borderColor: selected ? 'rgba(255,255,255,0.95)' : hexToRgba(neonColor, 0.2 + border * 0.45),
    background: `linear-gradient(135deg, ${hexToRgba(neonColor, tint)} 0%, rgba(8, 10, 16, ${opacity}) 100%)`,
    boxShadow: selected
      ? `0 0 0 2px rgba(255,255,255,0.88), 0 0 34px ${hexToRgba(neonColor, 0.62)}, 0 0 70px ${hexToRgba(neonColor, glow * 0.36)}`
      : `0 0 ${Math.round(48 + glow * 120)}px -28px ${hexToRgba(neonColor, glow)}, inset 0 0 0 1px ${hexToRgba(neonColor, border * 0.18)}`,
  };
};

export const getStitchNeonWireStyle = (
  settings: Partial<StitchNeonSettings> | null | undefined,
  baseWidth: number,
  selected: boolean
): { opacity: number; strokeWidth: number } => {
  const normalized = normalizeStitchNeonSettings(settings);
  return {
    opacity: clamp(normalized.wireOpacity, 0.2, 1),
    strokeWidth: Math.max(1, baseWidth * clamp(normalized.wireWidth, 0.4, 2.4) + (selected ? 1 : 0)),
  };
};

export const shouldShowInputPortInLayout = ({
  port,
  definition,
  enabledCvPorts = [],
  connectedPorts = new Set<string>(),
}: {
  port: PortDefinition;
  definition: BlockDefinition;
  layoutStyle: string;
  enabledCvPorts?: string[];
  connectedPorts?: Set<string>;
}): boolean => {
  if (port.direction !== PortDirection.INPUT) return false;
  if (!port.id.endsWith('_cv') || port.signalType !== SignalType.CV) return true;
  if (port.id === 'sel_cv') return true;
  if (connectedPorts.has(port.id)) return true;

  const paramId = port.id.replace(/_cv$/, '');
  const isCvParameter = definition.parameters.some(
    (param) => param.id === paramId && param.cvModulatable === true
  );
  if (enabledCvPorts.includes(paramId) && isCvParameter) return true;

  return false;
};
