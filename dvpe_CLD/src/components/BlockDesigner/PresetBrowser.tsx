/**
 * PresetBrowser - Browse and apply layout presets
 * Phase 13.2: Day 5 - Preset System
 */

import React, { useState, useMemo } from 'react';
import { LayoutPreset, PresetCategory, BuiltInPresetIds } from '../../types/layoutPreset';
import { Search, Filter, Download, Upload } from 'lucide-react';

interface PresetBrowserProps {
    presets: LayoutPreset[];
    onApply: (preset: LayoutPreset) => void;
    onExport?: (preset: LayoutPreset) => void;
    onImport?: () => void;
}

export const PresetBrowser: React.FC<PresetBrowserProps> = ({
    presets,
    onApply,
    onExport,
    onImport,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<PresetCategory | 'all'>('all');
    const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

    const categories: { value: PresetCategory | 'all'; label: string }[] = [
        { value: 'all', label: 'All' },
        { value: 'synth', label: 'Synth' },
        { value: 'fx', label: 'Effects' },
        { value: 'sequencer', label: 'Sequencer' },
        { value: 'utility', label: 'Utility' },
        { value: 'custom', label: 'Custom' },
    ];

    const filteredPresets = useMemo(() => {
        return presets.filter(preset => {
            // Category filter
            if (selectedCategory !== 'all' && preset.category !== selectedCategory) {
                return false;
            }

            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesName = preset.name.toLowerCase().includes(query);
                const matchesDesc = preset.description?.toLowerCase().includes(query);
                const matchesTags = preset.tags?.some(t => t.toLowerCase().includes(query));
                if (!matchesName && !matchesDesc && !matchesTags) {
                    return false;
                }
            }

            return true;
        });
    }, [presets, selectedCategory, searchQuery]);

    const selectedPreset = presets.find(p => p.id === selectedPresetId);

    const handleDoubleClick = (preset: LayoutPreset) => {
        onApply(preset);
    };

    return (
        <div className="preset-browser">
            {/* Header */}
            <div className="preset-browser-header">
                <h3>Layout Presets</h3>
                <div className="preset-actions">
                    {onImport && (
                        <button className="icon-button" onClick={onImport} title="Import preset">
                            <Upload size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Search & Filter */}
            <div className="preset-filters">
                <div className="search-input">
                    <Search size={14} />
                    <input
                        type="text"
                        placeholder="Search presets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="category-filter">
                    <Filter size={14} />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value as PresetCategory | 'all')}
                    >
                        {categories.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Preset Grid */}
            <div className="preset-grid">
                {filteredPresets.map(preset => (
                    <div
                        key={preset.id}
                        className={`preset-card ${selectedPresetId === preset.id ? 'selected' : ''}`}
                        onClick={() => setSelectedPresetId(preset.id)}
                        onDoubleClick={() => handleDoubleClick(preset)}
                    >
                        <div className="preset-thumbnail">
                            {preset.thumbnail ? (
                                <img src={`data:image/png;base64,${preset.thumbnail}`} alt={preset.name} />
                            ) : (
                                <div className="preset-placeholder">
                                    {preset.elements.length} elements
                                </div>
                            )}
                        </div>
                        <div className="preset-info">
                            <span className="preset-name">{preset.name}</span>
                            <span className="preset-category">{preset.category}</span>
                        </div>
                    </div>
                ))}

                {filteredPresets.length === 0 && (
                    <div className="preset-empty">
                        No presets found
                    </div>
                )}
            </div>

            {/* Preview / Apply */}
            {selectedPreset && (
                <div className="preset-detail">
                    <div className="preset-detail-header">
                        <h4>{selectedPreset.name}</h4>
                        {onExport && (
                            <button
                                className="icon-button"
                                onClick={() => onExport(selectedPreset)}
                                title="Export preset"
                            >
                                <Download size={16} />
                            </button>
                        )}
                    </div>
                    {selectedPreset.description && (
                        <p className="preset-description">{selectedPreset.description}</p>
                    )}
                    <div className="preset-meta">
                        <span>Elements: {selectedPreset.elements.length}</span>
                        <span>Size: {selectedPreset.blockDimensions.width}×{selectedPreset.blockDimensions.height}</span>
                    </div>
                    {selectedPreset.tags && selectedPreset.tags.length > 0 && (
                        <div className="preset-tags">
                            {selectedPreset.tags.map(tag => (
                                <span key={tag} className="preset-tag">{tag}</span>
                            ))}
                        </div>
                    )}
                    <button
                        className="apply-button"
                        onClick={() => onApply(selectedPreset)}
                    >
                        Apply Preset
                    </button>
                </div>
            )}
        </div>
    );
};

// === Built-in Presets ===

export const createBuiltInPresets = (): LayoutPreset[] => {
    return [
        {
            id: BuiltInPresetIds.SUBTRACTIVE_VOICE,
            name: 'Subtractive Voice',
            category: 'synth',
            description: 'Classic subtractive synth layout with OSC, Filter, and ADSR',
            tags: ['oscillator', 'filter', 'envelope', 'classic'],
            blockDimensions: { width: 280, height: 180 },
            elements: [],
            metadata: {
                author: 'DVPE',
                version: '1.0',
            },
        },
        {
            id: BuiltInPresetIds.FM_OPERATOR,
            name: 'FM Operator',
            category: 'synth',
            description: 'Single FM operator with ratio, level, and envelope',
            tags: ['fm', 'operator', 'synthesis'],
            blockDimensions: { width: 200, height: 140 },
            elements: [],
            metadata: {
                author: 'DVPE',
                version: '1.0',
            },
        },
        {
            id: BuiltInPresetIds.STEREO_DELAY,
            name: 'Stereo Delay',
            category: 'fx',
            description: 'Stereo delay with time, feedback, and mix',
            tags: ['delay', 'stereo', 'effect'],
            blockDimensions: { width: 240, height: 120 },
            elements: [],
            metadata: {
                author: 'DVPE',
                version: '1.0',
            },
        },
        {
            id: BuiltInPresetIds.LFO,
            name: 'LFO',
            category: 'utility',
            description: 'Low frequency oscillator with rate and shape',
            tags: ['modulation', 'lfo', 'utility'],
            blockDimensions: { width: 160, height: 100 },
            elements: [],
            metadata: {
                author: 'DVPE',
                version: '1.0',
            },
        },
        {
            id: BuiltInPresetIds.COMPRESSOR,
            name: 'Compressor',
            category: 'fx',
            description: 'Dynamics compressor with threshold, ratio, attack, release',
            tags: ['dynamics', 'compressor', 'mixing'],
            blockDimensions: { width: 240, height: 140 },
            elements: [],
            metadata: {
                author: 'DVPE',
                version: '1.0',
            },
        },
        {
            id: BuiltInPresetIds.REVERB,
            name: 'Reverb',
            category: 'fx',
            description: 'Reverb with size, decay, damping, and mix',
            tags: ['reverb', 'space', 'effect'],
            blockDimensions: { width: 200, height: 120 },
            elements: [],
            metadata: {
                author: 'DVPE',
                version: '1.0',
            },
        },
    ];
};
