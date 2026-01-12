import React, { useState, useMemo } from 'react';

// Daisy GUI Color Palette
const colors = {
  bgDeep: '#0a0e14',
  bgPrimary: '#0d1117',
  bgElevated: '#161b22',
  bgSurface: '#1a2028',
  audioPrimary: '#58a6ff',
  audioSecondary: '#388bfd',
  audioBlockBg: '#1a3a5c',
  audioBlockBorder: '#264b6e',
  controlPrimary: '#f0883e',
  controlSecondary: '#d18616',
  controlBlockBg: '#3d2a1a',
  controlBlockBorder: '#5c3d1f',
  userBlockBg: '#1a3d2a',
  userBlockBorder: '#2a5c3d',
  paramText: '#58a6ff',
  paramLabel: '#8b949e',
  paramValue: '#c9d1d9',
  textPrimary: '#f0f6fc',
  textSecondary: '#8b949e',
  textMuted: '#484f58',
  accentGreen: '#3fb950',
};

// Block definitions
const blockDefinitions = {
  oscillator: {
    id: 'oscillator',
    displayName: 'OSCILLATOR',
    className: 'daisysp::Oscillator',
    category: 'Sources',
    color: 'audio',
    parameters: [
      { id: 'freq', name: 'Frequency', value: 440.0, unit: 'Hz', type: 'dial' },
      { id: 'amp', name: 'Amplitude', value: 0.50, unit: '', type: 'dial' },
      { id: 'waveform', name: 'Shape', value: 'WAVE_SIN', type: 'dropdown', 
        options: ['WAVE_SIN', 'WAVE_TRI', 'WAVE_SAW', 'WAVE_SQUARE', 'WAVE_POLYBLEP_SAW'] },
    ],
    portsIn: [{ id: 'freq_cv', name: 'FREQ_CV' }, { id: 'amp_cv', name: 'AMP_CV' }],
    portsOut: [{ id: 'out', name: 'OUT' }],
  },
  moog_ladder: {
    id: 'moog_ladder',
    displayName: 'MOOG LADDER',
    className: 'daisysp::MoogLadder',
    category: 'Filters',
    color: 'audio',
    parameters: [
      { id: 'cutoff', name: 'Cutoff', value: 1000, unit: 'Hz', type: 'dial' },
      { id: 'res', name: 'Resonance', value: 0.50, unit: '', type: 'dial' },
    ],
    portsIn: [{ id: 'in', name: 'IN' }, { id: 'freq_cv', name: 'FREQ_CV' }],
    portsOut: [{ id: 'out', name: 'OUT' }],
  },
  chorus: {
    id: 'chorus',
    displayName: 'CHORUS',
    className: 'daisysp::Chorus',
    category: 'Effects',
    color: 'audio',
    parameters: [
      { id: 'depth', name: 'Depth', value: 0.50, unit: '', type: 'dial' },
      { id: 'rate', name: 'Rate', value: 1.00, unit: 'Hz', type: 'dial' },
    ],
    portsIn: [{ id: 'in', name: 'IN' }],
    portsOut: [{ id: 'out_l', name: 'L' }, { id: 'out_r', name: 'R' }],
  },
  lfo: {
    id: 'lfo',
    displayName: 'LFO',
    className: 'daisysp::Oscillator',
    category: 'Control',
    color: 'control',
    parameters: [
      { id: 'rate', name: 'Rate', value: 2.00, unit: 'Hz', type: 'dial' },
      { id: 'depth', name: 'Depth', value: 1.00, unit: '', type: 'dial' },
      { id: 'shape', name: 'Shape', value: 'WAVE_SIN', type: 'dropdown',
        options: ['WAVE_SIN', 'WAVE_TRI', 'WAVE_SAW', 'WAVE_SQUARE'] },
    ],
    portsIn: [],
    portsOut: [{ id: 'out', name: 'OUT' }],
  },
  adsr: {
    id: 'adsr',
    displayName: 'ADSR ENVELOPE',
    className: 'daisysp::Adsr',
    category: 'Control',
    color: 'control',
    parameters: [
      { id: 'attack', name: 'Attack', value: 0.01, unit: 's', type: 'dial' },
      { id: 'decay', name: 'Decay', value: 0.10, unit: 's', type: 'dial' },
      { id: 'sustain', name: 'Sustain', value: 0.70, unit: '', type: 'dial' },
      { id: 'release', name: 'Release', value: 0.50, unit: 's', type: 'dial' },
    ],
    portsIn: [{ id: 'gate', name: 'GATE' }],
    portsOut: [{ id: 'out', name: 'OUT' }],
  },
  audio_out: {
    id: 'audio_out',
    displayName: 'AUDIO OUTPUT',
    className: 'hw.AudioOut()',
    category: 'I/O',
    color: 'audio',
    parameters: [],
    portsIn: [{ id: 'l', name: 'L' }, { id: 'r', name: 'R' }],
    portsOut: [],
  },
  audio_in: {
    id: 'audio_in',
    displayName: 'AUDIO INPUT',
    className: 'hw.AudioIn()',
    category: 'I/O',
    color: 'audio',
    parameters: [],
    portsIn: [],
    portsOut: [{ id: 'l', name: 'L' }, { id: 'r', name: 'R' }],
  },
  potentiometer: {
    id: 'potentiometer',
    displayName: 'POTENTIOMETER',
    className: 'daisy::AnalogControl',
    category: 'User Control',
    color: 'user',
    parameters: [
      { id: 'pin', name: 'Pin', value: 'ADC_1', type: 'dropdown', options: ['ADC_1', 'ADC_2', 'ADC_3', 'ADC_4'] },
    ],
    portsIn: [],
    portsOut: [{ id: 'out', name: 'OUT' }],
  },
  gate_in: {
    id: 'gate_in',
    displayName: 'GATE INPUT',
    className: 'daisy::GateIn',
    category: 'User Control',
    color: 'user',
    parameters: [
      { id: 'pin', name: 'Pin', value: 'D0', type: 'dropdown', options: ['D0', 'D1', 'D2', 'D3'] },
    ],
    portsIn: [],
    portsOut: [{ id: 'gate', name: 'GATE' }, { id: 'trig', name: 'TRIG' }],
  },
};

const categories = {
  'Sources': ['oscillator'],
  'Filters': ['moog_ladder'],
  'Effects': ['chorus'],
  'Control': ['lfo', 'adsr'],
  'I/O': ['audio_in', 'audio_out'],
  'User Control': ['potentiometer', 'gate_in'],
};

// Dial Component
const Dial = ({ value, label, unit, size = 48, color = colors.audioPrimary }) => {
  const normalizedValue = typeof value === 'number' ? Math.min(1, Math.max(0, value <= 1 ? value : value / 20000)) : 0.5;
  const rotation = -135 + normalizedValue * 270;
  const r = size / 2 - 4;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={colors.bgElevated} strokeWidth={3} strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * r * 0.75} ${2 * Math.PI * r * 0.25}`}
          transform={`rotate(-225 ${size/2} ${size/2})`} />
        {/* Value arc */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * r * 0.75 * normalizedValue} ${2 * Math.PI * r}`}
          transform={`rotate(-225 ${size/2} ${size/2})`} />
        {/* Knob */}
        <circle cx={size/2} cy={size/2} r={r * 0.65} fill={colors.bgSurface} stroke={colors.textMuted} strokeWidth={1} />
        {/* Indicator */}
        <line x1={size/2} y1={size/2} 
          x2={size/2 + (r * 0.45) * Math.sin(rotation * Math.PI / 180)}
          y2={size/2 - (r * 0.45) * Math.cos(rotation * Math.PI / 180)}
          stroke={color} strokeWidth={2} strokeLinecap="round" />
      </svg>
      <span style={{ fontSize: 10, color: colors.textSecondary }}>{label}</span>
      <span style={{ fontSize: 11, color, fontWeight: 600 }}>
        {typeof value === 'number' ? (value < 10 ? value.toFixed(2) : value.toFixed(0)) : value}
        {unit && <span style={{ fontSize: 9, marginLeft: 2 }}>{unit}</span>}
      </span>
    </div>
  );
};

// Canvas Block Component
const CanvasBlock = ({ def, x, y, selected, onClick }) => {
  const blockColor = def.color === 'audio' ? colors.audioBlockBg : 
                     def.color === 'control' ? colors.controlBlockBg : colors.userBlockBg;
  const borderColor = def.color === 'audio' ? colors.audioBlockBorder :
                      def.color === 'control' ? colors.controlBlockBorder : colors.userBlockBorder;
  const headerColor = def.color === 'audio' ? colors.audioPrimary :
                      def.color === 'control' ? colors.controlPrimary : colors.accentGreen;
  
  return (
    <g transform={`translate(${x}, ${y})`} onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Block body */}
      <rect x={0} y={0} width={140} height={80 + def.parameters.slice(0, 2).length * 18} rx={4}
        fill={blockColor} stroke={selected ? colors.paramText : borderColor} strokeWidth={selected ? 2 : 1} />
      {/* Header */}
      <rect x={0} y={0} width={140} height={24} rx={4} fill={headerColor} />
      <rect x={0} y={20} width={140} height={4} fill={headerColor} />
      <text x={8} y={16} fill={colors.bgDeep} fontSize={11} fontWeight={700} fontFamily="monospace">
        {def.displayName}
      </text>
      {/* Class name */}
      <text x={8} y={38} fill={headerColor} fontSize={9} fontFamily="monospace" opacity={0.8}>
        {def.className.length > 20 ? def.className.slice(0, 18) + '...' : def.className}
      </text>
      {/* Parameters (simplified) */}
      {def.parameters.slice(0, 2).map((p, i) => (
        <g key={p.id} transform={`translate(8, ${50 + i * 18})`}>
          <text fill={colors.textSecondary} fontSize={9}>{p.name}:</text>
          <text x={65} fill={headerColor} fontSize={9} fontWeight={600}>
            {typeof p.value === 'number' ? (p.value < 10 ? p.value.toFixed(2) : p.value.toFixed(0)) : p.value}
            {p.unit && <tspan fontSize={8}> {p.unit}</tspan>}
          </text>
        </g>
      ))}
      {/* Input ports */}
      {def.portsIn.map((port, i) => (
        <g key={port.id} transform={`translate(-6, ${30 + i * 16})`}>
          <circle r={5} fill={def.color === 'control' ? colors.controlPrimary : colors.audioPrimary} 
            stroke={colors.bgDeep} strokeWidth={1} />
          <text x={12} y={3} fill={colors.textSecondary} fontSize={8}>{port.name}</text>
        </g>
      ))}
      {/* Output ports */}
      {def.portsOut.map((port, i) => (
        <g key={port.id} transform={`translate(146, ${30 + i * 16})`}>
          <circle r={5} fill={def.color === 'control' ? colors.controlPrimary : colors.audioPrimary}
            stroke={colors.bgDeep} strokeWidth={1} />
          <text x={-12} y={3} fill={colors.textSecondary} fontSize={8} textAnchor="end">{port.name}</text>
        </g>
      ))}
    </g>
  );
};

// Connection line
const ConnectionLine = ({ x1, y1, x2, y2, type }) => {
  const color = type === 'audio' ? colors.audioPrimary : colors.controlPrimary;
  const dashArray = type === 'audio' ? 'none' : '6,3';
  
  // Bezier curve control points
  const midX = (x1 + x2) / 2;
  const path = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
  
  return (
    <path d={path} fill="none" stroke={color} strokeWidth={2} strokeDasharray={dashArray} />
  );
};

// Inspector Panel
const InspectorPanel = ({ block }) => {
  if (!block) {
    return (
      <div style={{ padding: 16, color: colors.textSecondary, textAlign: 'center' }}>
        <p style={{ marginTop: 40 }}>Select a block to inspect</p>
      </div>
    );
  }
  
  const headerColor = block.color === 'audio' ? colors.audioPrimary :
                      block.color === 'control' ? colors.controlPrimary : colors.accentGreen;
  
  return (
    <div style={{ padding: 16 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ color: colors.textSecondary, fontSize: 11, letterSpacing: 1, marginBottom: 8 }}>
          BLUEPRINT ANATOMY
        </h3>
        <div style={{ 
          background: headerColor, 
          color: colors.bgDeep, 
          padding: '8px 12px', 
          borderRadius: 4,
          fontFamily: 'monospace',
          fontSize: 13,
          fontWeight: 600
        }}>
          {block.className}
        </div>
      </div>
      
      {/* Parameters */}
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ color: colors.textSecondary, fontSize: 11, letterSpacing: 1, marginBottom: 12 }}>
          PARAMETERS
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
          {block.parameters.map(param => (
            param.type === 'dial' ? (
              <Dial key={param.id} value={param.value} label={param.name} unit={param.unit} 
                color={headerColor} />
            ) : (
              <div key={param.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 10, color: colors.textSecondary }}>{param.name}</span>
                <select style={{ 
                  background: colors.bgElevated, 
                  color: headerColor,
                  border: `1px solid ${colors.textMuted}`,
                  borderRadius: 4,
                  padding: '4px 8px',
                  fontSize: 11
                }}>
                  {param.options?.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            )
          ))}
        </div>
      </div>
      
      {/* Ports */}
      <div>
        <h4 style={{ color: colors.textSecondary, fontSize: 11, letterSpacing: 1, marginBottom: 12 }}>
          PORTS
        </h4>
        <div style={{ display: 'flex', gap: 20 }}>
          <div>
            <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 6 }}>Inputs</div>
            {block.portsIn.length === 0 ? (
              <div style={{ fontSize: 11, color: colors.textMuted }}>None</div>
            ) : (
              block.portsIn.map(port => (
                <div key={port.id} style={{ 
                  display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 
                }}>
                  <div style={{ 
                    width: 8, height: 8, borderRadius: '50%', 
                    background: headerColor 
                  }} />
                  <span style={{ fontSize: 11, color: colors.textSecondary }}>{port.name}</span>
                </div>
              ))
            )}
          </div>
          <div>
            <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 6 }}>Outputs</div>
            {block.portsOut.length === 0 ? (
              <div style={{ fontSize: 11, color: colors.textMuted }}>None</div>
            ) : (
              block.portsOut.map(port => (
                <div key={port.id} style={{ 
                  display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 
                }}>
                  <div style={{ 
                    width: 8, height: 8, borderRadius: '50%', 
                    border: `2px solid ${headerColor}`,
                    background: 'transparent'
                  }} />
                  <span style={{ fontSize: 11, color: colors.textSecondary }}>{port.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App
export default function DaisyVisualEnv() {
  const [selectedBlock, setSelectedBlock] = useState('oscillator');
  const [expandedCats, setExpandedCats] = useState(new Set(Object.keys(categories)));
  
  const toggleCategory = (cat) => {
    const newSet = new Set(expandedCats);
    if (newSet.has(cat)) newSet.delete(cat);
    else newSet.add(cat);
    setExpandedCats(newSet);
  };
  
  // Sample patch layout
  const canvasBlocks = [
    { def: 'oscillator', x: 40, y: 40 },
    { def: 'moog_ladder', x: 220, y: 60 },
    { def: 'chorus', x: 400, y: 40 },
    { def: 'audio_out', x: 580, y: 60 },
    { def: 'lfo', x: 40, y: 180 },
    { def: 'adsr', x: 220, y: 200 },
  ];
  
  const connections = [
    { x1: 186, y1: 70, x2: 214, y2: 90, type: 'audio' },
    { x1: 366, y1: 90, x2: 394, y2: 70, type: 'audio' },
    { x1: 546, y1: 70, x2: 574, y2: 90, type: 'audio' },
    { x1: 186, y1: 210, x2: 214, y2: 46, type: 'control' },
    { x1: 366, y1: 230, x2: 214, y2: 140, type: 'control' },
  ];
  
  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      background: colors.bgPrimary,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: colors.textPrimary
    }}>
      {/* Left Panel - Module Library */}
      <div style={{ 
        width: 200, 
        background: colors.bgDeep, 
        borderRight: `1px solid ${colors.textMuted}`,
        overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '12px 16px', 
          borderBottom: `1px solid ${colors.textMuted}`,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <div style={{ 
            width: 10, height: 10, borderRadius: '50%', 
            background: colors.audioPrimary,
            boxShadow: `0 0 8px ${colors.audioPrimary}`
          }} />
          <span style={{ fontWeight: 600, fontSize: 13 }}>MODULES</span>
        </div>
        
        {/* Categories */}
        {Object.entries(categories).map(([cat, blocks]) => (
          <div key={cat}>
            <div 
              onClick={() => toggleCategory(cat)}
              style={{ 
                padding: '8px 16px', 
                display: 'flex', 
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                background: expandedCats.has(cat) ? colors.bgElevated : 'transparent'
              }}
            >
              <span style={{ color: colors.textMuted, fontSize: 10 }}>
                {expandedCats.has(cat) ? '▼' : '▶'}
              </span>
              <span style={{ 
                fontSize: 10, 
                letterSpacing: 1, 
                color: colors.textSecondary,
                fontWeight: 600
              }}>
                {cat.toUpperCase()}
              </span>
            </div>
            {expandedCats.has(cat) && blocks.map(blockId => {
              const def = blockDefinitions[blockId];
              const isSelected = selectedBlock === blockId;
              const accentColor = def.color === 'audio' ? colors.audioPrimary :
                                 def.color === 'control' ? colors.controlPrimary : colors.accentGreen;
              return (
                <div 
                  key={blockId}
                  onClick={() => setSelectedBlock(blockId)}
                  style={{ 
                    padding: '6px 16px 6px 32px',
                    cursor: 'pointer',
                    background: isSelected ? colors.bgSurface : 'transparent',
                    borderLeft: isSelected ? `2px solid ${accentColor}` : '2px solid transparent'
                  }}
                >
                  <div style={{ 
                    fontSize: 12, 
                    color: isSelected ? colors.textPrimary : colors.textSecondary,
                    fontWeight: isSelected ? 600 : 400
                  }}>
                    {def.displayName}
                  </div>
                  <div style={{ fontSize: 9, color: accentColor, fontFamily: 'monospace' }}>
                    {def.className.split('::')[1] || def.className}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      
      {/* Center - Canvas */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0,
          height: 40,
          background: colors.bgDeep,
          borderBottom: `1px solid ${colors.textMuted}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 16
        }}>
          {['Clear', 'Export C++', 'Load Example'].map(btn => (
            <button key={btn} style={{
              background: colors.bgSurface,
              color: colors.textSecondary,
              border: `1px solid ${colors.textMuted}`,
              borderRadius: 4,
              padding: '4px 12px',
              fontSize: 11,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              {btn === 'Clear' && '🗑️'}
              {btn === 'Export C++' && '📄'}
              {btn === 'Load Example' && '📂'}
              {btn}
            </button>
          ))}
        </div>
        
        {/* Canvas */}
        <svg style={{ 
          width: '100%', 
          height: '100%', 
          background: `
            radial-gradient(circle at 50% 50%, ${colors.bgElevated} 0%, ${colors.bgPrimary} 100%)
          `
        }}>
          {/* Grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke={colors.textMuted} strokeWidth="0.3" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          <g transform="translate(0, 50)">
            {/* Connections */}
            {connections.map((conn, i) => (
              <ConnectionLine key={i} {...conn} />
            ))}
            
            {/* Blocks */}
            {canvasBlocks.map((block, i) => (
              <CanvasBlock 
                key={i}
                def={blockDefinitions[block.def]}
                x={block.x}
                y={block.y}
                selected={selectedBlock === block.def}
                onClick={() => setSelectedBlock(block.def)}
              />
            ))}
          </g>
        </svg>
      </div>
      
      {/* Right Panel - Inspector */}
      <div style={{ 
        width: 260, 
        background: colors.bgDeep, 
        borderLeft: `1px solid ${colors.textMuted}`,
        overflow: 'auto'
      }}>
        <InspectorPanel block={blockDefinitions[selectedBlock]} />
      </div>
    </div>
  );
}
