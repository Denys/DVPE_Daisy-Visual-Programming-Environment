import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Sun, 
  Box, 
  Droplet, 
  RefreshCcw, 
  Save, 
  Trash2, 
  AlertTriangle,
  Lock,
  Unlock,
  Bot,
  KeyRound,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores';
import ParameterSlider from './ParameterSlider';
import { AI_MODELS, getAIKey, normalizeAIModel, setAIKey, type AIProvider } from '@/codegen/advancedExportService';
import {
  STITCH_NEON_BLOCK_TYPE_LABELS,
  type StitchNeonSettings,
} from '@/lib/stitchNeonStyle';
import type { StitchNeonPreset } from '@/stores/uiStore';

const ColorControl = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <label className="flex items-center justify-between gap-3">
    <span className="text-xs text-text-tertiary font-medium">{label}</span>
    <span className="flex items-center gap-2">
      <span
        className="w-5 h-5 rounded border border-border"
        style={{ backgroundColor: value }}
      />
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-8 h-7 rounded bg-surface-primary border border-border cursor-pointer"
      />
    </span>
  </label>
);

const StitchNeonPanel = ({
  settings,
  updateSettings,
  resetSettings,
  presets,
  savePreset,
  loadPreset,
  deletePreset,
}: {
  settings: StitchNeonSettings;
  updateSettings: (settings: Partial<StitchNeonSettings>) => void;
  resetSettings: () => void;
  presets: StitchNeonPreset[];
  savePreset: (name: string) => void;
  loadPreset: (presetId: string) => void;
  deletePreset: (presetId: string) => void;
}) => {
  const [presetName, setPresetName] = useState('');

  const update = (key: keyof StitchNeonSettings, value: number | string) => {
    updateSettings({ [key]: value } as Partial<StitchNeonSettings>);
  };

  const updateBlockTypeColor = (key: string, value: string) => {
    updateSettings({
      blockTypeColors: {
        ...settings.blockTypeColors,
        [key]: value,
      },
    });
  };

  return (
    <div className="flex flex-col h-full bg-surface-secondary">
      <div className="p-4 bg-cv-primary/10 border-b border-cv-primary/20 mb-2">
        <div className="flex items-center gap-2 text-cv-primary mb-1">
          <Palette className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Stitch Neon Design</span>
        </div>
        <p className="text-[11px] text-text-tertiary leading-relaxed">
          Tune the glass canvas, block contrast, and wire visibility without changing Experimentator.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-6 pb-20">
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-text-primary">
            <Sun className="w-4 h-4 text-cv-primary" />
            <h3 className="text-sm font-semibold">Background</h3>
          </div>
          <ColorControl
            label="Start Color"
            value={settings.backgroundStartColor}
            onChange={(value) => update('backgroundStartColor', value)}
          />
          <ColorControl
            label="End Color"
            value={settings.backgroundEndColor}
            onChange={(value) => update('backgroundEndColor', value)}
          />
          <ParameterSlider id="stitch-bg-brightness" label="Brightness" value={settings.backgroundBrightness} min={0.3} max={1.3} step={0.01} onChange={(v) => update('backgroundBrightness', v)} />
          <ParameterSlider id="stitch-bg-depth" label="Depth" value={settings.backgroundDepth} min={0.2} max={1.2} step={0.01} onChange={(v) => update('backgroundDepth', v)} />
          <ParameterSlider id="stitch-bg-midpoint" label="Gradient Transition" value={settings.gradientMidpoint} min={10} max={90} step={1} unit="%" onChange={(v) => update('gradientMidpoint', v)} />
          <ParameterSlider id="stitch-bg-glow" label="Background Glow" value={settings.backgroundGlow} min={0} max={1} step={0.01} onChange={(v) => update('backgroundGlow', v)} />
        </section>

        <section className="space-y-4 pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-text-primary">
            <Box className="w-4 h-4 text-audio-primary" />
            <h3 className="text-sm font-semibold">Blocks</h3>
          </div>
          <ParameterSlider id="stitch-block-opacity" label="Opacity" value={settings.blockOpacity} min={0.35} max={1} step={0.01} onChange={(v) => update('blockOpacity', v)} />
          <ParameterSlider id="stitch-block-glow" label="Glow" value={settings.blockGlow} min={0} max={1} step={0.01} onChange={(v) => update('blockGlow', v)} />
          <ParameterSlider id="stitch-block-tint" label="Color Coding" value={settings.blockTintStrength} min={0} max={0.75} step={0.01} onChange={(v) => update('blockTintStrength', v)} />
          <ParameterSlider id="stitch-block-border" label="Border Contrast" value={settings.blockBorderStrength} min={0} max={1} step={0.01} onChange={(v) => update('blockBorderStrength', v)} />
          <ParameterSlider id="stitch-block-radius" label="Corner Rounding" value={settings.blockCornerRadius} min={0} max={40} step={1} unit="px" onChange={(v) => update('blockCornerRadius', v)} />
        </section>

        <section className="space-y-4 pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-text-primary">
            <Palette className="w-4 h-4 text-user-primary" />
            <h3 className="text-sm font-semibold">Block Type Colors</h3>
          </div>
          <div className="space-y-3">
            {STITCH_NEON_BLOCK_TYPE_LABELS.map((item) => (
              <ColorControl
                key={item.key}
                label={item.label}
                value={settings.blockTypeColors[item.key]}
                onChange={(value) => updateBlockTypeColor(item.key, value)}
              />
            ))}
          </div>
        </section>

        <section className="space-y-4 pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-text-primary">
            <Droplet className="w-4 h-4 text-trigger-primary" />
            <h3 className="text-sm font-semibold">Connections</h3>
          </div>
          <ParameterSlider id="stitch-wire-width" label="Wire Width" value={settings.wireWidth} min={0.5} max={2} step={0.05} unit="x" onChange={(v) => update('wireWidth', v)} />
          <ParameterSlider id="stitch-wire-glow" label="Wire Glow" value={settings.wireGlow} min={0} max={1} step={0.01} onChange={(v) => update('wireGlow', v)} />
          <ParameterSlider id="stitch-wire-opacity" label="Wire Opacity" value={settings.wireOpacity} min={0.25} max={1} step={0.01} onChange={(v) => update('wireOpacity', v)} />
        </section>

        <section className="space-y-4 pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-text-primary">
            <Save className="w-4 h-4" />
            <h3 className="text-sm font-semibold">Design Presets</h3>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={presetName}
              onChange={(event) => setPresetName(event.target.value)}
              placeholder="Preset Name..."
              className="flex-1 px-3 py-1.5 rounded bg-surface-primary border border-border text-xs focus:outline-none focus:ring-1 focus:ring-cv-primary"
            />
            <button
              onClick={() => {
                if (presetName.trim()) {
                  savePreset(presetName.trim());
                  setPresetName('');
                }
              }}
              disabled={!presetName.trim()}
              className="p-2 rounded bg-cv-primary text-surface-primary disabled:opacity-50 hover:bg-cv-primary/80 transition-colors"
            >
              <Save className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {presets.map((preset) => (
              <div key={preset.id} className="group flex items-center justify-between p-2 rounded hover:bg-surface-tertiary transition-colors">
                <button onClick={() => loadPreset(preset.id)} className="flex-1 text-left text-xs text-text-secondary hover:text-text-primary truncate">{preset.name}</button>
                <button onClick={() => deletePreset(preset.id)} className="opacity-0 group-hover:opacity-100 p-1 text-text-tertiary hover:text-red-400 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
            {presets.length === 0 && <p className="text-[10px] text-text-tertiary text-center py-4">No Stitch Neon presets saved yet.</p>}
          </div>
        </section>

        <section className="pt-2 border-t border-border">
          <button onClick={resetSettings} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded border border-border text-xs text-text-tertiary hover:bg-surface-tertiary hover:text-text-primary transition-colors">
            <RefreshCcw className="w-3.5 h-3.5" /> Reset Stitch Neon
          </button>
        </section>
      </div>
    </div>
  );
};

export const DesignExperimentator: React.FC = () => {
  const { 
    designSettings, 
    updateDesignSettings, 
    resetDesignSettings,
    customPresets,
    saveDesignPreset,
    loadDesignPreset,
    deleteDesignPreset,
    aiProvider,
    aiModel,
    setAIProvider,
    setAIModel,
    layoutStyle,
    stitchNeonSettings,
    updateStitchNeonSettings,
    resetStitchNeonSettings,
    stitchNeonPresets,
    saveStitchNeonPreset,
    loadStitchNeonPreset,
    deleteStitchNeonPreset,
  } = useUIStore();

  const [presetName, setPresetName] = useState('');
  const [isLocked, setIsLocked] = useState(true);
  const [showAISettings, setShowAISettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [keyVisible, setKeyVisible] = useState(false);

  // Load current key for the provider when it changes
  useEffect(() => {
    setApiKeyInput(getAIKey(aiProvider));
  }, [aiProvider]);

  useEffect(() => {
    const normalizedModel = normalizeAIModel(aiProvider, aiModel);
    if (normalizedModel !== aiModel) {
      setAIModel(normalizedModel);
    }
  }, [aiProvider, aiModel, setAIModel]);

  const handleKeyBlur = () => {
    setAIKey(aiProvider, apiKeyInput);
  };

  const limits = {
    glowIntensity: { min: 0, max: 2 },
    glowSpread: { min: 0, max: 300 },
    baseTransparency: { min: 0, max: 0.9 },
    borderWidth: { min: 0, max: 10 },
    borderRadius: { min: 0, max: 40 },
    neonSaturation: { min: 0, max: 2 },
    glassTint: { min: 0, max: 0.5 },
  };

  const handleUpdate = (key: keyof typeof designSettings, val: number) => {
    if (isLocked) {
      const limit = limits[key];
      updateDesignSettings({ [key]: Math.max(limit.min, Math.min(limit.max, val)) });
    } else {
      updateDesignSettings({ [key]: val });
    }
  };

  const providerLabels: Record<AIProvider, string> = {
    gemini: 'Google Gemini',
    openai: 'OpenAI',
    anthropic: 'Anthropic',
  };

  if (layoutStyle === 'glass') {
    return (
      <StitchNeonPanel
        settings={stitchNeonSettings}
        updateSettings={updateStitchNeonSettings}
        resetSettings={resetStitchNeonSettings}
        presets={stitchNeonPresets}
        savePreset={saveStitchNeonPreset}
        loadPreset={loadStitchNeonPreset}
        deletePreset={deleteStitchNeonPreset}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface-secondary">
      {/* Header Info */}
      <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 mb-2">
        <div className="flex items-center gap-2 text-amber-500 mb-1">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Experimentator Mode</span>
        </div>
        <p className="text-[11px] text-text-tertiary leading-relaxed">
          Tweak the visual DNA of the environment. Changes applied in real-time.
          Use the lock to stay within safe bounds.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-6 pb-20">
        {/* Glow Settings */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-primary">
              <Sun className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold">Neon Glow</h3>
            </div>
            <button 
              onClick={() => setIsLocked(!isLocked)}
              className={cn("p-1 rounded transition-colors", isLocked ? "text-audio-primary bg-audio-primary/10" : "text-text-tertiary")}
            >
              {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
          </div>
          <ParameterSlider id="exp-glow-intensity" label="Intensity" value={designSettings.glowIntensity} min={0} max={isLocked ? 1.5 : 5} step={0.01} onChange={(v) => handleUpdate('glowIntensity', v)} />
          <ParameterSlider id="exp-glow-spread" label="Spread Radius" value={designSettings.glowSpread} min={0} max={isLocked ? 300 : 1000} step={1} unit="px" onChange={(v) => handleUpdate('glowSpread', v)} />
          <ParameterSlider id="exp-glow-saturation" label="Saturation" value={designSettings.neonSaturation} min={0} max={2} step={0.01} unit="x" onChange={(v) => handleUpdate('neonSaturation', v)} />
        </section>

        {/* Glass Settings */}
        <section className="space-y-4 pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-text-primary">
            <Droplet className="w-4 h-4 text-cv-primary" />
            <h3 className="text-sm font-semibold">Glass Surface</h3>
          </div>
          <ParameterSlider id="exp-glass-opacity" label="Base Opacity" value={designSettings.baseTransparency} min={0} max={0.9} step={0.01} onChange={(v) => handleUpdate('baseTransparency', v)} />
          <ParameterSlider id="exp-glass-tint" label="Tint Strength" value={designSettings.glassTint} min={0} max={0.5} step={0.01} onChange={(v) => handleUpdate('glassTint', v)} />
        </section>

        {/* Geometry */}
        <section className="space-y-4 pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-text-primary">
            <Box className="w-4 h-4 text-trigger-primary" />
            <h3 className="text-sm font-semibold">Geometry</h3>
          </div>
          <ParameterSlider id="exp-border-weight" label="Border Weight" value={designSettings.borderWidth} min={0} max={10} step={0.5} unit="px" onChange={(v) => handleUpdate('borderWidth', v)} />
          <ParameterSlider id="exp-corner-radius" label="Corner Radius" value={designSettings.borderRadius} min={0} max={40} step={1} unit="px" onChange={(v) => handleUpdate('borderRadius', v)} />
        </section>

        {/* Presets */}
        <section className="space-y-4 pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-text-primary">
            <Palette className="w-4 h-4" />
            <h3 className="text-sm font-semibold">Saved Presets</h3>
          </div>
          <div className="flex gap-2">
            <input type="text" value={presetName} onChange={(e) => setPresetName(e.target.value)} placeholder="Preset Name..." className="flex-1 px-3 py-1.5 rounded bg-surface-primary border border-border text-xs focus:outline-none focus:ring-1 focus:ring-audio-primary" />
            <button onClick={() => { if (presetName.trim()) { saveDesignPreset(presetName.trim()); setPresetName(''); } }} disabled={!presetName.trim()} className="p-2 rounded bg-audio-primary text-surface-primary disabled:opacity-50 hover:bg-audio-primary/80 transition-colors">
              <Save className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {customPresets.map((preset) => (
              <div key={preset.id} className="group flex items-center justify-between p-2 rounded hover:bg-surface-tertiary transition-colors">
                <button onClick={() => loadDesignPreset(preset.id)} className="flex-1 text-left text-xs text-text-secondary hover:text-text-primary truncate">{preset.name}</button>
                <button onClick={() => deleteDesignPreset(preset.id)} className="opacity-0 group-hover:opacity-100 p-1 text-text-tertiary hover:text-red-400 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
            {customPresets.length === 0 && <p className="text-[10px] text-text-tertiary text-center py-4">No custom presets saved yet.</p>}
          </div>
          <button onClick={resetDesignSettings} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded border border-border text-xs text-text-tertiary hover:bg-surface-tertiary hover:text-text-primary transition-colors">
            <RefreshCcw className="w-3.5 h-3.5" /> Reset to Default Style
          </button>
        </section>

        {/* AI Export Settings */}
        <section className="pt-2 border-t border-border">
          <button
            onClick={() => setShowAISettings(!showAISettings)}
            className="flex items-center justify-between w-full py-2 text-sm font-semibold text-text-primary"
          >
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-cv-primary" />
              AI Export Settings
            </div>
            {showAISettings ? <ChevronDown className="w-4 h-4 text-text-tertiary" /> : <ChevronRight className="w-4 h-4 text-text-tertiary" />}
          </button>

          {showAISettings && (
            <div className="space-y-4 mt-2">
              <p className="text-[10px] text-text-tertiary leading-relaxed">
                Configure the AI model for ⚡ Advanced Export. Keys stored in browser only, never saved to disk.
              </p>

              {/* Provider */}
              <div>
                <label className="text-xs text-text-tertiary block mb-1">Provider</label>
                <select
                  value={aiProvider}
                  onChange={(e) => {
                    const p = e.target.value as AIProvider;
                    setAIProvider(p);
                    setAIModel(normalizeAIModel(p, ''));
                  }}
                  className="w-full px-3 py-1.5 rounded bg-surface-primary border border-border text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-cv-primary"
                >
                  {(Object.keys(AI_MODELS) as AIProvider[]).map((p) => (
                    <option key={p} value={p}>{providerLabels[p]}</option>
                  ))}
                </select>
              </div>

              {/* Model */}
              <div>
                <label className="text-xs text-text-tertiary block mb-1">Model</label>
                <select
                  value={aiModel}
                  onChange={(e) => setAIModel(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-surface-primary border border-border text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-cv-primary"
                >
                  {AI_MODELS[aiProvider].map((m) => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              </div>

              {/* API Key */}
              <div>
                <label className="text-xs text-text-tertiary block mb-1 flex items-center gap-1">
                  <KeyRound className="w-3 h-3" /> API Key ({providerLabels[aiProvider]})
                </label>
                <div className="flex gap-2">
                  <input
                    type={keyVisible ? 'text' : 'password'}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    onBlur={handleKeyBlur}
                    placeholder="Paste API key here…"
                    className="flex-1 px-3 py-1.5 rounded bg-surface-primary border border-border text-xs text-text-primary font-mono focus:outline-none focus:ring-1 focus:ring-cv-primary"
                  />
                  <button
                    onClick={() => setKeyVisible(!keyVisible)}
                    className="px-2 rounded bg-surface-tertiary text-xs text-text-tertiary hover:text-text-primary transition-colors"
                  >
                    {keyVisible ? 'Hide' : 'Show'}
                  </button>
                </div>
                <p className="text-[10px] text-text-tertiary mt-1">
                  {getAIKey(aiProvider) ? '✓ Key saved in browser' : '⚠ No key set'}
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
